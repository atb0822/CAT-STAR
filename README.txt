================================================================================
                          CAT-STAR 2000 v1.3.30
                    Cable Access Television System
        Scheduled Television Announcements & Reports
================================================================================

Copyright © 2026 Aaron Boone. All Rights Reserved.
GitHub: https://github.com/atb0822/CAT-STAR

================================================================================
TABLE OF CONTENTS
================================================================================

1. OVERVIEW
2. WHAT'S NEW IN v1.3.30
3. SYSTEM FEATURES
4. INSTALLATION GUIDE
5. QUICK START
6. DISPLAY MODES
7. CONFIGURATION
8. WEATHER SYSTEM
9. ANNOUNCEMENT SYSTEM
10. MUSIC SYSTEM
11. BACKUP & RESTORE
12. NETWORK ACCESS
13. TROUBLESHOOTING
14. TECHNICAL SPECIFICATIONS
15. VERSION HISTORY
16. CREDITS & LICENSE

================================================================================
1. OVERVIEW
================================================================================

CAT-STAR 2000 (Cable Access Television - Scheduled Television Announcements & 
Reports) is a professional-grade information display system designed for cable 
access television channels, community information displays, and municipal 
broadcast systems.

The system provides:
- Scrolling community events calendar
- 9-screen professional weather display
- Sponsored announcements rotation
- Customizable display sequences
- Background music playlists
- Network accessibility
- Complete backup/restore functionality

CAT-STAR 2000 recreates the classic aesthetic of community information channels
with modern functionality and ease of use.

================================================================================
2. WHAT'S NEW IN v1.3.30
================================================================================

VERSION 1.3.30 UPDATES:
-----------------------
✅ npm cache clearing on server startup (prevents dependency issues)
✅ Updated all documentation to reflect current version
✅ Added proper credits for fonts and icons (twcclassics.com)
✅ Removed obsolete BUILD_EXE.bat file
✅ Updated QUICK_START guide with comprehensive instructions
✅ README completely rewritten with all recent features
✅ GitHub repository reference added
✅ Copyright and licensing clarified
✅ Version consistency across all files

RECENT FEATURES (v1.3.28-1.3.29):
----------------------------------
✅ Complete backup & restore system
✅ Dynamic rotation order (custom sequences)
✅ Weather screen playlist management
✅ Automatic dependency installation on startup
✅ Support for duplicate items in rotations

================================================================================
3. SYSTEM FEATURES
================================================================================

EVENTS DISPLAY:
---------------
✓ Scrolling community calendar
✓ Two-column layout with borders
✓ Configurable scroll speed (1-10)
✓ Custom display names
✓ Cycle count control
✓ Dedicated music playlist
✓ Events-only display mode

WEATHER DISPLAY (9 SCREENS):
----------------------------
1. Current Conditions - Temperature, humidity, wind, pressure, conditions
2. Latest Observations - Regional cities weather comparison table
3. Extended Forecast - 3-day forecast with weather icons
4. Hourly Forecast - Next 6 hours with detailed conditions
5. Local Forecast - NOAA narrative text forecasts
6. Almanac - Sunrise/sunset, moon phases, astronomical data
7. Travel Forecast - Major cities weather outlook
8. Regional Observations - Geographic display of nearby cities
9. Local Radar - Precipitation radar imagery

Weather Features:
✓ Powered by NOAA/National Weather Service (free, no API key)
✓ Updates every 10 minutes
✓ Customizable screen playlist
✓ Add screens multiple times
✓ Reorder screens as desired
✓ Remove unwanted screens
✓ 46 professional weather icons
✓ 4 moon phase icons
✓ Instant ZIP code lookup (33,647 US codes)
✓ <1ms lookup time (works offline)
✓ 6 regional cities configurable

ANNOUNCEMENTS DISPLAY:
----------------------
✓ Full-screen announcement display
✓ Custom headline colors
✓ Custom body text colors
✓ Scrolling animation
✓ Announcement type labels (SPONSORED, PUBLIC SERVICE, EMERGENCY, etc.)
✓ Start and end dates
✓ Cycle count control
✓ Dedicated music playlist
✓ Announcements-only display mode

DYNAMIC ROTATION SYSTEM:
-------------------------
✓ Custom rotation sequences
✓ Configure in Admin Panel → Feature Display Order
✓ Support for duplicates (show weather twice, events three times, etc.)
✓ Example: ['weather', 'events', 'weather', 'announcements']
✓ Drag-and-drop reordering
✓ Add/remove items freely
✓ Immediate preview in browser console

MUSIC SYSTEM:
-------------
✓ 4 independent playlists:
  - Event Music (plays during events)
  - Weather Music (plays during weather)
  - Announcement Music (plays during announcements)
  - Master Music (overrides all, continuous playback)
✓ MP3 file upload support
✓ Drag-and-drop reordering
✓ Delete individual tracks
✓ Automatic mode switching
✓ Volume control
✓ Enable/disable per playlist

