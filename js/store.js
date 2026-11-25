/* Ayusin Natin — data layer at auth (DEMO).
   Dito lang dumadaan ang lahat ng basa at sulat ng data. Sa ngayon, seed data + localStorage.
   Kapag ikakabit na ang totoong backend, itong file lang ang papalitan:
     AN.store.*  -> mga tawag sa API / database
     AN.auth.*   -> totoong login (Google Sign-In, username + password) */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  var KEY = 'ayusin-natin:demo:v1';
  var VERSION = 2; // v2: profile photo, ranking, Contact Us messages, mas maraming demo user at report
  var state = null;
  var listeners = [];
  var persisted = true;
  var byName = {}, statsCache = null, rankCache = null;

  function fresh() {
    var seed = AN.buildSeed(Date.now());
    return { version: VERSION, reports: seed.reports, users: seed.users, feedback: [], session: { username: 'juan_dc', role: 'user' }, nextId: seed.nextId, nextFeedback: 1 };
  }

  function reindex() {
    byName = {};
    state.users.forEach(function (u) { byName[u.username] = u; });
    statsCache = null; rankCache = null;
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) { state = null; }
    if (!state || state.version !== VERSION || !Array.isArray(state.reports)) {
      state = fresh();
      save();
    }
    if (!Array.isArray(state.feedback)) state.feedback = [];
    if (!state.nextFeedback) state.nextFeedback = state.feedback.length + 1;
    reindex();
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      persisted = true;
    } catch (e) {
      persisted = false; // puno ang storage o naka-block: tuloy pa rin sa memory
    }
    return persisted;
  }

  function emit() {
    listeners.slice().forEach(function (fn) { try { fn(); } catch (e) { /* tuloy lang */ } });
  }

  function commit() { statsCache = null; rankCache = null; var ok = save(); emit(); return ok; }
  function nowISO() { return new Date().toISOString(); }
  function find(id) { return state.reports.filter(function (r) { return r.id === id; })[0] || null; }
  function me() { return state.session; }
  function groupOf(status) { return (AN.STATUSES[status] || AN.STATUSES.naiulat).group; }
  function newest(a, b) { return a.at < b.at ? 1 : -1; }

  var ZERO = { reports: 0, fixed: 0, fixes: 0, confirms: 0, affected: 0, score: 0, lastAt: '' };

  /** Contribution ng bawat user, kinukwenta mula sa mga report (hindi kasama ang hidden).
      Points: tingnan ang AN.SCORING sa js/seed.js. */
  function computeStats() {
    var by = {};
    var pts = {};
    AN.SCORING.forEach(function (s) { pts[s.key] = s.points; });
    function get(n) { return by[n] || (by[n] = { reports: 0, fixed: 0, fixes: 0, confirms: 0, affected: 0, score: 0, lastAt: '' }); }
    state.reports.forEach(function (r) {
      if (r.hidden) return;
      var s = get(r.reporter);
      s.reports += 1;
      if (groupOf(r.status) === 'ayos') s.fixed += 1;
      if (r.createdAt > s.lastAt) s.lastAt = r.createdAt;
      r.history.forEach(function (h) {
        if (h.type === 'naayos' && h.by !== r.reporter) get(h.by).fixes += 1;
        else if (h.type === 'kumpirmado' && h.by !== r.reporter) get(h.by).confirms += 1;
      });
      r.affectedBy.forEach(function (n) { if (n !== r.reporter) get(n).affected += 1; });
    });
    Object.keys(by).forEach(function (n) {
      var s = by[n];
      s.score = s.reports * pts.reports + s.fixed * pts.fixed + s.fixes * pts.fixes + s.confirms * pts.confirms + s.affected * pts.affected;
    });
    return by;
  }

  var store = {
    /** Mga ulat na nakikita ng publiko, pinakabago muna. */
    list: function () {
      return state.reports.filter(function (r) { return !r.hidden; }).sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
    },
    /** Lahat, kasama ang mga tinanggihan (para sa admin). */
    all: function () { return state.reports.slice().sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; }); },
    get: find,
    users: function () { return state.users.slice(); },
    /** Isang user ayon sa username (o null). Mabilis: naka-index. */
    user: function (username) { return byName[username] || null; },
    isPersisted: function () { return persisted; },
    on: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; },

    /* ---------- Contribution at ranking ---------- */
    statsAll: function () { return statsCache || (statsCache = computeStats()); },
    stats: function (username) { return store.statsAll()[username] || ZERO; },
    /** Lahat ng hindi suspended na user, naka-sort ayon sa points (top contributor muna). [{ user, stats, rank }] */
    ranking: function () {
      if (rankCache) return rankCache;
      var st = store.statsAll();
      var list = state.users.filter(function (u) { return !u.suspended; }).map(function (u) { return { user: u, stats: st[u.username] || ZERO }; });
      list.sort(function (a, b) { return b.stats.score - a.stats.score || b.stats.reports - a.stats.reports || (a.user.username < b.user.username ? -1 : 1); });
      list.forEach(function (x, i) { x.rank = i + 1; });
      rankCache = list;
      return list;
    },
    rankOf: function (username) {
      return store.ranking().filter(function (x) { return x.user.username === username; })[0] || null;
    },

    /* ---------- Profile photo ---------- */
    /** Profile photo ng naka-sign in na user (data URL na maliit, o null para tanggalin). */
    setPhoto: function (dataUrl) {
      var s = me();
      if (!s) return { ok: false, error: 'Mag-sign in muna.' };
      var u = byName[s.username];
      if (!u) return { ok: false, error: 'Hindi mahanap ang account.' };
      u.photo = dataUrl || null;
      return { ok: true, saved: commit() };
    },

    create: function (data) {
      var s = me();
      var at = nowISO();
      var report = {
        id: 'AN-' + String(state.nextId++).padStart(6, '0'),
        title: data.title, description: data.description || '', category: data.category, categoryOther: data.categoryOther || '', severity: data.severity || 'abala',
        status: 'naiulat', hidden: false, needsReview: true,
        lat: data.lat, lng: data.lng, accuracy: data.accuracy == null ? null : Math.round(data.accuracy), locationSource: data.locationSource || 'pin',
        region: data.region || '', province: data.province || '', city: data.city || '', barangay: data.barangay || '', landmark: data.landmark || '',
        photos: (data.photos || []).map(function (src) { return { kind: 'before', src: src, by: s.username, at: at }; }),
        reporter: s.username, createdAt: at, updatedAt: at,
        affected: 1, affectedBy: [s.username], confirmations: 0, confirmedBy: [],
        history: [{ type: 'naiulat', by: s.username, role: s.role, at: at, note: data.description || '' }],
        termsAcceptedAt: data.termsAcceptedAt || null,
        demo: false
      };
      state.reports.push(report);
      return { report: report, saved: commit() };
    },

    /** Update mula sa user: 'hindi-pa' | 'inaaksyunan' | 'naayos'. Kailangan ng litrato kapag 'naayos'. */
    addUpdate: function (id, upd) {
      var r = find(id); var s = me();
      if (!r || !s) return { ok: false, error: 'Hindi mahanap ang report o hindi ka naka-sign in.' };
      if (upd.type === 'naayos' && !upd.photo) return { ok: false, error: 'Kailangan ng bagong photo kapag Fixed na ang pinili.' };
      var at = nowISO();
      if (upd.photo) r.photos.push({ kind: upd.type === 'naayos' ? 'after' : 'update', src: upd.photo, by: s.username, at: at });
      if (upd.type === 'naayos') { r.status = 'naayos'; r.confirmations = 0; r.confirmedBy = [s.username]; }
      else if (upd.type === 'inaaksyunan') { r.status = 'inaaksyunan'; }
      else { r.status = r.history.some(function (h) { return h.type === 'na-verify'; }) ? 'na-verify' : 'naiulat'; }
      r.history.push({ type: upd.type, by: s.username, role: s.role, at: at, note: upd.note || '' });
      r.updatedAt = at;
      return { ok: true, saved: commit() };
    },

    /** Kumpirmasyon na naayos na nga. Nag-ulat, moderator o admin: agad na kumpirmado. Iba: 3 kumpirmasyon. */
    confirmFixed: function (id) {
      var r = find(id); var s = me();
      if (!r || !s || r.status !== 'naayos') return { ok: false };
      if (r.confirmedBy.indexOf(s.username) !== -1) return { ok: false, error: 'Naka-confirm ka na o ikaw ang nag-update nito.' };
      r.confirmedBy.push(s.username);
      r.confirmations += 1;
      var strong = s.username === r.reporter || s.role === 'moderator' || s.role === 'admin';
      if (strong || r.confirmations >= 3) {
        r.status = 'kumpirmado';
        r.history.push({ type: 'kumpirmado', by: s.username, role: s.role, at: nowISO(), note: strong ? 'Na-confirm ng ' + (s.username === r.reporter ? 'reporter' : AN.ROLES[s.role].toLowerCase()) + '.' : 'Sapat na ang confirmations ng residents.' });
      }
      r.updatedAt = nowISO();
      commit();
      return { ok: true, done: r.status === 'kumpirmado' };
    },

    toggleAffected: function (id) {
      var r = find(id); var s = me();
      if (!r || !s) return false;
      var i = r.affectedBy.indexOf(s.username);
      if (i === -1) { r.affectedBy.push(s.username); r.affected += 1; } else { r.affectedBy.splice(i, 1); r.affected -= 1; }
      commit();
      return i === -1;
    },

    /* ---------- Contact Us (suggestion, additional feature, bug) ---------- */
    feedback: function () { return state.feedback.slice().sort(newest); },
    addFeedback: function (d) {
      var s = me();
      var item = {
        id: 'CU-' + String(state.nextFeedback++).padStart(4, '0'),
        type: d.type || 'suggestion', name: (d.name || '').trim(), email: (d.email || '').trim(), message: (d.message || '').trim(),
        by: s ? s.username : '', at: nowISO(), status: 'new'
      };
      state.feedback.push(item);
      return { item: item, saved: commit() };
    },
    setFeedbackStatus: function (id, status) {
      var f = state.feedback.filter(function (x) { return x.id === id; })[0];
      if (!f || ['new', 'read', 'done'].indexOf(status) === -1) return false;
      f.status = status;
      commit();
      return true;
    },
    removeFeedback: function (id) {
      state.feedback = state.feedback.filter(function (x) { return x.id !== id; });
      commit();
    },

    /** Admin / moderator. */
    moderate: function (id, action, note) {
      var r = find(id); var s = me();
      if (!r || !s) return false;
      var at = nowISO();
      r.needsReview = false;
      if (action === 'approve') {
        if (r.status === 'naiulat') r.status = 'na-verify';
        r.hidden = false;
        r.history.push({ type: 'na-verify', by: s.username, role: s.role, at: at, note: note || 'Na-approve ng moderator.' });
      } else if (action === 'reject') {
        r.hidden = true;
        r.history.push({ type: 'tinanggihan', by: s.username, role: s.role, at: at, note: note || 'Hindi pumasa sa review.' });
      } else if (action === 'restore') {
        r.hidden = false;
        r.needsReview = true;
      }
      r.updatedAt = at;
      commit();
      return true;
    },
    setStatus: function (id, status) {
      var r = find(id); var s = me();
      if (!r || !s || !AN.STATUSES[status]) return false;
      r.status = status;
      r.history.push({ type: status, by: s.username, role: s.role, at: nowISO(), note: 'In-update ng ' + AN.ROLES[s.role].toLowerCase() + '.' });
      r.updatedAt = nowISO();
      commit();
      return true;
    },
    remove: function (id) {
      state.reports = state.reports.filter(function (r) { return r.id !== id; });
      commit();
    },
    setUser: function (username, patch) {
      var u = byName[username];
      if (!u) return;
      if (patch.role) u.role = patch.role;
      if (typeof patch.suspended === 'boolean') u.suspended = patch.suspended;
      if (state.session && state.session.username === username) state.session.role = u.role;
      commit();
    },
    reset: function () { state = fresh(); reindex(); commit(); },
    exportJSON: function () { return JSON.stringify({ exportedAt: nowISO(), reports: state.reports, users: state.users, feedback: state.feedback }, null, 2); }
  };

  /* ---------- AUTH (naka-abang) ----------
     Gumagana lang ang demoSignIn/signOut. Ang iba ay sadyang hindi pa nakakabit:
     nagbabalik sila ng rejected Promise na may code na 'NOT_CONNECTED' para handa na ang UI. */
  function notConnected(what) {
    var err = new Error(what + ' ay hindi pa naka-connect. Demo mode pa lang ito.');
    err.code = 'NOT_CONNECTED';
    return Promise.reject(err);
  }

  var auth = {
    current: function () { return state.session; },
    demoSignIn: function (role) {
      var u = state.users.filter(function (x) { return x.role === role; })[0];
      state.session = { username: u.username, role: u.role };
      commit();
    },
    signOut: function () { state.session = null; commit(); },
    signInWithGoogle: function () { return notConnected('Ang Google Sign-In'); },
    signInWithPassword: function (/* username, password */) { return notConnected('Ang login gamit ang username at password'); },
    register: function (/* username, password */) { return notConnected('Ang pag-create ng account'); },
    changePassword: function (/* current, next */) { return notConnected('Ang pag-change ng password'); },
    requestPasswordReset: function (/* email */) { return notConnected('Ang pag-reset ng password'); },
    /** Mga patakaran sa password. Gamitin din ito sa server kapag may backend na. */
    passwordChecks: function (pw) {
      pw = pw || '';
      return [
        { label: 'At least 10 characters', ok: pw.length >= 10 },
        { label: 'May uppercase at lowercase letter', ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
        { label: 'May number', ok: /[0-9]/.test(pw) },
        { label: 'May symbol, gaya ng # @ ! %', ok: /[^A-Za-z0-9]/.test(pw) }
      ];
    },
    usernameError: function (name) {
      if (!/^[a-z0-9._]{3,20}$/.test(name || '')) return 'Gumamit ng 3 hanggang 20 lowercase letters, numbers, dot o underscore.';
      return '';
    }
  };

  load();
  AN.store = store;
  AN.auth = auth;
})();
