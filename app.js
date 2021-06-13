/* eslint-disable */
require('dotenv').config();
const express = require("express");

const port = process.env.PORT || 8080;
const app = express();
let axios = require("axios");
let zlib = require("zlib");

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

//link preview ejs description maker
async function makeEjsData(isImportant,player,profile) {
  try {
  let mojangData = (await axios.get("https://api.mojang.com/users/profiles/minecraft/" + player)).data
  player = mojangData.name;
  let playerData = await (await db.getPlayers()).findOne({nameLower: player.toLowerCase()});
  let profileData;

  if (!playerData) {
    if (isImportant) { //if its coming from a user agent that displays description
      playerData = await players.getPlayerData({name: player});
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
  let playerData = await players.getPlayerData({name: req.params.player, userRequested: true}, 0);
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

app.get("/api/dbinfo", async (req,res) => {
  let players = await playersCollection.find({}).toArray();
  res.json({
    players: players.length,
    names: players.map(x => x.name),
    uuids: players.map(x => x.uuid)
  })
})

app.get("/api/bazaar", async (req,res) => {
  res.json(await bazaar.data());
})
app.get("/api/auction", async (req,res) => {
  res.json(await auctions.data());
})


/* Normal Routes */
app.get("/stats/:player", async (req,res) => {
  res.render(__dirname + "/public/ejs/stats.ejs", await makeEjsData(req.get('User-Agent').includes("discordapp.com"), req.params.player));
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