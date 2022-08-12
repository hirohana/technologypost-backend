const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  prodEnviroment: process.argv[2] === "production",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  dbSecurity: {
    ACCOUNT_LOCK_CONTINUE_FAILURE: 5,
    ACCOUNT_LOCK_THRESHOLD: 5,
    ACCOUNT_LOCK_TIME: 10,
    MAX_LOGIN_HISTORY: 10,
  },
  privilege: {
    NORMAL: "normal",
  },
  loginStatus: {
    FAILURE: 0,
    SUCCESS: 1,
  },
  public_state: {
    false: 0,
    true: 1,
  },
  search: {
    MAX_ITEMS_PER_PAGE: 6,
    MAX_ITEMS_WORDS: 5,
  },
  JWT_SECRET: process.env.JWT_SECRET,
  jwtOptions: {
    expiresIn: 3600,
  },
};
