// Community Calendar — Events Manager (Secretary Interface)

const API = window.location.origin;
let events = [];
let editingIndex = null;

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
    const container = document.getElementById('eventListContainer');
    events.sort((a,b) => new Date(a.date) - new Date(b.date));

    if (!events.length) {
        container.innerHTML = '<p style="color:#ccc;font-size:.9em;">No events yet. Add your first event above.</p>';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    container.innerHTML = events.map((ev, i) => {
        const d = new Date(ev.date+'T00:00:00');
        const ds = d.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric', year:'numeric'});
        const isPast = d < today;
        const itemClass = editingIndex === i ? 'event-item edit-mode' : 'event-item';
        const pastLabel = isPast ? ' (PAST)' : '';
        
        return `<div class="${itemClass}">
                    <div class="ev-info">
                        <div class="ev-title">${ev.title}${pastLabel}</div>
                        <div class="ev-details">
                            📅 ${ds}<br>
                            ⏰ ${ev.time}<br>
                            📍 ${ev.location}
                        </div>
                        ${ev.description ? `<div class="ev-desc">${ev.description}</div>` : ''}
                    </div>
                    <div class="btn-group">
                        <button class="btn" onclick="editEvent(${i})">✏️ EDIT</button>
                        <button class="btn btn-danger" onclick="deleteEvent(${i})">✖ DELETE</button>
                    </div>
                </div>`;
    }).join('');
}

/* ── Save event (add or update) ──────────────────────────── */
async function saveEvent() {
    const date  = document.getElementById('eventDate').value;
    const title = document.getElementById('eventTitle').value.trim().toUpperCase();
    const time  = document.getElementById('eventTime').value.trim();
    const loc   = document.getElementById('eventLocation').value.trim().toUpperCase();
    const desc  = document.getElementById('eventDescription').value.trim();

    if (!date || !title || !time || !loc) { 
        toast('Fill in Date, Title, Time & Location'); 
        return; 
    }

    const eventData = { date, title, time, location: loc, description: desc };

    try {
        if (editingIndex !== null) {
            // Update existing event
            await apiPut(`/api/events/${editingIndex}`, eventData);
            toast('Event updated!');
        } else {
            // Add new event
            await apiPost('/api/events', eventData);
            toast('Event added!');
        }
        cancelEdit();
        await loadEvents();
    } catch(e) { 
        console.error(e); 
        toast('Error saving event'); 
    }
}

/* ── Edit event ──────────────────────────────────────────── */
function editEvent(index) {
    editingIndex = index;
    const ev = events[index];
    
    document.getElementById('eventDate').value = ev.date;
    document.getElementById('eventTitle').value = ev.title;
    document.getElementById('eventTime').value = ev.time;
    document.getElementById('eventLocation').value = ev.location;
    document.getElementById('eventDescription').value = ev.description || '';
    
    document.getElementById('formTitle').textContent = '✏️ EDIT EVENT';
    document.getElementById('saveBtn').innerHTML = '💾 UPDATE EVENT';
    
    // Re-render to highlight editing item
    renderEventList();
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast('Editing event - update fields and click UPDATE');
}

/* ── Cancel edit ─────────────────────────────────────────── */
function cancelEdit() {
    const wasEditing = editingIndex !== null;
    editingIndex = null;
    
    ['eventDate','eventTitle','eventTime','eventLocation','eventDescription']
        .forEach(id => { document.getElementById(id).value = ''; });
    
    document.getElementById('formTitle').textContent = '➕ ADD NEW EVENT';
    document.getElementById('saveBtn').innerHTML = '➕ ADD EVENT';
    
    if (wasEditing) {
        renderEventList(); // Remove edit highlight
    }
}

/* ── Delete event ────────────────────────────────────────── */
async function deleteEvent(index) {
    if (!confirm('Delete this event?')) return;
    try {
        await apiDel(`/api/events/${index}`);
        toast('Event deleted');
        if (editingIndex === index) cancelEdit();
        await loadEvents();
    } catch(e) { console.error(e); toast('Error deleting event'); }
}

/* ── Remove past events ──────────────────────────────────── */
async function removePastEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pastEvents = events.filter(ev => {
        const d = new Date(ev.date + 'T00:00:00');
        return d < today;
    });
    
    if (pastEvents.length === 0) {
        toast('No past events to remove');
        return;
    }
    
    if (!confirm(`Remove ${pastEvents.length} past event(s)? This cannot be undone!`)) return;
    
    try {
        // Remove past events (work backwards to avoid index issues)
        for (let i = events.length - 1; i >= 0; i--) {
            const d = new Date(events[i].date + 'T00:00:00');
            if (d < today) {
                await apiDel(`/api/events/${i}`);
            }
        }
        toast(`Removed ${pastEvents.length} past event(s)`);
        cancelEdit();
        await loadEvents();
    } catch(e) { 
        console.error(e); 
        toast('Error removing past events'); 
    }
}

/* ── Boot ────────────────────────────────────────────────── */
window.onload = async () => {
    await loadEvents();
    
    // Set default date to today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    document.getElementById('eventDate').value = todayStr;
};
