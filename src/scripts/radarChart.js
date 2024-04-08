
import {getDataFromAPI} from "../server/server";
import * as d3 from 'd3';


document.getElementById("fetchDataButton").addEventListener("click", function() {
    const lat = document.getElementById("latitudeInput").value;
    const lon = document.getElementById("longitudeInput").value;
    const radius = document.getElementById("radiusInput").value;

    // Validate inputs
    if (!lat || !lon || !radius) {
        alert("Please enter valid latitude, longitude, and radius values.");
        return;
    }


    const existingSvg = d3.select("#radarChart svg");
    if (!existingSvg.empty()) {
        existingSvg.remove(); // Remove existing chart before drawing a new one
    }

    // Call the function to fetch and visualize data
    fetchDataAndVisualize(lat, lon, radius);
});

async function fetchDataAndVisualize(ref_lat, ref_lon, ref_radius) {
    const apiData = await getDataFromAPI(`/v2/point/${ref_lat}/${ref_lon}/${ref_radius}`).then(data => data);

	const chartData = apiData?.ac.slice(0, 500).map(data => ({
        distance: calculateDistanceToReferencePoint(data.lat, data.lon),
        bearing: calculateBearingToReferencePoint(data.lat, data.lon),
        flight: data.flight || "Unknown",
        altitude: data.alt_geom || 0,
        lat: data.lat || 0,
        lon: data.lon || 0,
        model: data.t || "Unknown"
    }));


	function calculateDistanceToReferencePoint(lat, lon) {
	    const refLat = ref_lat; // Reference latitude
	    const refLon = ref_lon; // Reference longitude

	    const earthRadiusNm = 3440.065; // Earth's radius in nautical miles
	    const rad = Math.PI / 180; // Conversion factor from degrees to radians

	    const dLat = (lat - refLat) * rad;
	    const dLon = (lon - refLon) * rad;
	    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	              Math.cos(refLat * rad) * Math.cos(lat * rad) *
	              Math.sin(dLon / 2) * Math.sin(dLon / 2);
	    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	    return earthRadiusNm * c;
	}

	function calculateBearingToReferencePoint(lat, lon) {
	    const refLat = ref_lat; // Reference latitude in degrees.
	    const refLon = ref_lon; // Reference longitude in degrees.

	    // Convert degrees to radians
	    const rad = Math.PI / 180;
	    const phi1 = refLat * rad;
	    const phi2 = lat * rad;
	    const lambda1 = refLon * rad;
	    const lambda2 = lon * rad;

	    // Calculate the difference in longitude
	    const deltaLambda = lambda2 - lambda1;

	    // Calculate the bearing
	    const x = Math.cos(phi2) * Math.sin(deltaLambda);
	    const y = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
	    const theta = Math.atan2(x, y);

	    // Convert bearing from radians to degrees
	    let bearing = (theta * (180 / Math.PI) + 360) % 360; // Normalize to 0-360 degrees

	    return bearing;
	}

    function drawBearingLines(svg, radius) {
    const bearings = [0, 45, 90, 135, 180, 225, 270, 315]; // Example bearings
    bearings.forEach(bearing => {
        const {x, y} = polarToCartesian(bearing, radius);
        svg.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', x)
            .attr('y2', y)
            .style('stroke', 'black')
            .style('stroke-width', '1');

        svg.append('text')
            .attr('x', x * 1.1) // Position the text slightly beyond the end of the line
            .attr('y', y * 1.1)
            .text(bearing + '°')
            .style('font-size', '12px')
            .attr('text-anchor', 'middle');
    });
}

	function drawRings(svg, radius, numRings) {
    const maxDistance = d3.max(chartData, d => d.distance);
    const distanceStep = maxDistance / numRings;

    for (let i = 1; i <= numRings; i++) {
        const r = radius * (i / numRings);
        svg.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', r)
            .style('fill', 'none')
            .style('stroke', 'lightgray')
            .style('stroke-width', '0.5');

        // Add distance value text
        const distance = distanceStep * i;
        const {x, y} = polarToCartesian(0, r); // Using 0 degrees (right of center) for text placement
        svg.append('text')
            .attr('x', x + 5) // A bit offset to the right
            .attr('y', y)
            .text(`${distance.toFixed(1)} nm`)
            .style('font-size', '12px')
            .attr('alignment-baseline', 'middle');
    }
}


    // Set up SVG dimensions
    const width = 600, height = 600;
    const radius = Math.min(width, height) / 2 - 40; // Adjust for margin

	 // Create SVG container inside the #radarChart div
	const svg = d3.select('#radarChart').append('svg')
	    .attr('width', width)
	    .attr('height', height)
	    .append('g')
	    .attr('transform', `translate(${width / 2},${height / 2})`);


    // Create radius scale
    const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, d3.max(chartData, d => d.distance)]);

    // Convert from polar to Cartesian coordinates
    const polarToCartesian = (bearing, distance) => {
        const angleInRadians = (bearing - 90) * (Math.PI / 180);
        return {
            x: distance * Math.cos(angleInRadians),
            y: distance * Math.sin(angleInRadians)
        };
    };

	const tooltip = d3.select('body').append('div')
    .attr('class', 'radar-tooltip')
    // Adjusted styles for better visibility
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'rgba(255, 255, 255, 0.9)')
    .style('border', '1px solid #ddd')
    .style('border-radius', '5px')
    .style('padding', '10px')
    .style('pointer-events', 'none')
    .style('font-size', '0.9em')
    .style('box-shadow', '0 0 5px rgba(0,0,0,0.5)');

    drawRings(svg, radius, 5); // Draw rings
	drawBearingLines(svg, radius);

    // Draw the points on the radar
    svg.selectAll('circle.point')
    .data(chartData)
    .enter()
    .append('circle')
    .attr('class', 'point')
    .attr('cx', d => polarToCartesian(d.bearing, rScale(d.distance)).x)
    .attr('cy', d => polarToCartesian(d.bearing, rScale(d.distance)).y)
    .attr('r', d => 3)
    .style('fill', d => 'red')
    .on('mouseover', function(event, d) {
        tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        tooltip.html(`
        <strong>Flight:</strong> ${d.flight}<br>
        <strong>Distance:</strong> ${d.distance.toFixed(2)} nm<br>
        <strong>Bearing:</strong> ${d.bearing.toFixed(2)}°<br>
        <strong>Altitude:</strong> ${d.altitude.toFixed(2)} feet<br>
        <strong>Latitude:</strong> ${d.lat.toFixed(2)}<br>
        <strong>Longtitude:</strong> ${d.lon.toFixed(2)}<br>
        <strong>Model:</strong> ${d.model}<br>
    `)
            .style('left', (event.pageX + 10) + 'px') // Adjusted for better positioning
            .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
        tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    });

}
