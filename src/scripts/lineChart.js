import Chart from 'chart.js/auto';
import { getDataFromAPI } from "../server/server";

(async function () {
    const apiData = await getDataFromAPI('/v2/ladd').then(data => {
        return data;
    });

    const chartData = apiData?.ac.slice(0, 10).map((data, index) => {
        return { 
            x: index, // Using numerical index for x-axis
            lat: parseFloat(data.lat), 
            lon: parseFloat(data.lon),
            name: data.flight || "Unknown",
            y: parseFloat(data.alt_geom || 0), // Assuming altitude for y-axis
            category: data.category || "Unknown",
            groundspeed: parseFloat(data.gs || 0),
            r: data.r || "Unknown",
            t: data.t || "Unknown",
        };
    });

    new Chart(
        document.getElementById('lineChart'),
        {
            type: 'line',
            data: {
                labels: chartData.map(point => point.x),
                datasets: [
                    {
                        label: 'Altitude',
                        data: chartData,
                        borderColor: 'blue',
                        backgroundColor: 'transparent',
                        pointBackgroundColor: 'blue',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Index'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Altitude'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = [];
                                label.push('Plane Info:');
                                label.push('Index: ' + context.parsed.x);
                                label.push('Altitude: ' + context.parsed.y);
                                label.push('Latitude: ' + chartData[context.dataIndex].lat);
                                label.push('Longitude: ' + chartData[context.dataIndex].lon);
                                label.push('Flight Name: ' + chartData[context.dataIndex].name);
                                label.push('Category: ' + chartData[context.dataIndex].category);
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