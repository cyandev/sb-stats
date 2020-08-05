let nbt = require("prismarine-nbt");
//head images stored as base64 encoded JSON object at item.SkullOwner.Properties.Textures.value
function nbtToJson(base64) {
  let resF;
  let output = new Promise((res,rej) => {
    resF = res;
  })
  nbt.parse(Buffer.from(base64, "base64"), (err,data) => {
    if(err) {
      console.log(err);
      return null;
    }
    resF(nbt.simplify(data));
  })
  return output;
}
exports.nbtToJson = nbtToJson;