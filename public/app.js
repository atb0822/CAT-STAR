// Community Calendar — Display Client with Announcements Rotation

const API_BASE = window.location.origin;
let events = [];
let scrollSpeed = 3;
let musicEnabled = false;
let currentPlaylist = [];
let currentTrackIndex = 0;

// Announcements rotation state
let currentMode = 'events'; // 'events', 'weather', or 'announcements'
let eventCycleCount = 0;
let weatherCycleCount = 0;
let announcementCycleCount = 0;
let announcements = [];
let currentAnnouncementIndex = 0;
let settings = {};
let rotationTimer = null;

// Rotation sequence control
let rotationIndex = 0;
let rotationSequence = [];

/* ── API helpers ─────────────────────────────────────────── */
async function apiGet(path) {
    const r = await fetch(API_BASE + path);
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
}

/* ── Load events ─────────────────────────────────────────── */
async function loadEvents() {
    try {
        events = await apiGet('/api/events');
        renderEvents();
    } catch (e) {
        console.error('Failed to load events:', e);
    }
}

function renderEvents() {
    const list = document.getElementById('eventsList');
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Single pass - no duplication, let all events scroll off screen
    list.innerHTML = events.map(ev => {
        const d = new Date(ev.date + 'T00:00:00');
        const dateStr = d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }).toUpperCase();
        return `
            <div class="event-row">
                <div class="event-date-col">
                    <div class="event-date">${dateStr}</div>
                    <div class="event-time">${ev.time}</div>
                    <div class="event-location">${ev.location}</div>
                </div>
                <div class="event-info-col">
                    <div class="event-title">${ev.title}</div>
                    ${ev.description ? `<div class="event-description">${ev.description}</div>` : ''}
                </div>
            </div>`;
    }).join('');

    applyScrollSpeed();
}

function applyScrollSpeed() {
    const list = document.getElementById('eventsList');
    list.style.animation = 'none';
    void list.offsetHeight;
    
    if (scrollSpeed > 0 && events.length > 0) {
        // Calculate duration based on speed
        // Speed 1 = very slow, Speed 99 = very fast
        const baseDuration = 60; // 60 seconds at speed 1
        const duration = baseDuration / scrollSpeed;
        
        list.style.animation = `scrollEventsLoop ${duration}s linear infinite`;
    }
}

/* ── Load announcements ──────────────────────────────────── */
async function loadAnnouncements() {
    try {
        const all = await apiGet('/api/announcements');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter for active announcements only (start <= today <= end)
        announcements = all.filter(ann => {
            const start = new Date(ann.startDate + 'T00:00:00');
            const end = new Date(ann.endDate + 'T00:00:00');
            return start <= today && end >= today;
        });
        
        console.log(`Loaded ${announcements.length} active announcements`);
    } catch (e) {
        console.error('Failed to load announcements:', e);
        announcements = [];
    }
}

/* ── Clock ───────────────────────────────────────────────── */
function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent =
        now.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
    document.getElementById('currentDate').textContent =
        now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' }).toUpperCase();
}

