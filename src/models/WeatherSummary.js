// models/WeatherSummary.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const weatherSummarySchema = new Schema({
    city: String,
    date: { type: String },  // Storing date as a string to match same-day summaries easily
    averageTemp: Number,
    maxTemp: Number,
    minTemp: Number,
    dominantCondition: String,
    conditionCounts: { type: Map, of: Number }, // Tracks condition frequencies
    consecutiveBreaches: { type: Number, default: 0 }, // Tracks consecutive threshold breaches
    count: { type: Number, default: 1 } // Tracks number of updates in daily average
});

export default model('WeatherSummary', weatherSummarySchema);
