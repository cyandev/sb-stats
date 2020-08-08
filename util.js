let nbt = require("prismarine-nbt");
let jimp = require("jimp")
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
async function getSkinFace(skinUrl,i) {
  return new Promise(async (res, rej) => {
    let skinImg = await jimp.read(skinUrl);
    if (i == 0) {
      let faceBase = skinImg.clone();
      let faceOverlay = skinImg.clone();
      faceBase.crop(8,8,8,8); //head
      faceOverlay.crop(40,8,8,8); //head second layer
      faceBase.composite(faceOverlay,0,0); //combined face
      let buffer = (await faceBase.getBufferAsync(jimp.MIME_PNG));
      res(buffer)
    } else if (i == 1) {
      let sideBase = skinImg.clone();
      let sideOverlay = skinImg.clone();
      sideBase.crop(0,8,8,8); 
      sideOverlay.crop(32,8,8,8);
      sideBase.composite(sideOverlay,0,0);
      let buffer = (await sideBase.getBufferAsync(jimp.MIME_PNG));
      res(buffer)  
    } else if (i == 2) {
      let topBase = skinImg.clone();
      let topOverlay = skinImg.clone();
      topBase.crop(8,0,8,8); 
      topOverlay.crop(40,0,8,8); 
      topBase.composite(topOverlay,0,0);
      let buffer = (await topBase.getBufferAsync(jimp.MIME_PNG));
      res(buffer)
    }
  });
}
exports.getSkinFace = getSkinFace;