/* ── Settings ────────────────────────────────────────────── */
async function loadSettings() {
    try {
        const s = await apiGet('/api/settings');
        settings = s; // Store globally for rotation logic
        
        // Apply display values
        if (s.channelNumber) document.getElementById('channelNumber').textContent = s.channelNumber;
        if (s.channelName)   document.getElementById('channelName').textContent   = s.channelName;
        if (s.tickerText)    document.getElementById('ticker').textContent        = s.tickerText;
        if (s.scrollSpeed !== undefined) scrollSpeed = s.scrollSpeed;
        if (s.autoStart) setTimeout(startFullscreen, 500);
        
        // Screen margins
        const container = document.getElementById('mainContainer');
        if (s.marginTop !== undefined)    container.style.top    = s.marginTop    + 'px';
        if (s.marginBottom !== undefined) container.style.bottom = s.marginBottom + 'px';
        if (s.marginLeft !== undefined)   container.style.left   = s.marginLeft   + 'px';
        if (s.marginRight !== undefined)  container.style.right  = s.marginRight  + 'px';
        
        // Brightness
        if (s.displayBrightness !== undefined) {
            const wrapper = document.getElementById('brightnessWrapper');
            if (wrapper) wrapper.style.filter = `brightness(${s.displayBrightness}%)`;
        }
        
        // Logo
        const logoImg = document.getElementById('channelLogo');
        const logoNum = document.getElementById('channelNumber');
        if (s.logoUrl) {
            logoImg.src = s.logoUrl;
            logoImg.style.display = 'block';
            logoNum.style.display = 'none';
        } else {
            logoImg.style.display = 'none';
            logoNum.style.display = 'block';
        }
        
        // Custom colors
        if (s.customTheme) {
            const root = document.documentElement;
            if (s.customTheme.bgColor)     root.style.setProperty('--bg-main', s.customTheme.bgColor);
            if (s.customTheme.accentColor) root.style.setProperty('--text-accent', s.customTheme.accentColor);
            if (s.customTheme.textColor)   root.style.setProperty('--text-primary', s.customTheme.textColor);
        }
        
        // Event border thickness
        if (s.eventBorderThickness) {
            const root = document.documentElement;
            root.style.setProperty('--event-border-width', s.eventBorderThickness + 'px');
        }
        
        // Ticker styling
        const root = document.documentElement;
        root.style.setProperty('--ticker-bg', s.tickerBgColor || s.customTheme?.bgColor || '#0f1d2e');
        root.style.setProperty('--ticker-text', s.tickerTextColor || s.customTheme?.accentColor || '#ffd700');
        
        const ticker = document.querySelector('.ticker');
        if (s.tickerSpeed && ticker) {
            const duration = 100 / s.tickerSpeed;
            ticker.style.animationDuration = duration + 's';
        }
        
        // Music setup
        musicEnabled = s.musicEnabled;
        
    } catch (e) {
        console.error('Settings load failed:', e);
    }
}

/* ── Fullscreen ──────────────────────────────────────────── */
function startFullscreen() {
    document.getElementById('fullscreenPrompt').classList.add('hidden');
    document.getElementById('mainContainer').style.display = 'flex';
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
}

function skipFullscreen() {
    document.getElementById('fullscreenPrompt').classList.add('hidden');
    document.getElementById('mainContainer').style.display = 'flex';
}

/* ── Keyboard ────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
    if (e.key === 'F11') {
        e.preventDefault();
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }
});

/* ── Music Player ────────────────────────────────────────── */
function playMusic(type = 'event') {
    if (!musicEnabled) return;
    
    const playlist = type === 'event' ? settings.playlist : 
                     type === 'weather' ? settings.weatherPlaylist : 
                     settings.announcementPlaylist;
    if (!playlist || playlist.length === 0) return;
    
    const audio = document.getElementById('bgMusic');
    const track = playlist[currentTrackIndex % playlist.length];
    const path = type === 'event' ? '/assets/background_music/' : 
                 type === 'weather' ? '/assets/weather_music/' :
                 '/assets/announcement_music/';
    
    audio.src = path + track;
    audio.volume = 0.3;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.catch(err => {
            console.log('Autoplay prevented. Music will start on user interaction.');
        });
    }
    
    audio.onended = () => {
        currentTrackIndex++;
        playMusic(type);
    };
}

function switchMusic(type) {
    const audio = document.getElementById('bgMusic');
    
    // If master music is enabled, don't switch
    if (settings.masterMusicEnabled && settings.masterPlaylist && settings.masterPlaylist.length > 0) {
        console.log('Master music enabled - not switching');
        return;
    }
    
    // Stop current music
    audio.pause();
    audio.currentTime = 0;
    currentTrackIndex = 0;
    
    if (type === 'event') {
        // Switch to event music
        if (!musicEnabled || !settings.playlist || settings.playlist.length === 0) {
            return;
        }
        playMusic('event');
    } else if (type === 'weather') {
        // Switch to weather music
        if (!settings.weatherMusicEnabled || !settings.weatherPlaylist || settings.weatherPlaylist.length === 0) {
            return;
        }
        playMusic('weather');
    } else if (type === 'announcement') {
        // Switch to announcement music
        if (!settings.announcementMusicEnabled || !settings.announcementPlaylist || settings.announcementPlaylist.length === 0) {
            return;
        }
        playMusic('announcement');
    }
}

