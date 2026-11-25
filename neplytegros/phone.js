'use strict';

const catalog = {
    browser: { name: 'Prohlížeč', detail: 'Web a vyhledávání' },
    notes: { name: 'Zápisník', detail: 'Poznámky do kapsy' },
    signal: { name: 'Signál', detail: 'Postřehová minihra' }
};
const builtins = { store: 'Obchod', style: 'Tapety' };
const glyphs = {
    store: '<path d="M4 8h16l-1 13H5L4 8Z"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>',
    style: '<circle cx="12" cy="12" r="6"/><ellipse cx="12" cy="12" rx="11" ry="3.5" transform="rotate(-32 12 12)"/>',
    browser: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>',
    notes: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6m-6 4h6m-6 4h3"/>',
    signal: '<path d="M3 13h4l3-8 4 14 3-8 2 2h2"/>'
};
const screenArea = document.querySelector('#screen');
const phoneApps = new Map();
const downloads = new Map();
let current = 'home';
let leaveApp = null;
let toastTimer;
const memory = new Map();

function read(key, fallback) {
    try {
        const value = localStorage.getItem('neplytegros.' + key);
        if (value !== null) return JSON.parse(value);
    } catch {}
    return memory.get(key) ?? fallback;
}
function save(key, value) {
    memory.set(key, value);
    try { localStorage.setItem('neplytegros.' + key, JSON.stringify(value)); }
    catch { notify('Úložiště je nedostupné. Změny platí jen do zavření.'); }
}
function installed() {
    const ids = read('apps', []);
    return Object.keys(catalog).filter(id => Array.isArray(ids) && ids.includes(id));
}
function notify(message) {
    const output = document.querySelector('#message');
    clearTimeout(toastTimer);
    output.textContent = message;
    toastTimer = setTimeout(() => { output.textContent = ''; }, 3200);
}
function icon(id) {
    return '<span class="icon ' + id + '" aria-hidden="true"><svg viewBox="0 0 24 24">' + glyphs[id] + '</svg></span>';
}
function refreshClock() {
    const clock = document.querySelector('.clock time');
    if (!clock) return;
    const now = new Date();
    clock.textContent = now.toLocaleTimeString('cs-CZ', { hour:'2-digit', minute:'2-digit' });
    clock.dateTime = now.toISOString();
    document.querySelector('.date').textContent = now.toLocaleDateString('cs-CZ', { weekday:'long', day:'numeric', month:'long' });
}
function showHome() {
    const ids = [...Object.keys(builtins), ...installed()];
    const apps = ids.map(id => '<button class="launcher" data-open="' + id + '">' + icon(id) + (builtins[id] || catalog[id].name) + '</button>').join('');
    const featured = Object.keys(catalog).find(id => !ids.includes(id));
    const offer = featured ? '<button class="feature" data-open="store">' + icon(featured) + '<span><small>Ke stažení v obchodě</small><strong>' + catalog[featured].name + '</strong></span></button>' : '';
    screenArea.innerHTML = '<div class="home-view"><div class="clock"><time></time><div class="date"></div></div><div class="home-bottom">' + offer + '<div class="app-grid">' + apps + '</div></div></div>';
    refreshClock();
}
function showStore(body) {
    for (const [id, app] of Object.entries(catalog)) {
        const ready = installed().includes(id);
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = icon(id) + '<div class="info"><strong>' + app.name + '</strong><small>' + app.detail + '</small></div><div></div>';
        const controls = row.lastElementChild;
        const button = document.createElement('button');
        button.className = ready ? 'action soft' : 'action';
        button.textContent = ready ? 'Otevřít' : 'Stáhnout';
        button.setAttribute('aria-label', button.textContent + ' · ' + app.name);
        if (ready) button.dataset.open = id;
        else button.onclick = async () => {
            button.disabled = true;
            button.textContent = 'Stahování…';
            try {
                await loadApp(id);
                save('apps', [...new Set([...installed(), id])]);
                if (current === 'store') openScreen('store');
                notify(app.name + ' je na ploše.');
            } catch {
                button.disabled = false;
                button.textContent = 'Zkusit znovu';
                notify('Stažení se nezdařilo.');
            }
        };
        controls.append(button);
        if (ready) {
            const remove = document.createElement('button');
            remove.className = 'small-button';
            remove.textContent = 'Odebrat';
            remove.setAttribute('aria-label', 'Odebrat · ' + app.name);
            remove.onclick = () => {
                save('apps', installed().filter(item => item !== id));
                openScreen('store');
                notify(app.name + ' už není na ploše.');
            };
            row.querySelector('.info').append(remove);
        }
        body.append(row);
    }
}
function showStyles(body) {
    const palettes = [['amber','Jantarová orbita','#ffc780'],['ice','Ledová orbita','#a8daff'],['rose','Růžová orbita','#e8a3ca']];
    body.className = 'palettes';
    for (const [id, name, color] of palettes) {
        const option = document.createElement('button');
        option.className = 'palette';
        option.setAttribute('aria-pressed', String(read('theme','amber') === id));
        option.innerHTML = '<i class="swatch" style="--color:' + color + '"></i>' + name;
        option.onclick = () => {
            save('theme', id);
            drawOrbit(id);
            openScreen('home');
        };
        body.append(option);
    }
}
function loadApp(id) {
    if (phoneApps.has(id)) return Promise.resolve();
    if (!downloads.has(id)) {
        const pending = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'apps/' + id + '.js';
            script.onload = () => phoneApps.has(id) ? resolve() : reject();
            script.onerror = reject;
            document.head.append(script);
        }).finally(() => downloads.delete(id));
        downloads.set(id, pending);
    }
    return downloads.get(id);
}
async function openScreen(id) {
    if (!(id === 'home' || Object.hasOwn(builtins,id) || installed().includes(id))) return;
    if (leaveApp) leaveApp();
    leaveApp = null;
    current = id;
    const title = builtins[id] || catalog[id]?.name || 'Plocha';
    screenArea.setAttribute('aria-label', title);
    screenArea.closest('.glass').classList.toggle('in-app', id !== 'home');
    screenArea.scrollTop = 0;
    if (id === 'home') showHome();
    else {
        screenArea.innerHTML = '<div class="panel"><button class="back" data-open="home">‹ Plocha</button><h1>' + title + '</h1><div id="app-body"></div></div>';
        const body = screenArea.querySelector('#app-body');
        if (id === 'store') showStore(body);
        else if (id === 'style') showStyles(body);
        else {
            try {
                await loadApp(id);
                if (!body.isConnected) return;
                leaveApp = phoneApps.get(id)(body);
            } catch {
                if (body.isConnected) body.innerHTML = '<p>Aplikaci se nepodařilo načíst.</p><button class="action" data-open="' + id + '">Zkusit znovu</button>';
            }
        }
    }
    screenArea.focus({preventScroll:true});
}
screenArea.addEventListener('click', event => {
    const button = event.target.closest('[data-open]');
    if (button) openScreen(button.dataset.open);
});
document.querySelector('#home').onclick = () => openScreen('home');
window.addEventListener('keydown', event => { if (event.key === 'Escape') openScreen('home'); });
drawOrbit(read('theme','amber'));
showHome();
setInterval(refreshClock, 15000);