BACKUP & RESTORE:
-----------------
✓ One-click complete system backup
✓ Downloads as .zip file
✓ Includes all settings, events, announcements
✓ Includes uploaded logo
✓ Includes all music playlists
✓ Restore from backup with confirmation
✓ Double confirmation for safety
✓ Automatic page reload after restore

INSTANT ZIP CODE LOOKUP:
-------------------------
✓ 33,647 US ZIP codes in local database
✓ <1 millisecond lookup time
✓ Works completely offline
✓ Auto-populates city, state, coordinates
✓ No external API calls needed
✓ 500-2000x faster than web APIs

================================================================================
4. INSTALLATION GUIDE
================================================================================

SYSTEM REQUIREMENTS:
--------------------
Software:
- Node.js 18.x or higher (download from nodejs.org)
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for weather data only)

Hardware:
- Windows, Linux, or macOS
- 2GB RAM minimum (4GB recommended)
- 500MB free disk space
- Network connection

INSTALLATION STEPS:
-------------------

Step 1: Install Node.js
   Download from: https://nodejs.org/
   Install with default options
   Verify: Open terminal and run "node --version"

Step 2: Extract CAT-STAR 2000
   Extract the ZIP file to your desired location
   Example locations:
   - Windows: C:\CAT-STAR
   - Linux: /home/user/CAT-STAR
   - macOS: /Users/username/CAT-STAR

Step 3: Start the Server
   Windows:
      Double-click START_SERVER.bat
   
   Linux/Mac:
      Open terminal in the folder
      Run: chmod +x START_SERVER_LINUX.sh
      Run: ./START_SERVER_LINUX.sh

   The startup script will:
   1. Check if Node.js is installed
   2. Clear npm cache (prevents issues)
   3. Run "npm install" (installs all dependencies)
   4. Start the CAT-STAR 2000 server

Step 4: Access the System
   Open web browser to: http://localhost:3000/menu

FIRST-TIME SETUP:
-----------------

1. Configure Weather Location:
   Menu → Manage Weather → Enter ZIP code → Lookup → Save

2. Set Channel Information:
   Menu → Admin Panel → Channel name/number → Save

3. Configure Rotation:
   Admin Panel → Feature Display Order → Arrange items → Save

4. Customize Weather Screens:
   Manage Weather → Weather Screen Playlist → Add/remove/reorder → Save

5. Add Content:
   - Manage Events → Add your events
   - Manage Announcements → Add your announcements
   - Admin Panel → Upload logo (optional)
   - Admin Panel → Upload music (optional)

