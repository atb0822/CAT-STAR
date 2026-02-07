// Community Calendar Server
// Node.js server for network-accessible community calendar

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const multer = require('multer');
const archiver = require('archiver');
const unzipper = require('unzipper');

const app = express();
const PORT = process.env.PORT || 3000;

// ZIP CODE DATA
const zipData = new Map();
const ZIP_CSV_PATH = path.join(__dirname, 'data', 'uszips.csv');

// Load zip code data on startup
function loadZipCodes() {
    if (!fs.existsSync(ZIP_CSV_PATH)) {
        console.warn('uszips.csv not found - zip lookup will use fallback');
        return;
    }
    
    console.log('Loading zip code database...');
    const csvContent = fs.readFileSync(ZIP_CSV_PATH, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length >= 5) {
            const zip = parts[0];
            const lat = parseFloat(parts[1]);
            const lng = parseFloat(parts[2]);
            const city = parts[3];
            const state = parts[5];
            
            if (zip && !isNaN(lat) && !isNaN(lng)) {
                zipData.set(zip, { lat, lng, city, state });
            }
        }
    }
    
    console.log(`Loaded ${zipData.size} zip codes`);
}

// Load zip codes on startup
loadZipCodes();

// Assets directory structure
const ASSETS_DIR = path.join(__dirname, 'assets');
const MUSIC_DIR = path.join(ASSETS_DIR, 'background_music');
const ANNOUNCEMENT_MUSIC_DIR = path.join(ASSETS_DIR, 'announcement_music');
const WEATHER_MUSIC_DIR = path.join(ASSETS_DIR, 'weather_music');
const MASTER_MUSIC_DIR = path.join(ASSETS_DIR, 'master_music');
const LOGO_DIR = path.join(ASSETS_DIR, 'logo');

