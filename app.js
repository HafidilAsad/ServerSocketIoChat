const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT = 4000;

const dbConnection = require("./dbConfig2.js");
const {
  client1,
  client2,
  client3,
  client4,
  client5,
  client6,
  client7,
  client8,
  client9,
  client10,
  client11,
  client12,
  PortModbus,
  PortModbusMdb,
  ADDRESS,
  ADDRESS2,
  SLAVE_ID,
  SLAVE_ID_SWIFA,
  SLAVE_ID_MDB,
  ADDRESS4,
  ADDRESS5,
  ADDRESS_VR,
  ADDRESS_VS,
  ADDRESS_VT,
  ADDRESS_IS,
  ADDRESS_IR,
  ADDRESS_IT,
  ADDRESS_AP,
  ADDRESS_ED,
  ADDRESS_ED1,
  ADDRESS_PF,
  ADDRESS5_PAINTING2,
  ADDRESS_PAINTING,
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
const DB_TABLE6_1 = "permenit_painting";
const DB_TABLE6_2 = "akhir_hari_painting";
const DB_TABLE7_1 = "permenit_t6";
const DB_TABLE7_2 = "akhir_hari_t6";
const DB_TABLE_UPDATE = "monitoring_gas30";

// Host configuration
const HOST1 = "172.172.8.10"; //striko 1
const HOST2 = "172.172.8.11"; //striko 2
const HOST3 = "172.172.8.12"; //striko 3
const HOST4 = "172.172.8.13"; //swifasia
const HOST5 = "172.172.8.17"; //gravity
const HOST6 = "172.172.8.18"; //painting
const HOST7 = "172.172.8.19"; //t6

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
              // console.log("====================================");

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
    }, 60000 * 60);
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

//Usage for client6
handleModbus(
  client6,
  HOST6,
  SLAVE_ID,
  ADDRESS_PAINTING,
  ADDRESS5_PAINTING2,
  "6",
  DB_TABLE6_2,
  "valuePainting",
  "Painting",
  DB_TABLE6_1
);

//Usage for client7
handleModbus(
  client7,
  HOST7,
  SLAVE_ID,
  ADDRESS_PAINTING,
  ADDRESS5_PAINTING2,
  "7",
  DB_TABLE7_2,
  "valueT6",
  "T6",
  DB_TABLE7_1
);

function handleModbusSwifa(
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
          const swappedBuffer = Buffer.alloc(4);

          buffer.copy(swappedBuffer, 0, 0, 4);
          swappedBuffer.swap16();

          const value2 = swappedBuffer.readFloatLE();
          const value = value2.toFixed(1);

          client.readHoldingRegisters(address2, 2, function (err, data) {
            if (err) {
              console.log(`Modbus ${idMesin} Error`, err);
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

              const valueUsed = swappedBuffer.readUInt32LE();

              socketIOInstance.emit(`${socketEventName}`, value);
              socketIOInstance.emit(`${socketEventName}Used`, valueUsed);
              // console.log("====================================");

              // console.log(`${idMesin}`, value, `${idMesin}used`, valueUsed);

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
    }, 60000 * 60);
  });
}

//Usage for client4
handleModbusSwifa(
  client4,
  HOST4,
  SLAVE_ID_SWIFA,
  ADDRESS4,
  ADDRESS5,
  "4",
  DB_TABLE4_2,
  "valueSwifa",
  "Swift Asia",
  DB_TABLE4_1
);

