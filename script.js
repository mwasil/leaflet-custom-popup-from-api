const MARKERS_API_FULL_URL = "api/dla-dzieci.json" //musiałem pobrać lokalnie ze względu na CORP serwera API, docelowo można to zrobić dynamicznie

const MARKERS_CATEGORIES = [{ //kategorie mogą być pobierane przez API, wówczas proponuję taką strukturę
    "cat_id": 1,
    "cat_marker_url": "img/pins/Sightseeing.png"
  },
  {
    "cat_id": 2,
    "cat_marker_url": "img/pins/Walking.png"
  },
  {
    "cat_id": 3,
    "cat_marker_url": "img/pins/Skyline.png"
  },
  {
    "cat_id": 4,
    "cat_marker_url": "img/pins/Single_hotel.png"
  },
  {
    "cat_id": 5,
    "cat_marker_url": "img/pins/Museums.png"
  },
  {
    "cat_id": 6,
    "cat_marker_url": "img/pins/Eat_drink.png"
  }
]

const CURRENT_PLACE_LAT_LNG = [53.83418285041438, 18.828123966371813] // tablica ze współrzędnymi punktu, do którego mapa ma zostać przesunięta po wyświetleniu

let tileLayer = new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { // wstępna konfiguracja mapy
  attribution: '&copy; <a href="/copyright">autorzy OpenStreetMap</a>'
});

let map = new L.Map('map', { // wstępna konfiguracja mapy c.d.
  'layers': [tileLayer]
});

let markerLayer = { // obiekt, który odpowiada za wszystkie operacje na warstwie markerów 
  markersApiUrl: MARKERS_API_FULL_URL,

  markerIconsJson: MARKERS_CATEGORIES,

  markersJson: false,

  markerIcons : [],

  markers: new L.FeatureGroup(),

  getMarkers: async function () { // pobiera json z danymi markerów
    const response = await fetch(this.markersApiUrl);
    const data = await response.json();
    this.markersJson = data;
    // console.log(this.markersJson);
  },

  setUpMarkerIcons : function () { // konfiguruje tablicę z stylami markerów zależnie od kategorii
    let obj = this.markerIconsJson;
    t = this;
    Object.keys(obj).forEach(function (key) {
      // console.log(key, obj[key]); // TODO obsługa błędów w danych markerów
      t.markerIcons[obj[key].cat_id] = L.icon({
        iconUrl: obj[key].cat_marker_url,
        iconSize: [60, 60],
        iconAnchor: [30,60]
      })
    })
  },

  makeLayer: function () { // pobiera dane pojedynych marketów i dodaje wysyła je do .makeMarker()
    let obj = this.markersJson;
    t = this;
    Object.keys(obj).forEach(function (key) {

      // console.log(key, obj[key]); // TODO obsługa błędów w api
      let lat = obj[key].object_lat;
      let lng = obj[key].object_lng;
      let name = obj[key].object_name;
      let catName = obj[key].category_name;
      let catId = obj[key].category_id;
      let link = obj[key].object_url;
      let marker_desc = obj[key].object_info;
      t.makeMarker(lat, lng, name, catName, catId, link, marker_desc)

    });
  },

  makeMarker: function (lat, lng, name, catName, catId, link, marker_desc) { //tworzy pojedyncze markery i dodaje je do grupy
    let t = this;
    let singleMarker = L.marker([lat, lng], {
      icon: t.markerIcons[catId],
      catName: catName
    });
    let markerHtml = '<p class="leaflet-popup--header">' + name + '</p>';
    markerHtml += '<span class="leaflet-popup--desc">'+ marker_desc + '</span><br>';
    markerHtml += (link) ? '<p class="leaflet-popup--button"><a class="btn_infobox" target="_parent" href="https://' + link + '">Szczegóły</a></p>' : '';
    singleMarker.bindPopup(markerHtml, {
      maxWidth: 200
    });
    this.markers.addLayer(singleMarker);
  }
}


async function drawMarkerLayer() { // wykonanie wszystkich kroków składających mapę po kolei
  await markerLayer.getMarkers();
  await markerLayer.setUpMarkerIcons();
  await markerLayer.makeLayer();
  await map.fitBounds(markerLayer.markers.getBounds());
  await map.panTo(CURRENT_PLACE_LAT_LNG);
  await markerLayer.markers.addTo(map);
}

drawMarkerLayer()