import Chart from 'chart.js/auto';
import { getDataFromAPI } from "../server/server";

(async function () {
    const apiData = await getDataFromAPI('/v2/ladd').then(data => {
        return data;
    });

    const chartData = apiData?.ac.slice(0, 10).map(data => {
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

    new Chart(
        document.getElementById('radarChart'),
        {
            type: 'radar',
            data: {
                labels: chartData.map(row => row.name), // Use flight names as labels
                datasets: [
                    {
                        label: 'Planes on Radar Chart',
                        data: chartData.map(row => ({
                            x: row.lat,
                            y: row.lon,
                            r: row.altitude // Use altitude as the radial axis value
                        })),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Background color for the radar area
                        borderColor: 'blue', // Border color
                        borderWidth: 3
                    }
                ]
            },
            options: {
                scales: {
                    r: {
                        min: 0, // Minimum value for the radial axis
                        
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = [];
                                label.push('Plane Info:');
                                label.push('Latitude: ' + chartData[context.dataIndex].lat);
                                label.push('Longitude: ' + chartData[context.dataIndex].lon);
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

})();