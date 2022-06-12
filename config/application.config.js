module.exports = {
  port: process.env.PORT || 5000,
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
};
