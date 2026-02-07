// Announcements Only Display - CAT-STAR 2000 v1.3.20
// Copyright © 2026 Aaron Boone. All Rights Reserved.

const API = window.location.origin;
let announcements = [];
let settings = {};
let currentIndex = 0;

async function loadData() {
    try {
        const [announcementsRes, settingsRes] = await Promise.all([
            fetch(`${API}/api/announcements`),
            fetch(`${API}/api/settings`)
        ]);
        
        announcements = await announcementsRes.json();
        settings = await settingsRes.json();
        
        // Filter active announcements
        const now = new Date();
        announcements = announcements.filter(ann => {
            const start = new Date(ann.startDate);
            const end = new Date(ann.endDate);
            return now >= start && now <= end;
        });
        
        setupDisplay();
        setupTicker();
        setupMusic();
        applyTheme();
        
        if (announcements.length > 0) {
            showNextAnnouncement();
        }
    } catch(error) {
        console.error('Failed to load:', error);
    }
}

function setupDisplay() {
    const displayName = settings.announcementsDisplayName || 'Community Announcements';
    document.getElementById('displayName').textContent = displayName.toUpperCase();
    
    if (!announcements || announcements.length === 0) {
        document.getElementById('announcementContent').innerHTML = '<div style="font-size:2em;">No Active Announcements</div>';
    }
}

function showNextAnnouncement() {
    if (!announcements || announcements.length === 0) return;
    
    const ann = announcements[currentIndex];
    
    // Set content
    document.getElementById('annHeadline').textContent = ann.headline;
    document.getElementById('annHeadline').style.color = ann.headlineColor || '#ff0000';
    
    let bodyText = ann.bodyText;
    
    // Add disclaimer if needed
    if (settings.disclaimerEnabled && settings.disclaimerText && ann.announcementType === 'SPONSORED') {
        bodyText += '\n\n' + settings.disclaimerText;
    }
    
    document.getElementById('annBody').textContent = bodyText;
    document.getElementById('annBody').style.color = ann.bodyColor || '#ffffff';
    
    // Apply animation
    const content = document.getElementById('announcementContent');
    content.style.animation = 'none';
    void content.offsetHeight;
    
    const speed = settings.announcementScrollSpeed || 3;
    const duration = 60 / speed;
    content.style.animation = `scrollAnnouncementUp ${duration}s linear forwards`;
    
    // Next announcement
    currentIndex = (currentIndex + 1) % announcements.length;
    setTimeout(showNextAnnouncement, duration * 1000);
}

function setupTicker() {
    const tickerText = settings.announcementTickerText || '★★★ COMMUNITY ANNOUNCEMENTS ★★★';
    document.getElementById('tickerText').textContent = tickerText;
    
    const ticker = document.getElementById('ticker');
    ticker.style.backgroundColor = settings.tickerBgColor || '#ffffff';
    ticker.style.color = settings.tickerTextColor || '#0000FF';
    
    const speed = settings.tickerSpeed || 5;
    const duration = 60 / speed;
    const style = document.createElement('style');
    style.textContent = `
        @keyframes tickerScroll {
            0% { transform:translateX(0); }
            100% { transform:translateX(-100%); }
        }
        #tickerText {
            animation:tickerScroll ${duration}s linear infinite;
        }
    `;
    document.head.appendChild(style);
}

function setupMusic() {
    const audio = document.getElementById('bgMusic');
    
    // Master music takes priority
    if (settings.masterMusicEnabled && settings.masterPlaylist && settings.masterPlaylist.length > 0) {
        audio.src = `/assets/master_music/${settings.masterPlaylist[0]}`;
        audio.volume = 0.3;
        audio.play().catch(() => {});
    } else if (settings.announcementMusicEnabled && settings.announcementPlaylist && settings.announcementPlaylist.length > 0) {
        audio.src = `/assets/announcement_music/${settings.announcementPlaylist[0]}`;
        audio.volume = 0.3;
        audio.play().catch(() => {});
    }
    
    document.addEventListener('click', () => {
        if (audio.paused) audio.play().catch(() => {});
    }, { once: true });
}

function applyTheme() {
    if (settings.customTheme) {
        document.body.style.backgroundColor = settings.customTheme.bgColor || '#0000FF';
        document.getElementById('announcementsContainer').style.backgroundColor = settings.customTheme.bgColor || '#0000FF';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 5 * 60 * 1000);
});
