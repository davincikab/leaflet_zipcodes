var searchBar = document.getElementById('location-bar');
var result = document.getElementById('result');
var sideSection = document.querySelectorAll('.side-section');
var filterData;
var isFilterMode = false;
var searchData;
var locationMarker;
var currentPopup = new mapboxgl.Popup({anchor:"top", closeOnMove:false, closeOnClick:true});
var directionLink = document.getElementById("direction-link");

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
    // directionTab.classList.add("close");

    
    isFilterMode = true;

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

        filterData = JSON.parse(JSON.stringify(searchData));
        createListItems(searchData);
        return;
    }

    filterData = JSON.parse(JSON.stringify(searchData));

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

function cleanFilterData(data) {
    if(!data || data.length == 0) {
        sideSection.forEach(sd => {
            let st = getComputedStyle(sd);

            if(st.display != "none") {
                sd.innerHTML = '<div class="empty-result py-3 px-1 text-left"><p class="text-center"><b>No result found</b></p>'+
                    '<p>No Partners in Your Area ?<br> '+
                    '<a class="btn btn-cust mr-3" href="become_partner.html">Add Your Business</a>'+
                    '<a href="about.html" class="btn btn-cust">About</a></p></div>';
            }
        });
        
        return;
    } else {
        if(data.length == 0) {
            result.innerHTML = '<div class="empty-result py-3 px-1 text-left"><p class="text-center"><b>No result found</b></p>'+
                '<p>No Partners in Your Area ?'+
                ' <a class="btn btn-sm btn-cust mr-3" href="become_partner.html">Add Your Business</a><a href="about.html" class="">About</a></p></div>';

            return;
        }
        
        
    }

    // 
    if(isMainPage) {
        createListGroupItems(JSON.parse(JSON.stringify(data)));
    } else {
        createListItems(JSON.parse(JSON.stringify(data)));
    }
}


