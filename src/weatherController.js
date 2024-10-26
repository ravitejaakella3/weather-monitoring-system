import fetch from 'node-fetch';
import WeatherSummary from '../src/models/WeatherSummary.js';
import Config from '../src/models/Config.js';

// OpenWeatherMap API key and city list
const apiKey = '3b566dba2aa9b5d8049abd2fc89844c1';
const cities = ["Delhi", "Mumbai", "Chennai", "Bangalore", "Kolkata", "Hyderabad"];

// Fetch and process weather data for each city
async function fetchWeatherData() {
    try {
        for (const city of cities) {
            const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
            if (!response.ok) {
                console.error(`Failed to fetch weather data for ${city}: ${response.statusText}`);
                continue;
            }
            const data = await response.json();
            await processWeatherData(city, data);
        }
    } catch (error) {
        console.error("Error in fetchWeatherData:", error);
    }
}

// Process weather data and update MongoDB
async function processWeatherData(city, data) {
    try {
        const tempCelsius = data.main.temp - 273.15;
        const condition = data.weather[0].main;

        // Find or create a daily summary
        let summary = await WeatherSummary.findOne({ city, date: new Date().toDateString() });
        if (!summary) {
            summary = new WeatherSummary({
                city,
                date: new Date().toDateString(),
                averageTemp: tempCelsius,
                maxTemp: tempCelsius,
                minTemp: tempCelsius,
                dominantCondition: condition,
                conditionCounts: { [condition]: 1 },
                count: 1
            });
        } else {
            // Update daily stats and condition counts
            summary.averageTemp = ((summary.averageTemp * summary.count) + tempCelsius) / (summary.count + 1);
            summary.maxTemp = Math.max(summary.maxTemp, tempCelsius);
            summary.minTemp = Math.min(summary.minTemp, tempCelsius);
            summary.count += 1;

            // Update condition counts and determine the dominant condition
            summary.conditionCounts[condition] = (summary.conditionCounts[condition] || 0) + 1;
            summary.dominantCondition = Object.keys(summary.conditionCounts).reduce((a, b) =>
                summary.conditionCounts[a] > summary.conditionCounts[b] ? a : b
            );
        }

        await summary.save();
    } catch (error) {
        console.error("Error in processWeatherData:", error);
    }
}

// Check alerts based on temperature threshold
async function checkAlerts() {
    try {
        const config = await Config.findOne() || new Config();
        const thresholdTemp = config.temperatureThreshold;
        const breachCountRequired = config.consecutiveBreachesRequired;

        const summaries = await WeatherSummary.find({ date: new Date().toDateString() });

        for (const summary of summaries) {
            if (summary.maxTemp > thresholdTemp) {
                summary.consecutiveBreaches = (summary.consecutiveBreaches || 0) + 1;
                if (summary.consecutiveBreaches >= breachCountRequired) {
                    console.log(`Alert: Consecutive temperature breaches in ${summary.city}.`);
                    summary.consecutiveBreaches = 0; // Reset after alert
                }
            } else {
                summary.consecutiveBreaches = 0; // Reset if not breached
            }
            await summary.save();
        }
    } catch (error) {
        console.error("Error in checkAlerts:", error);
    }
}

export { fetchWeatherData, checkAlerts };


