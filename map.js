   // Set your Mapbox access token here

   mapboxgl.accessToken = "pk.eyJ1IjoibXJwYXNzZXJieSIsImEiOiJjbTdkd2N4OGEwN3VtMnJwcXlmcWtrNTJ4In0.w3EX4taxDes5XP6nBloPhw";


   // Initialize the map
   const map = new mapboxgl.Map({
     container: 'map', // ID of the div where the map will render
     style: 'mapbox://styles/mapbox/streets-v12', // Map style
     center: [-71.09415, 42.36027], // [longitude, latitude]
     zoom: 13, // Initial zoom level
     minZoom: 5, // Minimum allowed zoom
     maxZoom: 18 // Maximum allowed zoom
   });



   map.on('load', () => {

    console.log('hihihi')

    map.addSource('boston_route', {
        type: 'geojson',
        data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...'
      });

      map.addSource('cambridge_route',{
        type : 'geojson',
        data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson'
      })
    
      map.addLayer({
        id: 'bike-lanes',
        type: 'line',
        source: 'boston_route',
        paint: {
          'line-color': 'red',
          'line-width': 5,
          'line-opacity': 0.4
        }
      });

      map.addLayer({
        id: 'bike-lanes1',
        type: 'line',
        source: 'cambridge_route',
        paint: {
          'line-color': 'green',
          'line-width': 5,
          'line-opacity': 0.4
        }
      });

      
     const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
     d3.json(jsonurl).then(jsonData => {
        console.log('Loaded JSON Data:', jsonData);  // Log to verify structure
      }).catch(error => {
        console.error('Error loading JSON:', error);  // Handle errors if JSON loading fails
      });
  });

