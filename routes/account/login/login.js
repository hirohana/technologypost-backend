const router = require("express").Router();
const { verifyToken } = require("../../../lib/security/jwt/JwtHelper.js");

router.get("/", (req, res, next) => {
  const encodeToken = req.cookies["token"];
  const decodeToken = verifyToken(encodeToken, res);
  console.log(decodeToken);
  res.end();
});

module.exports = router;
