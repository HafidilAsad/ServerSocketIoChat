const ModbusRTU = require("modbus-serial");

const PortModbus = 502;
const PortModbusMdb = 4111;
const ADDRESS = 20128;
const ADDRESS2 = 20130;
const SLAVE_ID = 1;
const SLAVE_ID_SWIFA = 13;
const SLAVE_ID_MDB = 1;
const SLAVE_ID_MDB2 = 2;
const ADDRESS4 = 6;
const ADDRESS5 = 8;
const ADDRESS_PAINTING = 21000;
const ADDRESS5_PAINTING2 = 21002;

const ADDRESS_VR = 778;
const ADDRESS_VS = 779;
const ADDRESS_VT = 780;

const ADDRESS_IR = 773;
const ADDRESS_IS = 774;
const ADDRESS_IT = 775;

const ADDRESS_AP = 806;
const ADDRESS_ED = 1281;
const ADDRESS_ED1 = 1280;
const ADDRESS_PF = 789;

const client1 = new ModbusRTU();
const client2 = new ModbusRTU();
const client3 = new ModbusRTU();
const client4 = new ModbusRTU();
const client5 = new ModbusRTU();
const client6 = new ModbusRTU();
const client7 = new ModbusRTU();

//mdb pnael

const client8 = new ModbusRTU(); //mdb1
const client9 = new ModbusRTU(); //mdb2
const client10 = new ModbusRTU(); //mdb3
const client11 = new ModbusRTU(); //mdb4
const client12 = new ModbusRTU(); //mdb5

//sdb panel
const client13 = new ModbusRTU();//sdb25
const client14 = new ModbusRTU();//sdb24


module.exports = {
  client1,
  client2,
  client5,
  client3,
  client4,
  client6,
  client7,
  client8,
  client8,
  client9,
  client10,
  client11,
  client12,
  client13,
  client14,
  PortModbus,
  PortModbusMdb,
  ADDRESS,
  ADDRESS2,
  SLAVE_ID,
  SLAVE_ID_SWIFA,
  SLAVE_ID_MDB,
  SLAVE_ID_MDB2,
  ADDRESS4,
  ADDRESS5,
  ADDRESS_VR,
  ADDRESS_VS,
  ADDRESS_VT,
  ADDRESS_IR,
  ADDRESS_IS,
  ADDRESS_IT,
  ADDRESS_AP,
  ADDRESS_ED,
  ADDRESS_ED1,
  ADDRESS_PF,
  ADDRESS5_PAINTING2,
  ADDRESS_PAINTING,
};
