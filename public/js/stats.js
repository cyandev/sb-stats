// constants
const excludedSkills = ["carpentry","runecrafting","catacombs"];
const catacombsReward = [0,4,8,12,16,20,25,30,35,40,45,51,57,63,69,75,82,89,96,103,110,118,126,134,142,150,159,168,177.186,195,205,215,225,235,245,256,267,278,289,300];
//pet damage/stat bonus functions
function boostArmorStatsIfSet(ratio, set, armor, stats) {
  console.log(armor)
  if (armor.every((piece) => piece.id && piece.id.includes(set))) {
      armor.forEach((piece) => {
        for (let stat in stats) {
          stats[stat] += piece.stats[stat] ? piece.stats[stat] * ratio : 0
        }
      })
    }
}
var petFuncs = { /* ONLY COMBAT RELEVANT PERKS ADDED SO FAR */
  MEGALODON(pet,weapon,armor,stats,enemy) {
    boostArmorStatsIfSet(pet.level * 0.002, "SHARK_SCALE", armor, stats);
  },
  GRIFFIN(pet,weapon,armor,stats,enemy) {
    if (pet.rarity == "LEGENDARY") {
      console.log("GRIFFIN", 1 + 0.0015 * pet.level, stats.str)
      stats.str *= 1 + 0.0015 * pet.level
    }
  },
  BLAZE(pet,weapon,armor,stats,enemy) {
    boostArmorStatsIfSet(pet.level * 0.004, "BLAZE", armor, stats);
    // ADD CASE FOR HPBS
  },
  JERRY(pet,weapon,armor,stats,enemy) {
    if (pet.rarity == "LEGENDARY" && weapon.id == "ASPECT_OF_THE_JERRY") stats.dmg += 0.1 * pet.level
  },
  PIGMAN(pet,weapon,armor,stats,enemy) {
    if (weapon.id == "PIGMAN_SWORD") {
      stats.dmg += 0.4 * pet.level;
      stats.str += 0.25 * pet.level
    }
  },
  WITHER_SKELETON(pet,weapon,armor,stats,enemy) {
    // intentionally ignoring the last perk, will add it when I add "useAs" to this function
  },
  MAGMA_CUBE(pet,weapon,armor,stats,enemy) {
    if (pet.rarity == "LEGENDARY") boostArmorStatsIfSet(pet.level * 0.01, "EMBER", armor, stats);
  },
  FLYING_FISH(pet,weapon,armor,stats,enemy) {
    if (pet.rarity == "LEGENDARY") boostArmorStatsIfSet(pet.level * 0.003, "DIVER", armor, stats);
  },
  LION(pet,weapon,armor,stats,enemy) { // intentionally ignoring second perk
    switch (pet.rarity) {
      case "LEGENDARY":
        stats.dmg += 0.2 * pet.level;
        break;
      case "EPIC":
        stats.dmg += 0.15 * pet.level;
        break;
      case "RARE":
        stats.dmg += 0.1 * pet.level;
        break;
      case "UNCOMMON":
        stats.dmg += 0.05 * pet.level;
        break;
      case "COMMON":
        stats.dmg += 0.03 * pet.level;
        break;
    }
  },
  PARROT(pet,weapon,armor,stats,enemy) {
    if (pet.rarity == "LEGENDARY") stats.str += 5 + 0.25 * pet.level
  },
  ENDER_DRAGON(pet,weapon,armor,stats,enemy) {
    if (weapon.id == "ASPECT_OF_THE_DRAGONS") {
      stats.str += 0.5 * pet.level;
      stats.str += 0.3 * pet.level;
    }
    if (pet.rarity == "LEGENDARY") {
      for (let stat in stats) {
        if (!["dmg","ratio"].includes(stat)) stats[stat] *= 1 + 0.001 * pet.level
      }
    }
  },
  SQUID(pet,weapon,armor,stats,enemy) {
    if (weapon.id == "INK_WAND") {
      if (pet.rarity == "RARE") {
        stats.dmg += 0.3 * pet.level;
        stats.str += 0.1 * pet.level;
      }
      if (pet.rarity == "EPIC" || pet.rarity == "LEGENDARY") {
        stats.dmg += 0.4 * pet.level;
        stats.str = 0.2 * pet.level
      }
    }
  },
  SKELETON(pet,weapon,armor,stats,enemy) {
    if (weapon && weapon.tags.includes("BOW")) {
      switch (pet.rarity) {
        case "LEGENDARY":
          stats.ratio *= 1 + 0.002 * pet.level;
          break;
        case "EPIC":
          stats.ratio *= 1 + 0.002 * pet.level;
          break;
        case "RARE":
          stats.ratio *= 1 + 0.0015 * pet.level;
          break;
        case "UNCOMMON":
          stats.ratio *= 1 + 0.0015 * pet.level;
          break;
        case "COMMON":
          stats.ratio *= 1 + 0.001 * pet.level;
          break;
      }
    }
  },
  ZOMBIE(pet,weapon,armor,stats,enemy) { //omitted for now
  },
  HOUND(pet,weapon,armor,stats,enemy) {
    if (pet.rarity == "LEGENDARY") stats["as"] *= 1 + 0.001 * pet.level
  },
  TIGER(pet,weapon,armor,stats,enemy) {
    switch (pet.rarity) {
      case "LEGENDARY":
        stats.fer *= (1 + 0.01 * pet.level);
        break;
      case "EPIC":
        stats.fer *= (1 + 0.01 * pet.level);
        break;
      case "RARE":
        stats.fer *= (1 + 0.005 * pet.level);
        break;
      case "UNCOMMON":
        stats.fer *= (1 + 0.001 * pet.level);
        break;
      case "COMMON":
        stats.fer *= (1 + 0.001 * pet.level);
        break;
    }
  }
}
//helper functions
var rarityColorMap = {
  "COMMON": "§8",
  "UNCOMMON": "§a",
  "RARE": "§9",
  "EPIC": "§5",
  "LEGENDARY": "§6",
  "MYTHIC": "§d",
  "SPECIAL": "§c"
}
var minionNameMap = {"MITHRIL": "Mithril", "COBBLESTONE": "Cobbletone", "OBSIDIAN": "Obsidian", "GLOWSTONE": "Glowstone", "GRAVEL": "Gravel", "SAND": "Sand", "CLAY": "Clay", "ICE": "Ice", "SNOW": "Snow", "COAL": "Coal", "IRON": "Iron", "GOLD": "Gold", "DIAMOND": "Diamond", "LAPIS": "Lapis", "REDSTONE": "Redstone", "EMERALD": "Emerald", "QUARTZ": "Quartz", "ENDER_STONE": "Endstone", "WHEAT": "Wheat", "MELON": "Melon", "PUMPKIN": "Pumpkin", "CARROT": "Carrot", "POTATO": "Potato", "MUSHROOM": "Mushroom", "CACTUS": "Cactus", "COCOA": "Cocoa", "SUGAR_CANE": "Sugar Cane", "NETHER_WARTS": "Nether Wart", "FLOWER": "Flower", "FISHING": "Fishing", "ZOMBIE": "Zombie", "REVENANT": "Revenant", "SKELETON": "Skeleton", "CREEPER": "Creeper", "SPIDER": "Spider", "TARANTULA": "Tarantula", "CAVESPIDER": "Cave Spider", "BLAZE": "Blaze", "MAGMA_CUBE": "Magma", "ENDERMAN": "Enderman", "GHAST": "Ghast", "SLIME": "Slime", "COW": "Cow", "PIG": "Pig", "CHICKEN": "Chicken", "SHEEP": "Sheep", "RABBIT": "Rabbit", "OAK": "Oak", "SPRUCE": "Spruce", "BIRCH": "Birch", "DARK_OAK": "Dark Oak", "ACACIA": "Acacia", "JUNGLE": "Jungle"}
/* MC TEXT FORMATTING */
var obfuscators = [];
var styleMap = {
    '§0': 'color:#000000',
    '§1': 'color:var(--blue)',
    '§2': 'color:var(--green)',
    '§3': 'color:var(--cyan)',
    '§4': 'color:var(--red)',
    '§5': 'color:var(--purple)',
    '§6': 'color:var(--yellow)',
    '§7': 'color:#AAAAAA',
    '§8': 'color:#555555',
    '§9': 'color:var(--blue)',
    '§a': 'color:var(--green)',
    '§b': 'color:var(--cyan)',
    '§c': 'color:var(--red)',
    '§d': 'color:var(--pink)',
    '§e': 'color:var(--yellow)',
    '§f': 'color:var(--white)',
    '§l': 'font-weight:bold',
    '§m': 'text-decoration:line-through',
    '§n': 'text-decoration:underline',
    '§o': 'font-style:italic',
};
function obfuscate(string, elem) {
    var magicSpan,
        currNode;
    if(string.indexOf('<br>') > -1) {
        elem.innerHTML = string;
        for(var j = 0, len = elem.childNodes.length; j < len; j++) {
            currNode = elem.childNodes[j];
            if(currNode.nodeType === 3) {
                magicSpan = document.createElement('span');
                magicSpan.innerHTML = currNode.nodeValue;
                elem.replaceChild(magicSpan, currNode);
                init(magicSpan);
            }
        }
    } else {
        init(elem, string);
    }
    function init(el, str) {
        var i = 0,
            obsStr = str || el.innerHTML,
            len = obsStr.length;
        obfuscators.push( window.setInterval(function () {
            if(i >= len) i = 0;
            obsStr = replaceRand(obsStr, i);
            el.innerHTML = obsStr;
            i++;
        }, 0) );
    }
    function randInt(min, max) {
        return Math.floor( Math.random() * (max - min + 1) ) + min;
    } 
    function replaceRand(string, i) {
        var randChar = String.fromCharCode( randInt(64, 95) );
        return string.substr(0, i) + randChar + string.substr(i + 1, string.length);
    }
}
function applyCode(string, codes) {
    var elem = document.createElement('span'),
        obfuscated = false;
    string = string.replace(/\x00*/g, '');
    for(var i = 0, len = codes.length; i < len; i++) {
        elem.style.cssText += styleMap[codes[i]] + ';';
        if(codes[i] === '§k') {
            obfuscate(string, elem);
            obfuscated = true;
        }
    }
    if(!obfuscated) elem.innerHTML = string;
    return elem;
}
function parseStyle(string) {
    var codes = string.match(/§.{1}/g) || [],
        indexes = [],
        apply = [],
        tmpStr,
        deltaIndex,
        noCode,
        final = document.createDocumentFragment(),
        i;
    string = string.replace(/\n|\\n/g, '<br>');
    for(i = 0, len = codes.length; i < len; i++) {
        indexes.push( string.indexOf(codes[i]) );
        string = string.replace(codes[i], '\x00\x00');
    }
    if(indexes[0] !== 0) {
        final.appendChild( applyCode( string.substring(0, indexes[0]), [] ) );
    }
    for(i = 0; i < len; i++) {
    	indexDelta = indexes[i + 1] - indexes[i];
        if(indexDelta === 2) {
            while(indexDelta === 2) {
                apply.push ( codes[i] );
                i++;
                indexDelta = indexes[i + 1] - indexes[i];
            }
            apply.push ( codes[i] );
        } else {
            apply.push( codes[i] );
        }
        if( apply.lastIndexOf('§r') > -1) {
            apply = apply.slice( apply.lastIndexOf('§r') + 1 );
        }
        tmpStr = string.substring( indexes[i], indexes[i + 1] );
        final.appendChild( applyCode(tmpStr, apply) );
    }
    return final;
}
function clearObfuscators() {
    var i = obfuscators.length;
    for(;i--;) {
        clearInterval(obfuscators[i]);
    }
    obfuscators = [];
}
/* END MC TEXT FORMATTING */
function cleanFormatNumber(n) {
  n = n.toFixed(0);
  if (n.length <= 3) return n;
  const post = ["","k","m","b","t","q"];
  return n.slice(0,3) / ((n.length - 3) % 3 == 0 ? 1: Math.pow(10,3 - n.length % 3)) + post[Math.floor((n.length-1) / 3)]
}
function transformWardrobe(contents) {
  wardrobeNew = [];
  for (let row = 0; row < 4; row++) {
    for (let page = 0; page < contents.length / 9 / 4; page++) {
      let pageContents = contents.slice(page * 9 * 4, (page + 1) * 9 * 4);
      wardrobeNew = wardrobeNew.concat(pageContents.slice(row * 9, (row + 1) * 9))
    }
  }
  return wardrobeNew;
}

