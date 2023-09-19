const ModbusRTU = require("modbus-serial");

const PortModbus = 502;
const ADDRESS = 20128;
const ADDRESS2 = 20130;
const SLAVE_ID = 1;
const SLAVE_ID_SWIFA = 13;
const ADDRESS4 = 6;
const ADDRESS5 = 8;

const client1 = new ModbusRTU();
const client2 = new ModbusRTU();
const client3 = new ModbusRTU();
const client4 = new ModbusRTU();
const client5 = new ModbusRTU();

module.exports = {
  client1,
  client2,
  client5,
  client3,
  client4,
  PortModbus,
  ADDRESS,
  ADDRESS2,
  SLAVE_ID,
  SLAVE_ID_SWIFA,
  ADDRESS4,
  ADDRESS5,
};
