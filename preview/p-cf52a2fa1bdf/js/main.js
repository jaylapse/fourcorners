/* Concept preview. Design and code (c) 2026 Four Corners Games. Not licensed for use, copying or redistribution without a written agreement. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const live = msg => { const l = $('#live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 30); } };

  /* 1. Icon sprite. Placeholder icons, James to swap if desired. 24px grid, 2px round stroke. */
  const P = {
    download: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.5 2 4.5 5"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H4v2a3 3 0 0 0 4 2.8M16 6h4v2a3 3 0 0 1-4 2.8M12 14v4M8 20h8"/>',
    crown: '<path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 2-2.5 1-2.5 2 1 1.7 2.5 1.7 2.5-.7 2.5-1.7M12 6.5v1.3m0 8.4v1.3"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    alert: '<path d="M12 3l10 18H2zM12 10v5M12 18v.01"/>',
    chat: '<path d="M4 5h16v11H10l-4 4v-4H4z"/>',
    stream: '<path d="M4 4h16v12h-5l-3 3-3-3H4zM12 8v4M16 8v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    home: '<path d="M3 11.5l9-7.5 9 7.5M5.5 10v10h4.5v-6h4v6h4.5V10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9.5l3 2.5-3 2.5M13 15h4"/>',
    zap: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8V7a3 3 0 0 1 6 0v1"/>',
    heart: '<path d="M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z"/>'
  };
  document.body.insertAdjacentHTML('afterbegin',
    '<svg id="icon-sprite" class="sr-only" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false">' +
    Object.keys(P).map(k => `<symbol id="i-${k}" viewBox="0 0 24 24">${P[k]}</symbol>`).join('') + '</svg>');

  /* 2. Toast (max one at a time) */
  let toastTimer;
  const toast = msg => {
    let reg = $('.toast-region');
    if (!reg) { reg = document.createElement('div'); reg.className = 'toast-region'; reg.setAttribute('aria-live', 'polite'); document.body.append(reg); }
    reg.textContent = '';
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; reg.append(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 3000);
  };

  /* 3. View router: hash-based, client-side only. Views are toggled with [hidden]. */
  const LABELS = {
    home: 'Home', account: 'Account', download: 'Download', map: 'Full map', info: 'Info', commands: 'Commands',
    lag: 'Fix lag', premium: 'Premium', shop: 'Item shop', donate: 'Donate', contact: 'Contact'
  };
  const stage = $('#main');
  const views = {};
  $$('[data-view]').forEach(v => { views[v.dataset.view] = v; });
  const navLinks = $$('.sidenav a[data-view-link]');
  const strip = $('.sidenav');
  let current = null;

  const show = (name, focus) => {
    if (name !== current) {
      Object.keys(views).forEach(k => { views[k].hidden = k !== name; });
      current = name;
    }
    let active = null;
    navLinks.forEach(a => {
      if (a.dataset.viewLink === name) { a.setAttribute('aria-current', 'page'); active = a; }
      else a.removeAttribute('aria-current');
    });
    document.title = `${LABELS[name]} - BubbaGame`;
    if (stage) stage.scrollTop = 0;
    window.scrollTo(0, 0);
    if (active && strip && strip.scrollWidth > strip.clientWidth) {
      strip.scrollLeft += active.getBoundingClientRect().left - strip.getBoundingClientRect().left - (strip.clientWidth - active.offsetWidth) / 2;
    }
    if (focus) { const h = $('[tabindex="-1"]', views[name]); if (h) h.focus({ preventScroll: true }); }
  };
  const route = focus => {
    let raw = '';
    try { raw = decodeURIComponent(location.hash.slice(1)).toLowerCase(); } catch (err) { raw = ''; }
    if (raw === 'main') return;
    const name = Object.prototype.hasOwnProperty.call(LABELS, raw) && views[raw] ? raw : 'home';
    if (raw && name === 'home' && raw !== 'home') history.replaceState(null, '', '#home');
    show(name, focus);
  };
  if (Object.keys(views).length) {
    addEventListener('hashchange', () => route(true));
    route(false);
  }
  const skip = $('.skip-link');
  if (skip && stage) skip.addEventListener('click', e => { e.preventDefault(); stage.focus(); });

  /* 4. Demo forms */
  $$('form[data-demo-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); toast('Demo only – forms are not connected in this preview.');
  }));

  /* 5. Copy buttons (button captured before any await) */
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy]'); if (!btn) return;
    const text = btn.dataset.copy, label = btn.dataset.copyLabel || 'Text';
    try {
      await navigator.clipboard.writeText(text);
      if (btn.dataset.busy) return;
      btn.dataset.busy = '1';
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"/></svg>Copied!<span class="sr-only"> ' + label + '</span>';
      btn.classList.add('is-copied');
      live(label + ' copied');
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('is-copied'); delete btn.dataset.busy; }, 1800);
    } catch (err) {
      const code = (btn.closest('tr, p') || btn.parentElement).querySelector('code');
      if (code) { const s = getSelection(), r = document.createRange(); r.selectNodeContents(code); s.removeAllRanges(); s.addRange(r); }
      toast('Press Ctrl+C to copy');
    }
  });

  /* 6. Serversave countdown */
  // CONFIRM: server time zone (EU-hosted, prices in SEK suggest Sweden)
  const SERVER_TZ = 'Europe/Stockholm';
  const cds = $$('[data-countdown]');
  if (cds.length) {
    let fmt;
    try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: SERVER_TZ, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    catch (err) { fmt = new Intl.DateTimeFormat('en-GB', { hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    const pad = n => String(n).padStart(2, '0');
    const tickCd = () => {
      const p = {}; fmt.formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
      const now = +p.hour * 3600 + +p.minute * 60 + +p.second;
      cds.forEach(el => {
        const [h, m] = el.dataset.countdown.split(':');
        let d = +h * 3600 + +m * 60 - now; if (d <= 0) d += 86400;
        el.textContent = `${pad(Math.floor(d / 3600))}:${pad(Math.floor(d % 3600 / 60))}:${pad(d % 60)}`;
      });
    };
    tickCd(); setInterval(tickCd, 1000);
  }

  /* 7. Shop category filter */
  const applyFilter = g => {
    const on = $(`.chip[data-filter-group="${g}"][aria-pressed="true"]`);
    const f = on ? on.dataset.filter : 'all';
    let n = 0;
    $$(`[data-filter-item="${g}"]`).forEach(i => { const show = f === 'all' || i.dataset.cat === f; i.hidden = !show; if (show) n++; });
    $$(`[data-filter-count="${g}"]`).forEach(c => { c.textContent = `Showing ${n} ${c.dataset.noun || 'items'}`; });
  };
  document.addEventListener('click', e => {
    const c = e.target.closest('.chip[data-filter-group]'); if (!c) return;
    const g = c.dataset.filterGroup;
    $$(`.chip[data-filter-group="${g}"]`).forEach(x => x.setAttribute('aria-pressed', x === c));
    applyFilter(g);
  });
  new Set($$('.chip[data-filter-group]').map(c => c.dataset.filterGroup)).forEach(applyFilter);
})();
