
---

### Task 2: Real-time Weather Monitoring System (`README.md`)

```markdown
# Real-time Weather Monitoring System

## Project Overview
This weather monitoring system fetches real-time weather data from the OpenWeatherMap API at regular intervals, processes it to provide daily summaries, and triggers alerts based on configurable thresholds. Data is stored in MongoDB for historical analysis, and API endpoints are available to access summaries and configure alerts.

## Features
- **Real-time Data Collection**: Fetches weather data for cities in India every 5 minutes.
- **Daily Aggregates**: Calculates daily average, max, min temperatures, and dominant weather conditions.
- **Alerting Mechanism**: Triggers alerts if user-defined temperature thresholds are breached for consecutive updates.

## Setup Instructions

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd WeatherMonitoringSystem
   
2. **Install Dependencies**:
   npm init -y
   npm install mongoose body-parser

3. **Configure MongoBD and open weathermap API**:
   Update the MongoDB connection URI in the weatherMonitor.js file with your MongoDB url and add your Open WeatherMap API in WeatherController.js

4. **Run the server**:
   node weatherMonitor.js
