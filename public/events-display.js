// Events Only Display - CAT-STAR 2000 v1.3.20
// Copyright © 2026 Aaron Boone. All Rights Reserved.

const API = window.location.origin;
let events = [];
let settings = {};

async function loadData() {
    try {
        const [eventsRes, settingsRes] = await Promise.all([
            fetch(`${API}/api/events`),
            fetch(`${API}/api/settings`)
        ]);
        
        events = await eventsRes.json();
        settings = await settingsRes.json();
        
        renderEvents();
        setupTicker();
        setupMusic();
        applyTheme();
    } catch(error) {
        console.error('Failed to load:', error);
    }
}

function renderEvents() {
    const container = document.getElementById('scrollingEvents');
    const displayName = settings.eventsDisplayName || 'Community Calendar';
    document.getElementById('displayName').textContent = displayName.toUpperCase();
    
    if (!events || events.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:100px;font-size:2em;">No Events Scheduled</div>';
        return;
    }
    
    const borderThickness = settings.eventBorderThickness || 2;
    
    container.innerHTML = events.map(event => `
        <div class="event-item" style="border-width:${borderThickness}px;">
            <div class="event-meta" style="border-right-width:${borderThickness}px;">
                <div class="event-date">${event.date}</div>
                <div class="event-time">${event.time}</div>
                ${event.location ? `<div class="event-location">${event.location}</div>` : ''}
            </div>
            <div class="event-content">
                <div class="event-title">${event.title}</div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    // Set scroll speed
    const speed = settings.scrollSpeed || 3;
    const duration = 60 / speed;
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scrollUp {
            0% { transform:translateY(100%); }
            100% { transform:translateY(-100%); }
        }
        #scrollingEvents {
            animation:scrollUp ${duration}s linear infinite;
        }
    `;
    document.head.appendChild(style);
}

function setupTicker() {
    const tickerText = settings.tickerText || '★★★ COMMUNITY EVENTS ★★★';
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
    } else if (settings.musicEnabled && settings.playlist && settings.playlist.length > 0) {
        audio.src = `/assets/background_music/${settings.playlist[0]}`;
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
        document.getElementById('eventsContainer').style.backgroundColor = settings.customTheme.bgColor || '#0000FF';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 5 * 60 * 1000);
});
