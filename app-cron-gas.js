const io = require('socket.io-client');
const axios = require('axios');
const cron = require('node-cron');

const machines = {
  Striko1: { namaMesin: "Striko 1", data: null, used: null },
  Striko2: { namaMesin: "Striko 2", data: null, used: null },
  Striko3: { namaMesin: "Striko 3", data: null, used: null },
  Swifa: { namaMesin: "Swift Asia", data: null, used: null },
  T6: { namaMesin: "T6", data: null, used: null },
  Painting: { namaMesin: "Painting", data: null, used: null },
  Gravity: { namaMesin: "Gravity", data: null, used: null },
  // Add more machines as needed
};

const socket = io('ws://10.14.20.246:4000');

socket.on('connect', () => {
  console.log('Connected to the WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('Connection Error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

Object.keys(machines).forEach((machine) => {
  socket.on(`value${machine}`, (data) => {
    machines[machine].data = data;
    console.log(`Received value${machine} event:`, data);
  });

  socket.on(`value${machine}Used`, (data) => {
    machines[machine].used = data;
    console.log(`Received value${machine}Used event:`, data);
  });
});

const sendData = (machine, url) => {
  axios.post(url, {
    nama_mesin: machines[machine].namaMesin,
    gas_used: machines[machine].data,
    gas_consumption: machines[machine].used
  })
   .then(response => {
      console.log(`Data inserted successfully for ${machine}:`, response.data);
    })
   .catch(error => {
      console.error(`Error inserting data for ${machine}:`, error);
    });
};

cron.schedule('59 23 * * *', () => {
  console.log('Running Cronjob');
  Object.keys(machines).forEach((machine) => {
    sendData(machine, `http://localhost:5000/addakhirhari${machine === 'Striko1'? '' : machine}`);
  });
});