// Create directories if they don't exist
[ASSETS_DIR, MUSIC_DIR, ANNOUNCEMENT_MUSIC_DIR, WEATHER_MUSIC_DIR, MASTER_MUSIC_DIR, LOGO_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'logo') {
            cb(null, LOGO_DIR);
        } else if (file.fieldname === 'announcementMusic') {
            cb(null, ANNOUNCEMENT_MUSIC_DIR);
        } else if (file.fieldname === 'weatherMusic') {
            cb(null, WEATHER_MUSIC_DIR);
        } else if (file.fieldname === 'masterMusic') {
            cb(null, MASTER_MUSIC_DIR);
        } else {
            cb(null, MUSIC_DIR);
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'logo') {
            const ext = path.extname(file.originalname);
            cb(null, 'logo' + ext);
        } else {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            cb(null, safeName);
        }
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'logo') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for logo'));
            }
        } else {
            if (file.mimetype === 'audio/mpeg' || file.originalname.toLowerCase().endsWith('.mp3')) {
                cb(null, true);
            } else {
                cb(new Error('Only MP3 files are allowed for music'));
            }
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/assets', express.static('assets'));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const CSV_FILE = path.join(DATA_DIR, 'events.csv');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize default data files
function initializeDataFiles() {
    if (!fs.existsSync(EVENTS_FILE)) {
        const defaultEvents = [
            {
                date: '2026-02-10',
                title: 'TOWN COUNCIL MEETING',
                time: '7:00 PM',
                location: 'MUNICIPAL BUILDING',
                description: 'Open to public. Budget discussion and park renovation plans.'
            },
            {
                date: '2026-02-12',
                title: 'LIBRARY BOOK CLUB',
                time: '6:30 PM',
                location: 'PUBLIC LIBRARY',
                description: 'Monthly book discussion. This month: Local history collection.'
            },
            {
                date: '2026-02-15',
                title: 'COMMUNITY BAKE SALE',
                time: '10:00 AM - 2:00 PM',
                location: 'CITY HALL PLAZA',
                description: 'Support your local fire department! Homemade treats available.'
            },
            {
                date: '2026-02-18',
                title: 'YOUTH BASKETBALL TOURNAMENT',
                time: '9:00 AM - 4:00 PM',
                location: 'COMMUNITY CENTER GYM',
                description: 'Annual youth basketball finals. Ages 10-14. Free admission.'
            },
            {
                date: '2026-02-20',
                title: 'SENIOR CENTER LUNCH',
                time: '12:00 PM',
                location: 'SENIOR CENTER',
                description: 'Monthly community lunch for seniors. RSVP by Feb 18.'
            },
            {
                date: '2026-02-22',
                title: 'FARMERS MARKET OPENING DAY',
                time: '8:00 AM - 1:00 PM',
                location: 'DOWNTOWN SQUARE',
                description: 'Season opening! Fresh produce, crafts, and live music.'
            },
            {
                date: '2026-02-25',
                title: 'SCHOOL BOARD MEETING',
                time: '6:00 PM',
                location: 'CENTRAL HIGH SCHOOL',
                description: 'Public meeting. Curriculum updates and facility improvements.'
            },
            {
                date: '2026-02-28',
                title: 'COMMUNITY CLEANUP DAY',
                time: '9:00 AM - 12:00 PM',
                location: 'CITY PARK',
                description: 'Volunteer day! Help clean and beautify our local park.'
            }
        ];
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(defaultEvents, null, 2));
    }
    
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
        const defaultAnnouncements = [
            {
                headline: 'ANNUAL CHILI & SOUP SUPPER',
                bodyText: `Hosted by First Community Church
Friday, October 17th – 5:00 to 7:30 PM

Fellowship Hall
123 Main Street – Central Missouri

Enjoy homemade chili, soups,
desserts, and friendly conversation
with friends and neighbors.

Carry-out meals available.
Donations accepted to support
local youth programs and missions.

For information call:
(573) 555-2741

EVERYONE IS INVITED TO ATTEND`,
                headlineColor: '#ff0000',
                bodyColor: '#ffffff',
                announcementType: 'SPONSORED',
                startDate: '2026-10-01',
                endDate: '2026-10-18'
            },
            {
                headline: 'FAMILY MOVIE NIGHT IN THE PARK',
                bodyText: `Saturday, July 12th – 8:30 PM
Downtown City Park – Centralia

Bring your lawn chairs, blankets,
and the whole family for a free
outdoor showing of a classic
family film under the stars.

Popcorn and refreshments available
courtesy of local community sponsors.

In case of rain, event will be held
at the Community Center Gymnasium.

For more information call:
(573) 555-0199

ALL ARE WELCOME!`,
                headlineColor: '#ff0000',
                bodyColor: '#ffffff',
                announcementType: 'SPONSORED',
                startDate: '2026-07-01',
                endDate: '2026-07-13'
            },
            {
                headline: 'CITY COUNCIL MEETING NOTICE',
                bodyText: `The Centralia City Council will meet
Monday, March 3rd at 7:00 PM at
City Hall, 114 South Rollins Street.

Residents are encouraged to attend
and share comments during the public
discussion portion of the meeting.

Agenda items include street repairs,
park improvements, and budget updates.

For more information call:
(573) 555-1022`,
                headlineColor: '#ffff00',
                bodyColor: '#ffffff',
                announcementType: 'SPONSORED',
                startDate: '2026-02-20',
                endDate: '2026-03-04'
            },
            {
                headline: 'YOUTH BASEBALL SIGN-UPS',
                bodyText: `Registration is now open for
Spring Youth Baseball and Softball
for ages 5 through 14.

Sign-ups will be held Saturday,
February 15th from 9:00 AM to Noon
at the Community Recreation Center.

Please bring proof of age and
registration fee at time of sign-up.

For questions call:
(573) 555-3344`,
                headlineColor: '#00ff00',
                bodyColor: '#ffffff',
                announcementType: 'SPONSORED',
                startDate: '2026-02-01',
                endDate: '2026-02-16'
            },
            {
                headline: 'SCHOOL EARLY DISMISSAL',
                bodyText: `Centralia R-6 Schools will dismiss
students at 1:00 PM on Friday,
April 11th for teacher in-service.

Afternoon bus routes will run
two hours earlier than normal.

Please make arrangements for
student pick-up as needed.

For additional information contact:
Centralia R-6 District Office
(573) 555-2211`,
                headlineColor: '#ff8800',
                bodyColor: '#ffffff',
                announcementType: 'SPONSORED',
                startDate: '2026-04-01',
                endDate: '2026-04-12'
            },
            {
                headline: 'COMMUNITY BLOOD DRIVE',
                bodyText: `You can help save lives by donating
at the Community Blood Drive.

Tuesday, May 6th
1:00 to 6:00 PM
Centralia Community Center

Walk-ins are welcome.
Appointments are encouraged.

Donors must be at least 16 years old
with valid identification.

To schedule a time call:
(573) 555-7788`,
                headlineColor: '#ff0000',
                bodyColor: '#ffffff',
                announcementType: 'SPONSORED',
                startDate: '2026-04-25',
                endDate: '2026-05-07'
            },
            {
                headline: '******** LOST DOG ********',
                bodyText: `Lost: Small brown and white beagle
last seen near Lakeview Park on
Sunday evening.

Dog answers to the name "Buddy"
and is wearing a red collar.

If found, please contact:
(573) 555-9901

Reward offered for safe return.`,
                headlineColor: '#ff0000',
                bodyColor: '#ffff00',
                announcementType: 'SPONSORED',
                startDate: '2026-02-01',
                endDate: '2026-03-01'
            }
        ];
        fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(defaultAnnouncements, null, 2));
    }

    if (!fs.existsSync(SETTINGS_FILE)) {
        const defaultSettings = {
            channelNumber: '17',
            channelName: 'KCAT-17 COMMUNITY ACCESS',
            tickerText: '★★★ TO ADD YOUR COMMUNITY EVENT LISTINGS CALL 555-123-CABLE ★★★ SERVING THE COMMUNITY SINCE 1982 ★★★',
            announcementTickerText: '★★★ TO ADD YOUR COMMUNITY ANNOUNCEMENT CALL 555-123-CABLE ★★★ SERVING THE COMMUNITY SINCE 1982 ★★★',
            weatherTickerText: '★★★ LOCAL WEATHER PROVIDED BY NOAA ★★★ SERVING THE COMMUNITY SINCE 1982 ★★★',
            scrollSpeed: 3,
            autoStart: true,
            musicEnabled: false,
            playlist: [],
            masterMusicEnabled: false,
            masterPlaylist: [],
            rotationOrder: ['events', 'weather', 'announcements'],
            eventsEnabled: true,
            weatherEnabled: false,
            weatherMusicEnabled: false,
            weatherPlaylist: [],
            weatherCycles: 2,
            weatherRefreshMinutes: 10,
            weatherLocation: { lat: 38.9517, lon: -92.3341 },
            cityName: 'Columbia',
            stationName: 'Columbia Regional',
            showCurrentConditions: true,
            showRegionalObs: true,
            showAlmanac: true,
            screenDuration: 8,
            refreshInterval: 10,
            weatherScreens: [
                'currentConditions',
                'latestObservations',
                'extendedForecast',
                'hourlyForecast',
                'localForecast',
                'almanac',
                'travelForecast',
                'regionalObservations',
                'radar'
            ],
            logoUrl: '/assets/logo/sample-logo.png',
            regionalCities: [
                { name: 'Kansas City', lat: 39.0997, lon: -94.5786 },
                { name: 'St. Louis', lat: 38.6270, lon: -90.1994 },
                { name: 'Springfield', lat: 37.2090, lon: -93.2923 },
                { name: 'Kirksville', lat: 40.1948, lon: -92.5832 },
                { name: 'Moberly', lat: 39.4184, lon: -92.4382 },
                { name: 'Columbia', lat: 38.9517, lon: -92.3341 }
            ],
            announcementsEnabled: false,
            eventCycles: 3,
            announcementCycles: 2,
            announcementScrollSpeed: 3,
            eventsDisplayName: 'Community Calendar',
            announcementsDisplayName: 'Community Announcements',
            announcementMusicEnabled: false,
            eventBorderThickness: 2,
            disclaimerEnabled: false,
            disclaimerText: 'This message provided as a public service by your local cable access channel.',
            disclaimerColor: '#ffffff',
            tickerBgColor: '#ffffff',
            tickerTextColor: '#0000FF',
            tickerSpeed: 5,
            announcementPlaylist: [],
            displayBrightness: 100,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            customTheme: {
                bgColor: '#0000FF',
                accentColor: '#ff0000',
                textColor: '#ffffff'
            }
        };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    }

    updateCSV();
}

