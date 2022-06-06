const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const gracefulShutdown = require("http-graceful-shutdown");
const { resolve } = require("path");
const port = process.env.PORT || 5000;

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/article", require("./routes/article/article.js"));
app.get("/api", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.use((err, req, res, next) => {
  res.status(500).json(`500 Internal Server Error: ${err}`);
});

const server = app.listen(port, () => {
  console.log(`listening on *:${port}`);
});

gracefulShutdown(server, {
  signals: "SIGINT SIGTERM",
  timeout: 10000,
  onShutdown: () => {
    return new Promise((resolve, reject) => {
      const { pool } = require("./lib/database/pool");
      pool.end((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  },
  finally: () => {
    console.info("application finished");
  },
});
