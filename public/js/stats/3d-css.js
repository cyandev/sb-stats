/* eslint-disable no-unused-vars, no-undef */
document.body.style.setProperty("--upx", 1 * Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / 100);
document.querySelector("#playerModel").style.setProperty("--upxh", 1 * Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 100 *1.5);

window.addEventListener("resize", () => {
    document.body.style.setProperty("--upx", 1 * Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / 100);
    document.querySelector("#playerModel").style.setProperty("--upxh", 1 * Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 100 *1.5);
})

function setChestplate(type,skin="") {
    for (let face of document.querySelector("#model-container").querySelectorAll("#torso.armor:not(.leggings) img.face")) {
        face.src = type == "skull" ? skin : `/img/armor/${type}/chestplate.png`;
    }
    for (let face of document.querySelector("#model-container").querySelectorAll(".arm.armor img.face")) {
        face.src = type == "skull" ? skin : `/img/armor/${type}/chestplate.png`;
    }
}
function setLeggings(type,skin="") {
    for (let face of document.querySelector("#model-container").querySelectorAll(".leggings img.face")) {
        face.style.backgroundImage = type == "skull" ? `url(${skin})` : `url("/img/armor/${type}/leggings.png")`;
    }
}
function setHelmet(type,skin="") {
    for (let face of document.querySelector("#model-container").querySelectorAll("#head.armor img.face")) {
        face.src = type == "skull" ? skin : `/img/armor/${type}/helmet.png`;
        face.style.backgroundImage = type == "skull" ? `url("${skin}")` : `url("/img/armor/none/helmet.png")`;
    }
}
function setBoots(type,skin="") {
    for (let face of document.querySelector("#model-container").querySelectorAll(".leg.armor:not(.leggings) img.face")) {
        face.src = type == "skull" ? skin : `/img/armor/${type}/boots.png`;
    }
}

let CLASS_TO_ARMOR = {
    "none0" : ["none","helmet"],
    "none1" : ["none","chestplate"],
    "none2" : ["none","leggings"],
    "none3" : ["none","boots"],
    "icon-298_0": ["leather","helmet"],
    "icon-299_0": ["leather","chestplate"],
    "icon-300_0": ["leather","leggings"],
    "icon-301_0": ["leather","boots"],
    "icon-302_0": ["chainmail","helmet"],
    "icon-303_0": ["chainmail","chestplate"],
    "icon-304_0": ["chainmail","leggings"],
    "icon-305_0": ["chainmail","boots"],
    "icon-306_0": ["iron","helmet"],
    "icon-307_0": ["iron","chestplate"],
    "icon-308_0": ["iron","leggings"],
    "icon-309_0": ["iron","boots"],
    "icon-310_0": ["diamond","helmet"],
    "icon-311_0": ["diamond","chestplate"],
    "icon-312_0": ["diamond","leggings"],
    "icon-313_0": ["diamond","boots"],
    "icon-314_0": ["gold","helmet"],
    "icon-315_0": ["gold","chestplate"],
    "icon-316_0": ["gold","leggings"],
    "icon-317_0": ["gold","boots"],
    "icon-397_3": [null,"skull"],
}
async function updateArmor() {
    let armor = Array.from(document.querySelectorAll("#armor-inv .item-cell"));
    if (armor.every(x=>x.item.id && x.item.id.includes("SORROW"))) { //fancy sorrow armor invis
        for (let face of document.querySelector("#model-container").querySelectorAll("img.face.player")) {
            face.style.opacity = 0.4;
        }
    } else {
        for (let face of document.querySelector("#model-container").querySelectorAll("img.face.player")) {
            face.style.opacity = 1;
        }
    }
    for (let itemCell of armor) { //make armors
        let {item} = itemCell;
        let itemClass = item.inventoryClass || `none${armor.indexOf(itemCell)}`;
        try {
            if (CLASS_TO_ARMOR[itemClass][0] == "leather") {
                switch (CLASS_TO_ARMOR[itemClass][1]) {
                    case "helmet": //use skull because it gives us the ability to input a custom skin, the one build in colorItem()
                        setHelmet("skull", await colorItem(`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}.png`,`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}_overlay.png`,item.leatherColor));
                        break;
                    case "chestplate":
                        setChestplate("skull", await colorItem(`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}.png`,`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}_overlay.png`,item.leatherColor));
                        break;
                    case "leggings":
                        console.log(await colorItem(`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}.png`,`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}_overlay.png`,item.leatherColor))
                        setLeggings("skull", await colorItem(`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}.png`,`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}_overlay.png`,item.leatherColor));
                        break;
                    case "boots":
                        setBoots("skull", await colorItem(`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}.png`,`/img/armor/leather/${CLASS_TO_ARMOR[itemClass][1]}_overlay.png`,item.leatherColor));
                }
            } else {
                switch (CLASS_TO_ARMOR[itemClass][1]) {
                    case "helmet":
                        setHelmet(CLASS_TO_ARMOR[itemClass][0]);
                        break;
                    case "chestplate":
                        setChestplate(CLASS_TO_ARMOR[itemClass][0]);
                        break;
                    case "leggings":
                        setLeggings(CLASS_TO_ARMOR[itemClass][0]);
                        break;
                    case "boots":
                        setBoots(CLASS_TO_ARMOR[itemClass][0]);
                        break;
                    case "skull":
                        setHelmet("skull", item.skin);
                        break;
                    default:
                        console.log(`ITEM CAUSED ERROR:`, item)
                }
            }
        } catch (e) {console.log(item,e)}
    }
}

function updatePet() {
    for (let face of document.querySelector("#model-container").querySelectorAll("#pet .face")) {
        face.src = document.querySelector("#pets .inv-view").checked.skin;
        face.style.backgroundImage = `url("${document.querySelector("#pets .inv-view").checked.skin}")`;
    }
}