document.addEventListener('click', () => {
    const audio = document.getElementById('bgMusic');
    if (musicEnabled && audio.paused) {
        audio.play().catch(() => {});
    }
}, { once: true });

/* ── Announcements Rotation Logic ────────────────────────── */
function startRotation() {
    // Get rotation sequence from settings
    rotationSequence = settings.rotationOrder || ['events', 'announcements'];
    rotationIndex = 0;
    
    console.log('Starting rotation with sequence:', rotationSequence);
    
    // Reset cycle counters
    eventCycleCount = 0;
    announcementCycleCount = 0;
    weatherCycleCount = 0;
    currentAnnouncementIndex = 0;
    
    // Show first item in sequence
    showNextInSequence();
}

// Handle sequence progression
function showNextInSequence() {
    if (rotationSequence.length === 0) {
        console.log('No rotation sequence defined');
        return;
    }
    
    const currentItem = rotationSequence[rotationIndex];
    console.log(`Showing: ${currentItem} (index ${rotationIndex})`);
    
    switch(currentItem) {
        case 'events':
            if (settings.eventsEnabled && events.length > 0) {
                showEvents();
            } else {
                advanceRotation();
            }
            break;
        case 'weather':
            if (settings.weatherEnabled) {
                showWeather();
            } else {
                advanceRotation();
            }
            break;
        case 'announcements':
            if (settings.announcementsEnabled && announcements.length > 0) {
                showAnnouncements();
            } else {
                advanceRotation();
            }
            break;
        default:
            advanceRotation();
    }
}

// Advance to next in rotation sequence
function advanceRotation() {
    rotationIndex = (rotationIndex + 1) % rotationSequence.length;
    showNextInSequence();
}

function showEvents() {
    console.log('Showing events mode');
    currentMode = 'events';
    
    // Check if events are enabled
    if (!settings.eventsEnabled) {
        advanceRotation();
        return;
    }
    
    // Show events, hide announcements
    document.getElementById('eventsScroll').style.display = 'flex';
    document.getElementById('announcementDisplay').style.display = 'none';
    
    // Update display name
    const displayName = settings.eventsDisplayName || 'COMMUNITY CALENDAR';
    document.getElementById('displayName').textContent = displayName;
    
    // Update ticker text
    document.getElementById('ticker').textContent = settings.tickerText || '';
    
    // Only switch music if we're coming from announcements mode or first load
    if (eventCycleCount === 0) {
        switchMusic('event');
    }
    // Otherwise music continues playing
    
    // Calculate how long one event cycle takes
    const duration = (60 / scrollSpeed) * 1000; // Convert to milliseconds
    
    // Schedule check after this cycle completes
    clearTimeout(rotationTimer);
    rotationTimer = setTimeout(() => {
        eventCycleCount++;
        console.log(`Event cycle ${eventCycleCount} complete`);
        
        if (eventCycleCount >= (settings.eventCycles || 3)) {
            eventCycleCount = 0;
            advanceRotation(); // Move to next in sequence
        } else {
            showEvents(); // Continue events
        }
    }, duration);
}

function showAnnouncements() {
    console.log('Showing announcements mode');
    currentMode = 'announcements';
    
    if (!settings.announcementsEnabled || announcements.length === 0) {
        advanceRotation();
        return;
    }
    
    // Hide events
    document.getElementById('eventsScroll').style.display = 'none';
    
    // Update display name
    const displayName = settings.announcementsDisplayName || 'COMMUNITY ANNOUNCEMENTS';
    document.getElementById('displayName').textContent = displayName;
    
    // Update ticker text
    document.getElementById('ticker').textContent = settings.announcementTickerText || '';
    
    // Start announcement music
    switchMusic('announcement');
    
    // Show first announcement
    renderAnnouncement(currentAnnouncementIndex);
    
    clearTimeout(rotationTimer);
    rotationTimer = setTimeout(() => {
        currentAnnouncementIndex++;
        
        if (currentAnnouncementIndex >= announcements.length) {
            currentAnnouncementIndex = 0;
            announcementCycleCount++;
            console.log(`Announcement cycle ${announcementCycleCount} complete`);
            
            if (announcementCycleCount >= (settings.announcementCycles || 2)) {
                announcementCycleCount = 0;
                advanceRotation(); // Move to next in sequence
            } else {
                showAnnouncements();
            }
        } else {
            showAnnouncements();
        }
    }, 10000);
}

