const socketIO = require("socket.io");

module.exports = (http) => {
  const socketIOInstance = socketIO(http, {
    cors: {
      origin: "*",
    },
    transport:["websocket"], 
  });

  socketIOInstance.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("message", (data) => {
      socketIOInstance.emit("messageResponse", data);
    });

    socket.on("touchup", (data) => {
      socketIOInstance.emit("touchupResponse", data)
    }
    )

    socket.on("touchupMachining", (data) => {
      socketIOInstance.emit("touchupMachiningResponse", data)
    }
    )

    socket.on("touchupCasting", (data) => {
      socketIOInstance.emit("touchupCastingResponse", data)
    }
    )

    socket.on("touchupGas", (data) => {
      socketIOInstance.emit("touchupGasResponse", data)
    }
    )

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
