function jstNowPlus1Hour() {
  const utcDate = new Date();
  const time = utcDate.getTime() + 1000 * 60 * 60 * 9;
  const jstNow = new Date(time);
  console.log(jstNow);
  return { jstNow };
}

jstNowPlus1Hour();
console.log(new Date());
