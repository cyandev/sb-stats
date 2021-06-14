/* eslint-disable no-unused-vars, no-undef */

function loadPets(profileData) {
    let petSelector = makeInventorySelector(profileData.pets, {cols: 10, hasHotbar: false, rarityColor:true});
    console.log(petSelector)
    petSelector.style.gridAutoRows = "9.5vw"
    for (let cell of petSelector.querySelectorAll(".item-cell")) {
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
    petSelector.checked = profileData.pets[0];
    petSelector.onUpdate = () => {
        updatePet();
    }
    if (petSelector.children[0]) {
        petSelector.children[0].querySelector(".item-selector").checked = true;
    }
    if (petSelector.children[1]) {
        petSelector.children[1].querySelector(".item-selector").checked = false;
    }
    document.querySelector("#pets").appendChild(petSelector);
    updatePet();
}