function renderAnnouncement(index) {
    if (index >= announcements.length) return;
    
    const ann = announcements[index];
    console.log(`Showing announcement ${index + 1}/${announcements.length}: ${ann.headline}`);
    
    // Show announcement display
    document.getElementById('announcementDisplay').style.display = 'flex';
    
    // Set content and colors
    document.getElementById('annHeadline').textContent = ann.headline;
    document.getElementById('annHeadline').style.color = ann.headlineColor;
    document.getElementById('annBody').textContent = ann.bodyText;
    document.getElementById('annBody').style.color = ann.bodyColor;
    
    // Type label
    const typeLabel = document.getElementById('annType');
    if (typeLabel) {
        typeLabel.textContent = ann.announcementType || 'SPONSORED';
    }
}

function showNextAnnouncement() {
    if (currentAnnouncementIndex >= announcements.length) {
        // All announcements shown, increment cycle count
        announcementCycleCount++;
        console.log(`Announcement cycle ${announcementCycleCount} complete`);
        checkRotation();
        return;
    }
    
    const ann = announcements[currentAnnouncementIndex];
    console.log(`Showing announcement ${currentAnnouncementIndex + 1}/${announcements.length}: ${ann.headline}`);
    
    // Show announcement display
    document.getElementById('announcementDisplay').style.display = 'flex';
    
    // Set content and colors
    document.getElementById('annHeadline').textContent = ann.headline;
    document.getElementById('annHeadline').style.color = ann.headlineColor;
    
    // Add disclaimer if enabled
    let bodyText = ann.bodyText;
    if (settings.disclaimerEnabled && settings.disclaimerText) {
        bodyText += '\n\n' + settings.disclaimerText;
    }
    
    document.getElementById('annBody').textContent = bodyText;
    document.getElementById('annBody').style.color = ann.bodyColor;
    
    // Reset animation with configurable speed
    const content = document.getElementById('announcementContent');
    content.style.animation = 'none';
    void content.offsetHeight; // Trigger reflow
    
    const scrollSpeed = settings.announcementScrollSpeed || 3;
    const duration = 60 / scrollSpeed; // Calculate duration based on speed
    content.style.animation = `scrollAnnouncementUp ${duration}s linear forwards`;
    
    // Schedule next announcement
    currentAnnouncementIndex++;
    clearTimeout(rotationTimer);
    rotationTimer = setTimeout(showNextAnnouncement, duration * 1000);
}

function showWeather() {
    currentMode = 'weather';
    console.log('Showing weather, cycle:', weatherCycleCount);
    
    // Hide events and announcements
    document.getElementById('eventsScroll').style.display = 'none';
    document.getElementById('announcementDisplay').style.display = 'none';
    
    // Show/create weather iframe
    let weatherFrame = document.getElementById('weatherFrame');
    if (!weatherFrame) {
        weatherFrame = document.createElement('iframe');
        weatherFrame.id = 'weatherFrame';
        weatherFrame.src = '/weather';
        weatherFrame.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;z-index:999;background:#000814;';
        document.body.appendChild(weatherFrame);
    }
    weatherFrame.style.display = 'block';
    
    // Update ticker
    document.getElementById('ticker').textContent = settings.weatherTickerText || '';
    
    // Switch music if enabled
    if (settings.weatherMusicEnabled && settings.weatherPlaylist && settings.weatherPlaylist.length > 0) {
        switchMusic('weather');
    } else {
        stopMusic();
    }
    
    weatherCycleCount++;
    
    // Weather duration: number of screens × screen duration
    const numScreens = [settings.showCurrentConditions, settings.showRegionalObs, settings.showAlmanac].filter(Boolean).length || 3;
    const screenDuration = (settings.screenDuration || 8) * 1000;
    const weatherDuration = numScreens * screenDuration;
    
    clearTimeout(rotationTimer);
    rotationTimer = setTimeout(checkRotation, weatherDuration);
}

