'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   CatBot Panel — client application
   Vanilla ES2020, no build step. Renders pages from real API data only.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Icons (Lucide-style strokes) ─────────────────────────────────────────── */
const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    scroll: '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    server: '<rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><line x1="6" y1="7" x2="6.01" y2="7"/><line x1="6" y1="17" x2="6.01" y2="17"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    chevron: '<polyline points="6 9 12 15 18 9"/>',
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    panel: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    reset: '<path d="M3 2v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L3 8"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    tag: '<path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
    plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    door: '<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4a2 2 0 0 0-2 2v14"/>',
};

function icon(name, attrs = '') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${ICONS[name] || ''}</svg>`;
}

/* ── Navigation model ─────────────────────────────────────────────────────── */
const SERVER_NAV = [
    { group: 'Servidor', items: [
        { page: 'overview',    label: 'Resumen',    icon: 'grid' },
        { page: 'general',     label: 'General',     icon: 'sliders' },
        { page: 'welcome',     label: 'Bienvenidas', icon: 'megaphone' },
        { page: 'logs',        label: 'Registros',   icon: 'scroll' },
        { page: 'autorole',    label: 'Auto-rol',    icon: 'user-plus' },
    ]},
    { group: 'Módulos', items: [
        { page: 'leveling',    label: 'Nivelación',  icon: 'trending' },
        { page: 'economy',     label: 'Economía',    icon: 'coins' },
        { page: 'tickets',     label: 'Tickets',     icon: 'ticket' },
        { page: 'moderation',  label: 'Moderación',  icon: 'shield' },
        { page: 'automod',     label: 'Automod',     icon: 'shield-check' },
    ]},
];

const BOT_NAV = [
    { group: 'Bot', items: [
        { page: 'commands',    label: 'Comandos',    icon: 'terminal' },
        { page: 'status',      label: 'Estado',      icon: 'activity' },
    ]},
];

const OWNER_NAV = [
    { group: 'Administración', items: [
        { page: 'admin-stats',     label: 'Estadísticas', icon: 'chart' },
        { page: 'admin-servers',   label: 'Servidores',   icon: 'server' },
        { page: 'admin-blacklist', label: 'Blacklist',    icon: 'ban' },
    ]},
];

const TITLES = {
    'no-guild': 'Inicio',
    overview: 'Resumen',
    general: 'General',
    welcome: 'Bienvenidas',
    logs: 'Registros',
    autorole: 'Auto-rol',
    leveling: 'Nivelación',
    economy: 'Economía',
    tickets: 'Tickets',
    moderation: 'Moderación',
    automod: 'Automod',
    commands: 'Comandos',
    status: 'Estado',
    'admin-stats': 'Estadísticas',
    'admin-servers': 'Servidores',
    'admin-blacklist': 'Blacklist',
};

const SERVER_PAGES = new Set([
    'overview', 'general', 'welcome', 'logs', 'autorole',
    'leveling', 'economy', 'tickets', 'moderation', 'automod',
]);

const CATEGORY_LABELS = {
    fun: 'Diversión', activities: 'Actividades', moderation: 'Moderación',
    utility: 'Utilidad', config: 'Configuración', misc: 'Otros',
};

const PERMISSION_LABELS = {
    Administrator: 'Administrador', ManageGuild: 'Gestionar servidor',
    ManageRoles: 'Gestionar roles', ManageChannels: 'Gestionar canales',
    ManageMessages: 'Gestionar mensajes', ManageNicknames: 'Gestionar apodos',
    ManageWebhooks: 'Gestionar webhooks', KickMembers: 'Expulsar miembros',
    BanMembers: 'Banear miembros', ModerateMembers: 'Moderar miembros',
    TimeoutMembers: 'Aplicar timeout', MentionEveryone: 'Mencionar @everyone',
};

/* Events the bot actually writes to the configured log channel */
const LOGGED_EVENTS = [
    { icon: 'users',      label: 'Entrada de miembros' },
    { icon: 'door',       label: 'Salida de miembros' },
    { icon: 'tag',        label: 'Cambios de nombre o roles' },
    { icon: 'ban',        label: 'Baneos y desbaneos' },
    { icon: 'scroll',     label: 'Mensajes eliminados' },
    { icon: 'scroll',     label: 'Mensajes editados' },
    { icon: 'hash',       label: 'Canales creados o modificados' },
    { icon: 'hash',       label: 'Canales eliminados' },
    { icon: 'tag',        label: 'Roles creados o modificados' },
    { icon: 'tag',        label: 'Roles eliminados' },
    { icon: 'zap',        label: 'Emojis creados o eliminados' },
    { icon: 'arrow',      label: 'Invitaciones creadas o eliminadas' },
    { icon: 'server',     label: 'Cambios del servidor' },
    { icon: 'activity',   label: 'Entradas y salidas de voz' },
];

/* ── State ────────────────────────────────────────────────────────────────── */
const state = {
    me: null,
    guilds: [],
    guild: null,
    info: null,
    cfg: null,
    status: null,
    page: null,
    commands: null,
    timers: [],
    pollTimer: null,
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const content = () => $('#content');

/* ── Utilities ────────────────────────────────────────────────────────────── */
const nf = new Intl.NumberFormat('es-ES');
const df = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function relTime(value) {
    if (!value) return '—';
    const diff = Date.now() - new Date(value).getTime();
    if (Number.isNaN(diff)) return '—';
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.round(hours / 24);
    if (days < 30) return `hace ${days} d`;
    return df.format(new Date(value));
}

async function api(path, opts = {}) {
    const res = await fetch(path, {
        credentials: 'same-origin',
        headers: opts.body ? { 'Content-Type': 'application/json' } : {},
        ...opts,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (res.status === 401) {
        location.reload();
        throw new Error('Sesión expirada');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
}

async function patchCfg(guildId, patch) {
    const res = await api(`/api/guilds/${guildId}/config`, { method: 'PATCH', body: patch });
    if (state.guild && state.guild.id === guildId) state.cfg = { ...state.cfg, ...patch };
    return res;
}

const val = (id) => $('#' + id)?.value?.trim() || null;

/* ── Toasts ───────────────────────────────────────────────────────────────── */
const TOAST_ICONS = { ok: 'check-circle', err: 'alert', info: 'info' };

function toast(type, title, detail) {
    const host = $('#toasts');
    if (!host) return;
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.innerHTML =
        icon(TOAST_ICONS[type] || 'info') +
        `<div class="toast-text"><strong>${esc(title)}</strong>${detail ? `<span>${esc(detail)}</span>` : ''}</div>`;
    node.insertAdjacentHTML('beforeend', '<i class="toast-bar" style="animation-duration:4s"></i>');
    host.appendChild(node);

    const remove = () => {
        if (!node.isConnected) return;
        node.classList.add('leaving');
        setTimeout(() => node.remove(), 200);
    };
    node.addEventListener('click', remove);
    setTimeout(remove, 4000);
    while (host.children.length > 4) host.firstElementChild.remove();
}

const toastOk   = (title, detail) => toast('ok', title, detail);
const toastErr  = (title, detail) => toast('err', title, detail);
const toastInfo = (title, detail) => toast('info', title, detail);

/* ── Dialogs ──────────────────────────────────────────────────────────────── */
let lastFocused = null;

function openDialog(id, focusSelector) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    lastFocused = document.activeElement;
    dialog.hidden = false;
    const target = focusSelector ? $(focusSelector, dialog) : null;
    (target || $('button, [href], input, select, textarea', dialog))?.focus();
}

function closeDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    if (lastFocused && lastFocused.isConnected) lastFocused.focus();
}

document.addEventListener('keydown', (event) => {
    const open = $$('.dialog:not([hidden])').pop();
    if (!open) return;
    if (event.key === 'Escape') {
        event.preventDefault();
        if (open.id === 'confirm-dialog') resolveConfirm(false);
        else closeDialog(open.id);
        return;
    }
    if (event.key !== 'Tab') return;
    const focusables = $$('button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', open)
        .filter(node => node.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

$$('[data-close-dialog]').forEach(node =>
    node.addEventListener('click', () => {
        const dialog = node.closest('.dialog');
        if (dialog.id === 'confirm-dialog') resolveConfirm(false);
        else closeDialog(dialog.id);
    })
);

/* Confirmation dialog — replaces window.confirm() */
let confirmResolve = null;

function confirmDialog({ title, message, confirmLabel = 'Confirmar', danger = true }) {
    const dialog = $('#confirm-dialog');
    $('#confirm-title').textContent = title;
    $('#confirm-desc').textContent = message;
    const ok = $('#confirm-ok');
    ok.textContent = confirmLabel;
    ok.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
    $('#confirm-icon').innerHTML = icon(danger ? 'alert' : 'info');
    openDialog('confirm-dialog', '#confirm-cancel');
    return new Promise(resolve => { confirmResolve = resolve; });
}

function resolveConfirm(value) {
    const resolve = confirmResolve;
    confirmResolve = null;
    closeDialog('confirm-dialog');
    resolve?.(value);
}

/* ── Button busy state ────────────────────────────────────────────────────── */
async function withBusy(button, task, busyLabel) {
    if (!button || button.classList.contains('is-busy')) return;
    const original = button.innerHTML;
    button.classList.add('is-busy');
    button.disabled = true;
    if (busyLabel) button.innerHTML = `<span class="spinner"></span>${esc(busyLabel)}`;
    else button.insertAdjacentHTML('afterbegin', '<span class="spinner"></span>');
    try {
        await task();
    } catch (error) {
        toastErr('No se pudo completar la acción', error.message);
    } finally {
        button.classList.remove('is-busy');
        button.disabled = false;
        button.innerHTML = original;
    }
}

/* ── Page primitives ──────────────────────────────────────────────────────── */
function panelHead(title, subtitle, actions = '') {
    return `<div class="panel-head"><div><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>${actions ? `<div class="panel-actions">${actions}</div>` : ''}</div>`;
}

function settingRow({ title, desc, control, stack = false }) {
    return `<div class="setting-row${stack ? ' stack' : ''}">
        <div class="setting-info">
            <div class="setting-title">${esc(title)}</div>
            ${desc ? `<div class="setting-desc">${desc}</div>` : ''}
        </div>
        <div class="setting-control">${control}</div>
    </div>`;
}

function toggleControl(id, checked, describedBy = '') {
    return `<label class="toggle"><input type="checkbox" id="${id}"${checked ? ' checked' : ''}${describedBy ? ` aria-describedby="${describedBy}"` : ''}><span class="track"></span></label>`;
}

function stateBlock({ icon: name = 'inbox', title, text, action = '', variant = '' }) {
    return `<div class="state ${variant}">
        <span class="state-icon">${icon(name)}</span>
        <h3>${esc(title)}</h3>
        ${text ? `<p>${esc(text)}</p>` : ''}
        ${action}
    </div>`;
}

function avatar(user, cls = 'av') {
    if (user?.avatar) return `<img class="${cls}" src="${esc(user.avatar)}" alt="" loading="lazy">`;
    const initials = (user?.username || '?').slice(0, 2).toUpperCase();
    return `<span class="${cls}-ph">${esc(initials)}</span>`;
}

function userCell(user) {
    return `<span class="user-cell">${avatar(user)}<span class="who"><span class="who-name">${esc(user.username)}</span><span class="who-id">${esc(user.userId)}</span></span></span>`;
}

function channelOptions(selected, { emptyLabel = 'Sin configurar', list, marker = '#' } = {}) {
    const channels = list || state.info?.channels || [];
    const options = [`<option value="">${esc(emptyLabel)}</option>`];
    for (const channel of channels) {
        options.push(`<option value="${esc(channel.id)}"${channel.id === selected ? ' selected' : ''}>${marker}${esc(channel.name)}</option>`);
    }
    if (!channels.length) options.push('<option value="" disabled>Sin canales disponibles</option>');
    return options.join('');
}

function roleOptions(selected) {
    const roles = state.info?.roles || [];
    const options = [`<option value="">Sin configurar</option>`];
    for (const role of roles) {
        options.push(`<option value="${esc(role.id)}"${role.id === selected ? ' selected' : ''}>${esc(role.name)}</option>`);
    }
    if (!roles.length) options.push('<option value="" disabled>Sin roles disponibles</option>');
    return options.join('');
}

function emptyTable(colspan, text) {
    return `<tr><td colspan="${colspan}" style="text-align:center;padding:32px;color:var(--fg-dim)">${esc(text)}</td></tr>`;
}

function requireGuildPage() {
    return stateBlock({
        title: 'Selecciona un servidor',
        text: 'Usa el selector de la barra lateral para gestionar un servidor.',
        action: '<button type="button" class="btn btn-outline" data-open-guilds>Seleccionar servidor</button>',
    });
}

/* ── Boot ─────────────────────────────────────────────────────────────────── */
async function boot() {
    bindShell();
    let me;
    try {
        me = await api('/auth/me');
    } catch {
        $('.login-note').textContent = 'No se pudo contactar con el servidor del panel. Recarga la página en unos segundos.';
        $('#login-page').classList.add('visible');
        return;
    }
    if (!me.user) {
        $('#login-page').classList.add('visible');
        return;
    }

    state.me = me.user;
    $('#app').classList.add('ready');

    const avatarImg = $('#sb-av');
    const avatarPh = $('#sb-av-ph');
    if (state.me.avatarUrl) {
        avatarImg.src = state.me.avatarUrl;
        avatarImg.hidden = false;
        avatarPh.hidden = true;
    } else {
        avatarPh.textContent = state.me.username.slice(0, 2).toUpperCase();
    }
    $('#sb-uname').textContent = state.me.username;
    $('#sb-usub').textContent = state.me.isOwner ? 'Propietario del bot' : 'Administrador';
    if (state.me.isOwner) $('#sb-role').hidden = false;

    await loadGuilds();
    renderNav();
    renderServerSwitch();
    refreshStatus();

    // Page-independent: lives outside state.timers so navigation never clears it
    state.pollTimer = setInterval(refreshStatus, 60000);

    window.addEventListener('hashchange', () => {
        const page = routeFromHash();
        if (page && page !== state.page) navigate(page);
    });

    const initial = routeFromHash() || (state.me.isOwner && !state.guild ? 'admin-stats' : state.guild ? 'overview' : 'no-guild');
    if (routeFromHash()) location.replace(`#/${initial}`);
    navigate(initial);
}

