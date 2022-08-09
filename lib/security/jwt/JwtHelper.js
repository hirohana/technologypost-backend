const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function createToken(payload) {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: 3600,
  });
  return token;
}

function verifyToken(token, res) {
  try {
    const decodeToken = jwt.verify(token, JWT_SECRET);
    return decodeToken;
  } catch (err) {
    res.status(401).json({ message: "ログイン認証をお願いします。" });
  }
}

module.exports = {
  createToken,
  verifyToken,
};
