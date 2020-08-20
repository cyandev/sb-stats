document.getElementById("search-button").addEventListener("click", headerSearch);
if ((new URL(window.location.href)).searchParams.get("err")) {
  document.querySelector("#err-msg").innerHTML = (new URL(window.location.href)).searchParams.get("err");
}
document.getElementById("search-text").addEventListener("keyup", (k) => {if (k.key == "Enter") headerSearch()});
async function headerSearch() {
  window.location = window.location.origin + "/stats/" + document.getElementById("search-text").value;
}