function routeFromHash() {
    const raw = location.hash.replace(/^#\/?/, '').trim();
    return raw || null;
}

/* ── Shell wiring ─────────────────────────────────────────────────────────── */
function bindShell() {
    $('#menu-btn').addEventListener('click', () => setDrawer(true));
    $('#sidebar-scrim').addEventListener('click', () => setDrawer(false));
    $('#collapse-btn').addEventListener('click', () => setRail(!document.body.classList.contains('rail')));
    $('#server-switch').addEventListener('click', openGuildDialog);
    $('#status-pill').href = '#/status';

    if (localStorage.getItem('catbot.rail') === '1' && window.matchMedia('(min-width: 901px)').matches) {
        document.body.classList.add('rail');
        syncCollapseButton();
    }

    $('#guild-search').addEventListener('input', renderGuildList);
    $('#confirm-cancel').addEventListener('click', () => resolveConfirm(false));
    $('#confirm-ok').addEventListener('click', () => resolveConfirm(true));
}

function setDrawer(open) {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    if (!isMobile) return;
    document.body.classList.toggle('drawer-open', open);
    $('#sidebar-scrim').hidden = !open;
    $('#menu-btn').setAttribute('aria-expanded', String(open));
}

function setRail(collapsed) {
    document.body.classList.toggle('rail', collapsed);
    localStorage.setItem('catbot.rail', collapsed ? '1' : '0');
    syncCollapseButton();
}

function syncCollapseButton() {
    const collapsed = document.body.classList.contains('rail');
    const btn = $('#collapse-btn');
    btn.setAttribute('aria-pressed', String(collapsed));
    btn.title = collapsed ? 'Expandir barra lateral' : 'Contraer barra lateral';
    btn.setAttribute('aria-label', btn.title);
    btn.style.transform = collapsed ? 'rotate(180deg)' : '';
}

async function refreshStatus() {
    try {
        const status = await api('/api/status');
        state.status = status;
        const pill = $('#status-pill');
        const label = $('#status-text');
        if (!status.online) {
            pill.dataset.state = 'down';
            label.textContent = 'Bot desconectado';
        } else if (status.database !== 'conectada') {
            pill.dataset.state = 'warn';
            label.textContent = `Ping ${status.ping} ms`;
        } else {
            pill.dataset.state = 'ok';
            label.textContent = `Operativo · ${status.ping} ms`;
        }
    } catch {
        $('#status-pill').dataset.state = 'down';
        $('#status-text').textContent = 'Sin conexión';
    }
}

/* ── Guild picker ─────────────────────────────────────────────────────────── */
async function loadGuilds() {
    try {
        state.guilds = await api('/api/guilds');
    } catch {
        state.guilds = [];
    }
}

function openGuildDialog() {
    renderGuildList();
    openDialog('guild-dialog', '#guild-search');
}

function renderGuildList() {
    const list = $('#guild-list');
    const query = ($('#guild-search')?.value || '').toLowerCase().trim();
    const guilds = state.guilds.filter(g => g.name.toLowerCase().includes(query));

    if (!state.guilds.length) {
        list.innerHTML = stateBlock({
            icon: 'server',
            title: 'Sin servidores disponibles',
            text: 'No encontramos servidores donde tengas el permiso de gestión. Invita a CatBot a un servidor desde su página de Discord.',
        });
        return;
    }
    if (!guilds.length) {
        list.innerHTML = stateBlock({ icon: 'search', title: 'Sin resultados', text: `Ningún servidor coincide con “${query}”.` });
        return;
    }

    list.innerHTML = guilds.map(guild => {
        const active = state.guild?.id === guild.id;
        const icon = guild.icon
            ? `<span class="guild-icon"><img src="${esc(guild.icon)}" alt=""></span>`
            : `<span class="guild-icon">${esc(guild.name.slice(0, 2).toUpperCase())}</span>`;
        const sub = guild.botPresent ? 'CatBot está en el servidor' : 'CatBot no está en el servidor';
        return `<button type="button" class="guild-item${active ? ' active' : ''}" data-guild="${esc(guild.id)}">
            ${icon}
            <span class="guild-info">
                <span class="guild-name">${esc(guild.name)}</span>
                <span class="guild-sub">${esc(sub)}</span>
            </span>
            ${active ? icon2('check') : ''}
        </button>`;
    }).join('');

    $$('#guild-list [data-guild]').forEach(node => {
        node.addEventListener('click', () => selectGuild(node.dataset.guild));
    });
}

function icon2(name) {
    return `<span class="dim" style="display:grid">${icon(name, 'width="15" height="15"')}</span>`;
}

async function selectGuild(guildId) {
    const guild = state.guilds.find(g => g.id === guildId);
    if (!guild) return;
    if (!guild.botPresent) {
        closeDialog('guild-dialog');
        toastErr('CatBot no está en ese servidor', 'Invítalo desde la página de Discord del bot y vuelve a intentarlo.');
        return;
    }

    const ok = await withBusyReturn(() => api(`/api/guilds/${guildId}/info`));
    if (!ok.ok) {
        closeDialog('guild-dialog');
        toastErr('No se pudo leer el servidor', ok.error.message);
        return;
    }

    state.guild = guild;
    state.info = ok.data;
    state.cfg = await api(`/api/guilds/${guildId}/config`).catch(() => null);
    closeDialog('guild-dialog');
    setDrawer(false);
    renderNav();
    renderServerSwitch();

    const target = routeFromHash();
    navigate(SERVER_PAGES.has(target) ? target : 'overview');
}

async function withBusyReturn(task) {
    try {
        return { ok: true, data: await task() };
    } catch (error) {
        return { ok: false, error };
    }
}

function renderServerSwitch() {
    const iconHost = $('#ss-icon');
    if (!state.guild) {
        iconHost.textContent = state.guilds.length ? '·' : '?';
        $('#ss-name').textContent = 'Seleccionar servidor';
        $('#ss-meta').textContent = state.guilds.length ? `${state.guilds.length} disponibles` : 'Sin servidores';
        return;
    }
    iconHost.innerHTML = state.guild.icon
        ? `<img src="${esc(state.guild.icon)}" alt="">`
        : esc(state.guild.name.slice(0, 2).toUpperCase());
    $('#ss-name').textContent = state.guild.name;
    const members = state.info?.memberCount;
    $('#ss-meta').textContent = typeof members === 'number' ? `${nf.format(members)} miembros` : 'Configuración del servidor';
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function renderNav() {
    const groups = [];
    if (state.guild) groups.push(...SERVER_NAV);
    groups.push(...BOT_NAV);
    if (state.me?.isOwner) groups.push(...OWNER_NAV);

    $('#sidebar-nav').innerHTML = groups.map(group => `
        <div class="nav-label">${esc(group.group)}</div>
        ${group.items.map(item => `
            <button type="button" class="nav-item" data-page="${item.page}" data-tip="${esc(item.label)}">
                ${icon(item.icon)}<span class="nav-text">${esc(item.label)}</span>
            </button>`).join('')}
    `).join('');

    $$('#sidebar-nav .nav-item').forEach(node =>
        node.addEventListener('click', () => { location.hash = `#/${node.dataset.page}`; })
    );
    markActive(state.page);
}

function markActive(page) {
    $$('#sidebar-nav .nav-item').forEach(node =>
        node.classList.toggle('active', node.dataset.page === page)
    );
}

/* ── Router ───────────────────────────────────────────────────────────────── */
const PAGES = {};

async function navigate(page) {
    state.timers.forEach(clearInterval);
    state.timers = [];

    if (!TITLES[page]) page = 'no-guild';
    if (SERVER_PAGES.has(page) && !state.guild) page = 'no-guild';
    if (page.startsWith('admin-') && !state.me?.isOwner) page = state.guild ? 'overview' : 'no-guild';

    state.page = page;
    markActive(page);

    const title = TITLES[page];
    document.title = `${title} · CatBot`;
    $('#crumbs').innerHTML =
        `<span class="crumb-root">CatBot</span><span class="crumb-sep">/</span>` +
        (state.guild && SERVER_PAGES.has(page)
            ? `<span class="crumb-root">${esc(state.guild.name)}</span><span class="crumb-sep">/</span>`
            : '') +
        `<span class="crumb-cur">${esc(title)}</span>`;

    const host = content();
    host.innerHTML = '<div class="page-loading"><span class="spinner"></span></div>';
    document.body.classList.remove('drawer-open');
    $('#sidebar-scrim').hidden = true;

    try {
        const html = await PAGES[page]();
        host.innerHTML = `<div class="content-inner"><div class="page">${html}</div></div>`;
        bindPageLinks();
        PAGES[`${page}:init`]?.();
    } catch (error) {
        host.innerHTML = `<div class="content-inner"><div class="page">${stateBlock({
            icon: 'alert',
            variant: 'is-error',
            title: 'No se pudo cargar la página',
            text: error.message,
            action: '<button type="button" class="btn btn-outline" data-reload>Reintentar</button>',
        })}</div></div>`;
        bindPageLinks();
    }
    host.focus({ preventScroll: true });
}

function bindPageLinks() {
    $$('[data-open-guilds]').forEach(node => node.addEventListener('click', openGuildDialog));
    $$('[data-reload]').forEach(node => node.addEventListener('click', () => navigate(state.page)));
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGES
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Landing (no server selected) ─────────────────────────────────────────── */
PAGES['no-guild'] = async () => `
    ${stateBlock({
        icon: 'server',
        title: 'Selecciona un servidor para empezar',
        text: state.guilds.length
            ? `Tienes ${nf.format(state.guilds.length)} servidor${state.guilds.length === 1 ? '' : 'es'} donde puedes gestionar CatBot.`
            : 'No encontramos servidores donde tengas el permiso de gestión.',
        action: state.guilds.length
            ? '<button type="button" class="btn btn-primary" data-open-guilds>Elegir servidor</button>'
            : '',
    })}
`;

/* ── Overview ─────────────────────────────────────────────────────────────── */
PAGES.overview = async () => {
    const guildId = state.guild.id;
    const [cfg, warns, leaderboard, tickets] = await Promise.all([
        api(`/api/guilds/${guildId}/config`),
        api(`/api/guilds/${guildId}/warns`),
        api(`/api/guilds/${guildId}/leaderboard`),
        api(`/api/guilds/${guildId}/tickets`).catch(() => []),
    ]);
    state.cfg = cfg;

    const automod = await api(`/api/guilds/${guildId}/automod`).catch(() => ({}));
    const activeWarns = warns.filter(w => (w.warns?.length || 0) > 0);
    const totalWarns = activeWarns.reduce((acc, w) => acc + w.warns.length, 0);
    const openTickets = tickets.filter(t => t.status === 'open');

    const modules = [
        { name: 'Nivelación',  desc: 'Los miembros ganan XP por actividad.',  on: cfg.levelingEnabled !== false, page: 'leveling', onText: 'Activa', offText: 'Inactiva' },
        { name: 'Bienvenidas', desc: 'Mensaje al unirse un nuevo miembro.',   on: !!cfg.welcomeChannel && !!cfg.welcomeMessage, page: 'welcome', onText: 'Configurada', offText: 'Sin configurar' },
        { name: 'Registros',   desc: 'Eventos de moderación en un canal.',    on: !!cfg.logsChannel, page: 'logs', onText: 'Activos', offText: 'Inactivo' },
        { name: 'Auto-rol',    desc: 'Rol aplicado al entrar un miembro.',    on: !!cfg.autoRole, page: 'autorole', onText: 'Configurado', offText: 'Inactivo' },
        { name: 'Automod',     desc: 'Filtros de enlaces, invites y spam.',   on: automod.enabled === true, page: 'automod', onText: 'Activo', offText: 'Inactivo' },
    ];

    const pending = modules.filter(m => !m.on);

    const moduleRows = modules.map(m => settingRow({
        title: m.name,
        desc: m.desc,
        control: `<a class="btn btn-sm btn-outline" href="#/${m.page}">Configurar</a>`,
    })).join('');

    const top = leaderboard.slice(0, 5);
    const topRows = top.length
        ? top.map((user, index) => `<tr>
              <td class="rank${index < 3 ? ' top' : ''}">${index + 1}</td>
              <td>${userCell(user)}</td>
              <td class="num"><span class="badge badge-info">Nv ${user.level}</span></td>
              <td class="num strong">${nf.format(user.xp)}</td>
            </tr>`).join('')
        : emptyTable(4, 'Todavía no hay experiencia acumulada.');

    return `
        <div class="page-head">
            <div>
                <h1>${esc(state.guild.name)}</h1>
                <p>Estado del servidor y de los módulos de CatBot.</p>
            </div>
            <div class="page-actions">
                <button type="button" class="btn btn-outline" id="ov-refresh">${icon('refresh')}Actualizar</button>
            </div>
        </div>

        <div class="grid-4">
            <div class="stat"><span class="stat-label">Miembros</span><span class="stat-value">${nf.format(state.info?.memberCount || 0)}</span></div>
            <div class="stat"><span class="stat-label">Advertencias</span><span class="stat-value">${nf.format(totalWarns)}</span><span class="stat-sub">${activeWarns.length} con historial</span></div>
            <div class="stat"><span class="stat-label">Canales de texto</span><span class="stat-value">${nf.format(state.info?.channels?.length || 0)}</span></div>
            <div class="stat"><span class="stat-label">Tickets abiertos</span><span class="stat-value">${nf.format(openTickets.length)}</span><span class="stat-sub">${tickets.length} en total</span></div>
        </div>

        <div class="split">
            <div class="panel">
                ${panelHead('Nivelación', 'Los 5 miembros con más experiencia')}
                <div class="table-wrap"><table class="data">
                    <thead><tr><th>#</th><th>Miembro</th><th style="text-align:right">Nivel</th><th style="text-align:right">XP</th></tr></thead>
                    <tbody>${topRows}</tbody>
                </table></div>
                <div class="panel-foot"><a class="btn btn-sm btn-ghost" href="#/leveling">Ver clasificación completa ${icon('arrow')}</a></div>
            </div>

            <div class="panel">
                ${panelHead('Requiere atención', pending.length ? `${pending.length} módulo${pending.length === 1 ? '' : 's'} sin configurar` : 'Todo configurado')}
                <div class="attention">
                    ${pending.length
                        ? pending.map(m => `<div class="attention-item"><span class="dot"></span>${esc(m.name)}<a href="#/${m.page}">Configurar</a></div>`).join('')
                        : '<div class="attention-item ok"><span class="dot"></span>Todos los módulos están configurados</div>'}
                </div>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Módulos', 'Estado actual de cada sistema')}
            <div class="panel-body-flush">${moduleRows}</div>
        </div>
    `;
};

PAGES['overview:init'] = () => {
    $('#ov-refresh').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => { await navigate('overview'); }, 'Actualizando')
    );
};

/* ── General ──────────────────────────────────────────────────────────────── */
PAGES.general = async () => {
    const cfg = await api(`/api/guilds/${state.guild.id}/config`);
    state.cfg = cfg;
    return `
        <div class="page-head">
            <div>
                <h1>General</h1>
                <p>Configuración básica de CatBot en este servidor.</p>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Comandos', 'Ajustes de los comandos de texto')}
            <div class="panel-body-flush">
                ${settingRow({
                    title: 'Prefijo',
                    desc: 'Carácter que precede a los comandos de texto. Entre 1 y 5 caracteres, sin espacios.',
                    control: `<input class="input mono" id="cfg-prefix" value="${esc(cfg.prefix || '!')}" maxlength="5" aria-describedby="prefix-hint" style="width:96px">`,
                })}
            </div>
            <div class="panel-body" style="padding-top:0">
                <div class="note" id="prefix-hint">${icon('info')}<span>Solo afecta a los comandos de texto, como <code>${esc(cfg.prefix || '!')}help</code>. Los comandos de barra (<code>/help</code>) se registran en Discord y no cambian.</span></div>
                <div class="field-error" id="prefix-error" hidden></div>
            </div>
            <div class="panel-foot">
                <span class="foot-note">Los cambios se aplican al instante.</span>
                <button type="button" class="btn btn-primary" id="general-save">Guardar cambios</button>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Información del servidor', 'Datos leídos de Discord')}
            <div class="kv">
                <div class="kv-row"><span class="kv-key">Nombre</span><span class="kv-val">${esc(state.info?.name || state.guild.name)}</span></div>
                <div class="kv-row"><span class="kv-key">ID</span><span class="kv-val"><span class="mono">${esc(state.guild.id)}</span></span></div>
                <div class="kv-row"><span class="kv-key">Miembros</span><span class="kv-val num-strong">${nf.format(state.info?.memberCount || 0)}</span></div>
                <div class="kv-row"><span class="kv-key">Canales de texto</span><span class="kv-val num-strong">${nf.format(state.info?.channels?.length || 0)}</span></div>
                <div class="kv-row"><span class="kv-key">Roles</span><span class="kv-val num-strong">${nf.format(state.info?.roles?.length || 0)}</span></div>
            </div>
        </div>
    `;
};

PAGES['general:init'] = () => {
    const input = $('#cfg-prefix');
    const error = $('#prefix-error');
    input.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
        error.hidden = true;
    });
    $('#general-save').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => {
            const prefix = input.value.trim();
            if (!prefix || prefix.length > 5) throw new Error('El prefijo debe tener entre 1 y 5 caracteres.');
            if (/\s/.test(prefix)) throw new Error('El prefijo no puede contener espacios.');
            await patchCfg(state.guild.id, { prefix });
            toastOk('Prefijo actualizado', `Los comandos ahora usan ${prefix}`);
        }, 'Guardando')
    );
};

