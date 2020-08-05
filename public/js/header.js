/*
js file to manage the headers functionality
*/
document.getElementById("header-search-button").addEventListener("click", headerSearch)
document.getElementById("header-search-text").addEventListener("keyup", (k) => {if (k.key == "Enter") headerSearch()});
async function headerSearch() {
  let username = document.getElementById("header-search-text").value;
  let exists = await (await fetch(window.location.origin + "/api/exists/" + username)).json();
  console.log(exists)
  if (exists) {
    console.log(username);
    window.location = window.location.origin + "/stats/" + username;
  }
}