/* Dirección antigua (region.html?id=maule): redirige a la página nueva (regiones/maule) */
(function () {
  var p = new URLSearchParams(location.search);
  var id = (p.get("id") || "").replace(/[^a-z]/g, "");
  p.delete("id");
  var resto = p.toString();
  location.replace(id ? "regiones/" + id + (resto ? "?" + resto : "") : "./");
})();
