const xp_table = [0,50,125,200,300,500,750,1000,1500,2000,3500,5000,7500,10000,15000,20000,30000,50000,75000,100000,200000,300000,400000,500000,600000,700000,800000,900000,1000000,1100000,1200000,1300000,1400000,1500000,1600000,1700000,1800000,1900000,2000000,2100000,2200000,2300000,2400000,2500000,2600000,2750000,2900000,3100000,3400000,3700000,4000000]
const xp_table_runecrafting = [0,50,100,125,160,200,250,315,400,500,625,785,1000,1250,1600,2000,2465,3125,4000,5000,6200,7800,9800,12200,15300,19050];
function cleanFormatNumber(n) {
  n = n.toFixed(0);
  const post = ["","k","m","b","t","q"];
  return n.slice(0,3) / ((n.length - 3) % 3 == 0 ? 1: Math.pow(10,3 - n.length % 3)) + post[Math.floor((n.length-1) / 3)]
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

  //load skills
  Object.keys(profileData.skills).forEach((skillName) => {
    let xpRemaining = profileData.skills[skillName];
    let level = 0;
    let table = skillName == "runecrafting" ? xp_table_runecrafting : xp_table;
    for (let i = 0; i < table.length && xpRemaining >= table[i]; i++) {
      xpRemaining -= table[i];
      level = i;
    }
    console.log(skillName, level, table.length, xpRemaining)
    let element = document.createElement("div");
    element.classList.add("skill")
    element.innerHTML = "<span class='skillName'></span><span class='skillLevel'></span><div class='bar'><span class='skillBarFill'></span><span class='skillBarText'></span></div>" //import some template HTML into div
    console.log(table)
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
    document.getElementById("skills").appendChild(element);
    
  })
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").style.display = "flex";
})()
