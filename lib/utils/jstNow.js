const { format } = require("date-fns");
const { utcToZonedTime } = require("date-fns-tz");

function jstNow() {
  const utcDate = new Date();
  const dateTime = utcDate.getTime();
  const jstDate = utcToZonedTime(utcDate, "Asia/Tokyo");
  const now = format(jstDate, "yyyy-MM-dd HH:mm:ss");
  return { now, dateTime };
}

module.exports = {
  jstNow,
};
