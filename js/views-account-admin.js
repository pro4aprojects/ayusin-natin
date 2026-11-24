/* Ayusin Natin — Account (naka-abang na login) at Admin. */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  AN.views = AN.views || {};
  var ui = AN.ui, esc = ui.esc;

  function rulesHTML(pw) {
    return AN.auth.passwordChecks(pw).map(function (c) {
      return '<li class="' + (c.ok ? 'is-ok' : '') + '"><span class="tick" aria-hidden="true"></span>' + esc(c.label) + '<span class="sr"> ' + (c.ok ? '(pasado)' : '(kulang pa)') + '</span></li>';
    }).join('');
  }
  function strength(pw) {
    var n = AN.auth.passwordChecks(pw).filter(function (c) { return c.ok; }).length;
    return { n: n, label: ['Weak', 'Weak', 'Medium', 'Medium', 'Strong'][n], cls: ['weak', 'weak', 'mid', 'mid', 'strong'][n] };
  }
  /** Ang UI ay tumatawag na sa totoong auth function; hindi pa lang ito naka-connect. */
  function attempt(promise, okMsg) {
    promise.then(function () { ui.toast(okMsg, 'ok'); }, function (err) {
      ui.toast(err && err.code === 'NOT_CONNECTED' ? err.message : 'May nangyaring mali. I-try ulit.', 'error');
    });
  }

  /* ================= ACCOUNT ================= */
  AN.views.account = function (root) {
    function render() {
      var s = AN.auth.current();
      root.innerHTML =
        '<div class="page">' +
        '<div class="stack-s"><h1 class="display">Account mo</h1><p class="lead">Makikita ng lahat ang map kahit walang account. Kailangan lang mag-sign in para mag-report at mag-update.</p></div>' +

        '<section class="card card--warn stack-s"><h2>Demo mode</h2>' +
        '<p class="muted">Wala pang totoong login. Nakalagay na ang mga button at form sa baba, pero dito ka muna pumili ng demo account para ma-try ang bawat role. ' +
        (s ? 'Naka-sign in ka bilang <b>@' + esc(s.username) + '</b> (' + esc(AN.ROLES[s.role]) + ').' : 'Hindi ka naka-sign in.') + '</p>' +
        '<div class="btnrow">' +
        '<button type="button" class="btn btn--dark" data-demo="user">Demo user</button>' +
        '<button type="button" class="btn btn--dark" data-demo="moderator">Demo moderator</button>' +
        '<button type="button" class="btn btn--dark" data-demo="lgu">Demo LGU</button>' +
        '<button type="button" class="btn btn--dark" data-demo="admin">Demo admin</button>' +
        (s ? '<button type="button" class="btn btn--ghost" id="signout">Sign out</button>' : '') +
        '</div></section>' +

        '<div class="acct">' +
        '<form class="card stack-s" id="f-signin" novalidate><p class="eyebrow">Step 1</p><h2>Sign in</h2>' +
        '<button type="button" class="btn btn--outline btn--block" id="google"><span class="gmark" aria-hidden="true">G</span>Continue with Google</button>' +
        '<p class="or"><span>o gamit ang username</span></p>' +
        '<div class="field"><label for="si-user">Username o email</label><input id="si-user" type="text" autocomplete="username"></div>' +
        '<div class="field"><label for="si-pw">Password</label><input id="si-pw" type="password" autocomplete="current-password"></div>' +
        '<button type="submit" class="btn btn--dark btn--block">Sign in</button>' +
        '<button type="button" class="linkbtn" id="forgot">Nakalimutan ang password?</button></form>' +

        '<form class="card card--strong stack-s" id="f-setup" novalidate><p class="eyebrow">Step 2 · first time lang</p><h2>I-set up ang account</h2>' +
        '<div class="field"><label for="su-user">Username (ito ang makikita ng public)</label><input id="su-user" type="text" autocomplete="username" placeholder="hal. juan_dc"><span class="muted small" id="su-user-msg"></span></div>' +
        '<div class="field"><div class="labelrow"><label for="su-pw">Gumawa ng password</label><button type="button" class="linkbtn" id="su-show" aria-pressed="false">Show</button></div><input id="su-pw" type="password" autocomplete="new-password"></div>' +
        '<div class="meter"><div class="meter__bar"><span id="su-bar"></span></div><b id="su-label">Weak</b></div>' +
        '<ul class="rules" id="su-rules">' + rulesHTML('') + '</ul>' +
        '<div class="field"><label for="su-pw2">Ulitin ang password</label><input id="su-pw2" type="password" autocomplete="new-password"><span class="muted small" id="su-match"></span></div>' +
        '<button type="submit" class="btn btn--accent btn--block">Tapusin ang setup</button></form>' +

        '<form class="card stack-s" id="f-change" novalidate><p class="eyebrow">Sa settings · kahit kailan</p><h2>Palitan ang password</h2>' +
        '<div class="field"><label for="cp-old">Current password</label><input id="cp-old" type="password" autocomplete="current-password"></div>' +
        '<div class="field"><label for="cp-new">Bagong password</label><input id="cp-new" type="password" autocomplete="new-password"></div>' +
        '<ul class="rules" id="cp-rules">' + rulesHTML('') + '</ul>' +
        '<div class="field"><label for="cp-again">Ulitin ang bagong password</label><input id="cp-again" type="password" autocomplete="new-password"></div>' +
        '<p class="formerr" id="cp-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--dark btn--block">I-save ang bagong password</button>' +
        '<p class="muted small">Kapag naka-connect na: masa-sign out ang ibang device at may email notification pagkatapos magpalit.</p></form>' +
        '</div></div>';
      wire();
    }

    function wire() {
      var $ = function (sel) { return root.querySelector(sel); };
      root.querySelectorAll('[data-demo]').forEach(function (b) {
        b.addEventListener('click', function () {
          AN.auth.demoSignIn(b.getAttribute('data-demo'));
          ui.toast('Naka-sign in bilang @' + AN.auth.current().username + ' (' + AN.ROLES[AN.auth.current().role] + ').', 'ok');
        });
      });
      if ($('#signout')) $('#signout').addEventListener('click', function () { AN.auth.signOut(); ui.toast('Naka-sign out ka na.'); });

      $('#google').addEventListener('click', function () { attempt(AN.auth.signInWithGoogle(), 'Naka-sign in gamit ang Google.'); });
      $('#forgot').addEventListener('click', function () { attempt(AN.auth.requestPasswordReset($('#si-user').value), 'Na-send ang link sa email mo.'); });
      $('#f-signin').addEventListener('submit', function (e) {
        e.preventDefault();
        if (!$('#si-user').value.trim() || !$('#si-pw').value) { ui.toast('Ilagay ang username at password.', 'error'); return; }
        attempt(AN.auth.signInWithPassword($('#si-user').value.trim(), $('#si-pw').value), 'Naka-sign in ka na.');
      });

      function refreshSetup() {
        var pw = $('#su-pw').value, st = strength(pw);
        $('#su-rules').innerHTML = rulesHTML(pw);
        $('#su-bar').style.width = (st.n * 25) + '%';
        $('#su-bar').className = 'is-' + st.cls;
        $('#su-label').textContent = st.label;
        $('#su-label').className = 'is-' + st.cls;
        var again = $('#su-pw2').value;
        $('#su-match').textContent = again ? (again === pw ? 'Match ang password.' : 'Hindi pa match.') : '';
      }
      $('#su-pw').addEventListener('input', refreshSetup);
      $('#su-pw2').addEventListener('input', refreshSetup);
      $('#su-user').addEventListener('input', function (e) { $('#su-user-msg').textContent = e.target.value ? AN.auth.usernameError(e.target.value) : ''; });
      $('#su-show').addEventListener('click', function () {
        var show = $('#su-pw').type === 'password';
        $('#su-pw').type = show ? 'text' : 'password';
        this.textContent = show ? 'Hide' : 'Show';
        this.setAttribute('aria-pressed', String(show));
      });
      $('#f-setup').addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('#su-user').value.trim(), pw = $('#su-pw').value;
        var bad = AN.auth.usernameError(name);
        if (bad) { ui.toast(bad, 'error'); $('#su-user').focus(); return; }
        if (strength(pw).n < 4) { ui.toast('Hindi pa pasado ang password sa lahat ng rules.', 'error'); $('#su-pw').focus(); return; }
        if (pw !== $('#su-pw2').value) { ui.toast('Hindi match ang dalawang password.', 'error'); $('#su-pw2').focus(); return; }
        attempt(AN.auth.register(name, pw), 'Nagawa na ang account mo.');
      });

      $('#cp-new').addEventListener('input', function (e) { $('#cp-rules').innerHTML = rulesHTML(e.target.value); });
      $('#f-change').addEventListener('submit', function (e) {
        e.preventDefault();
        var err = '';
        if (!$('#cp-old').value) err = 'Ilagay ang current password.';
        else if (strength($('#cp-new').value).n < 4) err = 'Hindi pa pasado ang bagong password sa lahat ng rules.';
        else if ($('#cp-new').value === $('#cp-old').value) err = 'Dapat iba ang bagong password sa current.';
        else if ($('#cp-new').value !== $('#cp-again').value) err = 'Hindi match ang bagong password at ang ulit nito.';
        $('#cp-err').hidden = !err; $('#cp-err').textContent = err;
        if (err) return;
        attempt(AN.auth.changePassword($('#cp-old').value, $('#cp-new').value), 'Napalitan na ang password mo.');
      });
    }

    var off = AN.store.on(render);
    render();
    return off;
  };

  /* ================= ADMIN ================= */
  AN.views.admin = function (root) {
    var q = '';

    function render() {
      var s = AN.auth.current();
      if (!s || (s.role !== 'admin' && s.role !== 'moderator')) {
        root.innerHTML = '<div class="page page--narrow"><h1 class="display">Para sa admin</h1><p class="lead">Admin o moderator lang ang makakapasok dito. Sa demo, pwede kang pumasok bilang demo admin.</p><p class="btnrow"><button type="button" class="btn btn--dark" id="asadmin">Pumasok bilang demo admin</button><a class="btn btn--ghost" href="#/">Balik sa map</a></p></div>';
        root.querySelector('#asadmin').addEventListener('click', function () { AN.auth.demoSignIn('admin'); });
        return;
      }
      var isAdmin = s.role === 'admin';
      var all = AN.store.all();
      var visible = all.filter(function (r) { return !r.hidden; });
      var queue = visible.filter(function (r) { return r.needsReview; });
      var count = function (g) { return visible.filter(function (r) { return AN.STATUSES[r.status].group === g; }).length; };
      var byCat = AN.CATEGORIES.map(function (c) { return { c: c, n: visible.filter(function (r) { return r.category === c.id; }).length }; }).filter(function (x) { return x.n; }).sort(function (a, b) { return b.n - a.n; });
      var max = byCat.length ? byCat[0].n : 1;
      var needle = q.trim().toLowerCase();
      var rows = all.filter(function (r) { return !needle || [r.id, r.title, r.city, r.province, r.reporter].join(' ').toLowerCase().indexOf(needle) !== -1; });

      root.innerHTML =
        '<div class="page page--wide">' +
        '<div class="titlerow"><div class="stack-xs"><h1 class="display">Admin</h1><p class="muted">Demo data · @' + esc(s.username) + ' · ' + esc(AN.ROLES[s.role]) + '</p></div>' +
        '<div class="btnrow"><button type="button" class="btn btn--ghost" id="export">Export data (JSON)</button>' + (isAdmin ? '<button type="button" class="btn btn--ghost" id="reset">I-reset ang demo data</button>' : '') + '</div></div>' +

        '<div class="tiles">' +
        '<div class="tile tile--accent"><span>Pending review</span><b>' + queue.length + '</b></div>' +
        '<div class="tile"><span class="t-bukas">Hindi pa na-fix</span><b>' + count('bukas') + '</b></div>' +
        '<div class="tile"><span class="t-aksyon">In progress</span><b>' + count('aksyon') + '</b></div>' +
        '<div class="tile"><span class="t-ayos">Fixed</span><b>' + count('ayos') + '</b></div>' +
        '</div>' +

        '<section class="card stack-s"><h2>Reports na para i-review <span class="muted small">(' + queue.length + ')</span></h2>' +
        (queue.length ? '<div class="tablewrap"><table><thead><tr><th>Report</th><th>Location</th><th>Nag-report</th><th>Flag ng system</th><th>Action</th></tr></thead><tbody>' +
          queue.map(function (r) {
            var dup = visible.filter(function (o) { return o.id !== r.id && o.category === r.category && AN.geo.distance(r.lat, r.lng, o.lat, o.lng) <= 50; }).length;
            var flag = dup ? ['Possible duplicate (' + dup + ')', 'bukas'] : r.locationSource === 'gps' && r.accuracy > 50 ? ['Mahina ang GPS (±' + r.accuracy + ' m)', 'aksyon'] : ['Walang nakitang issue', 'ayos'];
            return '<tr><td><a class="cellreport" href="#/ulat/' + esc(r.id) + '"><img alt="" src="' + ui.photoSrc(ui.firstPhoto(r)) + '"><span><b>' + esc(r.title) + '</b><span class="muted small">' + esc(ui.cat(r.category).label) + ' · ' + esc(r.id) + '</span></span></a></td>' +
              '<td>' + esc(ui.placeLine(r) || 'Walang lugar') + '</td><td>@' + esc(r.reporter) + '<br><span class="muted small">' + ui.timeAgo(r.createdAt) + '</span></td>' +
              '<td><span class="pill pill--' + flag[1] + '">' + esc(flag[0]) + '</span></td>' +
              '<td><div class="btnrow"><button type="button" class="btn btn--dark btn--sm" data-act="approve" data-id="' + esc(r.id) + '">Approve</button><button type="button" class="btn btn--ghost btn--sm" data-act="reject" data-id="' + esc(r.id) + '">Reject</button></div></td></tr>';
          }).join('') + '</tbody></table></div>' : '<p class="empty">Walang pending review.</p>') +
        '</section>' +

        '<section class="card stack-s"><div class="titlerow"><h2>Lahat ng reports <span class="muted small">(' + rows.length + ')</span></h2><div class="field field--inline"><label class="sr" for="aq">Search sa mga reports</label><input id="aq" type="search" placeholder="Search: number, title, lugar, user" value="' + esc(q) + '"></div></div>' +
        '<div class="tablewrap tablewrap--tall"><table><thead><tr><th>Report</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr' + (r.hidden ? ' class="is-hidden"' : '') + '><td><a href="#/ulat/' + esc(r.id) + '"><b>' + esc(r.title) + '</b></a><br><span class="muted small">' + esc(r.id) + ' · ' + esc(ui.cat(r.category).short) + ' · @' + esc(r.reporter) + (r.hidden ? ' · HIDDEN' : '') + '</span></td>' +
            '<td>' + esc(r.city || '') + '<br><span class="muted small">' + esc(r.province || '') + '</span></td>' +
            '<td><label class="sr" for="st-' + esc(r.id) + '">Status ng ' + esc(r.id) + '</label><select id="st-' + esc(r.id) + '" data-status="' + esc(r.id) + '">' + Object.keys(AN.STATUSES).map(function (k) { return '<option value="' + k + '"' + (k === r.status ? ' selected' : '') + '>' + esc(AN.STATUSES[k].label) + '</option>'; }).join('') + '</select></td>' +
            '<td><div class="btnrow">' + (r.hidden ? '<button type="button" class="btn btn--ghost btn--sm" data-act="restore" data-id="' + esc(r.id) + '">Restore</button>' : '<button type="button" class="btn btn--ghost btn--sm" data-act="reject" data-id="' + esc(r.id) + '">Hide</button>') +
            (isAdmin ? '<button type="button" class="btn btn--ghost btn--sm btn--danger" data-act="delete" data-id="' + esc(r.id) + '">Delete</button>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div></section>' +

        '<div class="cols cols--even">' +
        '<section class="card stack-s"><h2>Users at roles</h2>' + (isAdmin ? '' : '<p class="muted small">Super admin lang ang pwedeng magpalit ng role.</p>') +
        AN.store.users().map(function (u) {
          return '<div class="userrow"><div><b>@' + esc(u.username) + '</b><br><span class="muted small">' + esc(u.note) + (u.suspended ? ' · SUSPENDED' : '') + '</span></div>' +
            '<label class="sr" for="role-' + esc(u.username) + '">Role ni ' + esc(u.username) + '</label><select id="role-' + esc(u.username) + '" data-role="' + esc(u.username) + '"' + (isAdmin ? '' : ' disabled') + '>' + Object.keys(AN.ROLES).map(function (k) { return '<option value="' + k + '"' + (k === u.role ? ' selected' : '') + '>' + esc(AN.ROLES[k]) + '</option>'; }).join('') + '</select>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-suspend="' + esc(u.username) + '"' + (isAdmin ? '' : ' disabled') + '>' + (u.suspended ? 'Restore' : 'Suspend') + '</button></div>';
        }).join('') + '</section>' +
        '<section class="card stack-s"><h2>Reports per category</h2>' +
        byCat.map(function (x) { return '<div class="bar"><span>' + esc(x.c.label) + '</span><div class="bar__track"><div style="width:' + Math.round(x.n / max * 100) + '%"></div></div><b>' + x.n + '</b></div>'; }).join('') +
        '<p class="muted small">Total: ' + visible.length + ' reports na nakikita ng public</p></section>' +
        '</div></div>';
      wire(isAdmin);
    }

    function wire(isAdmin) {
      var $ = function (sel) { return root.querySelector(sel); };
      root.querySelectorAll('[data-act]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-id'), act = b.getAttribute('data-act');
          if (act === 'delete') {
            if (!isAdmin || !window.confirm('I-delete nang tuluyan ang report ' + id + '? Hindi na ito maibabalik.')) return;
            AN.store.remove(id); ui.toast('Na-delete ang ' + id + '.');
          } else {
            AN.store.moderate(id, act);
            ui.toast({ approve: 'Na-approve ang ' + id + '.', reject: 'Na-hide ang ' + id + ' sa public.', restore: 'Na-restore ang ' + id + '.' }[act], 'ok');
          }
        });
      });
      root.querySelectorAll('[data-status]').forEach(function (sel) {
        sel.addEventListener('change', function () { AN.store.setStatus(sel.getAttribute('data-status'), sel.value); ui.toast('Na-update ang status.', 'ok'); });
      });
      root.querySelectorAll('[data-role]').forEach(function (sel) {
        sel.addEventListener('change', function () { AN.store.setUser(sel.getAttribute('data-role'), { role: sel.value }); ui.toast('Na-update ang role.', 'ok'); });
      });
      root.querySelectorAll('[data-suspend]').forEach(function (b) {
        b.addEventListener('click', function () {
          var name = b.getAttribute('data-suspend');
          var u = AN.store.users().filter(function (x) { return x.username === name; })[0];
          AN.store.setUser(name, { suspended: !u.suspended });
        });
      });
      $('#aq').addEventListener('input', function (e) {
        q = e.target.value; var pos = e.target.selectionStart;
        render();
        var el = root.querySelector('#aq'); el.focus(); try { el.setSelectionRange(pos, pos); } catch (err) { /* ayos lang */ }
      });
      $('#export').addEventListener('click', function () {
        var blob = new Blob([AN.store.exportJSON()], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'ayusin-natin-demo-data.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      if ($('#reset')) $('#reset').addEventListener('click', function () {
        if (!window.confirm('Ibalik sa original ang seed demo data? Mabubura ang lahat ng na-add mo sa browser na ito.')) return;
        AN.store.reset(); AN.auth.demoSignIn('admin'); ui.toast('Naibalik ang seed demo data.', 'ok');
      });
    }

    var off = AN.store.on(render);
    render();
    return off;
  };
})();
