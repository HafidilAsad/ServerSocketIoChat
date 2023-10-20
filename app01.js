const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT = 4000;

const dbConnection = require("./dbConfig.js");
const {
  client1,
  client2,
  client3,
  client4,
  client5,
  PortModbus,
  ADDRESS,
  ADDRESS2,
  SLAVE_ID,
  SLAVE_ID_SWIFA,
  ADDRESS4,
  ADDRESS5,
} = require("./modbusConfig.js");

const socketIOInstance = require("./socketConfig.js")(http);

// Database configuration
const DB_TABLE1_1 = "permenit";
const DB_TABLE1_2 = "akhir_hari";
const DB_TABLE2_1 = "permenit_striko2";
const DB_TABLE2_2 = "akhir_hari_striko2";
const DB_TABLE3_1 = "permenit_striko3";
const DB_TABLE3_2 = "akhir_hari_striko3";
const DB_TABLE4_1 = "permenit_swiftasia";
const DB_TABLE4_2 = "akhir_hari_swiftasia";
const DB_TABLE5_1 = "permenit_gravity";
const DB_TABLE5_2 = "akhir_hari_gravity";
const DB_TABLE_UPDATE = "monitoring_gas30";

// Host configuration
const HOST1 = "10.14.139.53"; //striko 1
const HOST2 = "10.14.139.54"; //striko 2
const HOST3 = "10.14.139.55"; //striko 3
const HOST4 = "10.14.139.56"; //swifasia
const HOST5 = "10.14.139.66"; //gravity

function handleModbus(
  client,
  host,
  slaveId,
  address,
  address2,
  idMesin,
  tableName,
  socketEventName,
  namaMesin,
  tablePerminute
) {
  client.connectTCP(host, { port: PortModbus, timeout: 5000 }).then(() => {
    client.setID(slaveId);

    setInterval(() => {
      client.readHoldingRegisters(address, 2, function (err, data) {
        if (err) {
          console.log(`Modbus ${idMesin} Error`, err);
          client.connectTCP(host, { port: PortModbus, timeout: 5000 });
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readFloatBE().toFixed(1);

          client.readHoldingRegisters(address2, 2, function (err, data) {
            if (err) {
              console.log(`Modbus ${idMesin} Error`, err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueUsed = buffer.readUInt32BE();

              socketIOInstance.emit(`${socketEventName}`, value);
              socketIOInstance.emit(`${socketEventName}Used`, valueUsed);
              console.log("====================================");

              console.log(`${idMesin}`, value, `${idMesin}used`, valueUsed);

              const query_update = `UPDATE ${DB_TABLE_UPDATE} SET gas_used = ?, gas_consumption = ? WHERE id = ?`;

              dbConnection.query(
                query_update,
                [value, valueUsed, idMesin],
                (err, results) => {
                  if (err) {
                    console.log("Update Error", err);
                  } else {
                    if (results.affectedRows > 0) {
                    } else {
                      console.log(
                        `No records with ID ${idMesin} found for update.`
                      );
                    }
                  }
                }
              );

              const currentTime = new Date();
              if (
                currentTime.getHours() === 23 &&
                currentTime.getMinutes() === 59 &&
                currentTime.getSeconds() === 30
              ) {
                const nama_mesin = `${namaMesin}`;
                const query = `INSERT INTO ${tableName} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
                dbConnection.query(query, [nama_mesin, value, valueUsed]),
                  (err) => {
                    if (err) {
                      console.log(`Insert Akhir Hari ${idMesin} Error`, err);
                    } else {
                      console.log(`Insert into ${idMesin} Akhir hari success`);
                    }
                  };
              }
            }
          });
        }
      });
    }, 1000);

    setInterval(() => {
      client.readHoldingRegisters(address, 2, function (err, data) {
        if (err) {
          console.log(`Modbus ${idMesin} Error`, err);
          client.connectTCP(host, { port: PortModbus, timeout: 5000 });
        } else {
          const buffer = Buffer.from(data.buffer);
          const value = buffer.readFloatBE().toFixed(1);

          client.readHoldingRegisters(address2, 2, function (err, data) {
            if (err) {
              console.log(`Modbus ${idMesin} Error`, err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueUsed = buffer.readUInt32BE();

              const nama_mesin = `${namaMesin}`;
              const query = `INSERT INTO ${tablePerminute} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
              dbConnection.query(
                query,
                [nama_mesin, value, valueUsed],
                (err) => {
                  if (err) {
                    console.log(`Insert Permenit ${namaMesin}  Error `, err);
                  } else {
                    console.log(`Insert into ${namaMesin} permenit success`);
                  }
                }
              );
            }
          });
        }
      });
    }, 60000);
  });
}

// Usage for client1
handleModbus(
  client1,
  HOST1,
  SLAVE_ID,
  ADDRESS,
  ADDRESS2,
  "1",
  DB_TABLE1_2,
  "valueStriko1",
  "Striko 1",
  DB_TABLE1_1
);

// Usage for client2
handleModbus(
  client2,
  HOST2,
  SLAVE_ID,
  ADDRESS,
  ADDRESS2,
  "2",
  DB_TABLE2_2,
  "valueStriko2",
  "Striko 2",
  DB_TABLE2_1
);

//Usage for client3
handleModbus(
  client3,
  HOST3,
  SLAVE_ID,
  ADDRESS,
  ADDRESS2,
  "3",
  DB_TABLE3_2,
  "valueStriko3",
  "Striko 3",
  DB_TABLE3_1
);

//Usage for client5
handleModbus(
  client5,
  HOST5,
  SLAVE_ID,
  ADDRESS,
  ADDRESS2,
  "5",
  DB_TABLE5_2,
  "valueGravity",
  "Gravity",
  DB_TABLE5_1
);

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
