// Initialize Socket.io
const socket = io();

let currentLatitude, currentLongitude; // Store current location
let markerCount = 0; // Counter for markers

// Check if geolocation is available
if (navigator.geolocation) {
    // Watch position changes
    navigator.geolocation.watchPosition(
        (position) => {
            currentLatitude = position.coords.latitude;
            currentLongitude = position.coords.longitude;

            // Emit location data to the server
            socket.emit("send-location", { latitude: currentLatitude, longitude: currentLongitude }, (error) => {
                if (error) {
                    console.log(error);
                }
            });
        },
        (error) => {
            console.error("Error getting location:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// Initialize the Leaflet map
const map = L.map("map").setView([0, 0], 10);

// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const markers = {};

// Receive location updates from other clients
socket.on("reciever-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection
socket.on("user-dissconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

// Function to mark current location on the map
function markLocation() {
    if (currentLatitude && currentLongitude) {
        markerCount++; // Increment marker count
        const marker = L.marker([currentLatitude, currentLongitude]).addTo(map);
        marker.bindPopup(` ${markerCount}`).openPopup();
    } else {
        alert("Current location not available.");
    }
}

// Event listener for the mark location button
document.getElementById("mark-location").addEventListener("click", markLocation);
