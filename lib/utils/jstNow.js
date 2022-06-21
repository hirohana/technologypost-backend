const { format } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");

const utcDate = new Date();
const jstDate = utcToZonedTime(utcDate, "Asia/Tokyo");
function jstNow() {
  const jstString = format(jstDate, "yyyy-MM-dd HH:mm:ss");
  return jstString;
}

module.exports = {
  jstNow,
};
