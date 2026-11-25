# Ayusin Natin — demo prototype

Gumaganang front-end prototype: mapa ng mga ulat, pag-uulat na may litrato at lokasyon, pagsubaybay ng status, account screens, at administrator. **Walang database at walang totoong login.** Seed demo data lang ang laman, at sa `localStorage` ng browser naka-save ang mga idinagdag mo.

Plain HTML, CSS at JavaScript ito. Walang build step at walang `npm install`.

## Live demo

Naka-deploy sa GitHub Pages: <https://pro4aprojects.github.io/ayusin-natin/>

Bawat push sa `main` ay awtomatikong nade-deploy (Settings > Pages, source: `main` / root). Gumagana ang **current location** dito dahil https.

## Paano patakbuhin (local)

Sa loob ng folder na ito:

```bash
python -m http.server 8080
# o: npx serve -l 8080
```

Buksan ang <http://localhost:8080>.

- Kailangan ng internet (at WebGL) para sa mapa (MapLibre GL + OpenFreeMap vector tiles, may 3D na gusali mula zoom 14) at sa font. Kapag wala, gumagana pa rin ang listahan at mga form.
- Walang API key ang OpenFreeMap. Nasa `MAP_STYLE` sa `js/ui.js` ang style URL; palitan lang ito kung lilipat sa ibang provider o sariling tiles.
- May **Map / Satellite** na switch sa bawat mapa. Esri World Imagery (walang key) ang satellite; nananatili ang labels at 3D na gusali mula sa vector style. Naaalala sa `localStorage` ang pinili.
- Gumagana lang ang **Use current location** sa `localhost` o `https`. Para masubukan sa phone, i-deploy sa kahit anong static host na may https (hal. GitHub Pages, Netlify, Cloudflare Pages).
- Taglish ang UI text: casual na Tagalog, English para sa mga terminong mas madaling maintindihan (Report, Fixed, In progress, Location).

## Mga demo account

Sa **Account** page, pumili ng role: Demo user, Demo moderator, Demo LGU, Demo admin. Lalabas ang **Admin** sa menu kapag moderator o admin.

Sa Admin: **I-reset ang demo data** para bumalik sa orihinal, at **Export data (JSON)** para magamit sa pag-seed ng totoong database.

## Mga file

```
index.html
css/styles.css
js/seed.js                  kategorya, status, mga lungsod, demo users, 48 demo na ulat
js/store.js                 DATA LAYER + AUTH (dito ikakabit ang backend)
js/ui.js                    helpers, pag-compress ng litrato (max 50 KB), lokasyon (AN.geo), MapLibre helpers (AN.mapkit)
img/logo.jpg, logo-hq.png   logo (in-upload na design, Lanczos upscale 4x: 1024px para sa web, 1692px na master); favicon.png at apple-touch-icon.png = square crop ng emblem
js/views-public.js          Mapa (home), Mga Ulat, Detalye ng ulat
js/views-report.js          Mag-ulat (form)
js/views-account-admin.js   Account at Administrator
js/app.js                   hash router at header
```

## Photo at location sa form

**Photo (step 1).** Camera lang: `<input type="file" accept="image/*" capture="environment">`, walang gallery/upload na button. Sa phone, diretso itong nagbubukas ng camera; sa desktop browser (walang `capture` support) lumalabas pa rin ang file picker. Bawat photo ay nire-resize at nico-compress sa browser (`AN.ui.compressImage` sa `js/ui.js`) hanggang **max 50 KB** (JPEG; binababa muna ang quality hanggang 0.5, tapos ang sukat) para magaan ang storage at mabilis mag-load. Pareho ito sa AFTER photo sa **Update status**.

**Category (step 2).** Kapag **Iba pa** ang pinili, may required na field para i-specify ang problema (`categoryOther`), at iyon ang lumalabas bilang category sa cards at details.

