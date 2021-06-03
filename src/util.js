let nbt = require("prismarine-nbt");

//head images stored as base64 encoded JSON object at item.SkullOwner.Properties.Textures.value
function nbtToJson(base64) {
  return new Promise((res) => {
    nbt.parse(Buffer.from(base64, "base64"), (err,data) => {
      if(err) {
        console.log(err);
        return null;
      }
      res(nbt.simplify(data));
    })
  })
}
exports.nbtToJson = nbtToJson;

function nbtBufToJson(buf) {
  return new Promise((res) => {
    nbt.parse(buf, (err,data) => {
      if(err) {
        console.log(err);
        return null;
      }
      res(nbt.simplify(data));
    })
  })
}
exports.nbtBufToJson = nbtBufToJson;

function cleanFormatNumber(n) {
  n = n.toFixed(0);
  if (n.length <= 3) return n;
  const post = ["","k","m","b","t","q"];
  return n.slice(0,3) / ((n.length - 3) % 3 == 0 ? 1: Math.pow(10,3 - n.length % 3)) + post[Math.floor((n.length-1) / 3)]
}
exports.cleanFormatNumber = cleanFormatNumber;

function checkNested(obj, level,  ...rest) {
  if (obj === undefined) return false
  if (rest.length == 0 && obj.hasOwnProperty(level)) return true //eslint-disable-line
  return checkNested(obj[level], ...rest)
}
exports.checkNested = checkNested;