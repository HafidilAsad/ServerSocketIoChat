const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const apiRouter = require("./routes/api");
const modbus = require("./modbus");
const socket = require("./socket");

const app = express();
const PORT = 4000;

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3001",
  },
});

app.use("/api", apiRouter);

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// Initialize Modbus and Socket.IO
modbus.init(io);
socket.init(io);