/* ── Welcome ──────────────────────────────────────────────────────────────── */
PAGES.welcome = async () => {
    const cfg = state.cfg || await api(`/api/guilds/${state.guild.id}/config`);
    state.cfg = cfg;
    const configured = !!cfg.welcomeChannel;
    return `
        <div class="page-head">
            <div>
                <h1>Bienvenidas</h1>
                <p>Mensaje que CatBot envía cuando alguien entra al servidor.</p>
            </div>
            <div class="page-actions">
                <span class="badge ${configured ? 'badge-ok badge-dot' : 'badge-muted'}">${configured ? 'Activo' : 'Inactivo'}</span>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Configuración')}
            <div class="panel-body-flush">
                ${settingRow({
                    title: 'Canal',
                    desc: 'Canal de texto donde se publica el mensaje.',
                    control: `<select class="select" id="wc-channel" style="width:260px">${channelOptions(cfg.welcomeChannel)}</select>`,
                })}
                ${settingRow({
                    title: 'Mensaje',
                    desc: 'Inserta <code>{usuario}</code> para mencionar al nuevo miembro. Máximo 2000 caracteres.',
                    stack: true,
                    control: `<textarea class="textarea" id="wc-message" rows="3" maxlength="2000" placeholder="Bienvenido a {usuario}">${esc(cfg.welcomeMessage || '')}</textarea>`,
                })}
                ${settingRow({
                    title: 'Imagen',
                    desc: 'URL de una imagen que se adjunta al mensaje.',
                    control: `<input class="input" id="wc-image" style="width:260px" placeholder="https://…" value="${esc(cfg.welcomeImage || '')}">`,
                })}
            </div>
            <div class="panel-foot">
                ${configured
                    ? '<button type="button" class="btn btn-danger" id="wc-disable">Desactivar</button>'
                    : '<span class="foot-note">Aún no está configurado.</span>'}
                <button type="button" class="btn btn-primary" id="wc-save">Guardar cambios</button>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Vista previa', 'Así se verá en Discord')}
            <div class="panel-body">
                <div class="preview">
                    <div class="preview-head">
                        <img class="preview-logo" src="/logo.png" alt="">
                        <div>
                            <div class="preview-name">CatBot <span class="badge badge-info" style="margin-left:4px">APP</span></div>
                            <div class="preview-app">Hoy a las 12:00</div>
                        </div>
                    </div>
                    <div class="preview-body" id="wc-preview"></div>
                </div>
            </div>
        </div>
    `;
};

