// dbConfig.js
const mysql = require("mysql2");

const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASSWORD = "";
const DB_DATABASE = "monitoring-gas";

const dbConnection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

dbConnection.connect((err) => {
  if (err) {
    console.log(`Error connecting to the database ${err}`);
  } else {
    console.log("Connected to Mysql");
  }
});

module.exports = dbConnection;
