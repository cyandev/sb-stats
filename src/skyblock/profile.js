let util = require("../util.js");
let constants = require("../constants.js");

module.exports = ((reqScheduler) => {
    async function getProfileData(profile, playerData, priority) {
        profile = Object.assign({},profile);
        try {
            var profileAPI = (await reqScheduler.getFirst(`https://api.hypixel.net/skyblock/profile?key=${process.env.API_KEY}&profile=${profile.id}`,priority)).data.profile;
        } catch (err) {
            console.log("err getting /skyblock/profile endpoint")
        }
        //get basic info
        profile.members = Object.keys(profileAPI.members);
        profile.last_save = profileAPI.members[playerData.uuid].last_save
        
        //get minions
        profile.minions = await require("./minions.js")(profileAPI, playerData);
        
        //get coin purse / bank
        if (profileAPI.banking) {
          profile.balance = Number(profileAPI.banking.balance.toFixed(0));
        }
        profile.purse = profileAPI.members[playerData.uuid].coin_purse ? Number(profileAPI.members[playerData.uuid].coin_purse.toFixed(0)) : 0;
      
        //get fairy souls
        profile.fairy_souls = profileAPI.members[playerData.uuid].fairy_souls_collected

        //get slayer
        if (profileAPI.members[playerData.uuid].slayer_bosses) {
            profile.slayer = {};
            profile.slayerXp = 0;
            Object.keys(profileAPI.members[playerData.uuid].slayer_bosses).forEach((boss) => {
              //get kills + xp
                profile.slayer[boss] = {
                    xp: profileAPI.members[playerData.uuid].slayer_bosses[boss].xp || 0,
                    boss_kills: {
                    tier1: profileAPI.members[playerData.uuid].slayer_bosses[boss].boss_kills_tier_0 || 0,
                    tier2: profileAPI.members[playerData.uuid].slayer_bosses[boss].boss_kills_tier_1 || 0,
                    tier3: profileAPI.members[playerData.uuid].slayer_bosses[boss].boss_kills_tier_2 || 0,
                    tier4: profileAPI.members[playerData.uuid].slayer_bosses[boss].boss_kills_tier_3 || 0,
                    tier5: profileAPI.members[playerData.uuid].slayer_bosses[boss].boss_kills_tier_4 || 0,
                    }
                };

                //get level
                let xpNext = 0;
                let level = 0;
                let table = boss == "wolf" ? constants.xp_table_slayer_wolf :  constants.xp_table_slayer;
                for (let i = 0; i < table.length && profile.slayer[boss].xp >= xpNext; i++) {
                    xpNext += table[i+1];
                    level = i;
                }
                profile.slayer[boss].level = level;
                profile.slayer[boss].xpNext = xpNext;
                profile.slayer[boss].maxLevel = table.length - 1;

                //add xp to total
                profile.slayerXp += profile.slayer[boss].xp
            })
        }

        //get dungeons
        profile.dungeons = profileAPI.members[playerData.uuid].dungeons;

        //get skills
        Object.assign(profile, await require("./skills.js")(profileAPI, playerData));

        //get inventories
        profile.inventories = await require("./inventories.js")(profileAPI, playerData);

        //get weight
        profile.weight = await require("./weight.js")(profile);

        console.log(profile);
      
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
    return {getProfileData};
})