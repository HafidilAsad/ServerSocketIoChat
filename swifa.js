const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT_LISTEN = 4001;

const socketIOInstance = require("./socketConfig.js")(http);


const ModbusRTU = require("modbus-serial");
const mysql = require("mysql2/promise");

const client = new ModbusRTU();
const HOST = "10.14.139.56";

const PORT = 502;
const ADDRESS_1 = 6;
const ADDRESS_2 = 8;

const SLAVE_ID = 13;

// Database configuration
const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASSWORD = "";
const DB_DATABASE = "monitoring-gas";
const DB_TABLE = "monitoring_gas30";
const DB_TABLE2 = "permenit_swiftasia";
const DB_TABLE3 = "akhir_hari_swiftasia";
const DB_UPDATE_ID = 4;

async function connectToDatabase() {
  try {
    const pool = await mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("Connected to database");

    return pool;
  } catch (error) {
    console.error(`Error connecting to database: ${error}`);
    process.exit(1);
  }
}

async function insertValueIntoDatabaseAkhir(
  pool,
  nama_mesin,
  gas_used,
  gas_consumption
) {
  try {
    const rounded_gas_used = parseFloat(gas_used.toFixed(1));
    const [rows, fields] = await pool.execute(
      `INSERT INTO ${DB_TABLE3} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`,
      [nama_mesin, rounded_gas_used, gas_consumption]
    );
    console.log(`Inserted values swift asia into database akhir hari successfully`);
  } catch (error) {
    console.error(`Error inserting values into database akhir hari: ${error}`);
  }
}

async function insertValueIntoDatabase(
  pool,
  nama_mesin,
  gas_used,
  gas_consumption
) {
  try {
    const rounded_gas_used = parseFloat(gas_used.toFixed(1)); // round value to one decimal place
    // get current timestamp in ISO format
    const [rows, fields] = await pool.execute(
      `INSERT INTO ${DB_TABLE2} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`,
      [nama_mesin, rounded_gas_used, gas_consumption]
    );

    // console.log(`Inserted values into database successfully`);
  } catch (error) {
    console.error(`Error inserting values into database: ${error}`);
  }
}
//Striko1
async function updateValueInDatabase(pool, value, column) {
  try {
    const roundedValue = parseFloat(value.toFixed(1)); // round value to one decimal place
    const timestamp = new Date().toISOString(); // get current timestamp in ISO format
    const [rows, fields] = await pool.execute(
      `UPDATE ${DB_TABLE} SET ${column} = ?, timestamp = ? WHERE id = ?`,
      [roundedValue, timestamp, DB_UPDATE_ID]
    );

    // console.log(
    //   `Updated value ${value} in database with timestamp ${timestamp}`
    // );
  } catch (error) {
    console.error(`Error updating value in database: ${error}`);
  }
}