function makeInventoryViewer(contents,options={cols: 9, hasHotbar: true, cellSize: "6vw", rarityColor: false}) {
  //load in options
  let opt={cols: 9, hasHotbar: true, cellSize: "6vw", rarityColor: false};
  for (let key in options) {
    opt[key] = options[key];
  }
  if (opt.hasHotbar) { //shift hotbar to bottom if it exists
    contents = contents.slice(opt.cols).concat(contents.slice(0,opt.cols));
  }
  //create the grid
  let grid = document.createElement("div");
  grid.style.setProperty("--cellSize", parseInt(opt.cellSize) * Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / 100);
  window.addEventListener("resize", () => grid.style.setProperty("--cellSize", parseInt(opt.cellSize) * Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / 100))
  grid.classList.add("inv-view")
  grid.style.display = "inline-grid";
  grid.style.gridTemplateColumns = `repeat(${opt.cols}, ${opt.cellSize})`;
  grid.style.gridAutoRows = opt.cellSize;
  //add the items
  contents.forEach((item,i) => {
    //make base itemCell
    let itemCell = document.createElement("div");
    if (opt.rarityColor && item.rarity) itemCell.style.boxShadow = "inset 0vw 0vw 0.5vw 0.1vw " + styleMap[rarityColorMap[item.rarity]].split(":")[1];
    itemCell.innerHTML = `
    <div class="item-icon"></div>
    <span class="item-count"></span>
    `
    itemCell.item = item;
    itemCell.classList.add("item-cell");
    if (item && item.faces) { //if the item has faces, make an itemHead with said faces
      let itemHead = document.createElement("div");
      itemHead.classList.add("item-head");
      itemHead.innerHTML = `
      <img class="face cube"></div>
      <img class="face back cube"></div>
      <img class="side cube"></div>
      <img class="top cube"></div>
      `
      Object.keys(item.faces).forEach(face => {
        Array.from(itemHead.querySelectorAll(`.${face}`)).forEach(img => {
          img.src = item.faces[face];
          img.failCount = 0;
          img.onerror = () => {
            img.failCount++;
            console.log("image", img, "failed to load");
            if (img.failCount < 5) setTimeout(() => img.src = item.faces[face], 1000)
          };
        });
      })
      itemCell.appendChild(itemHead);
      itemCell.querySelector(".item-icon").style.display = "none"; //hide the icon if there is a head
    } else if (item && item.icon) { //if theres a fancy icon
      itemCell.querySelector(".item-icon").style.backgroundImage = `url(${item.icon})`
    } else if (item && item.inventoryClass) { //if the item isnt empty
      itemCell.querySelector(".item-icon").classList.add(item.inventoryClass);
    } else { //if there is no item
      itemCell.querySelector(".item-icon").style.backgroundImage = "none";
    }

    if (item && item.count > 1) { //make the count appear if there are more than 1 item in a slot
      itemCell.querySelector(".item-count").innerText = item.count;
    }
    //add hover based listeners
    itemCell.addEventListener("mouseenter", () => setHoverTo(item));
    itemCell.addEventListener("mouseleave", () => setHoverTo(false));
    itemCell.addEventListener("mousedown", () => {
      boxLocked = !boxLocked;
      if (boxLocked) {
        setTimeout(() => {
          window.addEventListener("mousedown", unlockBox);
        }, 1);
      }
    });
    grid.appendChild(itemCell); //add the itemcell to the grid
  })
  return grid
}
function makeInventorySelector(contents,opt) {
  let view = makeInventoryViewer(contents,opt ? opt : {cols: 12,hasHotbar:false});
  view.style.gridAutoRows = "8vw";
  for (let cell of view.children) {
    if (cell.querySelector(".item-head")) cell.querySelector(".item-head").style.transform = "translateY(-1vw) rotateY(45deg) rotateX(-15deg) rotateZ(-15deg)"
    cell.querySelector(".item-icon").style.transform = "translate(-50%, -50%) translateY(-1vw) scale(calc(var(--cellSize) / 128 * 0.8))"
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("item-selector");
    checkbox.addEventListener("mouseup", (e) => {
      unlockBox(e);
      for (let check of view.querySelectorAll(".item-selector")) {
        if (check != checkbox) check.checked = false;
      }
      setTimeout(() => checkbox.checked = true, 1); //delayed because click toggles it
      view.checked = cell.item;
      if (view.onUpdate) view.onUpdate(); //call event listener
    })
    cell.appendChild(checkbox);
  }
  if (view.children.length > 1) {
    view.checked = contents[1];
    view.children[1].querySelector(".item-selector").checked = true;
  }
  return view;
}

