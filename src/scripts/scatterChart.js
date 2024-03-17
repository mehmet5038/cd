import Chart from 'chart.js/auto'
import {getDataFromAPI} from "../server/server";

(async function() {
    const apiData= await getDataFromAPI('/v2/ladd') .then(data => {
        return data;
    })

    const chartData=apiData?.ac.slice(0,10).map(data=>{
        return { lat: data.lat.toString().substring(0,data.lat.toString().indexOf('.')), long: data.lon.toString().substring(0,data.lon.toString().indexOf('.')) };
    })

    new Chart(
        document.getElementById('scatterChart'),
        {
            type: 'scatter',
            data: {
                labels: chartData.map(row => row.lat),
                datasets: [
                    {
                        label: 'Plain locations on scatter chart',
                        data: chartData.map(row => row.long)
                    }
                ]
            }
        }
    );

})();