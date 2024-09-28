// Initialize the map, centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add a blank tile layer with state borders
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19
}).addTo(map);




function addMarkers(data) {
  data.forEach(location => {
    if (location.Latitude && location.Longitude) {
      const marker = L.marker([location.Latitude, location.Longitude]).addTo(map);

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
        this.openPopup();
      });
      marker.on('mouseout', function () {
        this.closePopup();
      });
    }
  });
}

// Fetch data from your API
fetch('https://script.google.com/macros/s/AKfycbweKy2ByVIUOF8x9KYw9ioBZMuyvsCPXraW9VLEEub03b-7LpO1se3cI3DcHYjXJseKTg/exec?path=getManufacturingUnits')
  .then(response => response.json())
  .then(data => {
    console.log("Received data: " + JSON.stringify(data, null, 2));
    addMarkers(data);
  })
  .catch(error => console.error('Error fetching data:', error));
