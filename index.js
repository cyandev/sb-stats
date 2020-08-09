const express = require("express");
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var port = 8080
app.use(bodyParser.urlencoded()); 

let axios = require("axios")
const minecraftItems = require('minecraft-items')

let util = require("./util.js");
let playerDB = require("./playerDB.js")
let reqScheduler = new (require("./requestScheduler.js").RequestScheduler)(500) //make a 500ms delay between requests to always be at the 120 reqs/min rate limit

async function getPlayerDataFirstTime(name) {
  let start = Date.now()
  let playerData = {};
  try {
    var uuid = (await axios.get("https://api.mojang.com/users/profiles/minecraft/" + name)).data.id; //get uuid from mojang
    playerData.uuid = uuid;
  } catch (err) {
    return false;
  }
  try {
    var playerAPI = (await reqScheduler.get(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${uuid}`, 0)).data.player; // /player api request
  } catch (err) {
    console.log("err getting /player api endpoint")
  }
  playerData.name = playerAPI.displayname;
  playerData.color = playerAPI.monthlyRankColor;
  playerData.plus = playerAPI.rankPlusColor ? playerAPI.rankPlusColor.replace("DARK_",""): "";
  playerData.rank = playerAPI.newPackageRank
  if (playerAPI.rank) {
    playerData.rank = playerAPI.rank;
    if (playerData.rank == "YOUTUBER") {
      playerData.color = "var(--red)";
      playerData.rank = "YOUTUBE"
    } else if (playerData.rank == "MODERATOR") {
      playerData.color = "var(--green)";
      playerData.rank = "MOD";
    } else if (playerData.rank == "HELPER") {
      playerData.color = "var(--cyan)"
    } else if (playerData.rank == "ADMIN") {
      playerData.color = "var(--red)"
    }
  } else if (playerAPI.monthlyPackageRank != "NONE") {
    playerData.rank = "MVP_PLUS_PLUS";
    playerData.color = "GOLD";
  }
  //get achievement data
  playerData.achievements = Object.keys(playerAPI.achievements).filter(x => x.includes("skyblock_")).reduce((t,x) => {t[x] = playerAPI.achievements[x]; return t },{});

  let profiles = playerAPI.stats.SkyBlock.profiles
  let profilesArr = Object.keys(profiles).reduce((o,x) => o.concat(profiles[x]), []); //make into array of {profile_id, cute_name} objects

  playerData.profiles = {};
  for (let profile of profilesArr) {
    playerData.profiles[profile.profile_id] = await getProfileData(uuid, profile);
  }
  console.log(`Got player data in ${(Date.now() - start) / 1000} seconds`)
  return playerData;
}

async function getInventoryJSON(contents) {
  let output = [];
  for (let j = 0; j < contents.length; j++) {
    let item = contents[j];
    try {
      if (item.tag) {
        var mcItem = minecraftItems.get(item.id + ":" + item.Damage);
        if (!mcItem) {
          mcItem = minecraftItems.get(item.id);
        }
        let out = {
          name: item.tag.display.Name,
          lore: item.tag.display.Lore,
          id: item.tag.ExtraAttributes ? item.tag.ExtraAttributes.id : "NULL",
          icon: mcItem ? "data:image/png;base64," + mcItem.icon : "",
          count: item.Count
        } 
        if (item.tag.SkullOwner) {
          out.icon = `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url}&i=0`; //provide icon for fallback
          out.faces = {
            face: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url}&i=0`,
            side: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url}&i=1`,
            top: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url}&i=2`
          }
        }
        if(mcItem && mcItem.name && mcItem.name.includes("Leather") && item.tag.ExtraAttributes.color) {
          out.icon = `/img/item?item=${mcItem.name.toLowerCase().replace(" ","_").replace("tunic","chestplate").replace("pants","leggings")}&color=${JSON.stringify(item.tag.ExtraAttributes.color.split(":"))}`
        }
        if (out.name.includes("Backpack")) {
          let bpBuffer = Buffer.from(item.tag.ExtraAttributes[item.tag.ExtraAttributes.id.toLowerCase() + "_data"]);
          let bp = await util.nbtBufToJson(bpBuffer);
          out.contents = await getInventoryJSON(bp.i);
        }
        output[j] = out;
      } else {
        output[j] = {};
      }
    } catch (err) {
      console.log("item caused error:", item,mcItem,err)
    }
  };
  return output;
}
async function getProfileData(uuid, profile) {
  try {
    var profileAPI = (await reqScheduler.get(`https://api.hypixel.net/skyblock/profile?key=${process.env.API_KEY}&profile=${profile.profile_id}`)).data.profile;
  } catch (err) {
    console.log("err getting /skyblock/profile endpoint")
  }
  let profileData = {};
  //get basic info
  profileData.id = profile.profile_id;
  profileData.cute_name = profile.cute_name
  profileData.members = Object.keys(profileAPI.members);
  profileData.last_save = profileAPI.members[uuid].last_save

  //get coin purse / bank
  if (profileAPI.banking) {
    profileData.balance = profileAPI.banking.balance;
  }
  profileData.purse = profileAPI.members[uuid].coin_purse ? profileAPI.members[uuid].coin_purse : 0;

  //get slayer
  if (profileAPI.members[uuid].slayer_bosses) {
    profileData.slayer = {};
    Object.keys(profileAPI.members[uuid].slayer_bosses).forEach((boss) => {
      profileData.slayer[boss] = {
        xp: profileAPI.members[uuid].slayer_bosses[boss].xp ? profileAPI.members[uuid].slayer_bosses[boss].xp : 0,
        boss_kills: {
          tier1: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_0 ? profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_0 : 0,
          tier2: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_1 ? profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_1 : 0,
          tier3: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_2 ? profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_2 : 0,
          tier4: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_3 ? profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_3 : 0,
        }
      }
    })
  }

  //get skills
  profileData.skills = {};
  Object.keys(profileAPI.members[uuid]).filter(x => x.includes("experience_skill_")).forEach(skill => {
    profileData.skills[skill.slice(17)] = profileAPI.members[uuid][skill]
  })


  //get fairy souls
  profileData.fairy_souls = profileAPI.members[uuid].fairy_souls_collected

  //get inventories
  profileData.inventories = [];
  let invNames = ["inv_contents","ender_chest_contents","wardrobe_contents","quiver","potion_bag","talisman_bag","fishing_bag","candy_inventory_contents","inv_armor"];
  let invCleanNames = ["Inventory", "Ender Chest", "Wardrobe","Quiver","Potion Bag", "Talisman Bag","Fishing Bag","Candy Bag"];
  for (let i = 0; i<invNames.length; i++) { //for each inventory name
    let label = invNames[i];
    if (profileAPI.members[uuid][label]) {
      let inventory = {
        name: label,
        clean_name: invCleanNames[i],
        contents: (await util.nbtToJson(profileAPI.members[uuid][label].data)).i
      } //represent the inventory
      inventory.contents = await getInventoryJSON(inventory.contents)
      profileData.inventories.push(inventory);
    }
  }

  //get pets
  profileData.pets = profileAPI.members[uuid].pets;
  return profileData
}

