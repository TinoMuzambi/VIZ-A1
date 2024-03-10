import byCountry from "./data/byCountry.json";
// Changes:
// United States -> United States of America
// Czech Republic -> Czechia
// Dominican Republic -> Dominican Rep.
// Korea -> South Korea

// Get array of all stream values
const dataArray = Object.values(byCountry);

// Find maximum value
const maxStreams = Math.max(...dataArray.map((country) => country.streams));

// Define number formatter
const formatter = new Intl.NumberFormat("en", {
	notation: "compact",
	compactDisplay: "long",
	maximumFractionDigits: 1,
});

let width = window.innerWidth - 20;
let height = window.innerHeight - 25;

// Handle resizing window.
document.addEventListener("resize", () => {
	width = window.innerWidth - 20;
	height = window.innerHeight - 25;
});

// Load the world map data
d3.json("./data/map.json").then(function (mapData) {
	const colorScale = d3
		.scaleQuantize(
			[1, maxStreams],
			["#87fa8e", "#64bd6b", "#427f48", "#1e4025"]
		)
		.nice();

	// Create the map projection
	const projection = d3.geoMercator().fitSize([width, height], mapData);

	// Create the path generator
	const pathGenerator = d3.geoPath().projection(projection);

	// Draw the map
	const svg = d3
		.select("#map-container")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "map-svg");

	svg
		.selectAll("path")
		.data(mapData.features)
		.enter()
		.append("path")
		.attr("d", pathGenerator)
		// .attr("fill", function (d) {
		// 	const countryName = d.properties.name;
		// 	const totalStreams = byCountry[countryName]?.streams || 0;
		// 	if (totalStreams === 0) return "white";
		// 	return colorScale(totalStreams);
		// })
		.attr("fill", (d) => {
			const countryName = d.properties.name;
			const danceability = byCountry[countryName]?.danceability || 0;
			if (!danceability) return "white";
			else if (danceability < 0.33) return "url(#low-danceability)";
			else if (danceability < 0.67) return "url(#moderate-danceability)";
			else return "url(#high-danceability)";
		})
		.style("stroke", "#00441b")
		.style("stroke-width", 1);

	// Add event listeners
	svg.selectAll("path").on("mouseover", onMouseOver).on("mouseout", onMouseOut);

	// Append image
	svg
		.append("image")
		.attr("xlink:href", "./images/Spotify_logo_without_text.svg.webp")
		.attr("id", "spotify-logo")
		.attr("width", 80)
		.attr("height", 80)
		.attr("x", width - 90)
		.attr("y", 10);

	const legendX = 20;
	const legendY = 50;

	const legend = svg
		.append("g")
		.attr("id", "legend")
		.attr("transform", `translate(${legendX}, ${legendY})`);

	const legendScale = d3
		.scaleQuantize()
		.domain([0, maxStreams])
		.range(["#87fa8e", "#64bd6b", "#427f48", "#1e4025"])
		.nice();

	const legendEntries = legendScale.range().map((color) => {
		const start = legendScale.invertExtent(color)[0];
		const end = legendScale.invertExtent(color)[1];
		return `${start ? formatter.format(start) : "0"} - ${formatter.format(
			end
		)}`;
	});

	legend
		.selectAll("rect")
		.data(["#87fa8e", "#64bd6b", "#427f48", "#1e4025"])
		.enter()
		.append("rect")
		.attr("x", 0)
		.attr("y", (d, i) => i * 20)
		.attr("width", 20)
		.attr("height", 20)
		.style("fill", (d) => d);

	legend
		.selectAll("text")
		.data(legendEntries)
		.enter()
		.append("text")
		.attr("x", 30)
		.attr("y", (d, i) => i * 20 + 15)
		.text((d) => d);

	legend.append("text").attr("x", 0).attr("y", -10).text("Streams");

	const defs = svg.append("defs");

	// Low danceability pattern
	defs
		.append("pattern")
		.attr("id", "low-danceability")
		.attr("patternUnits", "userSpaceOnUse")
		.attr("width", 20) // Adjust the width and height based on your icon size
		.attr("height", 20)
		.append("image")
		.attr("xlink:href", "/low-dance.png") // <a href="https://www.flaticon.com/free-icons/person" title="person icons">Person icons created by Uniconlabs - Flaticon</a>
		.attr("width", 20)
		.attr("height", 20);

	// Moderate danceability pattern
	defs
		.append("pattern")
		.attr("id", "moderate-danceability")
		.attr("patternUnits", "userSpaceOnUse")
		.attr("width", 20)
		.attr("height", 20)
		.append("image")
		.attr("xlink:href", "/moderate-dance.png") // <a href="https://www.flaticon.com/free-icons/fun" title="fun icons">Fun icons created by Freepik - Flaticon</a>
		.attr("width", 20)
		.attr("height", 20);

	// High danceability pattern
	defs
		.append("pattern")
		.attr("id", "high-danceability")
		.attr("patternUnits", "userSpaceOnUse")
		.attr("width", 40)
		.attr("height", 40)
		.append("image")
		.attr("xlink:href", "/high-dance.png") // <a href="https://www.flaticon.com/free-icons/nightclub" title="nightclub icons">Nightclub icons created by Leremy - Flaticon</a>
		.attr("width", 40)
		.attr("height", 40);

	// Define the danceability scale
	const danceabilityScale = d3
		.scaleQuantize()
		.domain([0, 1])
		.range([
			{ label: "Low", icon: "/low-dance.png" },
			{ label: "Moderate", icon: "/moderate-dance.png" },
			{ label: "High", icon: "/high-dance.png" },
		]);

	// Define the dimensions and position of the danceability legend
	const danceabilityLegendHeight = 60;
	const danceabilityLegendX = 20;
	const danceabilityLegendY = height - danceabilityLegendHeight - 100;

	// Create a new group for the danceability legend
	const danceabilityLegend = svg
		.append("g")
		.attr("id", "danceability-legend")
		.attr(
			"transform",
			`translate(${danceabilityLegendX}, ${danceabilityLegendY})`
		);

	// Append icon elements with text labels
	danceabilityLegend
		.selectAll("g")
		.data(danceabilityScale.range())
		.enter()
		.append("g")
		.attr("transform", (d, i) => `translate(0, ${i * 50})`)
		.append("image")
		.attr("xlink:href", (d) => d.icon)
		.attr("width", 40)
		.attr("height", 40)
		.attr("x", 0)
		.attr("y", 0);

	danceabilityLegend
		.selectAll("g")
		.append("text")
		.attr("x", 50)
		.attr("y", (d, i) => i * 1 + 20)
		.text((d) => d.label);

	// Add a title for the danceability legend
	danceabilityLegend
		.append("text")
		.attr("x", 0)
		.attr("y", -10)
		.text("Danceability");
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
	const streams = byCountry[country]?.streams;
	const energy = byCountry[country]?.energy;
	const danceability = byCountry[country]?.danceability;

	// Update tooltip
	tooltip
		.html(
			`
    <div>${country}</div>
    <div>Streams: ${streams ? formatter.format(streams) : 0}</div>
    <div>Energy: ${energy ? Math.round(energy * 100) / 100 : 0}</div>
    <div>Danceability: ${
			danceability ? Math.round(danceability * 100) / 100 : 0
		}</div>
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

// document.getElementById("logo").addEventListener("click", exportMap);

function exportMap() {
	// Get the d3 map svg element
	var mapSvg = d3.select("#map-svg").node();

	// Create a clone so we don't modify the original
	var mapClone = mapSvg.cloneNode(true);

	// Create a div element
	var div = document.createElement("div");

	// Append svg clone to the div
	div.appendChild(mapClone);

	// Hide the existing map
	d3.select("#map-svg").style("visibility", "hidden");

	// Make div temporarily visible
	div.style.position = "absolute";
	div.style.top = 0;
	div.style.left = 0;
	document.body.appendChild(div);

	// Export div to image
	html2canvas(div).then(function (canvas) {
		// Generate PNG data URL
		var imgData = canvas.toDataURL("image/png");

		// Download image
		var a = document.createElement("a");
		a.download = "map.png";
		a.href = imgData;
		a.click();

		// Cleanup
		document.body.removeChild(div);
		d3.select("#map-svg").style("visibility", "");
	});
}
