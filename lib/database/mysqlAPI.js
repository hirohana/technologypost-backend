const pool = require("./pool");
const Transaction = require("./transaction");

const mysqlAPI = {
  query: async (query, values) => {
    const results = await pool.promisifyQuery(query, values);
    return results;
  },
  beginTransaction: async () => {
    const transaction = new Transaction();
    await transaction.begin();
    return transaction;
  },
};

module.exports = mysqlAPI;
