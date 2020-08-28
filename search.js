var searchBar = document.getElementById('location-bar');
var result = document.getElementById('result');
var sideSection = document.querySelectorAll('.side-section');
var filterData;
var searchData;
var locationMarker;
var popup = new mapboxgl.Popup({anchor:"top", closeOnMove:false, closeOnClick:false})

// load data
function loadCitiesData() {
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
    // close direction tabs
    directionTab.classList.add("close");

    // geocode
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

    cleanFilterData(filterData);
    console.log(filterData);
    
}

function cleanFilterData(filterData) {
    if(filterData.length == 0 && !isMainPage) {
        sideSection.forEach(sd => {
            let st = getComputedStyle(sd);

            if(st.display != "none") {
                sd.innerHTML = '<div class="empty-result py-3 px-1 text-left"><p class="text-center"><b>No result found</b></p>'+
                    '<a class="btn btn-cust mr-3" href="become_partner.html">Add Your Business</a><p> '+
                    'No Partners in Your Area ? <a href="about.html" class="">About</a></p></div>';
            }
        })
        
        return;
    } else {
        if(filterData.length == 0) {
            result.innerHTML = '<div class="empty-result py-3 px-1 text-left"><p class="text-center"><b>No result found</b></p>'+
                '<a class="btn btn-cust mr-3" href="become_partner.html">Add Your Business</a><p> '+
                'No Partners in Your Area ? <a href="about.html" class="">About</a></p></div>';

            return;
        }
        
        
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

    sideSection[0].innerHTML = '';
    sideSection[1].innerHTML = '';

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

             // add an image
            list.innerHTML += "<div><img src='images/"+data.properties.logo+"' class='img'></div>";

            // add the title and address
            list.innerHTML += "<div ><div class='title'>"+data.properties.name+"</div>"+
            "<div class='text-small'>"+data.properties.address+"</div></div>";

            // list.innerHTML = data.properties.name;

            list.addEventListener('click',flyToMarker);

            docFrag.appendChild(list);
            
        });

    //    
        sideSection.forEach(sd => {
            let st = getComputedStyle(sd);

            if(st.display != "none") {
                sd.appendChild(docFrag);
            }
        })
       return category;
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
    // if(locationMarker) {
    //     locationMarker.setLngLat(coordinates);
    //     return;
    // }

    locationMarker = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .addTo(map);

    let title = this.getAttribute("data-title");
    let bus = searchData.find(feature =>  feature.properties.name == title);

    console.log(bus);
    bus = bus.properties;

    let content = "<div class=''><div class='card'>"+
    "<div class='card-h'><div class='card-content'> <img src='images/"+bus.logo+"' class='img'>"+
    "<div class='card-title-section' ><a class='link' href='"+bus.link+"'><b>"+bus.name +"</b></a>"+
    "<p>"+ bus.category+"</p></div></div></div>"+
    "<div class='card-info'>"+
    // "<p class='item'><span></span> "+bus.phone_number+"</p>"+
    "<p class='item'><span></span>"+bus.address+"</p>"+
    "<button class='btn btn-sm btn-primary' onClick='getDirection(["+coordinates+"])'>Directions</button>"+
    "<button class='btn btn-sm btn-primary ml-2'>Class Times</button></div>"+
    "</div></div>";

    // open popup
    if(isMainPage) {
        return ;
    }
    popup.setLngLat(coordinates)
        .setHTML(content)
        .setMaxWidth("250px")
        .addTo(map);

    console.log(coordinates);
}

function getDirection(destination) {
    // update the start with user location or start location
    console.log(destination);
    directionInfo.stop = destination;
    // if(userLocation.length > 0) {
    //     directionInfo.start = userLocation;
    // } else {
    //     alert("provide user location");
    //     return;
    // }

    if(directionInfo.start.length == 0) {
        alert('Kindly allow geolocation in your device');
        return;
    }

    // update the geocoder input
    geocoderOne.setInput(directionInfo.start);
    geocoderTwo.setInput(directionInfo.stop);

    // update 
    updateDestinationLayer(directionInfo.stop);
    updateStartLayer(directionInfo.start);

    // call get direction method
    getDirections(directionInfo, "driving");

    toggleDirectionTab();
}

class LogoControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl';
        this._container.innerHTML = "<a class='' href='/index.html'><img src='images/gsn.logostamp_blue.png' class='img'></a>";
        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

map.on("load", function(e) {
    map.addControl(new LogoControl(), "bottom-left");

    // create
});


window.onresize = function(e) {
    console.log(e);
    if(!isMainPage) {
        if(!filterData || filterData.length == 0) {
            filterData = searchData;
        }

        cleanFilterData(filterData);
    }
}