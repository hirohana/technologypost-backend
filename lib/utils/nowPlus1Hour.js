function nowPlus1Hour() {
  const date = new Date();
  const timePlus1Hour = date.getTime() + 1000 * 60 * 60;
  const time = new Date(timePlus1Hour);
  return { time };
}

module.exports = {
  nowPlus1Hour,
};
