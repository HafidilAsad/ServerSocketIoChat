const express = require("express");
const app = express();
const http = require("http").Server(app);
const PORT = 4002;

const socketIOInstance = require("./socketConfig.js")(http);

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
