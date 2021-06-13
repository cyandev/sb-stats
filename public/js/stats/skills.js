/* eslint-disable no-unused-vars, no-undef */

function loadSkills(profileData) {
    for (let skillName in profileData.skills) {
        let skill = profileData.skills[skillName];
        let element = document.createElement("div");
        element.classList.add("skill");
        element.innerHTML = "<span class='skillName'></span><span class='skillLevel'></span><div class='bar'><span class='skillBarFill'></span><span class='skillBarText'></span></div>" //import some template HTML into div
        element.querySelector(".skillName").innerText = skill.name.charAt(0).toUpperCase() + skill.name.slice(1);
        element.querySelector(".skillLevel").innerText = skill.levelPure;
        if (skill.levelPure == skill.maxLevel) {
            element.querySelector(".skillBarFill").style.width = "100%";
            element.querySelector(".skillBarFill").style.backgroundColor = "#b3920d";
            element.querySelector(".skillBarText").innerText = cleanFormatNumber(skill.xpRemaining);
        } else {
            element.querySelector(".skillBarFill").style.width = (skill.progress * 100) + "%";
            element.querySelector(".skillBarText").innerText = cleanFormatNumber(skill.xpRemaining) + " / " + cleanFormatNumber(skill.nextLevel);
        }
        document.getElementById("skills").appendChild(element);
    }
}