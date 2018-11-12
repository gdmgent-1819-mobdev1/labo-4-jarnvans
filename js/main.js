// variables
let teller = 0;
let coordinatesCurrentPerson = {};
let profile = '';
let dislikesEl = document.querySelector('.dislikes');
let likesEl = document.querySelector('.likes');
let profilesEl = document.querySelector('.profiles');
let listEl = document.querySelector('.container');


//grabbing data and putting profiles in local storage
function grabData() {
    fetch('https://randomuser.me/api/?results=10')
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            if (localStorage.getItem('profile0') != null && localStorage.getItem('profile9') != null){
                localStorage.setItem('profile0', localStorage.getItem('profile9'));
            }
            for(let i = 0; i < data.results.length; i++){
                let profile = new Profile(data.results[i].login.uuid, data.results[i].name.first, data.results[i].dob.age,data.results[i].location.street, data.results[i].location.city, data.results[i].picture.large);
                
                if(localStorage.getItem('profile0') != null) {
                    if (i == 0) {
                        i = 1;
                    }
                    localStorage.setItem('profile' + i, JSON.stringify(profile));
                }
                else {
                    localStorage.setItem('profile' + i, JSON.stringify(profile));
                }
                getCoordinatesFromAddress(profile.address, i);
            }
        })
        .then(function(){
            runProfiles();
        })
        .catch(function(error){
            console.log(error);
        })
}

//going through profiles to like or dislike the profile
function runProfiles() {
    let likes = JSON.parse(localStorage.getItem('likes'));
    let dislikes = JSON.parse(localStorage.getItem('dislikes'));
    profile = JSON.parse(localStorage.getItem('profile' + teller));
    let exists = false;
    let distance = 0;
    let currentLocation = '';

    currentLocation = JSON.parse(sessionStorage.getItem('currentLocation'));
    if(currentLocation == null){
        currentLocation = {longitude: 0, latitude: 0};
    }

    if (likes != null || dislikes != null){
        exists = checkExists(likes, dislikes);
    }

    if (teller <= 8) {
        if(exists == false){
            distance = calculateDistance(currentLocation, profile.coordinates);     
            profile.distance = Math.round(distance);
            localStorage.setItem('profile' + teller, JSON.stringify(profile));
            console.log(distance);    
            showProfile();
            showMap(profile.coordinates);
        }
        else {
            teller++;
            runProfiles();
        }
    }
    else {
        teller = 0;
        grabData();
    }
}

//adding profile to the dislike or like list
function addToList(profile, type) {
    let listLikeDislike = JSON.parse(localStorage.getItem(type));
    console.log(listLikeDislike);
    if (listLikeDislike != null) {
        listLikeDislike.push(profile);
        localStorage.setItem(type, JSON.stringify(listLikeDislike));
    }
    else {
        listLikeDislike = [];
        listLikeDislike.push(profile);
        localStorage.setItem(type, JSON.stringify(listLikeDislike));
    }
}

//check if a profile is already liked or not
function checkExists(likes, dislikes) {
    let exists = false;
    
    if (likes != null){
        for(let i = 0; i < likes.length; i++){
            if(profile.id == likes[i].id){
                exists = true;
                console.log('je hebt dit profiel al geliked');
            }
        }
    }
    if (dislikes != null){
        for(let i = 0; i < dislikes.length; i++){
            if(profile.id == dislikes[i].id){
                exists = true;
                console.log('je hebt dit profiel al gedisliked');
            }
        }
    }
    return exists;
}

//put elements on screen
function showProfile() {
    let profileEl = document.querySelector('.tinder-profile');
    tempStr = `
        <div class="profile__picture-location">
            <div class="profile__picture">
                <img src="${profile.picture}" draggable="false">
            </div>
            <div class="profile__location">
                <div id="map"></div>
            </div>
        </div>
        <div class="profile__info">
            <h1 class="name">${profile.name}</h1>
            <h2 class="age"> - ${profile.age}</h2>
        </div>
        <div class="profile__city">
            <button class="center"><i class="fas fa-map-marker-alt"></i></button>
            <p class="city">${profile.city} - ${profile.distance} km</p>
        </div>
    `;
    profileEl.innerHTML = tempStr;
}

//show map and draw a circle
function showMap(location) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamFybnZhbnMiLCJhIjoiY2puY2NjOGFoMDV3czNrbnZjNzJicTFvbiJ9.YmULBJZC1OMMVucfXxLliA';
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v10',
        center: [location.longitude, location.latitude], // starting position [lng, lat]
        zoom: 13, // starting zoom
        interactive: true
    });
    
    map.on('load', function(){
        map.addLayer({
            'id': 'locationPerson',
            'type' : 'circle',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [location.longitude, location.latitude],
                    }
                }
            },
            'paint': {
                
                'circle-radius': {
                    'base': 50,
                    'stops': [[5, 30], [10, 110], [22, 33]]
                },
                'circle-color': '#db5d22',
                'circle-opacity': 0.5
            }
        })
    });
    document.querySelector('.center').addEventListener('click', function (e) {
        map.flyTo({
            center: [location.longitude, location.latitude],
            zoom: 13
        });
    });
}

