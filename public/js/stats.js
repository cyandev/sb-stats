const xp_table = [0,50,125,200,300,500,750,1000,1500,2000,3500,5000,7500,10000,15000,20000,30000,50000,75000,100000,200000,300000,400000,500000,600000,700000,800000,900000,1000000,1100000,1200000,1300000,1400000,1500000,1600000,1700000,1800000,1900000,2000000,2100000,2200000,2300000,2400000,2500000,2600000,2750000,2900000,3100000,3400000,3700000,4000000]
const xp_table_runecrafting = [0,50,100,125,160,200,250,315,400,500,625,785,1000,1250,1600,2000,2465,3125,4000,5000,6200,7800,9800,12200,15300,19050];
const excludedSkills = ["carpentry","runecrafting"];

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
  let opt={cols: 9, hasHotbar: true, cellSize: "6vw"};
  for (let key in options) {
    opt[key] = options[key];
  }
  if (opt.hasHotbar) {
    contents = contents.slice(opt.cols).concat(contents.slice(0,opt.cols));
  }
  let grid = document.createElement("div");
  grid.classList.add("inv-view")
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${opt.cols}, ${opt.cellSize})`;
  grid.style.gridAutoRows = opt.cellSize;
  contents.forEach((item,i) => {
    let itemCell = document.createElement("div");
    itemCell.innerHTML = `
    <img class="item-icon">
    <span class="item-count"></span>
    `
    itemCell.classList.add("item-cell");
    if (item.faces) {
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
      itemCell.querySelector(".item-icon").style.display = "none";
    } else if (item.name) {
      itemCell.querySelector(".item-icon").src = item.icon;
    } else {
      itemCell.querySelector(".item-icon").style.display = "none";
    }
    if (item.count > 1) {
      itemCell.querySelector(".item-count").innerHTML = item.count;
    }
    //itemCell.querySelector(".item-count").innerHTML = i;
    grid.appendChild(itemCell);
  })
  return grid
}


(async () => {
  let username = window.location.href.split("/")[4];
  let profile = window.location.href.split("/").length > 4 ? window.location.href.split("/")[5] : "default"
  let data = await (await fetch(window.location.origin + "/api/data/" + username)).json();
  console.log(data)
  let profileArr = Object.keys(data.profiles).map((x) => data.profiles[x]);
  let profileData = profileArr.find((x) => x.cute_name == profile)
  if (!profileData) {
    profileData = profileArr.sort((a,b) => b.last_save - a.last_save)[0];
    profile = profileData.cute_name
    window.history.pushState("object or string", "Title", `/stats/${username}/${profile}`);
  }
  document.getElementById("playerName").innerHTML = `<span style="color:${data.color}">[${data.rank.split("_PLUS").join(`${data.rank.includes("MVP") ? `<span style="color:${data.plus}">+</span>` : "+"}`)}] ${username}</span>`;
  document.getElementById("profileName").innerHTML = profile;
  console.log(profileData);

  //load basic stats
  if (profileData.balance) {
    document.querySelector("#stats-text").innerHTML += `Bank: ${cleanFormatNumber(profileData.balance)}, `
  }
  document.querySelector("#stats-text").innerHTML += `Purse: ${cleanFormatNumber(profileData.purse)}, `
  document.querySelector("#stats-text").innerHTML += `Fairy Souls: ${profileData.fairy_souls}, `

  //load skills
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


  //armor
  document.querySelector("#armor").appendChild(makeInventoryViewer(profileData.inventories.find((x) => x.name == "inv_armor").contents.reverse(), {cols: 1, hasHotbar: false}));

  //wardrobe
  document.querySelector("#wardrobe").appendChild(makeInventoryViewer(transformWardrobe( profileData.inventories.find((x) => x.name == "wardrobe_contents").contents), {cols: 18, hasHotbar: false}));

  //inventories view
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
    console.log(inventory.contents)
    if(inventory.contents[inventory.contents.length - 6].name && inventory.contents[inventory.contents.length - 6].name.includes("Go Back")) {
      inventory.contents = inventory.contents.slice(0,inventory.contents.length - 9)
    }

    let invView = makeInventoryViewer(inventory.contents, {hasHotbar: inventory.name == "inv_contents" ? true : false});
    invView.name = inventory.name;
    document.querySelector("#inv-view-container").appendChild(invView);
  }
  showInventory("inv_contents");
  //document.querySelector("#inventories").appendChild(makeInventoryViewer(profileData.inventories.find((x) => x.name == "inv_contents").contents, {cellSize: "7vw"}));
  //hide loading animation and show content
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").style.display = "flex";
})()
