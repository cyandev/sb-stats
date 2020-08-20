// constants
const excludedSkills = ["carpentry","runecrafting","catacombs"];
//helper functions

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

function makeInventoryViewer(contents,options={cols: 9, hasHotbar: true, cellSize: "6vw"}) {
  //load in options
  let opt={cols: 9, hasHotbar: true, cellSize: "6vw"};
  for (let key in options) {
    opt[key] = options[key];
  }
  if (opt.hasHotbar) { //shift hotbar to bottom if it exists
    contents = contents.slice(opt.cols).concat(contents.slice(0,opt.cols));
  }
  //create the grid
  let grid = document.createElement("div");
  grid.classList.add("inv-view")
  grid.style.display = "inline-grid";
  grid.style.gridTemplateColumns = `repeat(${opt.cols}, ${opt.cellSize})`;
  grid.style.gridAutoRows = opt.cellSize;
  //add the items
  contents.forEach((item,i) => {
    //make base itemCell
    let itemCell = document.createElement("div");
    if (item.active) {
      itemCell.style.border = "0.1vw solid var(--yellow)"
    }
    itemCell.innerHTML = `
    <img class="item-icon">
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
    } else if (item && item.name && item.icon) { //if the item isnt empty
      itemCell.querySelector(".item-icon").src = item.icon;
      itemCell.querySelector(".item-icon").failCount = 0;
      itemCell.querySelector(".item-icon").onerror = () => {
        console.log("image failed to load", item);
        itemCell.querySelector(".item-icon").failCount++;
        if (itemCell.querySelector(".item-icon").failCount < 5) setTimeout(() => itemCell.querySelector(".item-icon").src = item.icon, 1000);
      };
    } else { //if there is no item
    }

    if (item && item.count > 1) { //make the count appear if there are more than 1 item in a slot
      itemCell.querySelector(".item-count").innerHTML = item.count;
    }
    //add hover based listeners
    itemCell.addEventListener("mouseenter", () => setHoverTo(item));
    itemCell.addEventListener("mouseleave", () => setHoverTo(false));
    itemCell.addEventListener("mousedown", () => {
      boxLocked = !boxLocked;
      if (boxLocked) {
        setTimeout(() => {
          window.addEventListener("mousedown", unlockBox);
          console.log("added unlock listener")
        }, 1);
      }
    });
    grid.appendChild(itemCell); //add the itemcell to the grid
  })
  return grid
}
function makeInventorySelector(contents) {
  let view = makeInventoryViewer(contents,{cols: 12,hasHotbar:false});
  view.style.gridAutoRows = "8vw";
  for (let cell of view.children) {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("item-selector");
    checkbox.addEventListener("mouseup", (e) => {
      console.log("box clicked")
      unlockBox(e);
      for (let check of view.querySelectorAll(".item-selector")) {
        if (check != checkbox) check.checked = false;
      }
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
    "int": "✎"
  }
  let statToColor = {
    "as": "var(--yellow)",
    "cc": "var(--blue)",
    "cd": "var(--blue)",
    "dmg": "#000000",
    "str": "var(--red)",
    "int": "var(--cyan)"
  }
  let statsDisplay = document.createElement("div");
  statsDisplay.classList.add("stats-display");
  statsDisplay.update = (stats) => {
    statsDisplay.stats = stats;
    statsDisplay.innerHTML = ""; //clear it out
    let domLabel = document.createElement("div");
    domLabel.classList.add("label");
    domLabel.innerHTML = label;
    statsDisplay.appendChild(domLabel);
    for (let stat in stats) {
      if (stat in statToIcon) {
        //create colored preview
        let icon = document.createElement("div");
        icon.classList.add("icon")
        icon.style.background = statToColor[stat];
        icon.innerHTML = statToIcon[stat] + " " + stat.toUpperCase();
        statsDisplay.appendChild(icon);
        let number = document.createElement("div");
        number.innerHTML = stats[stat];
        statsDisplay.appendChild(number);
      }
    }
  }
  statsDisplay.update(stats);
  return statsDisplay;
}
function doDamageCalc(weapon,profileData, stats,enemy={undead:false,ender:false,spider:false,gk:false}) {
  let baseDmg = (5 + stats.dmg + Math.floor(stats.str / 5)) * (1 + stats.str / 100) * (1 + stats.cd / 100);
  let damageMultiplier = 1 + profileData.skills.find(skill => skill.name=="combat").levelPure * 0.04;
  let enchantmentsBuffs = {
    "sharpness": 0.05,
    "smite": 0.08 * enemy.undead,
    "bane_of_arthropods": 0.08 * enemy.spider,
    "ender_slayer": 0.12 * enemy.ender,
    "giant_killer": enemy.gk * 0.25 / (weapon.enchantments ? weapon.enchantments["giant_killer"]: 1), //capped at 25% no matter the level
    "first_strike": 0.25,
    "critical": 0.1,
  }
  for (let enchant in weapon.enchantments) {
    if (enchantmentsBuffs[enchant]) {
      damageMultiplier += enchantmentsBuffs[enchant] * weapon.enchantments[enchant];
      console.log(enchant, enchantmentsBuffs[enchant] * weapon.enchantments[enchant])
    }
  }
  console.log(damageMultiplier, baseDmg * damageMultiplier)
  return baseDmg * damageMultiplier;
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

  let rarityColorMap = {
    "COMMON": "§8",
    "UNCOMMON": "§a",
    "RARE": "§9",
    "EPIC": "§5",
    "LEGENDARY": "§6",
    "MYTHIC": "§d",
    "SPECIAL": "§c"
  }
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
    window.location.href = window.location.origin + "?err=Invalid Player!"
  }
  username = data.name;
  console.log(data)
  let profileArr = Object.keys(data.profiles).map((x) => data.profiles[x]);
  let profileData = profileArr.find((x) => x.cute_name == profile)
  if (!profileData) {
    profileData = profileArr.sort((a,b) => b.last_save - a.last_save)[0];
    if (profileData) {
      profile = profileData.cute_name
    } else {
      window.location.href = window.location.origin + "?err=No Profiles Found"
    }
  }
  window.history.pushState({}, "", `/stats/${username}/${profile}`);
  document.getElementById("playerName").innerHTML = data.rank ? `<span style="color:${data.color}">[${data.rank.split("_PLUS").join(`${data.rank.includes("MVP") ? `<span style="color:${data.plus}">+</span>` : "+"}`)}] ${username}</span>` : username;
  document.getElementById("profileName").innerHTML = profile;
  console.log(profileData);

  //load basic stats
  if (profileData.balance) {
    document.querySelector("#stats-text").innerHTML += `Bank: ${cleanFormatNumber(profileData.balance)}, `
  }
  document.querySelector("#stats-text").innerHTML += `Purse: ${cleanFormatNumber(profileData.purse)}, `
  document.querySelector("#stats-text").innerHTML += `Fairy Souls: ${profileData.fairy_souls}, `

  //load skills
  profileData.skills.forEach((skill) => {
    let element = document.createElement("div");
    element.classList.add("skill")
    element.innerHTML = "<span class='skillName'></span><span class='skillLevel'></span><div class='bar'><span class='skillBarFill'></span><span class='skillBarText'></span></div>" //import some template HTML into div
    element.querySelector(".skillName").innerHTML = skill.name.charAt(0).toUpperCase() + skill.name.slice(1);
    element.querySelector(".skillLevel").innerHTML = skill.levelPure;
    if (skill.levelPure == skill.maxLevel) {
      element.querySelector(".skillBarFill").style.width = "100%";
      element.querySelector(".skillBarFill").style.backgroundColor = "#b3920d"
      element.querySelector(".skillBarText").innerHTML = cleanFormatNumber(skill.xpRemaining)
    } else {
      element.querySelector(".skillBarFill").style.width = (skill.progress * 100) + "%";
      element.querySelector(".skillBarText").innerHTML = cleanFormatNumber(skill.xpRemaining) + " / " + cleanFormatNumber(skill.nextLevel);
    }
    //catacombs hide bar and make bigger text
    if (skill.name == "catacombs") {
      element.style.fontSize = "1.5vw";
      element.style.lineHeight = "3vw";
      element.querySelector(".bar").style.display = "none";
    }
    document.getElementById("skills").appendChild(element);
  })

  //add avg skill lvl to basic stats
  profileData.skills = profileData.skills.filter(x => !excludedSkills.includes(x.name))
  document.querySelector("#stats-text").innerHTML += `Skill Average: ${(profileData.skills.reduce((t,x) => t+x.levelProgress,0) / profileData.skills.length).toFixed(2)}, `;
  document.querySelector("#stats-text").innerHTML += `True Skill Average: ${(profileData.skills.reduce((t,x) => t+x.levelPure,0) / profileData.skills.length).toFixed(2)}`


  //load armor
  document.querySelector("#armor").appendChild(makeInventoryViewer(profileData.inventories.find((x) => x.name == "inv_armor").contents.reverse(), {cols: 1, hasHotbar: false}));

  //load wardrobe / wardrobe api check
  if (profileData.inventories.find((x) => x.name == "wardrobe_contents")) {
    document.querySelector("#wardrobe").appendChild(makeInventoryViewer(transformWardrobe( profileData.inventories.find((x) => x.name == "wardrobe_contents").contents), {cols: 18, hasHotbar: false}));
  } else {
    let apiWarn = document.createElement("span");
    apiWarn.innerHTML = "API Not Enabled!"
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
    apiWarn.innerHTML = "API Not Enabled!"
    document.querySelector("#inventories").appendChild(apiWarn);
  }

  //load pets 
  document.querySelector("#pets").appendChild(makeInventoryViewer(profileData.pets, {cols: 12, hasHotbar: false}));

  //load slayers
  document.querySelector("#slayer-total").innerHTML = (Object.keys(profileData.slayer).reduce((t,x) => profileData.slayer[x].xp + t, 0)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Slayer XP"
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
    slayerDisplay.querySelector(".slayer-header").innerHTML = slayer.charAt(0).toUpperCase() + slayer.slice(1) + " " + profileData.slayer[slayer].level;
    //make kills grid
    slayerDisplay.querySelector(".slayer-kills").style.gridTemplateColumns = `repeat(${Object.keys(profileData.slayer[slayer].boss_kills).length},1fr)`;
    for (let tier in profileData.slayer[slayer].boss_kills) {
      let label = document.createElement("div");
      label.innerHTML = "Tier " + tier[tier.length - 1];
      slayerDisplay.querySelector(".slayer-kills").appendChild(label)
    }
    for (let tier in profileData.slayer[slayer].boss_kills) {
      let label = document.createElement("div");
      label.innerHTML = profileData.slayer[slayer].boss_kills[tier] + " Kills";
      slayerDisplay.querySelector(".slayer-kills").appendChild(label)
    }
    //make bar
    if (profileData.slayer[slayer].level == profileData.slayer[slayer].maxLevel) {
      slayerDisplay.querySelector(".slayer-bar-fill").style.width = "100%";
      slayerDisplay.querySelector(".slayer-bar-fill").style.backgroundColor = "#b3920d"
      slayerDisplay.querySelector(".slayer-bar-text").innerHTML = cleanFormatNumber(profileData.slayer[slayer].xpRemaining)
    } else {
      slayerDisplay.querySelector(".slayer-bar-fill").style.width = (profileData.slayer[slayer].xpRemaining / profileData.slayer[slayer].nextLevel * 100) + "%";
      slayerDisplay.querySelector(".slayer-bar-text").innerHTML = cleanFormatNumber(profileData.slayer[slayer].xpRemaining) + " / " + cleanFormatNumber(profileData.slayer[slayer].nextLevel);
    }
    document.querySelector("#slayer-grid").appendChild(slayerDisplay);
  }
  /* COMBAT SECTION */
  //make weapon section + stat display
  if (profileData.inventories.length > 1) {
    let weaponSelector = makeInventorySelector(profileData.weapons);
    let weaponStats = makeStatsDisplay("Weapon", weaponSelector.checked ? weaponSelector.checked.stats: {});
    weaponSelector.onUpdate = () => {
      console.log(weaponSelector.checked)
      weaponStats.update(weaponSelector.checked.stats);
      getTotalStats()
    }
    document.querySelector("#weapon-select").appendChild(weaponSelector);
    //add static stats, the ones that dont change based on dungeon/non-dungeon
    staticStatToName = {
      "base": "Base Stats",
      "fairy_souls": "Fairy Souls",
      "skills": "Skills",
      "slayer": "Slayer"
    }
    for (let stat in profileData.staticStats) {
      document.querySelector("#stats-separate").appendChild(makeStatsDisplay(staticStatToName[stat], profileData.staticStats[stat]))
    }
    //add talisman stats
    let talisArr = Object.keys(profileData.talis).map(x => profileData.talis[x]);
    let talisStats = {
      "str": 0,
      "cc": 0,
      "cd": 0,
      "as": 0,
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
    document.querySelector("#stats-separate").appendChild(makeStatsDisplay("Accessories", talisStats));
    //potion stats
    let potsStats = makeStatsDisplay("Potions",{str:0,cc:0,cd:0});
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
      potsStats.update(stats)
      getTotalStats()
    }
    //add armor stats
    let armorStats = {
      "str": 0,
      "cc": 0,
      "cd": 0,
      "as": 0,
      "int": 0,
    }
    profileData.inventories.find((x) => x.name == "inv_armor").contents.forEach((item) => {
      for (let stat in item.stats) {
        armorStats[stat] += Number(item.stats[stat]);
      }
    })
    for( let stat in armorStats) {
      if (armorStats[stat] == 0) {
        delete armorStats[stat];
      }
    }
    document.querySelector("#stats-separate").appendChild(makeStatsDisplay("Armor", armorStats));
    //add weapon stats
    document.querySelector("#stats-separate").appendChild(weaponStats);
    let totalStats = makeStatsDisplay("Total");
    document.querySelector("#stats-combined").appendChild(totalStats);
    function getTotalStats() { //redo this
      let statsBase = {
        "dmg": 0,
        "str": 0,
        "cc": 0,
        "cd": 0,
        "as": 0,
        "int": 0,
      }
      let stats = Object.keys(profileData.staticStats).map(x => profileData.staticStats[x]).concat([talisStats, armorStats, weaponSelector.checked ? weaponSelector.checked.stats: {}, potsStats.stats]);
      for (let statMap of stats) {
        for (let stat in statMap) {
          statsBase[stat] += Number(statMap[stat]);
        }
      }
      for( let stat in statsBase) {
        if (statsBase[stat] == 0) {
          delete statsBase[stat];
        }
      }
      totalStats.update(statsBase);
      if (weaponSelector.checked) {
        document.querySelector("#zealot-dmg-number").innerHTML = cleanFormatNumber(doDamageCalc(weaponSelector.checked, profileData, statsBase,{ender:true,gk:true}));
        document.querySelector("#crypt-ghoul-dmg-number").innerHTML = cleanFormatNumber(doDamageCalc(weaponSelector.checked, profileData, statsBase,{undead:true}));
      }
    }
    getTotalStats();
  } else {
    document.querySelector("#combat").innerHTML = `
    <div class="section-label">Combat</div>
    Inventories API Not Enabled!
    `
  }

  //hide loading animation and show content
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").style.display = "flex";
})()
