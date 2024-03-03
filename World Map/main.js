import streamsByCountry from "./data/streamsByCountry.json";

// Get array of all stream values
const streamsArray = Object.values(streamsByCountry);

// Find maximum value
const maxStreams = Math.max(...streamsArray);

// Define number formatter
const formatter = new Intl.NumberFormat("en-ZA");

let width = window.innerWidth;
let height = window.innerHeight;

document.addEventListener("resize", () => {
	width = window.innerWidth;
	height = window.innerHeight;
});

// Load the world map data
d3.json("./data/map.json").then(function (mapData) {
	// Create color scale
	const colorScale = d3
		.scaleSequential()
		.domain([0, maxStreams])
		.interpolator(d3.interpolateGreens);

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
		})
		.style("stroke", "#00441b")
		.style("stroke-width", 1);

	// Add event listeners
	svg.selectAll("path").on("mouseover", onMouseOver).on("mouseout", onMouseOut);

	// Create SVG legend container
	const legend = svg
		.append("g")
		.attr("id", "legend")
		.attr("transform", "translate(20, 20)");

	// Create legend title
	legend.append("text").text("Total Streams").style("font-weight", "bold");

	// Create gradient for legend
	const legendGradient = legend
		.append("defs")
		.append("linearGradient")
		.attr("id", "legend-gradient")
		.attr("x1", "0%")
		.attr("y1", "0%")
		.attr("x2", "100%")
		.attr("y2", "0%");

	// Set gradient stops based on color scale
	colorScale.ticks().forEach((value) => {
		legendGradient
			.append("stop")
			.attr("offset", (value / maxStreams) * 100 + "%")
			.attr("stop-color", colorScale(value));
	});

	// Draw the gradient legend rectangle
	legend
		.append("rect")
		.attr("width", 120)
		.attr("height", 20)
		.style("fill", "url(#legend-gradient)");

	// Add min and max labels
	legend
		.append("text")
		.text(formatter.format(maxStreams))
		.attr("x", 110)
		.attr("y", 15);

	legend.append("text").text(formatter.format(0)).attr("x", 0).attr("y", 15);
});

// Append tooltip div
const tooltip = d3
	.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// Mouseover event handler
function onMouseOver(d, i) {
	// Get data for this country
	const country = d.target.__data__.properties.name;
	const streams = streamsByCountry[country];

	// Update tooltip
	tooltip
		.html(
			`
    <div>${country}</div>
    <div>Streams: ${streams ? formatter.format(streams) : 0}</div>
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
