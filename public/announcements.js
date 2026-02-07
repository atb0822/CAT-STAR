// Community Calendar — Announcements Manager

const API = window.location.origin;
let announcements = [];
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

/* ── Color preview ───────────────────────────────────────── */
function updateColorPreview(type) {
    if (type === 'headline') {
        const color = document.getElementById('headlineColor').value;
        document.getElementById('headlineColorPreview').style.background = color;
    } else {
        const color = document.getElementById('bodyColor').value;
        document.getElementById('bodyColorPreview').style.background = color;
    }
}

/* ── Load & render announcements ─────────────────────────── */
async function loadAnnouncements() {
    try {
        announcements = await apiGet('/api/announcements');
        renderAnnouncementList();
    } catch(e) { console.error(e); toast('Error loading announcements'); }
}

function renderAnnouncementList() {
    const container = document.getElementById('announcementListContainer');
    announcements.sort((a,b) => new Date(a.startDate) - new Date(b.startDate));

    if (!announcements.length) {
        container.innerHTML = '<p style="color:#ccc;font-size:.9em;">No announcements yet. Add your first announcement above.</p>';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    container.innerHTML = announcements.map((ann, i) => {
        const start = new Date(ann.startDate+'T00:00:00');
        const end = new Date(ann.endDate+'T00:00:00');
        const startStr = start.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
        const endStr = end.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
        const isExpired = end < today;
        const isActive = start <= today && end >= today;
        const itemClass = editingIndex === i ? 'announcement-item edit-mode' : 'announcement-item';
        
        let status = '';
        if (isExpired) status = ' <span style="color:#b54545;">(EXPIRED)</span>';
        else if (isActive) status = ' <span style="color:#4a4;">(ACTIVE)</span>';
        else status = ' <span style="color:#aaa;">(SCHEDULED)</span>';
        
        return `<div class="${itemClass}">
                    <div class="ann-info">
                        <div class="ann-headline" style="color:${ann.headlineColor};">${ann.headline}${status}</div>
                        <div class="ann-dates">${startStr} → ${endStr}</div>
                        <div class="ann-body" style="color:${ann.bodyColor};">${ann.bodyText}</div>
                    </div>
                    <div class="btn-group">
                        <button class="btn" onclick="editAnnouncement(${i})">✏️ EDIT</button>
                        <button class="btn btn-danger" onclick="deleteAnnouncement(${i})">✖ DELETE</button>
                    </div>
                </div>`;
    }).join('');
}

/* ── Save announcement (add or update) ───────────────────── */
async function saveAnnouncement() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const headline = document.getElementById('headline').value.trim().toUpperCase();
    const headlineColor = document.getElementById('headlineColor').value;
    const bodyColor = document.getElementById('bodyColor').value;
    const bodyText = document.getElementById('bodyText').value.trim();
    const announcementType = document.getElementById('announcementType')?.value || 'SPONSORED';

    if (!startDate || !endDate || !headline || !bodyText) { 
        toast('Fill in all required fields'); 
        return; 
    }

    if (new Date(endDate) < new Date(startDate)) {
        toast('End date must be after start date');
        return;
    }

    const announcementData = { 
        startDate, endDate, headline, headlineColor, bodyColor, bodyText, announcementType
    };

    try {
        if (editingIndex !== null) {
            await apiPut(`/api/announcements/${editingIndex}`, announcementData);
            toast('Announcement updated!');
        } else {
            await apiPost('/api/announcements', announcementData);
            toast('Announcement added!');
        }
        cancelEdit();
        await loadAnnouncements();
    } catch(e) { 
        console.error(e); 
        toast('Error saving announcement'); 
    }
}

/* ── Edit announcement ────────────────────────────────────── */
function editAnnouncement(index) {
    editingIndex = index;
    const ann = announcements[index];
    
    document.getElementById('startDate').value = ann.startDate;
    document.getElementById('endDate').value = ann.endDate;
    document.getElementById('headline').value = ann.headline;
    document.getElementById('headlineColor').value = ann.headlineColor;
    document.getElementById('bodyColor').value = ann.bodyColor;
    document.getElementById('bodyText').value = ann.bodyText;
    if (document.getElementById('announcementType')) {
        document.getElementById('announcementType').value = ann.announcementType || 'SPONSORED';
    }
    
    updateColorPreview('headline');
    updateColorPreview('body');
    
    document.getElementById('formTitle').textContent = '✏️ EDIT ANNOUNCEMENT';
    document.getElementById('saveBtn').innerHTML = '💾 UPDATE ANNOUNCEMENT';
    
    renderAnnouncementList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast('Editing announcement - update fields and click UPDATE');
}

/* ── Cancel edit ─────────────────────────────────────────── */
function cancelEdit() {
    const wasEditing = editingIndex !== null;
    editingIndex = null;
    
    ['startDate','endDate','headline','headlineColor','bodyColor','bodyText']
        .forEach(id => { 
            const el = document.getElementById(id);
            if (el.tagName === 'SELECT') {
                el.selectedIndex = 0;
            } else {
                el.value = ''; 
            }
        });
    
    updateColorPreview('headline');
    updateColorPreview('body');
    
    document.getElementById('formTitle').textContent = '➕ ADD NEW ANNOUNCEMENT';
    document.getElementById('saveBtn').innerHTML = '➕ ADD ANNOUNCEMENT';
    
    if (wasEditing) {
        renderAnnouncementList();
    }
}

/* ── Delete announcement ──────────────────────────────────── */
async function deleteAnnouncement(index) {
    if (!confirm('Delete this announcement?')) return;
    try {
        await apiDel(`/api/announcements/${index}`);
        toast('Announcement deleted');
        if (editingIndex === index) cancelEdit();
        await loadAnnouncements();
    } catch(e) { console.error(e); toast('Error deleting announcement'); }
}

/* ── Remove expired announcements ─────────────────────────── */
async function removeExpired() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expired = announcements.filter(ann => {
        const end = new Date(ann.endDate + 'T00:00:00');
        return end < today;
    });
    
    if (expired.length === 0) {
        toast('No expired announcements to remove');
        return;
    }
    
    if (!confirm(`Remove ${expired.length} expired announcement(s)? This cannot be undone!`)) return;
    
    try {
        for (let i = announcements.length - 1; i >= 0; i--) {
            const end = new Date(announcements[i].endDate + 'T00:00:00');
            if (end < today) {
                await apiDel(`/api/announcements/${i}`);
            }
        }
        toast(`Removed ${expired.length} expired announcement(s)`);
        cancelEdit();
        await loadAnnouncements();
    } catch(e) { 
        console.error(e); 
        toast('Error removing expired announcements'); 
    }
}

/* ── Boot ────────────────────────────────────────────────── */
window.onload = async () => {
    await loadAnnouncements();
    
    // Set default start date to today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    document.getElementById('startDate').value = todayStr;
    
    // Set default end date to 30 days from now
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 30);
    const futureStr = futureDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = futureStr;
    
    // Initialize color previews
    updateColorPreview('headline');
    updateColorPreview('body');
};
