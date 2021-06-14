/* eslint-disable no-unused-vars, no-undef */

function loadInventories(profileData) {
    //load armor
    document.querySelector("#armor-inv").appendChild(makeInventoryViewer(profileData.inventories.find((x) => x.name == "inv_armor").contents.reverse(), {cols: 1, hasHotbar: false, rarityColor: true}));
  
    //load wardrobe / wardrobe api check
    if (profileData.inventories.find((x) => x.name == "wardrobe_contents")) {
        var wardrobeSelector = makeInventorySelector(transformWardrobe( profileData.inventories.find((x) => x.name == "wardrobe_contents").contents), {cols: 18, hasHotbar: false, rarityColor: true});
        wardrobeSelector.onUpdate = () => {    
            //set selected to an inventory of the armor
            let bootsIndex = Array.from(wardrobeSelector.children).indexOf(Array.from(wardrobeSelector.children).find(x => x.item == wardrobeSelector.checked));
            wardrobeSelector.checked = [wardrobeSelector.children[bootsIndex- 18 * 3].item, wardrobeSelector.children[bootsIndex- 18 * 2].item, wardrobeSelector.children[bootsIndex- 18 * 1].item, wardrobeSelector.children[bootsIndex].item];
    
            //set armor display to show selected
            document.querySelector("#armor-inv").innerHTML = ""
            document.querySelector("#armor-inv").appendChild(makeInventoryViewer(wardrobeSelector.checked, {cols: 1, hasHotbar: false, rarityColor: true}));
            
            //set the inv_armor to the newly selected set
            profileData.inventories.find((x) => x.name == "inv_armor").contents = wardrobeSelector.checked;
    
            //update armor view
            updateArmor();
        }
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
            wardrobeSelector.children[i].querySelector(".item-icon").style.transform = "translate(-50%, -50%) scale(calc(var(--cellSize) / 128 * 0.8))"
        }
        document.querySelector("#wardrobe").appendChild(wardrobeSelector);
    } else {
        let apiWarn = document.createElement("span");
        apiWarn.innerText = "Inventory API Not Enabled!"
        apiWarn.classList.add("api-warn")
        document.querySelector("#wardrobe").appendChild(apiWarn);
    }
    
    updateArmor();
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
    for (let inventory of profileData.inventories.filter((x) => !excludedInv.includes(x.name) && !x.name.includes("backpack"))) {
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
}