function checkRotation() {
    const eventsEnabled = settings.eventsEnabled;
    const weatherEnabled = settings.weatherEnabled;
    const announcementsEnabled = settings.announcementsEnabled;
    const hasEvents = events.length > 0;
    const hasAnnouncements = announcements.length > 0;
    
    // Hide weather frame when leaving weather mode
    const weatherFrame = document.getElementById('weatherFrame');
    if (weatherFrame && currentMode !== 'weather') {
        weatherFrame.style.display = 'none';
    }
    
    // Build list of available modes (enabled AND has content)
    const availableModes = [];
    if (eventsEnabled && hasEvents) availableModes.push('events');
    if (weatherEnabled) availableModes.push('weather');
    if (announcementsEnabled && hasAnnouncements) availableModes.push('announcements');
    
    // If no modes available, stay idle
    if (availableModes.length === 0) {
        console.log('No available modes to display');
        return;
    }
    
    // Determine next mode based on current mode
    if (currentMode === 'events') {
        const eventCycles = settings.eventCycles || 3;
        if (eventCycleCount >= eventCycles) {
            // Events cycle complete, move to next available mode
            console.log(`Event cycles complete (${eventCycleCount}), switching...`);
            eventCycleCount = 0;
            if (weatherEnabled) {
                weatherCycleCount = 0;
                showWeather();
            } else if (announcementsEnabled && hasAnnouncements) {
                announcementCycleCount = 0;
                showAnnouncements();
            } else {
                showEvents();
            }
        } else {
            showEvents();
        }
    } else if (currentMode === 'weather') {
        const weatherCycles = settings.weatherCycles || 2;
        if (weatherCycleCount >= weatherCycles) {
            // Weather cycle complete, move to next available mode
            console.log(`Weather cycles complete (${weatherCycleCount}), switching...`);
            weatherCycleCount = 0;
            if (announcementsEnabled && hasAnnouncements) {
                announcementCycleCount = 0;
                showAnnouncements();
            } else if (eventsEnabled && hasEvents) {
                eventCycleCount = 0;
                showEvents();
            } else {
                showWeather();
            }
        } else {
            showWeather();
        }
    } else {
        // Currently in announcements mode
        const announcementCycles = settings.announcementCycles || 2;
        if (announcementCycleCount >= announcementCycles) {
            // Announcements complete, back to next available mode
            console.log(`Announcement cycles complete (${announcementCycleCount}), switching...`);
            announcementCycleCount = 0;
            if (eventsEnabled && hasEvents) {
                eventCycleCount = 0;
                showEvents();
            } else if (weatherEnabled) {
                weatherCycleCount = 0;
                showWeather();
            } else {
                showAnnouncements();
            }
        } else {
            // Continue with announcements
            currentAnnouncementIndex = 0;
            showNextAnnouncement();
        }
    }
}

/* ── Boot ────────────────────────────────────────────────── */
window.onload = async () => {
    await loadSettings();
    await loadEvents();
    await loadAnnouncements();
    
    updateClock();
    setInterval(updateClock, 1000);
    
    // Start rotation system
    startRotation();
};

// Show weather mode
function showWeather() {
    console.log('Showing weather mode');
    currentMode = 'weather';
    
    if (!settings.weatherEnabled) {
        advanceRotation();
        return;
    }
    
    // Weather displays in iframe/separate window
    // We just track cycles and timing
    switchMusic('weather');
    
    // Weather cycles for configured duration (in minutes)
    const weatherDuration = (settings.weatherCycles || 2) * 60000; // Convert minutes to ms
    
    clearTimeout(rotationTimer);
    rotationTimer = setTimeout(() => {
        console.log('Weather cycle complete');
        weatherCycleCount++;
        advanceRotation();
    }, weatherDuration);
}
