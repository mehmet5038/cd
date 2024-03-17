import axios from 'axios';

const BASE_URL='https://api.adsb.lol'

export async function getDataFromAPI(endpoint) {
    try {
        const promise =  axios.get(`${BASE_URL}${endpoint}`);
        return promise.then((response) => response.data);
    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
}