// Login / register dialogs (demo only – wire these to the real login.php / create.php).
const dialogs = {
  login: document.getElementById('login-dialog'),
  register: document.getElementById('register-dialog'),
};

function showToast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 2800);
}

document.querySelectorAll('[data-open]').forEach((btn) => {
  btn.addEventListener('click', () => {
    Object.values(dialogs).forEach((d) => d?.open && d.close());
    dialogs[btn.dataset.open]?.showModal();
  });
});

Object.values(dialogs).forEach((dialog) => {
  if (!dialog) return;
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    dialog.close();
    showToast('Demo only – forms are not connected in this preview.');
  });
});

// Shop category filter.
const chips = document.querySelectorAll('.chip[data-filter]');
const items = document.querySelectorAll('.item[data-cat]');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const cat = chip.dataset.filter;
    items.forEach((item) => { item.hidden = cat !== 'all' && item.dataset.cat !== cat; });
  });
});

// Placeholder buttons (e.g. the Discord invite) and the character search are demo-only.
document.querySelectorAll('[data-toast]').forEach((btn) => {
  btn.addEventListener('click', () => showToast(btn.dataset.toast));
});
document.getElementById('find-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Demo only – character search is not connected in this preview.');
});

// Copy the server IP.
document.getElementById('copy-ip')?.addEventListener('click', async (e) => {
  const ip = document.getElementById('server-ip').textContent;
  try {
    await navigator.clipboard.writeText(ip);
    e.currentTarget.textContent = 'Copied!';
    setTimeout(() => { e.currentTarget.textContent = 'Copy'; }, 1800);
  } catch {
    showToast('Select the IP and copy it manually.');
  }
});

// Serversave countdown. Assumption: server time is Europe/Stockholm – change SERVER_TZ to the real one.
const SERVER_TZ = 'Europe/Stockholm';
const countdownEl = document.getElementById('countdown');
if (countdownEl) {
  const targetHour = Number(countdownEl.dataset.hour);
  const secondsSinceMidnight = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: SERVER_TZ, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
    }).formatToParts(new Date()).map((x) => [x.type, Number(x.value)]));
    return p.hour * 3600 + p.minute * 60 + p.second;
  };
  const tick = () => {
    let left = targetHour * 3600 - secondsSinceMidnight();
    if (left <= 0) left += 86400;
    const pad = (n) => String(n).padStart(2, '0');
    countdownEl.textContent = `${pad(Math.floor(left / 3600))}:${pad(Math.floor(left % 3600 / 60))}:${pad(left % 60)}`;
  };
  tick();
  setInterval(tick, 1000);
}
