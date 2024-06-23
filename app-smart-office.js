const express = require("express");
const cors = require("cors");
const Modbus = require("modbus-serial");
const dotenv = require("dotenv");

dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json())

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

// function to write
function writeCoil(register, value) {
  return new Promise((resolve, reject) => {
    client.writeCoil(register, value, (writeErr, response) => {
      if (writeErr) {
        console.error("Error writing register:", writeErr);
        reject(writeErr);
      } else {
        console.log("Write successful:", response);
        resolve(response);
      }
    });
  });
}

// function to read condition
async function getCondition() {
    try {
      const lamp1Response = await client.readCoils(registerLamp1, 2);
      const lamp_1 = lamp1Response.data[0] ? 1 : 0;
  
      const lamp2Response = await client.readCoils(registerLamp2, 2);
      const lamp_2 = lamp2Response.data[0] ? 1 : 0;
  
      const lamp3Response = await client.readCoils(registerLamp3, 2);
      const lamp_3 = lamp3Response.data[0] ? 1 : 0;
  
      const modePresentationResponse = await client.readCoils(registerModePresentation, 2);
      const mode_presentation = modePresentationResponse.data[0] ? 1 : 0;
  
      const doorLockResponse_1 = await client.readCoils(registerDoorLock_1, 2);
      const door_lock_1 = doorLockResponse_1.data[0] ? 1 : 0;
  
      const doorLockResponse_2 = await client.readCoils(registerDoorLock_2, 2);
      const door_lock_2 = doorLockResponse_2.data[0] ? 1 : 0;
  
      //  Temperature and Humidity
      const temperature = await client.readHoldingRegisters(registerTemperature, 2);
      const buffer = Buffer.from(temperature.buffer);
      const temperatureValue = buffer.readInt16BE();
  
      const humidity = await client.readHoldingRegisters(registerHumidity, 2);
      const buffer2 = Buffer.from(humidity.buffer);
      const humidityValue = buffer2.readInt16BE();
  
      return { lamp_1, lamp_2, lamp_3, mode_presentation, door_lock_1, door_lock_2, temperatureValue, humidityValue };
    } catch (readErr) {
      console.error("Error reading register:", readErr);
      throw new Error("Error reading Modbus register");
    }
  }
  

// Connect to Modbus and write
client.connectTCP(modbusServerIp, { port: modbusServerPort }, (err) => {
  if (err) {
    console.log(`Modbus Smart Office Error`, err);
    client.connectTCP(host, { port: PortModbusMdb, timeout: 5000 });
  } else {
   app.post("/api/smart-office/login", async (req, res) => {
      console.log("API CALLED AT :", new Date().toLocaleString('id-ID'));
      try {
        writeCoil(registerAddressLogin, 1);
        writeCoil(registerLamp1, 1);
        writeCoil(registerLamp2, 1);
        writeCoil(registerLamp3, 1);
        const condition = await getCondition();
        res.status(200).json(condition);
      } catch (error) {
        res.status(500).send("Error writing Modbus register");
      }
    });

    app.post("/api/smart-office/logout", async (req, res) => {
      console.log("API CALLED AT :", new Date().toLocaleString('id-ID'));
      try {
        writeCoil(registerAddressLogin, 0);
        writeCoil(registerLamp1, 0);
        writeCoil(registerLamp2, 0);
        writeCoil(registerLamp3, 0);
        const condition = await getCondition();
        res.status(200).json(condition);
     
      } catch (error) {
        res.status(500).send("Error writing Modbus register");
      }
    });

    app.post("/api/smart-office/control", async (req, res) => {
      const { condition, saklar } = req.body;
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

      try {
        if (saklar === "mode_presentation" && condition === 1) {
          await writeCoil(registerLamp1, 0);
          await writeCoil(registerLamp2, 0);
          await writeCoil(registerLamp3, 1);
          await writeCoil(registerModePresentation, 1);
          
        
         
        } else if (saklar === "mode_presentation" && condition === 0) {
          await writeCoil(registerLamp1, 1);
          await writeCoil(registerLamp2, 1);
          await writeCoil(registerLamp3, 1);
          await writeCoil(registerModePresentation, 0);
        } else {
          await writeCoil(register, value);
        }

        const currentCondition = await getCondition();
        res.status(200).json(currentCondition);
        
      } catch (error) {
        res.status(500).send("Error writing Modbus register");
      }
    });

    app.get("/api/smart-office/condition", async (req, res) => {
      try {
        const currentCondition = await getCondition();
        res.status(200).json( currentCondition );       
      } catch (error) {
        res.status(500).send(readErr.message);       
      }
    });

    app.get("/api/smart-office/monitoring", async (req, res) => {
      try {
        const temperature = await client.readHoldingRegisters(registerTemperature, 2);
        const buffer = Buffer.from(temperature.buffer);
        const temperatureValue = buffer.readInt16BE();
        const humidity = await client.readHoldingRegisters(registerHumidity, 2);
        const buffer2 = Buffer.from(humidity.buffer);
        const humidityValue = buffer2.readInt16BE();
        res.status(200).json({ temperatureValue, humidityValue });
      } catch (readErr) {
        console.error("Error reading register:", readErr);
        res.status(500).send("Error reading Modbus register");
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
