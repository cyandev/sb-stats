/* eslint-disable no-unused-vars, no-undef */
var statPipeline = Array.from({length:10},x=>[]);
const ADDATIVE_STATS = 0;

function loadCombat(profileData) {
    //find combat items
    let weapons = [];
    let talismans = [];
    for (let inventory of profileData.inventories) {
        for (let item of inventory.contents) {
            if (item.tags && item.tags.includes("WEAPON")) { //find weapons
                let weapon = {...item};
                weapon.origin = inventory.clean_name
                weapons.push(weapon);
            }
            if (item.tags && item.tags.includes("TALISMAN")) { //find talismans
                let talisman = {...item};
                talisman.origin = inventory.clean_name
                talismans.push(talisman);
            }
        }
    }

    //filter active talismans
    activeTalismans = {};
    inactiveTalismans = [];
    for (let talisman of talismans) {
        if (!talismanClassifier[talisman.id]) {
            activeTalismans[talisman.id] = talisman;
        } else if (activeTalismans[talismanClassifier[talisman.id]]) {
            if (rarityNum[talisman.rarity] > rarityNum[activeTalismans[talismanClassifier[talisman.id]].rarity]) {
                inactiveTalismans.push(activeTalismans[talismanClassifier[talisman.id]]); //move old to inactive
                activeTalismans[talismanClassifier[talisman.id]] = talisman; //set active to new
                continue;
            } 

            //check if rarity ties
            if ((rarityNum[talisman.rarity] < rarityNum[activeTalismans[talismanClassifier[talisman.id]].rarity]) || //dont allow lower rarity
            (talisman.origin != "Talisman Bag" && activeTalismans[talismanClassifier[talisman.id]].origin == "Talisman Bag") || //prefer talisman bag
            (talisman.origin != "Inventory" && activeTalismans[talismanClassifier[talisman.id]].origin == "Inventory")) { //prefer inventory
                inactiveTalismans.push(talisman);
                continue;
            }

            //it tied on rarity but made it through

            inactiveTalismans.push(activeTalismans[talismanClassifier[talisman.id]]); //move old to inactive
            activeTalismans[talismanClassifier[talisman.id]] = talisman; //set active to new
        } else {
            activeTalismans[talismanClassifier[talisman.id]] = talisman;
        }
        
    }
    //make activeTalismans into array
    activeTalismans = Object.keys(activeTalismans).map(x=>activeTalismans[x]);

    //find talisman base stats + rarity counts
    let rarityCounts = {
        COMMON: 0,
        UNCOMMON: 0,
        RARE: 0,
        EPIC: 0,
        LEGENDARY: 0,
        MYTHIC: 0
    }
    let talismanBaseStats = {}
    for (let talisman of activeTalismans) {
        rarityCounts[talisman.rarity]++;
        for (let stat in talisman.baseStats) {
            if (!talismanBaseStats[stat]) {
                talismanBaseStats[stat] = talisman.baseStats[stat]
            } else {
                talismanBaseStats[stat] += talisman.baseStats[stat]
            }
        }
    }
}

function staticStatsModifier(stats) {
    return (total) => {
        for (stat in stats) total[stat] += stats[stat];
    }
}

function multiplicativeStatsModifier(stats) {
    return (total) => {
        for (stat in stats) total[stat] *= stats[stat];
    }
}