function makeStatsDisplay(label,stats) {
  let statToIcon = {
    "as": "⚔",
    "cc": "☣",
    "cd": "☠",
    "dmg": "",
    "str": "❁",
    "int": "✎",
    "fer": "⫽",
  }
  let statToColor = {
    "as": "var(--yellow)",
    "cc": "var(--blue)",
    "cd": "var(--blue)",
    "dmg": "#000000",
    "str": "var(--red)",
    "int": "var(--cyan)",
    "fer": "var(--red)"
  }
  let statsDisplay = document.createElement("div");
  statsDisplay.classList.add("stats-display");
  statsDisplay.innerStats = stats;
  statsDisplay.stats = statsDisplay.innerStats;
  statsDisplay.dependers = [];
  statsDisplay.dependencies = []; //all of the other statsDisplays that are summed in this one
  statsDisplay.addDependency = (other) => {
    statsDisplay.dependencies.push(other);
    other.dependers.push(statsDisplay);
    other.onupdate.push(statsDisplay.update);
    statsDisplay.update();
  }
  statsDisplay.update = () => {statsDisplay.onupdate.forEach(f => f())}; //stats has changed, change it and call all onupdate funcs
  statsDisplay.onupdate = [() => {
    console.log("updated " + label)
    let stats = {};
    for (let other of statsDisplay.dependencies.concat({stats: statsDisplay.innerStats})) {
      for (let stat in other.stats) {
        if (!stats[stat]) {
          stats[stat] = other.stats[stat];
        } else {
          stats[stat] += other.stats[stat];
        }
      }
    }
    console.log(stats)
    statsDisplay.stats = stats;
    statsDisplay.innerHTML = ""; //clear it out
    if (label) {
      var domLabel = document.createElement("div");
      domLabel.classList.add("label");
      domLabel.innerText = label;
      statsDisplay.appendChild(domLabel);
    }
    for (let stat in stats) {
      if (stat in statToIcon) {
        //create colored preview
        let icon = document.createElement("div");
        icon.classList.add("icon")
        icon.style.background = statToColor[stat];
        icon.innerText = statToIcon[stat] + " " + stat.toUpperCase();
        statsDisplay.appendChild(icon);
        let number = document.createElement("input");
        number.type = "number"
        number.value = Math.round(stats[stat]);
        number.addEventListener("input", () => {
          statsDisplay.stats[stat] = Number(number.value);
          statsDisplay.dependers.forEach(d => d.update());
        })
        statsDisplay.appendChild(number);
      }
    }
  }];
  statsDisplay.update();
  return statsDisplay;
}
function doDamageCalc(petRatio,weapon,armor,pet,profileData,stats,enemy={undead:false,ender:false,spider:false,gk:false}) {
  stats = Object.assign({},stats);
  //stats that dont appear in stats menu
  if (armor[0] && armor[0].id == "TARANTULA_HELMET") stats.str += Math.floor(stats.cd/10);

  
  let baseDmg = (5 + stats.dmg + Math.floor(stats.str / 5)) * (1 + stats.str / 100) * (1 + stats.cd / 100);
  let damageMultiplier = 1 + profileData.skills.find(skill => skill.name=="combat").levelPure * 0.04;
  let enchantmentsBuffs = {
    "sharpness": 0.05,
    "smite": 0.08 * enemy.undead,
    "bane_of_arthropods": 0.08 * enemy.spider,
    "ender_slayer": 0.12 * enemy.ender,
    "giant_killer": enemy.gk * 0.25 / (weapon.enchantments ? weapon.enchantments["giant_killer"]: 1), //capped at 25% no matter the level
    "first_strike": 0.25,
    "power":  0.08,
  }
  for (let enchant in weapon.enchantments) {
    if (enchantmentsBuffs[enchant]) {
      damageMultiplier += enchantmentsBuffs[enchant] * weapon.enchantments[enchant];
    }
  }
  //add fancy damage bonuses
  let extraBonus = petRatio;
  if (enemy.undead) console.log(extraBonus)
  //dungeon skeleton sets SKELETON_TYPE
  if (weapon.tags && weapon.tags.includes("BOW")) {
    armor.forEach((piece) => {
      if (piece.id && piece.id.includes("SKELETON")) {
        extraBonus += 0.05;
      }
    })
    if (armor.every((piece) => piece.id && piece.id.includes("SKELETON_SOLDIER")) || armor.every((piece) => piece.id && piece.id.includes("SKELETON_MASTER"))) {
      extraBonus += 0.25;
    }
  }
  //tuxes TYPE_TUXEDO
  if (armor.slice(1).every((piece) => piece.id && piece.id.includes("CHEAP_TUXEDO"))) {
    extraBonus *= 1.5
  }
  if (armor.slice(1).every((piece) => piece.id && piece.id.includes("FANCY_TUXEDO"))) {
    extraBonus *= 2
  }
  if (armor.slice(1).every((piece) => piece.id && piece.id.includes("ELEGANT_TUXEDO"))) {
    extraBonus *= 2.5
  }
  //sword bonuses
  if (weapon.id == "REAPER_SWORD" && enemy.undead) {
    extraBonus *= 3
  }
  if ((weapon.id == "SCORPION_FOIL" && enemy.spider) || (weapon.id == "REVENANT_SWORD" && enemy.undead)) {
    extraBonus *= 2.5
  }
  if ((weapon.id == "END_SWORD" && enemy.ender) || (weapon.id == "SPIDER_SWORD" && enemy.spider) || (weapon.id == "UNDEAD_SWORD" && enemy.undead) || (weapon.id == "SAVANAH_BOW")) {
    extraBonus *= 2
  }
  let damage = [baseDmg * damageMultiplier * extraBonus];
  //ranged base damages
  if (weapon.id == "LIVID_DAGGER") {
    damage = [damage[0]*1, damage[0]*2]; //normal crit, backstab 
  }
  //ranged damages
  if (weapon.reforge == "fabled") {
    damage.forEach((pt) => damage.push(pt * 1.2)) //normal damage, max crit (+20%)
  }
  if (weapon.reforge == "precise") {
    damage.forEach((pt) => damage.push(pt * 1.1)) //normal damage, headshot damage (+10%)
  }
  if (weapon.id == "MACHINE_GUN_BOW") { //normal damage, machine gun damage
    damage.forEach((pt) => damage.push(pt * 0.7))
  }
  return damage
}
/* Hover Box Listeners + Functions */
var mouseX = 0;
var mouseY = 0;
var boxLocked = false;
var boxItem = {}
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (document.querySelector("#item-hover").style.display != "none" && !boxLocked) { //if the hover is shown and not locked
    //check if hover fits on right side
    if (document.querySelector("#item-hover").offsetWidth + mouseX + window.innerWidth / 100 <= window.innerWidth) {
      document.querySelector("#item-hover").style.left = mouseX + window.innerWidth / 100 + "px";
    } else {
      document.querySelector("#item-hover").style.left = mouseX - document.querySelector("#item-hover").offsetWidth - window.innerWidth / 100 + "px";
    }

    //check if normal positioning is too high / low
    if ((window.innerHeight - document.querySelector("#item-hover").offsetHeight) / 2 + document.querySelector("#item-hover").offsetHeight < mouseY) {
      document.querySelector("#item-hover").style.top = mouseY - document.querySelector("#item-hover").offsetHeight + "px"
    } else if ((window.innerHeight - document.querySelector("#item-hover").offsetHeight) / 2 > mouseY) {
      document.querySelector("#item-hover").style.top = mouseY;
    } else {
      document.querySelector("#item-hover").style.top = (window.innerHeight - document.querySelector("#item-hover").offsetHeight) / 2 + "px";
    }
  }
})
function unlockBox(e) {
  if (e.target.id == "item-hover-lore" || e.target.parentElement.id == "item-hover-lore") return; //ignore clicks on hover lore
  boxLocked = false;
  updateBoxContents();
  window.removeEventListener("mousedown",unlockBox);
}
function setHoverTo(item) {
  boxItem = item;
  if (!boxLocked) updateBoxContents()
}
function updateBoxContents() {
  if (!boxItem || !boxItem.name) {
    document.querySelector("#item-hover").style.display = "none";
    return;
  }
  document.querySelector("#item-hover").style.display = "initial";
  document.querySelector("#item-hover-header").innerHTML = boxItem.name.split(/§./).join("");
  document.querySelector("#item-hover-lore").innerHTML = "";
  if (boxItem.lore && boxItem.lore.length > 0) document.querySelector("#item-hover-lore").appendChild(parseStyle(boxItem.lore.join("§r<br>")));

  if (boxItem.rarity) {
    document.querySelector("#item-hover-header").style.background = styleMap[rarityColorMap[boxItem.rarity]].split(":")[1];
  } else {
    document.querySelector("#item-hover-header").style.background = styleMap["§8"].split(":")[1];
  }


  if (boxItem.contents) {
    document.querySelector("#item-hover-lore").innerHTML += "<br>"
    document.querySelector("#item-hover-lore").appendChild(makeInventoryViewer(boxItem.contents,{hasHotbar: false, cellSize: "2.5vw"}))
  }
}

