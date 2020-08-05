//TODO: use an actual db and not crappy caching
let players = {};
function includes(uuid) {
  return Object.keys(players).includes(uuid);
}
function getData(uuid) {
  if (includes(uuid)) {
    return players[uuid].data;
  } else {
    return {};
  }
}
function addData(uuid, data) {
  players[uuid] = {
    data: data,
    timestamp: Date.now()
  };
}
exports = {
  includes: includes,
  getData: getData,
  addData, addData
}