6. Delete Sample Content:
   - Delete sample events (they won't come back)
   - Delete sample announcements (they won't come back)

7. Create First Backup:
   Admin Panel → Backup & Restore → Create Backup

Your system is now configured and ready to use!

================================================================================
5. QUICK START
================================================================================

FASTEST WAY TO GET STARTED:
----------------------------

1. Run START_SERVER.bat (or .sh)
2. Open http://localhost:3000/menu in browser
3. Click "MANAGE WEATHER"
4. Enter your ZIP code → Click "LOOKUP LOCATION" → Click "SAVE"
5. Go back to menu → Click "VIEW LIVE"
6. Your display is running!

The system includes sample events and announcements to show you how it works.
Delete them when you're ready to add your own content.

IMPORTANT URLS:
---------------
Menu:          http://localhost:3000/menu
Admin Panel:   http://localhost:3000/admin
Live Display:  http://localhost:3000/

================================================================================
6. DISPLAY MODES
================================================================================

MAIN ROTATION DISPLAY:
----------------------
URL: http://localhost:3000/
Shows: Rotating events, weather, and announcements
Use: Primary cable channel display
Features: Follows custom rotation order from admin settings

EVENTS-ONLY DISPLAY:
--------------------
URL: http://localhost:3000/events-display
Shows: Community calendar only
Use: Dedicated events channel or lobby display
Features: Continuous event scrolling with music

WEATHER-ONLY DISPLAY:
---------------------
URL: http://localhost:3000/weather
Shows: 9-screen weather system
Use: Dedicated weather channel
Features: All configured weather screens rotating

ANNOUNCEMENTS-ONLY DISPLAY:
---------------------------
URL: http://localhost:3000/announcements-display
Shows: Sponsored announcements only
Use: Dedicated announcements channel
Features: Full-screen announcements with scrolling

NETWORK ACCESS:
---------------
Replace "localhost" with your computer's IP address to access from other 
devices on your network.

Example: http://192.168.1.100:3000/menu

Check Admin Panel → Network Access for your IP addresses.

================================================================================
7. CONFIGURATION
================================================================================

ADMIN PANEL:
------------
Access: http://localhost:3000/admin

Main Settings:
- Channel Name (displayed on all screens)
- Channel Number (displayed on all screens)
- Logo Upload (PNG, JPG, SVG - appears on all screens)
- Ticker Messages (3 separate: events, announcements, master)

Feature Display Order (Rotation):
- Drag items to reorder
- Add items multiple times
- Example: weather, events, weather, announcements
- Click ▲ ▼ to reorder
- Click ✕ to remove
- Click ➕ to add more

Cycle Configuration:
- Event Cycles (number of complete scrolls)
- Announcement Cycles (number of rotations)
- Weather Cycles (minutes to display)

Colors & Styling:
- Event text color
- Event background color
- Border thickness
- Display brightness

Music Playlists (4 independent):
- Event Music
- Weather Music
- Announcement Music
- Master Music (overrides all)

Each playlist:
- Upload MP3 files
- Reorder with ▲ ▼
- Delete individual tracks
- Enable/disable playlist

Network Access:
- Shows all available URLs
- Local and network IP addresses
- Copy-paste ready

Backup & Restore:
- Create complete system backup
- Restore from previous backup
- Double confirmation for safety

WEATHER MANAGER:
----------------
Access: http://localhost:3000/weather-manager

Location Setup:
- ZIP Code Lookup (33,647 US codes, instant results)
- Manual latitude/longitude entry
- City name
- Station name

Weather Screen Playlist:
- Available Screens (left side) - Click ➕ to add
- Active Playlist (right side) - Shows enabled screens
- Reorder with ▲ ▼ buttons
- Remove with ✕ button
- Add screens multiple times
- Minimum 1 screen required

Regional Cities:
- Configure up to 6 cities
- Shows on Latest Observations screen
- City name, latitude, longitude
- Default: 6 Missouri cities
- Add custom cities

Screen Duration:
- Seconds each screen displays (default: 8)

Refresh Interval:
- Minutes between weather data updates (default: 10)

Weather Ticker:
- Custom message at bottom of weather screens

EVENTS MANAGER:
---------------
Access: http://localhost:3000/events

Add Event:
- Date (required)
- Title (required, converts to uppercase)
- Time
- Location
- Description (2-3 lines recommended)

Edit Event:
- Click ✏️ Edit
- Modify fields
- Save changes

Delete Event:
- Click 🗑️ Delete
- Immediate removal

8 sample events included (can be deleted).

ANNOUNCEMENTS MANAGER:
----------------------
Access: http://localhost:3000/announcements

Add Announcement:
- Start Date / End Date
- Headline (converts to uppercase)
- Headline Color (color picker)
- Body Text
- Body Color (color picker)
- Announcement Type (dropdown)

Types available:
- SPONSORED
- PUBLIC SERVICE
- EMERGENCY
- COMMUNITY
- BREAKING NEWS
- SPECIAL EVENT

7 sample announcements included (can be deleted).

================================================================================
8. WEATHER SYSTEM
================================================================================

DATA SOURCE:
------------
Provider: NOAA/National Weather Service
API: points.weather.gov
Cost: Free (no API key required)
Coverage: United States
Update Frequency: Every 10 minutes
Reliability: Official government weather data

9 WEATHER SCREENS:
------------------

1. CURRENT CONDITIONS
   - Large temperature display
   - Current conditions text
   - Humidity, pressure, wind speed/direction
   - Heat index / wind chill
   - Dewpoint
   - Visibility
   - Weather icon

2. LATEST OBSERVATIONS
   - Table of regional cities
   - Temperature comparison
   - Conditions for each city
   - Geographic spread

3. EXTENDED FORECAST
   - 3-day forecast
   - High/low temperatures
   - Day/night conditions
   - Weather icons for each period
   - Detailed forecast text

4. HOURLY FORECAST
   - Next 6 hours
   - Hour-by-hour breakdown
   - Temperature trend
   - Conditions and wind

5. LOCAL FORECAST
   - NOAA narrative forecasts
   - Today, tonight, tomorrow
   - Detailed text descriptions
   - Official government forecasts

6. ALMANAC
   - Sunrise/sunset times
   - Moon phase (current phase icon)
   - Moonrise/moonset
   - Astronomical data

7. TRAVEL FORECAST
   - Major cities forecast
   - Regional outlook
   - Travel conditions

8. REGIONAL OBSERVATIONS
   - Map-style city display
   - Current conditions for nearby cities
   - Geographic layout
   - Temperature comparison

9. LOCAL RADAR
   - Precipitation radar display
   - NOAA radar imagery
   - Local coverage area
   - Real-time updates

WEATHER SCREEN PLAYLIST:
------------------------
Feature: Configure which screens display and in what order

How to Use:
1. Go to Weather Manager
2. Scroll to "Weather Screen Playlist"
3. Left side: Available Screens (9 total)
4. Right side: Active Playlist (your configuration)
5. Click ➕ to add any screen
6. Click ▲ ▼ to reorder
7. Click ✕ to remove (minimum 1 required)
8. Add same screen multiple times
9. Save playlist

Examples:
- Quick weather: [Current Conditions, Extended Forecast, Radar]
- Detailed: All 9 screens
- Current focus: [Current Conditions, Current Conditions, Extended Forecast]

REGIONAL CITIES:
----------------
Default Cities (Missouri):
- Kansas City (39.0997, -94.5786)
- St. Louis (38.6270, -90.1994)
- Springfield (37.2090, -93.2923)
- Kirksville (40.1948, -92.5832)
- Moberly (39.4184, -92.4382)
- Columbia (38.9517, -92.3341)

To Add Custom Cities:
1. Click ➕ ADD CITY
2. Enter city name
3. Enter latitude and longitude
4. Save settings

ZIP CODE LOOKUP:
----------------
Database: 33,647 US ZIP codes
Source: US Census Bureau
Lookup Time: <1 millisecond
Offline: Yes (no internet needed for lookup)

How It Works:
1. Enter 5-digit ZIP code
2. Click "LOOKUP LOCATION"
3. Results appear instantly
4. Auto-fills: city, state, latitude, longitude, station name
5. Click Save

Advantages:
- 500-2000x faster than web APIs
- Works without internet connection
- No rate limits
- No API keys needed
- Instant results

WEATHER ICONS:
--------------
Total Icons: 46 weather condition icons + 4 moon phases
Source: twcclassics.com
Style: Classic Weather Channel aesthetic
Format: Animated GIF

Includes icons for:
- Clear/Sunny
- Partly Cloudy
- Cloudy
- Rain (light, moderate, heavy)
- Snow (light, moderate, heavy)
- Thunderstorms
- Fog
- Windy
- And many more conditions

================================================================================
9. ANNOUNCEMENT SYSTEM
================================================================================

ANNOUNCEMENT TYPES:
-------------------
- SPONSORED: Paid announcements (default for samples)
- PUBLIC SERVICE: Free community service announcements
- EMERGENCY: Urgent community notifications
- COMMUNITY: General community information
- BREAKING NEWS: Time-sensitive news updates
- SPECIAL EVENT: Event promotions

ANNOUNCEMENT FEATURES:
----------------------
✓ Full-screen display
✓ Scrolling text animation
✓ Custom headline color
✓ Custom body text color
✓ Start and end dates
✓ Automatic expiration
✓ Type label display
✓ Optional disclaimer text
✓ Configurable scroll speed
✓ Cycle count control

ADDING ANNOUNCEMENTS:
---------------------
1. Go to Announcements Manager
2. Click "➕ ADD ANNOUNCEMENT"
3. Set start/end dates
4. Enter headline (converts to uppercase)
5. Choose headline color
6. Enter body text
7. Choose body text color
8. Select announcement type
9. Click "ADD ANNOUNCEMENT"

EDITING ANNOUNCEMENTS:
----------------------
1. Click ✏️ EDIT on any announcement
2. Modify fields
3. Click "💾 UPDATE ANNOUNCEMENT"
4. Changes save correctly

Note: v1.3.26 fixed a bug where updates created new announcements instead.

DELETING ANNOUNCEMENTS:
-----------------------
1. Click 🗑️ DELETE on any announcement
2. Immediate removal
3. Changes persist across restarts

SAMPLE ANNOUNCEMENTS:
---------------------
7 samples included:
1. Annual Chili & Soup Supper
2. Family Movie Night in the Park
3. City Council Meeting Notice
4. Youth Baseball Sign-Ups
5. School Early Dismissal
6. Community Blood Drive
7. Lost Dog

All samples are type "SPONSORED". You can delete them and add your own.

DISPLAY BEHAVIOR:
-----------------
- Shows one announcement at a time
- Scrolls text from bottom to top
- Duration: ~10 seconds per announcement
- Rotates through all announcements
- Cycle count controls repetitions
- Music plays during display (if enabled)

================================================================================
10. MUSIC SYSTEM
================================================================================

4 INDEPENDENT PLAYLISTS:
------------------------

1. EVENT MUSIC
   When: During events display
   Purpose: Background music for community calendar
   Location: assets/music/event_music/

2. WEATHER MUSIC
   When: During weather display
   Purpose: Background for weather screens
   Location: assets/music/weather_music/

3. ANNOUNCEMENT MUSIC
   When: During announcements display
   Purpose: Background for sponsored content
   Location: assets/music/announcement_music/

4. MASTER MUSIC (Priority Override)
   When: Always (overrides all others)
   Purpose: Continuous background music
   Location: assets/music/master_music/

UPLOAD MUSIC:
-------------
1. Go to Admin Panel
2. Scroll to desired music section
3. Click "Choose Files"
4. Select one or more MP3 files
5. Click "Upload"
6. Files appear in playlist
7. Save settings

MANAGE PLAYLISTS:
-----------------
- Reorder tracks with ▲ ▼ arrows
- Delete tracks with ✕ button
- Enable/disable entire playlist
- Adjust volume (global setting)

MUSIC SWITCHING:
----------------
Automatic mode switching:
- Events start → Event music begins
- Switch to weather → Weather music begins
- Switch to announcements → Announcement music begins
- Master music enabled → Plays continuously

Note: Bug fixed in v1.3.23 for clean transitions.

SUPPORTED FORMAT:
-----------------
- MP3 files only
- File size: Up to 50MB per file
- Recommended: 128-320 kbps
- Stereo or mono

MUSIC LICENSING:
----------------
Important: Ensure you have proper licensing for any music used in public 
display. CAT-STAR 2000 does not include any music files. You must provide 
your own properly licensed content.

OPTIONS:
- Royalty-free music services
- Licensed music libraries
- Public domain recordings
- Original compositions

================================================================================
11. BACKUP & RESTORE
================================================================================

BACKUP SYSTEM:
--------------
Creates complete system backup as .zip file

What's Included:
✓ data/settings.json (all system settings)
✓ data/events.json (all events)
✓ data/announcements.json (all announcements)
✓ assets/logo/ (uploaded logo)
✓ assets/music/ (all music playlists)
  - event_music/
  - weather_music/
  - announcement_music/
  - master_music/

What's Excluded:
✗ Weather icons (system files)
✗ Fonts (system files)
✗ Program files
✗ Node modules

CREATING A BACKUP:
------------------
1. Go to Admin Panel
2. Scroll to "💾 BACKUP & RESTORE"
3. Click "📦 CREATE BACKUP"
4. Backup downloads automatically
5. Filename: CAT-STAR-backup-YYYY-MM-DD-HHMMSS.zip
6. Save to safe location

Typical Backup Size:
- Empty system: ~1 MB
- With logo: ~2 MB
- With 10 music files: ~30-50 MB
- Fully configured: ~50-100 MB

RESTORING FROM BACKUP:
----------------------
1. Go to Admin Panel
2. Scroll to "💾 BACKUP & RESTORE"
3. Click "📂 SELECT BACKUP FILE"
4. Choose your backup .zip file
5. Filename appears in yellow
6. Click "⚠️ RESTORE BACKUP"
7. First confirmation dialog appears
8. Read warning, click OK
9. Second confirmation dialog appears
10. Click OK to proceed
11. Restoration begins
12. Success message appears
13. Page reloads automatically
14. Restored data is active!

SAFETY FEATURES:
----------------
✓ Double confirmation required
✓ Clear warning messages
✓ Can cancel at any step
✓ File validation
✓ Temporary extraction (safe)
✓ Only replaces on success

USE CASES:
----------
1. Regular Backups
   - Create weekly backups
   - Keep multiple versions
   - Store off-site for safety

2. Before Major Changes
   - Backup before updating
   - Backup before deleting content
   - Easy to restore if needed

3. System Migration
   - Backup on old computer
   - Install CAT-STAR on new computer
   - Restore backup
   - Everything transferred!

4. Multiple Configurations
   - Backup "Summer Schedule"
   - Backup "Winter Schedule"
   - Switch configurations quickly

5. Disaster Recovery
   - Computer failure
   - Reinstall system
   - Restore from backup
   - Back in business!

BACKUP BEST PRACTICES:
----------------------
✓ Create backups before major changes
✓ Weekly backups for active systems
✓ Keep 3-5 recent backups
✓ Store on different drive/computer
✓ Use cloud storage (Google Drive, Dropbox)
✓ Test restore occasionally
✓ Label backups clearly

================================================================================
12. NETWORK ACCESS
================================================================================

ACCESSING FROM OTHER DEVICES:
------------------------------

Your CAT-STAR 2000 server can be accessed from any device on your network.

Step 1: Find Your IP Address
   Method 1: Admin Panel → Network Access section (shows all IPs)
   Method 2: Command line
      Windows: ipconfig
      Linux/Mac: ifconfig

Step 2: Use Your IP Address
   Replace "localhost" with your IP in any URL
   Example: http://192.168.1.100:3000/menu

Step 3: Access From Any Device
   - Other computers on network
   - Tablets
   - Smartphones
   - Smart TVs
   - Any device with web browser

NETWORK URLS:
-------------
Replace YOUR_IP with your actual IP address:

Main Menu:         http://YOUR_IP:3000/menu
Admin Panel:       http://YOUR_IP:3000/admin
Live Display:      http://YOUR_IP:3000/
Events Display:    http://YOUR_IP:3000/events-display
Weather Display:   http://YOUR_IP:3000/weather
Announcements:     http://YOUR_IP:3000/announcements-display

MULTI-DISPLAY SETUP:
--------------------
Run different displays on multiple screens simultaneously:

Display 1: Main rotation (http://YOUR_IP:3000/)
Display 2: Weather only (http://YOUR_IP:3000/weather)
Display 3: Events only (http://YOUR_IP:3000/events-display)
Display 4: Announcements (http://YOUR_IP:3000/announcements-display)

All displays work independently and simultaneously.

FIREWALL CONFIGURATION:
-----------------------
If you can't access from other devices:
1. Check Windows Firewall / Linux firewall
2. Allow port 3000 inbound
3. Or temporarily disable firewall for testing

PORT CONFIGURATION:
-------------------
Default: Port 3000
To change: Edit server.js, line ~11:
   const PORT = process.env.PORT || 3000;

Change 3000 to your desired port.

STATIC IP RECOMMENDATION:
-------------------------
For permanent installations:
1. Configure static IP on server computer
2. Document IP address
3. Use DNS name if available
4. Update displays if IP changes

REMOTE ACCESS:
--------------
From outside your local network:
- Requires port forwarding on router
- Security considerations apply
- Not recommended without proper firewall
- Consider VPN for remote access instead

================================================================================
13. TROUBLESHOOTING
================================================================================

SERVER WON'T START:
-------------------
Symptom: START_SERVER script exits with error
Solutions:
✓ Verify Node.js installed: node --version
✓ Check port 3000 not in use
✓ Run as administrator (Windows)
✓ Check firewall not blocking Node.js
✓ Delete node_modules folder and package-lock.json, restart

CAN'T ACCESS WEB INTERFACE:
---------------------------
Symptom: Browser can't connect to localhost:3000
Solutions:
✓ Verify server is running (console shows "Server running on port 3000")
✓ Try http://127.0.0.1:3000/menu instead
✓ Check firewall settings
✓ Try different browser
✓ Clear browser cache (Ctrl+F5)

BACKUP BUTTON NOT WORKING:
---------------------------
Symptom: Click "CREATE BACKUP" and nothing happens
Solutions:
✓ Run START_SERVER script (auto-installs dependencies)
✓ Or manually: npm install
✓ Check browser console (F12) for errors
✓ Verify archiver and unzipper installed: npm list archiver unzipper

WEATHER MUSIC UPLOAD FAILS:
----------------------------
Symptom: Upload shows error or "No weather music uploaded"
Solutions:
✓ Check assets/music/weather_music/ folder exists
✓ Create folder if missing
✓ Check folder permissions (should be writable)
✓ Try uploading ONE small MP3 first
✓ Check browser console for specific error

REGIONAL CITIES NOT SHOWING:
-----------------------------
Symptom: Weather Manager → Regional Cities is empty
Solutions:
✓ Method 1: Manually add cities
✓ Method 2: Delete data/settings.json and restart
✓ Check settings.json for "regionalCities" array
✓ Default cities should auto-load on first run

ROTATION NOT FOLLOWING ORDER:
------------------------------
Symptom: Display doesn't follow custom rotation sequence
Solutions:
✓ Admin Panel → Save settings
✓ Reload display page (Ctrl+F5)
✓ Check browser console (F12) for: "Starting rotation with sequence..."
✓ Verify settings.json has correct rotationOrder
✓ Close extra browser tabs

CYCLES NOT RESPECTED:
---------------------
Symptom: Wrong number of event/announcement cycles
Solutions:
✓ Admin Panel → Set cycles → Save
✓ Reload display page
✓ Open browser console (F12)
✓ Watch for "Event cycle X complete" messages
✓ Count cycles manually
✓ Clear browser cache

WEATHER NOT LOADING:
--------------------
Symptom: Weather screens show errors or no data
Solutions:
✓ Check internet connection (required for NOAA data)
✓ Verify ZIP code is valid US code
✓ Check coordinates are correct
✓ Try different location
✓ Check browser console for error messages
✓ Wait 10 minutes for first data fetch

MUSIC NOT PLAYING:
------------------
Symptom: No sound from any display
Solutions:
✓ Click anywhere on page (browser requires user interaction)
✓ Check volume settings (browser and system)
✓ Verify MP3 files uploaded successfully
✓ Check music enabled in admin settings
✓ Try different MP3 file
✓ Check browser console for audio errors

DISPLAYS NOT UPDATING:
----------------------
Symptom: Changes don't appear on display pages
Solutions:
✓ Save settings in admin panel
✓ Reload display page (F12 → Network → Disable cache → Reload)
✓ Clear browser cache completely
✓ Close and reopen browser
✓ Restart server
✓ Check browser console for errors

CONSOLE DEBUGGING:
------------------
Browser Console (F12):
- Main display page: Shows rotation messages
- Look for: "Starting rotation with sequence..."
- Check for: "Event cycle X complete"
- Errors appear in red

Server Console:
- Shows server-side messages
- Weather data fetches
- File uploads
- Error messages
- Port information

EMERGENCY FIXES:
----------------
If Nothing Works:
1. Stop server (Ctrl+C)
2. Delete node_modules/ folder
3. Delete package-lock.json
4. Run: npm install
5. Restart server

If Settings Corrupted:
1. Backup data/settings.json (if you want to save)
2. Delete data/settings.json
3. Restart server
4. Reconfigure from scratch

If Everything Broken:
1. Create backup if possible
2. Re-extract CAT-STAR 2000
3. Copy data/ folder from old to new
4. Restart server

LOG FILES:
----------
CAT-STAR doesn't create log files by default.
To create logs:

Windows:
   START_SERVER.bat > logfile.txt 2>&1

Linux/Mac:
   ./START_SERVER_LINUX.sh > logfile.txt 2>&1

================================================================================
14. TECHNICAL SPECIFICATIONS
================================================================================

SOFTWARE REQUIREMENTS:
----------------------
- Node.js: 18.x or higher recommended
- Operating Systems: Windows 10/11, Linux (any modern distro), macOS 10.15+
- Web Browser: Chrome/Edge 90+, Firefox 90+, Safari 14+

HARDWARE REQUIREMENTS:
----------------------
Minimum:
- CPU: Dual-core 2.0 GHz
- RAM: 2 GB
- Storage: 500 MB free space
- Network: 10 Mbps connection

Recommended:
- CPU: Quad-core 2.5 GHz or better
- RAM: 4 GB or more
- Storage: 2 GB free space
- Network: 25 Mbps or faster

SERVER TECHNOLOGY:
------------------
- Platform: Node.js + Express.js
- Port: 3000 (configurable)
- Protocol: HTTP
- Data Storage: JSON files
- File Upload: Multer
- ZIP Operations: archiver, unzipper

DATABASE:
---------
- Format: JSON text files
- Location: data/ directory
- Files:
  - settings.json (~30-50 KB)
  - events.json (~5-20 KB)
  - announcements.json (~10-30 KB)
- ZIP Code Database: CSV (33,647 records, ~2 MB)

PERFORMANCE:
------------
- ZIP Lookup: <1 millisecond
- Weather API: 2-5 seconds (NOAA)
- Screen Transitions: Instant
- Page Load: <500ms (local network)
- Memory Usage: ~50-100 MB
- CPU Usage: <5% idle, <20% active

FILE FORMATS:
-------------
Images:
- Logo: PNG, JPG, GIF, SVG
- Weather Icons: Animated GIF
- Max Size: 10 MB

Audio:
- Music: MP3 only
- Max Size: 50 MB per file
- Recommended: 128-320 kbps

Documents:
- Settings: JSON
- Events: JSON
- Announcements: JSON
- ZIP Codes: CSV

NETWORK:
--------
- Protocol: HTTP
- Port: 3000
- Bandwidth: <1 Mbps typical
- Simultaneous Users: 50+ supported
- No external dependencies (except NOAA weather)

WEATHER DATA:
-------------
- Source: NOAA/NWS API
- Endpoint: api.weather.gov
- Authentication: None required
- Rate Limit: None specified
- Update Interval: 10 minutes (configurable)
- Coverage: United States only

ZIP CODE DATA:
--------------
- Records: 33,647 US ZIP codes
- Source: US Census Bureau
- Format: CSV
- Size: ~2 MB
- Fields: ZIP, city, state, latitude, longitude
- Lookup: In-memory Map structure
- Speed: <1ms per lookup

BROWSER COMPATIBILITY:
----------------------
Full Support:
✓ Chrome 90+ (Windows, macOS, Linux)
✓ Edge 90+ (Windows, macOS)
✓ Firefox 90+ (Windows, macOS, Linux)
✓ Safari 14+ (macOS)

Mobile Support:
✓ Chrome Mobile (Android)
✓ Safari Mobile (iOS)
✓ Responsive design
✓ Touch-friendly

Not Supported:
✗ Internet Explorer (any version)
✗ Very old browsers (pre-2020)

SECURITY:
---------
- No authentication system (local network use)
- No HTTPS by default (can be added)
- File upload validation (type checking)
- No SQL injection risk (no database)
- No user accounts
- No password storage

Recommendations:
- Use on trusted local networks only
- Don't expose directly to internet
- Use firewall to restrict access
- Regular backups recommended
- Keep Node.js updated

================================================================================
15. VERSION HISTORY
================================================================================

VERSION 1.3.30 (February 2026) - CURRENT
-----------------------------------------
✅ npm cache clearing on server startup
✅ Complete documentation rewrite
✅ Font and icon credits added (twcclassics.com)
✅ BUILD_EXE.bat removed (obsolete)
✅ QUICK_START updated and expanded
✅ README completely rewritten
✅ GitHub repository reference added
✅ Copyright clarified throughout
✅ Version consistency across all files
✅ System name standardized: "CAT-STAR 2000"

VERSION 1.3.29 (February 2026)
-------------------------------
✅ Complete backup & restore system
✅ One-click backup creation (.zip download)
✅ Restore from backup with double confirmation
✅ Automatic dependency installation in startup scripts
✅ archiver and unzipper packages added
✅ Comprehensive backup includes all data and assets

VERSION 1.3.28 (February 2026)
-------------------------------
✅ Dynamic rotation order system
✅ Custom rotation sequences from admin panel
✅ Support for duplicate entries in rotation
✅ Weather screen playlist management
✅ Visual playlist editor (add/remove/reorder)
✅ All 9 weather screens available individually
✅ Complete administrative control over display

VERSION 1.3.27 (February 2026)
-------------------------------
✅ Removed duplicate "Enable Weather" checkbox
✅ Regional cities confirmed in defaults
✅ Version consistency updates

VERSION 1.3.26 (February 2026)
-------------------------------
✅ Announcement update bug fixed
✅ Weather music upload functionality restored
✅ Weather header updated (logo display)
✅ Radar imagery implementation
✅ Weather ticker enhanced
✅ Logo migration system
✅ Default logo path corrected

VERSION 1.3.25 (February 2026)
-------------------------------
✅ Weather display unified (9-screen system)
✅ Old basic weather removed
✅ All announcements set to SPONSORED type
✅ 46 weather icons added
✅ Enhanced weather coverage

VERSION 1.3.24 (February 2026)
-------------------------------
✅ Enhanced 9-screen weather system implemented
✅ All weather screens functional
✅ Professional styling applied
✅ Music switching improvements

VERSION 1.3.23 (February 2026)
-------------------------------
✅ Critical music switching bug fixed
✅ Enhanced ZIP code lookup (33,647 codes)
✅ <1ms lookup time implemented
✅ Sample announcements added (7 total)
✅ Save All buttons added throughout

EARLIER VERSIONS (2025-2026)
-----------------------------
- v1.0.0: Initial release
- Community events display
- Basic weather integration
- Announcement system
- Music playlists
- Network accessibility
- Admin panel
- Multiple display modes

FUTURE ROADMAP:
---------------
Potential features under consideration:
- RSS feed integration
- Email notifications
- Schedule planning
- Remote API access
- Mobile app
- Multiple channel support
- Cloud synchronization

================================================================================
16. CREDITS & LICENSE
================================================================================

CAT-STAR 2000 v1.3.30
Cable Access Television - Scheduled Television Announcements & Reports

Developed by: Aaron Boone
Copyright © 2026 Aaron Boone
All Rights Reserved

GitHub Repository: https://github.com/atb0822/CAT-STAR

FONTS & ICONS:
--------------
Weather Icons and Star 3000 Fonts courtesy of:
https://twcclassics.com/

The classic Weather Channel aesthetic and font styling are used with 
appreciation for the nostalgia and professionalism they bring to the system.

WEATHER DATA:
-------------
Source: NOAA/National Weather Service
Website: weather.gov
License: Public Domain (US Government)
Coverage: United States

Weather forecast data is provided by the National Weather Service, 
a division of NOAA. All weather data is in the public domain.

ZIP CODE DATA:
--------------
Source: US Census Bureau
License: Public Domain (US Government)
Records: 33,647 US ZIP codes
Fields: ZIP, city, state, latitude, longitude

ZIP code geographic data provided by the US Census Bureau and is 
in the public domain.

SOFTWARE LICENSE:
-----------------
CAT-STAR 2000 is proprietary software.

Copyright © 2026 Aaron Boone
All Rights Reserved

This software is confidential and proprietary. Unauthorized copying,
distribution, or use of this software, via any medium, is strictly 
prohibited without prior written permission from the copyright holder.

Permission is NOT granted to:
- Copy or redistribute the software
- Modify the source code
- Create derivative works
- Use for commercial purposes without license
- Remove copyright notices

DISCLAIMER:
-----------
THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.

WEATHER DATA DISCLAIMER:
------------------------
Weather forecasts provided by NOAA/NWS may not always be accurate. Users 
should verify critical weather information through official channels. 
CAT-STAR 2000 and its developer are not responsible for any decisions made 
based on weather data displayed by the system.

THIRD-PARTY DEPENDENCIES:
-------------------------
CAT-STAR 2000 uses the following open-source packages:
- Express.js (MIT License)
- Multer (MIT License)
- Archiver (MIT License)
- Unzipper (MIT License)

These packages are automatically installed by npm and retain their 
respective licenses.

ACKNOWLEDGMENTS:
----------------
- NOAA/National Weather Service for weather data
- US Census Bureau for ZIP code data
- twcclassics.com for fonts and icons
- Node.js community for excellent tools
- All users who provide feedback

CONTACT:
--------
For questions, support, or licensing inquiries:
GitHub: https://github.com/atb0822/CAT-STAR

SUPPORT:
--------
Community support available through GitHub Issues.
Please check documentation before requesting support.

================================================================================
END OF README
================================================================================

CAT-STAR 2000 v1.3.30
Copyright © 2026 Aaron Boone. All Rights Reserved.
https://github.com/atb0822/CAT-STAR

Thank you for using CAT-STAR 2000!

================================================================================
