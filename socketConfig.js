const socketIO = require("socket.io");

const dbConnection = require("./dbConfig2.js");

const emitQualityData = (socketIOInstance) => {
  const fetchDataFromDB = () => {
    const query =
      "SELECT id, nomor_mesin, status FROM db_quality_status_machine";

    dbConnection.query(query, (error, results) => {
      if (error) throw error;

      socketIOInstance.emit("qualityData", results);
    });
  };

  setInterval(fetchDataFromDB, 5000);
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

    socket.on("message", (data) => {
      socketIOInstance.emit("messageResponse", data);
    });

    socket.on("touchup", (data) => {
      socketIOInstance.emit("touchupResponse", data);
    });

    socket.on("touchupMachining", (data) => {
      socketIOInstance.emit("touchupMachiningResponse", data);
    });

    socket.on("touchupCasting", (data) => {
      socketIOInstance.emit("touchupCastingResponse", data);
    });

    socket.on("touchupGas", (data) => {
      socketIOInstance.emit("touchupGasResponse", data);
    });

    socket.on("ticketMaintenance", (data) => {
      socketIOInstance.emit("ticketMaintenanceResponse", data);
    });

    socket.on("newUser", (data) => {
      socketIOInstance.emit("newUserResponse", data);
    });

    //untuk quality
    emitQualityData(socketIOInstance);

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
      socket.disconnect();
    });
  });

  return socketIOInstance;
};
