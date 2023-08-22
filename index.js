const express = require("express");
const app = express();
const PORT = 4000;

//configurasi modbus
const ModbusRTU = require("modbus-serial");
const { Client } = require("pg");
const PortModbus = 502;
const ADDRESS = 20128;
const ADDRESS2 = 20130;
const SLAVE_ID = 1;
const client = new ModbusRTU();
const client2 = new ModbusRTU();
const client3 = new ModbusRTU();
const HOST = "10.14.139.121"; //striko 1
const HOST2 = "10.14.139.120"; //striko 2
const HOST3 = "10.14.139.118"; //striko 2

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
  client
    .connectTCP(HOST, { port: PortModbus })
    .then(() => {
      client.setID(SLAVE_ID);

      // Read the first set of Modbus values
      client.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko1 = buffer.readFloatBE();
          socketIO.emit("valueStriko1", valueStriko1);
          console.log(`nilai striko1 ${valueStriko1}`);

          // Read the second set of Modbus values
          client.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 1 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko1Used = buffer.readUInt32BE();

              socketIO.emit("valueStriko1Used", valueStriko1Used);
              console.log(`nilai striko1 Used ${valueStriko1Used}`);
            }

            // Close the Modbus connection after reading the second set of values
            client.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 1 error:", err);
      client.connectTCP(HOST, { port: PORT });
    });

  client2
    .connectTCP(HOST2, { port: PortModbus })
    .then(() => {
      client2.setID(SLAVE_ID);

      // Read the first set of Modbus values
      client2.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko2 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko2 = buffer.readFloatBE();
          socketIO.emit("valueStriko2", valueStriko2);
          console.log(`nilai striko2 ${valueStriko2}`);

          // Read the second set of Modbus values
          client2.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 2 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko2Used = buffer.readUInt32BE();

              socketIO.emit("valueStriko2Used", valueStriko2Used);
              console.log(`nilai striko2 Used ${valueStriko2Used}`);
            }

            // Close the Modbus connection after reading the second set of values
            client2.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 2 error:", err);
      client2.connectTCP(HOST2, { port: PORT });
    });

  client3
    .connectTCP(HOST3, { port: PortModbus })
    .then(() => {
      client3.setID(SLAVE_ID);

      // Read the first set of Modbus values
      client3.readHoldingRegisters(ADDRESS, 2, function (err, data) {
        if (err) {
          console.log("Modbus Striko3 Error", err);
        } else {
          const buffer = Buffer.from(data.buffer);
          const valueStriko3 = buffer.readFloatBE();
          socketIO.emit("valueStriko3", valueStriko3);
          console.log(`nilai striko3 ${valueStriko3}`);

          // Read the second set of Modbus values
          client3.readHoldingRegisters(ADDRESS2, 2, function (err, data) {
            if (err) {
              console.log("Modbus Striko 3 Error", err);
            } else {
              const buffer = Buffer.from(data.buffer);
              const valueStriko3Used = buffer.readUInt32BE();

              socketIO.emit("valueStriko3Used", valueStriko3Used);
              console.log(`nilai striko3 Used ${valueStriko3Used}`);
            }

            // Close the Modbus connection after reading the second set of values
            client3.close();
          });
        }
      });
    })

    .catch((err) => {
      console.error("Modbus connection Striko 3 error:", err);
      client3.connectTCP(HOST3, { port: PORT });
    });
}, 2000);

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
