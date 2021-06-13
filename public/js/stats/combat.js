/* eslint-disable no-unused-vars, no-undef */

function loadCombat(profileData) {
    //find combat items
    let weapons = [];
    let talismans = [];
    for (let inventory of profileData.inventories) {
        console.log(inventory.contents)
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
    console.log(weapons,talismans);
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