//convert address to coordinates
function getCoordinatesFromAddress(search, profileNumber) {
    let address = encodeURI(search);
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?limit=1&access_token=pk.eyJ1IjoiamFybnZhbnMiLCJhIjoiY2puY2NjOGFoMDV3czNrbnZjNzJicTFvbiJ9.YmULBJZC1OMMVucfXxLliA`
    fetch(url)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        let coordinates = data.features[0].center;
        let profile = JSON.parse(localStorage.getItem('profile' + profileNumber));
        profile.coordinates.longitude = coordinates[0];
        profile.coordinates.latitude = coordinates[1];
        localStorage.setItem('profile' + profileNumber, JSON.stringify(profile));   
    })
    .catch(function(error){
        console.log(error);
    });
}

//calculate distance between 2 points
function calculateDistance(currentLocation, locationPerson) {
    let startPoint = turf.point([currentLocation.longitude, currentLocation.latitude]);
    let endPoint = turf.point([locationPerson.longitude, locationPerson.latitude]);
    let distance = turf.distance(startPoint, endPoint);

    return distance;
}

//getting location when user gives his location
function getLocation(position) {
    let current = {longitude: '', latitude: ''};
    current.longitude = position.coords.longitude;
    current.latitude = position.coords.latitude;
    sessionStorage.setItem('currentLocation', JSON.stringify(current));
    sessionStorage.setItem('currentLocation', JSON.stringify(current));
}

//error when person doesn't give his location
function getErrorPosition(error) {
    if (error.code == 1){
        console.log('User did not give his location');
    }
}

//making a list of the person you liked or disliked
function listLikesDislikes(type){
    let tempStr = '';
    let icon = '';
    let classButton = '';
    let listProfiles = JSON.parse(localStorage.getItem(type));
    classButton = type == 'dislikes' ? 'list-like' : 'list-dislike';
    icon = type == 'dislikes' ? '<i class="fas fa-heart"></i>' : '<i class="fas fa-times"></i>';
    if (listProfiles != null) {
        if (listProfiles.length > 0) {
            for(let i = 0; i < listProfiles.length; i++){
                tempStr += `
                    <div class="profile-list">
                        <div class="profile-list__picture">
                            <img src="${listProfiles[i].picture}">
                        </div>
                        <div class="profile-list__name">
                            <h1>${listProfiles[i].name}</h1>
                        </div>
                        <div class="button">
                            <button id="button-${i}" class="button-list ${classButton}">${icon}</button>
                        </div>
                    </div>
                `  
            }

            listEl.innerHTML = tempStr;

            for(let i = 0; i < listProfiles.length; i++){
                document.getElementById('button-' + i).addEventListener('click', function(){
                    changeChoice(type, i);
                    listLikesDislikes(type);
                });
            }
        }
        else {
            tempStr = `
                <div class="message">
                    <p>Nog geen profielen om weer te geven.</p>
                </div>
            `
            listEl.innerHTML = tempStr;
        }
    }
    else {
        tempStr = `
            <div class="message">
                <p>
                    Nog geen profielen om weer te geven.
                </p>
            </div>
        `
        listEl.innerHTML = tempStr;
    }
}

//changes a like to a dislike or a dislike to a like
function changeChoice(type, profileNumber) {
    let listDislikes = JSON.parse(localStorage.getItem('dislikes'));
    let listLikes = JSON.parse(localStorage.getItem('likes'));
    if (listLikes == null) listLikes = [];
    if (listDislikes == null) listDislikes = [];


    if (type == "likes"){
        let profile = listLikes[profileNumber];
        listDislikes.push(profile);
        localStorage.setItem('dislikes', JSON.stringify(listDislikes));
        listLikes.splice(profileNumber, 1);
        localStorage.setItem('likes', JSON.stringify(listLikes))
    }
    else {
        let profile = listDislikes[profileNumber];
        listLikes.push(profile);
        localStorage.setItem('likes', JSON.stringify(listLikes));
        listDislikes.splice(profileNumber, 1);
        localStorage.setItem('dislikes', JSON.stringify(listDislikes))
    }
}

//event listeners
profilesEl.addEventListener('click', function(e){
    profilesEl.classList.add('active')
    dislikesEl.classList.remove('active');
    likesEl.classList.remove('active')
    e.preventDefault();
    listEl.innerHTML = `
        <div class="tinder-profile"></div>
        <hr>
        <div class="choices">
            <button class="choices__dislike"><i class="fas fa-times"></i></button>
            <button class="choices__like"><i class="fas fa-heart"></i></button>
        </div>
    `;
    document.querySelector('.choices__like').addEventListener('click', function(){
        addToList(profile, 'likes');
        teller++;
        runProfiles();
    });
    
    document.querySelector('.choices__dislike').addEventListener('click', function(){
        addToList(profile, 'dislikes');
        teller++;
        runProfiles(); 
    });
    document.querySelector('.tinder-profile').draggable = true;
    document.querySelector('.tinder-profile').addEventListener('dragstart', dragStart, false);
    document.querySelector('.tinder-profile').addEventListener('dragend', dragEnd, false);
    hammer.on('swiperight', swipeRight)
    hammer.on('swipeleft', swipeLeft)
    runProfiles();
});

document.querySelector('.choices__like').addEventListener('click', function(){
    addToList(profile, 'likes');
    teller++;
    runProfiles();
});

document.querySelector('.choices__dislike').addEventListener('click', function(){
    addToList(profile, 'dislikes');
    teller++;
    runProfiles(); 
});

dislikesEl.addEventListener('click', function(e){
    e.preventDefault();
    profilesEl.classList.remove('active')
    dislikesEl.classList.add('active');
    likesEl.classList.remove('active');
    listLikesDislikes('dislikes');
});

likesEl.addEventListener('click', function(e){
    e.preventDefault();
    profilesEl.classList.remove('active')
    dislikesEl.classList.remove('active');
    likesEl.classList.add('active');
    listLikesDislikes('likes');
});

window.onload = function(){
    if (navigator.geolocation) {
        if(sessionStorage.getItem('currentLocation') == null) {
            navigator.geolocation.getCurrentPosition(getLocation, getErrorPosition);
        }
    }
    else {
        alert('geolocation is not supported in this browser');
    }
    grabData();
} 