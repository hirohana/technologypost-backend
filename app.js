const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
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

app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
