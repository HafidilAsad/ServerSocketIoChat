const mysql = require("mysql2");

const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASSWORD = "root";
const DB_DATABASE = "monitoring-gas";

const dbConnection = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  connectionLimit: 10,
});



module.exports = dbConnection;
