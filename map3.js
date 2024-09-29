
const CACHE_KEY = 'manufacturingUnitsData';
const CACHE_EXPIRY_KEY = 'manufacturingUnitsExpiry';
const CACHE_EXPIRY_TIME = 1 * 60 * 60 * 1000; // 1 hours in milliseconds

// Function to get cached data from localStorage
function getCachedData() {
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

  if (cachedData && cachedExpiry) {
    const now = new Date().getTime();

    // Check if the cache is still valid
    if (now < cachedExpiry) {
      return JSON.parse(cachedData);
    }
  }

  return null;
}

// Function to cache the API response
function cacheData(data) {
  const now = new Date().getTime();
  const expiryTime = now + CACHE_EXPIRY_TIME; // Set expiry to 24 hours later

  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
}

// Function to fetch the manufacturing units data
function fetchManufacturingUnits() {
  const cachedData = getCachedData();

  if (cachedData && false) {
    // Use cached data
    console.log("Using cached data");
    addMarkers(cachedData);
    updateTotalUnits(cachedData.length); // Update total units
  } else {
    // Fetch new data from the API
    console.log("Fetching new data from API");
    fetch('https://script.google.com/macros/s/AKfycbweKy2ByVIUOF8x9KYw9ioBZMuyvsCPXraW9VLEEub03b-7LpO1se3cI3DcHYjXJseKTg/exec?path=getManufacturingUnits')
      .then(response => response.json())
      .then(data => {
        console.log("Received data: " + JSON.stringify(data, null, 2));
        addMarkers(data);
        updateTotalUnits(data.length); // Update total units

        // Cache the data for future use
        cacheData(data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }
}

// Function to update the total units control
function updateTotalUnits(total) {
  const totalUnitsElement = document.getElementById('totalUnits');
  if (totalUnitsElement) {
    totalUnitsElement.innerHTML = `Total Units: ${total}`;
  }
}

// Initialize the map, centered on India
const map = L.map('map').setView([20.5937, 78.9629], 7);

// Add a tile layer with state borders
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19
}).addTo(map);

var iconOptions = {
  iconUrl: 'assets/imgs/map_marker.png',
  iconSize: [70, 70]
};
var customIcon = L.icon(iconOptions);
var markerOptions = {
  icon: customIcon
};

// Function to add markers and update sidebar
function addMarkers(data) {
  data.forEach(location => {
    if (location.Latitude && location.Longitude) {
      const marker = L.marker([location.Latitude, location.Longitude], markerOptions).addTo(map);

      function generateSidebarContent(location) {
        let content = `<h3>${location.Location}</h3>`;

        if (location['Image Link']) {
          content += `<img src="${location['Image Link']}" alt="${location.Location}" />`;
        }

        content += location['Shed Area'] ? `<p><strong>Shed Area:</strong> ${location['Shed Area']}</p>` : '';
        content += location['Total Area'] ? `<p><strong>Total Area:</strong> ${location['Total Area']}</p>` : '';
        content += location['Briquette Production'] ? `<p><strong>Briquette Production:</strong> ${location['Briquette Production']}</p>` : '';
        content += location['Pellet Production'] ? `<p><strong>Pellet Production:</strong> ${location['Pellet Production']}</p>` : '';
        content += location['Number of Briquette Machines'] ? `<p><strong>Number of Briquette Machines:</strong> ${location['Number of Briquette Machines']}</p>` : '';
        content += location['Number of Pellet Machines'] ? `<p><strong>Number of Pellet Machines:</strong> ${location['Number of Pellet Machines']}</p>` : '';

        return content;
      }

      marker.on('mouseover', function () {
          const popupContent = generateSidebarContent(location);
          if (window.innerWidth < 768) {
            this.openPopup(); // For mobile, open the popup
          } else {
            document.getElementById('sidebarContent').innerHTML = popupContent; // For desktop, show in sidebar
            document.getElementById('sidebarContent').classList.add('active');
          }
      });

        marker.on('mouseout', function () {
          this.closePopup(); // Close the popup on mouse out
        });

        marker.on('click', function () {
          const popupContent = generateSidebarContent(location);
          if (window.innerWidth < 768) {
            this.openPopup(); // For mobile, open the popup
          } else {
            document.getElementById('sidebarContent').innerHTML = popupContent; // For desktop, show in sidebar
            document.getElementById('sidebarContent').classList.add('active');
          }
       });
    }
  });
}

// Add custom control to show total units
L.Control.TotalUnits = L.Control.extend({
  onAdd: function(map) {
    const div = L.DomUtil.create('div', 'total-units-control');
    div.id = 'totalUnits';
    div.style.backgroundColor = '#f4f4f4';
    div.style.padding = '10px';
    div.style.fontSize = '16px'; // Responsive font size, can be adjusted
    div.innerHTML = 'Fetching Data...'; // Default text before update
    return div;
  }
});

L.control.totalUnits = function(opts) {
  return new L.Control.TotalUnits(opts);
}

// Add the control to the map at the bottom-left corner
L.control.totalUnits({ position: 'bottomleft' }).addTo(map);

// Call the function to fetch or retrieve cached data
fetchManufacturingUnits();
