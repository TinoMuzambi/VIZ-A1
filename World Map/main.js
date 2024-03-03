import streamsByCountry from "./data/streamsByCountry.json";

// Get array of all stream values
const streamsArray = Object.values(streamsByCountry);

// Find maximum value
const maxStreams = Math.max(...streamsArray);

console.log({ maxStreams });

// Create color scale
const colorScale = d3
	.scaleSequential()
	.domain([0, maxStreams])
	.interpolator(d3.interpolateBlues);

// Load the world map data
d3.json("./data/map.json").then(function (mapData) {
	const width = 1629;
	const height = 1100;

	// Create the map projection
	const projection = d3.geoMercator().fitSize([width, height], mapData);

	// Create the path generator
	const pathGenerator = d3.geoPath().projection(projection);

	// Draw the map
	const svg = d3
		.select("#map-container")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	svg
		.selectAll("path")
		.data(mapData.features)
		.enter()
		.append("path")
		.attr("d", pathGenerator)
		.attr("fill", function (d) {
			const countryName = d.properties.name;
			const totalStreams = streamsByCountry[countryName] || 0;
			return colorScale(totalStreams);
		});

	// Add event listeners
	svg.selectAll("path").on("mouseover", onMouseOver).on("mouseout", onMouseOut);
});

// Append tooltip div
const tooltip = d3
	.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// Mouseover event handler
function onMouseOver(d, i) {
	console.log({ d });
	// Get data for this country
	const country = d.target.__data__.properties.name;
	const streams = streamsByCountry[country];

	// Update tooltip
	tooltip
		.html(
			`
    <div>${country}</div>
    <div>Streams: ${streams}</div>
  `
		)
		.style("left", d.pageX + 10 + "px")
		.style("top", d.pageY - 10 + "px")
		.style("opacity", 1);

	// Highlight country path
	d3.select(this).style("opacity", 0.5);
}

// Mouseout event handler
function onMouseOut() {
	// Hide tooltip
	tooltip.style("opacity", 0);

	// Reset country highlight
	d3.select(this).style("opacity", 1);
}
