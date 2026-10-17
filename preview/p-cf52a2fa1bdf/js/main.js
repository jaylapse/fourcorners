/* Concept preview. Design and code (c) 2026 Four Corners Games. Not licensed for use, copying or redistribution without a written agreement. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const live = msg => { const l = $('#live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 30); } };

  /* 1. Icon sprite. Placeholder icons, James to swap if desired. */
  const P = {
    download: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v3h16v-3"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4.5 2 4.5 5"/>',
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 2.5 1.2 4.2 3 5.3V20h10v-3.7c1.8-1.1 3-2.8 3-5.3a8 8 0 0 0-8-8z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 20v-2m4 2v-2"/>',
    trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H4v2a3 3 0 0 0 4 2.8M16 6h4v2a3 3 0 0 1-4 2.8M12 14v4M8 20h8"/>',
    crown: '<path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4z"/>',
    scroll: '<path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6M6 4a2 2 0 0 0-2 2v1h3V6a2 2 0 0 0-1-2zM7 7v11a2 2 0 0 1-3 1.7M10 9h6M10 13h6"/>',
    rune: '<path d="M12 2.5l8 9.5-8 9.5L4 12zM12 7v10M9 10l3-3 3 3"/>',
    box: '<path d="M3.5 8L12 4l8.5 4v8L12 20l-8.5-4zM3.5 8L12 12m0 0l8.5-4M12 12v8"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 2-2.5 1-2.5 2 1 1.7 2.5 1.7 2.5-.7 2.5-1.7M12 6.5v1.3m0 8.4v1.3"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    alert: '<path d="M12 3l10 18H2zM12 10v5M12 18v.01"/>',
    chat: '<path d="M4 5h16v11H10l-4 4v-4H4z"/>',
    stream: '<path d="M4 4h16v12h-5l-3 3-3-3H4zM12 8v4M16 8v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'
  };
  const sprite = '<svg id="icon-sprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">' +
    Object.keys(P).map(k => `<symbol id="i-${k}" viewBox="0 0 24 24">${P[k]}</symbol>`).join('') + '</svg>';
  document.body.insertAdjacentHTML('afterbegin', sprite);

  /* Toast (max one at a time) */
  let toastTimer;
  const toast = msg => {
    let reg = $('.toast-region');
    if (!reg) { reg = document.createElement('div'); reg.className = 'toast-region'; reg.setAttribute('aria-live', 'polite'); document.body.append(reg); }
    reg.textContent = '';
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; reg.append(t);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 3000);
  };

  /* 2. Masthead scroll state */
  const mast = $('[data-masthead]');
  if (mast) {
    let tick = false;
    const upd = () => { tick = false; mast.classList.toggle('is-scrolled', window.scrollY > 8); };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* 3. Mobile nav sheet */
  const nav = $('#site-nav'), tog = $('[data-nav-toggle]');
  const setNav = (open, focus) => {
    if (!nav || !tog) return;
    nav.classList.toggle('is-open', open);
    tog.setAttribute('aria-expanded', open);
    document.documentElement.classList.toggle('nav-open', open);
    const u = $('use', tog); if (u) u.setAttribute('href', open ? '#i-close' : '#i-menu');
    if (open) { const a = $('a', nav); if (a) a.focus(); } else if (focus) tog.focus();
  };
  if (nav && tog) {
    tog.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('click', e => { if (nav.classList.contains('is-open') && !nav.contains(e.target) && !tog.contains(e.target)) setNav(false); });
    matchMedia('(min-width:960px)').addEventListener('change', e => { if (e.matches) setNav(false); });
  }

  /* 4. Community disclosure */
  $$('[data-disclosure]').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')), group = btn.parentElement;
    const set = open => { btn.setAttribute('aria-expanded', open); panel.hidden = !open; };
    btn.addEventListener('click', () => set(panel.hidden));
    group.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
    group.addEventListener('focusout', e => { if (e.relatedTarget && !group.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', e => { if (!group.contains(e.target)) set(false); });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) setNav(false, true);
  });

  /* 5. Dialogs */
  $$('dialog.dialog').forEach(d => d.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return d.close();
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  }));
  $$('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (!o) return;
    const d = document.getElementById(o.dataset.open + '-dialog'); if (!d) return;
    setNav(false);
    $$('dialog[open]').forEach(x => x.close());
    d.showModal();
    const f = $('input', d); if (f) f.focus();
  });
  $$('form[data-demo-form]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); f.closest('dialog').close(); toast('Demo only – forms are not connected in this preview.');
  }));

  /* 6. Copy buttons (button captured before any await) */
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

  /* 7. Serversave countdown */
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

  /* 8. Tabs */
  $$('[data-tabs]').forEach(t => {
    const tabs = $$('[role=tab]', t);
    const act = (tab, focus) => {
      tabs.forEach(x => {
        const on = x === tab;
        x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        const p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => act(tab));
      tab.addEventListener('keydown', e => {
        const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault(); act(tabs[(k + tabs.length) % tabs.length], true);
      });
    });
    const h = location.hash.slice(1);
    act(tabs.find(x => x.getAttribute('aria-controls') === h) || tabs.find(x => x.getAttribute('aria-selected') === 'true') || tabs[0]);
  });

  /* 9. Filters */
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

  /* 10. Sort select */
  $$('select[data-sort-target]').forEach(sel => sel.addEventListener('change', () => {
    const box = $(sel.dataset.sortTarget); if (!box) return;
    const v = sel.value, o = x => +x.dataset.order || 0, pr = x => +x.dataset.price || 0;
    const cmp = v === 'price-asc' ? (a, b) => pr(a) - pr(b) || o(a) - o(b)
      : v === 'price-desc' ? (a, b) => pr(b) - pr(a) || o(a) - o(b) : (a, b) => o(a) - o(b);
    [...box.children].sort(cmp).forEach(c => box.append(c));
    live('Sorted by ' + sel.options[sel.selectedIndex].text);
  }));

  /* 11. Sortable tables */
  document.addEventListener('click', e => {
    const b = e.target.closest('.th-sort'); if (!b) return;
    const th = b.closest('th'), table = th.closest('table[data-sort-table]'); if (!table) return;
    const num = b.dataset.sortType === 'num', cur = th.getAttribute('aria-sort');
    const dir = cur === 'ascending' ? 'descending' : cur === 'descending' ? 'ascending' : (num ? 'descending' : 'ascending');
    $$('th', table).forEach(x => { if (x.hasAttribute('aria-sort')) x.setAttribute('aria-sort', 'none'); });
    th.setAttribute('aria-sort', dir);
    const i = th.cellIndex, tb = table.tBodies[0];
    const val = r => { const t = r.cells[i].textContent.trim(); return num ? parseFloat(t.replace(/,/g, '')) || 0 : t.toLowerCase(); };
    [...tb.rows].sort((a, c) => { const x = val(a), y = val(c); return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'ascending' ? 1 : -1); })
      .forEach(r => tb.append(r));
    live(`Sorted by ${b.textContent.trim()}, ${dir}`);
  });

  /* 12. Data-toast */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-toast]'); if (!t) return;
    if (t.tagName === 'A') e.preventDefault();
    toast(t.dataset.toast);
  });

  /* 13. Character name echo (textContent only) */
  const note = $('[data-character-notice]');
  if (note) {
    const name = (new URLSearchParams(location.search).get('name') || '').trim();
    if (name) {
      const inp = $('form.search input[name=name]'); if (inp) inp.value = name;
      if (name.toLowerCase() !== (note.dataset.sampleName || '').toLowerCase()) {
        $$('[data-character-name]', note).forEach(s => { s.textContent = name; });
        note.hidden = false;
      }
    }
  }

  /* 14. TOC scrollspy */
  const links = $$('.toc a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => { if (l.getAttribute('href') === '#' + en.target.id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
    }), { rootMargin: '-30% 0px -60% 0px' });
    links.forEach(l => { const s = document.getElementById(l.getAttribute('href').slice(1)); if (s) io.observe(s); });
  }
})();
