/* eslint-disable no-unused-vars, no-undef */

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
    string = string.replace(/\x00*/g, ''); //eslint-disable-line
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
        final = document.createDocumentFragment();
    string = string.replace(/\n|\\n/g, '<br>');
    for(var len = codes.length, i = 0; i < len; i++) {
        indexes.push( string.indexOf(codes[i]) );
        string = string.replace(codes[i], '\x00\x00');
    }
    if(indexes[0] !== 0) {
        final.appendChild( applyCode( string.substring(0, indexes[0]), [] ) );
    }
    for(i = 0; i < len; i++) {
        var indexDelta = indexes[i + 1] - indexes[i];
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
    let wardrobeNew = [];
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
      if (item && item.skin) { //if the item has a skin, make an itemHead with its faces
        let itemHead = document.createElement("div");
        itemHead.classList.add("item-head");
        itemHead.innerHTML = `
        <img draggable="false" class="front cube"></div>
        <img draggable="false" class="back cube"></div>
        <img draggable="false" class="left cube"></div>
        <img draggable="false" class="right cube"></div>
        <img draggable="false" class="top cube"></div>
        <img draggable="false" class="bottom cube"></div>
        `
        for (let img of itemHead.children) {
            img.src = item.skin;
            img.style.backgroundImage = `url("${item.skin}")`
            img.failCount = 0;
            img.onerror = () => {
                img.failCount++;
                console.log("image", img, "failed to load");
                if (img.failCount < 5) setTimeout(() => img.src = item.faces[face], 1000)
            };
        }
        itemCell.appendChild(itemHead);
        itemCell.querySelector(".item-icon").style.display = "none"; //hide the icon if there is a head
      } else if (item && item.icon) { //if theres a fancy icon
        itemCell.querySelector(".item-icon").style.backgroundImage = `url(${item.icon})`
      } else if (item && item.leatherColor) { // if its leather
        (async () => {
          itemCell.querySelector(".item-icon").style.backgroundImage = "none";
          itemCell.querySelector(".item-icon").style.backgroundSize = "cover";
          switch (item.inventoryClass) {
            case "icon-298_0":
              itemCell.querySelector(".item-icon").style.backgroundImage = `url(${await colorItem("/img/item/leather_helmet.png","/img/item/leather_helmet_overlay.png",item.leatherColor)})`;
              break;
            case "icon-299_0":
              itemCell.querySelector(".item-icon").style.backgroundImage = `url(${await colorItem("/img/item/leather_chestplate.png","/img/item/leather_chestplate_overlay.png",item.leatherColor)})`;
              break;
            case "icon-300_0":
              itemCell.querySelector(".item-icon").style.backgroundImage = `url(${await colorItem("/img/item/leather_leggings.png","/img/item/leather_leggings_overlay.png",item.leatherColor)})`;
              break;
            case "icon-301_0":
              itemCell.querySelector(".item-icon").style.backgroundImage = `url(${await colorItem("/img/item/leather_boots.png","/img/item/leather_boots_overlay.png",item.leatherColor)})`;
              break;
          }
        })();
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
        cell.querySelector(".item-icon").style.transform = "translate(-50%, -50%) translateY(-1vw) scale(calc(var(--cellSize) / 128 * 0.8))";
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

function colorItem(base,overlay,color) {
  return new Promise((res,rej) => {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let baseImg = new Image();
    baseImg.src = base;
    baseImg.onload = () => {
      let {height, width} = baseImg;
      canvas.height = height;
      canvas.width = width;
      ctx.drawImage(baseImg,0,0);
      
      let imageData = ctx.getImageData(0,0,width,height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i+0] = imageData.data[i+0] * color[0]/255; //red
        imageData.data[i+1] = imageData.data[i+1] * color[1]/255; //green
        imageData.data[i+2] = imageData.data[i+2] * color[2]/255; //blue
      }
      ctx.putImageData(imageData,0,0);
      let overlayImage = new Image();
      overlayImage.src = overlay;
      overlayImage.onload = () => {
        ctx.drawImage(overlayImage,0,0);
        res(canvas.toDataURL());
      }
    }
  })
}