let nbt = require("prismarine-nbt");
let jimp = require("jimp")
//head images stored as base64 encoded JSON object at item.SkullOwner.Properties.Textures.value
function nbtToJson(base64) {
  return new Promise((res,rej) => {
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
  return new Promise((res,rej) => {
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

async function getColoredItem(item,color) {
  return new Promise(async (res,rej) => {
    let itemBase = await jimp.read(__dirname + "/public/img/" + item + ".png");
    let itemOverlay = await jimp.read(__dirname + "/public/img/" + item + "_overlay.png");
    itemBase.scan(0,0,itemBase.bitmap.width, itemBase.bitmap.height, (x,y,idx) => {
      itemBase.bitmap.data[idx+0] = color[0] * itemBase.bitmap.data[idx + 0] / 255; //pixel[red] = color[red] * pixel[red] / 255
      itemBase.bitmap.data[idx+1] = color[1] * itemBase.bitmap.data[idx + 1] / 255;
      itemBase.bitmap.data[idx+2] = color[2] * itemBase.bitmap.data[idx + 2] / 255;
    });
    itemBase.composite(itemOverlay,0,0);
    res((await itemBase.getBufferAsync(jimp.MIME_PNG)));
  })
}
exports.getColoredItem = getColoredItem;