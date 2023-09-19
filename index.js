const express = require("express");
const app = express();
const PORT = 4000;

// Database configuration
const mysql = require("mysql");
const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASSWORD = "";
const DB_DATABASE = "monitoring-gas";
const DB_TABLE2 = "permenit_gravity";
const DB_TABLE3 = "akhir_hari_gravity";
const DB_TABLE4 = "permenit_striko2";
const DB_TABLE5 = "akhir_hari_striko2";

//configurasi modbus
const ModbusRTU = require("modbus-serial");

const PortModbus = 502;
const ADDRESS = 20128;
const ADDRESS2 = 20130;
const SLAVE_ID = 1;
// const client = new ModbusRTU();
const client2 = new ModbusRTU();
const client3 = new ModbusRTU();
// const HOST = "10.14.139.121"; //striko 1
const HOST2 = "10.14.139.54"; //striko 2
const HOST3 = "10.14.139.66"; //gravity

//configurasi http
const http = require("http").Server(app);

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

//create mysql connection
const dbConnection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

dbConnection.connect((err) => {
  if (err) {
    console.log(`Error connecting to the database ${err}`);
  } else {
    console.log("Connected to Mysql");
  }
});

let users = [];

setInterval(() => {
  // client
  //   .connectTCP(HOST, { port: PortModbus })
  //   .then(() => {
  //     client.setID(SLAVE_ID);

  //     // Read the first set of Modbus values
  //     client.readHoldingRegisters(ADDRESS, 2, function (err, data) {
  //       if (err) {
  //         console.log("Modbus Error", err);
  //       } else {
  //         const buffer = Buffer.from(data.buffer);
  //         const valueStriko1 = buffer.readFloatBE();
  //         socketIO.emit("valueStriko1", valueStriko1);
  //         console.log(`nilai striko1 ${valueStriko1}`);

  //         // Read the second set of Modbus values
  //         client.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
  //           if (err) {
  //             console.log("Modbus Striko 1 Error", err);
  //           } else {
  //             const buffer = Buffer.from(data.buffer);
  //             const valueStriko1Used = buffer.readUInt32BE();

  //             socketIO.emit("valueStriko1Used", valueStriko1Used);
  //             console.log(`nilai striko1 Used ${valueStriko1Used}`);
  //           }

  //           // Close the Modbus connection after reading the second set of values
  //           client.close();
  //         });
  //       }
  //     });
  //   })

  //   .catch((err) => {
  //     console.error("Modbus connection Striko 1 error:", err);
  //     client.connectTCP(HOST, { port: PortModbus });
  //   });

  // client2
  //   .connectTCP(HOST2, { port: PortModbus })
  //   .then(() => {
  //     client2.setID(SLAVE_ID);

  //     // Read the first set of Modbus values
  //     client2.readHoldingRegisters(ADDRESS, 2, function (err, data) {
  //       if (err) {
  //         console.log("Modbus Striko2 Error", err);
  //       } else {
  //         const buffer = Buffer.from(data.buffer);
  //         const valueStriko2 = buffer.readFloatBE();
  //         socketIO.emit("valueStriko2", valueStriko2);
  //         console.log(`nilai striko2 ${valueStriko2}`);

  //         // Read the second set of Modbus values
  //         client2.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
  //           if (err) {
  //             console.log("Modbus Striko 2 Error", err);
  //           } else {
  //             const buffer = Buffer.from(data.buffer);
  //             const valueStriko2Used = buffer.readUInt32BE();

  //             socketIO.emit("valueStriko2Used", valueStriko2Used);
  //             console.log(`nilai striko2 Used ${valueStriko2Used}`);
  //           }

  //           // Close the Modbus connection after reading the second set of values
  //           client2.close();
  //         });
  //       }
  //     });
  //   })

  //   .catch((err) => {
  //     console.error("Modbus connection Striko 2 error:", err);
  //     client2.connectTCP(HOST2, { port: PortModbus });
  //   });

  client2
    .connectTCP(HOST2, { port: PortModbus })
    .then(() => {
      client2.setID(SLAVE_ID);

      // Read the first set of Modbus values
      client2.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko2 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko2 = buffer.readFloatBE().toFixed(1);
          socketIO.emit("valueStriko2", valueStriko2);
          console.log(`nilai striko2 ${valueStriko2}`);

          // Read the second set of Modbus values
          client2.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 2 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko2Used = buffer.readUInt32BE();

              socketIO.emit("valueStriko2Used", valueStriko2Used);
              console.log(`nilai striko2 Used ${valueStriko2Used}`);

              // function insert every time based
              const currentTime = new Date();
              if (
                currentTime.getHours() === 15 &&
                currentTime.getMinutes() === 11 &&
                currentTime.getSeconds() === 1
              ) {
                const nama_mesin = "Striko 2";
                const query = `INSERT INTO ${DB_TABLE5} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
                dbConnection.query(query, [
                  nama_mesin,
                  valueStriko2,
                  valueStriko2Used,
                ]),
                  (err) => {
                    if (err) {
                      console.log("Insert Akhir Hari Striko 2 Error ", err);
                    } else {
                      console.log("Insert into Striko 2 Akhir hari success");
                    }
                  };
              }
            }

            client3.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 3 error:", err);
      client3.connectTCP(HOST2, { port: PortModbus });
    });

  client3
    .connectTCP(HOST3, { port: PortModbus })
    .then(() => {
      client3.setID(SLAVE_ID);

      // Read the first set of Modbus values
      client3.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko3 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko3 = buffer.readFloatBE().toFixed(1);
          socketIO.emit("valueStriko3", valueStriko3);
          console.log(`nilai striko3 ${valueStriko3}`);

          // Read the second set of Modbus values
          client3.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 3 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko3Used = buffer.readUInt32BE();

              socketIO.emit("valueStriko3Used", valueStriko3Used);
              console.log(`nilai striko3 Used ${valueStriko3Used}`);

              // function insert every time based
              const currentTime = new Date();
              if (
                currentTime.getHours() === 13 &&
                currentTime.getMinutes() === 42 &&
                currentTime.getSeconds() === 1
              ) {
                const nama_mesin = "Gravity";
                const query = `INSERT INTO ${DB_TABLE3} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
                dbConnection.query(query, [
                  nama_mesin,
                  valueStriko3,
                  valueStriko3Used,
                ]),
                  (err) => {
                    if (err) {
                      console.log("Insert Akhir Hari Gravity Error ", err);
                    } else {
                      console.log("Insert into gravity Akhir hari success");
                    }
                  };
              }
            }

            client3.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 3 error:", err);
      client3.connectTCP(HOST3, { port: PortModbus });
    });
}, 1000);