function createMarkers(businessdata) {
    businessdata.features.forEach(business => {
        let coordinates = business.geometry.coordinates;
        let directionProps = "["+coordinates+"],"+"\""+business.properties.address+"\"";

        var popupContent = "<div class=''><div class='card'>"+
        "<div class='card-h'><div class='card-content'> <img src='images/"+business.properties.logo+"' class='img ml-2'>"+
        "<div class='card-title-section' ><a class='link' href='"+business.properties.link+"'><b>"+business.properties.name +"</b></a>"+
        "<p>"+ business.properties.category+"</p></div></div></div>"+
        "<div class='card-info'>"+
        // "<p class='item'><span></span> "+bus.phone_number+"</p>"+
        "<p class='item'><span></span>"+business.properties.address+"</p>"+
        "<button class='btn btn-sm btn-primary' id='direction-btn' onclick='getDirection("+directionProps+")'>Directions</button>"+
        "<a class='btn btn-sm btn-primary ml-2' href='https://msgsndr.com/widget/booking/xweYFM6ZfzlWbZMfvtWG )'>Class Times</a></div>"+
        "</div></div>";

        let popup = new mapboxgl.Popup()
            .setHTML(popupContent)
            .setMaxWidth("250px");

        popup.on("open", function(e){
            console.log("Popup open");  

            if(currentPopup.isOpen() && currentPopup != popup) {
                currentPopup.remove();
            }

            isPopupOpenEvent = true;

            directionInfo.start = [];

            let element = document.querySelector('.mapboxgl-popup-content');
            element.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            // get the 
            let directionButton = document.getElementById("direction-btn");
            directionButton.addEventListener("click", function(e) {
                console.log(e);
                getDirection(coordinates, business.properties.address);

                // update the class times link
                classLink.setAttribute("href", "https://msgsndr.com/widget/booking/xweYFM6ZfzlWbZMfvtWG");
            });

            currentPopup = popup;
        });

        popup.on("close", function(e) {
            console.log("Popup closed");
            if(currentPopup == popup) {
                console.log("True");
            }
        });

        let marker = new mapboxgl.Marker()
            .setLngLat(business.geometry.coordinates)
            .setPopup(popup)
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
    let titleElem = this.querySelector('.title');
    console.log(titleElem.innerText);

    searchBar.value = titleElem.innerText;
    searchBar.dispatchEvent(event);
    
    map.flyTo({
        center:coordinates,
        zoom:12
    });

    // locationMarker = new mapboxgl.Marker()
    //     .setLngLat(coordinates)
    //     .addTo(map);

    let title = this.getAttribute("data-title");
    let bus = searchData.find(feature =>  feature.properties.name == title);

    console.log(bus);
    bus = bus.properties;
    let directionProps = "["+coordinates+"],"+"\'"+bus.address+"\'";
    
    let content = "<div class=''><div class='card'>"+
    "<div class='card-h'><div class='card-content'> <img src='images/"+bus.logo+"' class='img ml-2'>"+
    "<div class='card-title-section' ><a class='link' href='"+bus.link+"'><b>"+bus.name +"</b></a>"+
    "<p>"+ bus.category+"</p></div></div></div>"+
    "<div class='card-info'>"+
    // "<p class='item'><span></span> "+bus.phone_number+"</p>"+
    "<p class='item'><span></span>"+bus.address+"</p>"+
    "<button class='btn btn-sm btn-primary' id='direction-btn'>Directions</button>"+
    "<a class='btn btn-sm btn-primary ml-2' href='https://msgsndr.com/widget/booking/xweYFM6ZfzlWbZMfvtWG'>Class Times</a></div>"+
    "</div></div>";

    // open popup
    currentPopup.remove();
    currentPopup.setLngLat(coordinates)
        .setHTML(content)
        .setMaxWidth("250px")
        .addTo(map);
    
    if(currentPopup.isOpen()) {
        console.log("Popup open");  
        // get the 
        let directionButton = document.getElementById("direction-btn");
        directionButton.addEventListener("click", function(e) {
            console.log(e);
            getDirection(coordinates, bus.address);

             // update the class times link
             classLink.setAttribute("href", "https://msgsndr.com/widget/booking/xweYFM6ZfzlWbZMfvtWG");
        });
    }

     // get the 
    // currentPopup.on("open", function(){
    //     console.log("Popup open");  
    //     isPopupOpenEvent = true;

    //     directionInfo.start = [];

    //     // get the 
    //     let directionButton = document.getElementById("direction-btn");
    //     directionButton.addEventListener("click", function(e) {
    //         console.log(e);
    //         getDirection(coordinates, bus.address);
    //     });
    // });

    console.log(coordinates);
}

function getDirection(destination, address) {
    // update the directions link
    let platform = navigator.platform;
    let url;

    if(platform.indexOf("iPhone") != -1 ||
        platform.indexOf("iPod") != -1 ||
        platform.indexOf("iPad") != -1  
    ) {
        url = "https://www.google.com/maps/dir/?api=1&destination="+ address;
    }
    else {
        url = "https://www.google.com/maps/dir/?api=1&destination="+ address;
    }

    directionLink.setAttribute("href", url);

    // update the start with user location or start location
    console.log("Directions :" + isDirectionTabOpen);
    directionInfo.stop = destination.reverse();
    isPopupOpenEvent = false;

    toggleDirectionTab();
    toggleSearchTab();

    console.log("Directions :" + isDirectionTabOpen);

    // update list 
    searchBar.value = "";
    searchBar.dispatchEvent(event);

    if(directionInfo.start.length == 0) {
        // alert('Kindly allow geolocation in your device or provide a starting point');
        // return;
    } else {

        clearInstructionsDiv();

         // update the geocoder input
        let start = directionInfo.start;
        geocoderOne.setInput(start[1] +", "+ start[0]);
        geocoderOne.query(start[1] +", "+ start[0]);
    }

    geocoderTwo.setInput(address);
    geocoderTwo.query(address);


    // update 
    updateDestinationLayer(directionInfo.stop);
    updateStartLayer(directionInfo.start);

    if(directionInfo.start.length == 2 && directionInfo.stop.length) {
        // call get direction method
        getDirections(directionInfo, "driving");
    }
    
}

class LogoControl {
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl';
        this._container.innerHTML = "<a class='' href='/index.html'><img src='images/gsn.logostamp_blue.png' class='img'></a>"+
        "<button class='btn btn-sm btn-primary' id='reset-btn'>Reset</button>";


        return this._container;
    }
    
    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

map.on("load", function(e) {
    map.addControl(new LogoControl(), "bottom-left");

    let resetBtn = document.getElementById("reset-btn");
    resetBtn.addEventListener("click", function(e) { 
        searchBar.value = "";
        searchBar.dispatchEvent(event);

        directionTab.classList.add("close");
        searchSection.classList.remove("close");
        // toggleSearchTab();

        updateDestinationLayer([]);
        updateStartLayer([]);

        isDirectionTabOpen = false;

        var geojson = {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                    'coordinates': []
            }
        };

        addRoute(geojson);   
    });
    // create
    getDirectionsFromUrl();
});


window.onresize = function(e) {
    console.log(e);
    if(!filterData) {
        cleanFilterData(searchData);
    } else {
        cleanFilterData(filterData);
    }
 
}

var event = document.createEvent('Event');
event.initEvent('input', true, true);

// get the page url
let windowLocation = window.location;

// directions
function getDirectionsFromUrl() {
    if(windowLocation.search) {
        // toggle direction tab
        toggleDirectionTab();
    
        let query = windowLocation.search.slice(1).split('&');
    
        let result = {};
         // get the name
         query.forEach(qry => {
            let path = qry.split("=");
            result[path[0]] = decodeURIComponent(path[1] || "");
         });
    
         result.coordinates = result.coordinates.split(',').map(el => parseFloat(el));

        // add a
    
        getDirection(result.coordinates, result.address);

         // update the class times link
         classLink.setAttribute("href", result.link);
    }
}


// TODO: marker click bug, directions scroll