const socketIO = require("socket.io");
const dbConnection = require("./dbConfig2.js");
const axios = require("axios");

const fetchDataFromDB = (socket) => {
  const query =
    "SELECT id, nomor_mesin, status, nama_part FROM db_quality_status_machine";

  dbConnection.query(query, (error, results) => {
    if (error) throw error;
    socket.emit("qualityData", results);
  });
};

const fetchDataJsu = (socket) => {
  const today = new Date().toISOString().split("T")[0];
  const query =
    "SELECT id, nrp, proses, shift, no_mesin, nama_part, judge FROM db_quality_jsu WHERE DATE(createdAt) = ?";
  dbConnection.query(query, [today], (error, results) => {
    if (error) throw error;
    socket.emit("qualityJsu", results);
  });
};

// const fetchDataQtime = (socket) => {
//   // const today = new Date().toISOString().split("T")[0];
//   // const query =
//   //   "SELECT no_mesin, nrp, nama_part, " +
//   //   'MAX(CASE WHEN q_time = "Q1" THEN judge ELSE "-" END) AS Q1, ' +
//   //   'MAX(CASE WHEN q_time = "Q2" THEN judge ELSE "-" END) AS Q2, ' +
//   //   'MAX(CASE WHEN q_time = "Q3" THEN judge ELSE "-" END) AS Q3, ' +
//   //   'MAX(CASE WHEN q_time = "Q4" THEN judge ELSE "-" END) AS Q4 ' +
//   //   "FROM db_q_time " +
//   //   "WHERE createdAt >= ? " +
//   //   "GROUP BY no_mesin, nrp, nama_part";
//   // dbConnection.query(query, [today], (error, results) => {
//   //   if (error) throw error;
//   //   socket.emit("qualityQtime", results);
//   // });
// };

const fetchDataQtime = (socket) => {
  let url = `http://localhost:5000/QtimeSummary`;

  axios
    .get(url)
    .then((response) => {
      socket.emit("qualityQtime", response.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

const fetchDataTrial = (socket) => {
  let url = "http://localhost:5000/TrialNextProcessSummary";

  axios
    .get(url)
    .then((response) => {
      socket.emit("qualityTrial", response.data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
};

// const fetchDataTrial = (socket) => {
//   const today = new Date().toISOString().split("T")[0];
//   const query =
//     "SELECT no_mesin, nrp, nama_part, " +
//     'MAX(CASE WHEN trial = "T1" THEN judge ELSE "-" END) AS T1, ' +
//     'MAX(CASE WHEN trial = "T2" THEN judge ELSE "-" END) AS T2, ' +
//     'MAX(CASE WHEN trial = "T3" THEN judge ELSE "-" END) AS T3, ' +
//     'MAX(CASE WHEN trial = "T4" THEN judge ELSE "-" END) AS T4 ' +
//     "FROM db_trial_next_process " +
//     "WHERE createdAt >= ? " +
//     "GROUP BY no_mesin, nrp, nama_part";
//   dbConnection.query(query, [today], (error, results) => {
//     if (error) throw error;
//     socket.emit("qualityTrial", results);
//   });
// };

const emitQualityData = (socket) => {
  setInterval(() => {
    fetchDataFromDB(socket);
  }, 3000);
};
const emitQualityJsu = (socket) => {
  setInterval(() => {
    fetchDataJsu(socket);
  }, 5000);
};
const emitQualityQtime = (socket) => {
  setInterval(() => {
    fetchDataQtime(socket);
  }, 5000);
};
const emitQualityTrial = (socket) => {
  setInterval(() => {
    fetchDataTrial(socket);
  }, 5000);
};

module.exports = (http) => {
  const socketIOInstance = socketIO(http, {
    cors: {
      origin: "*",
    },
    // transport:["websocket"],
  });

  socketIOInstance.on("connection", (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // Emit quality data to the newly connected client
    emitQualityData(socket);
    emitQualityJsu(socket);
    emitQualityQtime(socket);
    emitQualityTrial(socket);

    socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
    });
  });

  return socketIOInstance;
};
