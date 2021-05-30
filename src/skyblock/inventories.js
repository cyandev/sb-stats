let util = require("../util.js");
let minecraftItems = require('minecraft-items');

module.exports = async (profileAPI,playerData) => {
    let inventories = [];
    let invNames = ["inv_contents","ender_chest_contents","personal_vault_contents","wardrobe_contents","quiver","potion_bag","talisman_bag","fishing_bag","candy_inventory_contents","inv_armor"];
    let invCleanNames = ["Inventory", "Ender Chest", "Personal Vault", "Wardrobe", "Quiver", "Potion Bag", "Talisman Bag", "Fishing Bag", "Candy Bag", "Armor"];
    
    //build inventories
    for (let i=0; i<=invNames.length; i++) {
        let label = invNames[i];
        if (profileAPI.members[playerData.uuid][label]) { //add the inventory to inventories
            inventories.push({
                name: label,
                clean_name: invCleanNames[i],
                contents: await getInventoryJSON((await util.nbtToJson(profileAPI.members[playerData.uuid][label].data)).i)
            });
        }
    }
    for (let i in profileAPI.members[playerData.uuid].backpack_contents) {
        inventories.push({
            name: `backpack_${i}`,
            clean_name: `Backpack ${i}`,
            contents: await getInventoryJSON((await util.nbtToJson(profileAPI.members[playerData.uuid].backpack_contents[i].data)).i)
        });
    }
    console.log(inventories)

    //put armor in wardrobe
    if (inventories.find(x=>x.name=="inv_armor") && inventories.find(x=>x.name=="wardrobe_contents")) {
        if (profileAPI.members[playerData.uuid].wardrobe_equipped_slots != -1) {
            let armor = inventories.find(x=>x.name=="inv_armor").contents.reverse();
            let offset = Math.floor((profileAPI.members[playerData.uuid].wardrobe_equipped_slot - 1) / 9) * 9 * 3;
            for (let i = 0; i < 4; i++) {
                inventories.find(x=>x.name=="wardrobe_contents").contents[offset + profileAPI.members[playerData.uuid].wardrobe_equipped_slot - 1 + 9 * i] = armor[i];
            }
            inventories.find(x=>x.name=="inv_armor").contents.reverse()
        }
    }

    return inventories;
}

