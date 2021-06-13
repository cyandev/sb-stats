/* eslint-disable no-unused-vars, no-undef */

function loadSlayer(profileData) {
    document.querySelector("#slayer-total").innerText = (Object.keys(profileData.slayer).reduce((t,x) => profileData.slayer[x].xp + t, 0)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Slayer XP"
    document.querySelector("#slayer-grid").style.gridTemplateColumns = `repeat(${Object.keys(profileData.slayer).length},1fr)`;
    let slayerToBoss = {
        "spider": "Tarantula Broodfather",
        "wolf": "Sven Packmaster",
        "zombie": "Revenant Horror",
        "enderman": "Voidgloom Seraph"
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
            if (!profileData.slayer[slayer].boss_kills[tier] > 0) label.innerText = "" //don't show uncompleted tiers
            label.classList.add("slayer-kills-label");
            slayerDisplay.querySelector(".slayer-kills").appendChild(label)
        }
        for (let tier in profileData.slayer[slayer].boss_kills) {
            let label = document.createElement("div");
            label.innerText = cleanFormatNumber(profileData.slayer[slayer].boss_kills[tier]);
            if (!profileData.slayer[slayer].boss_kills[tier] > 0) label.innerText = "" //don't show uncompleted tiers
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
}