**Location (step 3).** Required ang **Use current location** (`AN.geo.locate()` sa `js/ui.js`): naka-`enableHighAccuracy`, nakikinig nang hanggang 10 segundo, at kinukuha ang pinakatumpak na basa (humihinto agad kapag ±15 m o mas maliit). Walang manual na pagpili ng lugar: hindi na-tap o na-drag ang pin, at walang province/city dropdown. Tinatantya ang province at city mula sa pinakamalapit na city sa demo list (`AN.geo.nearestPlace`, hanggang 25 km); barangay at landmark ay optional na text. Hindi pwedeng i-submit kapag walang GPS fix o nasa labas ng Pilipinas. Sinusuri rin kung may bukas na ulat sa parehong kategorya sa loob ng 50 metro.

Naka-save sa bawat ulat: `lat`, `lng`, `accuracy` (metro), `locationSource` (`gps`).

## Map

- **Clusters at thumbnails.** Naka-cluster ang mga report (native na clustering ng MapLibre). Mula zoom 13 pataas, awtomatikong lumalabas ang thumbnail ng photo ng bawat report sa ibabaw ng pin nang hindi na kailangang i-click (`AN.mapkit.reports` sa `js/ui.js`); lumalaki ito habang lumalapit (48 → 66 → 92 px). I-tap ang thumbnail para sa popup.
- **Map / Satellite.** May maliit na animated na arrow na nakaturo sa option na hindi pa napipili.

## Saan ikakabit ang backend

Lahat ng basa at sulat ay dumadaan sa `js/store.js`:

| Ngayon (demo) | Papalitan ng |
| --- | --- |
| `AN.store.list()`, `get()`, `all()` | query sa database |
| `AN.store.create()` | insert + upload ng litrato sa file storage |
| `AN.store.addUpdate()`, `confirmFixed()`, `toggleAffected()` | insert sa history / confirmations / affected |
| `AN.store.moderate()`, `setStatus()`, `remove()`, `setUser()` | admin endpoints na may role check sa server |
| `AN.auth.demoSignIn()` | tanggalin |
| `AN.auth.signInWithGoogle()` | Google Sign-In |
| `AN.auth.signInWithPassword()`, `register()`, `changePassword()`, `requestPasswordReset()` | totoong auth |

Ang mga auth function na hindi pa nakakabit ay nagbabalik ng rejected Promise na may `code: 'NOT_CONNECTED'`. Tinatawag na sila ng mga button at form, kaya kapag pinalitan ang laman nila, gagana na ang UI. Sync pa ang `AN.store` ngayon; magiging async ito kapag may API na, kaya kailangang i-`await` sa mga view.

Nasa `AN.auth.passwordChecks()` ang patakaran sa password (10+ character, malaki at maliit na titik, numero, simbolo). Ulitin ang parehong check sa server. **Walang password na sine-save kahit saan sa demo.**

## Hindi pa kasama (sadya)

- Database, totoong login, email.
- Awtomatikong pag-blur ng mukha at plaka. Paalala lang ang nasa form.
- Buong listahan ng lugar (PSGC). 41 lungsod lang ang nasa demo, at tantya lang ang province at city mula sa GPS (pinakamalapit na city sa loob ng 25 km).
- Pagtatago ng bagong ulat hangga't hindi naaaprubahan. Sa demo, lumalabas agad ito at napupunta sa review queue.
- Server-side na validation at role check. Sa browser lang ang lahat ng check ngayon, kaya huwag itong ituring na seguridad.

## Bago mag-production

- Ilipat ang mga litrato sa file storage. Data URL sa `localStorage` ang gamit ngayon, na mga 5 MB lang ang kasya.
- Libre at walang key ang OpenFreeMap, pero kapag marami nang user, kumuha ng sariling tile provider (hal. MapTiler, Stadia) o mag-host ng sariling vector tiles, at palitan ang `MAP_STYLE` sa `js/ui.js`.
- Lahat ng pangalan, bilang at ulat sa `js/seed.js` ay halimbawa lang.
