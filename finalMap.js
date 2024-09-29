// Initialize the map, centered on India
const map = L.map('map').setView([19.8762, 75.3433], 7);

// Add a blank tile layer with state borders
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

function addMarkers(data) {
    data.forEach(location => {
        if (location.Latitude && location.Longitude) {
            const marker = L.marker([location.Latitude, location.Longitude], markerOptions).addTo(map);
            function generatePopupContent(location) {
                let content = `<h3>${location.Location}</h3>`;

                // Use the base64 string directly
                if (location['Image Link']) {
                    content += `<img src="${location['Image Link']}" alt="${location.Location}" />`;
                }

                content += location['Shed Area'] ? `<p><strong>Shed Area:</strong> ${location['Shed Area']}</p>` : '';
                content += location['Total Area'] ? `<p><strong>Total Area:</strong> ${location['Total Area']}</p>` : '';
                content += location['Briquette Production'] ? `<p><strong>Briquette Production:</strong> ${location['Briquette Production']}</p>` : '';
                content += location['Pellet Production'] ? `<p><strong>Pellet Production:</strong> ${location['Pellet Production']}</p>` : '';
                content += location['Number of Briquette Machines'] ? `<p><strong>Number of Briquette Machines:</strong> ${location['Number of Briquette Machines']}</p>` : '';
                content += location['Number of Pellet Machines'] ? `<p><strong>Number of Pellet Machines:</strong> ${location['Number of Pellet Machines']}</p>` : '';

                return `<div class="popup-content">${content}</div>`;
            }

            const popupContent = generatePopupContent(location);
            marker.bindPopup(popupContent);

            marker.on('mouseover', function () {
                if (window.innerWidth < 768) {
                    this.openPopup();
                } else {
                    document.getElementById('sidebarContent').innerHTML = popupContent;
                    document.getElementById('sidebarContent').classList.add('active');
                }
            });

            marker.on('mouseout', function () {
                this.closePopup();
            });

            marker.on('click', function () {
                if (window.innerWidth < 768) {
                    this.openPopup();
                } else {
                    document.getElementById('sidebarContent').innerHTML = popupContent;
                    document.getElementById('sidebarContent').classList.add('active');
                }
            });
        }
    });
}


function updateTotalUnits(total) {
  const totalUnitsElement = document.getElementById('totalUnits');
  if (totalUnitsElement) {
    totalUnitsElement.innerHTML = `<strong>Total Units: ${total}</strong>`;
  }
}

function fetchManufacturingUnits(){
    // Fetch data from your API
    fetch('https://script.google.com/macros/s/AKfycbweKy2ByVIUOF8x9KYw9ioBZMuyvsCPXraW9VLEEub03b-7LpO1se3cI3DcHYjXJseKTg/exec?path=getManufacturingUnits')
        .then(response => response.json())
        .then(data => {
            console.log("Received data: " + JSON.stringify(data, null, 2));
            addMarkers(data);
            updateTotalUnits(data.length);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Add custom control to show total units
L.Control.TotalUnits = L.Control.extend({
  onAdd: function(map) {
    const div = L.DomUtil.create('div', 'total-units-control');
    div.id = 'totalUnits';
    div.style.backgroundColor = '#ffffff';
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
