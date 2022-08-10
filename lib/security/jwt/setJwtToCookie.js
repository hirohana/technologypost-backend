const { nowPlus1Hour } = require("../../utils/nowPlus1Hour");
const { createToken } = require("./JwtHelper");

/**
 *
 * @param {string} email
 * @param {string} password
 * @param {*} res
 */
function setJwtToCookie(email, password, res) {
  const payload = {
    email,
    password,
  };
  const jwtToken = createToken(payload);
  const { time } = nowPlus1Hour();
  res.cookie("token", jwtToken, {
    httpOnly: true,
    expires: time,
  });
}

module.exports = {
  setJwtToCookie,
};
