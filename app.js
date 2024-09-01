let map;
let routeLine;
let isTracking = false;
let positions = [];
let startTime, endTime;

// Initialize the map
function initMap() {
    map = L.map('map').setView([29.643946, -82.355659], 15); // Initial view at [latitude, longitude]

    // Add OpenStreetMap tiles to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    // Initialize the polyline for tracking the route
    routeLine = L.polyline([], { color: 'blue' }).addTo(map);
}

// Function to start tracking
function startTracking() {
    if (navigator.geolocation) {
        isTracking = true;
        startTime = new Date(); // Record the start time
        navigator.geolocation.watchPosition(trackPosition, showError, { enableHighAccuracy: true });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Function to stop tracking
function stopTracking() {
    isTracking = false;
    endTime = new Date(); // Record the end time

    // Calculate the duration
    const duration = (endTime - startTime) / 1000; // Duration in seconds

    // Calculate the total distance
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
        const segmentDistance = calculateDistance(positions[i - 1], positions[i]);
        console.log(`Distance between position ${i-1} and ${i}: ${segmentDistance} meters`);
        totalDistance += segmentDistance;
    }
    // Display the results
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = Math.floor(duration % 60);
    document.getElementById('results').innerHTML = `
        <p>Duration: ${durationMinutes} minutes, ${durationSeconds} seconds</p>
        <p>Distance: ${totalDistance.toFixed(2)} meters</p>
    `;
}

// Function to track position
function trackPosition(position) {
    if (isTracking) {
        const latLng = [position.coords.latitude, position.coords.longitude];
        
        if (positions.length > 0) {
            const lastPosition = positions[positions.length - 1];
            const distanceFromLast = calculateDistance(lastPosition, latLng);
            
            if (distanceFromLast > 1) { // Only log if moved more than 1 meter
                console.log(`Moved: ${distanceFromLast.toFixed(2)} meters`);
                positions.push(latLng);
                routeLine.addLatLng(latLng);
                map.setView(latLng, 15); // Adjust the map view to the current position
            }
        } else {
            positions.push(latLng);
            routeLine.addLatLng(latLng);
            map.setView(latLng, 15); // Adjust the map view to the current position
        }
    }
}


// Function to calculate the distance between two coordinates
function calculateDistance(coords1, coords2) {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = coords1[0] * Math.PI / 180;
    const lat2 = coords2[0] * Math.PI / 180;
    const deltaLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const deltaLon = (coords2[1] - coords1[1]) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
}

// Function to handle errors
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

// Initialize the map when the page loads
window.onload = initMap;
