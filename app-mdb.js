const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT = 4001;

const dbConnection = require("./dbConfig.js");
const {
  client1,
  client2,
  client3,
  client4,
  client5,
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

const HOST8 = "10.14.139.67"; //MDB I
const HOST9 = "10.14.139.68"; //MDB II
const HOST10 = "10.14.139.69"; //MDB III
const HOST11 = "10.14.139.70"; //MDB IV
const HOST12 = "10.14.139.71"; //MDB V

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
  client.connectTCP(host, { port: PortModbusMdb, timeout: 15000 }).then(() => {
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
                   console.log("====================================");

                  console.log(`${idMesin}_vr`, value_vr, `${idMesin}_vs`, value_vs, `${idMesin}_vt`, value_vt);

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

                                    console.log(`${idMesin}_ir`, value_ir, `${idMesin}_is`, value_is, `${idMesin}_it`, value_it);
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
                                                            ).toFixed(2);

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

                                                             console.log(`${idMesin}_ap`, value_ap, `${idMesin}_ed`, value_ed, `${idMesin}_pf`, value_pf);
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
    }, 1500);
  });
}

//usage for mdbc

handleModbusMdb(
  client8,
  HOST8,
  SLAVE_ID_MDB,
  ADDRESS_VR,
  ADDRESS_VS,
  ADDRESS_VT,
  ADDRESS_IR,
  ADDRESS_IS,
  ADDRESS_IT,
  ADDRESS_AP,
  ADDRESS_ED,
  ADDRESS_ED1,
  ADDRESS_PF,
  "MDB_1",
  "valueMdb_1",
  "MDB_1"
);
handleModbusMdb(
  client9,
  HOST9,
  SLAVE_ID_MDB,
  ADDRESS_VR,
  ADDRESS_VS,
  ADDRESS_VT,
  ADDRESS_IR,
  ADDRESS_IS,
  ADDRESS_IT,
  ADDRESS_AP,
  ADDRESS_ED,
  ADDRESS_ED1,
  ADDRESS_PF,
  "MDB_2",
  "valueMdb_2",
  "MDB_2"
);

handleModbusMdb(
  client10,
  HOST10,
  SLAVE_ID_MDB,
  ADDRESS_VR,
  ADDRESS_VS,
  ADDRESS_VT,
  ADDRESS_IR,
  ADDRESS_IS,
  ADDRESS_IT,
  ADDRESS_AP,
  ADDRESS_ED,
  ADDRESS_ED1,
  ADDRESS_PF,
  "MDB_3",
  "valueMdb_3",
  "MDB_3"
);
handleModbusMdb(
  client11,
  HOST11,
  SLAVE_ID_MDB,
  ADDRESS_VR,
  ADDRESS_VS,
  ADDRESS_VT,
  ADDRESS_IR,
  ADDRESS_IS,
  ADDRESS_IT,
  ADDRESS_AP,
  ADDRESS_ED,
  ADDRESS_ED1,
  ADDRESS_PF,
  "MDB_4",
  "valueMdb_4",
  "MDB_4"
);
handleModbusMdb(
  client12,
  HOST12,
  SLAVE_ID_MDB,
  ADDRESS_VR,
  ADDRESS_VS,
  ADDRESS_VT,
  ADDRESS_IR,
  ADDRESS_IS,
  ADDRESS_IT,
  ADDRESS_AP,
  ADDRESS_ED,
  ADDRESS_ED1,
  ADDRESS_PF,
  "MDB_5",
  "valueMdb_5",
  "MDB_5"
);

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
