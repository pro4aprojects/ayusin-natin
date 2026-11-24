# Ayusin Natin — demo prototype

Gumaganang front-end prototype: mapa ng mga ulat, pag-uulat na may litrato at lokasyon, pagsubaybay ng status, account screens, at administrator. **Walang database at walang totoong login.** Seed demo data lang ang laman, at sa `localStorage` ng browser naka-save ang mga idinagdag mo.

Plain HTML, CSS at JavaScript ito. Walang build step at walang `npm install`.

## Paano patakbuhin

Sa loob ng folder na ito:

```bash
python -m http.server 8080
# o: npx serve -l 8080
```

Buksan ang <http://localhost:8080>.

- Kailangan ng internet (at WebGL) para sa mapa (MapLibre GL + OpenFreeMap vector tiles, may 3D na gusali mula zoom 14) at sa font. Kapag wala, gumagana pa rin ang listahan at mga form.
- Walang API key ang OpenFreeMap. Nasa `MAP_STYLE` sa `js/ui.js` ang style URL; palitan lang ito kung lilipat sa ibang provider o sariling tiles.
- May **Map / Satellite** na switch sa bawat mapa. Esri World Imagery (walang key) ang satellite; nananatili ang labels at 3D na gusali mula sa vector style. Naaalala sa `localStorage` ang pinili.
- Gumagana lang ang **Gamitin ang current location ko** sa `localhost` o `https`. Para masubukan sa phone, i-deploy sa kahit anong static host na may https (hal. GitHub Pages, Netlify, Cloudflare Pages).
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
js/ui.js                    helpers, pag-compress ng litrato, lokasyon (AN.geo), MapLibre helpers (AN.mapkit)
js/views-public.js          Mapa (home), Mga Ulat, Detalye ng ulat
js/views-report.js          Mag-ulat (form)
js/views-account-admin.js   Account at Administrator
js/app.js                   hash router at header
```

## Lokasyon sa form (hakbang 3)

Tatlong paraan, lahat dumadaan sa `setPoint()` sa `js/views-report.js`:

1. **Gamitin ang current location ko** — `AN.geo.locate()` sa `js/ui.js`. Naka-`enableHighAccuracy`, nakikinig nang hanggang 10 segundo, at kinukuha ang pinakatumpak na basa (humihinto agad kapag ±15 m o mas maliit). Ipinapakita ang katumpakan at bilog nito sa mapa. Kapag lampas ±50 m, pinapaalalahanan ang user na i-drag ang pin.
2. **I-tap ang mapa o i-drag ang pin.**
3. **Pumili ng lungsod** — inilalagay ang pin sa gitna ng lungsod, pero hindi puwedeng isumite hangga't hindi naililipat sa eksaktong lugar.

Sinusuri rin kung nasa loob ng Pilipinas ang pin, at kung may bukas na ulat sa parehong kategorya sa loob ng 50 metro.

Naka-save sa bawat ulat: `lat`, `lng`, `accuracy` (metro, kung GPS), `locationSource` (`gps` | `pin`).

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
- Buong listahan ng lugar (PSGC). 41 lungsod lang ang nasa demo, at tantya lang ang lalawigan at lungsod mula sa pin.
- Pagtatago ng bagong ulat hangga't hindi naaaprubahan. Sa demo, lumalabas agad ito at napupunta sa review queue.
- Server-side na validation at role check. Sa browser lang ang lahat ng check ngayon, kaya huwag itong ituring na seguridad.

## Bago mag-production

- Ilipat ang mga litrato sa file storage. Data URL sa `localStorage` ang gamit ngayon, na mga 5 MB lang ang kasya.
- Libre at walang key ang OpenFreeMap, pero kapag marami nang user, kumuha ng sariling tile provider (hal. MapTiler, Stadia) o mag-host ng sariling vector tiles, at palitan ang `MAP_STYLE` sa `js/ui.js`.
- Lahat ng pangalan, bilang at ulat sa `js/seed.js` ay halimbawa lang.
