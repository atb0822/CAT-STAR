// Community Calendar — Admin Control Panel

const API = window.location.origin;
let playlist = [];
let announcementPlaylist = [];
let weatherPlaylist = [];
let masterPlaylist = [];
let displayOrder = ['events', 'weather', 'announcements'];
let logoUrl = null;
let customTheme = { bgColor: '#0f1d2e', accentColor: '#ffd700', textColor: '#ffffff' };

/* ── Toast ───────────────────────────────────────────────── */
let toastTimer;
function toast(msg, ms = 2800) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ── API helpers ─────────────────────────────────────────── */
async function apiGet(path)        { const r = await fetch(API+path);                                                          if(!r.ok) throw new Error(r.statusText); return r.json(); }
async function apiPost(path, body) { const r = await fetch(API+path, {method:'POST',  headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}); if(!r.ok) throw new Error(r.statusText); return r.json(); }
async function apiPut(path, body)  { const r = await fetch(API+path, {method:'PUT',   headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}); if(!r.ok) throw new Error(r.statusText); return r.json(); }
async function apiDel(path)        { const r = await fetch(API+path, {method:'DELETE'});                                       if(!r.ok) throw new Error(r.statusText); return r.json(); }

/* ── Load & render events ────────────────────────────────── */
async function loadEvents() {
    try {
        events = await apiGet('/api/events');
        renderEventList();
    } catch(e) { console.error(e); toast('Error loading events'); }
}

