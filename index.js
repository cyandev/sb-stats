//gracefulfs to stop some EMFILE errors
var realFs = require('fs')
var gracefulFs = require('graceful-fs')
gracefulFs.gracefulify(realFs)
var zlib = require("zlib")
const helmet = require("helmet")
const express = require("express");
var ejs = require("ejs");
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var port = process.env.PORT || 8080;

app.use(helmet());
app.use(bodyParser.urlencoded());
app.set('view engine', 'ejs');
app.engine('ejs', (path, data, cb) => {
  ejs.renderFile(path, data, {}, cb);
});

let axios = require("axios")
const minecraftItems = require('minecraft-items')

let util = require("./util.js");
const constants = require("./const.js");
let reqScheduler = new (require("./requestScheduler.js").RequestScheduler)(500) //make a 500ms delay between requests to always be at the 120 reqs/min rate limit

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.bjpjk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true});
var playersCollection;
var guildsCollection;
client.connect().then((connection) => {
  playersCollection = connection.db(process.env.DB_NAME).collection("Players");
  guildsCollection = connection.db(process.env.DB_NAME).collection("Guilds");
  
  prunePlayers();
  pruneGuilds();
  refreshOldestPlayers();
  require("./discordBot.js")(getPlayerData);
});

var bazaarData;
(async () => {
  bazaarData = await getBazaarData();
  setInterval(async () => bazaarData = await getBazaarData(), 1000 * 60 * 60);
})();

var auctionData;
(async () => {
  auctionData = await getAuctionData();
  setInterval(async () => auctionData = await getAuctionData(), 1000 * 60 * 60);
})();

