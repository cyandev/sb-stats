const express = require("express");
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var port = 8080
app.use(bodyParser.urlencoded()); 

let axios = require("axios")

let util = require("./util.js");
let playerDB = require("./playerDB.js")
let reqScheduler = new (require("./requestScheduler.js").RequestScheduler)(500) //make a 500ms delay between requests to always be at the 120 reqs/min rate limit

async function getPlayerDataFirstTime(name) {
  let playerData = {};
  playerData.name = name;
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
  playerData.color = playerAPI.monthlyRankColor;
  playerData.plus = playerAPI.rankPlusColor.replace("DARK_","");
  playerData.rank = playerAPI.newPackageRank
  if (playerAPI.monthlyPackageRank != "NONE") {
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
  return playerData;
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

  //get armor
  profileData.armor = await util.nbtToJson(profileAPI.members[uuid].inv_armor.data).i //this doesnt require inventory apis

  //get inventories
  profileData.inventories = [];
  if (profileAPI.members[uuid].inv_contents) {
    let invNames = ["inv_contents","ender_chest_contents","wardrobe_contents","quiver","potion_bag","talisman_bag","fishing_bag","candy_inventory_contents"];
    let invCleanNames = ["Inventory", "Ender Chest", "Wardrobe","Quiver","Potion Bag", "Talisman Bag","Fishing Bag","Candy Bag"];
    invNames.forEach(async (label,i) => {
      profileData.inventories.push({
        name: label,
        clean_name: invCleanNames[i],
        contents: (await util.nbtToJson(profileAPI.members[uuid][label].data)).i
      })
    })
  }

  //get pets
  profileData.pets = profileAPI.members[uuid].pets
  return profileData
}

/*
(async () => {
  console.log((await reqScheduler.get("https://api.hypixel.net/player?key=27b8152d-094c-4fab-8f19-cc166f856faf&uuid=10df0a301952481884f3d1cd60c403d7",0)).headers)
  for (let i = 0; i < 300; i++) {
    reqScheduler.get("https://api.hypixel.net/player?key=27b8152d-094c-4fab-8f19-cc166f856faf&uuid=10df0a301952481884f3d1cd60c403d7",0).then((resp) => {
      console.log(reqScheduler.reqsRemaining, resp.headers["ratelimit-reset"], reqScheduler.extraRequests);
    })
  }
})();
*/



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
app.get("/stats/:player", (req,res) => {
  res.sendFile(__dirname + "/public/stats.html");
})
app.get("/stats/:player/:profile", (req,res) => {
  res.sendFile(__dirname + "/public/stats.html");
})
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