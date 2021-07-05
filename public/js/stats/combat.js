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

    /* WEAPONS */
    let weaponSelector = makeInventorySelector(weapons, {cols: 7, rarityColor: true});
    document.querySelector("#weapon-container").appendChild(weaponSelector);

    /* TALISMANS */

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
    console.log(rarityCounts, talismanBaseStats);

    document.querySelector("#talismans-container").appendChild(makeInventoryViewer(activeTalismans,{cols: 11}));


    /* stats */
    let statsDisplay = makeStatsDisplay("",{"dmg": 0, "str": 0, "cd": 0, "cc": 0, "as": 0, "int": 0, "fer": 0});
    document.querySelector("#stats-display").appendChild(statsDisplay);

    //define additive stat functions, these are based on immutable profile data and will never change
    let BASE_STATS = () => ({cc: 30, cd: 50, int: 0}); // 30 crit chance and 50 crit damage base stats **CREATED WITH ONLY COMBAT-RELEVANT STATS**
    let MELODY_HAIR = () => (activeTalismans.find(x => x.id == "MELODY_HAIR") ? {int: 26} : {}); // + 26 int for melody's hair, assume that no songs beyond La Vie en Rose completed
    let DEFUSE_KIT = () => ({int: 10}); //assume everyone has a completed defuse kit
    
    let fairySoulStats = {
        str: 0,
        cd: 0,
        def: 0,
        hp: 0,
        spd: 0
    }

    for (let i = 0; i < Math.floor(profileData.fairy_souls / 5); i++){
        fairySoulStats.str += (i + 1) % 5 == 0 && i < 225 ? 2 : 1;
        fairySoulStats.def += (i + 1) % 5 == 0 && i < 225 ? 2 : 1;
        fairySoulStats.hp += Math.min(3 + Math.floor(i / 2), 23);
        fairySoulStats.spd += (i + 1) % 10 == 0 ? 1 : 0;
    }

    let FAIRY_SOULS = () => fairySoulStats;

    let skillsStats = {
        str: 0,
        cc: 0,
        int: 0,
        def: 0,
        hp: 0,
        ad: 0,
        farmf: 0,
        minef: 0,
        foragf: 0,
    }
    
    for (let skill in profileData.skills) {
        if (skillBonuses[skill]) {
            let rewardTable = Array.from(Object.assign({length: 61},skillBonuses[skill])) //fill an array with the rewards, all elements will be empty except the ones where rewards cahnge
            for (let i = 1; i < rewardTable.length; i++) { //fill all the empty slots with the previous value
                if (!rewardTable[i]) rewardTable[i] = rewardTable[i-1];
            }
            for (let i = 1; i <= profileData.skills[skill].levelPure; i++) { //add the rewards for each achieved level to skillsStats
                for (let stat in rewardTable[i]) {
                    skillsStats[stat] += rewardTable[i][stat];
                }
            }
            console.log(skill, JSON.stringify(skillsStats))
        }
    }

    let SKILLS = () => skillsStats;

    console.log(FAIRY_SOULS(), SKILLS());

}