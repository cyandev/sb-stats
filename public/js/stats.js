// constants
const xp_table = [0,50,125,200,300,500,750,1000,1500,2000,3500,5000,7500,10000,15000,20000,30000,50000,75000,100000,200000,300000,400000,500000,600000,700000,800000,900000,1000000,1100000,1200000,1300000,1400000,1500000,1600000,1700000,1800000,1900000,2000000,2100000,2200000,2300000,2400000,2500000,2600000,2750000,2900000,3100000,3400000,3700000,4000000]
const xp_table_runecrafting = [0,50,100,125,160,200,250,315,400,500,625,785,1000,1250,1600,2000,2465,3125,4000,5000,6200,7800,9800,12200,15300,19050];
const excludedSkills = ["carpentry","runecrafting"];
const skillNames = ["alchemy","combat","enchanting","farming","fishing","foraging","mining","taming"];
const skillNamesToAchievements = {
  "alchemy": "concoctor",
  "combat": "combat",
  "enchanting": "augmentation",
  "farming": "harvester",
  "fishing": "angler",
  "foraging": "gatherer",
  "mining": "excavator",
  "taming": "domesticator"
}
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
    itemCell.innerHTML = `
    <img class="item-icon">
    <span class="item-count"></span>
    `
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
        Array.from(itemHead.querySelectorAll(`.${face}`)).forEach(img => img.src = item.faces[face]);
      })
      itemCell.appendChild(itemHead);
      itemCell.querySelector(".item-icon").style.display = "none"; //hide the icon if there is a head
    } else if (item && item.name) { //if the item isnt empty
      itemCell.querySelector(".item-icon").src = item.icon;
    } else { //if there is no item
      itemCell.querySelector(".item-icon").style.display = "none";
    }
    if (item.count > 1) { //make the count appear if there are more than 1 item in a slot
      itemCell.querySelector(".item-count").innerHTML = item.count;
    }
    //add hover based listeners
    itemCell.addEventListener("mouseenter", () => setHoverTo(item));
    itemCell.addEventListener("mouseleave", () => setHoverTo(false));
    itemCell.addEventListener("mousedown", () => {
      boxLocked = !boxLocked;
      console.log("toggled box")
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
  console.log(e.target.parentElement)
  boxLocked = false;
  updateBoxContents();
  window.removeEventListener("mousedown",unlockBox);
  console.log("unlocked box")
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
  document.querySelector("#item-hover-lore").appendChild(parseStyle(boxItem.lore.join("<br>")));
  //TODO: Add backpack contents
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
  username = data.name;
  console.log(data)
  let profileArr = Object.keys(data.profiles).map((x) => data.profiles[x]);
  let profileData = profileArr.find((x) => x.cute_name == profile)
  if (!profileData) {
    profileData = profileArr.sort((a,b) => b.last_save - a.last_save)[0];
    profile = profileData.cute_name
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
  if (JSON.stringify(profileData.skills) == "{}") {
    let apiWarn = document.createElement("span");
    apiWarn.innerHTML = "API Not Enabled! Skills are achievements which count all profiles (even past/wiped ones).";
    skillNames.forEach(skillName => {
      let xp = 0;
      for (let i = 0; i <= data.achievements["skyblock_" + skillNamesToAchievements[skillName]]; i++) {
        xp+= xp_table[i];
      }
      profileData.skills[skillName] = xp;
    })
    document.querySelector("#skills").appendChild(apiWarn);
  }
  let skills = [];
  Object.keys(profileData.skills).forEach((skillName) => {
    let xpRemaining = profileData.skills[skillName];
    let level = 0;
    let table = skillName == "runecrafting" ? xp_table_runecrafting : xp_table;
    for (let i = 0; i < table.length && xpRemaining >= table[i]; i++) {
      xpRemaining -= table[i];
      level = i;
    }
    let element = document.createElement("div");
    element.classList.add("skill")
    element.innerHTML = "<span class='skillName'></span><span class='skillLevel'></span><div class='bar'><span class='skillBarFill'></span><span class='skillBarText'></span></div>" //import some template HTML into div
    element.querySelector(".skillName").innerHTML = skillName.charAt(0).toUpperCase() + skillName.slice(1);
    element.querySelector(".skillLevel").innerHTML = level;
    if (level == table.length - 1) {
      element.querySelector(".skillBarFill").style.width = "100%";
      element.querySelector(".skillBarFill").style.backgroundColor = "#b3920d"
      element.querySelector(".skillBarText").innerHTML = cleanFormatNumber(xpRemaining)
    } else {
      element.querySelector(".skillBarFill").style.width = (xpRemaining / table[level+1] * 100) + "%";
      element.querySelector(".skillBarText").innerHTML = cleanFormatNumber(xpRemaining) + " / " + cleanFormatNumber(table[level+1]);
    }
    skills.push({
      name: skillName,
      levelPure: level,
      levelProgress: level + (table[level+1] ? xpRemaining / table[level+1] : 0)
    })
    document.getElementById("skills").appendChild(element);
  })

  //add avg skill lvl to basic stats
  skills = skills.filter(x => !excludedSkills.includes(x.name))
  document.querySelector("#stats-text").innerHTML += `Skill Average: ${(skills.reduce((t,x) => t+x.levelProgress,0) / skills.length).toFixed(2)}, `;
  document.querySelector("#stats-text").innerHTML += `True Skill Average: ${(skills.reduce((t,x) => t+x.levelPure,0) / skills.length).toFixed(2)}`


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
  //hide loading animation and show content
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").style.display = "flex";
})()
