/* Ayusin Natin — router at header. Hash routing para tumakbo kahit sa simpleng static hosting. */
(function () {
  'use strict';
  var AN = window.AN;
  var esc = AN.ui.esc;
  var cleanup = null;

  var ROUTES = {
    '': { view: 'map', title: 'Map', nav: 'map' },
    'mga-ulat': { view: 'list', title: 'Reports', nav: 'list' },
    'mag-ulat': { view: 'report', title: 'Mag-Report', nav: 'report' },
    'ulat': { view: 'detail', title: 'Report details', nav: 'list' },
    'users': { view: 'users', title: 'Users', nav: 'users' },
    'user': { view: 'profile', title: 'Profile', nav: 'users' },
    'contact': { view: 'contact', title: 'Contact Us', nav: 'contact' },
    'guide': { view: 'guide', title: 'Guide', nav: 'guide' },
    'account': { view: 'account', title: 'Account', nav: 'account' },
    'admin': { view: 'admin', title: 'Admin', nav: 'admin' }
  };

  function parse() {
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    var route = ROUTES[parts[0] || ''] || ROUTES[''];
    return { route: route, params: { id: parts[1] || '' } };
  }

  // Maliit na icon kada tab (lumalabas lang sa mobile na Navigation panel).
  var SVG = function (d) { return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
  var ICONS = {
    map: SVG('<path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11Z"/><circle cx="12" cy="10" r="2.2"/>'),
    list: SVG('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'),
    users: SVG('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.8 0 4.9 1.6 5.5 4.5"/>'),
    contact: SVG('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
    guide: SVG('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20"/>'),
    admin: SVG('<path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/>'),
    report: SVG('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>')
  };

  function renderHeader(nav) {
    var s = AN.auth.current();
    var staff = s && (s.role === 'admin' || s.role === 'moderator');
    var link = function (href, key, label) { return '<a href="' + href + '"' + (nav === key ? ' aria-current="page"' : '') + '>' + ICONS[key] + '<span>' + label + '</span></a>'; };
    document.getElementById('navlinks').innerHTML =
      link('#/', 'map', 'Map') + link('#/mga-ulat', 'list', 'Reports') + link('#/mag-ulat', 'report', 'Mag-Report') + link('#/users', 'users', 'Users') +
      link('#/contact', 'contact', 'Contact Us') + link('#/guide', 'guide', 'Guide') + (staff ? link('#/admin', 'admin', 'Admin') : '');
    // Account row: sa mobile panel lang ito nakikita (sa desktop nasa topactions ang userchip).
    document.getElementById('navaccount').innerHTML = s
      ? '<a class="navuser" href="#/account"' + (nav === 'account' ? ' aria-current="page"' : '') + '>' + AN.ui.avatar(s.username, 'm') + '<span><b>@' + esc(s.username) + '</b><small>' + esc(AN.ROLES[s.role] || s.role) + ' · Account at profile photo</small></span></a>'
      : '<a class="btn btn--line btn--block" href="#/account">Sign in o gumawa ng account</a>';
    document.getElementById('actions').innerHTML =
      '<a class="btn btn--accent" href="#/mag-ulat">Mag-Report</a>' +
      (s ? '<a class="userchip" href="#/account"' + (nav === 'account' ? ' aria-current="page"' : '') + '>' + AN.ui.avatar(s.username, 'm') + '<span>@' + esc(s.username) + '</span></a>'
         : '<a class="btn btn--line" href="#/account">Sign in</a>');
  }

  /* ---------- Hamburger / Navigation panel (mobile) ---------- */
  var topbar = document.getElementById('topbar'), menubtn = document.getElementById('menubtn'), backdrop = document.getElementById('navbackdrop');
  function menuOpen() { return topbar.classList.contains('nav-open'); }
  function setMenu(open) {
    topbar.classList.toggle('nav-open', open);
    document.body.classList.toggle('nav-open', open);
    backdrop.hidden = !open;
    menubtn.setAttribute('aria-expanded', String(open));
    menubtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) { var first = document.querySelector('#navlinks a[aria-current="page"]') || document.querySelector('#navlinks a'); if (first) first.focus(); }
  }
  menubtn.addEventListener('click', function () { setMenu(!menuOpen()); if (!menuOpen()) menubtn.focus(); });
  backdrop.addEventListener('click', function () { setMenu(false); });
  document.getElementById('nav').addEventListener('click', function (e) {
    if (e.target.closest('a') || e.target.closest('[data-close]')) { setMenu(false); if (e.target.closest('[data-close]')) menubtn.focus(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) { setMenu(false); menubtn.focus(); } });
  if (window.matchMedia) {
    var wide = window.matchMedia('(min-width: 861px)');
    (wide.addEventListener ? wide.addEventListener('change', function (e) { if (e.matches) setMenu(false); }) : wide.addListener(function (e) { if (e.matches) setMenu(false); }));
  }

  function go() {
    var p = parse();
    setMenu(false);
    if (cleanup) { try { cleanup(); } catch (e) { /* tuloy lang */ } cleanup = null; }
    var root = document.getElementById('app');
    root.innerHTML = '';
    root.className = 'view view--' + p.route.view;
    document.body.setAttribute('data-view', p.route.view);
    document.title = p.route.title + ' · Ayusin Natin';
    renderHeader(p.route.nav);
    cleanup = AN.views[p.route.view](root, p.params) || null;
    window.scrollTo(0, 0);
  }

  // Ang skip link ay hindi dapat magpalit ng route.
  document.querySelector('.skip').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('app').focus(); });
  window.addEventListener('hashchange', go);
  AN.store.on(function () { renderHeader(parse().route.nav); });
  if (!AN.store.isPersisted()) AN.ui.toast('Hindi available ang browser storage. Mawawala ang changes pag-refresh.', 'error');
  go();
})();