PAGES['welcome:init'] = () => {
    const textarea = $('#wc-message');
    const preview = $('#wc-preview');

    const render = () => {
        const raw = textarea.value.trim();
        if (!raw) {
            preview.innerHTML = '<span class="preview-empty">El mensaje aparecerá aquí.</span>';
            return;
        }
        const text = esc(raw).replace(/\{usuario\}/g, '<span class="mention">@NuevoMiembro</span>');
        const image = $('#wc-image').value.trim();
        const validImage = /^https?:\/\/\S+$/i.test(image);
        preview.innerHTML = text + (validImage
            ? `<img class="preview-img" src="${esc(image)}" alt="" onerror="this.remove()">`
            : image ? `<div class="field-error" style="margin-top:8px">La URL de la imagen no parece válida.</div>` : '');
    };

    textarea.addEventListener('input', render);
    $('#wc-image').addEventListener('input', render);
    render();

    $('#wc-save').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => {
            const message = textarea.value.trim();
            if (message.length > 2000) throw new Error('El mensaje supera los 2000 caracteres.');
            await patchCfg(state.guild.id, {
                welcomeChannel: val('wc-channel'),
                welcomeMessage: message || null,
                welcomeImage: val('wc-image'),
            });
            toastOk('Bienvenidas guardadas');
            navigate('welcome');
        }, 'Guardando')
    );

    $('#wc-disable')?.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Desactivar bienvenidas',
            message: 'Se borrarán el canal, el mensaje y la imagen configurados. CatBot dejará de enviar saludos en este servidor.',
            confirmLabel: 'Desactivar',
        });
        if (!ok) return;
        try {
            await patchCfg(state.guild.id, { welcomeChannel: null, welcomeMessage: null, welcomeImage: null });
            toastOk('Bienvenidas desactivadas');
            navigate('welcome');
        } catch (error) {
            toastErr('No se pudo desactivar', error.message);
        }
    });
};

