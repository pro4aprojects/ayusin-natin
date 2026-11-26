/* Ayusin Natin — mga public screen: Map (home), Reports, Report details. */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  AN.views = AN.views || {};
  var ui = AN.ui, esc = ui.esc;

  function haystack(r) {
    return [r.title, r.description, r.city, r.province, r.region, r.barangay, r.landmark, ui.catLabel(r), r.id, r.reporter].join(' ').toLowerCase();
  }

  /* ================= MAP (HOME) ================= */
  AN.views.map = function (root) {
    var f = { cat: 'all', groups: { bukas: true, aksyon: true, ayos: true }, urgent: false, q: '', limit: 12 };
    var map = null, layer = null, me = null;

    root.innerHTML =
      '<div class="mapview">' +
      '<aside class="panel">' +
      '<div class="stack-s"><h1 class="display">Nakita mo? I-report mo.<br>Ayusin natin.</h1>' +
      '<p class="lead">I-photo ang sirang kalsada, baha, o kahit anong problema sa area niyo. Visible ito sa buong Pilipinas hanggang ma-fix. Bago dito? Basahin ang <a href="#/guide">Guide</a>.</p></div>' +
      '<div class="field"><label for="q">Search ng place, problema o user</label><input id="q" type="search" placeholder="Hal. Marikina, lubak, baha" autocomplete="off"></div>' +
      '<div class="chips" id="cats" role="group" aria-label="Category"></div>' +
      '<div class="listhead"><h2>Reports</h2><span class="muted small" id="count"></span></div>' +
      '<div class="rlist" id="list"></div>' +
      '<button type="button" class="btn btn--ghost" id="more" hidden>Show more</button>' +
      '<p class="muted small" id="capnote" hidden></p>' +
      '</aside>' +
      '<section class="mapwrap" aria-label="Map ng mga reports">' +
      '<div id="map" class="map"></div>' +
      '<div class="mapbar" id="groups" role="group" aria-label="Status at urgent filter"></div>' +
      '<button type="button" class="mapbtn" id="near">Near me</button>' +
      '</section></div>';

    var $ = function (sel) { return root.querySelector(sel); };

    function base() {
      var q = f.q.trim().toLowerCase();
      return AN.store.list().filter(function (r) {
        return (f.cat === 'all' || r.category === f.cat) && (!q || haystack(r).indexOf(q) !== -1);
      });
    }

    function render(fit) {
      var pool = base();
      var urgentPool = pool.filter(ui.isUrgent);
      var shown = pool.filter(function (r) { return f.groups[AN.STATUSES[r.status].group] && (!f.urgent || ui.isUrgent(r)); });

      $('#cats').innerHTML = [{ id: 'all', short: 'All' }].concat(AN.CATEGORIES).map(function (c) {
        return '<button type="button" class="chip' + (f.cat === c.id ? ' is-on' : '') + '" data-cat="' + c.id + '" aria-pressed="' + (f.cat === c.id) + '">' + esc(c.short) + '</button>';
      }).join('');

      $('#groups').innerHTML = AN.STATUS_GROUPS.map(function (g) {
        var n = pool.filter(function (r) { return AN.STATUSES[r.status].group === g.id; }).length;
        return '<button type="button" class="mapbar__btn' + (f.groups[g.id] ? ' is-on' : '') + '" data-group="' + g.id + '" aria-pressed="' + f.groups[g.id] + '"><span class="dot dot--' + g.id + '"></span>' + esc(g.label) + ' <b>' + n + '</b></button>';
      }).join('') +
        // Filter: urgent lang na hindi pa na-fix (ang mga kumikislap na pula sa mapa).
        '<button type="button" class="mapbar__btn mapbar__btn--urgent' + (f.urgent ? ' is-on' : '') + '" data-urgent aria-pressed="' + f.urgent + '" title="Ipakita lang ang urgent na hindi pa na-fix"><span class="dot dot--urgent"></span>Urgent, hindi pa fixed <b>' + urgentPool.length + '</b></button>';

      var cap = Math.min(f.limit, ui.LIMITS.display);
      $('#count').textContent = shown.length + ' reports · demo data';
      $('#list').innerHTML = shown.length
        ? shown.slice(0, cap).map(function (r) { return ui.reportCard(r); }).join('')
        : '<p class="empty">Walang match na report. Try ng ibang place, category o filter.</p>';
      $('#more').hidden = shown.length <= cap || cap >= ui.LIMITS.display;
      $('#capnote').hidden = !(shown.length > ui.LIMITS.display && cap >= ui.LIMITS.display);
      $('#capnote').textContent = 'Unang ' + ui.LIMITS.display + ' lang ang naka-display sa list para hindi mabigat. Lahat ng ' + shown.length + ' ay nasa map; i-refine ang search para makita ang iba.';

      if (map) {
        layer.set(shown);
        if (fit && shown.length) AN.mapkit.fitPoints(map, shown.map(function (r) { return [r.lat, r.lng]; }), 14);
      }
    }

    function popupHTML(r) {
      return '<div class="pop' + (ui.isUrgent(r) ? ' pop--urgent' : '') + '"><img alt="" src="' + ui.photoSrc(ui.firstPhoto(r)) + '">' +
        '<strong>' + esc(r.title) + '</strong>' +
        '<span class="muted small">' + esc(ui.placeLine(r)) + ' · ' + r.affected + ' affected din</span>' +
        '<span class="pop__row">' + ui.statusPill(r.status) + ui.urgentPill(r) + '</span>' +
        ui.userLink(r.reporter, 'xs', 'small') +
        '<a class="btn btn--dark btn--sm" href="#/ulat/' + esc(r.id) + '">View report</a></div>';
    }

    map = AN.mapkit.available() ? AN.mapkit.create($('#map')) : null;
    if (map) {
      layer = AN.mapkit.reports(map, function (id, lngLat) {
        var r = AN.store.get(id);
        if (r) AN.mapkit.popup(map, lngLat[1], lngLat[0], popupHTML(r));
      });
      setTimeout(function () { if (map) map.resize(); }, 60);
    } else {
      if (!$('#map').firstChild) $('#map').innerHTML = AN.mapkit.noMapHTML;
      $('#near').hidden = true;
    }

    $('#q').addEventListener('input', function (e) { f.q = e.target.value; f.limit = 12; render(!!f.q.trim()); });
    $('#cats').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      f.cat = b.getAttribute('data-cat'); f.limit = 12; render(false);
    });
    $('#groups').addEventListener('click', function (e) {
      var u = e.target.closest('[data-urgent]');
      if (u) { f.urgent = !f.urgent; f.limit = 12; render(f.urgent); return; }
      var b = e.target.closest('[data-group]'); if (!b) return;
      var g = b.getAttribute('data-group'); f.groups[g] = !f.groups[g]; render(false);
    });
    $('#more').addEventListener('click', function () { f.limit += 12; render(false); });
    $('#near').addEventListener('click', function () {
      var btn = this; btn.disabled = true; btn.textContent = 'Getting location…';
      AN.geo.locate().then(function (fix) {
        if (!map) return;
        if (me) me.remove();
        me = new window.maplibregl.Marker({ element: AN.mapkit.meDot() }).setLngLat([fix.lng, fix.lat])
          .setPopup(new window.maplibregl.Popup({ closeButton: false, offset: 12 }).setText('You are here')).addTo(map);
        AN.mapkit.flyTo(map, fix.lat, fix.lng, 15, 50);
        if (!AN.geo.inPH(fix.lat, fix.lng)) ui.toast('Mukhang nasa labas ka ng Pilipinas. Reports sa Pilipinas lang ang nasa map.');
      }).catch(function (err) { ui.toast(AN.geo.errorText(err), 'error'); })
        .then(function () { btn.disabled = false; btn.textContent = 'Near me'; });
    });

    var off = AN.store.on(function () { render(false); });
    render(false);
    return function () { off(); if (map) { map.remove(); map = null; } };
  };

  /* ================= REPORTS (LIST) ================= */
  AN.views.list = function (root) {
    var f = { cat: 'all', group: 'all', sev: 'all', sort: 'bago', q: '', page: 1 };
    root.innerHTML =
      '<div class="page">' +
      '<div class="stack-s"><h1 class="display">Reports</h1><p class="lead">Lahat ng reports sa demo data. Sa lahat tumatakbo ang search, filter at sort; max ' + ui.LIMITS.display + ' ang naka-display kada resulta, ' + ui.LIMITS.perPage + ' kada page.</p></div>' +
      '<div class="filters">' +
      '<div class="field"><label for="lq">Search</label><input id="lq" type="search" placeholder="Place, problema, user o report number" autocomplete="off"></div>' +
      '<div class="field"><label for="lcat">Category</label><select id="lcat"><option value="all">All</option>' + AN.CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + esc(c.label) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="lgroup">Status</label><select id="lgroup"><option value="all">All</option>' + AN.STATUS_GROUPS.map(function (g) { return '<option value="' + g.id + '">' + esc(g.label) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="lsev">Severity</label><select id="lsev"><option value="all">All</option>' + AN.SEVERITIES.map(function (v) { return '<option value="' + v.id + '">' + esc(v.label) + '</option>'; }).join('') + '<option value="urgent-open">Urgent, hindi pa fixed</option></select></div>' +
      '<div class="field"><label for="lsort">Sort</label><select id="lsort"><option value="bago">Latest</option><option value="luma">Oldest</option><option value="apektado">Most affected</option></select></div>' +
      '</div>' +
      '<p class="muted small" id="lcount"></p><div class="rgrid" id="lgrid"></div><div id="lpager"></div></div>';
    var $ = function (sel) { return root.querySelector(sel); };
    function render() {
      var q = f.q.trim().toLowerCase();
      var rows = AN.store.list().filter(function (r) {
        return (f.cat === 'all' || r.category === f.cat) && (f.group === 'all' || AN.STATUSES[r.status].group === f.group) &&
          (f.sev === 'all' || (f.sev === 'urgent-open' ? ui.isUrgent(r) : r.severity === f.sev)) && (!q || haystack(r).indexOf(q) !== -1);
      });
      if (f.sort === 'apektado') rows.sort(function (a, b) { return b.affected - a.affected; });
      else if (f.sort === 'luma') rows.reverse();
      var pg = ui.paginate(rows, f.page);
      f.page = pg.page;
      $('#lcount').textContent = ui.countLine(pg, 'reports');
      $('#lgrid').innerHTML = pg.items.length ? pg.items.map(function (r) { return ui.reportCard(r); }).join('') : '<p class="empty">Walang match na report.</p>';
      $('#lpager').innerHTML = ui.pagerHTML(pg);
    }
    function reset(fn) { return function (e) { fn(e); f.page = 1; render(); }; }
    $('#lq').addEventListener('input', reset(function (e) { f.q = e.target.value; }));
    $('#lcat').addEventListener('change', reset(function (e) { f.cat = e.target.value; }));
    $('#lgroup').addEventListener('change', reset(function (e) { f.group = e.target.value; }));
    $('#lsev').addEventListener('change', reset(function (e) { f.sev = e.target.value; }));
    $('#lsort').addEventListener('change', reset(function (e) { f.sort = e.target.value; }));
    $('#lpager').addEventListener('click', function (e) {
      var b = e.target.closest('[data-page]'); if (!b || b.disabled) return;
      f.page = +b.getAttribute('data-page'); render();
      $('#lcount').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    var off = AN.store.on(render);
    render();
    return off;
  };

  /* ================= REPORT DETAILS ================= */
  var HISTORY_LABEL = { 'naiulat': 'Reported', 'na-verify': 'Verified', 'inaaksyunan': 'In progress', 'naayos': 'Fixed', 'kumpirmado': 'Confirmed', 'hindi-pa': 'Hindi pa rin na-fix', 'tinanggihan': 'Rejected' };
  var HISTORY_DOT = { 'naiulat': 'bukas', 'na-verify': 'neutral', 'inaaksyunan': 'aksyon', 'naayos': 'ayos', 'kumpirmado': 'ayos', 'hindi-pa': 'bukas', 'tinanggihan': 'neutral' };

  AN.views.detail = function (root, params) {
    var draft = { type: 'naayos', photo: null, note: '' };
    var map = null;

    function render() {
      if (map) { map.remove(); map = null; }
      var r = AN.store.get(params.id);
      var s = AN.auth.current();
      var staff = s && (s.role === 'admin' || s.role === 'moderator');
      if (!r || (r.hidden && !staff)) {
        root.innerHTML = '<div class="page"><h1 class="display">Report not found</h1><p class="lead">Baka na-delete na ito o mali ang link.</p><p><a class="btn btn--dark" href="#/">Balik sa map</a></p></div>';
        return;
      }
      var before = ui.firstPhoto(r, 'before');
      var after = ui.firstPhoto(r, 'after');
      var mine = s && r.affectedBy.indexOf(s.username) !== -1;
      var canConfirm = s && r.status === 'naayos' && r.confirmedBy.indexOf(s.username) === -1;
      var sev = AN.SEVERITIES.filter(function (x) { return x.id === r.severity; })[0];

      root.innerHTML =
        '<div class="page">' +
        '<div class="stack-s">' +
        '<p class="crumbs"><a href="#/">Map</a> / ' + esc(r.province || 'Pilipinas') + ' / ' + esc(r.city || '') + ' / Report #' + esc(r.id) + '</p>' +
        '<div class="titlerow"><h1 class="display">' + esc(r.title) + '</h1><span class="btnrow">' + ui.statusPill(r.status, true) + (ui.isUrgent(r) ? '<span class="pill pill--urgent pill--big">Urgent</span>' : '') + '</span></div>' +
        '<p class="muted byline">' + esc(ui.catLabel(r)) + ' · Reported by ' + ui.userLink(r.reporter, 'xs') + ' · ' + ui.fmtDate(r.createdAt) + (sev ? ' · ' + esc(sev.label) : '') + '</p>' +
        (r.hidden ? '<p class="note note--warn">Hidden sa public ang report na ito (na-reject sa review).</p>' : '') +
        (r.needsReview && !r.hidden ? '<p class="note">Pending pa ang review ng moderator.</p>' : '') +
        '</div>' +
        '<div class="cols">' +
        '<div class="cols__main">' +
        '<section class="card photos">' +
        '<figure><img alt="Before photo" src="' + ui.photoSrc(before) + '"><figcaption><b class="t-bukas">BEFORE</b><span class="muted">' + ui.fmtDate(before ? before.at : r.createdAt) + ' · @' + esc(before ? before.by : r.reporter) + '</span>' + ui.photoCredit(before) + '</figcaption></figure>' +
        (after
          ? '<figure><img alt="After photo" src="' + ui.photoSrc(after) + '"><figcaption><b class="t-ayos">AFTER</b><span class="muted">' + ui.fmtDate(after.at) + ' · @' + esc(after.by) + '</span>' + ui.photoCredit(after) + '</figcaption></figure>'
          : '<figure><div class="photo-empty">Wala pang AFTER photo.<br>Kapag fixed na, i-add sa <b>Update status</b>.</div><figcaption><b class="muted">AFTER</b><span class="muted">Pending</span></figcaption></figure>') +
        '</section>' +
        (r.description ? '<section class="card"><h2>Description</h2><p class="body">' + esc(r.description) + '</p></section>' : '') +
        '<section class="card"><h2>Report history</h2><ol class="timeline">' +
        r.history.map(function (h) {
          return '<li><span class="dot dot--' + (HISTORY_DOT[h.type] || 'neutral') + '"></span><div><div class="byline"><b>' + esc(HISTORY_LABEL[h.type] || h.type) + '</b> · ' + ui.userLink(h.by, 'xs') +
            (h.role && h.role !== 'user' ? ' <span class="badge">' + esc(AN.ROLES[h.role] || h.role) + '</span>' : '') + ' · ' + ui.fmtDate(h.at) + '</div>' +
            (h.note ? '<div class="muted">' + esc(h.note) + '</div>' : '') + '</div></li>';
        }).join('') + '</ol></section>' +
        '</div>' +
        '<aside class="cols__side">' +
        '<section class="card stack-s">' +
        '<button type="button" class="btn btn--outline btn--block' + (mine ? ' is-on' : '') + '" id="affected" aria-pressed="' + !!mine + '">' + (mine ? 'Affected din ako ✓' : 'Affected din ako') + ' · ' + r.affected + '</button>' +
        '<div class="btnrow"><button type="button" class="btn btn--ghost" id="share">Share</button><button type="button" class="btn btn--ghost" id="copy">Copy link</button></div>' +
        '</section>' +
        '<section class="card card--flush"><a class="reporter" href="#/user/' + encodeURIComponent(r.reporter) + '">' + ui.avatar(r.reporter, 'l') + '<span class="stack-xs"><span class="muted small">Reported by</span><b>@' + esc(r.reporter) + '</b><span class="muted small">' + AN.store.stats(r.reporter).reports + ' reports · View profile</span></span></a></section>' +
        (canConfirm ? '<section class="card card--ok stack-s"><h2>Fixed na ba talaga?</h2><p class="muted">May nag-report na fixed na ito (' + r.confirmations + ' confirmation). Kung nakita mo mismo, i-confirm.</p><button type="button" class="btn btn--dark btn--block" id="confirm">Confirm fixed</button></section>' : '') +
        (s
          ? '<section class="card card--strong stack-s"><h2>Update status</h2>' +
            '<div class="choices" id="types" role="radiogroup" aria-label="New status">' +
            [['hindi-pa', 'Hindi pa rin na-fix', 'bukas'], ['inaaksyunan', 'In progress na', 'aksyon'], ['naayos', 'Fixed na', 'ayos']].map(function (o) {
              return '<button type="button" role="radio" class="choice' + (draft.type === o[0] ? ' is-on' : '') + '" data-type="' + o[0] + '" aria-checked="' + (draft.type === o[0]) + '"><span class="dot dot--' + o[2] + '"></span>' + o[1] + '</button>';
            }).join('') + '</div>' +
            '<div class="drop"><span class="label">New photo (camera)</span>' +
            (draft.photo ? '<div class="thumbs"><div class="thumb"><img alt="Bagong photo" src="' + draft.photo + '"><button type="button" id="rmphoto" aria-label="Remove photo">×</button></div></div>' : '') +
            '<label class="btn btn--dark btn--sm filebtn">Open camera<input type="file" id="upphoto" accept="image/*" capture="environment"></label>' +
            '<span class="muted small">Required kapag Fixed na ang pinili. Diretso sa camera, max 50 KB pagkatapos i-compress.</span></div>' +
            '<div class="field"><label for="upnote">Note (optional)</label><textarea id="upnote" rows="2" placeholder="Ano ang update?">' + esc(draft.note) + '</textarea></div>' +
            '<button type="button" class="btn btn--accent btn--block" id="sendupdate">Send update</button>' +
            '<p class="muted small">Magiging Confirmed lang ang Fixed kapag na-confirm ng reporter, ng 3 pang user, o ng moderator.</p></section>'
          : '<section class="card stack-s"><h2>Update status</h2><p class="muted">Mag-sign in para maka-update o maka-confirm.</p><a class="btn btn--dark btn--block" href="#/account">Sign in</a></section>') +
        '<section class="card card--flush"><div class="minimap" id="dmap"></div><div class="pad stack-xs"><b>' + esc(r.landmark || r.city || 'Location') + '</b><span class="muted small">' + esc(ui.placeLine(r)) + '</span>' +
        '<span class="muted small">' + r.lat.toFixed(6) + ', ' + r.lng.toFixed(6) + (r.accuracy ? ' · GPS ±' + r.accuracy + ' m' : '') + '</span>' +
        '<a class="small" href="https://www.google.com/maps?q=' + r.lat + ',' + r.lng + '" target="_blank" rel="noopener">Open sa Google Maps</a></div></section>' +
        '</aside></div></div>';

      var dmap = root.querySelector('#dmap');
      map = AN.mapkit.available() ? AN.mapkit.create(dmap, { center: [r.lat, r.lng], zoom: 16.5, pitch: 55, controls: 'min' }) : null;
      if (map) {
        var pinEl = AN.mapkit.pin(r.status, true);
        pinEl.style.pointerEvents = 'none';
        new window.maplibregl.Marker({ element: pinEl }).setLngLat([r.lng, r.lat]).addTo(map);
        setTimeout(function () { if (map) map.resize(); }, 60);
      } else if (!dmap.firstChild) {
        dmap.innerHTML = AN.mapkit.noMapHTML;
      }
      wire(r);
    }

    function wire(r) {
      var $ = function (sel) { return root.querySelector(sel); };
      var link = location.href;
      $('#affected').addEventListener('click', function () {
        if (!AN.auth.current()) { ui.toast('Mag-sign in muna para maka-join.'); location.hash = '#/account'; return; }
        var on = AN.store.toggleAffected(r.id);
        ui.toast(on ? 'Na-add ka sa mga affected.' : 'Na-remove ka sa mga affected.');
      });
      $('#copy').addEventListener('click', function () {
        var done = function () { ui.toast('Na-copy ang link.'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, function () { ui.toast('Hindi ma-copy. Copy na lang from address bar.', 'error'); });
        else ui.toast('Copy ang link from address bar.');
      });
      $('#share').addEventListener('click', function () {
        if (navigator.share) navigator.share({ title: 'Ayusin Natin: ' + r.title, text: r.title + ' sa ' + ui.placeLine(r), url: link }).catch(function () { /* kinansela */ });
        else $('#copy').click();
      });
      if ($('#confirm')) $('#confirm').addEventListener('click', function () {
        var res = AN.store.confirmFixed(r.id);
        if (!res.ok) ui.toast(res.error || 'Hindi ma-confirm.', 'error');
        else ui.toast(res.done ? 'Confirmed na. Salamat!' : 'Na-record ang confirmation mo.', 'ok');
      });
      if (!$('#types')) return;
      $('#types').addEventListener('click', function (e) {
        var b = e.target.closest('[data-type]'); if (!b) return;
        draft.type = b.getAttribute('data-type');
        draft.note = $('#upnote').value;
        render();
      });
      $('#upnote').addEventListener('input', function (e) { draft.note = e.target.value; });
      $('#upphoto').addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0]; if (!file) return;
        ui.compressImage(file).then(function (src) { draft.photo = src; render(); }, function (err) { ui.toast(err.message, 'error'); });
      });
      if ($('#rmphoto')) $('#rmphoto').addEventListener('click', function () { draft.photo = null; render(); });
      $('#sendupdate').addEventListener('click', function () {
        var res = AN.store.addUpdate(r.id, { type: draft.type, photo: draft.photo, note: draft.note.trim() });
        if (!res.ok) { ui.toast(res.error, 'error'); return; }
        draft = { type: 'naayos', photo: null, note: '' };
        render();
        ui.toast(res.saved ? 'Sent na ang update.' : 'Sent, pero full na ang browser storage kaya mawawala ito pag-refresh.', res.saved ? 'ok' : 'error');
      });
    }

    var off = AN.store.on(render);
    render();
    return function () { off(); if (map) { map.remove(); map = null; } };
  };
})();
