let nbt = require("prismarine-nbt");

//head images stored as base64 encoded JSON object at item.SkullOwner.Properties.Textures.value
function nbtToJson(base64) {
  return new Promise((res) => {
    nbt.parse(Buffer.from(base64, "base64"), (err,data) => {
      if(err) {
        console.log(err);
        return null;
      }
      res(nbt.simplify(data));
    })
  })
}
exports.nbtToJson = nbtToJson;

function nbtBufToJson(buf) {
  return new Promise((res) => {
    nbt.parse(buf, (err,data) => {
      if(err) {
        console.log(err);
        return null;
      }
      res(nbt.simplify(data));
    })
  })
}
exports.nbtBufToJson = nbtBufToJson;

function cleanFormatNumber(n) {
  n = n.toFixed(0);
  if (n.length <= 3) return n;
  const post = ["","k","m","b","t","q"];
  return n.slice(0,3) / ((n.length - 3) % 3 == 0 ? 1: Math.pow(10,3 - n.length % 3)) + post[Math.floor((n.length-1) / 3)]
}
exports.cleanFormatNumber = cleanFormatNumber;

function checkNested(obj, level,  ...rest) {
  if (obj === undefined) return false
  if (rest.length == 0 && obj.hasOwnProperty(level)) return true //eslint-disable-line
  return checkNested(obj[level], ...rest)
}
exports.checkNested = checkNested;

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
  contents.forEach((item) => {
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