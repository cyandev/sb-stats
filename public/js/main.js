document.getElementById("search-button").addEventListener("click", boxSearch);
if ((new URL(window.location.href)).searchParams.get("err")) {
  document.querySelector("#err-msg").innerText = (new URL(window.location.href)).searchParams.get("err");
}
document.getElementById("search-text").addEventListener("keyup", (k) => {if (k.key == "Enter") boxSearch()});
async function boxSearch() {
  window.location = window.location.origin + "/stats/" + document.getElementById("search-text").value;
}