function handleModbusMdb(
  client,
  host,
  slaveId,
  address,
  address2,
  address3,
  address4,
  address5,
  address6,
  address7,
  address8,
  address8_2,
  address9,
  idMesin,
  socketEventName,
  namaMesin
) {
  client.connectTCP(host, { port: PortModbusMdb, timeout: 5000 }).then(() => {
    client.setID(slaveId);

    setInterval(() => {
      client.readHoldingRegisters(address, 2, function (err, data) {
        if (err) {
          console.log(`Modbus ${idMesin} Error`, err);
          client.connectTCP(host, { port: PortModbusMdb, timeout: 5000 });
        } else {
          const buffer = Buffer.from(data.buffer);
          const value_vr = (buffer.readUInt16BE(0) / 10).toFixed(0);

          client.readHoldingRegisters(address2, 2, function (err, data) {
            if (err) {
              console.log(`Modbus ${idMesin} Error`, err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const value_vs = (buffer.readUInt16BE(0) / 10).toFixed(0);
              client.readHoldingRegisters(address3, 2, function (err, data) {
                if (err) {
                  console.log(`Modbus ${idMesin} Error`, err);
                } else {
                  const buffer = Buffer.from(data.buffer);
                  const value_vt = (buffer.readUInt16BE(0) / 10).toFixed(0);

                  socketIOInstance.emit(`${socketEventName}_vr`, value_vr);
                  socketIOInstance.emit(`${socketEventName}_vs`, value_vs);
                  socketIOInstance.emit(`${socketEventName}_vt`, value_vt);
                  // console.log("====================================");

                  // console.log(`${idMesin}_vr`, value_vr, `${idMesin}_vs`, value_vs, `${idMesin}_vt`, value_vt);

                  client.readHoldingRegisters(
                    address4,
                    2,
                    function (err, data) {
                      if (err) {
                        console.log(`Modbus ${idMesin} Error`, err);
                        client.connectTCP(host, {
                          port: PortModbusMdb,
                          timeout: 5000,
                        });
                      } else {
                        const buffer = Buffer.from(data.buffer);
                        const value_ir = buffer.readUInt16BE(0).toFixed(0);

                        client.readHoldingRegisters(
                          address5,
                          2,
                          function (err, data) {
                            if (err) {
                              console.log(`Modbus ${idMesin} Error`, err);
                            } else {
                              const buffer = Buffer.from(data.buffer);
                              const value_is = buffer
                                .readUInt16BE(0)
                                .toFixed(0);
                              client.readHoldingRegisters(
                                address6,
                                2,
                                function (err, data) {
                                  if (err) {
                                    console.log(`Modbus ${idMesin} Error`, err);
                                  } else {
                                    const buffer = Buffer.from(data.buffer);
                                    const value_it = buffer
                                      .readUInt16BE(0)
                                      .toFixed(0);

                                    socketIOInstance.emit(
                                      `${socketEventName}_ir`,
                                      value_ir
                                    );
                                    socketIOInstance.emit(
                                      `${socketEventName}_is`,
                                      value_is
                                    );
                                    socketIOInstance.emit(
                                      `${socketEventName}_it`,
                                      value_it
                                    );

                                    // console.log(`${idMesin}_ir`, value_ir, `${idMesin}_is`, value_is, `${idMesin}_it`, value_it);
                                    client.readHoldingRegisters(
                                      address7,
                                      2,
                                      function (err, data) {
                                        if (err) {
                                          console.log(
                                            `Modbus ${idMesin} Error`,
                                            err
                                          );
                                          client.connectTCP(host, {
                                            port: PortModbusMdb,
                                            timeout: 5000,
                                          });
                                        } else {
                                          const buffer = Buffer.from(
                                            data.buffer
                                          );
                                          const value_ap = buffer
                                            .readUInt16BE(0)
                                            .toFixed();

                                          client.readHoldingRegisters(
                                            address8,
                                            2,
                                            function (err, data) {
                                              if (err) {
                                                console.log(
                                                  `Modbus ${idMesin} Error`,
                                                  err
                                                );
                                              } else {
                                                const buffer = Buffer.from(
                                                  data.buffer
                                                );
                                                const value_ed_0 = buffer
                                                  .readUInt16BE(0)
                                                  .toFixed();
                                                client.readHoldingRegisters(
                                                  address8_2,
                                                  2,
                                                  function (err, data) {
                                                    if (err) {
                                                      console.log(
                                                        `Modbus ${idMesin} Error`,
                                                        err
                                                      );
                                                    } else {
                                                      const buffer =
                                                        Buffer.from(
                                                          data.buffer
                                                        );
                                                      const value_ed_1 = buffer
                                                        .readUInt16BE(0)
                                                        .toFixed(0);

                                                      client.readHoldingRegisters(
                                                        address9,
                                                        2,
                                                        function (err, data) {
                                                          if (err) {
                                                            console.log(
                                                              `Modbus ${idMesin} Error`,
                                                              err
                                                            );
                                                          } else {
                                                            const buffer =
                                                              Buffer.from(
                                                                data.buffer
                                                              );
                                                            const value_pf = (
                                                              buffer.readUInt16BE(
                                                                0
                                                              ) / 1000
                                                            ).toFixed(1);

                                                            const value_ed =
                                                              value_ed_0 +
                                                              value_ed_1;

                                                            socketIOInstance.emit(
                                                              `${socketEventName}_ap`,
                                                              value_ap
                                                            );
                                                            socketIOInstance.emit(
                                                              `${socketEventName}_ed`,
                                                              value_ed
                                                            );
                                                            socketIOInstance.emit(
                                                              `${socketEventName}_pf`,
                                                              value_pf
                                                            );

                                                            // console.log(`${idMesin}_ap`, value_ap, `${idMesin}_ed`, value_ed, `${idMesin}_pf`, value_pf);
                                                          }
                                                        }
                                                      );
                                                    }
                                                  }
                                                );
                                              }
                                            }
                                          );
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              });
            }
          });
        }
      });
    }, 2700);
  });
}

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
