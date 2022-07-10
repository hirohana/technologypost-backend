const bcrypt = require('bcrypt');

const createHashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10, 'b');
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

module.exports = {
  createHashPassword,
};
