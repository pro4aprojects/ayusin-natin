/* Ayusin Natin — maliliit na helper para sa UI at lokasyon. */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  var MONTHS = ['Ene', 'Peb', 'Mar', 'Abr', 'May', 'Hun', 'Hul', 'Ago', 'Set', 'Okt', 'Nob', 'Dis'];

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cat(id) {
    return AN.CATEGORIES.filter(function (c) { return c.id === id; })[0] || AN.CATEGORIES[AN.CATEGORIES.length - 1];
  }

  function fmtDate(iso) {
    var d = new Date(iso);
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function timeAgo(iso) {
    var mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return 'ngayon lang';
    if (mins < 60) return mins + ' minuto na';
    var hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + ' oras na';
    var days = Math.round(hrs / 24);
    if (days <= 30) return days + ' araw na';
    return fmtDate(iso);
  }

  function statusPill(status, big) {
    var s = AN.STATUSES[status] || AN.STATUSES.naiulat;
    return '<span class="pill pill--' + s.group + (big ? ' pill--big' : '') + '">' + esc(s.label) + '</span>';
  }

  // Fallback na "photo" para sa seed data kapag walang totoong larawan sa AN.DEMO_PHOTOS.
  function demoPhoto(catId, kind) {
    var c = cat(catId);
    var after = kind === 'after';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="' + (after ? '#D5E8DA' : c.tint) + '"/>' +
      '<rect y="190" width="400" height="110" fill="' + (after ? '#B9D4C0' : '#C4CBD2') + '"/>' +
      '<path d="M0 190h400" stroke="#fff" stroke-width="3" stroke-dasharray="26 18" opacity=".7"/>' +
      '<text x="200" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#0E2238">' + esc(c.short) + '</text>' +
      '<text x="200" y="166" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#40536A">Demo photo · ' + (after ? 'after' : 'before') + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /** Totoong larawan para sa demo (Wikimedia Commons, kuha sa Pilipinas) kung meron sa AN.DEMO_PHOTOS. */
  function demoPhotoInfo(src) {
    if (!src || src.indexOf('demo:') !== 0) return null;
    var p = src.split(':');
    var set = AN.DEMO_PHOTOS && AN.DEMO_PHOTOS[p[1]];
    return (set && set[p[2] === 'after' ? 'after' : 'before']) || null;
  }

  function photoSrc(photo) {
    if (!photo) return demoPhoto('iba', 'before');
    if (photo.src.indexOf('demo:') === 0) {
      var real = demoPhotoInfo(photo.src);
      var p = photo.src.split(':');
      return real ? real.src : demoPhoto(p[1], p[2]);
    }
    return photo.src;
  }

  /** Credit ng larawan (Commons). Walang credit ang mga upload ng user. */
  function photoCredit(photo) {
    var real = photo && demoPhotoInfo(photo.src);
    if (!real) return '';
    return '<a class="credit" href="' + esc(real.page) + '" target="_blank" rel="noopener">Photo: ' + esc(real.author) + ' · ' + esc(real.license) + ' · Wikimedia Commons</a>';
  }

  function firstPhoto(r, kind) {
    var list = r.photos.filter(function (p) { return !kind || p.kind === kind; });
    return kind === 'after' ? list[list.length - 1] : list[0];
  }

  function placeLine(r) {
    return [r.barangay ? 'Brgy. ' + r.barangay : '', r.city, r.province].filter(Boolean).join(', ');
  }

  function reportCard(r, opts) {
    opts = opts || {};
    return '<a class="rcard' + (opts.active ? ' is-active' : '') + '" href="#/ulat/' + esc(r.id) + '" data-id="' + esc(r.id) + '">' +
      '<img class="rcard__img" alt="" loading="lazy" src="' + photoSrc(firstPhoto(r)) + '">' +
      '<span class="rcard__body">' +
      '<span class="rcard__title">' + esc(r.title) + '</span>' +
      '<span class="rcard__meta">' + esc(cat(r.category).short) + ' · ' + esc(r.city || 'Walang city') + ' · ' + timeAgo(r.createdAt) + '</span>' +
      '<span class="rcard__row">' + statusPill(r.status) + '<span class="muted small">' + r.affected + ' affected din</span></span>' +
      '</span></a>';
  }

  function toast(msg, kind) {
    var box = document.getElementById('toasts');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast--' + kind : '');
    el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    el.textContent = msg;
    while (box.children.length >= 3) box.removeChild(box.firstChild);
    box.appendChild(el);
    setTimeout(function () { el.classList.add('is-leaving'); }, 4200);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 4700);
  }

  /** Pinaliliit ang litrato sa browser bago i-save (max 1100px, JPEG). */
  function compressImage(file, maxDim, quality) {
    maxDim = maxDim || 1100; quality = quality || 0.72;
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('Photo lang ang pwedeng i-upload.'));
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        try { resolve(canvas.toDataURL('image/jpeg', quality)); } catch (e) { reject(new Error('Hindi mabasa ang photo.')); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Hindi mabasa ang photo.')); };
      img.src = url;
    });
  }

  /* ---------- Lokasyon ---------- */
  var PH = { minLat: 4.2, maxLat: 21.5, minLng: 116.0, maxLng: 127.2 };

  function distance(lat1, lng1, lat2, lng2) {
    var R = 6371000, rad = Math.PI / 180;
    var dLat = (lat2 - lat1) * rad, dLng = (lng2 - lng1) * rad;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  var geo = {
    PH: PH,
    distance: distance,
    inPH: function (lat, lng) { return lat >= PH.minLat && lat <= PH.maxLat && lng >= PH.minLng && lng <= PH.maxLng; },
    nearestPlace: function (lat, lng) {
      var best = null;
      AN.PLACES.forEach(function (p) {
        var d = distance(lat, lng, p.lat, p.lng);
        if (!best || d < best.meters) best = { place: p, meters: d };
      });
      return best;
    },
    /** Kinukuha ang kasalukuyang lokasyon. Nakikinig nang hanggang ~10 segundo at
        ibinabalik ang pinakatumpak na nabasa (humihinto agad kapag ±15 m o mas maliit). */
    locate: function (onProgress) {
      return new Promise(function (resolve, reject) {
        if (!('geolocation' in navigator)) return reject({ code: 'unsupported' });
        if (window.isSecureContext === false) return reject({ code: 'insecure' });
        var best = null, finished = false, watchId = null, timer = null;
        function finish(err) {
          if (finished) return;
          finished = true;
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          clearTimeout(timer);
          if (best) resolve(best); else reject(err || { code: 'timeout' });
        }
        watchId = navigator.geolocation.watchPosition(function (pos) {
          var fix = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
          if (!best || fix.accuracy < best.accuracy) {
            best = fix;
            if (onProgress) onProgress(best);
          }
          if (best.accuracy <= 15) finish();
        }, function (err) {
          finish({ code: err.code === 1 ? 'denied' : err.code === 2 ? 'unavailable' : 'timeout' });
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
        timer = setTimeout(function () { finish(); }, 10000);
      });
    },
    errorText: function (err) {
      var code = err && err.code;
      if (code === 'denied') return 'Hindi na-allow ang location. I-enable ang location permission ng site na ito sa browser, o ilagay na lang ang pin sa map.';
      if (code === 'insecure') return 'Gumagana lang ang location sa https o localhost. Ilagay muna ang pin sa map.';
      if (code === 'unsupported') return 'Hindi supported ng browser na ito ang location. Ilagay ang pin sa map.';
      if (code === 'unavailable') return 'Hindi makuha ang location ngayon. I-on ang GPS o Location ng device at i-try ulit.';
      return 'Natagalan ang pagkuha ng location. I-try ulit sa open na lugar, o ilagay ang pin sa map.';
    }
  };

  AN.ui = { esc: esc, cat: cat, fmtDate: fmtDate, timeAgo: timeAgo, statusPill: statusPill, demoPhoto: demoPhoto, photoSrc: photoSrc, photoCredit: photoCredit, firstPhoto: firstPhoto, placeLine: placeLine, reportCard: reportCard, toast: toast, compressImage: compressImage };
  AN.geo = geo;

  /* ---------- Mapa: MapLibre GL + OpenFreeMap (vector tiles, 3D na gusali) ----------
     Walang API key ang OpenFreeMap. Kapag nag-host ng sariling tiles o kumuha ng provider,
     palitan lang ang MAP_STYLE. Lahat ng screen na may mapa ay dumadaan sa AN.mapkit. */
  var MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  var PITCH_3D = 55;

  function groupColor(id) {
    var g = AN.STATUS_GROUPS.filter(function (x) { return x.id === id; })[0];
    return g ? g.color : '#5F748A';
  }

  /** Tumatakbo kapag na-load na ang style (o agad kung na-load na). */
  function whenReady(map, fn) {
    if (map.__anReady) { fn(); return; }
    (map.__anQueue = map.__anQueue || []).push(fn);
  }

  /** Nagdaragdag ng 3D na gusali kung wala pa sa style, at kinukulayan ayon sa taas. */
  function ensureBuildings(map) {
    var layers = map.getStyle().layers || [];
    var existing = layers.filter(function (l) { return l.type === 'fill-extrusion' && l['source-layer'] === 'building'; })[0];
    var color = ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0], 0, '#E3E7EC', 30, '#C9D2DC', 100, '#A5B4C4', 200, '#8296AB'];
    if (existing) {
      map.setPaintProperty(existing.id, 'fill-extrusion-color', color);
      map.setPaintProperty(existing.id, 'fill-extrusion-opacity', 0.9);
      map.__anBuildings = existing.id;
      return;
    }
    var source = null;
    var srcs = map.getStyle().sources || {};
    Object.keys(srcs).forEach(function (k) { if (!source && srcs[k].type === 'vector') source = k; });
    if (!source) return;
    var firstLabel = layers.filter(function (l) { return l.type === 'symbol'; })[0];
    map.addLayer({
      id: 'an-building-3d', type: 'fill-extrusion', source: source, 'source-layer': 'building', minzoom: 14,
      paint: {
        'fill-extrusion-color': color,
        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.2, ['coalesce', ['get', 'render_height'], 6]],
        'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.2, ['coalesce', ['get', 'render_min_height'], 0]],
        'fill-extrusion-opacity': 0.9
      }
    }, firstLabel ? firstLabel.id : undefined);
    map.__anBuildings = 'an-building-3d';
  }

  /** Unang font ng style para sa mga label ng kumpol (kailangan ng glyphs na nasa server ng style). */
  function styleFont(map) {
    var sym = (map.getStyle().layers || []).filter(function (l) { return l.type === 'symbol' && l.layout && l.layout['text-font']; })[0];
    return sym ? sym.layout['text-font'] : ['Noto Sans Regular'];
  }

  /** Maliit na 2D/3D na button sa gilid ng mapa. */
  function Toggle3D() {}
  Toggle3D.prototype.onAdd = function (map) {
    var self = this;
    this.map = map;
    this.el = document.createElement('div');
    this.el.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    this.btn = document.createElement('button');
    this.btn.type = 'button';
    this.btn.className = 'an-3d';
    this.btn.addEventListener('click', function () {
      var flat = map.getPitch() < 5;
      map.easeTo({ pitch: flat ? PITCH_3D : 0, bearing: flat ? -17 : 0, duration: 600 });
    });
    this.sync = function () {
      var flat = map.getPitch() < 5;
      self.btn.textContent = flat ? '3D' : '2D';
      self.btn.title = flat ? 'Show 3D buildings' : 'Balik sa flat na map';
      self.btn.setAttribute('aria-label', self.btn.title);
    };
    map.on('pitchend', this.sync);
    this.sync();
    this.el.appendChild(this.btn);
    return this.el;
  };
  Toggle3D.prototype.onRemove = function () {
    this.map.off('pitchend', this.sync);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.map = null;
  };

  /* ---------- Map o Satellite ----------
     Satellite = Esri World Imagery (raster, walang key) sa ilalim, tapos labels, boundaries at
     3D buildings pa rin mula sa vector style. Naaalala ang pinili sa localStorage. */
  var SAT_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  var SAT_ATTRIB = 'Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community';
  var BASEMAP_KEY = 'ayusin-natin:basemap';

  function savedBasemap() { try { return localStorage.getItem(BASEMAP_KEY) === 'satellite' ? 'satellite' : 'map'; } catch (e) { return 'map'; } }
  function rememberBasemap(mode) { try { localStorage.setItem(BASEMAP_KEY, mode); } catch (e) { /* ayos lang */ } }

  function setBasemap(map, mode) {
    whenReady(map, function () {
      if (map.__anBasemap === mode) return;
      var layers = map.getStyle().layers || [];
      if (mode === 'satellite') {
        if (!map.getSource('an-satellite')) map.addSource('an-satellite', { type: 'raster', tiles: [SAT_TILES], tileSize: 256, maxzoom: 19, attribution: SAT_ATTRIB });
        var bottom = layers.filter(function (l) { return l.type !== 'background'; })[0];
        if (!map.getLayer('an-satellite')) map.addLayer({ id: 'an-satellite', type: 'raster', source: 'an-satellite', paint: { 'raster-fade-duration': 150 } }, bottom ? bottom.id : undefined);
        map.__anHidden = []; map.__anSymbols = {};
        layers.forEach(function (l) {
          if (l.id.indexOf('an-') === 0 || l.type === 'background' || l.type === 'fill-extrusion') return;
          if (l.type === 'symbol') {
            if (l.layout && l.layout['icon-image']) return; // road shields: iwan ang kulay
            map.__anSymbols[l.id] = { color: map.getPaintProperty(l.id, 'text-color'), halo: map.getPaintProperty(l.id, 'text-halo-color'), width: map.getPaintProperty(l.id, 'text-halo-width') };
            map.setPaintProperty(l.id, 'text-color', '#fff');
            map.setPaintProperty(l.id, 'text-halo-color', 'rgba(0,0,0,.8)');
            map.setPaintProperty(l.id, 'text-halo-width', 1.4);
            return;
          }
          if (/boundary/.test(l.id)) return;
          if ((map.getLayoutProperty(l.id, 'visibility') || 'visible') === 'none') return;
          map.setLayoutProperty(l.id, 'visibility', 'none');
          map.__anHidden.push(l.id);
        });
        if (map.__anBuildings) map.setPaintProperty(map.__anBuildings, 'fill-extrusion-opacity', 0.5);
      } else {
        (map.__anHidden || []).forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'visible'); });
        Object.keys(map.__anSymbols || {}).forEach(function (id) {
          if (!map.getLayer(id)) return;
          var o = map.__anSymbols[id];
          map.setPaintProperty(id, 'text-color', o.color);
          map.setPaintProperty(id, 'text-halo-color', o.halo);
          map.setPaintProperty(id, 'text-halo-width', o.width);
        });
        map.__anHidden = []; map.__anSymbols = {};
        if (map.getLayer('an-satellite')) map.removeLayer('an-satellite');
        if (map.__anBuildings) map.setPaintProperty(map.__anBuildings, 'fill-extrusion-opacity', 0.9);
      }
      map.__anBasemap = mode;
      map.fire('an:basemap', { mode: mode });
    });
  }

  /** Pill na "Map | Satellite" sa ibaba ng mapa. */
  function LayerSwitch() {}
  LayerSwitch.prototype.onAdd = function (map) {
    var self = this;
    this.map = map;
    this.el = document.createElement('div');
    this.el.className = 'maplibregl-ctrl an-layers';
    this.el.setAttribute('role', 'group');
    this.el.setAttribute('aria-label', 'Map view');
    this.btns = {};
    [['map', 'Map'], ['satellite', 'Satellite']].forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = o[1];
      b.title = o[1] + ' view';
      b.addEventListener('click', function () { rememberBasemap(o[0]); setBasemap(map, o[0]); });
      self.btns[o[0]] = b;
      self.el.appendChild(b);
    });
    this.sync = function (e) {
      var mode = (e && e.mode) || map.__anBasemap || 'map';
      Object.keys(self.btns).forEach(function (k) {
        self.btns[k].classList.toggle('is-on', k === mode);
        self.btns[k].setAttribute('aria-pressed', String(k === mode));
      });
    };
    map.on('an:basemap', this.sync);
    this.sync({ mode: savedBasemap() });
    return this.el;
  };
  LayerSwitch.prototype.onRemove = function () {
    this.map.off('an:basemap', this.sync);
    if (this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.map = null;
  };

  /** Bilog na polygon (metro) para sa katumpakan ng GPS. */
  function circlePolygon(lat, lng, radius) {
    var pts = [], n = 64, rad = Math.PI / 180;
    var dLat = radius / 111320, dLng = radius / (111320 * Math.cos(lat * rad));
    for (var i = 0; i <= n; i++) {
      var a = (i / n) * 2 * Math.PI;
      pts.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
    }
    return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [pts] }, properties: {} };
  }

  function domEl(className) {
    var el = document.createElement('span');
    el.className = className;
    return el;
  }

  AN.mapkit = {
    STYLE: MAP_STYLE,
    available: function () { return !!window.maplibregl; },

    /** Gumagawa ng mapa. opts: center [lat, lng], zoom, pitch, controls (true | 'min' | false), interactive.
        Ibinabalik ang maplibregl.Map, o null kung hindi ma-render (walang WebGL). */
    create: function (el, opts) {
      opts = opts || {};
      var center = opts.center || [12.3, 122.6];
      var map;
      try {
        map = new window.maplibregl.Map({
          container: el,
          style: MAP_STYLE,
          center: [center[1], center[0]],
          zoom: opts.zoom || 6,
          pitch: opts.pitch || 0,
          bearing: opts.pitch ? -17 : 0,
          minZoom: 4,
          maxZoom: 19,
          maxBounds: [[105, -2], [140, 28]],
          attributionControl: { compact: true },
          interactive: opts.interactive !== false,
          dragRotate: true,
          touchPitch: true,
          cooperativeGestures: false
        });
      } catch (e) {
        el.innerHTML = AN.mapkit.noMapHTML;
        return null;
      }
      if (opts.controls !== false) {
        if (opts.controls !== 'min') {
          map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }), 'top-left');
          map.addControl(new Toggle3D(), 'top-left');
        }
        map.addControl(new LayerSwitch(), 'bottom-left');
      }
      AN.mapkit.last = map; // para sa debugging sa console
      // 'style.load' (hindi 'load'): handa na ang layers bago pa matapos mag-download ang tiles,
      // kaya walang flash ng vector map bago mag-apply ang Satellite o 3D.
      map.once('style.load', function () {
        map.__anReady = true;
        try { ensureBuildings(map); } catch (e) { /* walang building layer sa style */ }
        if (savedBasemap() === 'satellite') { try { setBasemap(map, 'satellite'); } catch (e) { /* manatili sa map */ } }
        (map.__anQueue || []).forEach(function (fn) { fn(); });
        map.__anQueue = [];
      });
      // Simulan nang naka-collapse ang compact attribution (i) para hindi tumabon sa Map/Satellite na pill.
      map.once('load', function () {
        var attrib = el.querySelector('.maplibregl-ctrl-attrib');
        if (attrib) { attrib.classList.remove('maplibregl-compact-show'); attrib.removeAttribute('open'); }
      });
      // Kung hindi na-load ang style mismo (walang internet), ipakita ang fallback. Ang mga tile error ay may sourceId.
      map.on('error', function (e) {
        if (map.__anReady || (e && e.sourceId)) return;
        var box = document.createElement('div');
        box.innerHTML = AN.mapkit.noMapHTML;
        el.appendChild(box.firstChild);
      });
      return map;
    },
    whenReady: whenReady,
    setBasemap: function (map, mode) { rememberBasemap(mode); setBasemap(map, mode); },
    basemap: savedBasemap,

    /** Lumipat sa lokasyon. lat/lng, zoom, at opsyonal na pitch (3D). */
    flyTo: function (map, lat, lng, zoom, pitch) {
      var o = { center: [lng, lat], zoom: zoom, duration: 700 };
      if (pitch != null) { o.pitch = pitch; o.bearing = pitch ? -17 : 0; }
      map.easeTo(o);
    },

    /** Pinaliliit ang mapa para makita ang lahat ng puntos [[lat, lng], ...]. */
    fitPoints: function (map, pts, maxZoom) {
      if (!pts.length) return;
      var b = new window.maplibregl.LngLatBounds([pts[0][1], pts[0][0]], [pts[0][1], pts[0][0]]);
      pts.forEach(function (p) { b.extend([p[1], p[0]]); });
      map.fitBounds(b, { padding: 48, maxZoom: maxZoom || 14, duration: 600 });
    },

    /** DOM na pin (para sa maplibregl.Marker). */
    pin: function (status, active) {
      var g = (AN.STATUSES[status] || AN.STATUSES.naiulat).group;
      return domEl('pin pin--' + g + (active ? ' is-active' : ''));
    },
    dropPin: function () {
      var wrap = domEl('droppin-wrap');
      wrap.appendChild(domEl('droppin'));
      return wrap;
    },
    meDot: function () { return domEl('medot'); },

    /** Nakakumpol na mga ulat gamit ang sariling clustering ng MapLibre.
        Ibinabalik: { set(reports), clear() }. onClick(report) kapag pinindot ang isang ulat. */
    reports: function (map, onClick) {
      var SRC = 'an-reports';
      var data = { type: 'FeatureCollection', features: [] };
      whenReady(map, function () {
        if (map.getSource(SRC)) return;
        map.addSource(SRC, { type: 'geojson', data: data, cluster: true, clusterMaxZoom: 15, clusterRadius: 46 });
        map.addLayer({
          id: 'an-clusters', type: 'circle', source: SRC, filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#0E2238', 'circle-stroke-color': '#fff', 'circle-stroke-width': 3,
            'circle-radius': ['step', ['get', 'point_count'], 17, 10, 21, 50, 25]
          }
        });
        map.addLayer({
          id: 'an-cluster-count', type: 'symbol', source: SRC, filter: ['has', 'point_count'],
          layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': styleFont(map), 'text-size': 14, 'text-allow-overlap': true },
          paint: { 'text-color': '#fff' }
        });
        map.addLayer({
          id: 'an-points', type: 'circle', source: SRC, filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': ['match', ['get', 'group'], 'aksyon', groupColor('aksyon'), 'ayos', groupColor('ayos'), groupColor('bukas')],
            'circle-stroke-color': '#fff', 'circle-stroke-width': 3, 'circle-radius': 9,
            'circle-pitch-alignment': 'map'
          }
        });
        map.on('click', 'an-clusters', function (e) {
          var f = e.features[0];
          map.getSource(SRC).getClusterExpansionZoom(f.properties.cluster_id).then(function (z) {
            map.easeTo({ center: f.geometry.coordinates, zoom: Math.min(z, 18), duration: 500 });
          }).catch(function () { map.easeTo({ center: f.geometry.coordinates, zoom: map.getZoom() + 2 }); });
        });
        map.on('click', 'an-points', function (e) {
          if (onClick) onClick(e.features[0].properties.id, e.features[0].geometry.coordinates.slice());
        });
        ['an-clusters', 'an-points'].forEach(function (id) {
          map.on('mouseenter', id, function () { map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', id, function () { map.getCanvas().style.cursor = ''; });
        });
      });
      function push() { var s = map.getSource(SRC); if (s) s.setData(data); }
      return {
        set: function (list) {
          data = {
            type: 'FeatureCollection',
            features: list.map(function (r) {
              return { type: 'Feature', geometry: { type: 'Point', coordinates: [r.lng, r.lat] }, properties: { id: r.id, group: (AN.STATUSES[r.status] || AN.STATUSES.naiulat).group } };
            })
          };
          whenReady(map, push);
        },
        clear: function () { data = { type: 'FeatureCollection', features: [] }; whenReady(map, push); }
      };
    },

    /** Popup na may HTML sa isang lokasyon. */
    popup: function (map, lat, lng, html) {
      return new window.maplibregl.Popup({ offset: 14, maxWidth: '280px', className: 'an-popup' }).setLngLat([lng, lat]).setHTML(html).addTo(map);
    },

    /** Bilog ng katumpakan ng GPS. radius = null para tanggalin. */
    accuracyCircle: function (map, lat, lng, radius) {
      var SRC = 'an-accuracy';
      whenReady(map, function () {
        var fc = { type: 'FeatureCollection', features: radius ? [circlePolygon(lat, lng, radius)] : [] };
        var s = map.getSource(SRC);
        if (s) { s.setData(fc); return; }
        map.addSource(SRC, { type: 'geojson', data: fc });
        map.addLayer({ id: 'an-accuracy-fill', type: 'fill', source: SRC, paint: { 'fill-color': '#1D4ED8', 'fill-opacity': 0.12 } });
        map.addLayer({ id: 'an-accuracy-line', type: 'line', source: SRC, paint: { 'line-color': '#1D4ED8', 'line-width': 1 } });
      });
    },

    noMapHTML: '<div class="nomap"><strong>Hindi na-load ang map.</strong><span>Kailangan ng internet (at WebGL) para sa MapLibre at sa map tiles ng OpenFreeMap. Gumagana pa rin ang list ng reports.</span></div>'
  };
})();
