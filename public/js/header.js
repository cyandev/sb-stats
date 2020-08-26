/*
js file to manage the headers functionality
*/
document.getElementById("header-search-button").addEventListener("click", headerSearch)
document.getElementById("header-search-text").addEventListener("keyup", (k) => {if (k.key == "Enter") headerSearch()});

var searchType = "User"
async function headerSearch() {
  if (searchType == "User") {
    window.location = window.location.origin + "/stats/" + document.getElementById("header-search-text").value;
  } else if (searchType == "Guild") {
    window.location = window.location.origin + "/guild/" + document.getElementById("header-search-text").value;
  }
  
}
document.querySelector("#search-type-selector").addEventListener("mouseover", () => {
  console.log("in")
  for (let opt of document.querySelector("#search-type-selector").querySelectorAll(".selector-opt")) {
    opt.style.display = "block";
  }
})
document.querySelector("#search-type-selector").addEventListener("mouseout", () => {
  console.log("out")
  for (let opt of document.querySelector("#search-type-selector").querySelectorAll(".selector-opt")) {
    opt.style.display = "none";
  }
})

for (let opt of document.querySelector("#search-type-selector").querySelectorAll(".selector-opt")) {
    opt.addEventListener("click", () => {
      searchType = opt.innerText;
      document.querySelector("#search-type-selector-selected").innerText = opt.innerText + " >"
    })
}