function renderEventList() {
    const container = document.getElementById('eventListAdmin');
    events.sort((a,b) => new Date(a.date) - new Date(b.date));

    if (!events.length) {
        container.innerHTML = '<p style="color:#fff;font-size:.9em;">No events yet. <a href="/events" style="color:#fff;">Add events here</a>.</p>';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = events.filter(ev => new Date(ev.date + 'T00:00:00') >= today).slice(0, 5);

    if (upcoming.length === 0) {
        container.innerHTML = '<p style="color:#fff;font-size:.9em;">No upcoming events. <a href="/events" style="color:#fff;">Manage events here</a>.</p>';
        return;
    }

    container.innerHTML = upcoming.map((ev) => {
        const d = new Date(ev.date+'T00:00:00');
        const ds = d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
        return `<div class="event-item">
                    <div>
                        <div class="ev-title">${ev.title}</div>
                        <div class="ev-date">${ds} · ${ev.time} · ${ev.location}</div>
                    </div>
                </div>`;
    }).join('') + 
    `<div style="margin-top:12px;"><a href="/events" style="color:#fff;font-size:.9em;">→ View all events / Add new events</a></div>`;
}

/* ── Settings ────────────────────────────────────────────── */
async function loadSettings() {
    try {
        const s = await apiGet('/api/settings');
        if (s.channelNumber !== undefined) document.getElementById('channelNumberInput').value = s.channelNumber;
        if (s.channelName   !== undefined) document.getElementById('channelNameInput').value   = s.channelName;
        if (s.tickerText    !== undefined) document.getElementById('tickerInput').value        = s.tickerText;
        if (s.scrollSpeed   !== undefined) document.getElementById('scrollSpeed').value        = s.scrollSpeed;
        if (s.autoStart     !== undefined) document.getElementById('autoStart').checked        = s.autoStart;
        if (s.musicEnabled  !== undefined) document.getElementById('musicEnabled').checked     = s.musicEnabled;
        if (s.playlist)                    { playlist = s.playlist; renderPlaylist(); }
        if (s.logoUrl)                     { logoUrl = s.logoUrl; renderLogoPreview(s.logoUrl); }
        if (s.displayBrightness !== undefined) {
            document.getElementById('displayBrightness').value = s.displayBrightness;
            document.getElementById('brightnessValue').textContent = s.displayBrightness + '%';
        }
        if (s.marginTop !== undefined)    document.getElementById('marginTop').value    = s.marginTop;
        if (s.marginBottom !== undefined) document.getElementById('marginBottom').value = s.marginBottom;
        if (s.marginLeft !== undefined)   document.getElementById('marginLeft').value   = s.marginLeft;
        if (s.marginRight !== undefined)  document.getElementById('marginRight').value  = s.marginRight;
        
        // Announcements
        if (s.eventsEnabled !== undefined) document.getElementById('eventsEnabled').checked = s.eventsEnabled;
        if (s.weatherEnabled !== undefined) document.getElementById('weatherEnabled').checked = s.weatherEnabled;
        if (s.announcementsEnabled !== undefined) document.getElementById('announcementsEnabled').checked = s.announcementsEnabled;
        if (s.eventCycles !== undefined) document.getElementById('eventCycles').value = s.eventCycles;
        if (s.weatherCycles !== undefined) document.getElementById('weatherCycles').value = s.weatherCycles;
        if (s.announcementCycles !== undefined) document.getElementById('announcementCycles').value = s.announcementCycles;
        if (s.announcementScrollSpeed !== undefined) document.getElementById('announcementScrollSpeed').value = s.announcementScrollSpeed;
        if (s.eventsDisplayName !== undefined) document.getElementById('eventsDisplayName').value = s.eventsDisplayName;
        if (s.announcementsDisplayName !== undefined) document.getElementById('announcementsDisplayName').value = s.announcementsDisplayName;
        if (s.announcementMusicEnabled !== undefined) document.getElementById('announcementMusicEnabled').checked = s.announcementMusicEnabled;
        if (s.weatherMusicEnabled !== undefined) document.getElementById('weatherMusicEnabled').checked = s.weatherMusicEnabled;
        if (s.announcementPlaylist) { announcementPlaylist = s.announcementPlaylist; renderAnnouncementPlaylist(); }
        if (s.weatherPlaylist) { weatherPlaylist = s.weatherPlaylist; renderWeatherPlaylist(); }
        if (s.masterPlaylist) { masterPlaylist = s.masterPlaylist; renderMasterPlaylist(); }
        if (s.masterMusicEnabled !== undefined) document.getElementById('masterMusicEnabled').checked = s.masterMusicEnabled;
        if (s.rotationOrder && s.rotationOrder.length > 0) { displayOrder = s.rotationOrder; renderDisplayOrder(); }
        if (s.eventBorderThickness !== undefined) document.getElementById('eventBorderThickness').value = s.eventBorderThickness;
        if (s.disclaimerEnabled !== undefined) document.getElementById('disclaimerEnabled').checked = s.disclaimerEnabled;
        if (s.disclaimerText !== undefined) document.getElementById('disclaimerText').value = s.disclaimerText;
        if (s.announcementTickerText !== undefined) document.getElementById('announcementTickerText').value = s.announcementTickerText;
        if (s.weatherTickerText !== undefined) document.getElementById('weatherTickerText').value = s.weatherTickerText;
        if (s.disclaimerColor !== undefined) document.getElementById('disclaimerColor').value = s.disclaimerColor;
        
        // Ticker
        if (s.tickerBgColor !== undefined) document.getElementById('tickerBgColor').value = s.tickerBgColor;
        if (s.tickerTextColor !== undefined) document.getElementById('tickerTextColor').value = s.tickerTextColor;
        if (s.tickerSpeed !== undefined) document.getElementById('tickerSpeed').value = s.tickerSpeed;
        
        if (s.customTheme) {
            customTheme = s.customTheme;
            document.getElementById('customBgColor').value     = customTheme.bgColor     || '#0f1d2e';
            document.getElementById('customAccentColor').value = customTheme.accentColor || '#ffd700';
            document.getElementById('customTextColor').value   = customTheme.textColor   || '#ffffff';
        }
    } catch(e) { console.error(e); }
}

async function saveSettings() {
    const payload = {
        channelNumber: document.getElementById('channelNumberInput').value,
        channelName:   document.getElementById('channelNameInput').value,
        tickerText:    document.getElementById('tickerInput').value,
        scrollSpeed:   parseInt(document.getElementById('scrollSpeed').value) || 0,
        autoStart:     document.getElementById('autoStart').checked,
        musicEnabled:  document.getElementById('musicEnabled').checked,
        displayBrightness: parseInt(document.getElementById('displayBrightness').value) || 100,
        marginTop:     parseInt(document.getElementById('marginTop').value) || 0,
        marginBottom:  parseInt(document.getElementById('marginBottom').value) || 0,
        marginLeft:    parseInt(document.getElementById('marginLeft').value) || 0,
        marginRight:   parseInt(document.getElementById('marginRight').value) || 0,
        eventsEnabled: document.getElementById('eventsEnabled').checked,
        weatherEnabled: document.getElementById('weatherEnabled').checked,
        announcementsEnabled: document.getElementById('announcementsEnabled').checked,
        eventCycles:   parseInt(document.getElementById('eventCycles').value) || 3,
        weatherCycles: parseInt(document.getElementById('weatherCycles').value) || 2,
        announcementCycles: parseInt(document.getElementById('announcementCycles').value) || 2,
        announcementScrollSpeed: parseInt(document.getElementById('announcementScrollSpeed').value) || 3,
        eventsDisplayName: document.getElementById('eventsDisplayName').value || 'Community Calendar',
        announcementsDisplayName: document.getElementById('announcementsDisplayName').value || 'Community Announcements',
        announcementMusicEnabled: document.getElementById('announcementMusicEnabled').checked,
        weatherMusicEnabled: document.getElementById('weatherMusicEnabled').checked,
        eventBorderThickness: parseInt(document.getElementById('eventBorderThickness').value) || 2,
        disclaimerEnabled: document.getElementById('disclaimerEnabled').checked,
        disclaimerText: document.getElementById('disclaimerText').value || 'This message provided as a public service by your local cable access channel.',
        disclaimerColor: document.getElementById('disclaimerColor').value || '#ffffff',
        announcementTickerText: document.getElementById('announcementTickerText').value || '',
        weatherTickerText: document.getElementById('weatherTickerText').value || '',
        tickerBgColor: document.getElementById('tickerBgColor').value,
        tickerTextColor: document.getElementById('tickerTextColor').value,
        tickerSpeed:   parseInt(document.getElementById('tickerSpeed').value) || 30,
        playlist:      playlist,
        announcementPlaylist: announcementPlaylist,
        weatherPlaylist: weatherPlaylist,
        masterPlaylist: masterPlaylist,
        masterMusicEnabled: document.getElementById('masterMusicEnabled').checked,
        rotationOrder: displayOrder,
        logoUrl:       logoUrl,
        customTheme:   customTheme
    };
    try {
        await apiPut('/api/settings', payload);
        toast('Settings saved!');
    } catch(e) { console.error(e); toast('Error saving settings'); }
}

/* ── Colors ──────────────────────────────────────────────── */
function previewColors() {
    customTheme = {
        bgColor:     document.getElementById('customBgColor').value,
        accentColor: document.getElementById('customAccentColor').value,
        textColor:   document.getElementById('customTextColor').value
    };
}

/* ── Import / Export ─────────────────────────────────────── */
async function exportData() {
    try {
        const data = await apiGet('/api/export');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `community_calendar_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast('Exported!');
    } catch(e) { console.error(e); toast('Export failed'); }
}

function downloadCSV() {
    window.location.href = `${API}/api/download/csv`;
    toast('Downloading CSV…');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
            const data = JSON.parse(text);
            await apiPost('/api/import', data);
            toast('Imported successfully!');
            await loadEvents();
            await loadSettings();
        } catch(err) { console.error(err); toast('Import failed — invalid file'); }
    };
    input.click();
}

/* ── Logo Management ─────────────────────────────────────── */
function renderLogoPreview(url) {
    const container = document.getElementById('currentLogo');
    if (url) {
        container.innerHTML = `<div class="logo-preview"><img src="${url}" alt="Current Logo"></div>`;
    } else {
        container.innerHTML = '<p style="color:#fff;font-size:.85em;">No logo uploaded. Channel number will be displayed.</p>';
    }
}

async function uploadLogo() {
    const input = document.getElementById('logoUpload');
    const file = input.files[0];
    
    if (!file) {
        toast('Please select an image file');
        return;
    }
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
        const response = await fetch(`${API}/api/logo/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        logoUrl = result.logoUrl;
        renderLogoPreview(result.logoUrl);
        input.value = '';
        toast('Logo uploaded! Click "SAVE DISPLAY SETTINGS" to apply.');
    } catch(e) {
        console.error(e);
        toast('Error uploading logo');
    }
}

async function removeLogo() {
    if (!confirm('Remove the current logo?')) return;
    
    try {
        await apiDel('/api/logo');
        logoUrl = null;
        renderLogoPreview(null);
        toast('Logo removed! Click "SAVE DISPLAY SETTINGS" to apply.');
    } catch(e) {
        console.error(e);
        toast('Error removing logo');
    }
}

/* ── Network info ────────────────────────────────────────── */
async function loadNetworkInfo() {
    try {
        const info = await apiGet('/api/network-info');
        const box  = document.getElementById('networkInfo');
        box.innerHTML =
            '<span class="label">Access the system from any device on your network:</span><br><br>' +
            info.urls.map(u =>
                `<span class="label">Current Live Display:</span> <a href="${u}" target="_blank">${u}</a><br>` +
                `<span class="label">Events Only:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <a href="${u}/events-display" target="_blank">${u}/events-display</a><br>` +
                `<span class="label">Weather Only:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <a href="${u}/weather" target="_blank">${u}/weather</a><br>` +
                `<span class="label">Announcements Only:</span> <a href="${u}/announcements-display" target="_blank">${u}/announcements-display</a><br>` +
                `<span class="label">Menu:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <a href="${u}/menu" target="_blank">${u}/menu</a><br><br>`
            ).join('');
    } catch(e) { console.error(e); }
}

/* ── Music Management ────────────────────────────────────── */
function renderPlaylist() {
    const container = document.getElementById('playlistContainer');
    if (!playlist || playlist.length === 0) {
        container.innerHTML = '<p style="color:#fff;font-size:.85em;">No music files uploaded yet.</p>';
        return;
    }
    
    container.innerHTML = playlist.map((track, i) => 
        `<div class="music-item">
            <div class="track-name">🎵 ${track}</div>
            <div>
                <button class="btn" onclick="moveTrackUp(${i}, 'event')" ${i === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn" onclick="moveTrackDown(${i}, 'event')" ${i === playlist.length - 1 ? 'disabled' : ''}>▼</button>
                <button class="btn btn-danger" onclick="deleteTrack(${i}, 'event')">✖</button>
            </div>
        </div>`
    ).join('');
}

async function uploadMusic() {
    const input = document.getElementById('musicUpload');
    const files = input.files;
    
    if (!files || files.length === 0) {
        toast('Please select MP3 files to upload');
        return;
    }
    
    const formData = new FormData();
    for (let file of files) {
        if (!file.name.toLowerCase().endsWith('.mp3')) {
            toast('Only MP3 files are supported');
            return;
        }
        formData.append('music', file);
    }
    
    try {
        const response = await fetch(`${API}/api/music/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        playlist = result.playlist;
        renderPlaylist();
        input.value = '';
        toast(`Uploaded ${files.length} file(s)! Enable music & click "SAVE MUSIC"`);
    } catch(e) {
        console.error(e);
        toast('Error uploading music files');
    }
}

async function saveMusicSettings() {
    if (playlist.length > 0 && !document.getElementById('musicEnabled').checked) {
        if (confirm('Enable background music? (You have uploaded files but music is not enabled)')) {
            document.getElementById('musicEnabled').checked = true;
        }
    }
    
    await saveSettings();
    toast('Music settings saved! Reload calendar display to hear music.');
}

function moveTrackUp(type, index) {
    if (index === 0) return;
    const list = type === 'event' ? playlist : type === 'announcement' ? announcementPlaylist : type === 'weather' ? weatherPlaylist : masterPlaylist;
    [list[index], list[index - 1]] = [list[index - 1], list[index]];
    if (type === 'event') renderPlaylist();
    else if (type === 'announcement') renderAnnouncementPlaylist();
    else if (type === 'weather') renderWeatherPlaylist();
    else renderMasterPlaylist();
}

function moveTrackDown(type, index) {
    const list = type === 'event' ? playlist : type === 'announcement' ? announcementPlaylist : type === 'weather' ? weatherPlaylist : masterPlaylist;
    if (index === list.length - 1) return;
    [list[index], list[index + 1]] = [list[index + 1], list[index]];
    if (type === 'event') renderPlaylist();
    else if (type === 'announcement') renderAnnouncementPlaylist();
    else if (type === 'weather') renderWeatherPlaylist();
    else renderMasterPlaylist();
}

async function deleteTrack(type, index) {
    if (!confirm('Delete this track from playlist?')) return;
    
    const list = type === 'event' ? playlist : type === 'announcement' ? announcementPlaylist : type === 'weather' ? weatherPlaylist : masterPlaylist;
    const filename = list[index];
    const endpoint = type === 'event' ? '/api/music/' : type === 'announcement' ? '/api/announcement-music/' : type === 'weather' ? '/api/weather-music/' : '/api/master-music/';
    
    try {
        await apiDel(`${endpoint}${encodeURIComponent(filename)}`);
        list.splice(index, 1);
        if (type === 'event') renderPlaylist();
        else if (type === 'announcement') renderAnnouncementPlaylist();
        else if (type === 'weather') renderWeatherPlaylist();
        else renderMasterPlaylist();
        toast('Track deleted');
    } catch(e) {
        console.error(e);
        toast('Error deleting track');
    }
}

/* ── Announcement Music ──────────────────────────────────── */
function renderAnnouncementPlaylist() {
    const container = document.getElementById('announcementPlaylistContainer');
    if (!announcementPlaylist || announcementPlaylist.length === 0) {
        container.innerHTML = '<p style="color:#fff;font-size:.85em;">No announcement music uploaded yet.</p>';
        return;
    }
    
    container.innerHTML = announcementPlaylist.map((track, i) => 
        `<div class="music-item">
            <div class="track-name">🎵 ${track}</div>
            <div>
                <button class="btn" onclick="moveTrackUp(${i}, 'announcement')" ${i === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn" onclick="moveTrackDown(${i}, 'announcement')" ${i === announcementPlaylist.length - 1 ? 'disabled' : ''}>▼</button>
                <button class="btn btn-danger" onclick="deleteTrack(${i}, 'announcement')">✖</button>
            </div>
        </div>`
    ).join('');
}

async function uploadAnnouncementMusic() {
    const input = document.getElementById('announcementMusicUpload');
    const files = input.files;
    
    if (!files || files.length === 0) {
        toast('Please select MP3 files to upload');
        return;
    }
    
    const formData = new FormData();
    for (let file of files) {
        if (!file.name.toLowerCase().endsWith('.mp3')) {
            toast('Only MP3 files are supported');
            return;
        }
        formData.append('announcementMusic', file);
    }
    
    try {
        const response = await fetch(`${API}/api/announcement-music/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        announcementPlaylist = result.playlist;
        renderAnnouncementPlaylist();
        input.value = '';
        toast(`Uploaded ${files.length} announcement music file(s)!`);
    } catch(e) {
        console.error(e);
        toast('Error uploading announcement music');
    }
}

/* ── Weather Music ──────────────────────────────────────── */
async function uploadWeatherMusic() {
    const input = document.getElementById('weatherMusicUpload');
    if (!input.files.length) {
        showToast('Please select MP3 files');
        return;
    }
    
    showToast('Uploading...');
    
    const formData = new FormData();
    for (let file of input.files) {
        formData.append('weatherMusic', file);
    }
    
    try {
        const response = await fetch(`${API}/api/weather-music/upload`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (response.ok) {
            showToast(`Uploaded ${result.uploaded.length} file(s)`);
            await loadSettings();
        } else {
            showToast('Upload failed');
        }
    } catch(error) {
        showToast('Upload error');
        console.error(error);
    }
    
    input.value = '';
}

function renderWeatherPlaylist() {
    const container = document.getElementById('weatherPlaylistContainer');
    if (!weatherPlaylist || weatherPlaylist.length === 0) {
        container.innerHTML = '<div style="color:#fff;opacity:0.7;padding:10px;">No weather music uploaded</div>';
        return;
    }
    container.innerHTML = weatherPlaylist.map((track, idx) => `
        <div class="music-item">
            <span class="track-name">${track}</span>
            <div>
                <button class="btn" onclick="moveTrackUp('weather', ${idx})">▲</button>
                <button class="btn" onclick="moveTrackDown('weather', ${idx})">▼</button>
                <button class="btn" onclick="deleteTrack('weather', ${idx})">✖</button>
            </div>
        </div>
    `).join('');
}

/* ── Master Music ────────────────────────────────────────── */
async function uploadMasterMusic() {
    const input = document.getElementById('masterMusicUpload');
    if (!input.files.length) {
        showToast('Please select MP3 files');
        return;
    }
    
    showToast('Uploading...');
    
    const formData = new FormData();
    for (let file of input.files) {
        formData.append('masterMusic', file);
    }
    
    try {
        const response = await fetch(`${API}/api/master-music/upload`, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (response.ok) {
            showToast(`Uploaded ${result.uploaded.length} file(s)`);
            await loadSettings();
        } else {
            showToast('Upload failed');
        }
    } catch(error) {
        showToast('Upload error');
        console.error(error);
    }
    
    input.value = '';
}

function renderMasterPlaylist() {
    const container = document.getElementById('masterPlaylistContainer');
    if (!masterPlaylist || masterPlaylist.length === 0) {
        container.innerHTML = '<div style="color:#fff;opacity:0.7;padding:10px;">No master music uploaded</div>';
        return;
    }
    container.innerHTML = masterPlaylist.map((track, idx) => `
        <div class="music-item">
            <span class="track-name">${track}</span>
            <div>
                <button class="btn" onclick="moveTrackUp('master', ${idx})">▲</button>
                <button class="btn" onclick="moveTrackDown('master', ${idx})">▼</button>
                <button class="btn" onclick="deleteTrack('master', ${idx})">✖</button>
            </div>
        </div>
    `).join('');
}

/* ── Display Order ───────────────────────────────────────── */
function renderDisplayOrder() {
    const container = document.getElementById('displayOrderContainer');
    if (!displayOrder || displayOrder.length === 0) {
        container.innerHTML = '<div style="color:#fff;opacity:0.7;padding:10px;">No display order configured</div>';
        return;
    }
    
    const featureNames = {
        'events': '📋 Events',
        'weather': '🌤️ Weather',
        'announcements': '📢 Announcements'
    };
    
    container.innerHTML = displayOrder.map((feature, idx) => `
        <div class="music-item">
            <span class="track-name">${idx + 1}. ${featureNames[feature] || feature}</span>
            <div>
                <button class="btn" onclick="moveDisplayOrderUp(${idx})" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn" onclick="moveDisplayOrderDown(${idx})" ${idx === displayOrder.length - 1 ? 'disabled' : ''}>▼</button>
                <button class="btn" onclick="removeFromDisplayOrder(${idx})">✖</button>
            </div>
        </div>
    `).join('');
}

function addFeatureToOrder() {
    const select = document.getElementById('featureToAdd');
    const feature = select.value;
    displayOrder.push(feature);
    renderDisplayOrder();
}

function moveDisplayOrderUp(index) {
    if (index === 0) return;
    [displayOrder[index], displayOrder[index - 1]] = [displayOrder[index - 1], displayOrder[index]];
    renderDisplayOrder();
}

function moveDisplayOrderDown(index) {
    if (index === displayOrder.length - 1) return;
    [displayOrder[index], displayOrder[index + 1]] = [displayOrder[index + 1], displayOrder[index]];
    renderDisplayOrder();
}

function removeFromDisplayOrder(index) {
    if (confirm('Remove this feature from the sequence?')) {
        displayOrder.splice(index, 1);
        renderDisplayOrder();
    }
}

function resetDisplayOrder() {
    if (confirm('Reset to default order (Events → Weather → Announcements)?')) {
        displayOrder = ['events', 'weather', 'announcements'];
        renderDisplayOrder();
    }
}

/* ── Boot ────────────────────────────────────────────────── */
window.onload = async () => {
    await loadSettings();
    await loadNetworkInfo();
};

// Backup & Restore Functions
let selectedBackupFile = null;

async function createBackup() {
    try {
        showToast('Creating backup...');
        
        const response = await fetch(`${API}/api/backup/create`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to create backup');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        a.download = `CAT-STAR-backup-${timestamp}.zip`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('✓ Backup created and downloaded!');
    } catch (error) {
        console.error('Backup error:', error);
        showToast('✗ Failed to create backup');
    }
}

function handleBackupFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.name.endsWith('.zip')) {
            showToast('✗ Please select a .zip backup file');
            return;
        }
        
        selectedBackupFile = file;
        document.getElementById('backupFileName').textContent = `Selected: ${file.name}`;
        document.getElementById('restoreBtn').disabled = false;
        document.getElementById('restoreBtn').style.opacity = '1';
    }
}

async function confirmRestore() {
    if (!selectedBackupFile) {
        showToast('✗ Please select a backup file first');
        return;
    }
    
    const confirmed = confirm(
        '⚠️ WARNING: This will replace ALL current data!\n\n' +
        'This includes:\n' +
        '- All settings\n' +
        '- All events\n' +
        '- All announcements\n' +
        '- Logo\n' +
        '- Music files\n\n' +
        'Are you sure you want to restore from backup?\n\n' +
        'Click OK to proceed or Cancel to abort.'
    );
    
    if (!confirmed) {
        showToast('Restore cancelled');
        return;
    }
    
    // Double confirmation for safety
    const doubleConfirm = confirm(
        '⚠️ FINAL CONFIRMATION\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Your current data will be permanently replaced.\n\n' +
        'Click OK to restore now.'
    );
    
    if (!doubleConfirm) {
        showToast('Restore cancelled');
        return;
    }
    
    await performRestore();
}

async function performRestore() {
    try {
        showToast('Restoring backup... Please wait...');
        
        const formData = new FormData();
        formData.append('backup', selectedBackupFile);
        
        const response = await fetch(`${API}/api/backup/restore`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to restore backup');
        }
        
        const result = await response.json();
        
        showToast('✓ Backup restored successfully!');
        
        // Clear file selection
        document.getElementById('backupFile').value = '';
        document.getElementById('backupFileName').textContent = '';
        document.getElementById('restoreBtn').disabled = true;
        document.getElementById('restoreBtn').style.opacity = '0.5';
        selectedBackupFile = null;
        
        // Show reload prompt
        setTimeout(() => {
            const reload = confirm(
                'Backup restored successfully!\n\n' +
                'The page will now reload to apply the restored settings.\n\n' +
                'Click OK to reload.'
            );
            if (reload) {
                window.location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Restore error:', error);
        showToast(`✗ Restore failed: ${error.message}`);
    }
}
