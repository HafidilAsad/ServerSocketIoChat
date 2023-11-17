const net = require("net");

const host = "10.14.139.57";
const port = 9001;

const client = new net.Socket();

client.connect(port, host, () => {
  console.log(`Connected to ${host}:${port}`);

  setInterval(() => {
    client.write("Heartbeat");
  }, 30000);
});

client.on("data", (data) => {
  const receivedData = data.toString();
  console.log("Received data timbangan:", receivedData);
});

client.on("close", () => {
  console.log("Connection closed");
  process.exit(1)
});

client.on("error", (err) => {
  console.error("Error:", err);
});