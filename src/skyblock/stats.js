let constants = require("../constants.js");

module.exports = (profileAPI, playerData) => {
    //get stats
    let profileStats = profileAPI.members[playerData.uuid].stats;
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
                if (constants.statAlias[label]) label = constants.statAlias[label];
                if (sortedStats.kills.find(x => x[0] == label)) {
                sortedStats.jerry_event.find(x => x[0] == label)[1] += profileStats[stat];
                } else {
                sortedStats.jerry_event.push([label, profileStats[stat]]);
                }
            } else if (["chicken_race_best_time_2","foraging_race_best_time","end_race_best_time"].includes(stat)) {
                let label = stat.split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
                if (constants.statAlias[label]) label = constants.statAlias[label];
                if (sortedStats.kills.find(x => x[0] == label)) {
                sortedStats.races.find(x => x[0] == label)[1] += profileStats[stat];
                } else {
                sortedStats.races.push([label, (profileStats[stat] / 1000).toFixed(3) + "s"]);
                }
            } else if (["pet_milestone_ores_mined","pet_milestone_sea_creatures_killed"].includes(stat)) {
                let label = stat.split("_").map(x => (x ? x[0].toUpperCase() + x.slice(1) : x)).join(" ");
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
    return sortedStats;
}