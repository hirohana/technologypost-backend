/**
 * 実行環境に左右されずに、JST(日本標準時間)を取得する関数
 * @returns {number}
 */

function jstNow() {
  const jstNow = new Date(
    Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000
  );
  return jstNow;
}

module.exports = { jstNow };
