const API = window.location.origin;
let regionalCities = [];
let weatherScreens = [];

const SCREEN_NAMES = {
    'currentConditions': 'Current Conditions',
    'latestObservations': 'Latest Observations',
    'extendedForecast': 'Extended Forecast',
    'hourlyForecast': 'Hourly Forecast',
    'localForecast': 'Local Forecast',
    'almanac': 'Almanac',
    'travelForecast': 'Travel Forecast',
    'regionalObservations': 'Regional Observations',
    'radar': 'Local Radar'
};

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

async function loadWeatherSettings() {
    try {
        const response = await fetch(`${API}/api/settings`);
        const settings = await response.json();
        
        // Location
        if (settings.weatherLocation) {
            document.getElementById('weatherLat').value = settings.weatherLocation.lat || '';
            document.getElementById('weatherLon').value = settings.weatherLocation.lon || '';
        }
        if (settings.cityName) document.getElementById('cityName').value = settings.cityName;
        if (settings.stationName) document.getElementById('stationName').value = settings.stationName;
        
        // Screens
        if (settings.showCurrentConditions !== undefined) {
            document.getElementById('showCurrentConditions').checked = settings.showCurrentConditions;
        }
        if (settings.showRegionalObs !== undefined) {
            document.getElementById('showRegionalObs').checked = settings.showRegionalObs;
        }
        if (settings.showAlmanac !== undefined) {
            document.getElementById('showAlmanac').checked = settings.showAlmanac;
        }
        
        // Timing
        if (settings.screenDuration) document.getElementById('screenDuration').value = settings.screenDuration;
        if (settings.refreshInterval) document.getElementById('refreshInterval').value = settings.refreshInterval;
        
        // Regional cities
        if (settings.regionalCities) {
            regionalCities = settings.regionalCities;
            renderRegionalCities();
        }
        
        // Ticker
        if (settings.weatherTickerText) {
            document.getElementById('weatherTickerText').value = settings.weatherTickerText;
        }
        
        // Weather screens playlist
        if (settings.weatherScreens && Array.isArray(settings.weatherScreens)) {
            weatherScreens = [...settings.weatherScreens];
        } else {
            // Default all 9 screens
            weatherScreens = [
                'currentConditions', 'latestObservations', 'extendedForecast',
                'hourlyForecast', 'localForecast', 'almanac',
                'travelForecast', 'regionalObservations', 'radar'
            ];
        }
        renderWeatherScreensList();
        
    } catch(error) {
        console.error('Failed to load settings:', error);
        showToast('Failed to load settings');
    }
}

function renderRegionalCities() {
    const container = document.getElementById('regionalCitiesContainer');
    
    if (regionalCities.length === 0) {
        container.innerHTML = '<p style="color:#fff;opacity:0.7;">No regional cities configured. Add cities to display on Regional Observations screen.</p>';
        return;
    }
    
    container.innerHTML = regionalCities.map((city, index) => `
        <div style="background:rgba(255,255,255,0.1);border:2px solid #fff;padding:14px;margin-bottom:10px;display:grid;grid-template-columns:1fr 1fr 100px;gap:12px;align-items:center;">
            <div>
                <label style="font-size:.85em;color:#fff;display:block;margin-bottom:4px;">City Name</label>
                <input type="text" value="${city.name}" onchange="updateRegionalCity(${index}, 'name', this.value)" 
                       style="width:100%;background:#0000FF;color:#fff;border:2px solid #fff;padding:6px;font-family:'Star3000',monospace;">
            </div>
            <div>
                <label style="font-size:.85em;color:#fff;display:block;margin-bottom:4px;">Lat, Lon</label>
                <input type="text" value="${city.lat}, ${city.lon}" onchange="updateRegionalCityCoords(${index}, this.value)" 
                       style="width:100%;background:#0000FF;color:#fff;border:2px solid #fff;padding:6px;font-family:'Star3000',monospace;">
            </div>
            <button onclick="removeRegionalCity(${index})" 
                    style="background:#ff0000;color:#fff;border:2px solid #fff;padding:6px;cursor:pointer;font-family:'Star3000',monospace;font-weight:bold;">
                DELETE
            </button>
        </div>
    `).join('');
}

function addRegionalCity() {
    regionalCities.push({ name: 'New City', lat: 35.0, lon: -77.0 });
    renderRegionalCities();
}

function updateRegionalCity(index, field, value) {
    regionalCities[index][field] = value;
}

function updateRegionalCityCoords(index, value) {
    const parts = value.split(',').map(s => s.trim());
    if (parts.length === 2) {
        regionalCities[index].lat = parseFloat(parts[0]) || 0;
        regionalCities[index].lon = parseFloat(parts[1]) || 0;
    }
}

function removeRegionalCity(index) {
    if (confirm('Delete this city from regional observations?')) {
        regionalCities.splice(index, 1);
        renderRegionalCities();
    }
}

