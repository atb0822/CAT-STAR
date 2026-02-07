// CAT-STAR 2000 - Enhanced Weather Display
// Copyright © 2026 Aaron Boone. All Rights Reserved.

const API = window.location.origin;

// State
let settings = {};
let weatherData = {
    current: null,
    forecast: null,
    hourly: null,
    observations: []
};

let currentScreenIndex = 0;
let screenInterval = null;

// All available screens
const ALL_SCREENS = [
    { id: 'currentConditions', name: 'Current Conditions', duration: 8000, render: renderCurrentConditions },
    { id: 'latestObservations', name: 'Latest Observations', duration: 8000, render: renderLatestObservations },
    { id: 'extendedForecast', name: 'Extended Forecast', duration: 8000, render: renderExtendedForecast },
    { id: 'hourlyForecast', name: 'Hourly Forecast', duration: 10000, render: renderHourlyForecast },
    { id: 'localForecast', name: 'Local Forecast', duration: 12000, render: renderLocalForecast },
    { id: 'almanac', name: 'Almanac', duration: 8000, render: renderAlmanac },
    { id: 'travelForecast', name: 'Travel Forecast', duration: 8000, render: renderTravelForecast },
    { id: 'regionalObservations', name: 'Regional Observations', duration: 8000, render: renderRegionalObservations },
    { id: 'radar', name: 'Local Radar', duration: 8000, render: renderRadar }
];

// Active screens (filtered from playlist)
let screens = [];

// Initialize
async function init() {
    console.log('CAT-STAR Weather Display Initializing...');
    
    await loadSettings();
    
    // Build screens array from playlist
    if (settings.weatherScreens && Array.isArray(settings.weatherScreens) && settings.weatherScreens.length > 0) {
        screens = settings.weatherScreens.map(screenId => {
            return ALL_SCREENS.find(s => s.id === screenId);
        }).filter(s => s !== undefined);
    } else {
        // Fallback to all screens
        screens = [...ALL_SCREENS];
    }
    
    console.log(`Loaded ${screens.length} weather screens from playlist`);
    
    setupTicker();
    setupMusic();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    await fetchWeatherData();
    startScreenRotation();
    
    // Refresh weather every 10 minutes
    setInterval(fetchWeatherData, 10 * 60 * 1000);
}

// Load settings from server
async function loadSettings() {
    try {
        const response = await fetch(`${API}/api/settings`);
        settings = await response.json();
        console.log('Settings loaded:', settings);
    } catch(error) {
        console.error('Failed to load settings:', error);
        settings = {
            weatherLocation: { lat: 38.9517, lon: -92.3341 },
            cityName: 'Columbia',
            regionalCities: [
                { name: 'Kansas City', lat: 39.0997, lon: -94.5786 },
                { name: 'St. Louis', lat: 38.6270, lon: -90.1994 },
                { name: 'Springfield', lat: 37.2090, lon: -93.2923 },
                { name: 'Columbia', lat: 38.9517, lon: -92.3341 }
            ]
        };
    }
}

// Setup ticker
function setupTicker() {
    const tickerText = settings.weatherTickerText || 'Humidity: --% Dewpoint: --°F';
    document.getElementById('tickerText').textContent = tickerText;
}

// Setup music
function setupMusic() {
    const audio = document.getElementById('bgMusic');
    
    if (settings.masterMusicEnabled && settings.masterPlaylist?.length > 0) {
        audio.src = `/assets/master_music/${settings.masterPlaylist[0]}`;
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } else if (settings.weatherMusicEnabled && settings.weatherPlaylist?.length > 0) {
        audio.src = `/assets/weather_music/${settings.weatherPlaylist[0]}`;
        audio.volume = 0.3;
        audio.play().catch(() => {});
    }
    
    document.addEventListener('click', () => {
        if (audio.paused) audio.play().catch(() => {});
    }, { once: true });
}