client.connectTCP(HOST, { port: PORT }).then(() => {
  // Set the slave ID to 1
  client.setID(SLAVE_ID);

  // Connect to the database
  connectToDatabase().then((pool) => {
    // Read the Modbus values every second
    setInterval(() => {
      client.readHoldingRegisters(ADDRESS_1, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data gas_used: ${err}`);
          process.exit(1);
        } else {
          // Combine the two registers into a single 32-bit value
          const buffer = Buffer.from(data.buffer);
          const swappedBuffer = Buffer.alloc(4);

          buffer.copy(swappedBuffer, 0, 0, 4);
          swappedBuffer.swap16();

          const value = swappedBuffer.readFloatLE();
          const valueFixedTo1 = value.toFixed(1);

socketIOInstance.emit("valueSwifa", valueFixedTo1);
          


          // Update the value in the database
          updateValueInDatabase(pool, value, "gas_used");
        }
      });

      client.readHoldingRegisters(ADDRESS_2, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data gas_consumption: ${err}`);
        } else {
          // Combine the two registers into a single 32-bit value

          const buffer = Buffer.from(data.buffer);
          const swappedBuffer = Buffer.alloc(4);

          buffer.copy(swappedBuffer, 0, 0, 4);

          const temp = swappedBuffer[0];
          swappedBuffer[0] = swappedBuffer[1];
          swappedBuffer[1] = temp;

          const temp2 = swappedBuffer[2];
          swappedBuffer[2] = swappedBuffer[3];
          swappedBuffer[3] = temp2;

          const value = swappedBuffer.readUInt32LE();
          socketIOInstance.emit("valueSwifaUsed", value)

          // Update the value in the database
          updateValueInDatabase(pool, value, "gas_consumption");
        }
      });
    }, 1000);

    //Insert Data Perlima menit

    setInterval(() => {
      client.readHoldingRegisters(ADDRESS_1, 2, function (err, data) {
        if (err) {
          console.error(`Error reading data both: ${err}`);
        } else {
          // Combine the two registers into a single 32-bit value
          const buffer = Buffer.from(data.buffer);
            
          const swappedBuffer = Buffer.alloc(4);

          buffer.copy(swappedBuffer, 0, 0, 4);
          swappedBuffer.swap16();

          const gas_used = swappedBuffer.readFloatLE();
        

          client.readHoldingRegisters(ADDRESS_2, 2, function (err, data) {
            if (err) {
              console.error(`Error reading data both 2: ${err}`);
            } else {
              // Combine the two registers into a single 32-bit value
              const buffer = Buffer.from(data.buffer);
                  const swappedBuffer = Buffer.alloc(4);

          buffer.copy(swappedBuffer, 0, 0, 4);

          const temp = swappedBuffer[0];
          swappedBuffer[0] = swappedBuffer[1];
          swappedBuffer[1] = temp;

          const temp2 = swappedBuffer[2];
          swappedBuffer[2] = swappedBuffer[3];
          swappedBuffer[3] = temp2;

          const gas_consumption = swappedBuffer.readUInt32LE();
            

              // Insert the values into the database if gas_consumption is greater than 0
              if (gas_consumption > 0) {
                insertValueIntoDatabase(
                  pool,
                  "swiftasia",
                  gas_used,
                  gas_consumption
                );
              }
            }
          });
        }
      });
    }, 60000);
  });
});

client
  .connectTCP(HOST, { port: PORT })
  .then(() => {
    // Set the slave ID to 1
    client.setID(SLAVE_ID);

    // Connect to the database
    connectToDatabase().then((pool) => {
      setInterval(() => {
        client.readHoldingRegisters(ADDRESS_1, 2, function (err, data) {
          if (err) {
            console.error(`Error reading data: ${err}`);
          } else {
            const buffer = Buffer.from(data.buffer);
          const swappedBuffer = Buffer.alloc(4);

          buffer.copy(swappedBuffer, 0, 0, 4);
          swappedBuffer.swap16();

          const gas_used = swappedBuffer.readFloatLE();

            client.readHoldingRegisters(ADDRESS_2, 2, function (err, data) {
              if (err) {
                console.error(`Error reading data: ${err}`);
              } else {
                const buffer = Buffer.from(data.buffer);
                    const swappedBuffer = Buffer.alloc(4);

          buffer.copy(swappedBuffer, 0, 0, 4);

          const temp = swappedBuffer[0];
          swappedBuffer[0] = swappedBuffer[1];
          swappedBuffer[1] = temp;

          const temp2 = swappedBuffer[2];
          swappedBuffer[2] = swappedBuffer[3];
          swappedBuffer[3] = temp2;

          const gas_consumption = swappedBuffer.readUInt32LE();
                

                // Insert the values into the database
                const now = new Date();
                const hour = now.getHours();
                const minute = now.getMinutes();
                const second = now.getSeconds();

                let valueInserted = false;

                if (
                  hour === 23 &&
                  minute === 59 &&
                  second === 30 &&
                  !valueInserted
                ) {
                  insertValueIntoDatabaseAkhir(
                    pool,
                    "Swiftasia",
                    gas_used,
                    gas_consumption
                  );
                } else if (hour !== 23 || minute !== 59 || second !== 59) {
                  valueInserted = false;
                }
              }
            });
          }
        });
      }, 1000);
    });
  })

  .catch((error) => {
    console.error(`Error connecting to Modbus TCP server: ${error}`);
    process.exit(1);
  });

  http.listen(PORT_LISTEN, () =>{
    console.log(`Server Port Listening on ${PORT_LISTEN}`);
  })
