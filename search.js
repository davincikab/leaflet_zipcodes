var searchBar = document.getElementById('location-bar');
var result = document.getElementById('result');
var filterData;
var searchData;
var locationMarker;

// load data
function loadCitiesData() {
    // fetch('usa.json')
    // .then(res => res.json())
    // .then(response => {
    //     searchData = response;

    //     if(!isMainPage){
    //         createListItems(searchData);
    //     }
       
    // })
    // .catch(error => {
    //     console.log(error);
    // });

    d3.csv('data.csv')
        .then(data => {
            console.log(data);

            convertToGeoJson(data);
        });

}

loadCitiesData();

function convertToGeoJson(csvData) {
    csv2geojson.csv2geojson(csvData, {
        latfield: 'lat',
        lonfield: 'lng',
        delimiter: ','
      }, function (err, data) {
          console.log(data);
          searchData = data.features;
          createListItems(data.features);
      }
    );
}

// Search bar event listener
searchBar.addEventListener('input', function(e) {
    console.log(this.value);
    forwardGeocoder(this.value);
});

function forwardGeocoder(query) {
    // clear the results tab if it contains
    if(query == '' || query.length < 2){
        // result.innerHTML = '';

        createListItems(searchData);
        return;
    }

    filterData = searchData;

    filterData = filterData.filter(item => {
        if(
            item.properties.name
            .toLowerCase()
            .includes(query.toLowerCase())
        ) { 
            return item;
        }
    });

    console.log(filterData);

    if(filterData.length == 0) {
        result.innerHTML = '<small class="text-center"><b>No result found<b></small>';
        return;
    }

    // 
    createListItems(JSON.parse(JSON.stringify(filterData)));
}

function createListItems(filterData) {
    if(isMainPage){
        return;
    }

    var docFrag = document.createDocumentFragment();

    // create a list of items
    filterData.forEach(data => {
        var list = document.createElement('li');
        list.className = 'address list-group-item';

        list.setAttribute('data-coord', data.geometry.coordinates);
        list.setAttribute('data-type', 'city');
        list.setAttribute('data-title', data.properties.name);

        list.innerHTML = data.properties.name;

        list.addEventListener('click',flyToMarker);

        docFrag.appendChild(list);
           
    });

    // add to result
    result.innerHTML = "";
    result.append(docFrag);
}

function flyToMarker(e) {
    console.log(this);
    let coordinate = this.getAttribute('data-coord');
    let coordinates = coordinate.split(',').map(coord => parseFloat(coord));

    console.log(coordinates);
    // update the input element
    searchBar.value = this.innerText;

    map.flyTo({
        center:coordinates
    });

    // add a marker
    if(locationMarker) {
        locationMarker.setLngLat(coordinates);
        return;
    }

    locationMarker = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);
}