async function getInventoryJSON(contents) {
    let output = [];
    for (let item of contents) {
        try {
            //find minecraftItems item
            if (item.tag) {
                var mcItem = minecraftItems.get(item.id + ":" + item.Damage);
                if (!mcItem) {
                    mcItem = minecraftItems.get(item.id);
                }

                //build item
                var out = {
                    name: item.tag.display ? item.tag.display.Name : "",
                    lore: item.tag.display ? item.tag.display.Lore : [],
                    id: item.tag.ExtraAttributes ? item.tag.ExtraAttributes.id : "NULL",
                    reforge: item.tag.ExtraAttributes ? item.tag.ExtraAttributes.modifier : "none",
                    count: item.Count,
                    inventoryClass: "icon-" + item.id + "_" + item.Damage,
                    tags: []
                }

                //add inventoryclass
                if (item.tag.ExtraAttributes && item.tag.ExtraAttributes.item_durability) {
                    out.inventoryClass = "icon-" + mcItem.id.replace(":","_")
                }

                //add rarity to the item
                let rarityMap = {
                    "§f": "COMMON",
                    "§a": "UNCOMMON",
                    "§9": "RARE",
                    "§5": "EPIC",
                    "§6": "LEGENDARY",
                    "§d": "MYTHIC",
                    "§c": "SPECIAL"
                }
                if (out.lore && out.lore.length > 0) {
                    Object.keys(rarityMap).forEach(code => {
                        if (out.lore[out.lore.length - 1].indexOf(code) == 0) {
                            out.rarity = rarityMap[code];
                        }
                    })
                }

                //add dungeon tag / stars
                if (out.lore && out.lore.length > 0 && out.lore[out.lore.length - 1].includes("DUNGEON")) {
                    out.tags.push("DUNGEON");
                    out.stars = (out.name.split("✪").length - 1);
                }
                if (out.lore && out.lore.length > 0) {
                    if (out.lore[out.lore.length - 1].includes("BOW")) {
                    out.tags.push("BOW");
                    out.tags.push("WEAPON");
                    out.enchantments = item.tag.ExtraAttributes.enchantments;
                    } else if (out.lore[out.lore.length - 1].includes("SWORD")) {
                    out.tags.push("SWORD");
                    out.tags.push("WEAPON");
                    out.enchantments = item.tag.ExtraAttributes.enchantments;
                    }
                }

                //add stats / cata level
                let statNames = {
                    "Damage": "dmg", 
                    "Strength": "str",
                    "Crit Chance": "cc",
                    "Crit Damage": "cd", 
                    "Bonus Attack Speed": "as", 
                    "Health": "hp", 
                    "Defense": "def", 
                    "Speed": "spd", 
                    "Intelligence": "int", 
                    "True Defense": "td",
                    "Sea Creature Chance": "scc",
                    "Ferocity": "fer",
                    "Farming Fortune": "farmf",
                    "Mining Fortune": "minef",
                    "Foraging Fortune": "foragf"
                }
                out.stats = {}; //stats w/ reforges
                out.baseStats = {}; //stats w/o reforges

                if (out.lore && out.lore.length > 0) {
                    Object.keys(statNames).forEach((stat) => {
                    out.lore.forEach((loreLine) => {
                        loreLine = loreLine.split(/§./).join(""); //strip formatting
                        let match = loreLine.match(RegExp( stat + String.raw`: ([+-\d\.]+)( HP|\%)?(?: \(\w+ ([+-\d\.]+)\2\) *)?(?: \([+-\d\.]+\2\) *)?(?:\(([+-\d\.]+)\2?\))?`)); //match with crazy regexp !!!SIMPLIFLY THIS, WE DONT CARE ABOUT THE DUNGEON STATS LISTED HERE ANYMORE!!!
                        if (match) {
                        if (match.index != 0) return; //make sure a match includes the start of the string so "Bonus Attack Speed" doesnt trigger "Speed"
                        out.stats[statNames[stat]] = Number(match[1]); //the non-dungeon stat
                        out.baseStats[statNames[stat]] = Number(match[1]) - (match[3] ? Number(match[3]) : 0);
                        
                        }
                    })
                    })
                }
                //item specific stats
                if (out.id == "DAY_CRYSTAL" || out.id == "NIGHT_CRYSTAL") {
                    out.stats.str += 2.5;
                    out.stats.def += 2.5;
                    out.baseStats.str += 2.5;
                    out.baseStats.def += 2.5;
                }
                if (out.id == "GRAVITY_TALISMAN") {
                    out.stats.str += 10;
                    out.stats.def += 10;
                    out.baseStats.str += 10;
                    out.baseStats.def += 10;
                }
                //check if player head, if so, include skin
                if (item.tag.SkullOwner) {
                    out.skin = JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value,"base64").toString()).textures.SKIN.url;
                }
        
                //check if leather, if so, include leatherColor
                if(mcItem && mcItem.name && mcItem.name.includes("Leather") && item.tag.ExtraAttributes.color) {
                    out.leatherColor = item.tag.ExtraAttributes.color.split(":")
                }

                //check if backpack, if so, get bp contents
                if (out.name.includes("Backpack") && item.tag.ExtraAttributes[item.tag.ExtraAttributes.id.toLowerCase() + "_data"]) {
                    let bpBuffer = Buffer.from(item.tag.ExtraAttributes[item.tag.ExtraAttributes.id.toLowerCase() + "_data"]);
                    let bp = await util.nbtBufToJson(bpBuffer);
                    out.contents = await getInventoryJSON(bp.i);
                }

                if (out.count <= 1) {
                    delete out.count
                }

                output.push(out);
            } else {
                output.push({});
            }

        } catch (err) {
            console.log("item caused error:",item,mcItem,out,err);
        }
    }
    return output;
}