/* ── Logs ─────────────────────────────────────────────────────────────────── */
PAGES.logs = async () => {
    const cfg = state.cfg || await api(`/api/guilds/${state.guild.id}/config`);
    state.cfg = cfg;
    const configured = !!cfg.logsChannel;
    const channel = state.info?.channels.find(c => c.id === cfg.logsChannel);
    return `
        <div class="page-head">
            <div>
                <h1>Registros</h1>
                <p>Canal donde CatBot publica los eventos del servidor.</p>
            </div>
            <div class="page-actions">
                <span class="badge ${configured ? 'badge-ok badge-dot' : 'badge-muted'}">${configured ? 'Activo' : 'Inactivo'}</span>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Canal de registros')}
            <div class="panel-body-flush">
                ${settingRow({
                    title: 'Canal de destino',
                    desc: channel
                        ? `Actualmente: #${esc(channel.name)}`
                        : 'Los eventos se descartan mientras no haya un canal configurado.',
                    control: `<select class="select" id="logs-channel" style="width:260px">${channelOptions(cfg.logsChannel)}</select>`,
                })}
            </div>
            <div class="panel-foot">
                ${configured ? '<button type="button" class="btn btn-danger" id="logs-disable">Desactivar</button>' : ''}
                <button type="button" class="btn btn-primary" id="logs-save">Guardar cambios</button>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Eventos registrados', 'Los que CatBot envía a ese canal')}
            <div class="panel-body">
                <div class="event-grid">
                    ${LOGGED_EVENTS.map(event => `<div class="event-item">${icon(event.icon)}<span>${esc(event.label)}</span></div>`).join('')}
                </div>
                <div class="note" style="margin-top:14px">${icon('info')}<span>Los mensajes enviados por cuentas con el bot mencionan al autor y al moderador responsable de cada acción.</span></div>
            </div>
        </div>
    `;
};

PAGES['logs:init'] = () => {
    $('#logs-save').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => {
            await patchCfg(state.guild.id, { logsChannel: val('logs-channel') });
            toastOk('Canal de registros actualizado');
            navigate('logs');
        }, 'Guardando')
    );

    $('#logs-disable')?.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Desactivar registros',
            message: 'CatBot dejará de enviar eventos al canal configurado. No se elimina el historial ya publicado.',
            confirmLabel: 'Desactivar',
        });
        if (!ok) return;
        try {
            await patchCfg(state.guild.id, { logsChannel: null });
            toastOk('Registros desactivados');
            navigate('logs');
        } catch (error) {
            toastErr('No se pudo desactivar', error.message);
        }
    });
};

/* ── Auto-role ────────────────────────────────────────────────────────────── */
PAGES.autorole = async () => {
    const cfg = state.cfg || await api(`/api/guilds/${state.guild.id}/config`);
    state.cfg = cfg;
    const role = state.info?.roles.find(r => r.id === cfg.autoRole);
    return `
        <div class="page-head">
            <div>
                <h1>Auto-rol</h1>
                <p>Rol que CatBot asigna automáticamente a cada miembro nuevo.</p>
            </div>
            <div class="page-actions">
                <span class="badge ${cfg.autoRole ? 'badge-ok badge-dot' : 'badge-muted'}">${cfg.autoRole ? 'Activo' : 'Inactivo'}</span>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Rol automático')}
            <div class="panel-body-flush">
                ${settingRow({
                    title: 'Rol',
                    desc: role
                        ? `Actualmente: ${esc(role.name)}`
                        : 'Ningún rol configurado. Los miembros nuevos entrarán sin rol adicional.',
                    control: `<select class="select" id="ar-role" style="width:260px">${roleOptions(cfg.autoRole)}</select>`,
                })}
            </div>
            <div class="panel-body" style="padding-top:0">
                <div class="note warn">${icon('alert')}<span>CatBot solo puede asignar roles que estén por debajo de su propio rol más alto en la jerarquía.</span></div>
            </div>
            <div class="panel-foot">
                ${cfg.autoRole ? '<button type="button" class="btn btn-danger" id="ar-disable">Desactivar</button>' : ''}
                <button type="button" class="btn btn-primary" id="ar-save">Guardar cambios</button>
            </div>
        </div>
    `;
};

PAGES['autorole:init'] = () => {
    $('#ar-save').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => {
            await patchCfg(state.guild.id, { autoRole: val('ar-role') });
            toastOk('Auto-rol actualizado');
            navigate('autorole');
        }, 'Guardando')
    );

    $('#ar-disable')?.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Desactivar auto-rol',
            message: 'Los miembros nuevos ya no recibirán el rol configurado. Los que ya lo tienen lo conservan.',
            confirmLabel: 'Desactivar',
        });
        if (!ok) return;
        try {
            await patchCfg(state.guild.id, { autoRole: null });
            toastOk('Auto-rol desactivado');
            navigate('autorole');
        } catch (error) {
            toastErr('No se pudo desactivar', error.message);
        }
    });
};

/* ── Leveling ─────────────────────────────────────────────────────────────── */
PAGES.leveling = async () => {
    const [cfg, leaderboard] = await Promise.all([
        api(`/api/guilds/${state.guild.id}/config`),
        api(`/api/guilds/${state.guild.id}/leaderboard`),
    ]);
    state.cfg = cfg;

    const rows = leaderboard.map((user, index) => `<tr>
        <td class="rank${index < 3 ? ' top' : ''}">${index + 1}</td>
        <td>${userCell(user)}</td>
        <td class="num"><span class="badge badge-info">Nv ${user.level}</span></td>
        <td class="num strong">${nf.format(user.xp)}</td>
        <td class="num dim">${nf.format(user.messages || 0)}</td>
        <td class="actions">
            <button type="button" class="btn btn-sm btn-ghost" data-reset-level="${esc(user.userId)}" data-name="${esc(user.username)}">Restablecer</button>
        </td>
    </tr>`).join('') || emptyTable(6, 'Todavía no hay miembros con experiencia registrada.');

    return `
        <div class="page-head">
            <div>
                <h1>Nivelación</h1>
                <p>Experiencia acumulada por actividad en el servidor.</p>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Ajustes')}
            <div class="panel-body-flush">
                ${settingRow({
                    title: 'Sistema de experiencia',
                    desc: 'Cuando está desactivado CatBot deja de sumar XP, aunque los datos existentes se conservan.',
                    control: toggleControl('lv-enabled', cfg.levelingEnabled !== false, 'lv-desc'),
                })}
            </div>
            <div class="panel-foot">
                <span class="foot-note" id="lv-desc">Se guarda automáticamente.</span>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Clasificación', leaderboard.length ? `Top ${leaderboard.length} de 50` : 'Sin datos todavía')}
            <div class="table-wrap"><table class="data">
                <thead><tr><th>#</th><th>Miembro</th><th style="text-align:right">Nivel</th><th style="text-align:right">XP</th><th style="text-align:right">Mensajes</th><th></th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
            ${leaderboard.length ? `
                <div class="panel-foot">
                    <span class="foot-note">Acciones destructivas requieren confirmación.</span>
                    <button type="button" class="btn btn-danger btn-sm" id="lv-reset-all">Restablecer toda la tabla</button>
                </div>` : ''}
        </div>
    `;
};

PAGES['leveling:init'] = () => {
    const toggle = $('#lv-enabled');
    toggle.addEventListener('change', async () => {
        const wanted = toggle.checked;
        toggle.disabled = true;
        try {
            await patchCfg(state.guild.id, { levelingEnabled: wanted });
            toastOk(wanted ? 'Nivelación activada' : 'Nivelación desactivada');
        } catch (error) {
            toggle.checked = !wanted;
            toastErr('No se pudo guardar', error.message);
        } finally {
            toggle.disabled = false;
        }
    });

    $$('[data-reset-level]').forEach(node => node.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Restablecer nivel',
            message: `Se borrará la experiencia y el nivel de ${node.dataset.name} en este servidor.`,
            confirmLabel: 'Restablecer',
        });
        if (!ok) return;
        try {
            await api(`/api/guilds/${state.guild.id}/leaderboard/${node.dataset.resetLevel}`, { method: 'DELETE' });
            toastOk('Nivel restablecido', node.dataset.name);
            navigate('leveling');
        } catch (error) {
            toastErr('No se pudo restablecer', error.message);
        }
    }));

    $('#lv-reset-all')?.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Restablecer toda la tabla',
            message: `Se eliminará todo el historial de experiencia de este servidor, no solo los ${leaderboardCount()} miembros visibles en la lista. Esta acción no se puede deshacer.`,
            confirmLabel: 'Borrar todo',
        });
        if (!ok) return;
        try {
            await api(`/api/guilds/${state.guild.id}/leaderboard`, { method: 'DELETE' });
            toastOk('Tabla de niveles vaciada');
            navigate('leveling');
        } catch (error) {
            toastErr('No se pudo vaciar la tabla', error.message);
        }
    });
};

function leaderboardCount() {
    return $$('[data-reset-level]').length;
}

/* ── Economy ──────────────────────────────────────────────────────────────── */
PAGES.economy = async () => {
    const [economy, shop] = await Promise.all([
        api(`/api/guilds/${state.guild.id}/economy`),
        api(`/api/guilds/${state.guild.id}/shop`).catch(() => []),
    ]);

    const rows = economy.map((user, index) => `<tr>
        <td class="rank${index < 3 ? ' top' : ''}">${index + 1}</td>
        <td>${userCell(user)}</td>
        <td class="num strong">${nf.format(user.balance || 0)}</td>
        <td class="num dim">${nf.format(user.streak || 0)}</td>
    </tr>`).join('') || emptyTable(4, 'Todavía no hay saldos registrados.');

    const shopRows = shop.map(item => `<tr>
        <td class="strong">${esc(item.itemName)}</td>
        <td><span class="mono-chip">${esc(item.roleId)}</span></td>
        <td class="num strong">${nf.format(item.price)}</td>
        <td class="actions">
            <button type="button" class="btn btn-sm btn-ghost" data-del-item="${esc(item.itemName)}">Eliminar</button>
        </td>
    </tr>`).join('') || emptyTable(4, 'La tienda de roles está vacía.');

    return `
        <div class="page-head">
            <div>
                <h1>Economía</h1>
                <p>Saldos, rachas y tienda de roles de este servidor.</p>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Clasificación de riqueza', economy.length ? `Top ${economy.length} de 50` : 'Sin datos todavía')}
            <div class="table-wrap"><table class="data">
                <thead><tr><th>#</th><th>Miembro</th><th style="text-align:right">Saldo</th><th style="text-align:right">Racha</th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
        </div>

        <div class="panel">
            ${panelHead('Tienda de roles', 'Artículos que los miembros pueden comprar con su saldo')}
            <div class="table-wrap"><table class="data">
                <thead><tr><th>Artículo</th><th>ID del rol</th><th style="text-align:right">Precio</th><th></th></tr></thead>
                <tbody>${shopRows}</tbody>
            </table></div>
            <div class="panel-body" style="border-top:1px solid var(--line-faint)">
                <div class="note">${icon('info')}<span>Los artículos se crean con el comando <code>/tienda</code> en Discord. Desde el panel solo puedes eliminarlos.</span></div>
            </div>
        </div>
    `;
};

PAGES['economy:init'] = () => {
    $$('[data-del-item]').forEach(node => node.addEventListener('click', async () => {
        const name = node.dataset.delItem;
        const ok = await confirmDialog({
            title: 'Eliminar artículo',
            message: `Se eliminará “${name}” de la tienda de este servidor. Los miembros que lo compraron no recuperan el saldo.`,
            confirmLabel: 'Eliminar',
        });
        if (!ok) return;
        try {
            await api(`/api/guilds/${state.guild.id}/shop/${encodeURIComponent(name)}`, { method: 'DELETE' });
            toastOk('Artículo eliminado', name);
            navigate('economy');
        } catch (error) {
            toastErr('No se pudo eliminar', error.message);
        }
    }));
};

/* ── Tickets ──────────────────────────────────────────────────────────────── */
PAGES.tickets = async () => {
    const [cfg, tickets] = await Promise.all([
        api(`/api/guilds/${state.guild.id}/config`),
        api(`/api/guilds/${state.guild.id}/tickets`).catch(() => []),
    ]);
    state.cfg = cfg;

    const open = tickets.filter(t => t.status === 'open').length;
    const closed = tickets.length - open;
    const categories = state.info?.categories || [];

    const rows = tickets.map(ticket => `<tr>
        <td class="num strong">#${esc(ticket.number)}</td>
        <td><span class="badge ${ticket.status === 'open' ? 'badge-ok' : 'badge-muted'}">${ticket.status === 'open' ? 'Abierto' : 'Cerrado'}</span></td>
        <td><span class="mono-chip">${esc(ticket.userId)}</span></td>
        <td><span class="truncate dim" title="${esc(ticket.reason || '')}">${esc(ticket.reason || '—')}</span></td>
        <td class="dim nowrap">${relTime(ticket.createdAt)}</td>
        <td class="actions">
            <button type="button" class="btn btn-sm btn-ghost" data-del-ticket="${esc(ticket._id)}" data-number="${esc(ticket.number)}">Eliminar</button>
        </td>
    </tr>`).join('') || emptyTable(6, 'No hay tickets registrados.');

    return `
        <div class="page-head">
            <div>
                <h1>Tickets</h1>
                <p>Configuración del sistema de tickets de soporte.</p>
            </div>
        </div>

        <div class="grid-4">
            <div class="stat"><span class="stat-label">Totales</span><span class="stat-value">${nf.format(tickets.length)}</span><span class="stat-sub">últimos 100</span></div>
            <div class="stat"><span class="stat-label">Abiertos</span><span class="stat-value" style="color:var(--ok)">${nf.format(open)}</span></div>
            <div class="stat"><span class="stat-label">Cerrados</span><span class="stat-value">${nf.format(closed)}</span></div>
            <div class="stat"><span class="stat-label">Categoría</span><span class="stat-value" style="font-size:16px">${cfg.ticketCategory
                ? esc(categories.find(c => c.id === cfg.ticketCategory)?.name || 'Configurada')
                : '—'}</span></div>
        </div>

        <div class="panel">
            ${panelHead('Configuración')}
            <div class="panel-body-flush">
                ${settingRow({
                    title: 'Categoría de tickets',
                    desc: 'Carpeta donde se crean los canales de cada ticket.',
                    control: `<select class="select" id="tk-category" style="width:260px">${channelOptions(cfg.ticketCategory, { list: categories, marker: '' })}</select>`,
                })}
                ${settingRow({
                    title: 'Canal de registros',
                    desc: 'Canal donde se avisa de aperturas y cierres.',
                    control: `<select class="select" id="tk-log" style="width:260px">${channelOptions(cfg.ticketLogChannel)}</select>`,
                })}
                ${settingRow({
                    title: 'Rol de soporte',
                    desc: 'Rol con acceso a todos los canales de ticket.',
                    control: `<select class="select" id="tk-role" style="width:260px">${roleOptions(cfg.supportRole)}</select>`,
                })}
            </div>
            <div class="panel-foot">
                <button type="button" class="btn btn-primary" id="tk-save">Guardar cambios</button>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Historial')}
            <div class="table-wrap"><table class="data">
                <thead><tr><th>#</th><th>Estado</th><th>Usuario</th><th>Motivo</th><th>Creado</th><th></th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
        </div>
    `;
};

PAGES['tickets:init'] = () => {
    $('#tk-save').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => {
            await patchCfg(state.guild.id, {
                ticketCategory: val('tk-category'),
                ticketLogChannel: val('tk-log'),
                supportRole: val('tk-role'),
            });
            toastOk('Configuración de tickets guardada');
            navigate('tickets');
        }, 'Guardando')
    );

    $$('[data-del-ticket]').forEach(node => node.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Eliminar ticket',
            message: `Se eliminará el ticket #${node.dataset.number} del historial. El canal de Discord no se toca.`,
            confirmLabel: 'Eliminar',
        });
        if (!ok) return;
        try {
            await api(`/api/guilds/${state.guild.id}/tickets/${node.dataset.delTicket}`, { method: 'DELETE' });
            toastOk('Ticket eliminado');
            navigate('tickets');
        } catch (error) {
            toastErr('No se pudo eliminar', error.message);
        }
    }));
};

