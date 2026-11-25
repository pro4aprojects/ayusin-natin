/* Ayusin Natin — Users (ranking ng top contributors), public Profile, at Contact Us. */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  AN.views = AN.views || {};
  var ui = AN.ui, esc = ui.esc;

  function roleBadge(role) {
    return role && role !== 'user' ? '<span class="badge">' + esc(AN.ROLES[role] || role) + '</span>' : '';
  }
  function monthYear(iso) {
    var d = new Date(iso);
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear();
  }
  function userHaystack(x) {
    return [x.user.username, x.user.note, AN.ROLES[x.user.role] || x.user.role].join(' ').toLowerCase();
  }

  /* ================= USERS (LIST + RANKING) ================= */
  AN.views.users = function (root) {
    var f = { q: '', sort: 'rank', page: 1 }, PER = 30;
    root.innerHTML =
      '<div class="page">' +
      '<div class="stack-s"><h1 class="display">Users</h1><p class="lead">Mga residenteng nag-report at nag-update. Ranking base sa contribution points. Sa lahat ng users tumatakbo ang search; max ' + ui.LIMITS.display + ' ang naka-display kada resulta, ' + PER + ' kada page.</p></div>' +
      '<section class="stack-s"><h2>Top contributors</h2><div class="podium" id="podium"></div></section>' +
      '<div class="filters filters--users">' +
      '<div class="field"><label for="uq">Search user</label><input id="uq" type="search" placeholder="Username, lugar o role" autocomplete="off"></div>' +
      '<div class="field"><label for="usort">Sort</label><select id="usort"><option value="rank">Ranking (points)</option><option value="reports">Most reports</option><option value="new">Newest member</option><option value="az">Username A–Z</option></select></div>' +
      '</div>' +
      '<p class="muted small" id="ucount"></p><div class="ulist" id="ulist"></div><div id="upager"></div>' +
      '<details class="card"><summary><b>Paano kinukwenta ang points?</b></summary><table class="scoring"><tbody>' +
      AN.SCORING.map(function (s) { return '<tr><td>' + esc(s.label) + '</td><td><b>+' + s.points + '</b></td></tr>'; }).join('') +
      '</tbody></table><p class="muted small">Hindi kasama ang hidden na report. Hindi lumalabas sa ranking ang suspended na account.</p></details>' +
      '</div>';
    var $ = function (sel) { return root.querySelector(sel); };

    function row(x) {
      var st = x.stats;
      return '<div class="urow' + (x.rank <= 3 ? ' urow--top' : '') + '">' +
        '<b class="urow__rank">#' + x.rank + '</b>' +
        '<a class="ulink urow__user" href="#/user/' + encodeURIComponent(x.user.username) + '">' + ui.avatar(x.user.username, 'm') +
        '<span><b>@' + esc(x.user.username) + '</b> ' + roleBadge(x.user.role) + '<span class="muted small">' + esc(x.user.note || '') + ' · member since ' + monthYear(x.user.joinedAt) + '</span></span></a>' +
        '<span class="urow__stats"><b>' + st.reports + '</b> reports · <b>' + st.fixed + '</b> fixed' + (st.fixes ? ' · <b>' + st.fixes + '</b> fix updates' : '') + '</span>' +
        '<b class="urow__score">' + st.score + ' pts</b></div>';
    }

    function render() {
      var all = AN.store.ranking();
      $('#podium').innerHTML = all.slice(0, 3).map(function (x) {
        return '<a class="pod pod--' + x.rank + '" href="#/user/' + encodeURIComponent(x.user.username) + '"><span class="pod__rank">' + x.rank + '</span>' + ui.avatar(x.user.username, 'xl') +
          '<b>@' + esc(x.user.username) + '</b><span class="pod__score">' + x.stats.score + ' pts</span><span class="muted small">' + x.stats.reports + ' reports · ' + x.stats.fixed + ' fixed</span></a>';
      }).join('');

      var q = f.q.trim().toLowerCase();
      var rows = all.filter(function (x) { return !q || userHaystack(x).indexOf(q) !== -1; });
      if (f.sort === 'reports') rows.sort(function (a, b) { return b.stats.reports - a.stats.reports || a.rank - b.rank; });
      else if (f.sort === 'new') rows.sort(function (a, b) { return a.user.joinedAt < b.user.joinedAt ? 1 : -1; });
      else if (f.sort === 'az') rows.sort(function (a, b) { return a.user.username < b.user.username ? -1 : 1; });
      var pg = ui.paginate(rows, f.page, PER);
      f.page = pg.page;
      $('#ucount').textContent = ui.countLine(pg, 'users');
      $('#ulist').innerHTML = pg.items.length ? pg.items.map(row).join('') : '<p class="empty">Walang match na user.</p>';
      $('#upager').innerHTML = ui.pagerHTML(pg);
    }

    $('#uq').addEventListener('input', function (e) { f.q = e.target.value; f.page = 1; render(); });
    $('#usort').addEventListener('change', function (e) { f.sort = e.target.value; f.page = 1; render(); });
    $('#upager').addEventListener('click', function (e) {
      var b = e.target.closest('[data-page]'); if (!b || b.disabled) return;
      f.page = +b.getAttribute('data-page'); render();
      $('#ucount').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    var off = AN.store.on(render);
    render();
    return off;
  };

  /* ================= PUBLIC PROFILE ================= */
  AN.views.profile = function (root, params) {
    var f = { q: '', page: 1 };
    var name = params.id;

    function render() {
      var u = AN.store.user(name);
      var s = AN.auth.current();
      var staff = s && (s.role === 'admin' || s.role === 'moderator');
      if (!u) {
        root.innerHTML = '<div class="page page--narrow"><h1 class="display">User not found</h1><p class="lead">Walang user na @' + esc(name) + '.</p><p><a class="btn btn--dark" href="#/users">Lahat ng users</a></p></div>';
        return;
      }
      var own = s && s.username === u.username;
      var st = AN.store.stats(u.username);
      var rk = AN.store.rankOf(u.username);
      var total = AN.store.ranking().length;
      var q = f.q.trim().toLowerCase();
      var rows = (staff ? AN.store.all() : AN.store.list()).filter(function (r) {
        return r.reporter === u.username && (!q || [r.title, r.city, r.province, ui.catLabel(r), r.id].join(' ').toLowerCase().indexOf(q) !== -1);
      });
      var pg = ui.paginate(rows, f.page);
      f.page = pg.page;

      root.innerHTML =
        '<div class="page">' +
        '<p class="crumbs"><a href="#/users">Users</a> / @' + esc(u.username) + '</p>' +
        '<section class="card profile">' +
        ui.avatar(u.username, 'xl') +
        '<div class="stack-s profile__main">' +
        '<div class="titlerow"><h1 class="display">@' + esc(u.username) + '</h1>' + (own ? '<a class="btn btn--ghost btn--sm" href="#/account">Edit profile photo</a>' : '') + '</div>' +
        '<div class="profile__meta">' + roleBadge(u.role) + '<span>' + esc(u.note || '') + '</span><span>Member since ' + monthYear(u.joinedAt) + '</span>' +
        (rk ? '<span><b>Rank #' + rk.rank + '</b> of ' + total + ' contributors</span>' : '') + (u.suspended ? '<span class="pill pill--urgent">Suspended</span>' : '') + '</div>' +
        '<div class="pstats">' +
        '<div class="pstat"><b>' + st.reports + '</b><span>Reports</span></div>' +
        '<div class="pstat"><b>' + st.fixed + '</b><span>Na-fix na</span></div>' +
        '<div class="pstat"><b>' + st.fixes + '</b><span>Fix updates</span></div>' +
        '<div class="pstat"><b>' + st.confirms + '</b><span>Confirmations</span></div>' +
        '<div class="pstat pstat--accent"><b>' + st.score + '</b><span>Points</span></div>' +
        '</div></div></section>' +
        '<section class="stack-s">' +
        '<div class="titlerow"><h2>Reports ni @' + esc(u.username) + ' <span class="muted small">(' + rows.length + ')</span></h2>' +
        '<div class="field field--inline"><label class="sr" for="pq">Search sa reports ni ' + esc(u.username) + '</label><input id="pq" type="search" placeholder="Search sa reports niya" value="' + esc(f.q) + '" autocomplete="off"></div></div>' +
        '<p class="muted small">' + ui.countLine(pg, 'reports') + '</p>' +
        '<div class="rgrid">' + (pg.items.length ? pg.items.map(function (r) { return ui.reportCard(r); }).join('') : '<p class="empty">' + (q ? 'Walang match.' : 'Wala pang report si @' + esc(u.username) + '.') + '</p>') + '</div>' +
        '<div id="ppager">' + ui.pagerHTML(pg) + '</div></section></div>';

      var $ = function (sel) { return root.querySelector(sel); };
      $('#pq').addEventListener('input', function (e) {
        f.q = e.target.value; f.page = 1; var pos = e.target.selectionStart;
        render();
        var el = root.querySelector('#pq'); el.focus(); try { el.setSelectionRange(pos, pos); } catch (err) { /* ayos lang */ }
      });
      $('#ppager').addEventListener('click', function (e) {
        var b = e.target.closest('[data-page]'); if (!b || b.disabled) return;
        f.page = +b.getAttribute('data-page'); render();
      });
    }

    var off = AN.store.on(render);
    render();
    return off;
  };

  /* ================= CONTACT US ================= */
  AN.views.contact = function (root) {
    var s = AN.auth.current();
    var sent = null;

    function render() {
      root.innerHTML =
        '<div class="page">' +
        '<div class="stack-s"><h1 class="display">Contact Us</h1><p class="lead">May suggestion, additional feature, o nakitang bug sa system? I-send dito. Para sa problema sa lugar niyo (lubak, baha, ilaw), gamitin ang <a href="#/mag-ulat">Mag-Report</a>.</p></div>' +
        '<div class="cols">' +
        (sent
          ? '<section class="cols__main card card--ok stack-s"><h2>Na-send na. Salamat!</h2><p>Reference: <b>' + esc(sent.id) + '</b> · ' + esc(typeLabel(sent.type)) + '</p><p class="muted">Demo: naka-save ito sa browser mo at makikita ng admin sa Admin page. Kapag may backend na, mapupunta ito sa team at makakatanggap ka ng reply sa email kung nilagay mo.</p>' +
            '<div class="btnrow"><button type="button" class="btn btn--dark" id="again">Send another</button><a class="btn btn--ghost" href="#/">Balik sa map</a></div></section>'
          : '<form class="cols__main card stack-s" id="cform" novalidate>' +
            '<div class="field"><label for="cf-type">Tungkol sa</label><select id="cf-type">' + AN.CONTACT_TYPES.map(function (t) { return '<option value="' + t.id + '">' + esc(t.label) + '</option>'; }).join('') + '</select></div>' +
            '<div class="grid3">' +
            '<div class="field"><label for="cf-name">Name o username (optional)</label><input id="cf-name" type="text" maxlength="60" value="' + (s ? '@' + esc(s.username) : '') + '" autocomplete="name"></div>' +
            '<div class="field"><label for="cf-email">Email (optional, para sa reply)</label><input id="cf-email" type="email" maxlength="120" placeholder="ikaw@email.com" autocomplete="email"></div>' +
            '</div>' +
            '<div class="field"><label for="cf-msg">Message</label><textarea id="cf-msg" rows="6" maxlength="1500" placeholder="Hal. Sana may notification kapag na-update ang report ko. / May error sa Satellite view sa phone ko…"></textarea><span class="muted small" id="cf-left">1500 characters</span></div>' +
            '<p class="formerr" id="cf-err" role="alert" hidden></p>' +
            '<div class="submitrow"><button type="submit" class="btn btn--accent btn--lg">Send message</button><span class="muted small">Huwag maglagay ng password o ibang sensitive na info.</span></div></form>') +
        '<aside class="cols__side stack-m">' +
        '<section class="card stack-s"><h2>Ano ang pwedeng i-send</h2><ul class="bullets"><li>Suggestion para mas gumanda ang system.</li><li>Additional feature na gusto mong makita.</li><li>Bug o error na nakita mo (ilagay ang phone at browser).</li><li>Question tungkol sa Ayusin Natin.</li></ul></section>' +
        '<section class="card card--warn stack-s"><h2>Hindi ito emergency line</h2><p class="muted">Kung may nasugatan, sunog, o buhay ang nakataya, tumawag sa <b>911</b>. Para sa problema sa lugar niyo, gamitin ang Mag-Report para lumabas ito sa map.</p><a class="btn btn--dark" href="#/mag-ulat">Mag-Report</a></section>' +
        '</aside></div></div>';
      wire();
    }

    function typeLabel(id) {
      var t = AN.CONTACT_TYPES.filter(function (x) { return x.id === id; })[0];
      return t ? t.label : id;
    }

    function wire() {
      var $ = function (sel) { return root.querySelector(sel); };
      if ($('#again')) { $('#again').addEventListener('click', function () { sent = null; render(); }); return; }
      $('#cf-msg').addEventListener('input', function (e) { $('#cf-left').textContent = (1500 - e.target.value.length) + ' characters pa'; });
      $('#cform').addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('#cf-msg').value.trim(), email = $('#cf-email').value.trim(), err = '';
        if (msg.length < 10) err = 'Lagyan ng message (at least 10 characters).';
        else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err = 'Mukhang mali ang email. I-check o iwanang blangko.';
        $('#cf-err').hidden = !err; $('#cf-err').textContent = err;
        if (err) { $(err.indexOf('email') !== -1 ? '#cf-email' : '#cf-msg').focus(); return; }
        var res = AN.store.addFeedback({ type: $('#cf-type').value, name: $('#cf-name').value, email: email, message: msg });
        sent = res.item;
        ui.toast(res.saved ? 'Na-send ang message mo. Salamat!' : 'Na-send, pero full na ang browser storage kaya mawawala ito pag-refresh.', res.saved ? 'ok' : 'error');
        render();
        window.scrollTo(0, 0);
      });
    }

    render();
  };
})();
