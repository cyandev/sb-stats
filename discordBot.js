const Discord = require("discord.js");
const client = new Discord.Client();

let util = require("./util.js");

const emojiTitles = {
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
const minionNames = {"MITHRIL": "Mithril", "COBBLESTONE": "Cobbletone", "OBSIDIAN": "Obsidian", "GLOWSTONE": "Glowstone", "GRAVEL": "Gravel", "SAND": "Sand", "CLAY": "Clay", "ICE": "Ice", "SNOW": "Snow", "COAL": "Coal", "IRON": "Iron", "GOLD": "Gold", "DIAMOND": "Diamond", "LAPIS": "Lapis", "REDSTONE": "Redstone", "EMERALD": "Emerald", "QUARTZ": "Quartz", "ENDER_STONE": "Endstone", "WHEAT": "Wheat", "MELON": "Melon", "PUMPKIN": "Pumpkin", "CARROT": "Carrot", "POTATO": "Potato", "MUSHROOM": "Mushroom", "CACTUS": "Cactus", "COCOA": "Cocoa", "SUGAR_CANE": "Sugar Cane", "NETHER_WARTS": "Nether Wart", "FLOWER": "Flower", "FISHING": "Fishing", "ZOMBIE": "Zombie", "REVENANT": "Revenant", "SKELETON": "Skeleton", "CREEPER": "Creeper", "SPIDER": "Spider", "TARANTULA": "Tarantula", "CAVESPIDER": "Cave Spider", "BLAZE": "Blaze", "MAGMA_CUBE": "Magma", "ENDERMAN": "Enderman", "GHAST": "Ghast", "SLIME": "Slime", "COW": "Cow", "PIG": "Pig", "CHICKEN": "Chicken", "SHEEP": "Sheep", "RABBIT": "Rabbit", "OAK": "Oak", "SPRUCE": "Spruce", "BIRCH": "Birch", "DARK_OAK": "Dark Oak", "ACACIA": "Acacia", "JUNGLE": "Jungle"};

const reactions = {
  LOADING: "809845615889743912",
  NO: "❌",
  YES: "✅"
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
          return;
        }
      } else {
        message.channel.send(`Argument '${arg}' not understood`);
        return;
      }
    }
  }

  const appMethods = {
    async getWeight(message, player, profile) {
      if (!player) {
        player = message.author.username
      }
      let reaction = message.react(reactions.LOADING);
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
      var weightOutput;
      if (weight) {
        weightOutput = new Discord.MessageEmbed().setColor("#4f6280")
          .setTitle(`${name} - Weight`) 
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
        message.react(reactions.YES);
      } else {
        weightOutput = "Invalid player username!";
        (await reaction).remove();
        message.react(reactions.NO);
      }
      (await response).edit(weightOutput);
    },
    async getMinionInfo(message, player, profile) {
      try {
        //get playerData and name
        if (!player) {
          player = message.author.username;
        }
        var reaction = message.react(reactions.LOADING);
        var response = await message.channel.send(`Fetching minions for ${player}...`);
        let playerData = await getPlayerData(player, true, 0);
        if (!playerData) throw `Invalid player username!`
        let {name,uuid} = playerData;

        //get profile data
        var profileData;
        if (profile) {
          profileData = Object.keys(playerData.profiles).map(x=>playerData.profiles[x]).find(x=>x.cute_name.toLowerCase() == profile.toLowerCase());
          if (!profileData) throw "Invalid profile name!"
        } else {
          profileData = playerData.profiles[playerData.currentProfile];
        }
        //calculate price till next slot
        let nextSlotPrice = 0;
        if (profileData.minions.missing.length >= profileData.minions.nextTier) {
          let nextMinions = profileData.minions.missing.slice(0,profileData.minions.nextTier);
          if (nextMinions.every(x => x[2])) {
            nextSlotPrice = nextMinions.reduce((t,x) => t+Number(x[[2]]), 0);
          } else {
            nextSlotPrice = null;
          }
        } else {
          nextSlotPrice = null;
        }

        //build response MessageEmbed
        var embed = new Discord.MessageEmbed().setColor("#4f6280")
          .setTitle(`${name} - Minions`)
          .setDescription(`**Unique Minions: ${profileData.minions.uniques}, Minion Slots: ${profileData.minions.slots + profileData.minions.bonusSlots}, Cost of Next Slot: ${nextSlotPrice ? util.cleanFormatNumber(nextSlotPrice) : "None"}**`)
          .setURL(`https://sbstats.me/stats/${name}/${profile || ""}`)
          .setThumbnail(`https://crafatar.com/renders/head/${uuid}?overlay`)
          .setFooter("view more stats at https://sbstats.me");

        //build next slot field
        let nextSlotDescription = "\u200B";
        if (nextSlotPrice) {
          for (let minionUpgrade of profileData.minions.missing.slice(0,Math.min(profileData.minions.nextTier,10))) {
            nextSlotDescription += `${minionNames[minionUpgrade[0]]} ${minionUpgrade[1]} - ${util.cleanFormatNumber(Number(minionUpgrade[2]))}\n`
          }
        }

        embed.addField("__**Cheapest Minions to Next Slot:**__", nextSlotDescription);

        (await response).edit("\u200B");
        (await reaction).remove();
        message.react(reactions.YES);
        (await response).edit(embed);

      } catch (e) {
        if (typeof e == "string") {
          (await reaction).remove();
          (await response).edit(e);
          message.react(reactions.NO);
        }
      }
    },

    async help(message) {
      message.channel.send(
        `\u200B
        **SBStats Discord Bot Help:**
        \`s%help\`: Displays this message
        \`s%weight [username] [profile]\`: Get's a skyblock player's weight per the senither guild leaderboard algorithm
        \`s%minions [username] [profile]\`: Get's a skyblock player's minions, cost towards next slot, and cheapest missing minions
        `
      );
    },
  }

  const commandsObject = {
    "weight": appMethods.getWeight,
    "we": appMethods.getWeight,
    "w": appMethods.getWeight,
    "help": appMethods.help,
    "minions": appMethods.getMinionInfo,
    "m": appMethods.getMinionInfo
  }
}