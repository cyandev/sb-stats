const Discord = require("discord.js");
const client = new Discord.Client();
const emojiTitles = {
    "taming": "🐾 Taming",
    "farming": "🌾 Farming",
    "mining": "⛏️ Mining",
    "combat": "⚔️ Combat",
    "foraging": "🌲 Foraging",
    "fishing": "🎣 Fishing",
    "enchanting": "📘 Encanting",
    "alchemy": "⚗️ Alchemy",
    "carpentry": "🪑 Carpentry",
    "runecrafting": "🌌 Runecrafting",
    "catacomb": "☠️ Catacombs", 
    "mage": "🧙‍♂️ Mage",
    "archer": "🏹 Archer",
    "healer": "❤️ Healer",
    "tank": "🛡️ Tank",
    "berserk": "🩸 Berserker",
    "zombie": "🧟 Revenant",
    "spider": "🕸️ Tarantula",
    "wolf": "🐺 Sven",
  }
module.exports = (getPlayerData) => {
  console.log("launching discord bot...")
  client.on("message", (message) => {
    if (message.content.startsWith("s%")) {
      processCommand(message, message.content.slice(2).split(" "))
    }
  })
  
  client.login(process.env.DISCORD_TOKEN);
  function processCommand(message, args) {
    let commandPos = commandsObject;
    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      if (arg == "") continue //allow for a space after s% or double spaces in args (eg. "s% weight  awes0meGuy360")
      if (arg in commandPos) {
        commandPos = commandPos[arg];
        if (typeof commandPos == "function") {
          commandPos(message, ...args.slice(i+1));
          break;
        }
      } else {
        message.channel.send(`Argument '${arg}' not understood`)
      }
    }
  }

  const appMethods = {
    async getWeight(message, player, profile) {
      if (!player) {
        message.channel.send("You must provide a username! `s%weight [username]`");
        message.react("❌");
        return;
      }
      let reaction = message.react("809845615889743912");
      let response = await message.channel.send(`Fetching weight for ${player}...`);
      let playerData = await getPlayerData(player, true, 0);
      let {name,weight, uuid} = playerData;
      if (profile) {
        let profileData = Object.keys(playerData.profiles).map(x=>playerData.profiles[x]).find(x=>x.cute_name.toLowerCase() == profile.toLowerCase());
        if (profileData) {
          weight = profileData.weight;
          profile = profileData.cute_name;
        }
      }

      if (weight) {
        var weightOutput = new Discord.MessageEmbed().setColor("#4f6280")
          .setTitle(`${name}`) 
          .setURL(`https://sbstats.me/stats/${name}/${profile || ""}`)
          .setDescription(`**Weight: ${weight.total.all.toFixed(3)} (${weight.skills.all.toFixed(0)} Skill, ${weight.slayer.all.toFixed(0)} Slayer, ${weight.dungeons.all.toFixed(0)} Dungeon)**`)
          .setThumbnail(`https://crafatar.com/renders/head/${uuid}?overlay`)
          .setFooter("view more stats at https://sbstats.me");

        //add skill weights to message
        weightOutput.addField(`\u200B`, `__**Skill Weights (${weight.skills.all.toFixed(3)} Total):**__`);
        for (let skillName in weight.skills) {
          if (skillName == "all") continue;
          weightOutput.addField(emojiTitles[skillName], `${weight.skills[skillName].weight.toFixed(2)} + ${weight.skills[skillName].overflow.toFixed(2)} Overflow`, true);
        }

        //add slayer weights to message
        weightOutput.addField(`\u200B`, `__**Slayer Weights (${weight.slayer.all.toFixed(3)} Total):**__`);
        for (let slayerName in weight.slayer) {
          if (slayerName == "all") continue;
          weightOutput.addField(emojiTitles[slayerName], `${weight.slayer[slayerName].weight.toFixed(2)}`, true);
        }

        //add dungeon weights to message
        weightOutput.addField(`\u200B`, `__**Dungeon Weights (${weight.dungeons.all.toFixed(3)} Total):**__`);
        for (let skillName in weight.dungeons) {
          if (skillName == "all") continue;
          weightOutput.addField(emojiTitles[skillName], `${weight.dungeons[skillName].weight.toFixed(2)}`, true);
        }
        (await response).edit("\u200B");
        (await reaction).remove();
        message.react("✅");
      } else {
        var weightOutput = "Invalid player username!";
        (await reaction).remove();
        message.react("❌");
      }
      (await response).edit(weightOutput);
    },
    async help(message) {
      message.channel.send(
        `\u200B
        **SBStats Discord Bot Help:**
        \`s%help\`: Displays this message
        \`s%weight [username]\`: Get's a skyblock player's weight per the senither guild leaderboard algorithm
        `
      );
    },
    async getStatSummary(message, player, profile) {}
  }

  const commandsObject = {
    "weight": appMethods.getWeight,
    "we": appMethods.getWeight,
    "w": appMethods.getWeight,
    "help": appMethods.help,
  }
}