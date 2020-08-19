var isMainPage = true;

// Creating map object
var map = L.map("map", {
    center: [39.2832938689385, -99.25048828125],
    zoom: 5,
    minZoom:0,
    zoomDelta:1
});

map.zoomControl.remove();


var cartoWhite = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
    attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    minZoom: 0
});

cartoWhite.addTo(map);