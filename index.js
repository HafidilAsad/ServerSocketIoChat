const express = require("express");
const app = express();
const PORT = 4000;

//configurasi modbus
const ModbusRTU = require("modbus-serial");
const { Client } = require("pg");
const PortModbus = 502;
const ADDRESS = 20128;
const SLAVE_ID = 1;
const client = new ModbusRTU();
const HOST = "10.14.139.120";

//configurasi http
const http = require("http").Server(app);

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3001",
  },
});

let users = [];

//untuk konek ke modbus
setInterval(() => {
  client.connectTCP(HOST, { port: PortModbus }).then(() => {
    client.setID(SLAVE_ID);
    client.readHoldingRegisters(ADDRESS, 2, function (err, data) {
      if (err) {
        console.log("Modbus Error", err);
      } else {
        const buffer = Buffer.from(data.buffer);
        const valueStriko1 = buffer.readFloatBE();
        socketIO.emit("valueStriko1", valueStriko1);
        console.log(`nilai striko1 ${valueStriko1}`);
      }
    });
  });
}, 5000);

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("message", (data) => {
    socketIO.emit("messageResponse", data);
  });

  //Listens when a new user joins the server
  socket.on("newUser", (data) => {
    //Adds the new user to the list of users
    users.push(data);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit("newUserResponse", users);
  });

  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit("newUserResponse", users);
    socket.disconnect();
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