setInterval(() => {
  // client
  //   .connectTCP(HOST, { port: PortModbus })
  //   .then(() => {
  //     client.setID(SLAVE_ID);

  //     // Read the first set of Modbus values
  //     client.readHoldingRegisters(ADDRESS, 2, function (err, data) {
  //       if (err) {
  //         console.log("Modbus Error", err);
  //       } else {
  //         const buffer = Buffer.from(data.buffer);
  //         const valueStriko1 = buffer.readFloatBE();
  //         socketIO.emit("valueStriko1", valueStriko1);
  //         console.log(`nilai striko1 ${valueStriko1}`);

  //         // Read the second set of Modbus values
  //         client.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
  //           if (err) {
  //             console.log("Modbus Striko 1 Error", err);
  //           } else {
  //             const buffer = Buffer.from(data.buffer);
  //             const valueStriko1Used = buffer.readUInt32BE();

  //             socketIO.emit("valueStriko1Used", valueStriko1Used);
  //             console.log(`nilai striko1 Used ${valueStriko1Used}`);
  //           }

  //           // Close the Modbus connection after reading the second set of values
  //           client.close();
  //         });
  //       }
  //     });
  //   })

  //   .catch((err) => {
  //     console.error("Modbus connection Striko 1 error:", err);
  //     client.connectTCP(HOST, { port: PortModbus });
  //   });

  // client2
  //   .connectTCP(HOST2, { port: PortModbus })
  //   .then(() => {
  //     client2.setID(SLAVE_ID);

  //     // Read the first set of Modbus values
  //     client2.readHoldingRegisters(ADDRESS, 2, function (err, data) {
  //       if (err) {
  //         console.log("Modbus Striko2 Error", err);
  //       } else {
  //         const buffer = Buffer.from(data.buffer);
  //         const valueStriko2 = buffer.readFloatBE();
  //         socketIO.emit("valueStriko2", valueStriko2);
  //         console.log(`nilai striko2 ${valueStriko2}`);

  //         // Read the second set of Modbus values
  //         client2.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
  //           if (err) {
  //             console.log("Modbus Striko 2 Error", err);
  //           } else {
  //             const buffer = Buffer.from(data.buffer);
  //             const valueStriko2Used = buffer.readUInt32BE();

  //             socketIO.emit("valueStriko2Used", valueStriko2Used);
  //             console.log(`nilai striko2 Used ${valueStriko2Used}`);
  //           }

  //           // Close the Modbus connection after reading the second set of values
  //           client2.close();
  //         });
  //       }
  //     });
  //   })

  //   .catch((err) => {
  //     console.error("Modbus connection Striko 2 error:", err);
  //     client2.connectTCP(HOST2, { port: PortModbus });
  //   });

  client2
    .connectTCP(HOST2, { port: PortModbus })
    .then(() => {
      client2.setID(SLAVE_ID);

      // Read the first set of Modbus values
      client2.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko2 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko2 = buffer.readFloatBE().toFixed(1);

          // Read the second set of Modbus values
          client2.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 2 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko2Used = buffer.readUInt32BE();

              const nama_mesin = "striko2";
              const query = `INSERT INTO ${DB_TABLE4} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
              dbConnection.query(query, [
                nama_mesin,
                valueStriko2,
                valueStriko2Used,
              ]),
                (err) => {
                  if (err) {
                    console.log("Insert Permenit Striko 2  Error ", err);
                  } else {
                    console.log("Insert into Striko 2 permenit success");
                  }
                };
            }

            client3.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 2 error:", err);
      client3.connectTCP(HOST2, { port: PortModbus });
    });

  client3
    .connectTCP(HOST3, { port: PortModbus })
    .then(() => {
      client3.setID(SLAVE_ID);

      // Read the first set of Modbus values
      client3.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko3 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko3 = buffer.readFloatBE().toFixed(1);

          // Read the second set of Modbus values
          client3.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 3 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko3Used = buffer.readUInt32BE();

              const nama_mesin = "Gravity";
              const query = `INSERT INTO ${DB_TABLE2} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
              dbConnection.query(query, [
                nama_mesin,
                valueStriko3,
                valueStriko3Used,
              ]),
                (err) => {
                  if (err) {
                    console.log("Insert Permenit Gravity Error ", err);
                  } else {
                    console.log("Insert into gravity permenit success");
                  }
                };
            }

            client3.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 3 error:", err);
      client3.connectTCP(HOST3, { port: PortModbus });
    });
}, 60000);

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("message", (data) => {
    socketIO.emit("messageResponse", data);
  });

  //Listens when a new user joins the server
  socket.on("newUser", (data) => {
    //Adds the new user to the list of users
    users.push(data);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit("newUserResponse", users);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
