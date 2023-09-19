const socketIO = require("socket.io");

module.exports = (http) => {
  const socketIOInstance = socketIO(http, {
    cors: {
      origin: "*",
    },
  });

  socketIOInstance.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("message", (data) => {
      socketIOInstance.emit("messageResponse", data);
    });

    socket.on("newUser", (data) => {
      socketIOInstance.emit("newUserResponse", data);
    });

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
      socket.disconnect();
    });
  });

  return socketIOInstance;
};
