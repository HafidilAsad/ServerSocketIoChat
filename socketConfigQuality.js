const socketIO = require("socket.io");
const dbConnection = require("./dbConfig2.js");

const fetchDataFromDB = (socket) => {
  const query = "SELECT id, nomor_mesin, status FROM db_quality_status_machine";

  dbConnection.query(query, (error, results) => {
    if (error) throw error;
    socket.emit("qualityData", results);
  });
};

const emitQualityData = (socket) => {
  setInterval(() => {
    fetchDataFromDB(socket);
  }, 3000);
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

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
    });
  });

  return socketIOInstance;
};
