var searchBar = document.getElementById('location-bar');
var result = document.getElementById('result');
var filterData;
var searchData;
var locationMarker;

// load data
function loadCitiesData() {
    fetch('usa.json')
    .then(res => res.json())
    .then(response => {
        searchData = response;

        createListItems(searchData);
    })
    .catch(error => {
        console.log(error);
    });
}

loadCitiesData();

// Search bar event listener
searchBar.addEventListener('input', function(e) {
    console.log(this.value);
    forwardGeocoder(this.value);
});

function forwardGeocoder(query) {
    // clear the results tab if it contains
    if(query == '' || query.length < 2){
        result.innerHTML = '';
        return;
    }

    filterData = searchData;

    if(filterData.length == 0) {
        result.innerHTML = '<small><b>No result found<b></small>';
        return;
    }

    filterData = filterData.filter(item => {
        if(
            item.fields.city
            .toLowerCase()
            .includes(query.toLowerCase())
        ) { 
            return item;
        }
    });

    console.log(filterData);

    // 
    createListItems(JSON.parse(JSON.stringify(filterData)));
}

function createListItems(filterData) {
    var docFrag = document.createDocumentFragment();

    // create a list of items
    filterData.forEach(data => {
        var list = document.createElement('li');
        list.className = 'address list-group-item';

        list.setAttribute('data-coord', data.fields.coordinates);
        list.setAttribute('data-type', 'city');
        list.setAttribute('data-title', data.fields.city);

        list.innerHTML = data.fields.city + ', '+ '<small>'+data.fields.state;+'</small>';

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

    map.flyTo(coordinates);

    // add a marker
    if(locationMarker) {
        locationMarker.setLatLng(coordinates);
        return;
    }

    locationMarker = L.marker(coordinates).addTo(map);
}