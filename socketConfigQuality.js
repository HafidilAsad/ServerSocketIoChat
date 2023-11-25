const socketIO = require("socket.io");
const dbConnection = require("./dbConfig2.js");

const fetchDataFromDB = (socket) => {
  const query =
    "SELECT id, nomor_mesin, status, nama_part FROM db_quality_status_machine";

  dbConnection.query(query, (error, results) => {
    if (error) throw error;
    socket.emit("qualityData", results);
  });
};
const fetchDataJsu = (socket) => {
  const today = new Date().toISOString().split("T")[0];
  const query =
    "SELECT id, nrp, proses, shift, no_mesin, nama_part, judge FROM db_quality_jsu WHERE DATE(createdAt) = ?";
  dbConnection.query(query, [today], (error, results) => {
    if (error) throw error;
    socket.emit("qualityJsu", results);
  });
};

const emitQualityData = (socket) => {
  setInterval(() => {
    fetchDataFromDB(socket);
  }, 3000);
};
const emitQualityJsu = (socket) => {
  setInterval(() => {
    fetchDataJsu(socket);
  }, 5000);
};

module.exports = (http) => {
  const socketIOInstance = socketIO(http, {
    cors: {
      origin: "*",
    },
    // transport:["websocket"],
  });

  socketIOInstance.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // Emit quality data to the newly connected client
    emitQualityData(socket);
    emitQualityJsu(socket);

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
    });
  });

  return socketIOInstance;
};
