let constants = require("../constants.js");

/*
Weight algorithm from Hypixel Skyblock Assistant https://github.com/Senither/Hypixel-Skyblock-Assistant
*/
module.exports = async (profile) => {
    const skillWeights = {
        // Maxes out mining at 1,750 points at 60.
        mining: {
            expo: 1.18207448,
            divr: 259634,
            lvlCap: 60,
        },
        // Maxes out foraging at 850 points at level 50.
        foraging: {
            expo: 1.232826,
            divr: 259634,
            lvlCap: 50,
        },
        // Maxes out enchanting at 450 points at level 60.
        enchanting: {
            expo: 0.96976583,
            divr: 882758,
            lvlCap: 60,
        },
        // Maxes out farming at 2,200 points at level 60.
        farming: {
            expo: 1.217848139,
            divr: 220689,
            lvlCap: 60,
        },
        // Maxes out combat at 800 points at level 50.
        combat: {
            expo: 1.15797687265,
            divr: 275862,
            lvlCap: 60,
        },
        // Maxes out fishing at 2,500 points at level 50.
        fishing: {
            expo: 1.406418,
            divr: 88274,
            lvlCap: 50,
        },
        // Maxes out alchemy at 200 points at level 50.
        alchemy: {
            expo: 1.0,
            divr: 1103448,
            lvlCap: 50,
        },
        // Maxes out taming at 500 points at level 50.
        taming: {
            expo: 1.14744,
            divr: 441379,
            lvlCap: 50,
        },
    }
    let weight = {
        skills: {},
        slayer: {},
        dungeons: {},
        total: {}
    };
    //get skill weights
    for (let skill of Object.keys(profile.skills).map(x=>profile.skills[x]).filter(x => Object.keys(skillWeights).includes(x.name))) {
    let skillWeight = skillWeights[skill.name]

    let maxSkillLevelXP = skillWeight.lvlCap == 60 ? 111672425 : 55172425

    let experience = skill.xp;
    let level = skill.levelProgress;

    let base = Math.pow(level * 10, 0.5 + skillWeight.expo + level / 100) / 1250
    if (experience > maxSkillLevelXP) {
        base = Math.round(base)
    }

    if (experience <= maxSkillLevelXP) {
        weight.skills[skill.name] = {
            weight: base,
            overflow: 0,
        }
    } else {
        weight.skills[skill.name] = {
            weight: base,
            overflow: Math.pow((experience - maxSkillLevelXP) / skillWeight.divr, 0.968),
        }
    }
    }

    const slayerWeights = {
    zombie: {
        divider: 2208,
        modifier: 0.15,
    },
    spider: {
        divider: 2118,
        modifier: 0.08,
    },
    wolf: {
        divider: 1962,
        modifier: 0.015,
    },
    }

    //get slayer weights
    for (let slayerName in profile.slayer) {
        let slayerWeight = slayerWeights[slayerName];
        let experience = profile.slayer[slayerName].xp;

        if (experience <= 1000000) {
            weight.slayer[slayerName] = {
                weight: experience == 0 ? 0 : experience / slayerWeight.divider,
                overflow: 0,
            }
        } else {
            let base = 1000000 / slayerWeight.divider
            let remaining = experience - 1000000
            let modifier = slayerWeight.modifier
            let overflow = 0

            while (remaining > 0) {
                let left = Math.min(remaining, 1000000)
                overflow += Math.pow(left / (slayerWeight.divider * (1.5 + modifier)), 0.942)
                modifier += slayerWeight.modifier
                remaining -= left
            }

            weight.slayer[slayerName] = {
                weight: base + overflow,
                overflow: 0,
            }
        }
    }


    //get dungeon weights
    const dungeonWeights = {
        // Maxes cata weight at 9,500 at level 50
        catacomb: 0.0002149604615,
        // Maxes healer weight at 200 at level 50
        healer: 0.0000045254834,
        // Maxes mage weight at 200 at level 50
        mage: 0.0000045254834,
        // Maxes berserker weight at 200 at level 50
        berserk: 0.0000045254834,
        // Maxes archer weight at 200 at level 50
        archer: 0.0000045254834,
        // Maxes tank weight at 200 at level 50
        tank: 0.0000045254834,
    }
    let dungeonXpData = profile.dungeons ? Object.assign({catacomb: profile.dungeons.dungeon_types.catacombs}, profile.dungeons.player_classes) : {};
    for (let xpType in dungeonXpData) {
        let percentageModifier = dungeonWeights[xpType];
        let experience = dungeonXpData[xpType].experience;

        let level = 0;
        let table = constants.xp_table_catacombs;
        let xpRemaining = experience;

        for (let i = 0; i < table.length && xpRemaining >= table[i]; i++) {
            xpRemaining -= table[i];
            level = i;
        }
        level += xpRemaining / table[level+1]; //add on progress

        let base = Math.pow(level, 4.5) * percentageModifier

        if (experience <= 569809640) {
            weight.dungeons[xpType] = {
                weight: base,
                overflow: 0,
            }
        } else {
            let remaining = experience - 569809640
            let splitter = (4 * 569809640) / base

            weight.dungeons[xpType] = {
                weight: Math.floor(base),
                overflow: Math.pow(remaining / splitter, 0.968),
            }
        }
    }

    //get total weights
    let totalWeight = {
        weight: 0,
        overflow: 0,
        all: 0
    }
    for (let category in weight) {
        let categoryAll = 0;
        for (let label in weight[category]) {
            totalWeight.weight += weight[category][label].weight;
            totalWeight.overflow += weight[category][label].overflow;
            categoryAll += weight[category][label].weight + weight[category][label].overflow;
        }
        weight[category].all = categoryAll;
    }
    totalWeight.all = totalWeight.weight + totalWeight.overflow;
    weight.total = totalWeight;
    return weight
}
    