async function testLocation() {
    const lat = parseFloat(document.getElementById('weatherLat').value);
    const lon = parseFloat(document.getElementById('weatherLon').value);
    
    if (!lat || !lon) {
        showToast('Please enter latitude and longitude');
        return;
    }
    
    showToast('Testing location...');
    
    try {
        const response = await fetch(`${API}/api/weather/test?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        
        if (data.error) {
            showToast('Location test failed: ' + data.error);
        } else {
            showToast('Location OK! Temperature: ' + data.temperature + '°F');
        }
    } catch(error) {
        showToast('Location test failed');
        console.error(error);
    }
}

async function lookupZipCode() {
    const zip = document.getElementById('zipCode').value;
    
    if (!zip || zip.length !== 5 || !/^\d{5}$/.test(zip)) {
        showToast('Please enter a valid 5-digit zip code');
        return;
    }
    
    showToast('Looking up location...');
    
    try {
        const response = await fetch(`${API}/api/weather/zip-lookup/${zip}`);
        const data = await response.json();
        
        if (data.success) {
            // Populate fields with results
            document.getElementById('weatherLat').value = data.lat;
            document.getElementById('weatherLon').value = data.lon;
            document.getElementById('cityName').value = data.city;
            document.getElementById('stationName').value = data.stationName || data.city;
            
            showToast(`✓ Found: ${data.city}, ${data.state}`);
        } else {
            showToast(`✗ ${data.error || 'Zip code not found'}`);
        }
    } catch(error) {
        showToast('✗ Lookup failed');
        console.error(error);
    }
}

async function saveWeatherSettings() {
    try {
        // Load ALL current settings first
        const currentResponse = await fetch(`${API}/api/settings`);
        const currentSettings = await currentResponse.json();
        
        // Only update weather-specific fields, preserve everything else
        const updatedSettings = {
            ...currentSettings, // Keep ALL existing settings
            weatherLocation: {
                lat: parseFloat(document.getElementById('weatherLat').value) || currentSettings.weatherLocation?.lat || 38.9517,
                lon: parseFloat(document.getElementById('weatherLon').value) || currentSettings.weatherLocation?.lon || -92.3341
            },
            cityName: document.getElementById('cityName').value || currentSettings.cityName || 'Columbia',
            stationName: document.getElementById('stationName').value || currentSettings.stationName || 'Columbia Regional',
            showCurrentConditions: document.getElementById('showCurrentConditions').checked,
            showRegionalObs: document.getElementById('showRegionalObs').checked,
            showAlmanac: document.getElementById('showAlmanac').checked,
            screenDuration: parseInt(document.getElementById('screenDuration').value) || currentSettings.screenDuration || 8,
            refreshInterval: parseInt(document.getElementById('refreshInterval').value) || currentSettings.refreshInterval || 10,
            regionalCities: regionalCities,
            weatherScreens: weatherScreens,
            weatherTickerText: document.getElementById('weatherTickerText').value || currentSettings.weatherTickerText || ''
        };
        
        const response = await fetch(`${API}/api/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSettings)
        });
        
        if (response.ok) {
            showToast('Weather settings saved!');
        } else {
            showToast('Failed to save settings');
        }
    } catch(error) {
        console.error('Save error:', error);
        showToast('Failed to save settings');
    }
}

// Initialize
window.onload = () => {
    loadWeatherSettings();
};

// Weather Screen Playlist Management
function addWeatherScreen(screenId) {
    weatherScreens.push(screenId);
    renderWeatherScreensList();
    showToast(`Added ${SCREEN_NAMES[screenId]}`);
}

function removeWeatherScreen(index) {
    if (weatherScreens.length <= 1) {
        showToast('Must have at least one screen in playlist');
        return;
    }
    const removed = weatherScreens.splice(index, 1)[0];
    renderWeatherScreensList();
    showToast(`Removed ${SCREEN_NAMES[removed]}`);
}

function moveWeatherScreenUp(index) {
    if (index === 0) return;
    const temp = weatherScreens[index];
    weatherScreens[index] = weatherScreens[index - 1];
    weatherScreens[index - 1] = temp;
    renderWeatherScreensList();
}

function moveWeatherScreenDown(index) {
    if (index === weatherScreens.length - 1) return;
    const temp = weatherScreens[index];
    weatherScreens[index] = weatherScreens[index + 1];
    weatherScreens[index + 1] = temp;
    renderWeatherScreensList();
}

function renderWeatherScreensList() {
    const container = document.getElementById('weatherScreensList');
    if (!container) return;
    
    if (weatherScreens.length === 0) {
        container.innerHTML = '<div style="color:#fff;padding:20px;text-align:center;">No screens in playlist</div>';
        return;
    }
    
    container.innerHTML = weatherScreens.map((screenId, index) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.1);border:2px solid #fff;border-radius:5px;">
            <span style="color:#ffff00;font-weight:bold;min-width:25px;">${index + 1}.</span>
            <span style="color:#fff;flex:1;">${SCREEN_NAMES[screenId]}</span>
            <button class="btn" onclick="moveWeatherScreenUp(${index})" ${index === 0 ? 'disabled style="opacity:0.3;"' : ''} style="padding:5px 12px;min-width:40px;">▲</button>
            <button class="btn" onclick="moveWeatherScreenDown(${index})" ${index === weatherScreens.length - 1 ? 'disabled style="opacity:0.3;"' : ''} style="padding:5px 12px;min-width:40px;">▼</button>
            <button class="btn" onclick="removeWeatherScreen(${index})" style="background:#ff0000;padding:5px 12px;min-width:40px;">✕</button>
        </div>
    `).join('');
}
