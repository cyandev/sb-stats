/*
js file to manage the headers functionality
*/
document.getElementById("header-search-button").addEventListener("click", headerSearch)
document.getElementById("header-search-text").addEventListener("keyup", (k) => {if (k.key == "Enter") headerSearch()});
async function headerSearch() {
  window.location = window.location.origin + "/stats/" + document.getElementById("header-search-text").value;
}