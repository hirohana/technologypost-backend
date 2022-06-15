const bcrypt = require("bcrypt");
const password = "abc";

(async () => {
  let salt = await bcrypt.genSalt(10, "b");
  let hash = await bcrypt.hash(password, salt);
  console.log(hash);
})();
