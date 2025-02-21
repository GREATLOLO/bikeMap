   // Set your Mapbox access token here

   mapboxgl.accessToken = "pk.eyJ1IjoibXJwYXNzZXJieSIsImEiOiJjbTdkd2N4OGEwN3VtMnJwcXlmcWtrNTJ4In0.w3EX4taxDes5XP6nBloPhw";



   //select time slider element
   let timeFilter = -1;
   const timeSlider = document.getElementById('time-slider');
  const selectedTime = document.getElementById('selected-time');
  const anyTimeLabel = document.getElementById('any-time');


  let filteredTrips = [];
let filteredArrivals = new Map();
let filteredDepartures = new Map();
let filteredStations = [];

  function formatTime(minutes) {
    const date = new Date(0, 0, 0, 0, minutes);  // Set hours & minutes
    return date.toLocaleString('en-US', { timeStyle: 'short' }); // Format as HH:MM AM/PM
  }

  function updateTimeDisplay() {
    timeFilter = Number(timeSlider.value);  // Get slider value
  
    if (timeFilter === -1) {
      selectedTime.textContent = '';  // Clear time display
      anyTimeLabel.style.display = 'block';  // Show "(any time)"
    } else {
      selectedTime.textContent = formatTime(timeFilter);  // Display formatted time
      anyTimeLabel.style.display = 'none';  // Hide "(any time)"
    }
  
    // Trigger filtering logic which will be implemented in the next step
  }



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



      //add circle

      



     const svg = d3.select('#map').select('svg');
     let stations = [];

      
     const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

     d3.json(jsonurl).then(jsonData => {
      console.log('Loaded JSON Data:', jsonData);  // Log to verify structure
      stations = jsonData.data.stations;
      console.log('Stations Array:', stations);
      

      d3.csv('https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv').then(trips =>{


    for (let trip of trips) {

      trip.started_at = new Date(trip.started_at);
      trip.ended_at = new Date(trip.ended_at);
    }


        let departures = d3.rollup(
          trips,
          (v) => v.length,
          (d) => d.start_station_id,
        );

        let arrivals = d3.rollup(
          trips,
          (v) => v.length,
          (d) => d.end_station_id,
        );

        stations = stations.map((station) => {
          let id = station.short_name;
          station.arrivals = arrivals.get(id) ?? 0;
          station.departures = departures.get(id) ?? 0;
          station.totalTraffic = station.arrivals + station.departures;
          // TODO departures
          // TODO totalTraffic
          return station;
        });





        let radiusScale = d3
  .scaleSqrt()
  .domain([0, d3.max(stations, (d) => d.totalTraffic)])
  .range((timeFilter == -1) ? [0, 25] : [3,50]);


  circles = svg.selectAll('circle')
  .data((timeFilter == -1) ? stations : filteredStations)
  .enter()
  .append('circle')
  .attr('r', d => radiusScale(d.totalTraffic))               // Radius of the circle
  .attr('fill', 'steelblue')  // Circle fill color
  .attr('stroke', 'white')    // Circle border color
  .attr('stroke-width', 1)    // Circle border thickness
  .attr('opacity', 0.8)      // Circle opacity
  .each(function(d) {
    // Add <title> for browser tooltips
    d3.select(this)
      .append('title')
      .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
  });

        // Initial position update when map loads
  updatePositions();

    //update the time
    function minutesSinceMidnight(date) {
      return date.getHours() * 60 + date.getMinutes();
    }

    function filterTripsbyTime() {
      filteredTrips = timeFilter === -1
          ? trips
          : trips.filter((trip) => {
              const startedMinutes = minutesSinceMidnight(trip.started_at);
              const endedMinutes = minutesSinceMidnight(trip.ended_at);
              return (
                Math.abs(startedMinutes - timeFilter) <= 60 ||
                Math.abs(endedMinutes - timeFilter) <= 60
              );
            });
    
          // we need to update the station data here explained in the next couple paragraphs
          let filteredDepartures = d3.rollup(
            filteredTrips,
            (v) => v.length,
            (d) => d.start_station_id,
          );
  
          let filteredArrivals = d3.rollup(
            filteredTrips,
            (v) => v.length,
            (d) => d.end_station_id,
          );

          filteredStations = stations.map((station) => {
            station = { ...station };
            let id = station.short_name;
            station.arrivals = filteredArrivals.get(id) ?? 0;
            station.departures = filteredDepartures.get(id) ?? 0;
            station.totalTraffic = station.arrivals + station.departures;
            // TODO departures
            // TODO totalTraffic
            return station;
          });
          radiusScale = d3
          .scaleSqrt()
          .domain([0, d3.max(filteredStations, (d) => d.totalTraffic)])
          .range((timeFilter == -1) ? [0, 25] : [3,50]);
        
          svg.selectAll('circle')
          .data(filteredStations)
          .attr('r', d => radiusScale(d.totalTraffic))
          .each(function(d) {
              // Add <title> for browser tooltips
              d3.select(this).select('title')
                .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
            }); // Third function
          // circles = svg.selectAll('circle')
          // .data(filteredStations)
          // .enter()
          // .append('circle')
          // .attr('r', d => radiusScale(d.totalTraffic))               // Radius of the circle
          // .attr('fill', 'steelblue')  // Circle fill color
          // .attr('stroke', 'white')    // Circle border color
          // .attr('stroke-width', 1)    // Circle border thickness
          // .attr('opacity', 0.8)      // Circle opacity
          // .each(function(d) {
          //   // Add <title> for browser tooltips
          //   d3.select(this)
          //     .append('title')
          //     .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
          // }); // Third function
          updatePositions()
    }

    timeSlider.addEventListener('input', () => {
      updateTimeDisplay();   // First function
      filterTripsbyTime();        // Second function
  });


  })







     }).catch(error => {
       console.error('Error loading JSON:', error);  // Handle errors if JSON loading fails
     });




  
    
  });
  let circles;
  function updatePositions() {
    circles
      .attr('cx', d => getCoords(d).cx)  // Set the x-position using projected coordinates
      .attr('cy', d => getCoords(d).cy); // Set the y-position using projected coordinates
  }

  function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.lon, +station.lat);  // Convert lon/lat to Mapbox LngLat
    const { x, y } = map.project(point);  // Project to pixel coordinates
    return { cx: x, cy: y };  // Return as object for use in SVG attributes
  }
    // Reposition markers on map interactions
    map.on('move', updatePositions);     // Update during map movement
    map.on('zoom', updatePositions);     // Update during zooming
    map.on('resize', updatePositions);   // Update on window resize
    map.on('moveend', updatePositions);  // Final adjustment after movement ends




