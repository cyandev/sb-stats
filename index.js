//gracefulfs to stop some EMFILE errors
var realFs = require('fs')
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(realFs)

const helmet = require("helmet")
const express = require("express");
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var port = process.env.PORT || 8080;

app.use(helmet());
app.use(bodyParser.urlencoded()); 

let axios = require("axios")
const minecraftItems = require('minecraft-items')

let util = require("./util.js");
const constants = require("./const.js");
let reqScheduler = new (require("./requestScheduler.js").RequestScheduler)(500) //make a 500ms delay between requests to always be at the 120 reqs/min rate limit

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.bjpjk.mongodb.net/SBStatsDB?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true});
var playersCollection;
client.connect().then((connection) => {
  playersCollection = connection.db("SBStatsDB").collection("Players");
});

async function getPlayerData(name,priority=0,uuid) {
  let start = Date.now()
  let playerData = {lastUpdated: start};
  if (name && !uuid) {
    try {
      uuid = (await axios.get("https://api.mojang.com/users/profiles/minecraft/" + name)).data.id; //get uuid from mojang
    } catch (err) {
      return false;
    }
    if (!uuid) { //catch no uuid
      return false;
    }
  }
  try {
    var playerAPI = (await reqScheduler.get(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${uuid}`, priority)).data.player; // /player api request
  } catch (err) {
    console.log("err getting /player api endpoint");
    return false;
  }
  //catch lack of player api
  if (!playerAPI || !playerAPI.stats || !playerAPI.stats.SkyBlock) {
    console.log(playerAPI);
    return false;
  }
  playerData.uuid = playerAPI.uuid;
  playerData.name = playerAPI.displayname;
  playerData.nameLower = playerData.name.toLowerCase();
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
  } else if (playerAPI.monthlyPackageRank && playerAPI.monthlyPackageRank != "NONE") {
    playerData.rank = "MVP_PLUS_PLUS";
    playerData.color = "var(--yellow)";
  } else {
    if (playerData.rank == "VIP" || playerData.rank == "VIP_PLUS") {
      playerData.color ="var(--green)";
    } else if (playerData.rank == "MVP" || playerData.rank == "MVP_PLUS") {
      playerData.color = "var(--cyan)"
    } 
  }
  //get achievement data
  playerData.achievements = Object.keys(playerAPI.achievements).filter(x => x.includes("skyblock_")).reduce((t,x) => {t[x] = playerAPI.achievements[x]; return t },{});
  let profiles = playerAPI.stats.SkyBlock.profiles
  let profilesArr = Object.keys(profiles).reduce((o,x) => o.concat(profiles[x]), []); //make into array of {profile_id, cute_name} objects

  playerData.profiles = {};
  playerData.currentProfile = null;
  let lastUpdated = 0;
  for (let profile of profilesArr) {
    playerData.profiles[profile.profile_id] = await getProfileData(uuid, profile, playerData, priority);
    if (playerData.profiles[profile.profile_id].last_save > lastUpdated) {
      playerData.currentProfile = profile.profile_id;
      lastUpdated = playerData.profiles[profile.profile_id].last_save;
    }
  }
  console.log(`Got player data in ${(Date.now() - start) / 1000} seconds`);
  playersCollection.replaceOne({name: playerData.name},playerData,{upsert: true}); //add it to / update database
  return playerData;
}

/*
Inventory Item:
{
  name,
  lore,
  id (opt),
  icon (opt),
  count, 
  faces (opt),
  rarity (opt, req'd soon)
}
inventory contents is arr of Inventory Items
*/
async function getInventoryJSON(contents,profileData) {
  let output = [];
  for (let j = 0; j < contents.length; j++) {
    let item = contents[j];
    try {
      if (item.tag) {
        var mcItem = minecraftItems.get(item.id + ":" + item.Damage);
        if (!mcItem) {
          mcItem = minecraftItems.get(item.id);
        }
        var out = {
          name: item.tag.display ? item.tag.display.Name : "",
          lore: item.tag.display ? item.tag.display.Lore : [],
          id: item.tag.ExtraAttributes ? item.tag.ExtraAttributes.id : "NULL",
          reforge: item.tag.ExtraAttributes ? item.tag.ExtraAttributes.modifier : "none",
          count: item.Count,
          inventoryClass: "icon-" + item.id + "_" + item.Damage,
          tags: []
        }
        if (item.tag.ExtraAttributes && item.tag.ExtraAttributes.item_durability) {
          out.inventoryClass = "icon-" + mcItem.id.replace(":","_")
        }
        //add rarity to the item
        let rarityMap = {
          "§f": "COMMON",
          "§a": "UNCOMMON",
          "§9": "RARE",
          "§5": "EPIC",
          "§6": "LEGENDARY",
          "§d": "MYTHIC",
          "§c": "SPECIAL"
        }
        if (out.lore && out.lore.length > 0) {
          Object.keys(rarityMap).forEach(code => {
            if (out.lore[out.lore.length - 1].indexOf(code) == 0) {
              out.rarity = rarityMap[code];
            }
          })
        }
        //add dungeon tag
        if (out.lore && out.lore.length > 0 && out.lore[out.lore.length - 1].includes("DUNGEON")) {
          out.tags.push("DUNGEON");
        }
        if (out.lore && out.lore.length > 0 && (out.lore[out.lore.length - 1].includes("SWORD") || out.lore[out.lore.length - 1].includes("BOW"))) {
          out.tags.push("WEAPON");
          out.enchantments = item.tag.ExtraAttributes.enchantments;
        }
        //add stats / cata level
        let statNames = {
          "Damage": "dmg", 
          "Strength": "str",
          "Crit Chance": "cc",
          "Crit Damage": "cd", 
          "Bonus Attack Speed": "as", 
          "Health": "hp", 
          "Defense": "def", 
          "Speed": "spd", 
          "Intelligence": "int", 
          "True Defense": "td", 
          "Sea Creature Chance": "scc"
        }
        out.stats = {}; //stats w/ reforges
        out.baseStats = {}; //stats w/o reforges
        if (out.lore && out.lore.length > 0) {
          Object.keys(statNames).forEach((stat) => {
            out.lore.forEach((loreLine) => {
              loreLine = loreLine.split(/§./).join(""); //strip formatting
              let match = loreLine.match(RegExp( stat + String.raw`: ([+-\d\.]+)( HP|\%)?(?: \(\w+ ([+-\d\.]+)\2\) *)?(?: \([+-\d\.]+\2\) *)?(?:\(([+-\d\.]+)\2?\))?`)); //match with crazy regexp
              if (match) {
                if (match.index != 0) return; //make sure a match includes the start of the string so "Bonus Attack Speed" doesnt trigger "Speed"
                out.stats[statNames[stat]] = Number(match[1]); //the non-dungeon stat
                out.baseStats[statNames[stat]] = Number(match[1]) - (match[3] ? Number(match[3]) : 0)
                if (match[4] && !profileData.skills.catacombs && out.tags.includes("DUNGEON")) {
                  profileData.skills.catacombs = Math.round((Number(match[4]) / Number(match[1]) - (out.name.split("✪").length - 1) * 0.1 - 1) * 100); //catacombs skill xp bonus = green text / gray text - stars * 0.1 - 1
                }
              }
            })
          })
        }
        //item specific stats
        if (out.id == "DAY_CRYSTAL" || out.id == "NIGHT_CRYSTAL") {
          out.stats.str += 2.5;
          out.stats.def += 2.5;
          out.baseStats.str += 2.5;
          out.baseStats.def += 2.5;
        }
        if (out.id == "GRAVITY_TALISMAN") {
          out.stats.str += 10;
          out.stats.def += 10;
          out.baseStats.str += 10;
          out.baseStats.def += 10;
        }
        //check if player head, if so get the skin
        if (item.tag.SkullOwner) {
          out.faces = {
            face: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url}&i=0`,
            side: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url}&i=1`,
            top: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url}&i=2`
          }
        }

        //check if leather, if so, set the icon to a leather icon
        if(mcItem && mcItem.name && mcItem.name.includes("Leather") && item.tag.ExtraAttributes.color) {
          out.icon =  `/img/item?item=${mcItem.name.toLowerCase().replace(" ","_").replace("tunic","chestplate").replace("pants","leggings")}&color=${encodeURIComponent(JSON.stringify(item.tag.ExtraAttributes.color.split(":")))}`
        }

        //check if backpack with contents, if so, add the contents
        if (out.name.includes("Backpack") && item.tag.ExtraAttributes[item.tag.ExtraAttributes.id.toLowerCase() + "_data"]) {
          let bpBuffer = Buffer.from(item.tag.ExtraAttributes[item.tag.ExtraAttributes.id.toLowerCase() + "_data"]);
          let bp = await util.nbtBufToJson(bpBuffer);
          out.contents = await getInventoryJSON(bp.i,profileData);
        }

        output[j] = out;

        //check if unique accessory, if so, add to talis
        if (out.lore && out.lore.length > 0 && out.lore[out.lore.length - 1].includes("CCESSORY") && !profileData.talis[out.id]) { //ccessory instead of accessory because of crab hat
          profileData.talis[out.id] = out;
        }
        //check if defuse kit
        if (out.id == "DEFUSE_KIT") {
          let trapsDefused = out.lore[5].slice(19);
          let kitInt = 0;
          if (trapsDefused >= 1) {kitInt  = 1};
          if (trapsDefused >= 5) {kitInt = 2};
          if (trapsDefused >= 10) {kitInt = 3};
          if (trapsDefused >= 15) {kitInt = 4};
          if (trapsDefused >= 20) {kitInt = 5};
          if (trapsDefused >= 25) {kitInt = 6};
          if (trapsDefused >= 30) {kitInt = 7};
          if (trapsDefused >= 35) {kitInt = 8};
          if (trapsDefused >= 40) {kitInt = 9};
          if (trapsDefused >= 45) {kitInt = 10};
          if (!profileData.defuseKitInt || kitInt > profileData.defuseKitInt) {
            profileData.defuseKitInt = kitInt;
          }
        }
        //check for weapon tag, if so, add to weapons
        if (out.tags.includes("WEAPON")) {
          profileData.weapons.push(out);
        }
      } else {
        output[j] = {};
      }
    } catch (err) {
      console.log("item caused error:",item,mcItem,out,err)
    }
  };
  return output;
}

