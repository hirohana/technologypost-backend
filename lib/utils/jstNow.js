const { format } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");

function jstNow() {
  const utcDate = new Date();
  const jstDate = utcToZonedTime(utcDate, "Asia/Tokyo");
  const jstString = format(jstDate, "yyyy-MM-dd HH:mm:ss");
  return jstString;
}

module.exports = {
  jstNow,
};
