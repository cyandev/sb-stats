let util = require("../util.js");
let constants = require("../constants.js");

module.exports = async (profileAPI, playerData) => {
    //get normal skills
    let skills = {};
    Object.keys(profileAPI.members[playerData.uuid]).filter(x => x.includes("experience_skill_")).forEach(skill => {
        skills[skill.replace("experience_skill_","")] = profileAPI.members[playerData.uuid][skill];
    })

    //if api is off, get with achievement milestones
    if (!skills.combat) {
        constants.skillNames.forEach(skillName => {
        let xp = 0;
        for (let i = 0; i <= playerData.achievements["skyblock_" + constants.skillNamesToAchievements[skillName]]; i++) {
            xp+= constants.xp_table[i] ? constants.xp_table[i] : 0;
        }
        skills[skillName] = xp;
        })
    }
    
    //get dungeons skills
    if (util.checkNested(profileAPI.members[playerData.uuid],"dungeons","dungeon_types","catacombs","experience")) {
        skills.catacombs = profileAPI.members[playerData.uuid].dungeons.dungeon_types.catacombs.experience;
    }
    if (util.checkNested(profileAPI.members[playerData.uuid],"dungeons","selected_dungeon_class") && util.checkNested(profileAPI.members[playerData.uuid],"dungeons","player_classes",profileAPI.members[playerData.uuid].dungeons.selected_dungeon_class,"experience")) {
        skills[profileAPI.members[playerData.uuid].dungeons.selected_dungeon_class] = profileAPI.members[playerData.uuid].dungeons.player_classes[profileAPI.members[playerData.uuid].dungeons.selected_dungeon_class].experience;
    }

  
    Object.keys(skills).forEach((skillName) => {
        let xpRemaining = skills[skillName];
        let level = 0;
        let table = skillName == "runecrafting" ? constants.xp_table_runecrafting : ["farming", "enchanting", "mining", "combat"].includes(skillName) ? constants.xp_table_60 : ["catacombs","mage","healer","archer","berserk","tank"].includes(skillName) ? constants.xp_table_catacombs: constants.xp_table;
        for (let i = 0; i < table.length && xpRemaining >= table[i]; i++) {
            xpRemaining -= table[i];
            level = i;
        }
        skills[skillName] = {
            name: skillName,
            levelPure: level,
            xp: skills[skillName],
            levelProgress: level + (table[level+1] ? xpRemaining / table[level+1] : 0),
            xpRemaining: xpRemaining,
            progress: (xpRemaining / table[level+1]),
            maxLevel: table.length - 1,
            nextLevel: table[level + 1]
        };
    })

    return skills;
}