async function getPlayerData(name,userRequested,priority=0,uuid,log=true) {
  //check if there is recent data in the DB, if there is return it
  let playerData = await playersCollection.findOne({nameLower: name ? name.toLowerCase() : ""});
  if (playerData && playerData.lastUpdated > Date.now() - 1000 * 60 * 5) {
    console.log("got player data from db")
    for (let profileid in playerData.profiles) {
        playerData.profiles[profileid] = JSON.parse(zlib.inflateSync(Buffer.from(playerData.profiles[profileid],"base64")).toString());
    }
    return playerData;
  }
  
  let start = Date.now();

  playerData = {lastUpdated: start};

  /*
  Keep track of user-requested (or internal guild tracking requested) players so we can delete those who never get reqests from db
  */
  if (!userRequested) {
    let previous = playersCollection.findOne({uuid: uuid});
    if (previous) {
      playerData.lastRequested = previous.lastRequested || Date.now();
    } else {
      playerData.lastRequested = Date.now();
    }
  } else {
    playerData.lastRequested = Date.now();
  }

  if (name && !uuid) {
    try {
      uuid = (await axios.get("https://api.mojang.com/users/profiles/minecraft/" + name)).data.id; //get uuid from mojang
    } catch (err) {
      console.log(err)
      return false;
    }
    if (!uuid) { //no uuid
      return false;
    }
  }

  try {
    var playerAPI = (await reqScheduler.getFirst(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${uuid}`, priority)).data.player; // /player api request
  } catch (err) {
    console.log("err getting /player api endpoint");
    return false;
  }
  //catch lack of player api
  if (!playerAPI || !playerAPI.stats || !playerAPI.stats.SkyBlock) {
    console.log("player failed with name + uuid", name, uuid);
    console.log(playerAPI);
    return false;
  }
  //try to get the guild
  try {
    var guildApi = (await reqScheduler.getFirst(`https://api.hypixel.net/guild?key=${process.env.API_KEY}&player=${uuid}`, priority)).data;
    playerData.guild = guildApi.guild.name;
  } catch (err) {
    //move on
  }

  //get general hypixel info for player
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

  //get skyblock achievement data for player
  playerData.achievements = Object.keys(playerAPI.achievements).filter(x => x.includes("skyblock_")).reduce((t,x) => {t[x] = playerAPI.achievements[x]; return t },{});


  //get sb profiles for player
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

  if (playerData.profiles[playerData.currentProfile]) playerData.weight = playerData.profiles[playerData.currentProfile].weight;

  if (log) console.log(`Got player data in ${(Date.now() - start) / 1000} seconds`);


  //copy player data + compress profiles
  let compressedPlayerData = JSON.parse(JSON.stringify(playerData))
  for (let profileid in compressedPlayerData.profiles) {
    compressedPlayerData.profiles[profileid] = zlib.deflateSync(Buffer.from(JSON.stringify(compressedPlayerData.profiles[profileid]))).toString("base64")
  }
  playersCollection.replaceOne({uuid: playerData.uuid},compressedPlayerData,{upsert: true}); //add new compressed data to db
  return playerData;
}

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
        //add dungeon tag / stars
        if (out.lore && out.lore.length > 0 && out.lore[out.lore.length - 1].includes("DUNGEON")) {
          out.tags.push("DUNGEON");
          out.stars = (out.name.split("✪").length - 1);
        }
        if (out.lore && out.lore.length > 0) {
          if (out.lore[out.lore.length - 1].includes("BOW")) {
            out.tags.push("BOW");
            out.tags.push("WEAPON");
            out.enchantments = item.tag.ExtraAttributes.enchantments;
          } else if (out.lore[out.lore.length - 1].includes("SWORD")) {
            out.tags.push("SWORD");
            out.tags.push("WEAPON");
            out.enchantments = item.tag.ExtraAttributes.enchantments;
          }
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
          "Sea Creature Chance": "scc",
          "Ferocity": "fer"
        }
        out.stats = {}; //stats w/ reforges
        out.baseStats = {}; //stats w/o reforges
        if (out.lore && out.lore.length > 0) {
          Object.keys(statNames).forEach((stat) => {
            out.lore.forEach((loreLine) => {
              loreLine = loreLine.split(/§./).join(""); //strip formatting
              let match = loreLine.match(RegExp( stat + String.raw`: ([+-\d\.]+)( HP|\%)?(?: \(\w+ ([+-\d\.]+)\2\) *)?(?: \([+-\d\.]+\2\) *)?(?:\(([+-\d\.]+)\2?\))?`)); //match with crazy regexp !!!SIMPLIFLY THIS, WE DONT CARE ABOUT THE DUNGEON STATS LISTED HERE ANYMORE!!!
              if (match) {
                if (match.index != 0) return; //make sure a match includes the start of the string so "Bonus Attack Speed" doesnt trigger "Speed"
                out.stats[statNames[stat]] = Number(match[1]); //the non-dungeon stat
                out.baseStats[statNames[stat]] = Number(match[1]) - (match[3] ? Number(match[3]) : 0);
                
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
            face: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url.split("/")[4]}&i=0`,
            side: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url.split("/")[4]}&i=1`,
            top: `/img/head?skin=${JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url.split("/")[4]}&i=2`
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
        if (Object.keys(out.stats).length == 0) {
          delete out.stats;
          delete out.baseStats;
        }
        if (out.count <= 1) {
          delete out.count
        }
        output[j] = out;

        //check if unique accessory, if so, add to talis
        if (out.lore && out.lore.length > 0 && out.lore[out.lore.length - 1].includes("CCESSORY")) { //ccessory instead of accessory because of crab hat
          let rarities = {
            COMMON: 0,
            UNCOMMON: 1,
            RARE: 2,
            EPIC: 3,
            LEGENDARY: 4,
            MYTHIC: 5,
          }
          Object.keys(constants.talismanClassifiers).forEach((filter) => {
            if (RegExp("^" + filter + "$").test(out.id)) {
              out.type = constants.talismanClassifiers[filter];
            }
          })
          if (!out.type) out.type = out.id;

          if (!profileData.talis[out.type] || rarities[out.rarity] > rarities[profileData.talis[out.type].rarity]) profileData.talis[out.type] = {
            stats: out.stats,
            baseStats: out.baseStats,
            reforge: out.reforge,
            rarity: out.rarity,
            type: out.type
          };
        } else {
          delete out.baseStats;
        }
        //check if defuse kit
        if (out.id == "DEFUSE_KIT") {
          let trapsDefused = out.lore[5] ? out.lore[5].slice(19) : 0;
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
    var profileAPI = (await reqScheduler.getFirst(`https://api.hypixel.net/skyblock/profile?key=${process.env.API_KEY}&profile=${profile.profile_id}`,priority)).data.profile;
  } catch (err) {
    console.log("err getting /skyblock/profile endpoint")
  }
  let profileData = {};

  //get basic info
  profileData.id = profile.profile_id;
  profileData.cute_name = profile.cute_name
  profileData.members = Object.keys(profileAPI.members);
  profileData.last_save = profileAPI.members[uuid].last_save
  
  //get minions
  let craftedGens = {};
  constants.minionNames.forEach((name) => {
    craftedGens[name] = Array.from({length:13}, x => 0) //use 0/1 for true/false to minify data storage
  })
  for (let uuid of Object.keys(profileAPI.members)) {
    if (profileAPI.members[uuid].crafted_generators) profileAPI.members[uuid].crafted_generators.forEach((id) => {
      let idNumSplit = id.split("_") // [ITEM_ID, TIER]
      let tier = idNumSplit.pop();
      let name = idNumSplit.join("_");
      if (!craftedGens[name]) {
        console.log(`Unknown minion name: ${name}`);
        craftedGens[name] = Array.from({length:12}, x => 0);
      }
      craftedGens[name][tier] = 1;
    })
  }

  //get missing minions + # crafted
  let missingMinions = []
  let minionsCrafted = 0;
  for (let name in craftedGens) {
    for (let tier = 1; tier <= 12; tier++) {
      if (!craftedGens[name][tier]) {
        let price;
        if (!constants.minionCrafts[name] || !constants.minionCrafts[name][tier]) {
          price = null;
        } else {
          price = (bazaarData[constants.minionCrafts[name][tier].item.replace("name", name)].quick_status.buyPrice * constants.minionCrafts[name][tier].quantity).toFixed(1);
        }
        missingMinions.push([name,tier,price])
      } else {
        minionsCrafted++;
      }
    }
  }
  let i = minionsCrafted;
  while (!constants.minionSlots[i]) {i--};
  let minionSlots = constants.minionSlots[i];

  i = 1;
  while (Object.keys(constants.minionSlots)[i] <= minionsCrafted) i++;
  let nextTier = Object.keys(constants.minionSlots)[i] - minionsCrafted;

  let bonusSlots = 0;
  let slotUpgrades = [];
  if (profileAPI.community_upgrades && profileAPI.community_upgrades.upgrade_states) slotUpgrades = profileAPI.community_upgrades.upgrade_states.filter(x => x.upgrade == "minion_slots").sort((a,b) => b.tier - a.tier);
  if (slotUpgrades[0]) bonusSlots = slotUpgrades[0].tier;
  profileData.minions = {
    matrix: craftedGens,
    uniques: minionsCrafted,
    nextTier: nextTier,
    slots: minionSlots,
    bonusSlots: bonusSlots,
    missing: missingMinions.sort((a,b) => a[2] == b[2] ? 0 : !a[2] ? 1: !b[2] ?  -1: a[2] - b[2]),
  }
  
  //get coin purse / bank
  if (profileAPI.banking) {
    profileData.balance = Number(profileAPI.banking.balance.toFixed(0));
  }
  profileData.purse = profileAPI.members[uuid].coin_purse ? Number(profileAPI.members[uuid].coin_purse.toFixed(0)) : 0;

  //get slayer
  if (profileAPI.members[uuid].slayer_bosses) {
    profileData.slayer = {};
    profileData.slayerXp = 0;
    Object.keys(profileAPI.members[uuid].slayer_bosses).forEach((boss) => {
      profileData.slayer[boss] = {
        xp: profileAPI.members[uuid].slayer_bosses[boss].xp || 0,
        boss_kills: {
          tier1: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_0 || 0,
          tier2: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_1 || 0,
          tier3: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_2 || 0,
          tier4: profileAPI.members[uuid].slayer_bosses[boss].boss_kills_tier_3 || 0,
        }
      }
      profileData.slayerXp += profileData.slayer[boss].xp
    })

    //should be integrated into above loop, copied from client
    for (let slayer in profileData.slayer) {
      let xpNext = 0;
      let level = 0;
      let table = slayer == "wolf" ? constants.xp_table_slayer_wolf :  constants.xp_table_slayer;
      for (let i = 0; i < table.length && profileData.slayer[slayer].xp >= xpNext; i++) {
        xpNext += table[i+1];
        level = i;
      }
      profileData.slayer[slayer].level = level;
      profileData.slayer[slayer].xpNext = xpNext;
      profileData.slayer[slayer].maxLevel = table.length - 1;
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
  let invNames = ["inv_contents","ender_chest_contents","wardrobe_contents","quiver","potion_bag","talisman_bag","fishing_bag","candy_inventory_contents","inv_armor","personal_vault_contents"];
  let invCleanNames = ["Inventory", "Ender Chest", "Wardrobe","Quiver","Potion Bag", "Talisman Bag","Fishing Bag","Candy Bag","Armor","Personal Vault"];
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
  if (profileData.inventories.find(x=>x.name=="inv_armor") && profileData.inventories.find(x=>x.name=="wardrobe_contents")) {
    if (profileAPI.members[uuid].wardrobe_equipped_slots != -1) {
      let armor = profileData.inventories.find(x=>x.name=="inv_armor").contents.reverse();
      let offset = Math.floor((profileAPI.members[uuid].wardrobe_equipped_slot - 1) / 9) * 9 * 3;
      for (let i = 0; i < 4; i++) {
        profileData.inventories.find(x=>x.name=="wardrobe_contents").contents[offset + profileAPI.members[uuid].wardrobe_equipped_slot - 1 + 9 * i] = armor[i];
      }
      profileData.inventories.find(x=>x.name=="inv_armor").contents.reverse()
    }
  }
  //skills (needs to be rewritten. some code moved from client -> server)
  Object.keys(profileAPI.members[uuid]).filter(x => x.includes("experience_skill_")).forEach(skill => {
    profileData.skills[skill.slice(17)] = profileAPI.members[uuid][skill]
  })

  //get dungeons skills
  if (util.checkNested(profileAPI.members[uuid],"dungeons","dungeon_types","catacombs","experience")) {
    profileData.skills.catacombs = profileAPI.members[uuid].dungeons.dungeon_types.catacombs.experience;
    profileData.dungeons = profileAPI.members[uuid].dungeons;
  }
  if (util.checkNested(profileAPI.members[uuid],"dungeons","selected_dungeon_class") && util.checkNested(profileAPI.members[uuid],"dungeons","player_classes",profileAPI.members[uuid].dungeons.selected_dungeon_class,"experience")) {
    profileData.skills[profileAPI.members[uuid].dungeons.selected_dungeon_class] = profileAPI.members[uuid].dungeons.player_classes[profileAPI.members[uuid].dungeons.selected_dungeon_class].experience;
  }

  //if skills dont exist get with achievement milestones
  if (!profileData.skills.combat) {
    constants.skillNames.forEach(skillName => {
      let xp = 0;
      for (let i = 0; i <= playerData.achievements["skyblock_" + constants.skillNamesToAchievements[skillName]]; i++) {
        xp+= constants.xp_table[i] ? constants.xp_table[i] : 0;
      }
      profileData.skills[skillName] = xp;
    })
  }
  let skills = [];
  Object.keys(profileData.skills).forEach((skillName) => {
    let xpRemaining = profileData.skills[skillName];
    let level = 0;
    let table = skillName == "runecrafting" ? constants.xp_table_runecrafting : ["farming", "enchanting", "mining", "combat"].includes(skillName) ? constants.xp_table_60 : ["catacombs","mage","healer","archer","berserk","tank"].includes(skillName) ? constants.xp_table_catacombs: constants.xp_table;
    for (let i = 0; i < table.length && xpRemaining >= table[i]; i++) {
      xpRemaining -= table[i];
      level = i;
    }
    skills.push({
      name: skillName,
      levelPure: level,
      xp: profileData.skills[skillName],
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
    "catacombs": 0,
    "healer": -1,
    "mage": -1,
    "berserk": -1,
    "archer": -1,
    "tank": -1,
  }
  skills.sort((a,b) => skillOrderer[b.name] - skillOrderer[a.name])
  profileData.skills = skills;

  let filteredSkills = profileData.skills.filter(x => !constants.excludedSkills.includes(x.name));

  profileData.averageSkillProgress = (filteredSkills.reduce((t,x) => t+x.levelProgress,0) / filteredSkills.length).toFixed(2);
  profileData.averageSkillPure = (filteredSkills.reduce((t,x) => t+x.levelPure,0) / filteredSkills.length).toFixed(2);


  //get weight
  try {
    profileData.weight = util.getWeight(profileData);
  } catch (e) {
    console.log(profileData.slayer)
    console.log(e)
  }
  

  //get pets
  profileData.pets = profileAPI.members[uuid].pets;
  //sort pets + make pets into inventory contents
  if (profileData.pets) {
    // make into inventory
    profileData.pets = profileData.pets.map((pet) => {
      if (!constants.pets[pet.type]) {
        console.log("NEW PET TYPE: " + pet.type)
        pet.type = "PIG"; //make unknown pets pigs because thats quirky and cool and epic
      }
      if (pet.heldItem != null && !constants.petItems[pet.heldItem]) {
        console.log("NEW PET ITEM: " + pet.heldItem)
        pet.heldItem = null; //make unknown items not exist
      }
      let petTiers = ["COMMON","UNCOMMON","RARE","EPIC","LEGENDARY","LEGENDARY"];
      if (pet.heldItem == "PET_ITEM_TIER_BOOST") {
        pet.tier = petTiers[petTiers.indexOf(pet.tier)+1];
      }
      if (pet.heldItem == "PET_ITEM_VAMPIRE_FANG") {
        pet.tier = "MYTHIC";
      }
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
          `§7Total XP: §f${util.cleanFormatNumber(pet.exp)} §6/ §f${util.cleanFormatNumber(constants.petLeveling.total[pet.tier])}`,
          "",
          `§r${pet.tier[0] + pet.tier.slice(1).toLowerCase()} Pet`
        ],
        faces: {
          face: `/img/head?skin=${constants.pets[pet.type].skin.split("/")[4]}&i=${0}`,
          side: `/img/head?skin=${constants.pets[pet.type].skin.split("/")[4]}&i=${1}`,
          top: `/img/head?skin=${constants.pets[pet.type].skin.split("/")[4]}&i=${2}`
        },
        rarity: pet.tier,
        active: pet.active,
        xp: pet.exp,
        id: pet.type
      }
      //get the pet's level
      let remainingXp = pet.exp;
      let level;
      for (level = 1; level < 100 && remainingXp >= constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]]; level++) {
        remainingXp -= constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]];
      }
      //get the pets stats
      var stats = {}
      for (let stat in constants.pets[pet.type].perLevelStats) {
        stats[stat] = constants.pets[pet.type].perLevelStats[stat] * level + (constants.pets[pet.type].baseStats[stats] ? constants.pets[pet.type].baseStats[stats] : 0); //add the stats
      }
      //apply pet item to stats
      if (constants.petItems[pet.heldItem] && constants.petItems[pet.heldItem].stats) {
        for (let operation in constants.petItems[pet.heldItem].stats) {
          for (let stat in constants.petItems[pet.heldItem].stats[operation]) {
            if (operation == "add") {
              if (stats[stat]) {
                stats[stat] += constants.petItems[pet.heldItem].stats[operation][stat];
              } else {
                stats[stat] = constants.petItems[pet.heldItem].stats[operation][stat];
              }
            } else if (operation == "multiply") {
              if (stats[stat]) {
                stats[stat] *= constants.petItems[pet.heldItem].stats[operation][stat];
              }
            }
          }
        }
      }
      out.stats = stats;

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
  //get stats
  let profileStats = profileAPI.members[uuid].stats;
  let sortedStats = {
    "kills": [],
    "deaths": [],
    "pets": [],
    "fishing": [],
    "jerry_event": [],
    "mythos_event": [],
    "races": [],
    "dungeon_races": [],
    "auctions": [],
    "misc": [],
  }
  for (let stat in profileStats) {
    try {
    if (stat.startsWith("kills")) {
      if (stat == "kills") {
        sortedStats.kills.push(["All", profileStats[stat]]);
      } else {
        let label = stat.slice(6).split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
        if (label.startsWith("Crypt Undead")) label = "Crypt Undead";
        if (constants.statAlias[label]) label = constants.statAlias[label];
        if (sortedStats.kills.find(x => x[0] == label)) {
          sortedStats.kills.find(x => x[0] == label)[1] += profileStats[stat];
        } else {
          sortedStats.kills.push([label, profileStats[stat]]);
        }

      }
    } else if (stat.startsWith("deaths")) {
      if (stat == "deaths") {
        sortedStats.deaths.push(["All", profileStats[stat]]);
      } else {
        let label = stat.slice(7).split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
        if (label.startsWith("Crypt Undead")) label = "Crypt Undead";
        if (constants.statAlias[label]) label = constants.statAlias[label]
        sortedStats.deaths.push([label, profileStats[stat]]);
      }
      continue;
    } else if (stat.startsWith("dungeon_hub")) {
      sortedStats.dungeon_races.push([stat.replace("_best_time","").slice(12).split("_").map(x => x[0].toUpperCase() + x.slice(1)).join(" "), (profileStats[stat] / 1000).toFixed(3) + "s" ]);
      continue;
    } else if (["auctions_bids","auctions_highest_bid","auctions_won","auctions_bought_common","auctions_bought_uncommon","auctions_bought_rare","auctions_bought_epic","auctions_bought_legendary","auctions_bought_mythic","auctions_bought_special","auctions_sold_common","auctions_sold_uncommon","auctions_sold_rare","auctions_sold_epic","auctions_sold_legendary","auctions_sold_special","auctions_gold_spent","auctions_gold_earned","auctions_created","auctions_fees","auctions_no_bids","auctions_completed"].includes(stat)) {
      sortedStats.auctions.push([stat.split("_").map(x => x[0].toUpperCase() + x.slice(1)).join(" "), profileStats[stat]])
    } else if (["items_fished","items_fished_normal","items_fished_treasure","items_fished_large_treasure","shredder_bait","shredder_fished"].includes(stat)) {
      let label = stat.split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
      if (label.startsWith("Crypt Undead")) label = "Crypt Undead";
      if (constants.statAlias[label]) label = constants.statAlias[label];
      if (sortedStats.kills.find(x => x[0] == label)) {
        sortedStats.fishing.find(x => x[0] == label)[1] += profileStats[stat];
      } else {
        sortedStats.fishing.push([label, profileStats[stat]]);
      }
    } else if (["gifts_received","most_winter_snowballs_hit","most_winter_damage_dealt","most_winter_magma_damage_dealt","gifts_given","most_winter_cannonballs_hit"].includes(stat)) {
      let label = stat.split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
      if (label.startsWith("Crypt Undead")) label = "Crypt Undead";
      if (constants.statAlias[label]) label = constants.statAlias[label];
      if (sortedStats.kills.find(x => x[0] == label)) {
        sortedStats.jerry_event.find(x => x[0] == label)[1] += profileStats[stat];
      } else {
        sortedStats.jerry_event.push([label, profileStats[stat]]);
      }
    } else if (["chicken_race_best_time_2","foraging_race_best_time","end_race_best_time"].includes(stat)) {
      let label = stat.split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
      if (label.startsWith("Crypt Undead")) label = "Crypt Undead";
      if (constants.statAlias[label]) label = constants.statAlias[label];
      if (sortedStats.kills.find(x => x[0] == label)) {
        sortedStats.races.find(x => x[0] == label)[1] += profileStats[stat];
      } else {
        sortedStats.races.push([label, (profileStats[stat] / 1000).toFixed(3) + "s"]);
      }
    } else if (["pet_milestone_ores_mined","pet_milestone_sea_creatures_killed"].includes(stat)) {
      let label = stat.split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
      if (label.startsWith("Crypt Undead")) label = "Crypt Undead";
      if (constants.statAlias[label]) label = constants.statAlias[label];
      if (sortedStats.kills.find(x => x[0] == label)) {
        sortedStats.pets.find(x => x[0] == label)[1] += profileStats[stat];
      } else {
        sortedStats.pets.push([label, profileStats[stat]]);
      }
    } else if (stat.includes("mythos")) {
      if (["mythos_kills","mythos_burrows_dug_next","mythos_burrows_dug_combat","mythos_burrows_dug_treasures","mythos_burrows_chains_complete"].includes(stat)) sortedStats.mythos_event.push([stat.split("_").map(x => x[0].toUpperCase() + x.slice(1)).join(" "), profileStats[stat]])
    } else {
      sortedStats.misc.push([stat.split("_").map(x => x[0].toUpperCase() + x.slice(1)).join(" "), profileStats[stat]]);
    }
    } catch (e) {console.log("Error with stats: ", stat, profileStats[stat], e)}
  }
  for (let stat in sortedStats) {
    sortedStats[stat].sort((a,b) => {
      if (typeof a[1] == "number") {
        return b[1]-a[1]
      } else {
        return 0
      }
    })
  }
  profileData.profileStats = sortedStats;
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
var loadingUuids = [];
async function getGuildData(guildname,userRequested,priority=0) {

  console.log(`fetching guild ${guildname}...`);
  let guildData = {incomplete: false};
  
  if (!userRequested) {
    let previous = guildsCollection.find({name: guildname});
    if (previous) {
      guildData.lastRequested = previous.lastRequested || Date.now();
    } else {
      guildData.lastRequested = Date.now()
    }
  } else {
    guildData.lastRequested = Date.now()
  }
    // playersCollection.updateMany({
  //   uuid: {
  //     $in: guildApi.guild.members.map(x => x.uuid)
  //   },
  //   lastUpdated: {
  //     $gt: Date.now() - 1000 * 60 * 60 * 24 //less than 24hrs old
  //   }
  // }, {
  //   $set: {lastRequested: Date.now()}
  // });

  let guildApi = (await reqScheduler.get(`https://api.hypixel.net/guild?key=${process.env.API_KEY}&name=${guildname}`, priority)).data;
  if (!guildApi.success) return false;
  //get name, tag, and tagcolor
  guildData._id = guildApi.guild._id;
  guildData.name = guildApi.guild.name;
  guildData.players = guildApi.guild.members.length;
  guildData.tag = {
    text: guildApi.guild.tag,
    color: guildApi.guild.tagColor
  };
  guildData.members=[],
  console.log("got guild api")
  let playersDataCursor = playersCollection.find({
    uuid: {
      $in: guildApi.guild.members.map(x => x.uuid)
    },
    lastUpdated: {
      $gt: Date.now() - 1000 * 60 * 60 * 24 //less than 24hrs old
    }
  }); //find all the players currently in DB
  while (await playersDataCursor.hasNext()) {
    console.log('fetching next guild player...')
    let playerData = await playersDataCursor.next();
    try {
      var profile =JSON.parse(zlib.inflateSync(Buffer.from(playerData.profiles[playerData.currentProfile],"base64")).toString());
      guildData.members.push({
        name: playerData.name,
        uuid: playerData.uuid,
        slayer: profile ? profile.slayerXp : 0,
        catacombs: profile ? (profile.skills.find(x => x.name == "catacombs") ? profile.skills.find(x => x.name == "catacombs").levelProgress: 0) : 0,
        averageSkill: profile ? Number(profile.averageSkillProgress) : 0,
        weight: profile ? profile.weight.total.all : 0,
      })
    } catch (e) {console.log(e)};
  };
  console.log("done with that shit")
  let foundUuids = guildData.members.map(x => x.uuid);
  let missingUuids = guildApi.guild.members.map(x => x.uuid).filter(x => !foundUuids.includes(x));
  console.log(`missing ${missingUuids.length} players`)
  if (missingUuids.length > 0) guildData.incomplete = true;

  missingUuids.forEach((uuid) => {
    if (!loadingUuids.includes(uuid)) {
      getPlayerData(null, true, 1, uuid).then(() => {
        loadingUuids.splice(loadingUuids.indexOf(uuid),1);
      });
      loadingUuids.push(uuid);
    }
  });

  guildData.members.sort((a,b) => b.weight - a.weight);

  guildData.averageSkillLevel = Number((guildData.members.reduce((t,x) => t+x.averageSkill, 0) / guildData.members.length).toFixed(2));
  guildData.averageSlayer = Number((guildData.members.reduce((t,x) => t+x.slayer, 0) / guildData.members.length).toFixed(2));
  guildData.averageWeight = Number((guildData.members.reduce((t,x) => t+x.weight, 0) / guildData.members.length).toFixed(2));
  guildData.averageCatacombs = Number((guildData.members.reduce((t,x) => t+x.catacombs, 0) / guildData.members.length).toFixed(2));
  console.log("updating guild data in db");
  await guildsCollection.replaceOne({_id: guildData._id}, guildData, {upsert: true})
  
  return guildData;
}

async function calculateGuilds() {
  return await guildsCollection.find({}).sort({averageWeight: -1}).limit(50).toArray()
}

async function getBazaarData() {
  console.log("updating bazaar products...")
  return (await reqScheduler.get(`https://api.hypixel.net/skyblock/bazaar?key=${process.env.API_KEY}`)).data.products
}

async function getAuctionData() {
  let items = [];
  console.log("loading BIN auctions...");
  let firstReq = (await reqScheduler.get(`https://api.hypixel.net/skyblock/auctions?key=${process.env.API_KEY}`,1)).data;
  let totalPages = firstReq.totalPages;
  for (let i = 0; i <= totalPages; i++) { //the real number of pages is totalPages+1, totalPages is just the highest index
    let page = (await reqScheduler.get(`https://api.hypixel.net/skyblock/auctions?key=${process.env.API_KEY}&page=${i}`,1)).data.auctions;
    page = page.filter(x => x.bin); //only care about BIN auctions
    items = items.concat(page);
    console.log(`fetched BIN auctions ${i+1} / ${totalPages + 1}`);
  }
  let priceMap = {};
  for (let item of items) {
    if (priceMap[item.item_name]) {
      if (priceMap[item.item_name] > item.starting_bid) priceMap[item.item_name] = item.starting_bid
    } else {
      priceMap[item.item_name] = item.starting_bid
    }
  }
  return priceMap;
}

//link preview ejs description maker
async function makeEjsData(isImportant,player,profile) {
  try {
  let mojangData = (await axios.get("https://api.mojang.com/users/profiles/minecraft/" + player)).data
  player = mojangData.name;
  let playerData = await playersCollection.findOne({nameLower: player.toLowerCase()});
  let profileData;

  if (!playerData || playerData.lastUpdated < Date.now() - 1000 * 60 * 15) {
    if (isImportant) { //if its coming from a user agent that displays description
      playerData = await getPlayerData(player, true);
      if (profile) {
        for (let profileid in playerData.profiles) {
          if (playerData.profiles[profileid].cute_name == profile) profileData = playerData.profiles[profileid];
        }
      }
      if (!profileData) profileData = playerData.profiles[playerData.currentProfile]; 
    } else { //its not important, we can just return
      return {player: "", description: "Data was unable to be fetched and determined to be irrelevant. If you believe this is an error, please contact awes0meGuy360#2444."}
    }
  } else {
    if (profile) { //if there is a profile name try to find it
      for (let profileid in playerData.profiles) {
        playerData.profiles[profileid] = JSON.parse(zlib.inflateSync(Buffer.from(playerData.profiles[profileid],"base64")).toString());
        if (playerData.profiles[profileid].cute_name == profile) profileData = playerData.profiles[profileid];
      }
    }
    if (!profileData) profileData = JSON.parse(zlib.inflateSync(Buffer.from(playerData.profiles[playerData.currentProfile],"base64")).toString())
  }
  
  
  
  let description = "";
  //add weight to description
  description += `Weight: ${profileData.weight.total.all.toFixed(0)} (${profileData.weight.skills.all.toFixed(0)} Skill, ${profileData.weight.slayer.all.toFixed(0)} Slayer, ${profileData.weight.dungeons.all.toFixed(0)} Cata)\n\n`

  //add skills to description
  description += `Skills (${profileData.averageSkillPure} True, ${profileData.averageSkillProgress} w/ Progress):\n`
  let skillEmojiTitles = {
    "taming": "🐾 Taming",
    "farming": "🌾 Farming",
    "mining": "⛏️ Mining",
    "combat": "⚔️ Combat",
    "foraging": "🌲 Foraging",
    "fishing": "🎣 Fishing",
    "enchanting": "📘 Enchanting",
    "alchemy": "⚗️ Alchemy",
    "carpentry": "🪑 Carpentry",
    "runecrafting": "🌌 Runecrafting",
    "catacombs": "☠️ Catacombs",
    "mage": "🧙‍♂️ Mage",
    "archer": "🏹 Archer",
    "healer": "❤️ Healer",
    "tank": "🛡️ Tank",
    "berserk": "🩸 Berserker",
  }
  for (let i = 0; i<profileData.skills.length; i+=2) {
    description += (skillEmojiTitles[profileData.skills[i].name] ? skillEmojiTitles[profileData.skills[i].name] : profileData.skills[i+1].name) + " " + profileData.skills[i].levelProgress.toFixed(2);
    if (profileData.skills[i+1]) {
      description += " "
      description += (skillEmojiTitles[profileData.skills[i+1].name] ? skillEmojiTitles[profileData.skills[i+1].name] : profileData.skills[i+1].name) + ": " + profileData.skills[i+1].levelProgress.toFixed(2) + "\n";
    }
  }

  //add slayer to description
  description += `\n🗡️ Slayer [${profileData.slayer.zombie.level}-${profileData.slayer.spider.level}-${profileData.slayer.wolf.level}] (${util.cleanFormatNumber(profileData.slayerXp)} XP)\n`;

  //add coins to description
  description += `💰 Coins: ${util.cleanFormatNumber(profileData.balance + profileData.purse)}\n`;

  return {player: player, profile:profileData.cute_name, description:description, image:`https://crafatar.com/renders/head/${mojangData.id}?overlay`};
  } catch (e) {
    console.log(e);
    return {player: "", description: "Error Fetching Data"}
  }
}

/* Data API Endpoints */
app.get("/api/data/:player", async (req,res) => { 
  let playerData = await getPlayerData(req.params.player, true);
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
  res.json(await getGuildData(req.params.guildname, true));
});

app.get("/api/gtop", async (req,res) => {
  res.json(await calculateGuilds());
})

app.get("/api/dbinfo", async (req,res) => {
  let players = await playersCollection.find({}).toArray();
  res.json({
    players: players.length,
    names: players.map(x => x.name),
    uuids: players.map(x => x.uuid)
  })
})

app.get("/api/bazaar", (req,res) => {
  res.json(bazaarData);
})
app.get("/api/auction", (req,res) => {
  res.json(auctionData);
})

/* Images API */
app.get("/img/head", async (req,res) => {
  let img = await util.getSkinFace("http://textures.minecraft.net/texture/" + req.query.skin, req.query.i);
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
app.get("/stats/:player", async (req,res) => {
  res.render(__dirname + "/public/ejs/stats.ejs", await makeEjsData(req.get('User-Agent').includes("discordapp.com"), req.params.player));
  console.log(req.get('User-Agent'))
})
app.get("/stats/:player/:profile", async (req,res) => {
  res.render(__dirname + "/public/ejs/stats.ejs", await makeEjsData(req.get('User-Agent').includes("discordapp.com"),req.params.player, req.params.profile));
})

app.get("/guild/:guildname", (req,res) => {
  res.sendFile(__dirname + "/public/guild.html");
})

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


/* Database management */

async function prunePlayers() { //delete users who's profiles havent been queried by either an internal system or a user in 14 days
  let deleted = await playersCollection.deleteMany({
    lastRequested: {
      $lt: Date.now() - 1000 * 60 * 60 * 24 * 14
    }
  })
  console.log(`Deleted ${deleted.deletedCount} old players`);
}

setInterval(prunePlayers, 1000 * 60 * 60)

/*
Guild Storage Requirements:

Permenant storage (regardless of queries): 80 members & 3000+ average weight
Storage while queried within last 14 days: 80 members & 2000+ average weight
Storage while queried within last 7 days: 80 members & 1000+ average weight
Storage while queried within the last 24 hrs: 80 members

*/
async function pruneGuilds() {
  
  let deleted = await guildsCollection.deleteMany({
    $or: [
      { //last requested > 24hrs ago and members < 80
        lastRequested: {
          $lt: Date.now() - 1000 * 60 * 60 * 24
        },
        players: {
          $lt: 80
        }
      },
      { //last requested > 24hrs ago and avg weight < 1000
        lastRequested: {
          $lt: Date.now() - 1000 * 60 * 60 * 24
        },
        averageWeight: {
          $lt: 1000
        }
      },
      { //last requested > 7 days ago and avg weight < 2000
        lastRequested: {
          $lt: Date.now() - 1000 * 60 * 60 * 24 * 7
        },
        averageWeight: {
          $lt: 2000
        }
      },
      { // last requested > 14 days and avg weight < 3000
        lastRequested: {
          $lt: Date.now() - 1000 * 60 * 60 * 24 * 14
        },
        averageWeight: {
          $lt: 3000
        }
      }
    ]
  });
  console.log(`Deleted ${deleted.deletedCount} inadequate guilds`);
}

setInterval(pruneGuilds, 1000 * 60 * 60);

async function refreshOldestPlayers(limit=10) {
  let oldestArr = await playersCollection.find({lastUpdated: {$lt: Date.now() - 1000 * 60 * 10}}).sort({lastUpdated: 1}).limit(limit).toArray();
  for (let oldest of oldestArr) {
    await getPlayerData(oldest.name, false, 2, oldest.uuid, false);
    await new Promise(res => setTimeout(res, 500));
  }
  setTimeout(refreshOldestPlayers, 5000); //pause 1s then do it again
}