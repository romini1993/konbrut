/**
 * lead.js - fitur "data per lead" untuk Trading Log.
 * Taruh satu folder dengan index.html, lalu muat SETELAH Database.js dan SEBELUM script utama:
 *   <script src="./Database.js"></script>
 *   <script src="./lead.js"></script>
 *
 * Cara kerja:
 *  - Tiap lead = satu tab di Google Sheet (tab pertama bernama sama dengan username = lead DEFAULT_LEAD).
 *  - Lead aktif dikirim ke Apps Script lewat parameter &lead= di setiap panggilan.
 *  - Cache data di HP dipisah per lead (lewat LEAD_TAG yang dipakai index.html).
 */
(function () {
  // HARUS sama dengan DEFAULT_LEAD di Code.gs
  var DEFAULT_LEAD = 'Utama';

  var CFG = window.APP_CONFIG || {};
  var ACCT = !!CFG.ACCOUNTS_URL;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // username akun aktif (sama logikanya dengan pemilihan SESSION di index.html)
  function activeUser() {
    try {
      var a = lsGet('acct:active');
      if (a) return a;
      var old = JSON.parse(lsGet('acct:session') || 'null');
      if (old && old.user) return old.user;
      var map = JSON.parse(lsGet('acct:sessions') || 'null') || {};
      return Object.keys(map)[0] || '';
    } catch (e) { return ''; }
  }

  // Kunci memakai pola "...:u:<user>" supaya ikut terhapus saat keluar akun (clearAccountLocalData)
  var USER = ACCT ? activeUser() : '';
  var K_LEADS = 'leads:u:' + USER;
  var K_ACTIVE = 'activeLead:u:' + USER;

  function readLeads() {
    try {
      var a = JSON.parse(lsGet(K_LEADS) || '[]');
      if (a && a.length) return a;
    } catch (e) {}
    return [DEFAULT_LEAD];
  }

  var LEADS = readLeads();
  var ACTIVE = (function () {
    var l = lsGet(K_ACTIVE);
    return LEADS.indexOf(l) >= 0 ? l : LEADS[0];
  })();

  // dipakai index.html pada CACHE_KEY / CACHE_URL_KEY / SIDE_MAP_KEY
  window.LEAD_TAG = (ACCT && ACTIVE !== DEFAULT_LEAD) ? '~' + ACTIVE : '';
  window.ACTIVE_LEAD = ACTIVE;

  if (!ACCT) return;   // mode lama (tanpa akun): fitur lead tidak aktif

  // ───────── gaya ─────────
  var css = document.createElement('style');
  css.textContent =
    '.leadbar{display:flex;gap:6px;overflow-x:auto;padding:8px 6px 4px;scrollbar-width:none;-ms-overflow-style:none}' +
    '.leadbar::-webkit-scrollbar{display:none}' +
    '.lead-chip{flex:none;padding:6px 14px;border-radius:999px;font-size:12px !important;font-weight:600;font-family:inherit;' +
    'background:var(--surface-2);border:1px solid var(--border);color:var(--text-dim);cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.lead-chip.on{background:var(--accent);border-color:var(--accent);color:#fff}' +
    '#leadBar2{display:none}' +
    'body[data-view="stats"] #widgetsCol #leadBar2{display:flex}';
  document.head.appendChild(css);

  // ───────── UI ─────────
  function fillBar(bar) {
    bar.textContent = '';
    LEADS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lead-chip' + (l === ACTIVE ? ' on' : '');
      b.textContent = l;
      b.addEventListener('click', function () { switchLead(l); });
      bar.appendChild(b);
    });
    var add = document.createElement('button');
    add.type = 'button';
    add.className = 'lead-chip';
    add.textContent = '+ Lead';
    add.addEventListener('click', openAddLead);
    bar.appendChild(add);
  }

  function ensureBar(id, parent) {
    var bar = document.getElementById(id);
    if (!bar && parent) {
      bar = document.createElement('div');
      bar.id = id;
      bar.className = 'leadbar';
      parent.prepend(bar);
    }
    return bar;
  }

  function renderLeadBar() {
    if (typeof SESSION === 'undefined' || !SESSION) return;   // belum masuk: tidak ada bar
    var b1 = ensureBar('leadBar', document.getElementById('colList'));
    var b2 = ensureBar('leadBar2', document.getElementById('widgetsCol'));
    if (b1) fillBar(b1);
    if (b2) fillBar(b2);
  }

  function setLeads(arr) {
    if (!arr || !arr.length) return;
    if (JSON.stringify(arr) === JSON.stringify(LEADS)) return;
    LEADS = arr;
    lsSet(K_LEADS, JSON.stringify(arr));
    renderLeadBar();
  }

  function switchLead(l) {
    if (l === ACTIVE) return;
    lsSet(K_ACTIVE, l);
    location.reload();   // sama seperti ganti profil: state lama dibuang bersih
  }

  function openAddLead() {
    if (typeof showDialog !== 'function') return;
    showDialog({
      title: 'Tambah lead',
      desc: 'Tiap lead punya tab, data, dan statistik sendiri.',
      fields: [{ id: 'n', label: 'Nama lead', max: 20 }],
      okText: 'Tambah',
      onConfirm: async function (v) {
        var name = String(v.n || '').trim();
        if (!/^[A-Za-z0-9_ -]{2,20}$/.test(name)) throw new Error('Pakai huruf, angka, spasi, _ atau -, 2-20 karakter');
        if (LEADS.some(function (x) { return x.toLowerCase() === name.toLowerCase(); })) throw new Error('Lead sudah ada');
        var r = await fetch(apiUrl('action=addlead&name=' + encodeURIComponent(name) + '&rid=' + newRid()), { cache: 'no-store' }).then(function (x) { return x.json(); });
        if (checkAuthError(r)) return;
        if (!r || r.error) throw new Error((r && r.msg) || 'Gagal menambah lead');
        lsSet(K_LEADS, JSON.stringify(r.leads));
        lsSet(K_ACTIVE, r.lead);
        location.reload();
      }
    });
  }

  // ───────── kaitkan ke fungsi index.html (dipasang saat DOMContentLoaded, sebelum data pertama diminta) ─────────
  document.addEventListener('DOMContentLoaded', function () {
    // 1) setiap panggilan ke Apps Script membawa lead aktif
    if (typeof window.apiUrl === 'function') {
      var origApi = window.apiUrl;
      window.apiUrl = function (q) { return origApi(q) + '&lead=' + encodeURIComponent(ACTIVE); };
    }
    // 2) daftar lead dari server ikut tersimpan (data biasa membawa profile.leads)
    if (typeof window.applyServerProfile === 'function') {
      var origProfile = window.applyServerProfile;
      window.applyServerProfile = function (pr) {
        if (pr && pr.leads) setLeads(pr.leads);
        return origProfile.apply(this, arguments);
      };
    }
    // 3) saat masuk / buat akun, simpan daftar lead dari respons login
    if (typeof window.addSessionFromLogin === 'function') {
      var origLogin = window.addSessionFromLogin;
      window.addSessionFromLogin = function (r) {
        var pr = r && r.profile;
        if (pr && pr.leads && pr.user) lsSet('leads:u:' + pr.user, JSON.stringify(pr.leads));
        return origLogin.apply(this, arguments);
      };
    }
    renderLeadBar();
  });
})();
