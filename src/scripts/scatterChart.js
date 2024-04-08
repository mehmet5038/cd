import Chart from 'chart.js/auto';
import { getDataFromAPI } from "../server/server";

document.getElementById('applyFiltersButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Fetch values from form inputs
    const latMin = parseFloat(document.getElementById('latMin').value);
    const latMax = parseFloat(document.getElementById('latMax').value);
    const lonMin = parseFloat(document.getElementById('lonMin').value);
    const lonMax = parseFloat(document.getElementById('lonMax').value);

    fetchDataAndDisplayChart(latMin, latMax, lonMin, lonMax);
});

let scatterChartInstance = null;
async function fetchDataAndDisplayChart(latMin, latMax, lonMin, lonMax) {
  try {
    // Initial API calls
    const baseResponses = await Promise.all([
        getDataFromAPI('/v2/ladd'),
        getDataFromAPI('/v2/mil')
    ]);


    const squawkCodes = ['0000', '1200', '7000', '2000', '1000']; // Distress codes as an example
    const squawkResponses = await Promise.all(
        squawkCodes.map(squawk => getDataFromAPI(`/v2/squawk/${squawk}`))
    );

    // Merge the data from the responses
    const mergedData = [...baseResponses.flatMap(response => response.ac), ...squawkResponses.flatMap(response => response.ac)];

      // Filter data points by latitude and longitude
      const filteredData = mergedData.filter(data => {
          const lat = parseFloat(data.lat);
          const lon = parseFloat(data.lon);
          return lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax;
      });

      const chartData = filteredData.slice(0, 100).map(data => {
          return {
              lat: parseFloat(data.lat),
              lon: parseFloat(data.lon),
              name: data.flight || "Unknown",
              altitude: parseFloat(data.alt_geom || 0),
              category: data.category || "Unknown",
              groundspeed: parseFloat(data.gs || 0),
              r: data.r || "Unknown",
              t: data.t || "Unknown",
          };
      });

      if (scatterChartInstance) {
        scatterChartInstance.destroy(); // Destroy the existing chart instance if it exists
      }


      scatterChartInstance = new Chart(
        document.getElementById('scatterChart'), {
            type: 'scatter',
            data: {
                labels: chartData.map(row => row.lon),
                datasets: [{
                    label: 'Planes on Scatter Chart',
                    data: chartData.map(row => ({
                        x: row.lon, // Use 'lon' for the x-axis value
                        y: row.lat  // Use 'lat' for the y-axis value
                    })),
                    pointBackgroundColor: 'blue',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom', // Ensures x-axis is at the bottom
                        title: {
                          display: true,
                          text: 'Longitude'
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'left', // Ensures y-axis is on the left
                        title: {
                          display: true,
                          text: 'Latitude'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = [];
                                label.push('Plane Info:');
                                label.push('Latitude: ' + context.parsed.y); // Adjusted to reflect swapped axes
                                label.push('Longitude: ' + context.parsed.x); // Adjusted to reflect swapped axes
                                label.push('Flight Name: ' + chartData[context.dataIndex].name);
                                label.push('Category: ' + chartData[context.dataIndex].category);
                                label.push('Altitude: ' + chartData[context.dataIndex].altitude);
                                label.push('Groundspeed: ' + chartData[context.dataIndex].groundspeed);
                                label.push('Registration: ' + chartData[context.dataIndex].r);
                                label.push('Aircraft model: ' + chartData[context.dataIndex].t);
                                return label;
                            }
                        }
                    }
                }
            }
        }
    );
  } catch (error) {
      console.error("Error fetching or processing data:", error);
  }
}
