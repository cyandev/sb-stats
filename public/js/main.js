document.getElementById("search-button").addEventListener("click", headerSearch)
document.getElementById("search-text").addEventListener("keyup", (k) => {if (k.key == "Enter") headerSearch()});
async function headerSearch() {
  let username = document.getElementById("search-text").value;
  let exists = await (await fetch(window.location.origin + "/api/exists/" + username)).json();
  console.log(exists)
  if (exists) {
    console.log(username);
    window.location = window.location.origin + "/stats/" + username;
  }
}