import streams from "./data/spotify.json" assert { type: "json" };
import fs from "fs";

// Initialize totals map
const byCountry = {};

// Loop through each data entry
streams.forEach((d) => {
	// Extract the country and streams
	const country = d.country;
	const streams = parseInt(d.streams);
	const danceability = parseFloat(d.danceability);

	// If first entry for country, initialize to 0
	if (!byCountry[country]) {
		byCountry[country] = { streams: 0, danceability: 0, danceabilityTotal: 0 };
	}

	// Increment country's total streams
	byCountry[country].streams += streams;
	byCountry[country].danceabilityTotal += 1;
	byCountry[country].danceability += danceability;
});

Object.keys(byCountry).forEach((country) => {
	byCountry[country].danceability =
		byCountry[country].danceability / byCountry[country].danceabilityTotal;
});

Object.keys(byCountry).forEach((country) => {
	delete byCountry[country].danceabilityTotal;
});

console.log(byCountry);
fs.writeFileSync("./data/byCountry.json", JSON.stringify(byCountry));
