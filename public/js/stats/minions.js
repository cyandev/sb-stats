/* eslint-disable no-unused-vars, no-undef */

function loadMinions(profileData) {
    //make matrix into an actual matrix
    let minionTable = Object.keys(profileData.minions.matrix).map(x => [x].concat(profileData.minions.matrix[x].slice(1)));
    //fill table
    for (let row of minionTable) {
      for (let x of row) {
        let cell = document.createElement("div");
        if (typeof x == "string") {
            cell.classList.add("minionText");
            cell.innerText = minionNameMap[x];
        } else {
            cell.classList.add("minionBoolCell")
            cell.classList.add(String(Boolean(x)))
        }
        document.querySelector("#minion-table").appendChild(cell)
      }
    }
  
    //fill missing list
    for (let minion of profileData.minions.missing) {
        let name = document.createElement("div");
        let price = document.createElement("div");
        name.innerText = minionNameMap[minion[0]] + " " + minion[1];
        price.innerText = minion[2] ? cleanFormatNumber(Number(minion[2])) : "???";
        document.querySelector("#minion-upgrades").appendChild(name);
        document.querySelector("#minion-upgrades").appendChild(price);
    }
  
    //calculate price till next slot
    let nextSlotPrice = 0;
    if (profileData.minions.missing.length >= profileData.minions.nextTier) {
        let nextMinions = profileData.minions.missing.slice(0,profileData.minions.nextTier);
        if (nextMinions.every(x => x[2])) {
            nextSlotPrice = nextMinions.reduce((t,x) => t+Number(x[[2]]), 0);
        } else {
            nextSlotPrice = null;
        }
    } else {
        nextSlotPrice = null;
    }
  
    document.querySelector("#minion-extra").innerText = `Unique Minions ${profileData.minions.uniques}, Minion Slots: ${profileData.minions.slots + profileData.minions.bonusSlots}, Cost of Next Slot: ${nextSlotPrice ? cleanFormatNumber(nextSlotPrice) : "???"}`;
}