const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const flash = require("connect-flash");
const gracefulShutdown = require("http-graceful-shutdown");

const applicationConfig = require("./config/application.config.js");
const accesscontrol = require("./lib/security/passport/authPassport.js");
const { port } = require("./config/application.config.js");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

//set middleware
app.set("view engine", "ejs");
app.disable("x-powered-by");
app.use(cors({ origin: applicationConfig.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(
  session({
    cookie: {
      httpOnly: true,
      // 本番環境はtrueにする。cookieを保存するのはhttps限定にするかどうかの設定。
      secure: true,
      maxage: 1000 * 60 * 30,
      domain: process.env.COOKIE_DOMAIN || "localhost:3000",
      sameSite: "none",
    },
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(...accesscontrol.initialize());

// dynamic resource rooting
app.use(
  "/",
  (() => {
    const router = express.Router();
    router.use((req, res, next) => {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      next();
    });
    router.use("/api/v1/account", require("./routes/account/account.js"));
    router.use("/api/v1/articles", require("./routes/articles/articles.js"));
    return router;
  })()
);

// error middleware
app.use((err, req, res, next) => {
  res.status(500).json(`500 Internal Server Error: ${err}`);
});

// execute application port
const server = app.listen(port, () => {
  console.log(`listening on *:${port}`);
});

// graceful shutdown
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
