
import {getDataFromAPI} from "../server/server.js";

(async function() {
    const apiData= await getDataFromAPI('/v2/ladd') .then(data => {
        console.log('Data from API:', data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    })

})();