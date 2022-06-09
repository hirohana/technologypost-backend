const fs = require("fs");
const { promisify } = require("util");

/**
 * fs.readfile関数をpromisify化し、引数のfileURLからファイルデータを読み取り、返却する関数
 * @param {string} rootURL
 * @returns {Promise}
 */
async function promisifyReadFile(fileURL) {
  const promisifyRead = promisify(fs.readFile).bind(fs);
  const data = await promisifyRead(fileURL, {
    encoding: "utf-8",
  });
  return data;
}

module.exports = { promisifyReadFile };
