import streams from "./data/spotify.json" assert { type: "json" };
import fs from "fs";

// Initialize totals map
const totalStreamsByCountry = {};

// Loop through each data entry
streams.forEach((d) => {
	// Extract the country and streams
	const country = d.country;
	const streams = parseInt(d.streams);

	// If first entry for country, initialize to 0
	if (!totalStreamsByCountry[country]) {
		totalStreamsByCountry[country] = 0;
	}

	// Increment country's total streams
	totalStreamsByCountry[country] += streams;
});

console.log(totalStreamsByCountry);
fs.writeFileSync(
	"./data/streamsByCountry.json",
	JSON.stringify(totalStreamsByCountry)
);
