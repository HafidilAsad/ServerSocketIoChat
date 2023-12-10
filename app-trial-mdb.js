const express = require("express");
const app = express();
const http = require("http").Server(app);
const cron = require("node-cron");
const PORT = 4003;

const dbConnection = require("./dbConfig2.js");
const {
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
const DB_TABLE_MDB = "db_mdb_monitoring";

const HOST8 = "172.172.8.20"; //MDB I
const HOST9 = "172.172.8.21"; //MDB II
const HOST10 = "172.172.8.22"; //MDB III
const HOST11 = "172.172.8.23"; //MDB IV
const HOST12 = "172.172.8.24"; //MDB V

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

            socketIOInstance.emit(`${socketEventName}_vr`, value_vr);
            socketIOInstance.emit(`${socketEventName}_vs`, value_vs);
            console.log("====================================");

            console.log(`${idMesin}_vr`, value_vr, `${idMesin}_vs`, value_vs);

            const nama_mesin = `${namaMesin}`;
            const query = `INSERT INTO ${DB_TABLE_MDB} (panel, kwh, v_r) VALUES (?, ?, ?)`;
            dbConnection.query(query, [nama_mesin, value_vr, value_vs]),
              (err) => {
                if (err) {
                  console.log(`Insert Akhir Hari ${idMesin} Error`, err);
                } else {
                  console.log(`Insert into ${idMesin} Akhir hari success`);
                }
              };
          }
        });
      }
    });
  });
}

function executeModbusTask() {
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
}

//Schedule Execute Modbus at 23.59
schedule.scheduleJob("23 59 * * *", () => {
  console.log("Runnig Cronjob Mdb");
  executeModbusTask();
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