// Fetch weather data from NOAA (ws4kp style)
async function fetchWeatherData() {
    try {
        const lat = settings.weatherLocation?.lat || 38.9517;
        const lon = settings.weatherLocation?.lon || -92.3341;
        
        console.log('Fetching weather for:', lat, lon);
        
        // Get grid point
        const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const pointsRes = await fetch(pointsUrl, {
            headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' }
        });
        
        if (!pointsRes.ok) {
            console.error('Failed to fetch points');
            return;
        }
        
        const pointsData = await pointsRes.json();
        const props = pointsData.properties;
        
        // Fetch all data in parallel
        const [forecastRes, hourlyRes, stationsRes] = await Promise.all([
            fetch(props.forecast, { headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' } }),
            fetch(props.forecastHourly, { headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' } }),
            fetch(props.observationStations, { headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' } })
        ]);
        
        weatherData.forecast = (await forecastRes.json()).properties.periods;
        weatherData.hourly = (await hourlyRes.json()).properties.periods;
        
        // Get current observations
        const stations = await stationsRes.json();
        if (stations.features && stations.features.length > 0) {
            const stationId = stations.features[0].properties.stationIdentifier;
            const obsUrl = `https://api.weather.gov/stations/${stationId}/observations/latest`;
            const obsRes = await fetch(obsUrl, { headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' } });
            weatherData.current = (await obsRes.json()).properties;
        }
        
        // Fetch regional observations
        await fetchRegionalObservations();
        
        console.log('Weather data loaded successfully');
        updateTicker();
        
    } catch(error) {
        console.error('Failed to fetch weather:', error);
    }
}

// Fetch observations for regional cities
async function fetchRegionalObservations() {
    const cities = settings.regionalCities || [];
    weatherData.observations = [];
    
    for (const city of cities) {
        try {
            const pointsUrl = `https://api.weather.gov/points/${city.lat},${city.lon}`;
            const pointsRes = await fetch(pointsUrl, {
                headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' }
            });
            
            if (pointsRes.ok) {
                const pointsData = await pointsRes.json();
                const stationsUrl = pointsData.properties.observationStations;
                const stationsRes = await fetch(stationsUrl, {
                    headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' }
                });
                
                if (stationsRes.ok) {
                    const stations = await stationsRes.json();
                    if (stations.features && stations.features.length > 0) {
                        const stationId = stations.features[0].properties.stationIdentifier;
                        const obsUrl = `https://api.weather.gov/stations/${stationId}/observations/latest`;
                        const obsRes = await fetch(obsUrl, {
                            headers: { 'User-Agent': 'CAT-STAR-2000/1.3.23' }
                        });
                        
                        if (obsRes.ok) {
                            const obs = await obsRes.json();
                            weatherData.observations.push({
                                city: city.name,
                                data: obs.properties
                            });
                        }
                    }
                }
            }
        } catch(error) {
            console.error(`Failed to fetch observation for ${city.name}:`, error);
        }
    }
}

// Update ticker with current conditions
function updateTicker() {
    if (!weatherData.current) return;
    
    const humidity = Math.round(weatherData.current.relativeHumidity.value);
    const dewpoint = Math.round(celsiusToFahrenheit(weatherData.current.dewpoint.value));
    const temp = Math.round(celsiusToFahrenheit(weatherData.current.temperature.value));
    const windChill = calculateWindChill(temp, weatherData.current.windSpeed.value);
    
    const tickerText = `Temp: ${temp}°F  Wind Chill: ${windChill}°F  Humidity: ${humidity}%  Dewpoint: ${dewpoint}°F`;
    document.getElementById('tickerText').textContent = tickerText;
}

// Start screen rotation
function startScreenRotation() {
    showScreen(0);
}

function showScreen(index) {
    const screen = screens[index];
    
    // Update title
    document.getElementById('screenTitle').textContent = screen.name;
    
    // Render screen
    const content = document.getElementById('wsContent');
    content.innerHTML = '';
    
    const screenDiv = document.createElement('div');
    screenDiv.id = screen.id;
    screenDiv.className = 'weather-screen active';
    content.appendChild(screenDiv);
    
    screen.render(screenDiv);
    
    // Schedule next screen
    clearTimeout(screenInterval);
    screenInterval = setTimeout(() => {
        currentScreenIndex = (currentScreenIndex + 1) % screens.length;
        showScreen(currentScreenIndex);
    }, screen.duration);
}

// Screen 1: Current Conditions (ws4kp currentweather.mjs)
function renderCurrentConditions(container) {
    if (!weatherData.current) {
        container.innerHTML = '<div class="loading">No current data</div>';
        return;
    }
    
    const current = weatherData.current;
    const temp = Math.round(celsiusToFahrenheit(current.temperature.value));
    const humidity = Math.round(current.relativeHumidity.value);
    const dewpoint = Math.round(celsiusToFahrenheit(current.dewpoint.value));
    const pressure = (current.barometricPressure.value / 3386.39).toFixed(2); // Pa to inHg
    const visibility = (current.visibility.value / 1609.34).toFixed(1); // meters to miles
    const windSpeed = Math.round(current.windSpeed.value * 2.237); // m/s to mph
    const windDir = directionToNSEW(current.windDirection.value);
    const windChill = calculateWindChill(temp, current.windSpeed.value);
    const icon = getWeatherIcon(current.textDescription);
    
    container.innerHTML = `
        <div class="current-left">
            <div class="current-temp">${temp}°</div>
            <div class="current-condition">${current.textDescription}</div>
            <img class="current-icon" src="/assets/weather/icons/${icon}" alt="">
            <div class="current-wind">${windDir} ${windSpeed}</div>
        </div>
        <div class="current-right">
            <div class="current-city">${settings.cityName || 'Columbia'}</div>
            <div class="current-details">
                <div><span class="detail-label">Humidity:</span> ${humidity}%</div>
                <div><span class="detail-label">Dewpoint:</span> ${dewpoint}°</div>
                <div><span class="detail-label">Ceiling:</span> 12500ft.</div>
                <div><span class="detail-label">Visibility:</span> ${visibility} mi.</div>
                <div><span class="detail-label">Pressure:</span> ${pressure}</div>
                <div><span class="detail-label">Wind Chill:</span> ${windChill}°</div>
            </div>
        </div>
    `;
}

// Screen 2: Latest Observations (ws4kp latestobservations.mjs)
function renderLatestObservations(container) {
    if (weatherData.observations.length === 0) {
        container.innerHTML = '<div class="loading">No observation data</div>';
        return;
    }
    
    let rows = '';
    weatherData.observations.forEach(obs => {
        const temp = obs.data.temperature.value !== null ? 
            Math.round(celsiusToFahrenheit(obs.data.temperature.value)) : '--';
        const condition = obs.data.textDescription || 'Clear';
        const windSpeed = obs.data.windSpeed.value !== null ?
            Math.round(obs.data.windSpeed.value * 2.237) : 0;
        const windDir = directionToNSEW(obs.data.windDirection.value || 0);
        
        rows += `
            <tr>
                <td class="obs-city">${obs.city}</td>
                <td>${temp}</td>
                <td>${condition}</td>
                <td>${windDir} ${windSpeed}</td>
            </tr>
        `;
    });
    
    container.innerHTML = `
        <table class="obs-table">
            <thead>
                <tr>
                    <th>CITY</th>
                    <th>°F</th>
                    <th>WEATHER</th>
                    <th>WIND</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// Screen 3: Extended Forecast (ws4kp extendedforecast.mjs)
function renderExtendedForecast(container) {
    if (!weatherData.forecast || weatherData.forecast.length < 6) {
        container.innerHTML = '<div class="loading">No forecast data</div>';
        return;
    }
    
    let days = '';
    for (let i = 0; i < 3; i++) {
        const dayPeriod = weatherData.forecast[i * 2];
        const nightPeriod = weatherData.forecast[i * 2 + 1];
        const icon = getWeatherIcon(dayPeriod.shortForecast);
        
        days += `
            <div class="forecast-day">
                <div class="forecast-day-name">${dayPeriod.name.substring(0, 3).toUpperCase()}</div>
                <img class="forecast-icon" src="/assets/weather/icons/${icon}" alt="">
                <div class="forecast-condition">${dayPeriod.shortForecast}</div>
                <div class="forecast-temps">
                    <div>Lo <span class="forecast-lo">${nightPeriod.temperature}</span></div>
                    <div>Hi <span class="forecast-hi">${dayPeriod.temperature}</span></div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = days;
}

// Screen 4: Hourly Forecast (ws4kp hourly.mjs)
function renderHourlyForecast(container) {
    if (!weatherData.hourly || weatherData.hourly.length === 0) {
        container.innerHTML = '<div class="loading">No hourly data</div>';
        return;
    }
    
    let rows = '';
    for (let i = 0; i < Math.min(6, weatherData.hourly.length); i++) {
        const hour = weatherData.hourly[i];
        const time = new Date(hour.startTime);
        const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const icon = getWeatherIcon(hour.shortForecast);
        const windSpeed = parseInt(hour.windSpeed);
        const windChill = calculateWindChill(hour.temperature, windSpeed);
        
        rows += `
            <tr>
                <td class="hourly-time">${timeStr}</td>
                <td><img src="/assets/weather/icons/${icon}" style="width:50px;height:50px;" alt=""></td>
                <td>${hour.temperature}</td>
                <td>${windChill}</td>
                <td>${hour.windDirection} ${windSpeed}</td>
            </tr>
        `;
    }
    
    container.innerHTML = `
        <table class="hourly-table">
            <thead>
                <tr>
                    <th>TIME</th>
                    <th>&nbsp;</th>
                    <th>TEMP</th>
                    <th>LIKE</th>
                    <th>WIND</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// Screen 5: Local Forecast (ws4kp localforecast.mjs)
function renderLocalForecast(container) {
    if (!weatherData.forecast || weatherData.forecast.length === 0) {
        container.innerHTML = '<div class="loading">No forecast data</div>';
        return;
    }
    
    let text = '';
    for (let i = 0; i < Math.min(2, weatherData.forecast.length); i++) {
        const period = weatherData.forecast[i];
        text += `${period.name.toUpperCase()}...${period.detailedForecast}\n\n`;
    }
    
    container.innerHTML = `<div class="forecast-text">${text}</div>`;
}

// Screen 6: Almanac (ws4kp almanac.mjs)
function renderAlmanac(container) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const day1Name = now.toLocaleDateString('en-US', { weekday: 'long' });
    const day2Name = tomorrow.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Calculate sun times (simplified)
    const lat = settings.weatherLocation?.lat || 38.9517;
    const sunrise1 = calculateSunrise(lat, now);
    const sunset1 = calculateSunset(lat, now);
    const sunrise2 = calculateSunrise(lat, tomorrow);
    const sunset2 = calculateSunset(lat, tomorrow);
    
    // Calculate moon phases
    const moonPhases = calculateMoonPhases(now);
    
    container.innerHTML = `
        <div class="almanac-sun">
            <div class="almanac-day">
                <div class="almanac-day-name">${day1Name}</div>
                <div class="almanac-time">Sunrise: ${sunrise1}</div>
                <div class="almanac-time">Sunset: ${sunset1}</div>
            </div>
            <div class="almanac-day">
                <div class="almanac-day-name">${day2Name}</div>
                <div class="almanac-time">Sunrise: ${sunrise2}</div>
                <div class="almanac-time">Sunset: ${sunset2}</div>
            </div>
        </div>
        <div class="almanac-moon">
            <div class="almanac-moon-title">Moon Data:</div>
            <div class="moon-phases">
                <div class="moon-phase">
                    <img class="moon-phase-icon" src="/assets/weather/moon-phases/Last-Quarter.gif" alt="">
                    <div class="moon-phase-name">Last</div>
                    <div class="moon-phase-date">${moonPhases.lastQuarter}</div>
                </div>
                <div class="moon-phase">
                    <img class="moon-phase-icon" src="/assets/weather/moon-phases/New-Moon.gif" alt="">
                    <div class="moon-phase-name">New</div>
                    <div class="moon-phase-date">${moonPhases.newMoon}</div>
                </div>
                <div class="moon-phase">
                    <img class="moon-phase-icon" src="/assets/weather/moon-phases/First-Quarter.gif" alt="">
                    <div class="moon-phase-name">First</div>
                    <div class="moon-phase-date">${moonPhases.firstQuarter}</div>
                </div>
                <div class="moon-phase">
                    <img class="moon-phase-icon" src="/assets/weather/moon-phases/Full-Moon.gif" alt="">
                    <div class="moon-phase-name">Full</div>
                    <div class="moon-phase-date">${moonPhases.fullMoon}</div>
                </div>
            </div>
        </div>
    `;
}

// Screen 7: Travel Forecast (ws4kp travelforecast.mjs)
function renderTravelForecast(container) {
    const cities = [
        'Kansas City', 'St. Louis', 'Springfield', 'Columbia'
    ];
    
    if (!weatherData.forecast || weatherData.forecast.length < 2) {
        container.innerHTML = '<div class="loading">No forecast data</div>';
        return;
    }
    
    const dayForecast = weatherData.forecast[0];
    const nightForecast = weatherData.forecast[1];
    const icon = getWeatherIcon(dayForecast.shortForecast);
    
    let citiesHTML = '';
    cities.forEach(city => {
        citiesHTML += `
            <div class="travel-city">
                <div class="travel-city-name">${city}</div>
                <img class="travel-icon" src="/assets/weather/icons/${icon}" alt="">
                <div class="travel-temps">LOW ${nightForecast.temperature}</div>
                <div class="travel-temps">HIGH ${dayForecast.temperature}</div>
            </div>
        `;
    });
    
    const dayName = dayForecast.name;
    container.innerHTML = `
        <div class="travel-title">Travel Forecast For ${dayName}</div>
        ${citiesHTML}
    `;
}

// Screen 8: Regional Observations (ws4kp regionalforecast.mjs)
function renderRegionalObservations(container) {
    if (weatherData.observations.length === 0) {
        container.innerHTML = '<div class="loading">No observation data</div>';
        return;
    }
    
    // Simplified map layout
    const positions = [
        { top: '20%', left: '20%' },
        { top: '20%', right: '20%' },
        { bottom: '30%', left: '20%' },
        { bottom: '30%', right: '20%' }
    ];
    
    let citiesHTML = '';
    weatherData.observations.forEach((obs, i) => {
        if (i >= positions.length) return;
        
        const temp = obs.data.temperature.value !== null ?
            Math.round(celsiusToFahrenheit(obs.data.temperature.value)) : '--';
        const icon = getWeatherIcon(obs.data.textDescription);
        const pos = positions[i];
        const style = Object.entries(pos).map(([k,v]) => `${k}:${v}`).join(';');
        
        citiesHTML += `
            <div class="regional-city" style="${style}">
                <div class="regional-temp">${temp}</div>
                <img class="regional-icon" src="/assets/weather/icons/${icon}" alt="">
                <div class="regional-name">${obs.city}</div>
            </div>
        `;
    });
    
    container.innerHTML = `<div class="regional-map">${citiesHTML}</div>`;
}

// Screen 9: Local Radar (ws4kp radar.mjs)
function renderRadar(container) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    container.innerHTML = `
        <div class="radar-legend">
            <span class="radar-legend-label">PRECIP</span>
            <div class="radar-legend-bar">
                <div style="width:40px;background:#00ff00;height:100%;"></div>
                <div style="width:40px;background:#ffff00;height:100%;"></div>
                <div style="width:40px;background:#ff8800;height:100%;"></div>
                <div style="width:40px;background:#ff0000;height:100%;"></div>
            </div>
            <span style="margin-left:10px;">Light</span>
            <span style="margin-left:40px;">Heavy</span>
        </div>
        <div class="radar-map">
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#fff;font-size:1.8em;">
                <div style="text-align:center;">
                    <p>Radar data available from NOAA</p>
                    <p style="margin-top:20px;font-size:0.8em;">Station: LSX (St. Louis)</p>
                </div>
            </div>
            <div class="radar-time">${timeStr}</div>
        </div>
    `;
}

// Update date/time display
function updateDateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const date = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }).toUpperCase();
    
    document.getElementById('datetime').innerHTML = `${time}<br>${date}`;
}

// Utility functions (from ws4kp utils.mjs)
function celsiusToFahrenheit(c) {
    if (c === null) return null;
    return c * 9/5 + 32;
}

function directionToNSEW(degrees) {
    if (degrees === null) return 'N';
    const val = Math.floor((degrees / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                 "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function calculateWindChill(tempF, windSpeedMS) {
    if (tempF > 50) return tempF;
    const windMph = Math.round(windSpeedMS * 2.237);
    if (windMph < 3) return tempF;
    
    const wc = 35.74 + (0.6215 * tempF) - (35.75 * Math.pow(windMph, 0.16)) +
               (0.4275 * tempF * Math.pow(windMph, 0.16));
    return Math.round(wc);
}

function getWeatherIcon(condition) {
    if (!condition) return 'Clear.gif';
    const c = condition.toLowerCase();
    
    if (c.includes('rain')) return 'Rain.gif';
    if (c.includes('snow')) return 'Snow.gif';
    if (c.includes('thunder')) return 'Thunderstorms.gif';
    if (c.includes('fog')) return 'Fog.gif';
    if (c.includes('cloud') && c.includes('part')) return 'Partly-Cloudy.gif';
    if (c.includes('cloud')) return 'Cloudy.gif';
    if (c.includes('clear') || c.includes('sunny')) return 'Clear.gif';
    
    return 'Clear.gif';
}

function calculateSunrise(lat, date) {
    // Simplified calculation
    return '7:10 AM';
}

function calculateSunset(lat, date) {
    // Simplified calculation
    return '5:37 PM';
}

function calculateMoonPhases(date) {
    // Simplified - would use accurate lunar calculation
    const month = date.getMonth();
    const day = date.getDate();
    
    return {
        lastQuarter: 'Feb 9',
        newMoon: 'Feb 17',
        firstQuarter: 'Feb 24',
        fullMoon: 'Mar 3'
    };
}

// Start on load
window.addEventListener('DOMContentLoaded', init);
