const express = require("express");
const cors = require("cors");
const Modbus = require("modbus-serial");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const port = process.env.PORT || 5201;

const client = new Modbus();

// Define the Modbus server's IP address and port
const modbusServerIp = process.env.HOST_PLC_NUSA1;
const modbusServerPort = process.env.PORT_PLC_NUSA1;

const registerAddressLogin = 50;
const registerValueLogin = 1;

// register value control 
const registerLamp1 = 51;
const registerLamp2 = 52;
const registerLamp3 = 53;
const registerModePresentation = 54;
const registerDoorLock_1 = 55;
const registerDoorLock_2 = 56;
const registerAc_1 = 57;
const registerAc_2 = 58;

// register value Monitor
const registerTemperature = 60;
const registerHumidity = 62;

const registerValueOn = 1;
const registerValueOff = 0;

// Define a function to write to a register
function writeCoil(register, value, res) {
  client.writeCoil(register, value, (writeErr, response) => {
    if (writeErr) {
      console.error("Error writing register:", writeErr);
      res.status(500).send("Error writing Modbus register");
      process.exit(1);
    } else {
      console.log("Write successful:", response);
      res.status(200).send("Write successful");
    }
  });
}

// Connect to Modbus and write
client.connectTCP(modbusServerIp, { port: modbusServerPort }, (err) => {
  if (err) {
    console.log(`Modbus Smart Office Error`, err);
    client.connectTCP(host, { port: PortModbusMdb, timeout: 5000 });
  } else {
    app.post("/api/smart-office/login", (req, res) => {
      console.log("API CALLED AT :", new Date().toLocaleString('id-ID'));
      writeCoil(registerAddressLogin, registerValueLogin, res);
      writeCoil(registerLamp1, 1, res);
      writeCoil(registerLamp2, 1, res);
      writeCoil(registerLamp3, 1, res);
    });

    app.post("/api/smart-office/logout", (req, res) => {
      console.log("API CALLED AT :", new Date().toLocaleString('id-ID'));
      writeCoil(registerAddressLogin, 0, res);
      writeCoil(registerLamp1, 0, res);
      writeCoil(registerLamp2, 0, res);
      writeCoil(registerLamp3, 0, res);
    });


    // for control smart office
    app.post("/api/smart-office/control", (req, res) => {
      const {  condition } = req.body;
      const { saklar } = req.body;
      let register;
      let value;
      switch (saklar) {
        case "lamp_1":
          register = registerLamp1;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
        case "lamp_2":
          register = registerLamp2;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
        case "lamp_3":
          register = registerLamp3;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
        case "mode_presentation":

          register = registerModePresentation;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
        case "door_lock_1":
          register = registerDoorLock_1;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
        case "door_lock_2":
          register = registerDoorLock_2;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
        case "ac_1":
          register = registerAc_1;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
        case "ac_2":
          register = registerAc_2;
          value = condition === 1 ? registerValueOn : registerValueOff;
          break;
      
        default:
          res.status(400).send("Invalid switch name");
          return;
      }

      console.log("API CALLED AT :", new Date().toLocaleString('id-ID'));
      if (saklar === "mode_presentation" && condition === 1) {
        writeCoil(registerLamp1, 0, res);
        writeCoil(registerLamp2, 0, res);
        writeCoil(registerLamp3, 1, res);
        
      } else if (saklar === "mode_presentation" && condition === 0) {
      writeCoil(registerLamp1, 1, res);
      writeCoil(registerLamp2, 1, res);
      writeCoil(registerLamp3, 1, res); s
      writeCoil(registerModePresentation, 0, res);
      } else {
        writeCoil(register, value, res);
      }
    });

    // for monitoring smart office
    app.get("/api/smart-office/monitoring", (req, res) => {
        client.readHoldingRegisters(registerTemperature, 2, (readErr, response) => {
          if (readErr) {
            console.error("Error reading register:", readErr);
            res.status(500).send("Error reading Modbus register");
            process.exit(1);
          } else {
            const buffer = Buffer.from(response.buffer);
            const temperature = buffer.readInt16BE();
            client.readHoldingRegisters(registerHumidity, 2, (readErr, response) => {
              if (readErr) {
                console.error("Error reading register:", readErr);
                res.status(500).send("Error reading Modbus register");
                process.exit(1);
              } else {
                const buffer = Buffer.from(response.buffer);
                const humidity = buffer.readInt16BE();
                res.status(200).json({ temperature, humidity });
              }
            });
            
          }
        })
      
    })

    // for condition all data register above
    app.get("/api/smart-office/condition", (req, res) => {
        client.readCoils(registerLamp1, 2, (readErr, response) => {
            if (readErr) {
                console.error("Error reading register:", readErr);
                res.status(500).send("Error reading Modbus register");
                process.exit(1);
            } else {
                const lamp_1 = response.data[0] ? 1 : 0;
                client.readCoils(registerLamp2, 2, (readErr, response) => {
                    if (readErr) {
                        console.error("Error reading register:", readErr);
                        res.status(500).send("Error reading Modbus register");
                        process.exit(1);
                    } else {
                        const lamp_2 = response.data[0] ? 1 : 0;
                        client.readCoils(registerLamp3, 2, (readErr, response) => {
                            if (readErr) {
                                console.error("Error reading register:", readErr);
                                res.status(500).send("Error reading Modbus register");
                                process.exit(1);
                            } else {
                                const lamp_3 = response.data[0] ? 1 : 0;
                                client.readCoils(registerModePresentation, 2, (readErr, response) => {
                                    if (readErr) {
                                        console.error("Error reading register:", readErr);
                                        res.status(500).send("Error reading Modbus register");
                                        process.exit(1);
                                    } else {
                                        const mode_presentation = response.data[0] ? 1 : 0;
                                        client.readCoils(registerDoorLock_1, 2, (readErr, response) => {
                                            if (readErr) {
                                                console.error("Error reading register:", readErr);
                                                res.status(500).send("Error reading Modbus register");
                                                process.exit(1);
                                            } else {
                                                const door_lock_1 = response.data[0] ? 1 : 0;
                                                client.readCoils(registerDoorLock_2, 2, (readErr, response) => {
                                                    if (readErr) {
                                                        console.error("Error reading register:", readErr);
                                                        res.status(500).send("Error reading Modbus register");
                                                        process.exit(1);
                                                    } else {
                                                        const door_lock_2 = response.data[0] ? 1 : 0;
                                                        const data = {
                                                            lamp_1,
                                                            lamp_2,
                                                            lamp_3,
                                                            mode_presentation,
                                                            door_lock_1,
                                                            door_lock_2
                                                        };
                                                        res.status(200).json(data);
                                                    }
                                                });
                                               
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    

   
  }
});

app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
