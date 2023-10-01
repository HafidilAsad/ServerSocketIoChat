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

setInterval(() => {
  client1
    .connectTCP(HOST1, { port: PortModbus })
    .then(() => {
      client1.setID(SLAVE_ID);

      client1.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko1 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko1 = buffer.readFloatBE().toFixed(1);

          client1.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 1 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko1Used = buffer.readUInt32BE();

              socketIOInstance.emit("valueStriko1", valueStriko1);
              socketIOInstance.emit("valueStriko1Used", valueStriko1Used);
              console.log("====================================");

              console.log(
                "striko1",
                valueStriko1,
                "striko1used",
                valueStriko1Used
              );

              const ID_MESIN = "1";
              const query_update = `UPDATE ${DB_TABLE_UPDATE} SET gas_used = ?, gas_consumption = ? WHERE id = ?`;

              dbConnection.query(
                query_update,
                [valueStriko1, valueStriko1Used, ID_MESIN],
                (err, results) => {
                  if (err) {
                    console.log("Update Error", err);
                  } else {
                    if (results.affectedRows > 0) {
                    } else {
                      console.log(
                        `No records with ID ${ID_MESIN} found for update.`
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
                const nama_mesin = "Striko 1";
                const query = `INSERT INTO ${DB_TABLE1_2} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
                dbConnection.query(query, [
                  nama_mesin,
                  valueStriko1,
                  valueStriko1Used,
                ]),
                  (err) => {
                    if (err) {
                      console.log("Insert Akhir Hari Striko 1 Error ", err);
                    } else {
                      console.log("Insert into Striko 1 Akhir hari success");
                    }
                  };
              }
            }

            client1.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 1 error:", err);
      // setTimeout(() => {
      //   client1.connectTCP(HOST1, { port: PortModbus });
      // }, 5000);
    });

  client2
    .connectTCP(HOST2, { port: PortModbus })
    .then(() => {
      client2.setID(SLAVE_ID);

      client2.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko2 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko2 = buffer.readFloatBE().toFixed(1);

          client2.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 2 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko2Used = buffer.readUInt32BE();

              socketIOInstance.emit("valueStriko2", valueStriko2);
              socketIOInstance.emit("valueStriko2Used", valueStriko2Used);
              console.log("====================================");

              console.log(
                "striko2",
                valueStriko2,
                "striko2used",
                valueStriko2Used
              );

              const ID_MESIN = "2";
              const query_update = `UPDATE ${DB_TABLE_UPDATE} SET gas_used = ?, gas_consumption = ? WHERE id = ?`;

              dbConnection.query(
                query_update,
                [valueStriko2, valueStriko2Used, ID_MESIN],
                (err, results) => {
                  if (err) {
                    console.log("Update Error", err);
                  } else {
                    if (results.affectedRows > 0) {
                    } else {
                      console.log(
                        `No records with ID ${ID_MESIN} found for update.`
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
                const nama_mesin = "Striko 2";
                const query = `INSERT INTO ${DB_TABLE2_2} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
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

            client2.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 2 error:", err);
      // setTimeout(() => {
      //   client2.connectTCP(HOST2, { port: PortModbus });
      // }, 5000);
    });

  client3
    .connectTCP(HOST3, { port: PortModbus })
    .then(() => {
      client3.setID(SLAVE_ID);

      client3.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko3 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko3 = buffer.readFloatBE().toFixed(1);

          client3.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 3 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko3Used = buffer.readUInt32BE();

              socketIOInstance.emit("valueStriko3", valueStriko3);
              socketIOInstance.emit("valueStriko3Used", valueStriko3Used);

              console.log("====================================");

              console.log(
                "striko3",
                valueStriko3,
                "striko3used",
                valueStriko3Used
              );

              const ID_MESIN = "3";
              const query_update = `UPDATE ${DB_TABLE_UPDATE} SET gas_used = ?, gas_consumption = ? WHERE id = ?`;

              dbConnection.query(
                query_update,
                [valueStriko3, valueStriko3Used, ID_MESIN],
                (err, results) => {
                  if (err) {
                    console.log("Update Error", err);
                  } else {
                    if (results.affectedRows > 0) {
                    } else {
                      console.log(
                        `No records with ID ${ID_MESIN} found for update.`
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
                const nama_mesin = "Striko 3";
                const query = `INSERT INTO ${DB_TABLE3_2} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
                dbConnection.query(query, [
                  nama_mesin,
                  valueStriko3,
                  valueStriko3Used,
                ]),
                  (err) => {
                    if (err) {
                      console.log("Insert Akhir Hari Striko 3 Error ", err);
                    } else {
                      console.log("Insert into Striko 3 Akhir hari success");
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
      // client3.connectTCP(HOST3, { port: PortModbus });
    });

  client5
    .connectTCP(HOST5, { port: PortModbus })
    .then(() => {
      client5.setID(SLAVE_ID);

      client5.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Gravity Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueGravity = buffer.readFloatBE().toFixed(1);

          socketIOInstance.emit("valueGravity", valueGravity);

          client5.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Gravity Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueGravityUsed = buffer.readUInt32BE();

              socketIOInstance.emit("valueGravityUsed", valueGravityUsed);

              console.log("====================================");
              console.log("====================================");
              console.log("====================================");

              console.log(
                "gravity",
                valueGravity,
                "Gravityused",
                valueGravityUsed
              );
              const ID_MESIN = "5";
              const query_update = `UPDATE ${DB_TABLE_UPDATE} SET gas_used = ?, gas_consumption = ? WHERE id = ?`;

              dbConnection.query(
                query_update,
                [valueGravity, valueGravityUsed, ID_MESIN],
                (err, results) => {
                  if (err) {
                    console.log("Update Error", err);
                  } else {
                    if (results.affectedRows > 0) {
                    } else {
                      console.log(
                        `No records with ID ${ID_MESIN} found for update.`
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
                const nama_mesin = "Gravity";
                const query = `INSERT INTO ${DB_TABLE5_2} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
                dbConnection.query(query, [
                  nama_mesin,
                  valueGravity,
                  valueGravityUsed,
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

            client5.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Gravity error:", err);

      // client5.connectTCP(HOST5, { port: PortModbus });
    });
}, 1000);

setInterval(() => {
  client1
    .connectTCP(HOST1, { port: PortModbus })
    .then(() => {
      client1.setID(SLAVE_ID);

      client1.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko1 permenit Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko1 = buffer.readFloatBE().toFixed(1);
          console.log("nilai striko 1 permenit ", valueStriko1);

          client1.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 1 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko1Used = buffer.readUInt32BE();
              console.log("nilai striko 1 Used Permenit ", valueStriko1Used);

              const nama_mesin = "striko1";
              const query = `INSERT INTO ${DB_TABLE1_1} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
              dbConnection.query(
                query,
                [nama_mesin, valueStriko1, valueStriko1Used],
                (err) => {
                  if (err) {
                    console.log("Insert Permenit Striko 1  Error ", err);
                  } else {
                    console.log("Insert into Striko 1 permenit success");
                  }
                }
              );
            }

            client1.close();
          });
        }
      });
    })
    .catch((err) => {
      console.error("Modbus connection Striko 1 error:", err);
      // client1.connectTCP(HOST1, { port: PortModbus });
    });

  client2
    .connectTCP(HOST2, { port: PortModbus })
    .then(() => {
      client2.setID(SLAVE_ID);

      client2.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko2 permenit Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko2 = buffer.readFloatBE().toFixed(1);
          console.log("nilai striko 2 permenit ", valueStriko2);

          client2.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 2 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko2Used = buffer.readUInt32BE();
              console.log("nilai striko 2 Used Permenit ", valueStriko2Used);

              const nama_mesin = "striko2";
              const query = `INSERT INTO ${DB_TABLE2_1} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
              dbConnection.query(
                query,
                [nama_mesin, valueStriko2, valueStriko2Used],
                (err) => {
                  if (err) {
                    console.log("Insert Permenit Striko 2  Error ", err);
                  } else {
                    console.log("Insert into Striko 2 permenit success");
                  }
                }
              );
            }

            client2.close();
          });
        }
      });
    })
    .catch((err) => {
      console.error("Modbus connection Striko 2 error:", err);
      // client2.connectTCP(HOST2, { port: PortModbus });
    });

  client3
    .connectTCP(HOST3, { port: PortModbus })
    .then(() => {
      client3.setID(SLAVE_ID);

      client3.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko3 permenit Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko3 = buffer.readFloatBE().toFixed(1);
          console.log("nilai striko 3 permenit ", valueStriko3);

          client3.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 3 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko3Used = buffer.readUInt32BE();
              console.log("nilai striko 3 Used Permenit ", valueStriko3Used);

              const nama_mesin = "striko3";
              const query = `INSERT INTO ${DB_TABLE3_1} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
              dbConnection.query(
                query,
                [nama_mesin, valueStriko3, valueStriko3Used],
                (err) => {
                  if (err) {
                    console.log("Insert Permenit Striko 3  Error ", err);
                  } else {
                    console.log("Insert into Striko 3 permenit success");
                  }
                }
              );
            }

            client3.close();
          });
        }
      });
    })
    .catch((err) => {
      console.error("Modbus connection Striko  error:", err);
      // client3.connectTCP(HOST3, { port: PortModbus });
    });

  client5
    .connectTCP(HOST5, { port: PortModbus })
    .then(() => {
      client5.setID(SLAVE_ID);

      client5.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Gravity Permenit Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueGravity = buffer.readFloatBE().toFixed(1);
          console.log("nilai gravity permenit", valueGravity);

          client5.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Gravity Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueGravityUsed = buffer.readUInt32BE();

              console.log("nilai gravityused permenit", valueGravityUsed);

              const nama_mesin = "Gravity";
              const query = `INSERT INTO ${DB_TABLE5_1} (nama_mesin, gas_used, gas_consumption) VALUES (?, ?, ?)`;
              dbConnection.query(
                query,
                [nama_mesin, valueGravity, valueGravityUsed],
                (err) => {
                  if (err) {
                    console.log("Insert Permenit Gravity Error ", err);
                  } else {
                    console.log("Insert into gravity permenit success");
                  }
                }
              );
            }

            client5.close();
          });
        }
      });
    })
    .catch((err) => {
      console.error("Modbus connection  Permenit Gravity error:", err);
      // client5.connectTCP(HOST5, { port: PortModbus });
    });
}, 60000 * 60);

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
