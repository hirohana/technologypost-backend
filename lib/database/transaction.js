const pool = require("./pool");

class Transaction {
  constructor() {
    this.connection = null;
  }
  async begin() {
    this.connection = await pool.promisifyGetConnection();
    this.connection.beginTransaction();
  }
  async query(query, values) {
    return new Promise((resolve, reject) => {
      this.connection.query(query, values, (err, results) => {
        if (!err) {
          resolve(results);
        } else {
          reject(err);
        }
      });
    });
  }
  async commit() {
    return new Promise((resolve, reject) => {
      this.connection.commit((err) => {
        if (!err) {
          this.connection.release();
          this.connection = null;
          resolve();
        } else {
          reject(err);
        }
      });
    });
  }
  async rollback() {
    return new Promise((resolve) => {
      this.connection.rollback(() => {
        this.connection.release();
        this.connection = null;
        resolve();
      });
    });
  }
}

module.exports = Transaction;
