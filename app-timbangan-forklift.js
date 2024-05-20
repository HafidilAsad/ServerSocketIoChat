const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)

require("dotenv").config();
const net = require("net");


const host = process.env.HOST_FORKLIFT_11;
const port_forklift = process.env.PORT_FORKLIFT_11;
const port_socket_forklift = process.env.PORT_SOCKET_FORKLIFT;

const client = new net.Socket();

client.connect(port_forklift, host, () => {
  console.log(`Connected to ${host}:${port_forklift}`);

  setInterval(() => {
    client.write("Heartbeat");
  }, 30000);
});


client.on("data", (data) => {
    const FORKLIFT_11 = data.toString().replace("kg", "");
  
    
    io.emit('FORKLIFT-11', parseInt(FORKLIFT_11));

    console.log("Received data timbangan:", FORKLIFT_11);
});


client.on("error", (err) => {
  console.error("Error:", err);
  setTimeout(() => {
    process.exit(1)
  }, 60*60*1000);

});

io.on('connection', (socket) => {
    console.log('A new client connected');
  
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });

server.listen(port_socket_forklift, () => {
    console.log(`Server is running on port ${port_socket_forklift}`);
});

