const router = require("express").Router();
const { authentication } = require("../../lib/security/authPassport");

router.get("/login/success", (req, res, next) => {
  console.log(req.user);
  res.json(req.user);
});
router.get("/login/failure", (req, res, next) => {
  res.json(req.flash("message"));
});
router.post("/login", authentication());

module.exports = router;
