const { utcToZonedTime, format } = require("date-fns-tz");

const utcDate = new Date();
const jstDate = utcToZonedTime(utcDate, "Asia/Tokyo");
function jstNow() {
  const jstString = format(jstDate, "yyyy-MM-dd HH:mm:ss xxx", {
    timeZone: "Asia/Tokyo",
  });
  return jstString;
}

module.exports = {
  jstNow,
};
