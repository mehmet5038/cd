import Chart from 'chart.js/auto'
import { getDataFromAPI } from "../server/server";

(async function () {
    const apiData = await getDataFromAPI('/v2/ladd').then(data => {
        return data;
    })

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
    })

    new Chart(
        document.getElementById('scatterChart'),
        {
            type: 'scatter',
            data: {
                labels: chartData.map(row => row.lat),
                datasets: [
                    {
                        label: 'Planes on Scatter Chart',
                        data: chartData.map(row => ({ x: row.lat, y: row.lon })),
                        pointBackgroundColor: 'blue',
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var label = [];
                                label.push('Plane Info:');
                                label.push('Latitude: ' + context.parsed.x);
                                label.push('Longitude: ' + context.parsed.y);
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