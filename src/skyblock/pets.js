let util = require("../util.js");
let constants = require("../constants.js");

module.exports = async (profileAPI, playerData) => {
    //get pets
    let pets = profileAPI.members[playerData.uuid].pets;
    //sort pets + make pets into inventory contents
    if (pets) {
      // make into inventory
        pets = pets.map((pet) => {
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
            if (["PET_ITEM_VAMPIRE_FANG","PET_ITEM_JERRY_3D_GLASSES"].includes(pet.heldItem)) {
                pet.tier = "MYTHIC";
            }
            //get the pet's level
            let remainingXp = pet.exp;
            let level;
            for (level = 1; level < 100 && remainingXp >= constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]]; level++) {
                remainingXp -= constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]];
            }
            
            let out = {
                name: `§r[LVL ${level}] ${pet.type.split("_").map(x => x[0] + x.slice(1).toLowerCase()).join(" ")}`,
                lore: [
                    `§8${constants.pets[pet.type].type[0].toUpperCase() + constants.pets[pet.type].type.slice(1)} Pet`,
                    "",
                    level != 100 ? `§r${(remainingXp / constants.petLeveling.table[level + constants.petLeveling.rarityOffset[pet.tier]] * 100).toFixed(2)}% to LVL ${level+1}` : "§bMAX LEVEL",
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
                skin: constants.pets[pet.type].skin,
                rarity: pet.tier,
                active: pet.active,
                xp: pet.exp,
                level,
                remainingXp,
                id: pet.type
            }
    
            //finish making item
            if (out.lore[7] == "") { //remove held item description if there is none
                out.lore.splice(7,1);
            }
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
        pets.sort((a,b) => {
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
        return pets;
    } else {
      return [];
    }
}