async function getProfileData(uuid, profile, playerData, priority) {
  try {
    var profileAPI = (await reqScheduler.get(`https://api.hypixel.net/skyblock/profile?key=${process.env.API_KEY}&profile=${profile.profile_id}`,priority)).data.profile;
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
    profileData.slayerXp = 0;
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
      profileData.slayerXp += profileData.slayer[boss].xp
    })

    //should be integrated into above loop, copied from client
    for (let slayer in profileData.slayer) {
      //get level and xpRemaining
      let xpRemaining = profileData.slayer[slayer].xp;
      let level = 0;
      let table = slayer == "wolf" ? constants.xp_table_slayer_wolf :  constants.xp_table_slayer;
      for (let i = 0; i < table.length && xpRemaining >= table[i]; i++) {
        xpRemaining -= table[i];
        level = i;
      }
      profileData.slayer[slayer].level = level;
      profileData.slayer[slayer].xpRemaining = xpRemaining;
      profileData.slayer[slayer].maxLevel = table.length - 1;
      profileData.slayer[slayer].nextLevel = table[level + 1];
    }
  }

  //get fairy souls
  profileData.fairy_souls = profileAPI.members[uuid].fairy_souls_collected

  //pre-define skills
  profileData.skills = {};

  //setup combat "inventories" to find talismans, weapons, and armor
  profileData.talis = {};
  profileData.weapons = [{
    stats: {"dmg":5},
    lore: ["Your Fist!"],
    name: "None",
    rarity: "SPECIAL",
    inventoryClass: "icon-166_0"
    }];
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
      inventory.contents = await getInventoryJSON(inventory.contents,profileData)
      profileData.inventories.push(inventory);
    }
  }

  //get skills (needs to be rewritten. some code moved from client -> server)
  Object.keys(profileAPI.members[uuid]).filter(x => x.includes("experience_skill_")).forEach(skill => {
    profileData.skills[skill.slice(17)] = profileAPI.members[uuid][skill]
  })
  if (!profileData.skills.combat) {
    constants.skillNames.forEach(skillName => {
      let xp = 0;
      for (let i = 0; i <= playerData.achievements["skyblock_" + constants.skillNamesToAchievements[skillName]]; i++) {
        xp+= constants.xp_table[i];
      }
      profileData.skills[skillName] = xp;
    })
  }
  let skills = [];
  Object.keys(profileData.skills).forEach((skillName) => {
    let xpRemaining = profileData.skills[skillName];
    let level = 0;
    let table = skillName == "runecrafting" ? constants.xp_table_runecrafting : skillName == "catacombs" ? constants.xp_table_catacombs: constants.xp_table;
    for (let i = 0; i < table.length && xpRemaining >= table[i]; i++) {
      xpRemaining -= table[i];
      level = i;
    }
    skills.push({
      name: skillName,
      levelPure: level,
      levelProgress: level + (table[level+1] ? xpRemaining / table[level+1] : 0),
      xpRemaining: xpRemaining,
      progress: (xpRemaining / table[level+1]),
      maxLevel: table.length - 1,
      nextLevel: table[level + 1]
    })
  })
  
  //sort skills into skylea order
  let skillOrderer = {
    "taming": 10,
    "farming": 9,
    "mining": 8,
    "combat": 7,
    "foraging": 6,
    "fishing": 5,
    "enchanting": 4,
    "alchemy": 3,
    "carpentry": 2,
    "runecrafting": 1,
    "catacombs": 0
  }
  skills.sort((a,b) => skillOrderer[b.name] - skillOrderer[a.name])
  profileData.skills = skills;

  let filteredSkills = profileData.skills.filter(x => !constants.excludedSkills.includes(x.name));

  profileData.averageSkillProgress = (filteredSkills.reduce((t,x) => t+x.levelProgress,0) / filteredSkills.length).toFixed(2);
  profileData.averageSkillPure = (filteredSkills.reduce((t,x) => t+x.levelPure,0) / filteredSkills.length).toFixed(2);

  //get pets
  profileData.pets = profileAPI.members[uuid].pets;
  //sort pets + make pets into inventory contents
  if (profileData.pets) {
    // make into inventory
    profileData.pets = profileData.pets.map((pet) => {
      let out = {
        lore: [
          `§8${constants.pets[pet.type].type[0].toUpperCase() + constants.pets[pet.type].type.slice(1)} Pet`,
          "",
          `LEVEL INFO PLACEHOLDER`,
          "",
          `§aCandy Used: ${pet.candyUsed} / 10`,
          "",
          `§6Held Item: ${pet.heldItem ? constants.petItems[pet.heldItem].name : "None"}`,
          pet.heldItem ? constants.petItems[pet.heldItem].description : "",
          "",
          `§r${pet.tier[0] + pet.tier.slice(1).toLowerCase()} Pet`
        ],
        id: "NULL",
        faces: {
          face: `/img/head?skin=${constants.pets[pet.type].skin}&i=${0}`,
          side: `/img/head?skin=${constants.pets[pet.type].skin}&i=${1}`,
          top: `/img/head?skin=${constants.pets[pet.type].skin}&i=${2}`
        },
        count: 1,
        rarity: pet.tier,
        active: pet.active
      }
      //get the pet's level
      let remainingXp = pet.exp;
      let level;
      for (level = 1; level < 100 && remainingXp >= constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]]; level++) {
        remainingXp -= constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]];
      }
      //finish making item
      if (out.lore[7] == "") { //remove held item description if there is none
        out.lore.splice(7,1);
      }
      out.level = level;
      out.remainingXp = out.remainingXp;
      out.name = `§r[LVL ${level}] ${pet.type.split("_").map(x => x[0] + x.slice(1).toLowerCase()).join(" ")}`;
      out.lore[2] = level != 100 ? `§r${(remainingXp / constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]] * 100).toFixed(2)}% to LVL ${level+1}` : "§bMAX LEVEL";
      return out;
    })
    let rarities = {
      COMMON: 0,
      UNCOMMON: 1,
      RARE: 2,
      EPIC: 3,
      LEGENDARY: 4,
      MYTHIC: 5,
    }
    profileData.pets.sort((a,b) => {
      if (b.active - a.active != 0) {
        return b.active - a.active;
      } else if (rarities[b.rarity] - rarities[a.rarity] != 0) {
        return rarities[b.rarity] - rarities[a.rarity];
      } else if (b.level - a.level != 0) {
        return b.level - a.level;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  } else {
    profileData.pets = [];
  }

  //get static stats: unchanging ones like the ones from slayer, skills, fairy souls, etc.
  profileData.staticStats = {};

  //base stats
  profileData.staticStats.base = {
    cc: 30,
    cd: 50,
    int: 0,
  }
  //apply melody's hair under "base stats"
  if (profileData.talis["MELODY_HAIR"]) {
    profileData.staticStats.base.int += 26;
  }
  //apply defuse kit int under "base stats"
  if (profileData.defuseKitInt) {
    profileData.staticStats.base.int += profileData.defuseKitInt;
  }
  
  //fairy soul static stats
  profileData.staticStats.fairy_souls = {
    str: 0,
  }
  for (let i = 0; i < Math.floor(profileData.fairy_souls / 5); i++){
      profileData.staticStats.fairy_souls.str += (i + 1) % 5 == 0 ? 2 : 1;
  }

  //skills static stats
  profileData.staticStats.skills = {
    str: 0,
    cc: 0,
    int: 0
  }
  profileData.skills.forEach(skill => {
    if (skill.name in constants.skillStats) {
      for (let i = 0; i <= skill.levelPure; i++) {
        profileData.staticStats.skills[constants.skillStats[skill.name].stat] += constants.skillStats[skill.name].table[i]
      }
    }
  })

  //slayers static stats
  profileData.staticStats.slayer = {
    cd: 0,
    cc: 0
  };
  for (let slayer in profileData.slayer) {
    for (let stat in constants.slayerStats[slayer]) {
      profileData.staticStats.slayer[stat] += constants.slayerStats[slayer][stat][profileData.slayer[slayer].level]
    }
  }
  return profileData
}

async function getGuildData(guildname) {
  let guildData = {};
  let guildApi = (await reqScheduler.get(`https://api.hypixel.net/guild?key=${process.env.API_KEY}&name=${guildname}`, 0)).data;
  if (!guildApi.success) return false;
  //get name, tag, and tagcolor
  guildData.name = guildApi.guild.name;

  guildData.tag = {}
  guildData.tag.text = guildApi.tag
  guildData.tag.color = guildApi.tagColor
  let playerDataArr = await Promise.all(guildApi.guild.members.map(async x => await playersCollection.findOne({uuid: x.uuid})))
  guildData.members = playerDataArr.map((x,i) => {
    if (x) {
      let profile = x.profiles[x.currentProfile];
      return {
        name: x.name,
        slayer: profile.slayerXp,
        averageSkill: Number(profile.averageSkillProgress)
      }
    } else {
      guildData.incomplete = true;
      getPlayerData(null, 1, guildApi.guild.members[i].uuid);
    }
  })
  
  guildData.averageSkillLevel = (guildData.members.reduce((t,x) => t+x.averageSkill, 0) / guildData.members.length).toFixed(2);
  guildData.averageSlayer = (guildData.members.reduce((t,x) => t+x.slayer, 0) / guildData.members.length).toFixed(2);

  return guildData;
}


/* Stats API */
app.get("/api/data/:player", async (req,res) => {
  let playerData = await playersCollection.findOne({nameLower: req.params.player.toLowerCase()});
  if (!playerData || playerData.lastUpdated + 1000 * 120 < Date.now()) { //re-get more than 120 second old profiles
    console.log("updating data in db")
    playerData = await getPlayerData(req.params.player);
  } else {
    console.log("sending data from db")
  }
  res.json(playerData);
});

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
});

app.get("/api/guild/:guildname",async (req,res) => {
  res.json(await getGuildData(req.params.guildname));
});

app.get("/api/dbinfo", async (req,res) => {
  let players = await playersCollection.find({}).toArray();
  res.json({
    players: players.length,
    names: players.map(x => x.name),
    uuids: players.map(x => x.uuid)
  })
})
/* Stats Routes */
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

//server go listen

http.listen(port, () => {
  console.log('listening...');
})