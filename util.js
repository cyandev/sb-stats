let nbt = require("prismarine-nbt");
let jimp = require("jimp");
let fs = require("fs");

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

var skinCache = {}
async function getSkinFace(skinUrl,i) {
  return new Promise(async (res, rej) => {
    if (skinCache[skinUrl+i]) {
      res(skinCache[skinUrl+i]);
    }
    let skinImg = await jimp.read(skinUrl);
    let faceNumberMap = {
      0: {
        base: [8,8,8,8],
        overlay: [40,8,8,8]
      },
      1: {
        base: [0,8,8,8],
        overlay: [32,8,8,8]
      },
      2: {
        base: [8,0,8,8],
        overlay: [40,0,8,8]
      }
    }
    let faceBase = skinImg.clone();
    let faceOverlay = skinImg.clone();
    let [a,b,c,d] = faceNumberMap[i].base;
    faceBase.crop(a,b,c,d); //head
    [a,b,c,d] = faceNumberMap[i].overlay;
    faceOverlay.crop(a,b,c,d); //head second layer
    faceBase.composite(faceOverlay,0,0); //combined face
    let buffer = (await faceBase.getBufferAsync(jimp.MIME_PNG));
    skinCache[skinUrl+i] = buffer;
    res(buffer)
  });
}
exports.getSkinFace = getSkinFace;

let itemCache = {}
async function getColoredItem(item,color) {
  return new Promise(async (res,rej) => {
    if (itemCache[item+color]) {
      res(itemCache[item+color]);
    }
    let itemBase = await jimp.read(__dirname + "/public/img/" + item + ".png");
    let itemOverlay = await jimp.read(__dirname + "/public/img/" + item + "_overlay.png");
    itemBase.scan(0,0,itemBase.bitmap.width, itemBase.bitmap.height, (x,y,idx) => {
      itemBase.bitmap.data[idx+0] = color[0] * itemBase.bitmap.data[idx + 0] / 255; //pixel[red] = color[red] * pixel[red] / 255
      itemBase.bitmap.data[idx+1] = color[1] * itemBase.bitmap.data[idx + 1] / 255;
      itemBase.bitmap.data[idx+2] = color[2] * itemBase.bitmap.data[idx + 2] / 255;
    });
    itemBase.composite(itemOverlay,0,0);
    itemBase.resize(128,128,jimp.RESIZE_NEAREST_NEIGHBOR);
    let imgBuffer = await itemBase.getBufferAsync(jimp.MIME_PNG);
    itemCache[item+color] = imgBuffer;
    res(imgBuffer);
  })
}
exports.getColoredItem = getColoredItem;
function cleanFormatNumber(n) {
  n = n.toFixed(0);
  if (n.length <= 3) return n;
  const post = ["","k","m","b","t","q"];
  return n.slice(0,3) / ((n.length - 3) % 3 == 0 ? 1: Math.pow(10,3 - n.length % 3)) + post[Math.floor((n.length-1) / 3)]
}
exports.cleanFormatNumber = cleanFormatNumber;