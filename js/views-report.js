/* Ayusin Natin — Mag-report ng problema (form na may "Gamitin ang current location ko"). */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  AN.views = AN.views || {};
  var ui = AN.ui, esc = ui.esc, geo = AN.geo;
  var MAX_PHOTOS = 3;

  AN.views.report = function (root) {
    var s = AN.auth.current();
    if (!s) {
      root.innerHTML = '<div class="page page--narrow"><h1 class="display">Sign in muna</h1><p class="lead">Kailangan ng account para maka-report, para may matanong kung kulang ang details.</p><p class="btnrow"><a class="btn btn--dark" href="#/account">Go to sign in</a><a class="btn btn--ghost" href="#/">Balik sa map</a></p></div>';
      return;
    }

    var form = { photos: [], category: null, lat: null, lng: null, accuracy: null, source: null, province: '', city: '', cityAuto: false, barangay: '', landmark: '', title: '', description: '', severity: 'delikado' };
    var map = null, marker = null, circle = null, locating = false;
    var provinces = AN.PLACES.map(function (p) { return p.province; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();

    root.innerHTML =
      '<div class="page">' +
      '<div class="stack-s"><h1 class="display">Mag-report ng problema</h1><p class="lead">4 steps lang. Naka-sign in bilang @' + esc(s.username) + '.</p></div>' +
      '<div class="cols">' +
      '<form class="cols__main stack-m" id="rform" novalidate>' +

      '<section class="card stack-s"><h2><span class="step">1</span>Photo</h2>' +
      '<div class="photo-row"><div class="thumbs" id="thumbs"></div>' +
      '<div class="drop drop--row" id="dropzone">' +
      '<label class="btn btn--dark filebtn">Kumuha ng photo<input type="file" id="cam" accept="image/*" capture="environment"></label>' +
      '<label class="btn btn--outline filebtn">Pumili sa gallery<input type="file" id="gal" accept="image/*" multiple></label>' +
      '</div></div>' +
      '<p class="muted small">Hanggang ' + MAX_PHOTOS + ' photos. Nire-resize ang photo sa device mo bago i-save. Iwasang makunan ang mukha ng tao at plate number ng sasakyan.</p></section>' +

      '<section class="card stack-s"><h2><span class="step">2</span>Category</h2><div class="chips chips--lg" id="rcats" role="radiogroup" aria-label="Category"></div></section>' +

      '<section class="card stack-s"><h2><span class="step">3</span>Location</h2>' +
      '<div class="btnrow"><button type="button" class="btn btn--blue" id="usegps">' + gpsLabel(false) + '</button><span class="muted small">o i-tap ang map para ilagay ang pin</span></div>' +
      '<p class="locstatus" id="locstatus" role="status"></p>' +
      '<div class="minimap minimap--form" id="rmap"></div>' +
      '<div class="grid3">' +
      '<div class="field"><label for="province">Province</label><select id="province"><option value="">Pumili</option>' + provinces.map(function (p) { return '<option>' + esc(p) + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="city">City o municipality</label><select id="city"><option value="">Pumili muna ng province</option></select></div>' +
      '<div class="field"><label for="barangay">Barangay</label><input id="barangay" type="text" maxlength="60" placeholder="Hal. San Roque" autocomplete="off"></div>' +
      '</div>' +
      '<div class="field"><label for="landmark">Landmark (optional)</label><input id="landmark" type="text" maxlength="80" placeholder="Hal. tapat ng palengke, kanto ng..." autocomplete="off"></div>' +
      '<p class="muted small" id="placehint"></p>' +
      '</section>' +

      '<section class="card stack-s"><h2><span class="step">4</span>Details</h2>' +
      '<div class="field"><label for="title">Maikling title</label><input id="title" type="text" maxlength="80" placeholder="Hal. Malalim na lubak sa tapat ng palengke" autocomplete="off"></div>' +
      '<div class="field"><label for="description">Ano ang problema? (optional)</label><textarea id="description" rows="3" maxlength="600" placeholder="Gaano na katagal? Sino ang apektado?"></textarea></div>' +
      '<fieldset class="radios"><legend>Gaano ka-grabe?</legend>' +
      AN.SEVERITIES.map(function (v) { return '<label><input type="radio" name="severity" value="' + v.id + '"' + (v.id === form.severity ? ' checked' : '') + '>' + esc(v.label) + '</label>'; }).join('') +
      '</fieldset></section>' +

      '<div class="errors" id="errors" role="alert" tabindex="-1" hidden></div>' +
      '<div class="submitrow"><button type="submit" class="btn btn--accent btn--lg">Submit report</button><span class="muted small">Demo: lalabas agad ito sa map at mapupunta sa review ng admin. Sa browser mo lang ito naka-save.</span></div>' +
      '</form>' +

      '<aside class="cols__side stack-m">' +
      '<section class="card card--warn stack-s" id="dupes" hidden></section>' +
      '<section class="card stack-s"><h2>Mga paalala</h2><ul class="bullets"><li>Lugar at problema ang i-report, hindi tao.</li><li>Huwag ilagay sa panganib ang sarili para lang makakuha ng photo.</li><li>Kung may buhay na nanganganib, tumawag muna sa 911.</li></ul></section>' +
      '<section class="card stack-s"><h2>Para mas accurate ang location</h2><ul class="bullets"><li>I-on ang GPS o Location ng phone at i-allow kapag nagtanong ang browser.</li><li>Tumayo sa mismong lugar ng problema bago i-click ang button.</li><li>Kung malayo ang pin, i-drag ito sa exact na lugar.</li></ul></section>' +
      '</aside></div></div>';

    var $ = function (sel) { return root.querySelector(sel); };

    function gpsLabel(busy) { return busy ? 'Kinukuha ang location…' : 'Gamitin ang current location ko'; }

    /* ---------- Photo ---------- */
    function renderPhotos() {
      $('#thumbs').innerHTML = form.photos.map(function (src, i) {
        return '<div class="thumb"><img alt="Photo ' + (i + 1) + '" src="' + src + '"><button type="button" data-rm="' + i + '" aria-label="Remove photo ' + (i + 1) + '">×</button></div>';
      }).join('');
      $('#dropzone').hidden = form.photos.length >= MAX_PHOTOS;
    }
    function addFiles(files) {
      var room = MAX_PHOTOS - form.photos.length;
      var list = Array.prototype.slice.call(files || [], 0, room);
      if ((files || []).length > room) ui.toast('Hanggang ' + MAX_PHOTOS + ' photos lang.');
      list.reduce(function (chain, file) {
        return chain.then(function () {
          return ui.compressImage(file).then(function (src) { form.photos.push(src); renderPhotos(); }, function (err) { ui.toast(err.message, 'error'); });
        });
      }, Promise.resolve());
    }

    /* ---------- Category ---------- */
    function renderCats() {
      $('#rcats').innerHTML = AN.CATEGORIES.map(function (c) {
        var on = form.category === c.id;
        return '<button type="button" role="radio" class="chip' + (on ? ' is-on' : '') + '" data-cat="' + c.id + '" aria-checked="' + on + '">' + esc(c.label) + '</button>';
      }).join('');
    }

    /* ---------- Location ---------- */
    function fillCities() {
      var list = AN.PLACES.filter(function (p) { return p.province === form.province; });
      $('#city').innerHTML = form.province
        ? '<option value="">Pumili</option>' + list.map(function (p) { return '<option' + (p.city === form.city ? ' selected' : '') + '>' + esc(p.city) + '</option>'; }).join('')
        : '<option value="">Pumili muna ng province</option>';
    }
    function syncPlace() {
      $('#province').value = form.province;
      fillCities();
      $('#placehint').textContent = form.cityAuto ? 'Na-estimate ang province at city mula sa pin. Pakicheck kung tama, at ilagay ang barangay.' : 'Demo: ilang cities lang ang nasa list. Buong PSGC list ang ilalagay kapag may database na.';
    }

    function renderStatus(extra) {
      var el = $('#locstatus');
      var cls = 'locstatus';
      var text;
      if (extra) { text = extra.text; cls += extra.error ? ' is-error' : ''; }
      else if (form.lat == null) text = 'Wala pang napiling location.';
      else {
        var coords = form.lat.toFixed(6) + ', ' + form.lng.toFixed(6);
        if (!geo.inPH(form.lat, form.lng)) { text = 'Nasa labas ng Pilipinas ang location na ito (' + coords + '). Ilipat ang pin.'; cls += ' is-error'; }
        else if (form.source === 'gps') {
          var acc = Math.round(form.accuracy);
          text = 'Galing sa GPS · accuracy ±' + acc + ' m · ' + coords + (acc > 50 ? '. Medyo mahina ang signal, kaya i-drag ang pin sa exact na lugar.' : '. Pwede mo pang i-drag ang pin kung kailangan.');
          cls += acc > 50 ? ' is-warn' : ' is-ok';
        } else if (form.source === 'city') { text = 'Nasa gitna ng ' + form.city + ' ang pin. I-drag ito sa exact na lugar o gamitin ang current location mo.'; cls += ' is-warn'; }
        else { text = 'Nilagay mo ang pin · ' + coords; cls += ' is-ok'; }
      }
      el.className = cls;
      el.textContent = text;
    }

    function renderDupes() {
      var box = $('#dupes');
      if (form.lat == null || !form.category) { box.hidden = true; return; }
      var near = AN.store.list().filter(function (r) {
        return r.category === form.category && AN.STATUSES[r.status].group !== 'ayos' && geo.distance(form.lat, form.lng, r.lat, r.lng) <= 50;
      });
      box.hidden = near.length === 0;
      if (near.length) {
        box.innerHTML = '<h2>May similar na report sa malapit</h2><p class="muted">' + near.length + ' report sa parehong category ang nasa loob ng 50 metro. Kung pareho ito, buksan at i-click ang <b>Affected din ako</b> imbes na gumawa ng bago.</p>' +
          near.slice(0, 3).map(function (r) { return ui.reportCard(r); }).join('');
      }
    }

    /** Iisang pasukan ng anumang pagbabago sa location. source: 'gps' | 'pin' | 'city' */
    function setPoint(lat, lng, opt) {
      form.lat = +lat.toFixed(6); form.lng = +lng.toFixed(6);
      form.source = opt.source; form.accuracy = opt.source === 'gps' ? opt.accuracy : null;
      if (map) {
        if (!marker) {
          var pinEl = AN.mapkit.dropPin();
          pinEl.title = 'I-drag sa exact na lugar';
          marker = new window.maplibregl.Marker({ element: pinEl, anchor: 'bottom', draggable: true }).setLngLat([lng, lat]).addTo(map);
          marker.on('dragend', function () { var p = marker.getLngLat(); setPoint(p.lat, p.lng, { source: 'pin', pan: false }); });
        } else marker.setLngLat([lng, lat]);
        circle = form.source === 'gps' && form.accuracy ? form.accuracy : null;
        AN.mapkit.accuracyCircle(map, lat, lng, circle);
        if (opt.pan !== false) AN.mapkit.flyTo(map, lat, lng, Math.max(map.getZoom(), opt.zoom || 17));
      }
      if (opt.source !== 'city') {
        var near = geo.nearestPlace(lat, lng);
        if (near && near.meters <= 25000) { form.province = near.place.province; form.city = near.place.city; form.cityAuto = true; syncPlace(); }
      }
      renderStatus();
      renderDupes();
    }

    function useGps() {
      if (locating) return;
      locating = true;
      var btn = $('#usegps');
      btn.disabled = true; btn.textContent = gpsLabel(true);
      renderStatus({ text: 'Hinahanap ang pinaka-accurate na location. I-allow kapag nagtanong ang browser…' });
      geo.locate(function (fix) { setPoint(fix.lat, fix.lng, { source: 'gps', accuracy: fix.accuracy }); })
        .then(function (fix) {
          setPoint(fix.lat, fix.lng, { source: 'gps', accuracy: fix.accuracy });
          ui.toast('Nakuha ang location mo (±' + Math.round(fix.accuracy) + ' m).', 'ok');
        }, function (err) { renderStatus({ text: geo.errorText(err), error: true }); })
        .then(function () { locating = false; if (btn.isConnected) { btn.disabled = false; btn.textContent = form.source === 'gps' ? 'Kunin ulit ang location ko' : gpsLabel(false); } });
    }

    map = AN.mapkit.available() ? AN.mapkit.create($('#rmap'), { zoom: 5 }) : null;
    if (map) {
      map.on('click', function (e) { setPoint(e.lngLat.lat, e.lngLat.lng, { source: 'pin', pan: false }); });
      setTimeout(function () { if (map) map.resize(); }, 60);
    } else if (!$('#rmap').firstChild) {
      $('#rmap').innerHTML = AN.mapkit.noMapHTML;
    }

    /* ---------- Mga event ---------- */
    $('#cam').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    $('#gal').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    $('#thumbs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-rm]'); if (!b) return;
      form.photos.splice(+b.getAttribute('data-rm'), 1); renderPhotos();
    });
    $('#rcats').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      form.category = b.getAttribute('data-cat'); renderCats(); renderDupes();
    });
    $('#usegps').addEventListener('click', useGps);
    $('#province').addEventListener('change', function (e) { form.province = e.target.value; form.city = ''; form.cityAuto = false; syncPlace(); });
    $('#city').addEventListener('change', function (e) {
      form.city = e.target.value; form.cityAuto = false; syncPlace();
      var p = AN.PLACES.filter(function (x) { return x.city === form.city && x.province === form.province; })[0];
      if (p && (form.lat == null || form.source === 'city')) setPoint(p.lat, p.lng, { source: 'city', zoom: 14 });
    });
    ['barangay', 'landmark', 'title', 'description'].forEach(function (id) {
      $('#' + id).addEventListener('input', function (e) { form[id] = e.target.value; });
    });
    root.querySelectorAll('input[name="severity"]').forEach(function (el) {
      el.addEventListener('change', function (e) { form.severity = e.target.value; });
    });

    $('#rform').addEventListener('submit', function (e) {
      e.preventDefault();
      var errs = [];
      if (!form.photos.length) errs.push('Maglagay ng kahit isang photo.');
      if (!form.category) errs.push('Pumili ng category.');
      if (form.lat == null) errs.push('Ilagay ang location: gamitin ang current location mo o i-tap ang map.');
      else if (!geo.inPH(form.lat, form.lng)) errs.push('Nasa labas ng Pilipinas ang pin. Ilipat ito.');
      else if (form.source === 'city') errs.push('Nasa gitna pa lang ng city ang pin. I-drag ito sa exact na lugar o gamitin ang current location mo.');
      if (form.title.trim().length < 8) errs.push('Lagyan ng maikling title (at least 8 characters).');
      var box = $('#errors');
      if (errs.length) {
        box.hidden = false;
        box.innerHTML = '<b>Kulang pa ang report:</b><ul>' + errs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
        box.focus();
        return;
      }
      box.hidden = true;
      var place = AN.PLACES.filter(function (x) { return x.city === form.city && x.province === form.province; })[0];
      var res = AN.store.create({
        title: form.title.trim(), description: form.description.trim(), category: form.category, severity: form.severity,
        lat: form.lat, lng: form.lng, accuracy: form.accuracy, locationSource: form.source,
        region: place ? place.region : '', province: form.province, city: form.city, barangay: form.barangay.trim(), landmark: form.landmark.trim(),
        photos: form.photos
      });
      ui.toast(res.saved ? 'Na-submit ang report. Salamat!' : 'Na-submit, pero puno na ang browser storage kaya mawawala ito pag-refresh.', res.saved ? 'ok' : 'error');
      location.hash = '#/ulat/' + res.report.id;
    });

    renderPhotos(); renderCats(); syncPlace(); renderStatus();
    return function () { if (map) { map.remove(); map = null; } };
  };
})();