//server go listen

http.listen(port, () => {
  console.log('listening...');
})
app.get("/api/data/:player/", async (req,res) => {
  res.json(await getPlayerDataFirstTime(req.params.player))
})
app.get("/api/exists/:player", async (req,res) => {
  try {
    let uuid = (await axios.get("https://api.mojang.com/users/profiles/minecraft/" + req.params.player)).data.id; //get uuid from mojang
    if (!uuid) {
      res.send(false);
    } else {
      res.send(true);
    }
  } catch (err) {
    console.log(err)
    res.send(false);
  }
})

/* Stats API */
app.get("/stats/:player", (req,res) => {
  res.sendFile(__dirname + "/public/stats.html");
})
app.get("/stats/:player/:profile", (req,res) => {
  res.sendFile(__dirname + "/public/stats.html");
})

/* Images API */
app.get("/img/head", async (req,res) => {
  let img = await util.getSkinFace(req.query.skin,req.query.i);
  res.writeHead(200, {
     'Content-Type': 'image/png',
     'Content-Length': img.length
   });
   res.end(img);
})

app.get("/img/item", async (req,res) => {
  let color = JSON.parse(req.query.color).map(x => Number(x))
  let img = await util.getColoredItem(req.query.item, color);
  res.writeHead(200, {
     'Content-Type': 'image/png',
     'Content-Length': img.length
   });
  res.end(img);
})

/* Normal Routes */
app.get("/", (req,res) => {
  res.sendFile(__dirname + "/public/index.html");
})
app.use((req, res) => {
    res.sendFile(__dirname + "/public" + req.url);
})



/*
nbt.parse(Buffer.from(data, "base64"), (err,data) => {
  if(err) {
    console.log(err);
    return
  }
  jsonData = nbt.simplify(data)
  console.log(jsonData.i[3].tag.SkullOwner.Properties.textures[0].Value);
  console.log(util)
  console.log(util.nbtToImageUrl(jsonData.i[3]))
})
*/