// Update CSV file from JSON events
function updateCSV() {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        let csvContent = 'Date,Title,Time,Location,Description\n';
        
        events.forEach(event => {
            const row = [
                event.date,
                `"${event.title.replace(/"/g, '""')}"`,
                `"${event.time.replace(/"/g, '""')}"`,
                `"${event.location.replace(/"/g, '""')}"`,
                `"${(event.description || '').replace(/"/g, '""')}"`
            ].join(',');
            csvContent += row + '\n';
        });
        
        fs.writeFileSync(CSV_FILE, csvContent);
    } catch (err) {
        console.error('Error updating CSV:', err);
    }
}

// Serve admin page at /admin (clean URL)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve menu page at /menu
app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

// Serve events manager page at /events
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

// Serve announcements manager page at /announcements
app.get('/announcements', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'announcements.html'));
});

// Serve weather manager page
app.get('/weather-manager', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'weather-manager.html'));
});

// Serve enhanced weather display at /weather (replaces old weather)
app.get('/weather', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'weather-enhanced.html'));
});

// Serve events-only display
app.get('/events-display', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'events-display.html'));
});

// Serve announcements-only display
app.get('/announcements-display', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'announcements-display.html'));
});

// API Routes

// Get all events
app.get('/api/events', (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read events' });
    }
});

