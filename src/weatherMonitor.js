import { createServer } from 'http';
import mongoose from 'mongoose';
import { fetchWeatherData, checkAlerts } from './weatherController.js';
import WeatherSummary from '../src/models/WeatherSummary.js';
import Config from '../src/models/Config.js';

const MONGODB_URI = 'mongodb://localhost:27017';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Fetch weather data every 5 minutes
setInterval(async () => {
    try {
        await fetchWeatherData();
    } catch (error) {
        console.error("Error in scheduled fetchWeatherData:", error);
    }
}, 5 * 60 * 1000);

// Check alerts every 5 minutes
setInterval(async () => {
    try {
        await checkAlerts();
    } catch (error) {
        console.error("Error in scheduled checkAlerts:", error);
    }
}, 5 * 60 * 1000);

// Set up HTTP server
const server = createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/api/weather/check-alerts') {
            try {
                await checkAlerts(); // Manually trigger alert check
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: "Alert check triggered successfully." }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Error checking alerts" }));
            }
        } else if (req.url === '/api/weather/daily-summary') {
            try {
                const summaries = await WeatherSummary.find({ date: new Date().toDateString() });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(summaries));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Error fetching daily summary" }));
            }
        } else if (req.url === '/api/weather/config') {
            try {
                const config = await Config.findOne() || new Config();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(config));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Error fetching config" }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Not Found" }));
        }
    } else if (req.method === 'POST' && req.url === '/api/weather/config') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { temperatureThreshold, consecutiveBreachesRequired } = JSON.parse(body);
                let config = await Config.findOne() || new Config();
                config.temperatureThreshold = temperatureThreshold;
                config.consecutiveBreachesRequired = consecutiveBreachesRequired;
                await config.save();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(config));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Error saving config" }));
            }
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Method Not Allowed" }));
    }
});

const PORT = 5001; // Ensure this matches the port you are using
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


