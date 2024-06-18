const express = require("express");
const cors = require("cors");
const Modbus = require("modbus-serial");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
const port = process.env.PORT || 5201; 

const client = new Modbus();

// Define the Modbus server's IP address and port
const modbusServerIp = "192.168.255.1";
const modbusServerPort = 502;

const registerAddress = 1103;
const registerValue = 1;
const registerAddressCommand=1104;
const registerValueCommand =1


// connect modbus and write
client.connectTCP(modbusServerIp, { port: modbusServerPort }, (err) => {
    if (err) {
        console.log(`Modbus Error`, err);
        client.connectTCP(host, { port: PortModbusMdb, timeout: 5000 });
      } else {
        app.get("/api/power", (req, res) => {
        
            console.log("API PRESSED completed at:", new Date().toLocaleString('id-ID'));

        client.writeRegister(
            registerAddress,
            registerValue,
            (writeErr, response) => {
              if (writeErr) {
                console.error("Berhasil di remote Error writing register:", writeErr);
                res.status(500).send("Error writing Modbus register");
                process.exit(1)
              } else {
                console.log("Write successful:", response);
                res.status(200).send("Write successful");
              }            
            }
          );
      
          client.writeRegister(
            registerAddressCommand,
            registerValueCommand,
            (writeErr, response) => {
              if (writeErr) {
                console.error("Error writing register:", writeErr);
                // res.status(500).send("Error writing Modbus register");
                process.exit(1)
              } else {
                console.log("Write successful:", response);
                // res.status(200).send("Write successful");
              }            
            }
          );
        });
    }
  
});

app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
  });
  