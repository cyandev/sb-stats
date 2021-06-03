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
        profile.skills = await require("./skills.js")(profileAPI, playerData);

        //get inventories
        profile.inventories = await require("./inventories.js")(profileAPI, playerData);

        //get weight
        profile.weight = await require("./weight.js")(profile);

        //get pets
        profile.pets = await require("./pets.js")(profileAPI, playerData);
        
        //get stats (kills, deaths, etc.)
        profile.stats = await require("./stats.js")(profileAPI, playerData);
      
        return profile;
      }
    return {getProfileData};
})