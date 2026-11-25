/* Ayusin Natin — Account (profile photo + naka-abang na login) at Admin. */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  AN.views = AN.views || {};
  var ui = AN.ui, esc = ui.esc;
  var AVATAR_MAX_BYTES = 30 * 1024; // mas maliit pa sa report photo: 320 px, max 30 KB

  function rulesHTML(pw) {
    return AN.auth.passwordChecks(pw).map(function (c) {
      return '<li class="' + (c.ok ? 'is-ok' : '') + '"><span class="tick" aria-hidden="true"></span>' + esc(c.label) + '<span class="sr"> ' + (c.ok ? '(ok)' : '(kulang pa)') + '</span></li>';
    }).join('');
  }
  function strength(pw) {
    var n = AN.auth.passwordChecks(pw).filter(function (c) { return c.ok; }).length;
    return { n: n, label: ['Weak', 'Weak', 'Medium', 'Medium', 'Strong'][n], cls: ['weak', 'weak', 'mid', 'mid', 'strong'][n] };
  }
  /** Ang UI ay tumatawag na sa totoong auth function; hindi pa lang ito naka-connect. */
  function attempt(promise, okMsg) {
    promise.then(function () { ui.toast(okMsg, 'ok'); }, function (err) {
      ui.toast(err && (err.code === 'NOT_CONNECTED' || err.code === 'DEMO') ? err.message : 'May error. I-try ulit.', 'error');
    });
  }

  /* ================= ACCOUNT ================= */
  var GENDERS = [['babae', 'Babae'], ['lalaki', 'Lalaki'], ['iba', 'Iba pa'], ['hindi-sabihin', 'Prefer not to say']];
  function genderLabel(id) { var g = GENDERS.filter(function (x) { return x[0] === id; })[0]; return g ? g[1] : ''; }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function selectOpts(list, placeholder, val) {
    return '<option value="">' + esc(placeholder) + '</option>' + list.map(function (x) {
      var v = typeof x === 'string' ? x : x[0], l = typeof x === 'string' ? x : x[1];
      return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(l) + '</option>';
    }).join('');
  }
  function addressLine(a) {
    if (!a) return '';
    return [a.street, a.barangay ? 'Brgy. ' + a.barangay : '', a.city, a.province, a.regionName || a.region].filter(Boolean).join(', ');
  }

  AN.views.account = function (root) {
    // View state na dapat manatili kahit mag-re-render ang page (hal. pagkatapos mag-sign in).
    var v = { verifiedEmail: '', resetOpen: false, resetLogin: '', resetSent: false };

    function render() {
      var s = AN.auth.current();
      var u = s && AN.store.user(s.username);
      var st = s ? AN.store.stats(s.username) : null;
      var rk = s ? AN.store.rankOf(s.username) : null;
      root.innerHTML =
        '<div class="page">' +
        '<div class="stack-s"><h1 class="display">Account mo</h1><p class="lead">Open sa lahat ang map kahit walang account. Kailangan lang mag-sign in para mag-report at mag-update.</p></div>' +

        (s
          ? '<section class="card profile"><div class="avatarwrap">' + ui.avatar(s.username, 'xl') + '</div>' +
            '<div class="stack-s profile__main">' +
            '<div class="titlerow"><h2>@' + esc(s.username) + ' <span class="badge">' + esc(AN.ROLES[s.role]) + '</span></h2><a class="small" href="#/user/' + encodeURIComponent(s.username) + '">View public profile</a></div>' +
            '<p class="muted small">' + (st ? st.reports + ' reports · ' + st.score + ' points' : '') + (rk ? ' · Rank #' + rk.rank : '') + '</p>' +
            '<div class="btnrow">' +
            '<label class="btn btn--dark filebtn">Change profile photo<input type="file" id="pphoto" accept="image/*"></label>' +
            (u && u.photo ? '<button type="button" class="btn btn--ghost" id="rmpphoto">Remove photo</button>' : '') +
            '</div>' +
            '<p class="muted small">Pwede mula sa camera o gallery. Nire-resize sa 320 px at nako-compress sa max 30 KB. Kung walang photo, default user icon ang lalabas sa reports at profile mo.</p>' +
            (u && u.registered
              ? '<dl class="details"><div><dt>Full name</dt><dd>' + esc(u.fullName) + '</dd></div>' +
                '<div><dt>Email</dt><dd>' + esc(u.email) + (u.emailVerified ? ' <span class="pill pill--ayos">Verified</span>' : '') + '</dd></div>' +
                '<div><dt>Birthday · Age</dt><dd>' + esc(ui.fmtDate(u.birthday + 'T00:00:00')) + ' · ' + AN.auth.ageFrom(u.birthday) + '</dd></div>' +
                '<div><dt>Gender</dt><dd>' + esc(genderLabel(u.gender)) + '</dd></div>' +
                '<div><dt>Address</dt><dd>' + esc(addressLine(u.address)) + '</dd></div></dl>' +
                '<p class="muted small">Private ang mga detalyeng ito; username at profile photo lang ang nakikita ng iba. Demo: sa browser mo lang ito naka-save.</p>'
              : '<p class="note">Demo account ito, walang profile details. Para ma-try ang Full name, email verification, birthday at complete address, gumawa ng sariling account sa <b>Step 2</b> sa baba.</p>') +
            '</div></section>'
          : '') +

        '<section class="card card--warn stack-s"><h2>Demo mode</h2>' +
        '<p class="muted">Wala pang database at third-party login. Gumagana ang sign in, pag-create ng account, email code at forgot password sa baba, pero <b>sa browser mo lang</b> naka-save at <b>ipinapakita na lang sa screen ang code</b> imbes na i-email. Pwede ring pumili ng demo account para ma-try ang bawat role. ' +
        (s ? 'Naka-sign in ka bilang <b>@' + esc(s.username) + '</b> (' + esc(AN.ROLES[s.role]) + ').' : 'Hindi ka naka-sign in.') + '</p>' +
        '<div class="btnrow">' +
        '<button type="button" class="btn btn--dark" data-demo="user">Demo user</button>' +
        '<button type="button" class="btn btn--dark" data-demo="moderator">Demo moderator</button>' +
        '<button type="button" class="btn btn--dark" data-demo="lgu">Demo LGU</button>' +
        '<button type="button" class="btn btn--dark" data-demo="admin">Demo admin</button>' +
        (s ? '<button type="button" class="btn btn--ghost" id="signout">Sign out</button>' : '') +
        '</div></section>' +

        '<div class="acct">' +
        '<div class="stack-m">' +
        '<form class="card stack-s" id="f-signin" novalidate><p class="eyebrow">Step 1</p><h2>Sign in</h2>' +
        '<button type="button" class="btn btn--outline btn--block" id="google"><span class="gmark" aria-hidden="true">G</span>Continue with Google</button>' +
        '<p class="or"><span>o gamit ang username</span></p>' +
        '<div class="field"><label for="si-user">Username o email</label><input id="si-user" type="text" autocomplete="username" value="' + esc(v.resetLogin) + '"></div>' +
        '<div class="field"><label for="si-pw">Password</label><input id="si-pw" type="password" autocomplete="current-password"></div>' +
        '<p class="formerr" id="si-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--dark btn--block">Sign in</button>' +
        '<button type="button" class="linkbtn" id="forgot" aria-expanded="' + v.resetOpen + '">Forgot password?</button></form>' +

        '<form class="card card--strong stack-s" id="f-reset" novalidate' + (v.resetOpen ? '' : ' hidden') + '><p class="eyebrow">Forgot password</p><h2>Reset gamit ang email</h2>' +
        '<p class="muted small">Ilagay ang email (o username) ng account mo. Padadalhan ka ng 6-digit na reset code sa verified email mo. <b>Demo:</b> ipapakita na lang dito ang code.</p>' +
        '<div class="field"><label for="rp-login">Email o username</label><div class="inlinerow"><input id="rp-login" type="text" autocomplete="username" value="' + esc(v.resetLogin) + '"><button type="button" class="btn btn--ghost btn--sm" id="rp-send">Send reset code</button></div><span class="small" id="rp-msg"></span></div>' +
        '<div class="stack-s" id="rp-step2"' + (v.resetSent ? '' : ' hidden') + '>' +
        '<div class="field"><label for="rp-code">Reset code</label><input id="rp-code" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6 digits"></div>' +
        '<div class="field"><label for="rp-new">New password</label><input id="rp-new" type="password" autocomplete="new-password"></div>' +
        '<ul class="rules" id="rp-rules">' + rulesHTML('') + '</ul>' +
        '<div class="field"><label for="rp-again">Confirm new password</label><input id="rp-again" type="password" autocomplete="new-password"></div>' +
        '<p class="formerr" id="rp-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--dark btn--block">Save new password</button></div>' +
        '<button type="button" class="linkbtn" id="rp-back">Balik sa sign in</button></form>' +
        '</div>' +

        '<form class="card card--strong stack-s acct__wide" id="f-setup" novalidate><p class="eyebrow">Step 2 · first time lang</p><h2>I-set up ang account</h2>' +
        '<div class="grid2">' +
        '<div class="field"><label for="su-name">Full name</label><input id="su-name" type="text" maxlength="80" autocomplete="name" placeholder="Hal. Juan dela Cruz"></div>' +
        '<div class="field"><label for="su-user">Username (visible sa public)</label><input id="su-user" type="text" autocomplete="username" placeholder="hal. juan_dc"><span class="muted small" id="su-user-msg"></span></div>' +
        '</div>' +
        '<div class="field"><label for="su-email">Email <span class="muted">(ive-verify)</span></label>' +
        '<div class="inlinerow"><input id="su-email" type="email" maxlength="120" autocomplete="email" placeholder="ikaw@email.com"><button type="button" class="btn btn--ghost btn--sm" id="su-send">Send code</button></div>' +
        '<span class="small" id="su-email-msg">Padadalhan ng 6-digit code ang email mo para ma-verify. <b>Demo:</b> ipapakita na lang dito ang code; walang totoong email na pinapadala.</span></div>' +
        '<div class="field" id="su-codewrap" hidden><label for="su-code">Verification code</label>' +
        '<div class="inlinerow"><input id="su-code" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="6 digits"><button type="button" class="btn btn--dark btn--sm" id="su-verify">Verify</button></div><span class="small" id="su-code-msg"></span></div>' +
        '<div class="grid3">' +
        '<div class="field"><label for="su-bday">Birthday</label><input id="su-bday" type="date" max="' + todayISO() + '" autocomplete="bday"></div>' +
        '<div class="field"><label for="su-age">Age</label><input id="su-age" type="text" readonly tabindex="-1" placeholder="auto mula sa birthday"></div>' +
        '<div class="field"><label for="su-gender">Gender</label><select id="su-gender">' + selectOpts(GENDERS, 'Pumili') + '</select></div>' +
        '</div>' +
        '<fieldset class="addr"><legend>Complete address</legend>' +
        '<div class="grid2">' +
        '<div class="field"><label for="su-region">Region</label><select id="su-region">' + selectOpts(AN.ph.regions().map(function (r) { return [r.id, r.name]; }), 'Pumili ng region') + '</select></div>' +
        '<div class="field"><label for="su-prov">Province</label><select id="su-prov" disabled><option value="">Pumili muna ng region</option></select></div>' +
        '<div class="field"><label for="su-city">City / Municipality</label><select id="su-city" disabled><option value="">Pumili muna ng province</option></select></div>' +
        '<div class="field" id="su-brgywrap"><label for="su-brgy">Barangay</label><select id="su-brgy" disabled><option value="">Pumili muna ng city</option></select></div>' +
        '<div class="field" id="su-brgytxtwrap" hidden><label for="su-brgytxt">Barangay (i-type)</label><input id="su-brgytxt" type="text" maxlength="60" placeholder="Hal. San Roque"></div>' +
        '</div>' +
        '<div class="field"><label for="su-street">Street, Blk/Lot, House no. <span class="muted">(i-type)</span></label><input id="su-street" type="text" maxlength="120" autocomplete="street-address" placeholder="Hal. Blk 5 Lot 12, Mabini St."></div>' +
        '<p class="muted small">Demo list ang dropdown: lahat ng region at province, pangunahing cities, at barangay ng mga demo city. Buong PSGC kapag may database na.</p>' +
        '</fieldset>' +
        '<div class="grid2">' +
        '<div class="field"><div class="labelrow"><label for="su-pw">Create password</label><button type="button" class="linkbtn" id="su-show" aria-pressed="false">Show</button></div><input id="su-pw" type="password" autocomplete="new-password"></div>' +
        '<div class="field"><label for="su-pw2">Confirm password</label><input id="su-pw2" type="password" autocomplete="new-password"><span class="muted small" id="su-match"></span></div>' +
        '</div>' +
        '<div class="meter"><div class="meter__bar"><span id="su-bar"></span></div><b id="su-label">Weak</b></div>' +
        '<ul class="rules" id="su-rules">' + rulesHTML('') + '</ul>' +
        '<p class="formerr" id="su-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--accent btn--block">Finish setup</button>' +
        '<p class="muted small">Sa pag-click, gagawin at isa-sign in ang account mo sa browser na ito. Username at profile photo lang ang public; private ang iba.</p></form>' +

        '<form class="card stack-s" id="f-change" novalidate><p class="eyebrow">Sa settings · anytime</p><h2>Change password</h2>' +
        '<div class="field"><label for="cp-old">Current password</label><input id="cp-old" type="password" autocomplete="current-password"></div>' +
        '<div class="field"><label for="cp-new">New password</label><input id="cp-new" type="password" autocomplete="new-password"></div>' +
        '<ul class="rules" id="cp-rules">' + rulesHTML('') + '</ul>' +
        '<div class="field"><label for="cp-again">Confirm new password</label><input id="cp-again" type="password" autocomplete="new-password"></div>' +
        '<p class="formerr" id="cp-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn btn--dark btn--block">Save new password</button>' +
        '<p class="muted small">Gumagana para sa account na ginawa sa Step 2. Kapag naka-connect na ang backend: masa-sign out ang ibang device at may email notification pagkatapos mag-change.</p></form>' +
        '</div></div>';
      wire();
    }

    function wire() {
      var $ = function (sel) { return root.querySelector(sel); };
      function showErr(sel, msg) { var el = $(sel); if (!el) return; el.hidden = !msg; el.textContent = msg || ''; }
      function setMsg(sel, msg, cls) { var el = $(sel); if (!el) return; el.textContent = msg; el.className = 'small' + (cls ? ' t-' + cls : ' muted'); }
      function errText(err) { return err && (err.code === 'DEMO' || err.code === 'NOT_CONNECTED') ? err.message : 'May error. I-try ulit.'; }

      root.querySelectorAll('[data-demo]').forEach(function (b) {
        b.addEventListener('click', function () {
          AN.auth.demoSignIn(b.getAttribute('data-demo'));
          ui.toast('Naka-sign in bilang @' + AN.auth.current().username + ' (' + AN.ROLES[AN.auth.current().role] + ').', 'ok');
        });
      });
      if ($('#signout')) $('#signout').addEventListener('click', function () { AN.auth.signOut(); ui.toast('Naka-sign out ka na.'); });

      /* Profile photo: compress nang maliit, tapos i-save sa user record. */
      if ($('#pphoto')) $('#pphoto').addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0]; if (!file) return;
        e.target.value = '';
        ui.compressImage(file, 320, 0.82, AVATAR_MAX_BYTES).then(function (src) {
          var res = AN.store.setPhoto(src);
          if (!res.ok) { ui.toast(res.error, 'error'); return; }
          ui.toast(res.saved ? 'Updated na ang profile photo mo (' + Math.max(1, Math.round(ui.photoBytes(src) / 1024)) + ' KB).' : 'Na-set, pero full na ang browser storage kaya mawawala ito pag-refresh.', res.saved ? 'ok' : 'error');
        }, function (err) { ui.toast(err.message, 'error'); });
      });
      if ($('#rmpphoto')) $('#rmpphoto').addEventListener('click', function () {
        AN.store.setPhoto(null);
        ui.toast('Na-remove ang profile photo. Default icon na ulit ang gamit.');
      });

      /* ---------- Sign in ---------- */
      $('#google').addEventListener('click', function () { attempt(AN.auth.signInWithGoogle(), 'Naka-sign in gamit ang Google.'); });
      $('#f-signin').addEventListener('submit', function (e) {
        e.preventDefault();
        var login = $('#si-user').value.trim(), pw = $('#si-pw').value;
        if (!login || !pw) { showErr('#si-err', 'I-type ang username (o email) at password.'); return; }
        showErr('#si-err', '');
        AN.auth.signInWithPassword(login, pw).then(function (u) { ui.toast('Naka-sign in ka na bilang @' + u.username + '.', 'ok'); }, function (err) { showErr('#si-err', errText(err)); });
      });

      /* ---------- Forgot / reset password (via email code) ---------- */
      $('#forgot').addEventListener('click', function () {
        v.resetOpen = !v.resetOpen; v.resetLogin = $('#si-user').value.trim();
        $('#f-reset').hidden = !v.resetOpen; this.setAttribute('aria-expanded', String(v.resetOpen));
        if (v.resetOpen) { $('#rp-login').value = v.resetLogin; $('#rp-login').focus(); }
      });
      $('#rp-back').addEventListener('click', function () { v.resetOpen = false; $('#f-reset').hidden = true; $('#forgot').setAttribute('aria-expanded', 'false'); $('#si-user').focus(); });
      $('#rp-send').addEventListener('click', function () {
        var login = $('#rp-login').value.trim();
        if (!login) { setMsg('#rp-msg', 'I-type ang email o username ng account mo.', 'urgent'); return; }
        AN.auth.requestPasswordReset(login).then(function (r) {
          v.resetSent = true; v.resetLogin = login;
          $('#rp-step2').hidden = false;
          setMsg('#rp-msg', 'Sent ang reset code sa ' + r.email + '. Demo: ang code ay ' + r.demoCode + ' (valid ng 10 min; sa production, nasa email ito).', 'ayos');
          ui.toast('Demo reset code: ' + r.demoCode, 'ok');
          $('#rp-code').focus();
        }, function (err) { setMsg('#rp-msg', errText(err), 'urgent'); });
      });
      $('#rp-new').addEventListener('input', function (e) { $('#rp-rules').innerHTML = rulesHTML(e.target.value); });
      $('#f-reset').addEventListener('submit', function (e) {
        e.preventDefault();
        var login = $('#rp-login').value.trim(), code = $('#rp-code').value.trim(), pw = $('#rp-new').value;
        var err = '';
        if (!/^\d{6}$/.test(code)) err = 'I-type ang 6-digit na reset code.';
        else if (strength(pw).n < 4) err = 'Hindi pa pasado ang bagong password sa lahat ng rules.';
        else if (pw !== $('#rp-again').value) err = 'Hindi match ang bagong password at ang ulit nito.';
        showErr('#rp-err', err);
        if (err) return;
        AN.auth.resetPassword(login, code, pw).then(function (u) {
          v.resetOpen = false; v.resetSent = false; v.resetLogin = u.username;
          ui.toast('Changed na ang password mo. Mag-sign in gamit ang bagong password.', 'ok');
          render(); $('#si-pw').focus();
        }, function (err2) { showErr('#rp-err', errText(err2)); });
      });

      /* ---------- Step 2: I-set up ang account ---------- */
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
      $('#su-user').addEventListener('input', function (e) {
        var name = e.target.value.trim().toLowerCase();
        $('#su-user-msg').textContent = !name ? '' : AN.auth.usernameError(name) || (AN.store.user(name) ? 'Taken na ang username na ito.' : 'Available ang @' + name + '.');
      });
      $('#su-show').addEventListener('click', function () {
        var show = $('#su-pw').type === 'password';
        $('#su-pw').type = show ? 'text' : 'password';
        this.textContent = show ? 'Hide' : 'Show';
        this.setAttribute('aria-pressed', String(show));
      });

      // Email verification (demo code)
      function emailVerified() { return v.verifiedEmail && v.verifiedEmail === $('#su-email').value.trim().toLowerCase(); }
      $('#su-email').addEventListener('input', function () {
        if (!emailVerified()) { $('#su-email').classList.remove('is-verified'); $('#su-send').textContent = 'Send code'; }
      });
      $('#su-send').addEventListener('click', function () {
        var email = $('#su-email').value.trim();
        AN.auth.sendEmailCode(email).then(function (r) {
          $('#su-codewrap').hidden = false; $('#su-code').value = ''; $('#su-code').focus();
          setMsg('#su-email-msg', 'Sent ang code sa ' + r.email + '. Demo: ang verification code mo ay ' + r.demoCode + ' (valid ng 10 min; sa production, sa email ito darating).', 'aksyon');
          setMsg('#su-code-msg', '', '');
          $('#su-send').textContent = 'Resend code';
          ui.toast('Demo verification code: ' + r.demoCode, 'ok');
        }, function (err) { setMsg('#su-email-msg', errText(err), 'urgent'); });
      });
      $('#su-verify').addEventListener('click', function () {
        var email = $('#su-email').value.trim();
        AN.auth.verifyEmailCode(email, $('#su-code').value).then(function () {
          v.verifiedEmail = email.toLowerCase();
          $('#su-codewrap').hidden = true; $('#su-email').classList.add('is-verified');
          setMsg('#su-email-msg', 'Verified ang ' + email + ' ✓', 'ayos');
          $('#su-send').textContent = 'Verified';
          ui.toast('Verified na ang email mo.', 'ok');
        }, function (err) { setMsg('#su-code-msg', errText(err), 'urgent'); });
      });
      $('#su-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#su-verify').click(); } });

      // Birthday -> age
      $('#su-bday').addEventListener('change', function (e) {
        var age = AN.auth.ageFrom(e.target.value);
        $('#su-age').value = age == null ? '' : age + (age < 13 ? ' (dapat 13 pataas)' : '');
      });

      // Address dropdowns: Region > Province > City/Municipality > Barangay (o i-type kung wala sa list)
      function fill(sel, list, placeholder) { var el = $(sel); el.innerHTML = selectOpts(list, placeholder); el.disabled = !list.length; }
      $('#su-region').addEventListener('change', function (e) {
        fill('#su-prov', AN.ph.provinces(e.target.value).map(function (p) { return p.name; }), e.target.value ? 'Pumili ng province' : 'Pumili muna ng region');
        fill('#su-city', [], 'Pumili muna ng province'); fill('#su-brgy', [], 'Pumili muna ng city');
        $('#su-brgytxtwrap').hidden = true; $('#su-brgywrap').hidden = false;
      });
      $('#su-prov').addEventListener('change', function (e) {
        fill('#su-city', AN.ph.cities($('#su-region').value, e.target.value), e.target.value ? 'Pumili ng city/municipality' : 'Pumili muna ng province');
        fill('#su-brgy', [], 'Pumili muna ng city');
        $('#su-brgytxtwrap').hidden = true; $('#su-brgywrap').hidden = false;
      });
      $('#su-city').addEventListener('change', function (e) {
        var list = AN.ph.barangays($('#su-prov').value, e.target.value);
        var hasList = list.length > 0 && !!e.target.value;
        $('#su-brgywrap').hidden = !hasList;
        $('#su-brgytxtwrap').hidden = hasList || !e.target.value;
        fill('#su-brgy', hasList ? list.concat([['__iba', 'Iba pa / hindi nakalista (i-type)']]) : [], 'Pumili ng barangay');
      });
      $('#su-brgy').addEventListener('change', function (e) {
        var other = e.target.value === '__iba';
        $('#su-brgytxtwrap').hidden = !other;
        if (other) $('#su-brgytxt').focus();
      });

      $('#f-setup').addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('#su-user').value.trim().toLowerCase(), pw = $('#su-pw').value, email = $('#su-email').value.trim();
        var region = AN.ph.region($('#su-region').value);
        var brgySel = $('#su-brgy').value;
        var brgy = ($('#su-brgywrap').hidden || brgySel === '__iba') ? $('#su-brgytxt').value.trim() : brgySel;
        var age = AN.auth.ageFrom($('#su-bday').value);
        var err = '', focus = '';
        if ($('#su-name').value.trim().length < 3) { err = 'Ilagay ang full name mo.'; focus = '#su-name'; }
        else if (AN.auth.usernameError(name)) { err = AN.auth.usernameError(name); focus = '#su-user'; }
        else if (AN.store.user(name)) { err = 'Taken na ang username na ito. Pumili ng iba.'; focus = '#su-user'; }
        else if (AN.auth.emailError(email)) { err = 'Mukhang mali ang email.'; focus = '#su-email'; }
        else if (!emailVerified()) { err = 'I-verify muna ang email: i-click ang "Send code", tapos i-type ang code.'; focus = '#su-email'; }
        else if (age == null) { err = 'Ilagay ang birthday mo.'; focus = '#su-bday'; }
        else if (age < 13 || age > 120) { err = 'Dapat 13 taong gulang pataas para makagawa ng account.'; focus = '#su-bday'; }
        else if (!$('#su-gender').value) { err = 'Pumili ng gender.'; focus = '#su-gender'; }
        else if (!region) { err = 'Pumili ng region.'; focus = '#su-region'; }
        else if (!$('#su-prov').value) { err = 'Pumili ng province.'; focus = '#su-prov'; }
        else if (!$('#su-city').value) { err = 'Pumili ng city o municipality.'; focus = '#su-city'; }
        else if (!brgy) { err = 'Pumili o i-type ang barangay.'; focus = $('#su-brgywrap').hidden || brgySel === '__iba' ? '#su-brgytxt' : '#su-brgy'; }
        else if (strength(pw).n < 4) { err = 'Hindi pa pasado ang password sa lahat ng rules.'; focus = '#su-pw'; }
        else if (pw !== $('#su-pw2').value) { err = 'Hindi match ang dalawang password.'; focus = '#su-pw2'; }
        showErr('#su-err', err);
        if (err) { ui.toast(err, 'error'); if (focus) $(focus).focus(); return; }
        AN.auth.register({
          username: name, email: email, password: pw, fullName: $('#su-name').value, birthday: $('#su-bday').value, gender: $('#su-gender').value,
          address: { region: region.id, regionName: region.name, province: $('#su-prov').value, city: $('#su-city').value, barangay: brgy, street: $('#su-street').value }
        }).then(function (u) {
          v.verifiedEmail = '';
          ui.toast('Created na ang account mo. Naka-sign in ka na bilang @' + u.username + '.', 'ok');
          window.scrollTo(0, 0);
        }, function (err2) { showErr('#su-err', errText(err2)); ui.toast(errText(err2), 'error'); });
      });

      /* ---------- Change password ---------- */
      $('#cp-new').addEventListener('input', function (e) { $('#cp-rules').innerHTML = rulesHTML(e.target.value); });
      $('#f-change').addEventListener('submit', function (e) {
        e.preventDefault();
        var err = '';
        if (!$('#cp-old').value) err = 'I-type ang current password.';
        else if (strength($('#cp-new').value).n < 4) err = 'Hindi pa pasado ang bagong password sa lahat ng rules.';
        else if ($('#cp-new').value === $('#cp-old').value) err = 'Dapat iba ang bagong password sa current.';
        else if ($('#cp-new').value !== $('#cp-again').value) err = 'Hindi match ang bagong password at ang ulit nito.';
        showErr('#cp-err', err);
        if (err) return;
        AN.auth.changePassword($('#cp-old').value, $('#cp-new').value).then(function () {
          ui.toast('Changed na ang password mo.', 'ok');
          $('#cp-old').value = ''; $('#cp-new').value = ''; $('#cp-again').value = ''; $('#cp-rules').innerHTML = rulesHTML('');
        }, function (err2) { showErr('#cp-err', errText(err2)); });
      });
    }

    var off = AN.store.on(render);
    render();
    return off;
  };

  /* ================= ADMIN ================= */
  AN.views.admin = function (root) {
    var q = '', page = 1, uq = '', upage = 1;
    var PER_REPORTS = 50, PER_USERS = 30;

    function contactLabel(id) {
      var t = AN.CONTACT_TYPES.filter(function (x) { return x.id === id; })[0];
      return t ? t.label : id;
    }

    function render() {
      var s = AN.auth.current();
      if (!s || (s.role !== 'admin' && s.role !== 'moderator')) {
        root.innerHTML = '<div class="page page--narrow"><h1 class="display">Admin only</h1><p class="lead">Admin o moderator lang ang may access dito. Sa demo, pwede kang mag-sign in bilang demo admin.</p><p class="btnrow"><button type="button" class="btn btn--dark" id="asadmin">Sign in as demo admin</button><a class="btn btn--ghost" href="#/">Balik sa map</a></p></div>';
        root.querySelector('#asadmin').addEventListener('click', function () { AN.auth.demoSignIn('admin'); });
        return;
      }
      var isAdmin = s.role === 'admin';
      var all = AN.store.all();
      var visible = all.filter(function (r) { return !r.hidden; });
      var queue = visible.filter(function (r) { return r.needsReview; });
      var count = function (g) { return visible.filter(function (r) { return AN.STATUSES[r.status].group === g; }).length; };
      var urgent = visible.filter(ui.isUrgent).length;
      var byCat = AN.CATEGORIES.map(function (c) { return { c: c, n: visible.filter(function (r) { return r.category === c.id; }).length }; }).filter(function (x) { return x.n; }).sort(function (a, b) { return b.n - a.n; });
      var max = byCat.length ? byCat[0].n : 1;
      var needle = q.trim().toLowerCase();
      var rows = all.filter(function (r) { return !needle || [r.id, r.title, r.city, r.province, r.reporter, ui.catLabel(r)].join(' ').toLowerCase().indexOf(needle) !== -1; });
      var pg = ui.paginate(rows, page, PER_REPORTS);
      page = pg.page;
      var uneedle = uq.trim().toLowerCase();
      var users = AN.store.users().filter(function (u) { return !uneedle || [u.username, u.note, AN.ROLES[u.role]].join(' ').toLowerCase().indexOf(uneedle) !== -1; });
      var upg = ui.paginate(users, upage, PER_USERS);
      upage = upg.page;
      var fb = AN.store.feedback();
      var fbNew = fb.filter(function (x) { return x.status === 'new'; }).length;

      root.innerHTML =
        '<div class="page page--wide">' +
        '<div class="titlerow"><div class="stack-xs"><h1 class="display">Admin</h1><p class="muted">Demo data · @' + esc(s.username) + ' · ' + esc(AN.ROLES[s.role]) + '</p></div>' +
        '<div class="btnrow"><button type="button" class="btn btn--ghost" id="export">Export data (JSON)</button>' + (isAdmin ? '<button type="button" class="btn btn--ghost" id="reset">I-reset ang demo data</button>' : '') + '</div></div>' +

        '<div class="tiles">' +
        '<div class="tile tile--accent"><span>Pending review</span><b>' + queue.length + '</b></div>' +
        '<div class="tile"><span class="t-urgent">Urgent, hindi pa fixed</span><b>' + urgent + '</b></div>' +
        '<div class="tile"><span class="t-bukas">Hindi pa na-fix</span><b>' + count('bukas') + '</b></div>' +
        '<div class="tile"><span class="t-aksyon">In progress</span><b>' + count('aksyon') + '</b></div>' +
        '<div class="tile"><span class="t-ayos">Fixed</span><b>' + count('ayos') + '</b></div>' +
        '<div class="tile"><span>Contact messages</span><b>' + fbNew + '<span class="muted small"> new</span></b></div>' +
        '</div>' +

        '<section class="card stack-s"><h2>Reports na para i-review <span class="muted small">(' + queue.length + ')</span></h2>' +
        (queue.length ? '<div class="tablewrap"><table><thead><tr><th>Report</th><th>Location</th><th>Reporter</th><th>System flag</th><th>Action</th></tr></thead><tbody>' +
          queue.map(function (r) {
            var dup = visible.filter(function (o) { return o.id !== r.id && o.category === r.category && AN.geo.distance(r.lat, r.lng, o.lat, o.lng) <= 50; }).length;
            var flag = dup ? ['Possible duplicate (' + dup + ')', 'bukas'] : r.locationSource === 'gps' && r.accuracy > 50 ? ['Weak GPS (±' + r.accuracy + ' m)', 'aksyon'] : ['No issue', 'ayos'];
            return '<tr><td><a class="cellreport" href="#/ulat/' + esc(r.id) + '"><img alt="" src="' + ui.photoSrc(ui.firstPhoto(r)) + '"><span><b>' + esc(r.title) + '</b><span class="muted small">' + esc(ui.catLabel(r)) + ' · ' + esc(r.id) + '</span></span></a></td>' +
              '<td>' + esc(ui.placeLine(r) || 'No location') + '</td><td>' + ui.userLink(r.reporter, 'xs') + '<br><span class="muted small">' + ui.timeAgo(r.createdAt) + '</span></td>' +
              '<td><span class="pill pill--' + flag[1] + '">' + esc(flag[0]) + '</span>' + ui.urgentPill(r) + '</td>' +
              '<td><div class="btnrow"><button type="button" class="btn btn--dark btn--sm" data-act="approve" data-id="' + esc(r.id) + '">Approve</button><button type="button" class="btn btn--ghost btn--sm" data-act="reject" data-id="' + esc(r.id) + '">Reject</button></div></td></tr>';
          }).join('') + '</tbody></table></div>' : '<p class="empty">Walang pending review.</p>') +
        '</section>' +

        '<section class="card stack-s"><div class="titlerow"><h2>All reports <span class="muted small">(' + rows.length + ')</span></h2><div class="field field--inline"><label class="sr" for="aq">Search sa mga reports</label><input id="aq" type="search" placeholder="Search: number, title, lugar, user" value="' + esc(q) + '"></div></div>' +
        '<p class="muted small">' + ui.countLine(pg, 'reports') + '</p>' +
        '<div class="tablewrap tablewrap--tall"><table><thead><tr><th>Report</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
        pg.items.map(function (r) {
          return '<tr' + (r.hidden ? ' class="is-hidden"' : '') + '><td><a href="#/ulat/' + esc(r.id) + '"><b>' + esc(r.title) + '</b></a>' + (ui.isUrgent(r) ? ' ' + ui.urgentPill(r) : '') + '<br><span class="muted small">' + esc(r.id) + ' · ' + esc(ui.catShort(r)) + ' · </span>' + ui.userLink(r.reporter, 'xs', 'small') + (r.hidden ? ' <span class="muted small">· HIDDEN</span>' : '') + '</td>' +
            '<td>' + esc(r.city || '') + '<br><span class="muted small">' + esc(r.province || '') + '</span></td>' +
            '<td><label class="sr" for="st-' + esc(r.id) + '">Status ng ' + esc(r.id) + '</label><select id="st-' + esc(r.id) + '" data-status="' + esc(r.id) + '">' + Object.keys(AN.STATUSES).map(function (k) { return '<option value="' + k + '"' + (k === r.status ? ' selected' : '') + '>' + esc(AN.STATUSES[k].label) + '</option>'; }).join('') + '</select></td>' +
            '<td><div class="btnrow">' + (r.hidden ? '<button type="button" class="btn btn--ghost btn--sm" data-act="restore" data-id="' + esc(r.id) + '">Restore</button>' : '<button type="button" class="btn btn--ghost btn--sm" data-act="reject" data-id="' + esc(r.id) + '">Hide</button>') +
            (isAdmin ? '<button type="button" class="btn btn--ghost btn--sm btn--danger" data-act="delete" data-id="' + esc(r.id) + '">Delete</button>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div><div id="apager">' + ui.pagerHTML(pg) + '</div></section>' +

        '<section class="card stack-s"><div class="titlerow"><h2>Contact Us messages <span class="muted small">(' + fb.length + ')</span></h2></div>' +
        (fb.length ? fb.slice(0, ui.LIMITS.display).map(function (x) {
          return '<div class="fbrow' + (x.status === 'new' ? ' is-new' : '') + '"><div class="fbrow__head"><b>' + esc(x.id) + '</b><span class="badge">' + esc(contactLabel(x.type)) + '</span>' +
            '<span class="muted small">' + (x.by ? ui.userLink(x.by, 'xs', 'small') : esc(x.name || 'Anonymous')) + (x.email ? ' · ' + esc(x.email) : '') + ' · ' + ui.timeAgo(x.at) + '</span>' +
            '<label class="sr" for="fb-' + esc(x.id) + '">Status ng ' + esc(x.id) + '</label><select id="fb-' + esc(x.id) + '" data-fb="' + esc(x.id) + '">' + ['new', 'read', 'done'].map(function (k) { return '<option value="' + k + '"' + (k === x.status ? ' selected' : '') + '>' + k.charAt(0).toUpperCase() + k.slice(1) + '</option>'; }).join('') + '</select>' +
            (isAdmin ? '<button type="button" class="btn btn--ghost btn--sm btn--danger" data-fbdel="' + esc(x.id) + '">Delete</button>' : '') + '</div>' +
            '<p>' + esc(x.message) + '</p></div>';
        }).join('') : '<p class="empty">Wala pang message mula sa Contact Us.</p>') + '</section>' +

        '<div class="cols cols--even">' +
        '<section class="card stack-s"><div class="titlerow"><h2>Users at roles <span class="muted small">(' + users.length + ')</span></h2><div class="field field--inline"><label class="sr" for="auq">Search sa users</label><input id="auq" type="search" placeholder="Search: username, lugar, role" value="' + esc(uq) + '"></div></div>' +
        (isAdmin ? '' : '<p class="muted small">Super admin lang ang pwedeng mag-change ng role.</p>') +
        '<p class="muted small">' + ui.countLine(upg, 'users') + '</p>' +
        upg.items.map(function (u) {
          return '<div class="userrow">' + ui.userLink(u.username, 's') + '<div>' + (u.registered ? '<span class="small">' + esc(u.fullName) + (u.emailVerified ? ' <span class="pill pill--ayos">Email verified</span>' : '') + '</span><br>' : '') + '<span class="muted small">' + esc(u.note) + (u.suspended ? ' · SUSPENDED' : '') + ' · ' + AN.store.stats(u.username).reports + ' reports</span></div>' +
            '<label class="sr" for="role-' + esc(u.username) + '">Role ni ' + esc(u.username) + '</label><select id="role-' + esc(u.username) + '" data-role="' + esc(u.username) + '"' + (isAdmin ? '' : ' disabled') + '>' + Object.keys(AN.ROLES).map(function (k) { return '<option value="' + k + '"' + (k === u.role ? ' selected' : '') + '>' + esc(AN.ROLES[k]) + '</option>'; }).join('') + '</select>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-suspend="' + esc(u.username) + '"' + (isAdmin ? '' : ' disabled') + '>' + (u.suspended ? 'Restore' : 'Suspend') + '</button></div>';
        }).join('') + '<div id="aupager">' + ui.pagerHTML(upg) + '</div></section>' +
        '<section class="card stack-s"><h2>Reports per category</h2>' +
        byCat.map(function (x) { return '<div class="bar"><span>' + esc(x.c.label) + '</span><div class="bar__track"><div style="width:' + Math.round(x.n / max * 100) + '%"></div></div><b>' + x.n + '</b></div>'; }).join('') +
        '<p class="muted small">Total: ' + visible.length + ' reports na visible sa public · ' + AN.store.users().length + ' users</p></section>' +
        '</div></div>';
      wire(isAdmin);
    }

    function keepCaret(sel, fn) {
      return function (e) {
        var pos = e.target.selectionStart;
        fn(e);
        render();
        var el = root.querySelector(sel); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (err) { /* ayos lang */ } }
      };
    }

    function wire(isAdmin) {
      var $ = function (sel) { return root.querySelector(sel); };
      root.querySelectorAll('[data-act]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-id'), act = b.getAttribute('data-act');
          if (act === 'delete') {
            if (!isAdmin || !window.confirm('Permanently i-delete ang report ' + id + '? Hindi na ito ma-undo.')) return;
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
          var u = AN.store.user(name);
          AN.store.setUser(name, { suspended: !u.suspended });
        });
      });
      root.querySelectorAll('[data-fb]').forEach(function (sel) {
        sel.addEventListener('change', function () { AN.store.setFeedbackStatus(sel.getAttribute('data-fb'), sel.value); ui.toast('Na-update ang message status.', 'ok'); });
      });
      root.querySelectorAll('[data-fbdel]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-fbdel');
          if (!isAdmin || !window.confirm('I-delete ang message ' + id + '? Hindi na ito ma-undo.')) return;
          AN.store.removeFeedback(id); ui.toast('Na-delete ang ' + id + '.');
        });
      });
      $('#aq').addEventListener('input', keepCaret('#aq', function (e) { q = e.target.value; page = 1; }));
      $('#auq').addEventListener('input', keepCaret('#auq', function (e) { uq = e.target.value; upage = 1; }));
      $('#apager').addEventListener('click', function (e) {
        var b = e.target.closest('[data-page]'); if (!b || b.disabled) return;
        page = +b.getAttribute('data-page'); render();
      });
      $('#aupager').addEventListener('click', function (e) {
        var b = e.target.closest('[data-page]'); if (!b || b.disabled) return;
        upage = +b.getAttribute('data-page'); render();
      });
      $('#export').addEventListener('click', function () {
        var blob = new Blob([AN.store.exportJSON()], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'ayusin-natin-demo-data.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      });
      if ($('#reset')) $('#reset').addEventListener('click', function () {
        if (!window.confirm('I-reset sa original ang seed demo data? Mabubura lahat ng na-add mo sa browser na ito.')) return;
        AN.store.reset(); AN.auth.demoSignIn('admin'); ui.toast('Na-reset na ang seed demo data.', 'ok');
      });
    }

    var off = AN.store.on(render);
    render();
    return off;
  };
})();
