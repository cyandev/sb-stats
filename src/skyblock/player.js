let db = require("../db.js");
let zlib = require("zlib");
let axios = require("axios");
module.exports = ((reqScheduler) => {
    let profile = require("./profile.js")(reqScheduler);
    async function getPlayerData(query={name:"",uuid:"",profile_id:"",userRequested:false},priority=0) {
        //get old data for player
        let oldPlayerData = await (await db.getPlayers()).findOne({nameLower: query.name ? query.name.toLowerCase() : ""});
        if (oldPlayerData) for (let profileid in oldPlayerData.profiles) { //inflate compressed profile data
            oldPlayerData.profiles[profileid] = JSON.parse(zlib.inflateSync(Buffer.from(oldPlayerData.profiles[profileid],"base64")).toString());
        }
        
        if (oldPlayerData && oldPlayerData.lastUpdated > Date.now() - 1000 * 60 * 5 * 0) return oldPlayerData; //check if there is recent data in the DB, if there is return it
        
        let refreshBasicInfo = !oldPlayerData || oldPlayerData.basicInfoUpdated < Date.now() - 1000 * 60 * 60 * 12 //refresh basic info every 12hrs

        let playerData = {
            lastUpdated: Date.now(), 
            lastRequested: !query.userRequested && oldPlayerData ? oldPlayerData.lastRequested : Date.now(),
            basicInfoUpdated: refreshBasicInfo ? Date.now() : oldPlayerData.basicInfoUpdated
        }

        if (!oldPlayerData || refreshBasicInfo) { //if we need to build player data from scratch
            if (query.name && !query.uuid) { //find uuid from mojang api
                query.uuid = (await axios.get("https://api.mojang.com/users/profiles/minecraft/" + query.name)).data.id; //get uuid from mojang
                if (!query.uuid) {
                    throw `no uuid for name ${query.name}!`
                }
            }
            let playerAPI = (await reqScheduler.getFirst(`https://api.hypixel.net/player?key=${process.env.API_KEY}&uuid=${query.uuid}`, priority)).data.player;
            if (!playerAPI || !playerAPI.stats || !playerAPI.stats.SkyBlock) throw `err with playerAPI for query ${query}`;

            let guildApi = (await reqScheduler.getFirst(`https://api.hypixel.net/guild?key=${process.env.API_KEY}&player=${query.uuid}`, priority)).data;
            playerData.guild = guildApi.guild ? guildApi.guild.name : "";
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

            //get achievements
            playerData.achievements = Object.keys(playerAPI.achievements).filter(x => x.includes("skyblock_")).reduce((t,x) => {t[x] = playerAPI.achievements[x]; return t },{});
            
            //build profiles
            playerData.profiles = {};
            for (let id in playerAPI.stats.SkyBlock.profiles) {
                playerData.profiles[id] = {
                    cute_name: playerAPI.stats.SkyBlock.profiles[id].cute_name,
                    id: id
                }
            }
        } else { //keep old playerAPI info as it's recent
            delete oldPlayerData._id;
            playerData = Object.assign({}, oldPlayerData, playerData);
        }
        //get skyblock achievement data for player
        
      
      
        //get sb profile(s) for player
        if (query.profile_id) {
            playerData.profiles[query.profile_id] = await profile.getProfileData(playerData.profiles[query.profile_id], playerData, priority); //replace with profile.getProfileData
        } else {
            for (let id in playerData.profiles) {
                playerData.profiles[id] = await profile.getProfileData(playerData.profiles[id], playerData, priority) //placeholder, old: await getProfileData(query.uuid, profile, playerData, priority);
            }
        }
        
        //get current profile
        playerData.currentProfile = null;
        let lastUpdated = 0;
        for (let id in playerData.profiles) {
            if (playerData.profiles[id].last_save > lastUpdated) {
                playerData.currentProfile = id;
                lastUpdated = playerData.profiles[id].last_save;
            }
        }
        
        //get weight
        if (playerData.profiles[playerData.currentProfile]) playerData.weight = playerData.profiles[playerData.currentProfile].weight;
      
      
        //copy player data + compress profiles
        let compressedPlayerData = JSON.parse(JSON.stringify(playerData))
        for (let profileid in compressedPlayerData.profiles) {
          compressedPlayerData.profiles[profileid] = zlib.deflateSync(Buffer.from(JSON.stringify(compressedPlayerData.profiles[profileid]))).toString("base64")
        }
        (await db.getPlayers()).replaceOne({uuid: playerData.uuid},compressedPlayerData,{upsert: true}); //add new compressed data to db
        return playerData;
      }

    return {getPlayerData}
})