/* ── Moderation ───────────────────────────────────────────────────────────── */
PAGES.moderation = async () => {
    const warns = await api(`/api/guilds/${state.guild.id}/warns`);
    const active = warns
        .filter(record => (record.warns?.length || 0) > 0)
        .sort((a, b) => b.warns.length - a.warns.length);

    const total = active.reduce((acc, record) => acc + record.warns.length, 0);

    const rows = active.map(record => {
        const last = record.warns[record.warns.length - 1];
        return `<tr>
            <td><span class="mono-chip">${esc(record.userId)}</span></td>
            <td><span class="badge ${record.warns.length >= 3 ? 'badge-danger' : 'badge-warn'}">${record.warns.length}</span></td>
            <td class="dim nowrap">${relTime(last.date)}</td>
            <td><span class="truncate" title="${esc(last.reason || '')}">${esc(last.reason || '—')}</span></td>
            <td class="actions">
                <button type="button" class="btn btn-sm btn-ghost" data-clear-warns="${esc(record.userId)}">Limpiar</button>
            </td>
        </tr>`;
    }).join('') || emptyTable(5, 'No hay advertencias registradas en este servidor.');

    return `
        <div class="page-head">
            <div>
                <h1>Moderación</h1>
                <p>Historial de advertencias registradas por los comandos del bot y por el automod.</p>
            </div>
            <div class="page-actions">
                <span class="badge ${total ? 'badge-warn' : 'badge-muted'}">${nf.format(total)} advertencia${total === 1 ? '' : 'es'}</span>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Advertencias', `${active.length} usuario${active.length === 1 ? '' : 's'} con historial`)}
            <div class="table-wrap"><table class="data">
                <thead><tr><th>Usuario</th><th>Warns</th><th>Última</th><th>Razón</th><th></th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
            <div class="panel-body" style="border-top:1px solid var(--line-faint)">
                <div class="note">${icon('info')}<span>Las advertencias las añaden los comandos <code>/warn</code> y las automáticas del <a href="#/automod" style="color:var(--accent)">automod</a>. Los baneos, kicks y timeouts se gestionan desde Discord o con los comandos del bot.</span></div>
            </div>
        </div>
    `;
};

PAGES['moderation:init'] = () => {
    $$('[data-clear-warns]').forEach(node => node.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Limpiar advertencias',
            message: `Se borrará todo el historial de advertencias del usuario ${node.dataset.clearWarns}.`,
            confirmLabel: 'Limpiar',
        });
        if (!ok) return;
        try {
            await api(`/api/guilds/${state.guild.id}/warns/${node.dataset.clearWarns}`, { method: 'DELETE' });
            toastOk('Advertencias eliminadas');
            navigate('moderation');
        } catch (error) {
            toastErr('No se pudo limpiar', error.message);
        }
    }));
};

/* ── Automod ──────────────────────────────────────────────────────────────── */
PAGES.automod = async () => {
    const automod = await api(`/api/guilds/${state.guild.id}/automod`);

    const words = automod.badWords || [];
    const tokens = words.length
        ? words.map(word => `<span class="token">${esc(word)}
              <button type="button" data-del-word="${esc(word)}" aria-label="Eliminar ${esc(word)}">${icon('x')}</button>
           </span>`).join('')
        : '<span class="dim">Sin palabras filtradas.</span>';

    const filters = [
        { id: 'am-links',   title: 'Enlaces externos', desc: 'Elimina mensajes que contienen URLs.', on: automod.filterLinks },
        { id: 'am-invites', title: 'Invitaciones de Discord', desc: 'Elimina enlaces de invitación a otros servidores.', on: automod.filterInvites },
        { id: 'am-spam',    title: 'Mensajes repetidos', desc: 'Detecta 5 mensajes idénticos en menos de 8 segundos.', on: automod.filterSpam },
    ].map(filter => settingRow({ title: filter.title, desc: filter.desc, control: toggleControl(filter.id, filter.on) })).join('');

    return `
        <div class="page-head">
            <div>
                <h1>Automod</h1>
                <p>Filtros automáticos de contenido para este servidor.</p>
            </div>
            <div class="page-actions">
                <span class="badge ${automod.enabled ? 'badge-ok badge-dot' : 'badge-muted'}">${automod.enabled ? 'Activo' : 'Inactivo'}</span>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Filtros')}
            <div class="panel-body-flush">
                ${settingRow({
                    title: 'Automod',
                    desc: 'Interruptor maestro. Mientras esté apagado no se aplica ningún filtro.',
                    control: toggleControl('am-enabled', automod.enabled),
                })}
                ${filters}
                ${settingRow({
                    title: 'Acción al detectar una infracción',
                    desc: 'El mensaje se elimina siempre; la acción define lo que ocurre con el autor.',
                    control: `<select class="select" id="am-action" style="width:260px">
                        <option value="delete"${automod.action === 'delete' ? ' selected' : ''}>Eliminar el mensaje</option>
                        <option value="warn"${automod.action === 'warn' ? ' selected' : ''}>Eliminar y añadir una advertencia</option>
                        <option value="timeout"${automod.action === 'timeout' ? ' selected' : ''}>Eliminar y aplicar timeout de 5 minutos</option>
                    </select>`,
                })}
            </div>
            <div class="panel-foot">
                <span class="foot-note">El autor recibe un mensaje directo con el motivo.</span>
                <button type="button" class="btn btn-primary" id="am-save">Guardar cambios</button>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Palabras prohibidas', `${words.length} ${words.length === 1 ? 'palabra' : 'palabras'}`)}
            <div class="panel-body">
                <div class="chip-row" id="am-words">${tokens}</div>
                <div class="input-group" style="margin-top:14px">
                    <input class="input" id="am-word" maxlength="50" placeholder="Nueva palabra prohibida" aria-label="Nueva palabra prohibida">
                    <button type="button" class="btn btn-outline" id="am-word-add">Añadir</button>
                </div>
                <div class="field-error" id="am-word-error" hidden></div>
            </div>
        </div>
    `;
};

