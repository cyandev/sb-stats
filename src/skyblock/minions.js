let constants = require("../constants.js");
let bazaar = require("./bazaar.js")();
module.exports = async (profileAPI) => {
    let craftedGens = {};
    constants.minionNames.forEach((name) => {
        craftedGens[name] = Array.from({length:13}, () => 0) //use 0/1 for true/false to minify data storage
    })
    for (let uuid of Object.keys(profileAPI.members)) {
        if (profileAPI.members[uuid].crafted_generators) profileAPI.members[uuid].crafted_generators.forEach((id) => {
        let idNumSplit = id.split("_") // [ITEM_ID, TIER]
        let tier = idNumSplit.pop();
        let name = idNumSplit.join("_");
        if (!craftedGens[name]) {
            console.log(`Unknown minion name: ${name}`);
            craftedGens[name] = Array.from({length:12}, () => 0);
        }
        craftedGens[name][tier] = 1;
        })
    }

    //get missing minions + # crafted
    let missingMinions = []
    let minionsCrafted = 0;
    for (let name in craftedGens) {
        for (let tier = 1; tier <= 12; tier++) {
        if (!craftedGens[name][tier]) {
            let price;
            if (!constants.minionCrafts[name] || !constants.minionCrafts[name][tier]) {
                price = null;
            } else {
                price = ((await bazaar.data())[constants.minionCrafts[name][tier].item.replace("name", name)].quick_status.buyPrice * constants.minionCrafts[name][tier].quantity).toFixed(1);
            }
            missingMinions.push([name,tier,price])
        } else {
            minionsCrafted++;
        }
        }
    }
    let i = minionsCrafted;
    while (!constants.minionSlots[i]) i--;
    let minionSlots = constants.minionSlots[i];

    i = 1;
    while (Object.keys(constants.minionSlots)[i] <= minionsCrafted) i++;
    let nextTier = Object.keys(constants.minionSlots)[i] - minionsCrafted;

    let bonusSlots = 0;
    let slotUpgrades = [];
    if (profileAPI.community_upgrades && profileAPI.community_upgrades.upgrade_states) slotUpgrades = profileAPI.community_upgrades.upgrade_states.filter(x => x.upgrade == "minion_slots").sort((a,b) => b.tier - a.tier);
    if (slotUpgrades[0]) bonusSlots = slotUpgrades[0].tier;
    
    return {
        matrix: craftedGens,
        uniques: minionsCrafted,
        nextTier: nextTier,
        slots: minionSlots,
        bonusSlots: bonusSlots,
        missing: missingMinions.sort((a,b) => a[2] == b[2] ? 0 : !a[2] ? 1: !b[2] ?  -1: a[2] - b[2]),
    }
}