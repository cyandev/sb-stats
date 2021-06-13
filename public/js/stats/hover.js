/* eslint-disable no-unused-vars, no-undef */

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