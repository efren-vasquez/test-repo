let map = L.map('map').setView([51.505, -0.09], 13);
let route = L.polyline([], { color: 'red' }).addTo(map);
let marker = null;
let tracking = false;
let positions = [];
let startRun, finishRun;
let watchId = null;

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const HIGH_ACCURACY = true;
const MAX_CACHE_AGE_MILLISECOND = 30000;
const MAX_NEW_POSITION_MILLISECOND = 5000;

const options = {
    enableHighAccuracy: HIGH_ACCURACY,
    maximumAge: MAX_CACHE_AGE_MILLISECOND,
    timeout: MAX_NEW_POSITION_MILLISECOND,
};

function startTracking() {
    if (navigator.geolocation) {
        tracking = true;
        startRun = new Date();
        watchId = navigator.geolocation.watchPosition(success, error, options);
    } else {
        alert('Geolocation not supported');
    }
}

function stopTracking() {
    tracking = false;
    finishRun = new Date();

    const time = (finishRun - startRun) / 1000;
    const timeMinutes = Math.floor(time / 60);
    const timeSeconds = Math.floor(time % 60);
    console.log(timeMinutes + ' minutes and '  + timeSeconds + ' seconds');

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
}

function success(position) {
    if (!tracking) return;

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const latLong = [lat, lng];
    
    // Add the new position to the route and positions array
    positions.push(latLong);
    route.addLatLng(latLong);

    // Update marker position
    if (marker) {
        marker.setLatLng(latLong);
    } else {
        marker = L.marker(latLong).addTo(map);
    }

    map.setView(latLong, 15);
}

function calculateDistance(coord1, coord2) {
    const R = 6371e3; // metres
    const φ1 = coord1[0] * Math.PI/180; // φ, λ in radians
    const φ2 = coord2[0] * Math.PI/180;
    const Δφ = (coord2[0] - coord1[0]) * Math.PI/180;
    const Δλ = (coord2[1] - coord1[1]) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const distance = R * c; // in metres
    return distance;
}

function error(err) {
    if (err.code === 1) {
        alert("Need geolocation access!");
    } else {
        alert("Cannot get current location.");
    }
}
