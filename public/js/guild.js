function cleanFormatNumber(n) {
  n = n.toFixed(0);
  if (n.length <= 3) return n;
  const post = ["","k","m","b","t","q"];
  return n.slice(0,3) / ((n.length - 3) % 3 == 0 ? 1: Math.pow(10,3 - n.length % 3)) + post[Math.floor((n.length-1) / 3)]
}

function createTableIn(div,data) {
  for (let row of data) {
    let rowDom = document.createElement("div");
    for (let cell of row) {
      let cellDom = document.createElement("div");
      cellDom.innerHTML = cell;
      rowDom.appendChild(cellDom);
    }
    div.appendChild(rowDom);
  }
}
(async () => {
  let guildName = window.location.href.split("/")[4];
  console.log(guildName);
  let guildApi = await (await fetch(window.location.origin + "/api/guild/" + guildName)).json();
  console.log(guildApi)
  document.querySelector("#guildName").innerText = `${guildApi.name} [${guildApi.tag.text}]`;
  if (guildApi.incomplete) {
    document.querySelector("#guildLoadingMessage").style.display = "block";
  } else {
    document.querySelector("#guildDescription").innerText = `${cleanFormatNumber(guildApi.averageSlayer)} Slayer - ${guildApi.averageSkillLevel} Average Skill Level`;
  }
  createTableIn(document.querySelector("#guildMemberList"), guildApi.members.map(x => [x.name, x.weight.toFixed(3), x.averageSkill.toFixed(2), cleanFormatNumber(x.slayer), x.catacombs.toFixed(2)]))
  document.querySelector("#loading").style.display = "none";
  document.querySelector("#content").style.display = "block";
})()