// Add event
app.post('/api/events', (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        const newEvent = req.body;
        events.push(newEvent);
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
        updateCSV();
        res.json({ success: true, event: newEvent });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add event' });
    }
});

// Update event
app.put('/api/events/:index', (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        const index = parseInt(req.params.index);
        if (index >= 0 && index < events.length) {
            events[index] = req.body;
            fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
            updateCSV();
            res.json({ success: true, event: events[index] });
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event
app.delete('/api/events/:index', (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        const index = parseInt(req.params.index);
        if (index >= 0 && index < events.length) {
            events.splice(index, 1);
            fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
            updateCSV();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Clear all events
app.delete('/api/events', (req, res) => {
    try {
        fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2));
        updateCSV();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear events' });
    }
});

// Announcements API

// Get all announcements
app.get('/api/announcements', (req, res) => {
    try {
        const announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read announcements' });
    }
});

// Add announcement
app.post('/api/announcements', (req, res) => {
    try {
        const announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
        announcements.push(req.body);
        fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
        res.json({ success: true, announcement: req.body });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add announcement' });
    }
});

// Update announcement
app.put('/api/announcements/:index', (req, res) => {
    try {
        const announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
        const index = parseInt(req.params.index);
        if (index >= 0 && index < announcements.length) {
            announcements[index] = req.body;
            fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
            res.json({ success: true, announcement: req.body });
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

// Delete announcement
app.delete('/api/announcements/:index', (req, res) => {
    try {
        const announcements = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf8'));
        const index = parseInt(req.params.index);
        if (index >= 0 && index < announcements.length) {
            announcements.splice(index, 1);
            fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

// Get settings
app.get('/api/settings', (req, res) => {
    try {
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        
        // Migration: Update old logo.png to sample-logo.png
        if (settings.logoUrl === '/assets/logo/logo.png') {
            settings.logoUrl = '/assets/logo/sample-logo.png';
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        }
        
        // Ensure logoUrl exists
        if (!settings.logoUrl) {
            settings.logoUrl = '/assets/logo/sample-logo.png';
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        }
        
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

// Update settings
app.put('/api/settings', (req, res) => {
    try {
        const settings = req.body;
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Export data
app.get('/api/export', (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        res.json({ events, settings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Import data
app.post('/api/import', (req, res) => {
    try {
        const { events, settings } = req.body;
        if (events) {
            fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
            updateCSV();
        }
        if (settings) {
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to import data' });
    }
});

// Download CSV
app.get('/api/download/csv', (req, res) => {
    try {
        const csvPath = CSV_FILE;
        res.download(csvPath, 'community_calendar.csv');
    } catch (err) {
        res.status(500).json({ error: 'Failed to download CSV' });
    }
});

// Upload logo
app.post('/api/logo/upload', upload.single('logo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const logoUrl = `/assets/logo/${req.file.filename}`;
        
        // Update settings with logo URL
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        settings.logoUrl = logoUrl;
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        res.json({ success: true, logoUrl: logoUrl });
    } catch (err) {
        console.error('Logo upload error:', err);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
});

// Delete logo
app.delete('/api/logo', (req, res) => {
    try {
        // Delete all logo files
        const files = fs.readdirSync(LOGO_DIR);
        files.forEach(file => {
            fs.unlinkSync(path.join(LOGO_DIR, file));
        });
        
        // Remove from settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        settings.logoUrl = null;
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        res.json({ success: true });
    } catch (err) {
        console.error('Logo delete error:', err);
        res.status(500).json({ error: 'Failed to delete logo' });
    }
});

// Upload music files
app.post('/api/music/upload', upload.array('music', 10), (req, res) => {
    try {
        const uploadedFiles = req.files.map(f => f.filename);
        
        // Read current settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        
        // Add new files to playlist (avoid duplicates)
        if (!settings.playlist) settings.playlist = [];
        uploadedFiles.forEach(file => {
            if (!settings.playlist.includes(file)) {
                settings.playlist.push(file);
            }
        });
        
        // Save updated settings
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        res.json({ success: true, uploaded: uploadedFiles, playlist: settings.playlist });
    } catch (err) {
        console.error('Music upload error:', err);
        res.status(500).json({ error: 'Failed to upload music' });
    }
});

// Delete music file
app.delete('/api/music/:filename', (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filepath = path.join(MUSIC_DIR, filename);
        
        // Delete file
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        
        // Remove from playlist in settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        if (settings.playlist) {
            settings.playlist = settings.playlist.filter(f => f !== filename);
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Music delete error:', err);
        res.status(500).json({ error: 'Failed to delete music' });
    }
});

// List music files
app.get('/api/music/list', (req, res) => {
    try {
        const files = fs.existsSync(MUSIC_DIR) 
            ? fs.readdirSync(MUSIC_DIR).filter(f => f.toLowerCase().endsWith('.mp3'))
            : [];
        res.json({ files });
    } catch (err) {
        res.status(500).json({ error: 'Failed to list music' });
    }
});

// Upload announcement music files
app.post('/api/announcement-music/upload', upload.array('announcementMusic', 10), (req, res) => {
    try {
        const uploadedFiles = req.files.map(f => f.filename);
        
        // Read current settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        
        // Add new files to announcement playlist (avoid duplicates)
        if (!settings.announcementPlaylist) settings.announcementPlaylist = [];
        uploadedFiles.forEach(file => {
            if (!settings.announcementPlaylist.includes(file)) {
                settings.announcementPlaylist.push(file);
            }
        });
        
        // Save updated settings
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        res.json({ success: true, uploaded: uploadedFiles, playlist: settings.announcementPlaylist });
    } catch (err) {
        console.error('Announcement music upload error:', err);
        res.status(500).json({ error: 'Failed to upload announcement music' });
    }
});

// Delete announcement music file
app.delete('/api/announcement-music/:filename', (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filepath = path.join(ANNOUNCEMENT_MUSIC_DIR, filename);
        
        // Delete file
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        
        // Remove from playlist in settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        if (settings.announcementPlaylist) {
            settings.announcementPlaylist = settings.announcementPlaylist.filter(f => f !== filename);
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Announcement music delete error:', err);
        res.status(500).json({ error: 'Failed to delete announcement music' });
    }
});

// Weather music upload
app.post('/api/weather-music/upload', upload.array('weatherMusic', 10), (req, res) => {
    try {
        const uploadedFiles = req.files.map(f => f.filename);
        
        // Read current settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        
        // Add new files to weather playlist (avoid duplicates)
        if (!settings.weatherPlaylist) settings.weatherPlaylist = [];
        uploadedFiles.forEach(file => {
            if (!settings.weatherPlaylist.includes(file)) {
                settings.weatherPlaylist.push(file);
            }
        });
        
        // Save updated settings
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        res.json({ success: true, uploaded: uploadedFiles, playlist: settings.weatherPlaylist });
    } catch (err) {
        console.error('Weather music upload error:', err);
        res.status(500).json({ error: 'Failed to upload weather music' });
    }
});

// Delete weather music file
app.delete('/api/weather-music/:filename', (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filepath = path.join(WEATHER_MUSIC_DIR, filename);
        
        // Delete file
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        
        // Remove from playlist in settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        if (settings.weatherPlaylist) {
            settings.weatherPlaylist = settings.weatherPlaylist.filter(f => f !== filename);
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Weather music delete error:', err);
        res.status(500).json({ error: 'Failed to delete weather music' });
    }
});

// Master music upload
app.post('/api/master-music/upload', upload.array('masterMusic', 10), (req, res) => {
    try {
        const uploadedFiles = req.files.map(f => f.filename);
        
        // Read current settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        
        // Add new files to master playlist (avoid duplicates)
        if (!settings.masterPlaylist) settings.masterPlaylist = [];
        uploadedFiles.forEach(file => {
            if (!settings.masterPlaylist.includes(file)) {
                settings.masterPlaylist.push(file);
            }
        });
        
        // Save updated settings
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        
        res.json({ success: true, uploaded: uploadedFiles, playlist: settings.masterPlaylist });
    } catch (err) {
        console.error('Master music upload error:', err);
        res.status(500).json({ error: 'Failed to upload master music' });
    }
});

// Delete master music file
app.delete('/api/master-music/:filename', (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const filepath = path.join(MASTER_MUSIC_DIR, filename);
        
        // Delete file
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        
        // Remove from playlist in settings
        const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        if (settings.masterPlaylist) {
            settings.masterPlaylist = settings.masterPlaylist.filter(f => f !== filename);
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Master music delete error:', err);
        res.status(500).json({ error: 'Failed to delete master music' });
    }
});

// Weather API test endpoint
app.get('/api/weather/test', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.json({ error: 'Latitude and longitude required' });
        }
        
        // Test NOAA API connection
        const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
        const response = await fetch(pointsUrl, {
            headers: { 'User-Agent': 'CAT-STAR-2000/1.3.19' }
        });
        
        if (response.ok) {
            const data = await response.json();
            res.json({ success: true, temperature: 'Connected to NOAA', location: data.properties.relativeLocation.properties.city });
        } else {
            res.json({ error: 'Invalid coordinates or NOAA API error' });
        }
    } catch (error) {
        console.error('Weather test error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Zip code lookup endpoint
app.get('/api/weather/zip-lookup/:zip', async (req, res) => {
    try {
        const zip = req.params.zip;
        
        // Validate zip code
        if (!zip || !/^\d{5}$/.test(zip)) {
            return res.json({ error: 'Invalid zip code format' });
        }
        
        // Check local zip database first (instant!)
        if (zipData.has(zip)) {
            const data = zipData.get(zip);
            return res.json({
                success: true,
                lat: data.lat,
                lon: data.lng,
                city: data.city,
                state: data.state,
                stationName: data.city // Use city name as station
            });
        }
        
        // Fallback to Census Bureau if not in database
        const geoUrl = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${zip}&benchmark=2020&format=json`;
        const response = await fetch(geoUrl);
        const data = await response.json();
        
        if (data.result && data.result.addressMatches && data.result.addressMatches.length > 0) {
            const match = data.result.addressMatches[0];
            const coords = match.coordinates;
            const addressParts = match.matchedAddress.split(',');
            
            res.json({
                success: true,
                lat: parseFloat(coords.y.toFixed(4)),
                lon: parseFloat(coords.x.toFixed(4)),
                city: addressParts[0].trim(),
                state: addressParts[1].trim(),
                stationName: addressParts[0].trim()
            });
        } else {
            res.json({ error: 'Zip code not found' });
        }
    } catch(error) {
        console.error('Zip lookup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get network info
app.get('/api/network-info', (req, res) => {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push({
                    name: name,
                    address: iface.address
                });
            }
        }
    }
    
    res.json({
        port: PORT,
        addresses: addresses,
        urls: addresses.map(a => `http://${a.address}:${PORT}`)
    });
});

// Initialize
initializeDataFiles();

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n====================================');
    console.log('Community Calendar Server Started!');
    console.log('====================================\n');
    console.log(`Local access: http://localhost:${PORT}`);
    console.log('\nNetwork access from other devices:');
    
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log(`  http://${iface.address}:${PORT}`);
            }
        }
    }
    
    console.log('\n====================================');
    console.log('Press Ctrl+C to stop the server');
    console.log('====================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down server...');
    server.close(() => {
        console.log('Server stopped.');
        process.exit(0);
    });
});

module.exports = app;

// Backup & Restore Endpoints

// Create backup
app.post('/api/backup/create', async (req, res) => {
    try {
        console.log('Creating backup...');
        
        // Set headers for zip download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `CAT-STAR-backup-${timestamp}.zip`;
        
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Create zip archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });
        
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            res.status(500).json({ error: 'Failed to create backup' });
        });
        
        // Pipe archive to response
        archive.pipe(res);
        
        // Add data files
        if (fs.existsSync(SETTINGS_FILE)) {
            archive.file(SETTINGS_FILE, { name: 'data/settings.json' });
        }
        if (fs.existsSync(EVENTS_FILE)) {
            archive.file(EVENTS_FILE, { name: 'data/events.json' });
        }
        if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
            archive.file(ANNOUNCEMENTS_FILE, { name: 'data/announcements.json' });
        }
        
        // Add assets directory (logo, music)
        const assetsDir = path.join(__dirname, 'assets');
        if (fs.existsSync(assetsDir)) {
            archive.directory(assetsDir, 'assets');
        }
        
        // Finalize archive
        await archive.finalize();
        
        console.log('Backup created successfully');
        
    } catch (error) {
        console.error('Backup creation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to create backup' });
        }
    }
});

// Restore from backup
app.post('/api/backup/restore', upload.single('backup'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No backup file uploaded' });
        }
        
        console.log('Restoring from backup:', req.file.originalname);
        
        const backupPath = req.file.path;
        const tempDir = path.join(__dirname, 'temp_restore');
        
        // Create temp directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });
        
        // Extract backup
        await fs.createReadStream(backupPath)
            .pipe(unzipper.Extract({ path: tempDir }))
            .promise();
        
        // Restore data files
        const backupDataDir = path.join(tempDir, 'data');
        if (fs.existsSync(backupDataDir)) {
            // Restore settings.json
            const backupSettings = path.join(backupDataDir, 'settings.json');
            if (fs.existsSync(backupSettings)) {
                fs.copyFileSync(backupSettings, SETTINGS_FILE);
                console.log('Restored settings.json');
            }
            
            // Restore events.json
            const backupEvents = path.join(backupDataDir, 'events.json');
            if (fs.existsSync(backupEvents)) {
                fs.copyFileSync(backupEvents, EVENTS_FILE);
                updateCSV(); // Update CSV file
                console.log('Restored events.json');
            }
            
            // Restore announcements.json
            const backupAnnouncements = path.join(backupDataDir, 'announcements.json');
            if (fs.existsSync(backupAnnouncements)) {
                fs.copyFileSync(backupAnnouncements, ANNOUNCEMENTS_FILE);
                console.log('Restored announcements.json');
            }
        }
        
        // Restore assets
        const backupAssetsDir = path.join(tempDir, 'assets');
        const targetAssetsDir = path.join(__dirname, 'assets');
        
        if (fs.existsSync(backupAssetsDir)) {
            // Remove existing assets (except weather icons which are system files)
            const logoDir = path.join(targetAssetsDir, 'logo');
            if (fs.existsSync(logoDir)) {
                fs.rmSync(logoDir, { recursive: true, force: true });
            }
            
            const musicDir = path.join(targetAssetsDir, 'music');
            if (fs.existsSync(musicDir)) {
                fs.rmSync(musicDir, { recursive: true, force: true });
            }
            
            // Copy backup assets
            copyRecursiveSync(backupAssetsDir, targetAssetsDir);
            console.log('Restored assets');
        }
        
        // Clean up
        fs.unlinkSync(backupPath);
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        console.log('Backup restored successfully');
        res.json({ success: true, message: 'Backup restored successfully' });
        
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: 'Failed to restore backup: ' + error.message });
    }
});

// Helper function to copy directory recursively
function copyRecursiveSync(src, dest) {
    if (!fs.existsSync(src)) return;
    
    const exists = fs.existsSync(dest);
    const stats = fs.statSync(src);
    const isDirectory = stats.isDirectory();
    
    if (isDirectory) {
        if (!exists) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName)
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}
