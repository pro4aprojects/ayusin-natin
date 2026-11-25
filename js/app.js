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
    'account': { view: 'account', title: 'Account', nav: 'account' },
    'admin': { view: 'admin', title: 'Admin', nav: 'admin' }
  };

  function parse() {
    var parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    var route = ROUTES[parts[0] || ''] || ROUTES[''];
    return { route: route, params: { id: parts[1] || '' } };
  }

  function renderHeader(nav) {
    var s = AN.auth.current();
    var link = function (href, key, label) { return '<a href="' + href + '"' + (nav === key ? ' aria-current="page"' : '') + '>' + label + '</a>'; };
    document.getElementById('nav').innerHTML =
      link('#/', 'map', 'Map') + link('#/mga-ulat', 'list', 'Reports') + link('#/users', 'users', 'Users') + link('#/contact', 'contact', 'Contact Us') +
      (s && (s.role === 'admin' || s.role === 'moderator') ? link('#/admin', 'admin', 'Admin') : '');
    document.getElementById('actions').innerHTML =
      '<a class="btn btn--accent" href="#/mag-ulat">Mag-Report</a>' +
      (s ? '<a class="userchip" href="#/account"' + (nav === 'account' ? ' aria-current="page"' : '') + '>' + AN.ui.avatar(s.username, 'm') + '<span>@' + esc(s.username) + '</span></a>'
         : '<a class="btn btn--line" href="#/account">Sign in</a>');
  }

  function go() {
    var p = parse();
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
