/* Ayusin Natin — Mag-Report. Terms & Conditions muna (required ang checkbox) bawat bukas ng page,
   camera lang ang photo (walang gallery), at required ang current location (GPS). */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  AN.views = AN.views || {};
  var ui = AN.ui, esc = ui.esc, geo = AN.geo;
  var MAX_PHOTOS = 3;
  var CAM_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" focusable="false"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  /** Terms & Conditions ng pag-report. Lumalabas sa bawat bukas ng Mag-Report; hindi inaalala ang pag-agree. */
  AN.TERMS = [
    ['Totoo at sarili mong report.', 'Problema sa public na lugar lang ang i-report (kalsada, baha, ilaw, basura, at iba pa), hindi tao o private na alitan. Siguraduhing totoo at kita mo mismo ang detalye.'],
    ['Photo.', 'Ikaw ang kumuha ng photo gamit ang camera. Ikaw ang may-ari nito at binibigyan mo ang Ayusin Natin ng permiso na ipakita ito sa public kasama ng report. Iwasang makunan ang mukha ng tao, plate number at iba pang personal na detalye.'],
    ['Location.', 'Kinukuha ang current GPS location mo at ipinapakita sa public map bilang location ng problema. Tumayo sa mismong lugar ng problema; huwag mag-report mula sa ibang lugar.'],
    ['Username at profile.', 'Lalabas sa report ang username at profile photo mo, at makikita ng iba ang listahan ng reports mo sa profile mo. Huwag maglagay ng personal info ng ibang tao sa title, description o photo.'],
    ['Moderation.', 'Pwedeng i-hide, i-update ang status, o i-delete ng moderator o admin ang report na mali, duplicate, spam o lumalabag sa rules. Pwedeng ma-suspend ang account na paulit-ulit lumalabag.'],
    ['Hindi ito emergency hotline.', 'Kung may nasugatan, sunog, o buhay ang nakataya, tumawag muna sa 911 o sa hotline ng LGU bago mag-report dito.'],
    ['Demo.', 'Sa prototype na ito, sa browser mo lang naka-save ang data at walang ahensyang tumatanggap ng report. Pwedeng i-reset anumang oras ang demo data.']
  ];

  function termsHTML() {
    return '<div class="modal" id="terms" role="dialog" aria-modal="true" aria-labelledby="terms-h" aria-describedby="terms-body">' +
      '<div class="modal__box">' +
      '<div class="stack-xs"><p class="eyebrow">Bago mag-report</p><h2 id="terms-h">Terms &amp; Conditions</h2></div>' +
      '<div class="modal__body" id="terms-body"><p class="muted">Basahin muna. Sa pag-tick ng checkbox, sumasang-ayon ka sa mga ito bawat report na i-submit mo.</p><ol>' +
      AN.TERMS.map(function (t) { return '<li><b>' + esc(t[0]) + '</b> ' + esc(t[1]) + '</li>'; }).join('') + '</ol></div>' +
      '<label class="check"><input type="checkbox" id="agree"><span>Nabasa ko at sumasang-ayon ako sa Terms &amp; Conditions, kasama ang paggamit ng photo, location at username ko sa public na report.</span></label>' +
      '<div class="btnrow"><button type="button" class="btn btn--accent btn--lg" id="proceed" disabled>Proceed sa report</button><a class="btn btn--ghost" href="#/">Cancel</a></div>' +
      '</div></div>';
  }

  AN.views.report = function (root) {
    var s = AN.auth.current();
    if (!s) {
      root.innerHTML = '<div class="page page--narrow"><h1 class="display">Sign in muna</h1><p class="lead">Kailangan ng account para maka-report, para may ma-contact kung kulang ang details.</p><p class="btnrow"><a class="btn btn--dark" href="#/account">Go to sign in</a><a class="btn btn--ghost" href="#/">Balik sa map</a></p></div>';
      return;
    }

    var form = { photos: [], category: null, categoryOther: '', lat: null, lng: null, accuracy: null, region: '', province: '', city: '', barangay: '', landmark: '', title: '', description: '', severity: 'delikado', termsAt: null };
    var map = null, marker = null, locating = false;

    root.innerHTML =
      termsHTML() +
      '<div class="page" id="rpage">' +
      '<div class="stack-s"><h1 class="display">Mag-Report ng problema</h1><p class="lead">4 steps lang. Signed in as @' + esc(s.username) + '.</p></div>' +
      '<div class="cols">' +
      '<form class="cols__main stack-m" id="rform" novalidate>' +

      '<section class="card stack-s"><h2><span class="step">1</span>Photo</h2>' +
      '<div class="photo-row"><div class="thumbs" id="thumbs"></div>' +
      '<div class="drop drop--row" id="dropzone">' +
      '<label class="btn btn--dark btn--lg filebtn">' + CAM_ICON + 'Open camera<input type="file" id="cam" accept="image/*" capture="environment"></label>' +
      '</div></div>' +
      '<p class="muted small">Diretso sa camera ng phone, walang upload mula sa gallery. Hanggang ' + MAX_PHOTOS + ' photos; nako-compress sa max 50 KB bawat isa para magaan. Iwasang makunan ang mukha ng tao at plate number.</p></section>' +

      '<section class="card stack-s"><h2><span class="step">2</span>Category</h2><div class="chips chips--lg" id="rcats" role="radiogroup" aria-label="Category"></div>' +
      '<div class="field" id="otherwrap" hidden><label for="catother">I-specify ang problema</label><input id="catother" type="text" maxlength="40" placeholder="Hal. sirang bakod ng school, nakaharang na truck" autocomplete="off"></div></section>' +

      '<section class="card stack-s"><h2><span class="step">3</span>Location</h2>' +
      '<p class="muted small">Required ang current location mo; walang manual na pagpili ng lugar. Tumayo sa mismong lugar ng problema, tapos i-tap ang button.</p>' +
      '<div class="btnrow"><button type="button" class="btn btn--blue btn--lg" id="usegps">' + gpsLabel(false) + '</button></div>' +
      '<p class="locstatus" id="locstatus" role="status"></p>' +
      '<div class="minimap minimap--form" id="rmap"></div>' +
      '<p class="muted small" id="placehint"></p>' +
      '<div class="grid3">' +
      '<div class="field"><label for="barangay">Barangay (optional)</label><input id="barangay" type="text" maxlength="60" placeholder="Hal. San Roque" autocomplete="off"></div>' +
      '<div class="field"><label for="landmark">Landmark (optional)</label><input id="landmark" type="text" maxlength="80" placeholder="Hal. tapat ng palengke, kanto ng..." autocomplete="off"></div>' +
      '</div></section>' +

      '<section class="card stack-s"><h2><span class="step">4</span>Details</h2>' +
      '<div class="field"><label for="title">Short title</label><input id="title" type="text" maxlength="80" placeholder="Hal. Malalim na pothole sa tapat ng palengke" autocomplete="off"></div>' +
      '<div class="field"><label for="description">Description (optional)</label><textarea id="description" rows="3" maxlength="600" placeholder="Gaano na katagal? Sino ang affected?"></textarea></div>' +
      '<fieldset class="radios"><legend>Severity: gaano ka-grabe?</legend>' +
      AN.SEVERITIES.map(function (v) { return '<label><input type="radio" name="severity" value="' + v.id + '"' + (v.id === form.severity ? ' checked' : '') + '>' + esc(v.label) + (v.id === 'agaran' ? ' <span class="muted small">(kikislap na pula sa map)</span>' : '') + '</label>'; }).join('') +
      '</fieldset></section>' +

      '<div class="errors" id="errors" role="alert" tabindex="-1" hidden></div>' +
      '<div class="submitrow"><button type="submit" class="btn btn--accent btn--lg">Submit report</button><span class="muted small">Demo: lalabas agad ito sa map at mapupunta sa admin review. Sa browser mo lang ito naka-save.</span></div>' +
      '</form>' +

      '<aside class="cols__side stack-m">' +
      '<section class="card card--warn stack-s" id="dupes" hidden></section>' +
      '<section class="card stack-s"><h2>Reminders</h2><ul class="bullets"><li>Place at problema ang i-report, hindi tao.</li><li>Huwag i-risk ang sarili para lang makakuha ng photo.</li><li>Kung emergency, tumawag muna sa 911.</li></ul></section>' +
      '<section class="card stack-s"><h2>Para mas accurate ang location</h2><ul class="bullets"><li>I-on ang GPS o Location ng phone at i-allow kapag nagtanong ang browser.</li><li>Tumayo sa mismong lugar ng problema bago i-tap ang button.</li><li>Kung malaki ang ± meters, lumabas sa open na lugar at i-tap ulit.</li></ul></section>' +
      '<section class="card stack-s"><h2>Terms &amp; Conditions</h2><p class="muted small">Sumang-ayon ka sa Terms bago nabuksan ang form na ito. <button type="button" class="linkbtn" id="showterms">Basahin ulit</button></p></section>' +
      '</aside></div></div>';

    var $ = function (sel) { return root.querySelector(sel); };

    /* ---------- Terms & Conditions (modal; required bago ma-proceed) ---------- */
    var page = $('#rpage');
    function lockPage(locked) {
      // Hindi ma-tab o ma-click ang form habang nakabukas ang Terms.
      if (locked) { page.setAttribute('inert', ''); page.setAttribute('aria-hidden', 'true'); document.body.classList.add('has-modal'); }
      else { page.removeAttribute('inert'); page.removeAttribute('aria-hidden'); document.body.classList.remove('has-modal'); }
    }
    function openTerms(reread) {
      var modal = $('#terms');
      if (!modal) { root.insertAdjacentHTML('afterbegin', termsHTML()); modal = $('#terms'); }
      var agree = modal.querySelector('#agree'), proceed = modal.querySelector('#proceed');
      if (reread) { agree.checked = true; proceed.disabled = false; proceed.textContent = 'Balik sa form'; }
      agree.addEventListener('change', function () { proceed.disabled = !agree.checked; });
      proceed.addEventListener('click', function () {
        if (!agree.checked) return;
        form.termsAt = form.termsAt || new Date().toISOString();
        modal.remove();
        lockPage(false);
        if (!reread) { ui.toast('Salamat. Pwede ka nang mag-report.', 'ok'); var cam = $('#cam'); if (cam) cam.closest('label').focus(); }
      });
      lockPage(true);
      modal.querySelector('.modal__box').setAttribute('tabindex', '-1');
      modal.querySelector('.modal__box').focus();
    }
    function onKey(e) { if (e.key === 'Escape' && $('#terms')) location.hash = '#/'; }
    document.addEventListener('keydown', onKey);
    openTerms(false);
    $('#showterms').addEventListener('click', function () { openTerms(true); });

    function gpsLabel(busy) { return busy ? 'Getting location…' : 'Use current location'; }

    /* ---------- Photo (camera lang) ---------- */
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
          return ui.compressImage(file).then(function (src) {
            form.photos.push(src); renderPhotos();
            ui.toast('Photo added · na-compress sa ' + Math.max(1, Math.round(ui.photoBytes(src) / 1024)) + ' KB.', 'ok');
          }, function (err) { ui.toast(err.message, 'error'); });
        });
      }, Promise.resolve());
    }

    /* ---------- Category ---------- */
    function renderCats() {
      $('#rcats').innerHTML = AN.CATEGORIES.map(function (c) {
        var on = form.category === c.id;
        return '<button type="button" role="radio" class="chip' + (on ? ' is-on' : '') + '" data-cat="' + c.id + '" aria-checked="' + on + '">' + esc(c.label) + '</button>';
      }).join('');
      $('#otherwrap').hidden = form.category !== 'iba';
    }

    /* ---------- Location (GPS lang) ---------- */
    function renderStatus(extra) {
      var el = $('#locstatus'), cls = 'locstatus', text;
      if (extra) { text = extra.text; cls += extra.error ? ' is-error' : ''; }
      else if (form.lat == null) text = 'Wala pang location. I-tap ang "Use current location".';
      else {
        var coords = form.lat.toFixed(6) + ', ' + form.lng.toFixed(6);
        var acc = Math.round(form.accuracy || 0);
        if (!geo.inPH(form.lat, form.lng)) { text = 'Nasa labas ng Pilipinas ang location mo (' + coords + '). Sa Pilipinas lang pwedeng mag-report.'; cls += ' is-error'; }
        else {
          text = 'GPS · accuracy ±' + acc + ' m · ' + coords + (acc > 50 ? '. Medyo weak ang signal: lumabas sa open na lugar at i-tap ulit.' : '');
          cls += acc > 50 ? ' is-warn' : ' is-ok';
        }
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
        box.innerHTML = '<h2>May similar na report nearby</h2><p class="muted">' + near.length + ' report sa same category ang nasa loob ng 50 meters. Kung pareho ito, i-open at i-click ang <b>Affected din ako</b> imbes na gumawa ng bago.</p>' +
          near.slice(0, 3).map(function (r) { return ui.reportCard(r); }).join('');
      }
    }

    /** Iisang pasukan ng location: galing lang sa GPS, hindi pwedeng i-drag o i-tap sa map. */
    function setPoint(lat, lng, accuracy) {
      form.lat = +lat.toFixed(6); form.lng = +lng.toFixed(6); form.accuracy = accuracy;
      if (map) {
        if (!marker) {
          var pinEl = AN.mapkit.dropPin();
          pinEl.classList.add('is-fixed');
          pinEl.title = 'Current location mo';
          marker = new window.maplibregl.Marker({ element: pinEl, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map);
        } else marker.setLngLat([lng, lat]);
        AN.mapkit.accuracyCircle(map, lat, lng, accuracy || null);
        AN.mapkit.flyTo(map, lat, lng, Math.max(map.getZoom(), 17));
      }
      var near = geo.nearestPlace(lat, lng);
      if (near && near.meters <= 25000) { form.province = near.place.province; form.city = near.place.city; form.region = near.place.region; }
      else { form.province = ''; form.city = ''; form.region = ''; }
      $('#placehint').textContent = form.city
        ? 'Detected: ' + form.city + ', ' + form.province + ' (auto mula sa GPS). Demo: ilang cities lang ang nasa list; buong PSGC list kapag may database na.'
        : 'Hindi ma-match ang city sa demo list, pero mase-save ang exact na coordinates.';
      renderStatus();
      renderDupes();
    }

    function useGps() {
      if (locating) return;
      locating = true;
      var btn = $('#usegps');
      btn.disabled = true; btn.textContent = gpsLabel(true);
      renderStatus({ text: 'Hinahanap ang pinaka-accurate na location. I-allow kapag nagtanong ang browser…' });
      geo.locate(function (fix) { setPoint(fix.lat, fix.lng, fix.accuracy); })
        .then(function (fix) {
          setPoint(fix.lat, fix.lng, fix.accuracy);
          ui.toast('Nakuha ang location mo (±' + Math.round(fix.accuracy) + ' m).', 'ok');
        }, function (err) { renderStatus({ text: geo.errorText(err), error: true }); })
        .then(function () { locating = false; if (btn.isConnected) { btn.disabled = false; btn.textContent = form.lat != null ? 'Get location again' : gpsLabel(false); } });
    }

    map = AN.mapkit.available() ? AN.mapkit.create($('#rmap'), { zoom: 5 }) : null;
    if (map) setTimeout(function () { if (map) map.resize(); }, 60);
    else if (!$('#rmap').firstChild) $('#rmap').innerHTML = AN.mapkit.noMapHTML;

    /* ---------- Mga event ---------- */
    $('#cam').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
    $('#thumbs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-rm]'); if (!b) return;
      form.photos.splice(+b.getAttribute('data-rm'), 1); renderPhotos();
    });
    $('#rcats').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      form.category = b.getAttribute('data-cat'); renderCats(); renderDupes();
      if (form.category === 'iba') $('#catother').focus();
    });
    $('#catother').addEventListener('input', function (e) { form.categoryOther = e.target.value; });
    $('#usegps').addEventListener('click', useGps);
    ['barangay', 'landmark', 'title', 'description'].forEach(function (id) {
      $('#' + id).addEventListener('input', function (e) { form[id] = e.target.value; });
    });
    root.querySelectorAll('input[name="severity"]').forEach(function (el) {
      el.addEventListener('change', function (e) { form.severity = e.target.value; });
    });

    $('#rform').addEventListener('submit', function (e) {
      e.preventDefault();
      var errs = [];
      if (!form.termsAt) errs.push('Sumang-ayon muna sa Terms & Conditions.');
      if (!form.photos.length) errs.push('Kumuha ng at least 1 photo gamit ang camera.');
      if (!form.category) errs.push('Pumili ng category.');
      else if (form.category === 'iba' && form.categoryOther.trim().length < 3) errs.push('I-specify kung ano ang problema sa "Iba pa".');
      if (form.lat == null) errs.push('Kailangan ang current location mo. I-tap ang "Use current location".');
      else if (!geo.inPH(form.lat, form.lng)) errs.push('Nasa labas ng Pilipinas ang location mo. Sa Pilipinas lang ang reports.');
      if (form.title.trim().length < 8) errs.push('Lagyan ng short title (at least 8 characters).');
      var box = $('#errors');
      if (errs.length) {
        box.hidden = false;
        box.innerHTML = '<b>Incomplete pa ang report:</b><ul>' + errs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
        box.focus();
        return;
      }
      box.hidden = true;
      var res = AN.store.create({
        title: form.title.trim(), description: form.description.trim(), category: form.category, categoryOther: form.category === 'iba' ? form.categoryOther.trim() : '', severity: form.severity,
        lat: form.lat, lng: form.lng, accuracy: form.accuracy, locationSource: 'gps',
        region: form.region, province: form.province, city: form.city, barangay: form.barangay.trim(), landmark: form.landmark.trim(),
        photos: form.photos, termsAcceptedAt: form.termsAt
      });
      ui.toast(res.saved ? 'Submitted na ang report. Salamat!' : 'Submitted, pero full na ang browser storage kaya mawawala ito pag-refresh.', res.saved ? 'ok' : 'error');
      location.hash = '#/ulat/' + res.report.id;
    });

    renderPhotos(); renderCats(); renderStatus();
    return function () {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('has-modal');
      if (map) { map.remove(); map = null; }
    };
  };
})();