document.querySelector("#item-hover").style.display = "none";

/* Data Loading Funciton */

(async () => {
  let username = window.location.href.split("/")[4];
  let profile = window.location.href.split("/").length > 4 ? window.location.href.split("/")[5] : "default"
  let data = await (await fetch(window.location.origin + "/api/data/" + username)).json();
  if (!data) {
    window.location.href = window.location.origin + "?err=Invalid Player!";
    return;
  }
  username = data.name;
  console.log(data)
  // REDO WITH "currentProfile" API
  let profileArr = Object.keys(data.profiles).map((x) => data.profiles[x]);
  let profileData = profileArr.find((x) => x.cute_name == profile)
  if (!profileData) {
    profileData = profileArr.sort((a,b) => b.last_save - a.last_save)[0];
    if (profileData) {
      profile = profileData.cute_name
    } else {
      window.location.href = window.location.origin + "?err=No Profiles Found";
      return;
    }
  }
  window.history.pushState({}, "", `/stats/${username}/${profile}`);
  document.getElementById("playerName").innerHTML = `<a href='/guild/${data.guild}'>[${data.guild}]</a>  ` + (data.rank ? `<span style="color:${data.color}">[${data.rank.split("_PLUS").join(`${data.rank.includes("MVP") ? `<span style="color:${data.plus}">+</span>` : "+"}`)}] ${username}</span>` : username);
  document.getElementById("profileName").innerText = profile;
  console.log(profileData);

  //load basic stats
  if (profileData.balance) {
    document.querySelector("#stats-text").innerText += `Bank: ${cleanFormatNumber(profileData.balance)}, `;
  }
  document.querySelector("#stats-text").innerText += `Purse: ${cleanFormatNumber(profileData.purse)}, `;
  document.querySelector("#stats-text").innerText += `Fairy Souls: ${profileData.fairy_souls}, `;
  document.querySelector("#stats-text").innerText += `Weight: ${profileData.weight.total.all.toFixed(3)} (${profileData.weight.skills.all.toFixed(0)} Skill, ${profileData.weight.dungeons.all.toFixed(0)} Cata, ${profileData.weight.slayer.all.toFixed(0)} Slayer), `
  document.querySelector("#stats-text").innerText += `Skill Average: ${profileData.averageSkillProgress}, `;
  document.querySelector("#stats-text").innerText += `True Skill Average: ${profileData.averageSkillPure}`

  //load skills
  profileData.skills.forEach((skill) => {
    let element = document.createElement("div");
    element.classList.add("skill")
    element.innerHTML = "<span class='skillName'></span><span class='skillLevel'></span><div class='bar'><span class='skillBarFill'></span><span class='skillBarText'></span></div>" //import some template HTML into div
    element.querySelector(".skillName").innerText = skill.name.charAt(0).toUpperCase() + skill.name.slice(1);
    element.querySelector(".skillLevel").innerText = skill.levelPure;
    if (skill.levelPure == skill.maxLevel) {
      element.querySelector(".skillBarFill").style.width = "100%";
      element.querySelector(".skillBarFill").style.backgroundColor = "#b3920d"
      element.querySelector(".skillBarText").innerText = cleanFormatNumber(skill.xpRemaining)
    } else {
      element.querySelector(".skillBarFill").style.width = (skill.progress * 100) + "%";
      element.querySelector(".skillBarText").innerText = cleanFormatNumber(skill.xpRemaining) + " / " + cleanFormatNumber(skill.nextLevel);
    }
    document.getElementById("skills").appendChild(element);
  })

  //load armor
  document.querySelector("#armor-inv").appendChild(makeInventoryViewer(profileData.inventories.find((x) => x.name == "inv_armor").contents.reverse(), {cols: 1, hasHotbar: false, rarityColor: true}));

  //load wardrobe / wardrobe api check
  if (profileData.inventories.find((x) => x.name == "wardrobe_contents")) {
    var wardrobeSelector = makeInventorySelector(transformWardrobe( profileData.inventories.find((x) => x.name == "wardrobe_contents").contents), {cols: 18, hasHotbar: false, rarityColor: true});
    wardrobeSelector.onUpdate = () => {
      console.log("wardrobe update")

      //set selected to an inventory of the armor
      let bootsIndex = Array.from(wardrobeSelector.children).indexOf(Array.from(wardrobeSelector.children).find(x => x.item == wardrobeSelector.checked));
      wardrobeSelector.checked = [wardrobeSelector.children[bootsIndex- 18 * 3].item, wardrobeSelector.children[bootsIndex- 18 * 2].item, wardrobeSelector.children[bootsIndex- 18 * 1].item, wardrobeSelector.children[bootsIndex].item];
      console.log(wardrobeSelector.checked)

      //set armor display to show selected
      document.querySelector("#armor-inv").innerHTML = ""
      document.querySelector("#armor-inv").appendChild(makeInventoryViewer(wardrobeSelector.checked, {cols: 1, hasHotbar: false, rarityColor: true}));
      
      //set the inv_armor to the newly selected set
      profileData.inventories.find((x) => x.name == "inv_armor").contents = wardrobeSelector.checked;

      //remake armor stats
      makeArmorStats();
    }
    console.log(wardrobeSelector.children);
    wardrobeSelector.style.gridAutoRows = "6vw";
    for (let i = 0; i < 18 * 4; i++) {
      // console.log(wardrobeSelector.children[i], i)
      if (i < 18 * 3) {
        wardrobeSelector.children[i].removeChild(wardrobeSelector.children[i].querySelector(".item-selector"))
      } else {
        wardrobeSelector.children[i].querySelector(".item-selector").style.bottom = "-3.5vw";
        wardrobeSelector.children[i].querySelector(".item-selector").style.width = "2vw";
        wardrobeSelector.children[i].querySelector(".item-selector").style.height = "2vw";
      }
      if (wardrobeSelector.children[i].querySelector(".item-head")) wardrobeSelector.children[i].querySelector(".item-head").style.transform = "rotateY(45deg) rotateX(-15deg) rotateZ(-15deg)"
      wardrobeSelector.children[i].querySelector(".item-icon").style.transform = "translate(-50%, -50%) scale(calc(var(--cellSize) / 128 * 0.8))"
    }
    document.querySelector("#wardrobe").appendChild(wardrobeSelector);

  } else {
    let apiWarn = document.createElement("span");
    apiWarn.innerText = "Inventory API Not Enabled!"
    apiWarn.classList.add("api-warn")
    document.querySelector("#wardrobe").appendChild(apiWarn);
  }

  //load inventories
  function showInventory(name) {
    for (let invView of document.querySelector("#inv-view-container").children) {
      if (invView.name == name) {
        invView.style.display = "grid";
      } else {
        invView.style.display = "none";
      }
    }
  }
  let excludedInv = ["inv_armor","wardrobe_contents"];
  for (let inventory of profileData.inventories.filter((x) => !excludedInv.includes(x.name))) {
    let label = document.createElement("input");
    label.type = "button";
    label.classList.add("inv-label");
    label.value = inventory.clean_name;
    label.addEventListener("click", () => showInventory(inventory.name));
    document.querySelector("#labels").appendChild(label);
    if(inventory.contents[inventory.contents.length - 6].name && inventory.contents[inventory.contents.length - 6].name.includes("Go Back")) {
      inventory.contents = inventory.contents.slice(0,inventory.contents.length - 9)
    }

    let invView = makeInventoryViewer(inventory.contents, {hasHotbar: inventory.name == "inv_contents" ? true : false});
    invView.name = inventory.name;
    document.querySelector("#inv-view-container").appendChild(invView);
  }
  showInventory("inv_contents");
  
  //api check for inventories
  if (profileData.inventories.filter((x) => !excludedInv.includes(x.name)).length == 0) {
    document.querySelector("#labels").style.display = "none";
    document.querySelector("#inv-view-container").style.display = "none";
    let apiWarn = document.createElement("span");
    apiWarn.classList.add("api-warn")
    apiWarn.innerText = "Inventory API Not Enabled!"
    document.querySelector("#inventories").appendChild(apiWarn);
  }

  //load pets
  let petSelector = makeInventorySelector(profileData.pets, {cols: 12, hasHotbar: false, rarityColor:true});
  petSelector.gridAutoRows = "9vw"
  for (let cell of petSelector.querySelectorAll(".item-cell")) {
    cell.querySelector(".item-head").style.transform = "translateY(-0.4vw) rotateY(45deg) rotateX(-15deg) rotateZ(-15deg)";
    let levelNumber = document.createElement("div");
    levelNumber.innerText = `LVL ${cell.item.level}`;
    levelNumber.style.position = "absolute";
    levelNumber.style.top = "0.3vw";
    levelNumber.style.left = 0;
    levelNumber.style.width = "100%";
    levelNumber.style.textAlign = "center";
    levelNumber.style.fontSize = "1.05vw";
    cell.appendChild(levelNumber);
  }

  console.log(petSelector)
  petSelector.checked = profileData.pets[0];
  if (petSelector.children[0]) {
    petSelector.children[0].querySelector(".item-selector").checked = true;
  }
  if (petSelector.children[1]) {
    petSelector.children[1].querySelector(".item-selector").checked = false;
  }
  document.querySelector("#pets").appendChild(petSelector);

  //load slayers
  document.querySelector("#slayer-total").innerText = (Object.keys(profileData.slayer).reduce((t,x) => profileData.slayer[x].xp + t, 0)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Slayer XP"
  document.querySelector("#slayer-grid").style.gridTemplateColumns = `repeat(${Object.keys(profileData.slayer).length},1fr)`;
  let slayerToBoss = {
    "spider": "Tarantula Broodfather",
    "wolf": "Sven Packmaster",
    "zombie": "Revenant Horror"
  }
  for (let slayer in profileData.slayer) {
    let slayerDisplay = document.createElement("div");
    slayerDisplay.classList.add("slayer");
    slayerDisplay.innerHTML = `
    <div class='slayer-header'></div>
    <div class='slayer-kills'>
      <div class="slayer-kills-header">${slayerToBoss[slayer] + " x" + Object.keys(profileData.slayer[slayer].boss_kills).reduce((t,x) => t + profileData.slayer[slayer].boss_kills[x],0)}</div>
    </div>
    <div class='slayer-bar'>
      <div class='slayer-bar-fill'></div>
      <div class='slayer-bar-text'></div>
      <span id="test"></span>
    </div>`
    //make slayer header
    slayerDisplay.querySelector(".slayer-header").innerText = slayer.charAt(0).toUpperCase() + slayer.slice(1) + " " + profileData.slayer[slayer].level;
    //make kills grid
    slayerDisplay.querySelector(".slayer-kills").style.gridTemplateColumns = `repeat(${Object.keys(profileData.slayer[slayer].boss_kills).length},1fr)`;
    for (let tier in profileData.slayer[slayer].boss_kills) {
      let label = document.createElement("div");
      label.innerText = "Tier " + tier[tier.length - 1];
      slayerDisplay.querySelector(".slayer-kills").appendChild(label)
    }
    for (let tier in profileData.slayer[slayer].boss_kills) {
      let label = document.createElement("div");
      label.innerText = profileData.slayer[slayer].boss_kills[tier] + " Kills";
      slayerDisplay.querySelector(".slayer-kills").appendChild(label)
    }
    //make bar
    if (profileData.slayer[slayer].level == profileData.slayer[slayer].maxLevel) {
      slayerDisplay.querySelector(".slayer-bar-fill").style.width = "100%";
      slayerDisplay.querySelector(".slayer-bar-fill").style.backgroundColor = "#b3920d"
      slayerDisplay.querySelector(".slayer-bar-text").innerText = cleanFormatNumber(profileData.slayer[slayer].xp)
    } else {
      slayerDisplay.querySelector(".slayer-bar-fill").style.width = (profileData.slayer[slayer].xp / profileData.slayer[slayer].xpNext * 100) + "%";
      slayerDisplay.querySelector(".slayer-bar-text").innerText = cleanFormatNumber(profileData.slayer[slayer].xp) + " / " + cleanFormatNumber(profileData.slayer[slayer].xpNext);
    }
    document.querySelector("#slayer-grid").appendChild(slayerDisplay);
  }
  /* COMBAT SECTION !!! REDO THIS DUMPSTER FIRE !!!*/
  //make weapon section + stat display
  if (profileData.inventories.length > 1) {
    var weaponSelector = makeInventorySelector(profileData.weapons, {cols: 12, hasHotbar: false, rarityColor:true});
    var weaponStats = makeStatsDisplay("Weapon", weaponSelector.checked ? weaponSelector.checked.stats: {});
    weaponSelector.onUpdate = () => {
      let stats = {...weaponSelector.checked.stats};
      if (document.querySelector("#in-dungeons").checked && profileData.skills.find(x => x.name == "catacombs") && weaponSelector.checked.tags.includes("DUNGEON") ) {
        for (let stat in stats) {
          console.log(catacombsReward[profileData.skills.find(x => x.name == "catacombs").levelPure])
          stats[stat] = stats[stat] * (1+ (weaponSelector.checked.stars ? weaponSelector.checked.stars * 0.1 : 0) + catacombsReward[profileData.skills.find(x => x.name == "catacombs").levelPure] * 0.01 )
        }
      }
      weaponStats.innerStats = stats;
      console.log(weaponStats.innerStats)
      weaponStats.update();
    }
    document.querySelector("#weapon-select").appendChild(weaponSelector);
    //add static stats, the ones that dont change based on dungeon/non-dungeon
    staticStatToName = {
      "base": "Base Stats",
      "fairy_souls": "Fairy Souls",
      "skills": "Skills",
      "slayer": "Slayer"
    }
    let staticStatDisplays = [];
    for (let stat in profileData.staticStats) {
      staticStatDisplays.push(makeStatsDisplay(staticStatToName[stat], profileData.staticStats[stat]))
    }
    staticStatDisplays.forEach(d => document.querySelector("#stats-separate").appendChild(d));

    //add talisman stats
    let talisArr = Object.keys(profileData.talis).map(x => profileData.talis[x]);
    let talisStats = {
      "str": 0,
      "cc": 0,
      "cd": 0,
      "as": 0,
      "fer": 0,
      "int": 0,
    }
    talisArr.forEach(tali => {
      for (let stat in tali.stats) {
        talisStats[stat] += Number(tali.stats[stat]);
      }
    })
    for( let stat in talisStats) {
      if (talisStats[stat] == 0) {
        delete talisStats[stat];
      }
    }
    let talismanStats = makeStatsDisplay("Accessories", talisStats)
    document.querySelector("#stats-separate").appendChild(talismanStats);
    //pet stats
    let activePet = profileData.pets.find(x => x.active);
    var petsStats = makeStatsDisplay("Pet", activePet ? activePet.stats: {});
    petSelector.onUpdate = () => {
      petsStats.innerStats = petSelector.checked.stats;
      petsStats.update();
    }
    document.querySelector("#stats-separate").appendChild(petsStats);
    //cake stats
    var cakeStats = makeStatsDisplay("Cakes",{fer:2,int:5,str:2})
    document.querySelector("#stats-separate").appendChild(cakeStats);
    document.querySelector("#cakes-active").addEventListener("click", () => {
      if (document.querySelector("#cakes-active").checked) {
        cakeStats.innerStats = {fer:2,int:5,str:2}
      } else {
        cakeStats.innerStats = {fer:0,int:0,str:0}
      }
      cakeStats.update();
    })
    //potion stats
    var potsStats = makeStatsDisplay("Potions",{str:0,cc:0,cd:0});
    document.querySelector("#stats-separate").appendChild(potsStats);
    for (let checkbox of document.querySelectorAll("#pot-select input")) {
      checkbox.addEventListener("click", getPotsStats);
      checkbox.addEventListener("input", getPotsStats);
    }
    function getPotsStats() {
      let stats = {
        "str": 0,
        "cc": 0,
        "cd": 0
      }
      if (document.querySelector("#dungeon-pot").checked) {
        let dungeonPots = {
          1: {
            "str": 20,
            "cc": 10,
            "cd": 10
          },
          2: {
            "str": 20,
            "cc": 10,
            "cd": 10
          },
          3: {
            "str": 20,
            "cc": 15,
            "cd": 20
          },
          4: {
            "str": 30,
            "cc": 15,
            "cd": 20
          },
        }
        stats = dungeonPots[document.querySelector("#dungeon-pot-num").value]
      }
      if (document.querySelector("#godsplash-pot").checked) {
        stats.str += 78 //str 8 carbonated
        stats.cc += 25; //crit
        stats.cd += 80 //crit + spirit
      }
      potsStats.innerStats = stats;
      potsStats.update();
    }
    //add armor stats
    var armorStatsDisplay = makeStatsDisplay("Armor", {});
    function makeArmorStats() { //get rid of this crap
      let armorStats = {
        "str": 0,
        "cc": 0,
        "cd": 0,
        "as": 0,
        "int": 0,
        "fer": 0
      }
      profileData.inventories.find((x) => x.name == "inv_armor").contents.forEach((item) => {
        for (let stat in item.stats) {
          let pieceStat = Number(item.stats[stat]);
          if (document.querySelector("#in-dungeons").checked && profileData.skills.find(x => x.name == "catacombs") && item.tags.includes("DUNGEON")) {
            pieceStat *= 1 + (item.stars ? item.stars * 0.1 : 0) + catacombsReward[profileData.skills.find(x => x.name == "catacombs").levelPure] * 0.01;
          }
          armorStats[stat] += pieceStat;
        }
      })
      for( let stat in armorStats) {
        if (armorStats[stat] == 0) {
          delete armorStats[stat];
        }
      }
      armorStatsDisplay.innerStats = armorStats;
      armorStatsDisplay.update();
    }
    makeArmorStats();

    
    document.querySelector("#stats-separate").appendChild(armorStatsDisplay);
    //add weapon stats
    document.querySelector("#stats-separate").appendChild(weaponStats);

    //dungeons checkbox
    document.querySelector("#in-dungeons").addEventListener("mouseup", () => {
      setTimeout(() => {
        makeArmorStats();
        weaponSelector.onUpdate();
      },1)
    })

    //total stats
    var totalStats = makeStatsDisplay("Total");
    totalStats.addDependency(armorStatsDisplay);
    totalStats.addDependency(weaponStats);
    totalStats.addDependency(talismanStats);
    totalStats.addDependency(cakeStats);
    totalStats.addDependency(potsStats);
    totalStats.addDependency(petsStats);
    staticStatDisplays.forEach(d => totalStats.addDependency(d));
    totalStats.onupdate.unshift(() => {
      totalStats.innerStats = {};
      let stats = {};
      for (let other of totalStats.dependencies) {
        for (let stat in other.stats) {
          if (!stats[stat]) {
            stats[stat] = other.stats[stat];
          } else {
            stats[stat] += other.stats[stat];
          }
        }
      }

      // find stats for only totalstats, the ones affected by full set bonus, pet ability, etc.
      let armor = profileData.inventories.find((x) => x.name == "inv_armor").contents;

      //sup and renowned
      if (armor.every((piece) => piece.id && piece.id.includes("SUPERIOR"))) {
        for (let stat in stats) {
          if (stat != "dmg") {
            if (!totalStats.innerStats[stat]) {
              totalStats.innerStats[stat] = stats * 0.05;
            } else {
              totalStats.innerStats[stat] += stats * 0.05;
            }
          }
        }
      }
      armor.forEach((piece) => {
        if (piece.reforge == "renowned") {
          for (let stat in stats) {
            if (stat != "dmg") {
              if (!totalStats.innerStats[stat]) {
                totalStats.innerStats[stat] = stats[stat] * 0.01;
              } else {
                totalStats.innerStats[stat] += stats[stat] * 0.01;
              }
            }
          }
        }
      });

      //pet ability stats + ratio
      let sumStats = {...stats}; //sum stats = stats + full set + pet ability bonus (eventually) - stats (even more eventually)
      for (let stat in totalStats.innerStats) {
        sumStats[stat] += totalStats.innerStats[stat];
      }
      console.log(totalStats.innerStats,sumStats);

      sumStats.ratio = 1;
      if (petSelector.checked && petFuncs[petSelector.checked.id]) petFuncs[petSelector.checked.id](petSelector.checked,weaponSelector.checked,armor,sumStats); // + pet ability bonus
      petRatio = sumStats.ratio; //get flat damage multiplier from pet
      delete sumStats.ratio;

      console.log(sumStats);
      for (let stat in stats) {
        sumStats[stat] -= stats[stat]; // - stats
      }
      console.log(sumStats);
      totalStats.innerStats = sumStats;
    })
    let updateDmg = () => {
      let armor = profileData.inventories.find((x) => x.name == "inv_armor").contents;
      if (weaponSelector.checked) {
        document.querySelector("#zealot-dmg-number").innerText = doDamageCalc(petRatio, weaponSelector.checked, armor, petSelector.checked, profileData, totalStats.stats,{ender:true,gk:true}).map(x => cleanFormatNumber(x)).join("-");
        document.querySelector("#crypt-ghoul-dmg-number").innerText = doDamageCalc(petRatio, weaponSelector.checked, armor, petSelector.checked, profileData, totalStats.stats,{undead:true}).map(x => cleanFormatNumber(x)).join("-");
        document.querySelector("#spider-dmg-number").innerText = doDamageCalc(petRatio, weaponSelector.checked, armor, petSelector.checked, profileData, totalStats.stats,{spider:true}).map(x => cleanFormatNumber(x)).join("-");
      }
    }
    totalStats.onupdate.push(updateDmg)
    totalStats.dependers.push({update: updateDmg})
    document.querySelector("#stats-combined").appendChild(totalStats);
    totalStats.update();
  } else {
    document.querySelector("#combat").innerHTML = `
    <div class="section-label">Combat</div>
    <span class="api-warn">Inventories API Not Enabled!</span>
    `
  }


  /* MINION SECTION NOT COMBAT RELATED THANK GOD */

  //make matrix into an actual matrix
  let minionTable = Object.keys(profileData.minions.matrix).map(x => [x].concat(profileData.minions.matrix[x].slice(1)));
  
  //fill table
  for (let row of minionTable) {
    for (let x of row) {
      let cell = document.createElement("div");
      if (typeof x == "string") {
        cell.classList.add("minionText");
        cell.innerText = minionNameMap[x];
      } else {
        cell.classList.add("minionBoolCell")
        cell.classList.add(String(Boolean(x)))
      }
      document.querySelector("#minion-table").appendChild(cell)
    }
  }

  //fill missing list
  for (let minion of profileData.minions.missing) {
    let name = document.createElement("div");
    let price = document.createElement("div");
    name.innerText = minionNameMap[minion[0]] + " " + minion[1];
    price.innerText = minion[2] ? cleanFormatNumber(Number(minion[2])) : "???";
    document.querySelector("#minion-upgrades").appendChild(name);
    document.querySelector("#minion-upgrades").appendChild(price);
  }

  //calculate price till next slot
  let nextSlotPrice = 0;
  if (profileData.minions.missing.length >= profileData.minions.nextTier) {
    let nextMinions = profileData.minions.missing.slice(0,profileData.minions.nextTier);
    if (nextMinions.every(x => x[2])) {
      nextSlotPrice = nextMinions.reduce((t,x) => t+Number(x[[2]]), 0);
    } else {
      nextSlotPrice = null;
    }
  } else {
    nextSlotPrice = null;
  }
  console.log(nextSlotPrice)

  document.querySelector("#minion-extra").innerText = `Unique Minions ${profileData.minions.uniques}, Minion Slots: ${profileData.minions.slots + profileData.minions.bonusSlots}, Cost of Next Slot: ${nextSlotPrice ? cleanFormatNumber(nextSlotPrice) : "???"}`;

  /* TALISMAN OPTIMIZER SECTION */
  let bestTalismanScore = 0;
  async function doTalismans() {
    document.querySelector("#optimize-label").innerText = "Calculating..."
    let armor = profileData.inventories.find((x) => x.name == "inv_armor").contents;

    function scoreFunc(stats,applyPet=true,applyArmor=true,useAs=true) { //score function for the talisman optimizer
      if (weaponSelector.checked.tags.includes("BOW")) useAs = false; //disable attack speed with bows
      if (applyArmor && armor.every((piece) => piece.id && piece.id.includes("SUPERIOR"))) {
        for (let stat in stats) {
          if (stat != "dmg") stats[stat] *= 1.05
        }
      }

      armor.forEach((piece) => {
        if (applyArmor && piece.reforge == "renowned") {
          for (let stat in stats) {
            if (stat != "dmg") stats[stat] *= 1.01
          }
        }
      })
      stats.ratio = 1;
      if (applyPet && petFuncs[petSelector.checked.id]) petFuncs[petSelector.checked.id](petSelector.checked,weaponSelector.checked,armor,stats); // apply pet stats, need to extract pet dmg ratio out of stats now
      petRatio = stats.ratio;
      delete stats.ratio;

      return doDamageCalc(petRatio, weaponSelector.checked, armor, petSelector.checked, profileData, stats)[0] * ( useAs ? (1 + Math.min(100,stats["as"] ? stats["as"] : 0) / 100): 1 ) * (useAs ? (1 + (stats.fer ? stats.fer : 0) / 100): 1) / 0.5 //an attack every 0.4sec
    }

    //get talisman base stats + rarities (REDO THIS WHEN REDOING COMBAT SECTION, getTotalStats and the following code do almost the same thing)
    let base = {
      "dmg": 0,
      "str": 0,
      "cc": 0,
      "cd": 0,
      "as": 0,
      "int": 0,
      "fer": 0,
      "c": 0,
      "u": 0,
      "r": 0,
      "e": 0,
      "l": 0,
      "m": 0,
    }
    let rarityToLetter = {
      "COMMON": "c",
      "UNCOMMON": "u",
      "RARE": "r",
      "EPIC": "e",
      "LEGENDARY": "l",
      "MYTHIC": "m",
    }
    let letterToRarity = {
      "c": "Common",
      "u": "Uncommon",
      "r": "Rare",
      "e": "Epic",
      "l": "Legendary",
      "m": "Mythic",
    }
    let currentReforges = {
      "c": Array.from(REFORGES_NAMES.c, x => 0),
      "u": Array.from(REFORGES_NAMES.u, x => 0),
      "r": Array.from(REFORGES_NAMES.r, x => 0),
      "e": Array.from(REFORGES_NAMES.e, x => 0),
      "l": Array.from(REFORGES_NAMES.l, x => 0),
      "m": Array.from(REFORGES_NAMES.m, x => 0),
    }
    // populate base with info on current talismans
    for (let id in profileData.talis) {
      for (let stat in profileData.talis[id].baseStats) {
        base[stat] += profileData.talis[id].baseStats[stat];
      }
      base[rarityToLetter[profileData.talis[id].rarity]]++;
      if (REFORGES_NAMES[rarityToLetter[profileData.talis[id].rarity]].indexOf(profileData.talis[id].reforge) != -1) {
        currentReforges[rarityToLetter[profileData.talis[id].rarity]][REFORGES_NAMES[rarityToLetter[profileData.talis[id].rarity]].indexOf(profileData.talis[id].reforge)]++;
      } else {
        REFORGES_NAMES[rarityToLetter[profileData.talis[id].rarity]].push(String(profileData.talis[id].reforge));
        currentReforges[rarityToLetter[profileData.talis[id].rarity]][REFORGES_NAMES[rarityToLetter[profileData.talis[id].rarity]].length - 1] = 1;
      }
    }
    //add armor, weapon if it exists, pots, and pets stats to the base
    let statsArr = Object.keys(profileData.staticStats).map(x => profileData.staticStats[x]).concat([armorStatsDisplay.stats, weaponSelector.checked ? weaponStats.stats: {}, potsStats.stats, petsStats.stats, cakeStats.stats]);
    for (let statMap of statsArr) {
      for (let stat in statMap) {
        base[stat] += Number(statMap[stat]);
      }
    }
    let winningSet = await doTalismanOptimization(base, scoreFunc); //in optimizer.js
     if (!document.querySelector("#optimize-switch input").checked) return
    console.log(winningSet.score, bestTalismanScore);
    if (winningSet.score < bestTalismanScore) {
      if (document.querySelector("#optimize-switch input").checked) {
        setTimeout(doTalismans, 0); //do it again, settimeout so js doesnt die
      }
      return;
    };
    bestTalismanScore = winningSet.score;

    document.querySelector("#old .dps").innerText = "Old DPS: " + scoreFunc(totalStats.stats,false,false).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.querySelector("#new .dps").innerText ="New DPS: " + scoreFunc(winningSet.stats,false,false).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.querySelector("#old .dmg").innerText = "Old DMG: " + doDamageCalc(petRatio, weaponSelector.checked, armor, petSelector.checked, profileData, totalStats.stats)[0].toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.querySelector("#new .dmg").innerText = "New DMG: " + doDamageCalc(petRatio, weaponSelector.checked, armor, petSelector.checked, profileData, winningSet.stats)[0].toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    document.querySelector("#new-stats").innerHTML = "";
    document.querySelector("#old-stats").innerHTML = "";

    document.querySelector("#new-stats").appendChild(makeStatsDisplay("", winningSet.stats));
    document.querySelector("#old-stats").appendChild(makeStatsDisplay("", totalStats.stats));


    //get the reforge change (-1 reforgex +1 reforgey)
    let reforgeChange = {
      "c": Array.from(REFORGES_NAMES.c, x => 0),
      "u": Array.from(REFORGES_NAMES.u, x => 0),
      "r": Array.from(REFORGES_NAMES.r, x => 0),
      "e": Array.from(REFORGES_NAMES.e, x => 0),
      "l": Array.from(REFORGES_NAMES.l, x => 0),
      "m": Array.from(REFORGES_NAMES.m, x => 0),
    }
    for (let rarity in currentReforges) {
      for (let reforge in currentReforges[rarity]) {
        reforgeChange[rarity][reforge] = (winningSet.reforges[rarity][reforge] ? winningSet.reforges[rarity][reforge] : 0) - currentReforges[rarity][reforge]
      }
    }
    document.querySelector("#optimize-output").style.display = "flex";

    let outputString = "";
    for (let rarity in reforgeChange) {
      reforgeChange[rarity].forEach((delta, i) => {
        if (delta != 0) outputString += ` ${delta > 0 ? "+" + delta : delta} ${letterToRarity[rarity]} ${REFORGES_NAMES[rarity][i][0].toUpperCase() + REFORGES_NAMES[rarity][i].slice(1)},`
      })
    }
    outputString = outputString.slice(0,outputString.length - 1);
    document.querySelector("#changes").innerText = outputString

    if (document.querySelector("#optimize-switch input").checked == true) {
      setTimeout(doTalismans, 0); //do it again, settimeout so js doesnt die
    }
  }
  if (document.querySelector("#optimize-switch input")) document.querySelector("#optimize-switch input").addEventListener("click", () => {
    if (document.querySelector("#optimize-switch input").checked) {
      doTalismans();
    } else {
      bestTalismanScore = 0; //reset the score
      document.querySelector("#optimize-label").innerText = "Talisman Optimizer (Experimental)"
    }
  });

  // profile stats pogu
  for (let statName in profileData.profileStats) {
    let statContainer = document.createElement("div");
    statContainer.classList.add("sb-stats-container");
    let header = document.createElement("div");
    header.classList.add("sb-stats-header");
    header.innerText = statName.split("_").map(x => x[0].toUpperCase() + x.slice(1)).join(" ");
    statContainer.appendChild(header);
    for (let stat of profileData.profileStats[statName]) {
      let statDiv = document.createElement("div");
      statDiv.classList.add("sb-stats-stat");
      statDiv.innerHTML = `<div class="label">${stat[0]}</div> <div class="value">${typeof stat[1] == "number" ? cleanFormatNumber(stat[1]) : stat[1]}</div>`;
      statContainer.appendChild(statDiv);
    }
    document.querySelector("#sb-stats").appendChild(statContainer);
  }

  //hide loading animation and show content
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").style.display = "flex";
})().catch((err) => alert(err.stack));