PAGES['automod:init'] = () => {
    $('#am-save').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => {
            await api(`/api/guilds/${state.guild.id}/automod`, {
                method: 'PATCH',
                body: {
                    enabled: $('#am-enabled').checked,
                    filterLinks: $('#am-links').checked,
                    filterInvites: $('#am-invites').checked,
                    filterSpam: $('#am-spam').checked,
                    action: $('#am-action').value,
                },
            });
            toastOk('Automod guardado');
            navigate('automod');
        }, 'Guardando')
    );

    const addWord = async (event) => {
        const input = $('#am-word');
        const error = $('#am-word-error');
        const word = input.value.trim().toLowerCase();
        error.hidden = true;
        if (!word) { error.textContent = 'Escribe una palabra.'; error.hidden = false; return; }
        await withBusy(event.currentTarget, async () => {
            await api(`/api/guilds/${state.guild.id}/automod/badwords`, { method: 'POST', body: { word } });
            toastOk('Palabra añadida', word);
            navigate('automod');
        }, 'Añadiendo');
    };
    $('#am-word-add').addEventListener('click', addWord);
    $('#am-word').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); addWord(event); } });

    $$('[data-del-word]').forEach(node => node.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Eliminar palabra',
            message: `«${node.dataset.delWord}» dejará de filtrarse en este servidor.`,
            confirmLabel: 'Eliminar',
        });
        if (!ok) return;
        try {
            await api(`/api/guilds/${state.guild.id}/automod/badwords/${encodeURIComponent(node.dataset.delWord)}`, { method: 'DELETE' });
            toastOk('Palabra eliminada');
            navigate('automod');
        } catch (error) {
            toastErr('No se pudo eliminar', error.message);
        }
    }));
};

/* ── Command explorer ─────────────────────────────────────────────────────── */
let commandFilter = { query: '', category: 'all' };

PAGES.commands = async () => {
    const commands = await api('/api/commands').catch(() => []);
    state.commands = commands;
    return `
        <div class="page-head">
            <div>
                <h1>Comandos</h1>
                <p>Metadatos leídos del código del bot: nombre, descripción, uso, permisos y enfriamiento.</p>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Explorador', `${commands.length} comandos cargados`)}
            <div class="panel-body">
                <div class="search-input">
                    ${icon('search')}
                    <input type="search" class="input" id="cmd-search" placeholder="Buscar por nombre o descripción" aria-label="Buscar comandos">
                </div>
                <div class="chip-row" id="cmd-cats" style="margin-top:12px"></div>
            </div>
            <div class="panel-body-flush" id="cmd-list"></div>
        </div>
    `;
};

PAGES['commands:init'] = () => {
    const search = $('#cmd-search');
    search.addEventListener('input', () => { commandFilter.query = search.value.toLowerCase().trim(); renderCommands(); });

    const categories = ['all', ...new Set((state.commands || []).map(c => c.category))];
    $('#cmd-cats').innerHTML = categories.map(category => {
        const count = category === 'all'
            ? (state.commands || []).length
            : (state.commands || []).filter(c => c.category === category).length;
        const label = category === 'all' ? 'Todos' : (CATEGORY_LABELS[category] || category);
        return `<button type="button" class="chip" data-cat="${esc(category)}" aria-pressed="${commandFilter.category === category}">
            ${esc(label)} <span class="count">${count}</span>
        </button>`;
    }).join('');
    $$('#cmd-cats [data-cat]').forEach(node => node.addEventListener('click', () => {
        commandFilter.category = node.dataset.cat;
        $$('#cmd-cats [data-cat]').forEach(chip => chip.setAttribute('aria-pressed', String(chip === node)));
        renderCommands();
    }));

    renderCommands();
};

function renderCommands() {
    const host = $('#cmd-list');
    if (!host) return;
    const prefix = state.cfg?.prefix || '!';
    const all = state.commands || [];
    const matches = all.filter(command => {
        const inCategory = commandFilter.category === 'all' || command.category === commandFilter.category;
        const haystack = `${command.name} ${command.description} ${(command.aliases || []).join(' ')}`.toLowerCase();
        return inCategory && (!commandFilter.query || haystack.includes(commandFilter.query));
    });

    if (!all.length) {
        host.innerHTML = stateBlock({ icon: 'terminal', title: 'Sin comandos', text: 'El bot aún no ha cargado los comandos en este proceso.' });
        return;
    }
    if (!matches.length) {
        host.innerHTML = stateBlock({ icon: 'search', title: 'Sin coincidencias', text: 'Prueba con otro término o cambia el filtro de categoría.' });
        return;
    }

    host.innerHTML = matches.map(command => {
        const perms = (command.permissions || []).map(perm =>
            `<span class="badge badge-muted" title="${esc(perm)}">${esc(PERMISSION_LABELS[perm] || perm)}</span>`
        ).join('');
        const aliases = (command.aliases || []).length
            ? `<span class="mono-chip">alias: ${command.aliases.map(a => esc(a)).join(', ')}</span>`
            : '';
        const options = (command.options || []).length
            ? command.options.map(opt =>
                `<span class="mono-chip" title="${esc(opt.description)}">${opt.required ? '' : '['}${esc(opt.name)}${opt.required ? '' : ']'}</span>`
            ).join('')
            : '';
        return `<div class="cmd-row">
            <div class="cmd-main">
                <div class="cmd-name"><code>/${esc(command.name)}</code>
                    ${command.cooldown ? `<span class="badge badge-muted">${esc(command.cooldown)} s enfriamiento</span>` : ''}
                </div>
                <div class="cmd-desc">${esc(command.description)}</div>
                <div class="cmd-usage">${esc(prefix)}${esc(command.name)}${command.options.length ? ' ' + command.options.map(o => `<span class="opt">${o.required ? '' : '['}${esc(o.name)}${o.required ? '' : ']'}</span>`).join(' ') : ''}</div>
                <div class="cmd-meta">${perms}${aliases}${options}</div>
            </div>
            <span class="badge badge-muted nowrap">${esc(CATEGORY_LABELS[command.category] || command.category)}</span>
        </div>`;
    }).join('');
}

/* ── Status ───────────────────────────────────────────────────────────────── */
PAGES.status = async () => {
    const status = await api('/api/status');
    state.status = status;

    const connBadge = status.online
        ? '<span class="badge badge-ok badge-dot">Conectado</span>'
        : '<span class="badge badge-danger badge-dot">Desconectado</span>';
    const dbOk = status.database === 'conectada';
    const dbBadge = dbOk
        ? '<span class="badge badge-ok badge-dot">Conectada</span>'
        : `<span class="badge badge-warn badge-dot">${esc(status.database)}</span>`;

    const rows = [
        { icon: 'plug',     label: 'Conexión con Discord', value: connBadge },
        { icon: 'activity', label: 'Latencia del gateway',  value: status.ping === null ? '—' : `${status.ping} ms` },
        { icon: 'clock',    label: 'Tiempo en línea',       value: esc(status.uptimeStr) },
        { icon: 'database', label: 'Base de datos',         value: dbBadge },
        { icon: 'cpu',      label: 'Memoria del proceso',   value: `${nf.format(status.memory)} MB` },
        { icon: 'terminal', label: 'Node.js',               value: `<span class="mono">${esc(status.nodeVersion)}</span>` },
        { icon: 'server',   label: 'discord.js',            value: `<span class="mono">v${esc(status.djsVersion)}</span>` },
    ];
    if (typeof status.guilds === 'number') {
        rows.push({ icon: 'server', label: 'Servidores', value: nf.format(status.guilds) });
        rows.push({ icon: 'users',  label: 'Usuarios totales', value: nf.format(status.users) });
    }

    return `
        <div class="page-head">
            <div>
                <h1>Estado</h1>
                <p>Telemetría real del proceso que ejecuta CatBot.</p>
            </div>
            <div class="page-actions">
                <button type="button" class="btn btn-outline" id="st-refresh">${icon('refresh')}Actualizar</button>
            </div>
        </div>

        <div class="grid-3">
            <div class="stat"><span class="stat-label">Estado</span><span class="stat-value" style="font-size:18px">${status.online ? 'Operativo' : 'Caído'}</span></div>
            <div class="stat"><span class="stat-label">Latencia</span><span class="stat-value">${status.ping === null ? '—' : status.ping}<small>ms</small></span></div>
            <div class="stat"><span class="stat-label">Tiempo en línea</span><span class="stat-value" style="font-size:18px">${esc(status.uptimeStr)}</span></div>
        </div>

        <div class="panel">
            ${panelHead('Infraestructura')}
            <div class="panel-body-flush">
                ${rows.map(row => `<div class="status-row">
                    <span class="sr-label">${icon(row.icon)}${esc(row.label)}</span>
                    <span class="sr-value">${row.value}</span>
                </div>`).join('')}
            </div>
        </div>

        <div class="note">${icon('info')}<span>Estos valores se leen del proceso del bot en el servidor. Si Discord no responde, el panel mantiene la última lectura conocida.</span></div>
    `;
};

PAGES['status:init'] = () => {
    $('#st-refresh').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => {
            await refreshStatus();
            await navigate('status');
        }, 'Actualizando')
    );
};

