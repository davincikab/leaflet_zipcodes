var searchBar = document.getElementById('location-bar');
var result = document.getElementById('result');
var sideSection = document.getElementById('side-section');
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

        createMarkers(data);
        if(isMainPage){
            return;
        }
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

        if(isMainPage) {
            result.innerHTML = '';
            return;
        }

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

    if(filterData.length == 0 && !isMainPage) {
        sideSection.innerHTML = '<div class="empty-result py-3 px-1 text-center"><small class="text-center"><b>No result found</b></small><br>'+
                '<a class="btn btn-cust mr-3" href="">Add Your Business</a><small> '+
                'No Partners in Your Area ? </small><a href="" class="">About</a></div>'
        return;
    } else {
        result.innerHTML = '<div class="empty-result py-3 px-1 text-center"><small class="text-center"><b>No result found</b></small><br>'+
            '<a class="btn btn-cust mr-3" href="">Add Your Business</a><small> '+
            'No Partners in Your Area ? </small><a href="" class="">About</a></div>'
    }

    // 
    if(isMainPage) {
        createListGroupItems(JSON.parse(JSON.stringify(filterData)));
    } else {
        createListItems(JSON.parse(JSON.stringify(filterData)));
    }
    
}

function createMarkers(businessdata) {
    businessdata.features.forEach(business => {
        
        new mapboxgl.Marker()
            .setLngLat(business.geometry.coordinates)
            .addTo(map);
    });
}

function createListItems(filterData) {
    let categories = filterData.map(datum => datum.properties.category);
    categories = [...new Set(categories)];

    sideSection.innerHTML = '';
    categories.forEach(category => {
        var docFrag = document.createElement('ul');
        docFrag.classList.add("list-group");
        docFrag.classList.add("mb-2");

        // add header section
        docFrag.innerHTML += "<div class='card-header'>"+category+"</div>";
        let categoryData = filterData.filter(ft => ft.properties.category == category);

        // create a list of items
        categoryData.forEach(data => {
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
        sideSection.append(docFrag);
    });

}

function createListGroupItems(filterData) {
    let docFrag = document.createDocumentFragment();

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

    result.innerHTML = "";
    result.append(docFrag);
}

function flyToMarker(e) {
    console.log(this);
    let coordinate = this.getAttribute('data-coord');
    let coordinates = coordinate.split(',').map(coord => parseFloat(coord));

    console.log(coordinates);
    
    if(isMainPage){
        result.innerHTML = '';
    }

    // update the input element
    searchBar.value = this.innerText;

    map.flyTo({
        center:coordinates,
        zoom:12
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

class LogoControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl';
        this._container.innerHTML = "<a class='' href='https://groundstandard.com'><img src='images/gsn.logostamp_blue.png' class='img'></a>";
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

map.on("load", function(e) {
    map.addControl(new LogoControl(), "bottom-left")
});