import Chart from 'chart.js/auto';
import {getDataFromAPI} from "../server/server";

let myMap = {};
let myChart;
let selectedOption = '';

const selectElement = document.createElement("select");
selectElement.id = "mySelect";

document.getElementById("comboBox")?.appendChild(selectElement)

selectElement.addEventListener("change", function () {
    selectedOption = this.value;
    showChart();
});

makeApiRequest();
setInterval(makeApiRequest, 1000);

async function makeApiRequest() {
    const apiData = getDataFromAPI('/v2/ladd').then(data => {
        return data;
    });

    apiData.then(response => response)
        .then(data => {
            data.ac.forEach(flight => {
                if (flight.flight) {
                    var currentDate = new Date();
                    var hour = currentDate.getHours(); // Get the hour (0-23)
                    var minute = currentDate.getMinutes(); // Get the minute (0-59)
                    var second = currentDate.getSeconds();
                    addFlightInformation(String(flight.flight).trim(), {
                        lat: flight.lat,
                        lon: flight.lon,
                        alt_geom: flight.alt_geom,
                        category: flight.category,
                        gs: flight.gs,
                        r: flight.r,
                        time: `${hour}:${minute}:${second}`
                    })
                }
            });
        })
}

function addFlightInformation(key, info) {
    if (myMap.hasOwnProperty(key)) {
        myMap[key].push(info)
        if (myMap[key].length >= 20)
            myMap[key].shift();
    } else {
        const flightCount = Object.keys(myMap).length
        if (flightCount <= 20) {
            myMap[key] = [info];
            setComboBox();
        }

    }
}

function setComboBox() {
    let selectElement = document.getElementById("mySelect")
    if (selectElement) {

        Object.keys(myMap).forEach(flight => {

            let optionExists = false;

            for (let i = 0; i < selectElement.options.length; i++) {
                if (selectElement.options[i].text === String(flight).trim()) {
                    optionExists = true;
                    break;
                }
            }
            if (!optionExists) {
                const option = document.createElement("option");
                option.text = flight;
                selectElement.add(option);
                if (selectElement.options.length === 1) {
                    selectedOption = selectElement.options[0].value
                    showChart();
                }
            }
        })
    }
}


function showChart() {
    let selectedFlight = myMap[selectedOption];

    const chartData = selectedFlight.map((data, index) => {
        return {
            x: index, // Using numerical index for x-axis
            lat: parseFloat(data.lat),
            lon: parseFloat(data.lon),
            name: selectedFlight || "Unknown",
            y: parseFloat(data.alt_geom || 0), // Assuming altitude for y-axis
            category: data.category || "Unknown",
            groundspeed: parseFloat(data.gs || 0),
            r: data.r || "Unknown",
            t: data.t || "Unknown",
            time: data.time
        };
    });

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(
        document.getElementById('lineChart'),
        {
            type: 'line',
            data: {
                labels: chartData.map(point => point.time),
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
                            text: 'Time'
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
}

