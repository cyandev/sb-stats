/* eslint-disable */
require('dotenv').config();
const express = require("express");

const port = process.env.PORT || 8080;
const app = express();

//json body and url encoded body parsing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//serve static files
app.use(express.static("public"));

//use ejs for views
app.set('view engine', 'ejs');

let util = require("./src/util.js");
const constants = require("./src/constants.js");
let reqScheduler = new (require("./src/requestScheduler.js"))(500) //create request scheduler
let db = require("./src/db.js");

// TODO: Readd Discord Bot

//init bazaar and auctions management
let bazaar = require("./src/skyblock/bazaar.js")(reqScheduler);
let auctions = require("./src/skyblock/auctions.js")(reqScheduler);

//player data
let players = require("./src/skyblock/player.js")(reqScheduler);
(async () => {console.log(await players.getPlayerData({name:"awes0meGuy360"}))})(); //TEST, PLEASE REMOVE

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

app.listen(port, () => {
  console.log('listening...');
})