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
    exportJSON: function () {
      var users = state.users.map(function (u) { var c = {}; Object.keys(u).forEach(function (k) { if (k !== 'passwordHash' && k !== 'passwordSalt') c[k] = u[k]; }); return c; });
      return JSON.stringify({ exportedAt: nowISO(), reports: state.reports, users: users, feedback: state.feedback }, null, 2);
    }
  };

  /* ---------- AUTH (DEMO, sa browser lang) ----------
     Gumagana na ang register, sign in (username o email + password), email verification code, forgot/reset password
     at change password, pero LAHAT sa browser lang: walang database, walang email service, walang third party.
     - Ang "email" ay hindi talaga pinapadalhan: ipinapakita na lang sa screen ang 6-digit na code (demo).
     - Password: SHA-256 hash + salt lang ang naka-save sa localStorage, hindi ang mismong password.
     Kapag may backend na, palitan ang laman ng bawat function dito ng tawag sa API. Google Sign-In: hindi pa naka-connect. */
  function notConnected(what) {
    var err = new Error(what + ' ay hindi pa naka-connect. Demo mode pa lang ito.');
    err.code = 'NOT_CONNECTED';
    return Promise.reject(err);
  }
  function fail(msg) { var e = new Error(msg); e.code = 'DEMO'; return Promise.reject(e); }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var codes = {}; // 'verify:email' | 'reset:email' -> { code, exp } (sa memory lang; nawawala pag-refresh)
  var CODE_TTL = 10 * 60 * 1000;

  function randomHex(n) {
    var a = new Uint8Array(n);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(a);
    else for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function code6() { return String(100000 + (parseInt(randomHex(4), 16) % 900000)); }
  function hashPassword(pw, salt) {
    var text = salt + ':' + pw;
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      });
    }
    // Fallback kapag walang WebCrypto (hal. http sa LAN): FNV-1a, demo lang.
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return Promise.resolve('fnv:' + h.toString(16));
  }
  function findByLogin(login) {
    login = (login || '').trim().toLowerCase();
    return state.users.filter(function (u) { return u.username === login || (u.email && u.email.toLowerCase() === login); })[0] || null;
  }
  function issueCode(kind, email) {
    var c = code6();
    codes[kind + ':' + email.toLowerCase()] = { code: c, exp: Date.now() + CODE_TTL };
    return c;
  }
  function checkCode(kind, email, code) {
    var k = kind + ':' + (email || '').toLowerCase(), e = codes[k];
    if (!e || Date.now() > e.exp) return 'Expired na o wala pang code. Mag-send ulit.';
    if (String(code || '').trim() !== e.code) return 'Mali ang code. I-check ulit.';
    return '';
  }
  function ageFrom(birthday) {
    var b = new Date(birthday + 'T00:00:00'); if (isNaN(b)) return null;
    var n = new Date(), a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a -= 1;
    return a;
  }

  var auth = {
    current: function () { return state.session; },
    demoSignIn: function (role) {
      var u = state.users.filter(function (x) { return x.role === role && !x.passwordHash; })[0] || state.users.filter(function (x) { return x.role === role; })[0];
      state.session = { username: u.username, role: u.role };
      commit();
    },
    signOut: function () { state.session = null; commit(); },
    signInWithGoogle: function () { return notConnected('Ang Google Sign-In'); },
    ageFrom: ageFrom,
    emailError: function (email) { return EMAIL_RE.test((email || '').trim()) ? '' : 'Mukhang mali ang email.'; },

    /** Step 1 ng email verification: "pinapadala" ang 6-digit code. Demo: ibinabalik ang code para ipakita sa screen. */
    sendEmailCode: function (email) {
      email = (email || '').trim();
      if (!EMAIL_RE.test(email)) return fail('Mukhang mali ang email.');
      var taken = findByLogin(email);
      if (taken && (!state.session || taken.username !== state.session.username)) return fail('May account na gumagamit ng email na ito. Mag-sign in o gamitin ang Forgot password.');
      return Promise.resolve({ demoCode: issueCode('verify', email), email: email });
    },
    verifyEmailCode: function (email, code) {
      var err = checkCode('verify', email, code);
      if (err) return fail(err);
      codes['verified:' + email.trim().toLowerCase()] = { code: 'ok', exp: Date.now() + CODE_TTL };
      return Promise.resolve(true);
    },
    isEmailVerified: function (email) { var e = codes['verified:' + (email || '').trim().toLowerCase()]; return !!e && Date.now() <= e.exp; },

    /** Gumagawa ng account sa browser (demo). data: username, email, password, fullName, birthday, gender, address {region, province, city, barangay, street} */
    register: function (data) {
      data = data || {};
      var name = (data.username || '').trim().toLowerCase(), email = (data.email || '').trim();
      var bad = auth.usernameError(name);
      if (bad) return fail(bad);
      if (byName[name]) return fail('Taken na ang username na ito. Pumili ng iba.');
      if (!EMAIL_RE.test(email)) return fail('Mukhang mali ang email.');
      if (findByLogin(email)) return fail('May account na gumagamit ng email na ito.');
      if (!auth.isEmailVerified(email)) return fail('I-verify muna ang email gamit ang code.');
      if ((data.fullName || '').trim().length < 3) return fail('Ilagay ang full name mo.');
      var age = ageFrom(data.birthday);
      if (age == null) return fail('Ilagay ang birthday mo.');
      if (age < 13 || age > 120) return fail('Dapat 13 taong gulang pataas para makagawa ng account.');
      if (!data.gender) return fail('Pumili ng gender.');
      var ad = data.address || {};
      if (!ad.region || !ad.province || !ad.city || !ad.barangay) return fail('Kumpletuhin ang address: region, province, city/municipality at barangay.');
      if (auth.passwordChecks(data.password).some(function (c) { return !c.ok; })) return fail('Hindi pa pasado ang password sa lahat ng rules.');
      var salt = randomHex(8);
      return hashPassword(data.password, salt).then(function (hash) {
        var u = {
          username: name, role: 'user', note: 'Resident · ' + ad.city, suspended: false, photo: null, joinedAt: nowISO(),
          fullName: data.fullName.trim(), email: email, emailVerified: true, birthday: data.birthday, gender: data.gender,
          address: { region: ad.region, regionName: ad.regionName || ad.region, province: ad.province, city: ad.city, barangay: ad.barangay, street: (ad.street || '').trim() },
          passwordSalt: salt, passwordHash: hash, registered: true
        };
        state.users.push(u);
        byName[name] = u;
        state.session = { username: u.username, role: u.role };
        commit();
        return u;
      });
    },

    signInWithPassword: function (login, password) {
      var u = findByLogin(login);
      if (!u) return fail('Walang account na ganyan ang username o email.');
      if (u.suspended) return fail('Suspended ang account na ito.');
      if (!u.passwordHash) return fail('Demo account ito (walang password). Gamitin ang Demo buttons sa itaas, o gumawa ng sariling account sa Step 2.');
      return hashPassword(password || '', u.passwordSalt).then(function (hash) {
        if (hash !== u.passwordHash) throw Object.assign(new Error('Mali ang password.'), { code: 'DEMO' });
        state.session = { username: u.username, role: u.role };
        commit();
        return u;
      });
    },

    changePassword: function (current, next) {
      var s = state.session, u = s && byName[s.username];
      if (!u) return fail('Mag-sign in muna.');
      if (!u.passwordHash) return fail('Demo account ito (walang password na pwedeng palitan). Gumawa ng sariling account sa Step 2.');
      if (auth.passwordChecks(next).some(function (c) { return !c.ok; })) return fail('Hindi pa pasado ang bagong password sa lahat ng rules.');
      return hashPassword(current || '', u.passwordSalt).then(function (hash) {
        if (hash !== u.passwordHash) throw Object.assign(new Error('Mali ang current password.'), { code: 'DEMO' });
        var salt = randomHex(8);
        return hashPassword(next, salt).then(function (h2) { u.passwordSalt = salt; u.passwordHash = h2; commit(); return true; });
      });
    },

    /** Forgot password: email (o username) ng account na may verified email. Demo: ibinabalik ang reset code para ipakita sa screen. */
    requestPasswordReset: function (login) {
      var u = findByLogin(login);
      if (!u) return fail('Walang account na ganyan ang email o username.');
      if (!u.email || !u.emailVerified) return fail('Walang verified na email ang account na ito. (Demo accounts: gamitin ang Demo buttons.)');
      return Promise.resolve({ demoCode: issueCode('reset', u.email), email: u.email, username: u.username });
    },
    resetPassword: function (login, code, newPassword) {
      var u = findByLogin(login);
      if (!u || !u.email) return fail('Walang account na ganyan ang email o username.');
      var err = checkCode('reset', u.email, code);
      if (err) return fail(err);
      if (auth.passwordChecks(newPassword).some(function (c) { return !c.ok; })) return fail('Hindi pa pasado ang bagong password sa lahat ng rules.');
      var salt = randomHex(8);
      return hashPassword(newPassword, salt).then(function (hash) {
        u.passwordSalt = salt; u.passwordHash = hash;
        delete codes['reset:' + u.email.toLowerCase()];
        commit();
        return u;
      });
    },

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