/* ── Admin · stats ────────────────────────────────────────────────────────── */
PAGES['admin-stats'] = async () => {
    const stats = await api('/api/stats');
    return `
        <div class="page-head">
            <div>
                <h1>Estadísticas globales</h1>
                <p>Visible solo para el propietario del bot.</p>
            </div>
            <div class="page-actions">
                <button type="button" class="btn btn-outline" id="as-refresh">${icon('refresh')}Actualizar</button>
            </div>
        </div>

        <div class="grid-4">
            <div class="stat"><span class="stat-label">Servidores</span><span class="stat-value" id="as-guilds">${nf.format(stats.guilds)}</span></div>
            <div class="stat"><span class="stat-label">Usuarios</span><span class="stat-value" id="as-users">${nf.format(stats.users)}</span></div>
            <div class="stat"><span class="stat-label">Latencia</span><span class="stat-value" id="as-ping">${stats.ping}<small>ms</small></span></div>
            <div class="stat"><span class="stat-label">Memoria</span><span class="stat-value" id="as-ram">${nf.format(stats.ram)}<small>MB</small></span></div>
        </div>

        <div class="split">
            <div class="panel">
                ${panelHead('Proceso')}
                <div class="kv" id="as-kv">
                    <div class="kv-row"><span class="kv-key">Tiempo en línea</span><span class="kv-val" id="as-uptime">${esc(stats.uptimeStr)}</span></div>
                    <div class="kv-row"><span class="kv-key">Comandos cargados</span><span class="kv-val num-strong" id="as-commands">${nf.format(stats.commands)}</span></div>
                    <div class="kv-row"><span class="kv-key">Canales en caché</span><span class="kv-val num-strong" id="as-channels">${nf.format(stats.channels)}</span></div>
                    <div class="kv-row"><span class="kv-key">Node.js</span><span class="kv-val"><span class="mono">${esc(stats.nodeVersion)}</span></span></div>
                    <div class="kv-row"><span class="kv-key">Memoria del sistema</span><span class="kv-val num-strong" id="as-ramtotal">${nf.format(stats.ramTotal)} MB</span></div>
                </div>
            </div>

            <div class="panel">
                ${panelHead('Acceso rápido')}
                <div class="panel-body" style="display:flex;flex-direction:column;gap:8px">
                    <a class="btn btn-outline" href="#/admin-servers">${icon('server')}Gestionar servidores</a>
                    <a class="btn btn-outline" href="#/admin-blacklist">${icon('ban')}Blacklist global</a>
                    <a class="btn btn-outline" href="#/commands">${icon('terminal')}Explorar comandos</a>
                </div>
            </div>
        </div>
    `;
};

PAGES['admin-stats:init'] = () => {
    $('#as-refresh').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => { await navigate('admin-stats'); }, 'Actualizando')
    );

    state.timers.push(setInterval(async () => {
        if (document.hidden || state.page !== 'admin-stats') return;
        try {
            const stats = await api('/api/stats');
            const set = (id, value) => { const node = $('#' + id); if (node) node.textContent = value; };
            set('as-guilds', nf.format(stats.guilds));
            set('as-users', nf.format(stats.users));
            set('as-uptime', stats.uptimeStr);
            set('as-commands', nf.format(stats.commands));
            set('as-channels', nf.format(stats.channels));
            const ping = $('#as-ping');
            if (ping) ping.innerHTML = `${stats.ping}<small>ms</small>`;
            const ram = $('#as-ram');
            if (ram) ram.innerHTML = `${nf.format(stats.ram)}<small>MB</small>`;
            const ramTotal = $('#as-ramtotal');
            if (ramTotal) ramTotal.textContent = `${nf.format(stats.ramTotal)} MB`;
        } catch { /* keep the last known values */ }
    }, 30000));
};

/* ── Admin · servers ──────────────────────────────────────────────────────── */
PAGES['admin-servers'] = async () => {
    const servers = await api('/api/servers');
    servers.sort((a, b) => b.memberCount - a.memberCount);

    const rows = servers.map(server => `<tr>
        <td><span class="user-cell">
            <span class="guild-icon" style="width:26px;height:26px">${server.icon ? `<img src="${esc(server.icon)}" alt="">` : esc(server.name.slice(0, 2).toUpperCase())}</span>
            <span class="who"><span class="who-name">${esc(server.name)}</span><span class="who-id">${esc(server.id)}</span></span>
        </span></td>
        <td class="num strong">${nf.format(server.memberCount)}</td>
        <td class="dim truncate">${esc(server.ownerName || server.ownerId)}</td>
        <td><span class="mono-chip">${esc(server.prefix)}</span></td>
        <td>${moduleBadges(server)}</td>
        <td class="actions">
            <button type="button" class="btn btn-sm btn-ghost" data-leave="${esc(server.id)}" data-name="${esc(server.name)}">Abandonar</button>
        </td>
    </tr>`).join('') || emptyTable(6, 'CatBot no está en ningún servidor.');

    return `
        <div class="page-head">
            <div>
                <h1>Servidores</h1>
                <p>${nf.format(servers.length)} servidores con CatBot en caché.</p>
            </div>
            <div class="page-actions">
                <button type="button" class="btn btn-outline" id="asv-refresh">${icon('refresh')}Actualizar</button>
            </div>
        </div>

        <div class="panel">
            <div class="table-wrap"><table class="data">
                <thead><tr><th>Servidor</th><th style="text-align:right">Miembros</th><th>Propietario</th><th>Prefijo</th><th>Módulos</th><th></th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
        </div>
    `;
};

function moduleBadges(server) {
    const badges = [
        server.hasWelcome ? '<span class="badge badge-muted">Bienvenidas</span>' : '',
        server.hasLogs ? '<span class="badge badge-muted">Registros</span>' : '',
        server.levelingOn ? '<span class="badge badge-muted">Nivelación</span>' : '',
    ].filter(Boolean);
    return badges.length ? `<span class="chip-row">${badges.join('')}</span>` : '<span class="dim">—</span>';
}

PAGES['admin-servers:init'] = () => {
    $('#asv-refresh').addEventListener('click', event =>
        withBusy(event.currentTarget, async () => { await navigate('admin-servers'); }, 'Actualizando')
    );

    $$('[data-leave]').forEach(node => node.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Abandonar servidor',
            message: `CatBot saldrá de “${node.dataset.name}”. Los miembros perderán el acceso a sus comandos hasta que lo reinvites.`,
            confirmLabel: 'Abandonar',
        });
        if (!ok) return;
        try {
            await api(`/api/servers/${node.dataset.leave}/leave`, { method: 'POST' });
            toastOk('Servidor abandonado', node.dataset.name);
            navigate('admin-servers');
        } catch (error) {
            toastErr('No se pudo abandonar', error.message);
        }
    }));
};

/* ── Admin · blacklist ────────────────────────────────────────────────────── */
PAGES['admin-blacklist'] = async () => {
    const list = await api('/api/blacklist');
    const rows = list.map(entry => `<tr>
        <td><span class="mono-chip">${esc(entry.userID)}</span></td>
        <td class="actions">
            <button type="button" class="btn btn-sm btn-ghost" data-unban="${esc(entry.userID)}">Desbloquear</button>
        </td>
    </tr>`).join('') || emptyTable(2, 'La blacklist está vacía.');

    return `
        <div class="page-head">
            <div>
                <h1>Blacklist global</h1>
                <p>Usuarios bloqueados en todos los servidores. ${nf.format(list.length)} en total.</p>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Añadir usuario')}
            <div class="panel-body">
                <div class="input-group">
                    <input class="input mono" id="bl-id" placeholder="ID de usuario de Discord" aria-label="ID de usuario" inputmode="numeric">
                    <button type="button" class="btn btn-danger" id="bl-add">Bloquear</button>
                </div>
                <div class="field-hint" style="margin-top:8px">La ID es un número de 17–20 dígitos. Puedes copiarla activando el modo desarrollador en Discord.</div>
                <div class="field-error" id="bl-error" hidden></div>
            </div>
        </div>

        <div class="panel">
            ${panelHead('Usuarios bloqueados')}
            <div class="table-wrap"><table class="data">
                <thead><tr><th>Usuario</th><th></th></tr></thead>
                <tbody>${rows}</tbody>
            </table></div>
        </div>
    `;
};

PAGES['admin-blacklist:init'] = () => {
    const input = $('#bl-id');
    const error = $('#bl-error');
    input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); });

    const add = (event) => {
        error.hidden = true;
        const id = input.value.trim();
        if (!/^\d{15,20}$/.test(id)) {
            error.textContent = 'Introduce una ID válida (15–20 dígitos).';
            error.hidden = false;
            input.setAttribute('aria-invalid', 'true');
            input.focus();
            return;
        }
        withBusy(event.currentTarget, async () => {
            await api('/api/blacklist', { method: 'POST', body: { userId: id } });
            toastOk('Usuario bloqueado', id);
            navigate('admin-blacklist');
        }, 'Bloqueando');
    };

    $('#bl-add').addEventListener('click', add);
    input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); add(event); } });

    $$('[data-unban]').forEach(node => node.addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Desbloquear usuario',
            message: `El usuario ${node.dataset.unban} podrá volver a usar CatBot en todos los servidores.`,
            confirmLabel: 'Desbloquear',
        });
        if (!ok) return;
        try {
            await api(`/api/blacklist/${node.dataset.unban}`, { method: 'DELETE' });
            toastOk('Usuario desbloqueado', node.dataset.unban);
            navigate('admin-blacklist');
        } catch (error) {
            toastErr('No se pudo desbloquear', error.message);
        }
    }));
};

/* ── Go ───────────────────────────────────────────────────────────────────── */
boot();