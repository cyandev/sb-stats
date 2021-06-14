/* eslint-disable no-unused-vars, no-undef */
document.querySelector("#playerModel").style.display = "none";
(async () => {
    let username = window.location.href.split("/")[4];
    let profile = window.location.href.split("/").length > 4 ? window.location.href.split("/")[5] : "default"
    let data = await (await fetch(window.location.origin + "/api/data/" + username)).json();
    if (!data) {
        window.location.href = window.location.origin + "?err=Invalid Player!";
        return;
    }
    let uuid = data.uuid;
    for (let face of document.querySelector("#model-container").querySelectorAll("img.face.player")) {
      face.src = `https://crafatar.com/skins/${uuid}`;
    }
    for (let face of document.querySelector("#model-container").querySelectorAll("#head img.face.player")) {
      face.style.backgroundImage = `url("https://crafatar.com/skins/${uuid}")`
    }
    username = data.name;
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
    loadSkills(profileData);
  
    //load inventories
    loadInventories(profileData);
  
    //load pets
    loadPets(profileData);
  
    //load slayer
    loadSlayer(profileData);

    //load combat
    loadCombat(profileData);
    
    //load minions
    loadMinions(profileData);
      
    /* TALISMAN OPTIMIZER SECTION */
    let bestTalismanScore = 0;
    async function doTalismans() {
      document.querySelector("#optimize-label").innerText = "Calculating..."
      let armor = profileData.inventories.find((x) => x.name == "inv_armor").contents;
  
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
      }
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
    document.querySelector("#playerModel").style.display = "flex";
  })().catch((err) => {
    console.log(err.stack);
    //window.location = window.location.origin + "?err=" + err.stack
  });
