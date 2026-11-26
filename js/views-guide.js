/* Ayusin Natin — Guide: step-by-step na gabay sa lahat ng features (mapa, account, Mag-Report, updates, Users at points,
   Contact Us, admin, safety). Live ang top contributors at points table mula sa store/seed para laging tugma sa app. */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});
  AN.views = AN.views || {};
  var ui = AN.ui, esc = ui.esc;

  function g(label, kind) { return '<span class="gbtn' + (kind ? ' gbtn--' + kind : '') + '">' + esc(label) + '</span>'; }
  function dot(id) { return '<span class="dot dot--' + id + '"></span>'; }
  function faq(q, a) { return '<details><summary>' + esc(q) + '</summary><p>' + a + '</p></details>'; }

  var SECTIONS = [
    ['g-ano', 'Ano ang Ayusin Natin'],
    ['g-mapa', 'Mag-navigate sa mapa'],
    ['g-account', 'Sign in at account'],
    ['g-report', 'Mag-Report (step by step)'],
    ['g-update', 'Mag-follow up at mag-update'],
    ['g-reports', 'Reports page'],
    ['g-users', 'Users, profile at points'],
    ['g-contact', 'Contact Us'],
    ['g-admin', 'Para sa moderator at admin'],
    ['g-safety', 'Safety at rules'],
    ['g-faq', 'FAQ']
  ];

  AN.views.guide = function (root) {
    function render() {
      var top = AN.store.ranking().slice(0, 3);
      var s = AN.auth.current();
      root.innerHTML =
        '<div class="page guide">' +
        '<div class="stack-s"><h1 class="display">Guide</h1><p class="lead">Step-by-step na gabay sa paggamit ng Ayusin Natin: mula sa mapa, pag-sign in, Mag-Report, pag-update, hanggang sa points ng top contributors. Taglish at maikli lang bawat step.</p></div>' +
        '<div class="guide__grid">' +
        '<nav class="guide__toc card" aria-label="Mga section ng guide"><b>Sa page na ito</b><ol>' +
        SECTIONS.map(function (x) { return '<li><a href="#' + x[0] + '" data-anchor="' + x[0] + '">' + esc(x[1]) + '</a></li>'; }).join('') + '</ol></nav>' +
        '<div class="guide__body stack-m">' +

        /* 1. Ano */
        '<section class="card stack-s" id="g-ano"><h2><span class="step">1</span>Ano ang Ayusin Natin?</h2>' +
        '<p>Isang community map kung saan <b>ini-report ng mga residente ang problema sa public na lugar</b> (lubak, baha, patay na ilaw, basura, sirang tulay, at iba pa) gamit ang photo at exact na location, tapos <b>sina-subaybayan hanggang ma-fix</b>. Open sa lahat ang map; kailangan lang mag-sign in para mag-report at mag-update.</p>' +
        '<p><b>Status ng bawat report:</b></p>' +
        '<div class="flow">' + ui.statusPill('naiulat') + '<span class="arrow">→</span>' + ui.statusPill('na-verify') + '<span class="arrow">→</span>' + ui.statusPill('inaaksyunan') + '<span class="arrow">→</span>' + ui.statusPill('naayos') + '<span class="arrow">→</span>' + ui.statusPill('kumpirmado') + '</div>' +
        '<p><b>Kulay sa mapa:</b></p><div class="legend">' +
        '<span>' + dot('bukas') + 'Orange = hindi pa na-fix (Reported, Verified)</span>' +
        '<span>' + dot('aksyon') + 'Blue = in progress</span>' +
        '<span>' + dot('ayos') + 'Green = fixed o confirmed fixed</span>' +
        '<span>' + dot('urgent') + 'Pula na kumikislap = <b>Urgent</b> na hindi pa na-fix (nagiging green at humihinto kapag na-fix na)</span></div>' +
        '<p class="note">Demo pa ito: sa browser mo lang naka-save ang mga report at account, walang totoong ahensyang tumatanggap, at pwedeng i-reset ang data anumang oras.</p></section>' +

        /* 2. Mapa */
        '<section class="card stack-s" id="g-mapa"><h2><span class="step">2</span>Paano mag-navigate sa mapa</h2><ol class="steps">' +
        '<li><b>Buksan ang ' + g('Map', 'ghost') + '</b> (home page). Sa simula makikita ang buong Pilipinas na may mga <b>bilog na may numero</b>: cluster iyon, ibig sabihin ilang reports ang nasa lugar na iyon. <b>I-tap ang cluster</b> para mag-zoom doon.</li>' +
        '<li><b>Mag-zoom in</b> (pinch sa phone, scroll sa desktop, o ang ' + g('+', 'ghost') + ' ' + g('−', 'ghost') + ' na button). Mula sa kalapitan ng barangay (zoom 13 pataas) <b>kusang lumalabas ang photo thumbnail</b> ng bawat report nang hindi na kailangang i-click, at lumalaki ito habang lumalapit.</li>' +
        '<li><b>I-tap ang thumbnail o pin</b> para sa popup: photo, title, lugar, status, nag-report. I-tap ang ' + g('View report', 'dark') + ' para sa buong detalye.</li>' +
        '<li><b>Status filter</b> sa itaas ng mapa: ' + dot('bukas') + ' Hindi pa na-fix, ' + dot('aksyon') + ' In progress, ' + dot('ayos') + ' Fixed. I-tap para i-hide o ibalik ang grupo. Ang ' + dot('urgent') + ' <b>Urgent, hindi pa fixed</b> ay nagpapakita lang ng mga urgent na report na hindi pa naaayos.</li>' +
        '<li><b>Search at category.</b> Sa panel (sa phone, nasa ilalim ng mapa), i-type ang lugar, problema, report number o username, at pumili ng category chip (Kalsada, Baha, Ilaw, at iba pa). Lumilipat ang mapa sa mga match.</li>' +
        '<li><b>' + g('Near me', 'ghost') + '</b>: i-allow ang location kapag nagtanong ang browser, at lilipad ang mapa sa kinaroroonan mo (asul na tuldok).</li>' +
        '<li><b>' + g('Map', 'dark') + ' / ' + g('Satellite', 'ghost') + '</b> na pill sa ibaba para magpalit ng view (may maliit na arrow na nakaturo sa hindi pa napipili). Ang ' + g('3D', 'ghost') + ' na button ay nagpapakita ng 3D na gusali; i-drag gamit ang dalawang daliri (o right-click sa desktop) para i-rotate o i-tilt, at i-tap ang compass para ibalik sa north.</li>' +
        '<li><b>Listahan sa panel.</b> Nasa ilalim ng mapa (phone) o sa kaliwa (desktop) ang mga report card na tugma sa filter. ' + g('Show more', 'ghost') + ' nang 12-12 hanggang 450; lahat pa rin ay nasa mapa.</li>' +
        '</ol></section>' +

        /* 3. Account */
        '<section class="card stack-s" id="g-account"><h2><span class="step">3</span>Sign in at account</h2>' +
        '<p><b>Mabilisang demo:</b> sa ' + g('Account', 'ghost') + ' page, i-tap ang ' + g('Demo user', 'dark') + ', ' + g('Demo moderator', 'dark') + ', ' + g('Demo LGU', 'dark') + ' o ' + g('Demo admin', 'dark') + ' para ma-try ang bawat role nang walang password.</p>' +
        '<p><b>Gumawa ng sariling account</b> (Step 2: <i>I-set up ang account</i>):</p><ol class="steps">' +
        '<li><b>Full name</b> at <b>Username</b> (3 hanggang 20 na lowercase letters, numbers, dot o underscore; ito ang makikita ng iba).</li>' +
        '<li><b>Email</b>: i-type, tapos ' + g('Send code', 'ghost') + '. Demo: <b>ipapakita sa screen ang 6-digit code</b> imbes na i-email (sa production, sa email ito darating). I-type ang code at ' + g('Verify', 'dark') + '. Required ang verified na email.</li>' +
        '<li><b>Birthday</b> (auto ang <b>Age</b>; dapat 13 pataas) at <b>Gender</b>.</li>' +
        '<li><b>Complete address</b>: pumili sa dropdown ng Region → Province → City/Municipality → Barangay, tapos i-type ang Street, Blk/Lot at House no. Kung wala sa list ang barangay, i-type na lang.</li>' +
        '<li><b>Password</b>: at least 10 characters, may malaki at maliit na letra, number at symbol. Ulitin sa Confirm, tapos ' + g('Finish setup') + '. Naka-sign in ka na agad.</li>' +
        '</ol>' +
        '<p><b>Sign in</b> gamit ang username o email + password. <b>Forgot password?</b> I-type ang email ng account, ' + g('Send reset code', 'ghost') + ' (demo: nasa screen ang code), tapos bagong password. May <b>Change password</b> din sa Account page.</p>' +
        '<p><b>Profile photo:</b> sa Account page, ' + g('Change profile photo', 'dark') + ' (camera o gallery; nire-resize at nako-compress sa max 30 KB). Kung wala, default na user icon ang lalabas. Makikita ang maliit na profile photo at @username mo sa bawat report card, popup, report details at history.</p>' +
        '<p class="muted small">Public: username at profile photo. Private: full name, email, birthday, gender at address.</p></section>' +

        /* 4. Mag-Report */
        '<section class="card stack-s" id="g-report"><h2><span class="step">4</span>Paano mag-report (Mag-Report)</h2><ol class="steps">' +
        '<li><b>Mag-sign in muna</b>, tapos i-tap ang dilaw na ' + g('Mag-Report') + ' na button sa itaas.</li>' +
        '<li><b>Basahin ang Terms &amp; Conditions</b> na lalabas sa bawat bukas, i-tick ang checkbox na sumasang-ayon ka, tapos ' + g('Proceed sa report') + '. Hindi mabubuksan ang form kung hindi naka-tick.</li>' +
        '<li><b>Step 1 · Photo.</b> I-tap ang ' + g('Open camera', 'dark') + ': diretso sa camera ng phone, <b>walang upload mula sa gallery</b>. Hanggang 3 photos; kusang nako-compress sa max 50 KB bawat isa. Iwasang makunan ang mukha ng tao at plate number.</li>' +
        '<li><b>Step 2 · Category.</b> Pumili ng isa. Kapag <b>Iba pa</b>, i-specify kung ano ang problema.</li>' +
        '<li><b>Step 3 · Location.</b> Tumayo sa mismong lugar ng problema, tapos i-tap ang ' + g('Use current location', 'blue') + ' at i-allow ang location. Makikita ang accuracy (± meters); kung malaki, lumabas sa open na lugar at i-tap ulit. <b>Walang manual na pagpili ng lugar</b>; auto ang city mula sa GPS. Optional ang Barangay at Landmark.</li>' +
        '<li><b>Step 4 · Details.</b> Short title (at least 8 characters), description (optional), at <b>Severity</b>: <i>Minor lang</i>, <i>Dangerous</i>, o <i>Urgent</i>. Ang Urgent ay kumikislap na pula sa mapa habang hindi pa na-fix, kaya gamitin lang kung talagang delikado o kailangan ng agarang aksyon.</li>' +
        '<li>Kung lumabas ang <b>"May similar na report nearby"</b>, i-open ang report na iyon at i-tap ang ' + g('Affected din ako', 'ghost') + ' imbes na gumawa ng bago.</li>' +
        '<li>' + g('Submit report') + '. Lalabas agad ito sa mapa na may report number (hal. AN-000619), at mapupunta sa review ng moderator. Pwede mong i-share ang link.</li>' +
        '</ol></section>' +

        /* 5. Update */
        '<section class="card stack-s" id="g-update"><h2><span class="step">5</span>Mag-follow up at mag-update ng report</h2><ol class="steps">' +
        '<li><b>' + g('Affected din ako', 'ghost') + '</b> sa report page kung apektado ka rin ng parehong problema. Mas mataas ang bilang, mas kita ng LGU.</li>' +
        '<li><b>Update status</b> (kailangang naka-sign in): piliin ang <i>Hindi pa rin na-fix</i>, <i>In progress na</i>, o <i>Fixed na</i>, lagyan ng note, tapos ' + g('Send update') + '. Kapag <b>Fixed na</b>, <b>required ang bagong photo mula sa camera</b> (ito ang magiging AFTER photo).</li>' +
        '<li><b>Confirm fixed.</b> Kapag may nag-report na fixed na, magiging ' + ui.statusPill('kumpirmado') + ' lang ito kapag na-confirm ng nag-report, ng moderator, o ng 3 ibang user na nakakita mismo. I-tap ang ' + g('Confirm fixed', 'dark') + ' kung nakita mo na ayos na.</li>' +
        '<li><b>Report history.</b> Nasa ibaba ng bawat report ang timeline: sino ang nag-report, nag-verify, nag-update at nag-confirm, at kailan.</li>' +
        '<li>' + g('Share', 'ghost') + ' o ' + g('Copy link', 'ghost') + ' para ipasa sa group chat o barangay; <b>Open sa Google Maps</b> para sa directions.</li>' +
        '</ol></section>' +

        /* 6. Reports page */
        '<section class="card stack-s" id="g-reports"><h2><span class="step">6</span>Reports page</h2><ol class="steps">' +
        '<li>I-tap ang ' + g('Reports', 'ghost') + ' sa menu para sa buong listahan, pinakabago muna.</li>' +
        '<li><b>Search</b> (lugar, problema, username o report number) at <b>filters</b>: Category, Status, Severity (kasama ang "Urgent, hindi pa fixed") at Sort (Latest, Oldest, Most affected). Sa <b>lahat</b> ng reports tumatakbo ang search at filter.</li>' +
        '<li><b>Pagination</b>: 24 kada page. Para hindi mabigat ang phone, <b>max 450 ang naka-display kada resulta</b>; kapag lumampas, sasabihin ng count line na i-refine ang search para makita ang iba.</li>' +
        '<li>Sa bawat card: photo, title, category, lugar, kailan, status, ' + ui.urgentPill({ severity: 'agaran', status: 'naiulat' }) + ' kung urgent, bilang ng affected, at ang nag-report (i-tap ang @username para sa profile niya).</li>' +
        '</ol></section>' +

        /* 7. Users, profile, points */
        '<section class="card stack-s" id="g-users"><h2><span class="step">7</span>Users, profile at Top contributors</h2>' +
        '<p>Sa ' + g('Users', 'ghost') + ' page makikita ang <b>ranking ng mga residente</b> ayon sa contribution points, may search (sa lahat ng users), sort at pagination (30 kada page, max 450 na display). I-tap ang kahit sinong user para sa <b>public profile</b> niya: profile photo, rank, stats, at lahat ng reports na in-submit niya.</p>' +
        '<p><b>Top contributors ngayon:</b></p><div class="podium">' +
        top.map(function (x) {
          return '<a class="pod pod--' + x.rank + '" href="#/user/' + encodeURIComponent(x.user.username) + '"><span class="pod__rank">' + x.rank + '</span>' + ui.avatar(x.user.username, 'xl') +
            '<b>@' + esc(x.user.username) + '</b><span class="pod__score">' + x.stats.score + ' pts</span><span class="muted small">' + x.stats.reports + ' reports · ' + x.stats.fixed + ' fixed</span></a>';
        }).join('') + '</div>' +
        '<p><b>Paano nakakakuha ng points:</b></p><table class="gtable"><tbody>' +
        AN.SCORING.map(function (x) { return '<tr><td>' + esc(x.label) + '</td><td><b>+' + x.points + '</b></td></tr>'; }).join('') +
        '</tbody></table>' +
        '<ol class="steps">' +
        '<li><b>Mag-report ng totoo at kumpleto</b> (malinaw na photo, tamang location, tamang category). Bawat report na hindi na-hide ng moderator, +' + AN.SCORING[0].points + '.</li>' +
        '<li><b>I-follow up hanggang ma-fix.</b> Kapag naging Fixed o Confirmed fixed ang report mo, +' + AN.SCORING[1].points + ' pa.</li>' +
        '<li><b>Mag-update ng fix sa report ng iba</b> gamit ang bagong photo (+' + AN.SCORING[2].points + '), <b>i-confirm</b> ang fixed na nakita mo mismo (+' + AN.SCORING[3].points + '), at <b>i-tap ang Affected din ako</b> sa problemang apektado ka rin (+' + AN.SCORING[4].points + ').</li>' +
        '<li>Hindi kasama ang hidden o na-reject na report, at hindi lumalabas sa ranking ang suspended na account. Walang points sa spam o duplicate.</li>' +
        '</ol></section>' +

        /* 8. Contact Us */
        '<section class="card stack-s" id="g-contact"><h2><span class="step">8</span>Contact Us</h2>' +
        '<p>Para sa <b>suggestion, additional feature, bug o question tungkol sa system</b>, hindi para sa problema sa lugar (iyon ay sa Mag-Report).</p><ol class="steps">' +
        '<li>I-tap ang ' + g('Contact Us', 'ghost') + ' sa menu.</li>' +
        '<li>Piliin kung tungkol saan (Suggestion, Additional feature, Bug o error, Question, Iba pa), optional ang name at email, i-type ang message (kung bug: ilagay ang phone at browser), tapos ' + g('Send message') + '.</li>' +
        '<li>May reference number (hal. CU-0001). Demo: naka-save sa browser at nakikita ng admin sa Admin page; kapag may backend na, mapupunta ito sa team at may reply sa email.</li>' +
        '</ol></section>' +

        /* 9. Admin */
        '<section class="card stack-s" id="g-admin"><h2><span class="step">9</span>Para sa moderator at admin</h2>' +
        '<p>Lumalabas ang ' + g('Admin', 'ghost') + ' na tab kapag moderator o admin ang naka-sign in' + (s && (s.role === 'admin' || s.role === 'moderator') ? ' (ikaw ngayon)' : '') + '.</p><ol class="steps">' +
        '<li><b>Pending review.</b> Bagong reports na may <i>System flag</i> (Possible duplicate kung may kaparehong category sa loob ng 50 m, Weak GPS kung malaki ang ± m). ' + g('Approve', 'dark') + ' para maging Verified, ' + g('Reject', 'ghost') + ' para i-hide sa public.</li>' +
        '<li><b>All reports.</b> Searchable table (50 kada page): palitan ang status, i-hide o i-restore, at (admin lang) i-delete nang permanente.</li>' +
        '<li><b>Contact Us messages.</b> Markahan bilang New, Read o Done; admin ang pwedeng mag-delete.</li>' +
        '<li><b>Users at roles.</b> Super admin lang ang pwedeng magpalit ng role (User, Moderator, LGU / Agency, Super Admin) at mag-suspend o mag-restore.</li>' +
        '<li>' + g('Export data (JSON)', 'ghost') + ' para sa pag-seed ng totoong database (walang password na kasama) at ' + g('I-reset ang demo data', 'ghost') + ' para bumalik sa orihinal.</li>' +
        '</ol></section>' +

        /* 10. Safety */
        '<section class="card card--warn stack-s" id="g-safety"><h2><span class="step">10</span>Safety at rules</h2><ul class="bullets">' +
        '<li><b>Hindi ito emergency hotline.</b> Kung may nasugatan, sunog, o buhay ang nakataya, tumawag muna sa <b>911</b> o sa hotline ng LGU.</li>' +
        '<li>Huwag i-risk ang sarili para lang makakuha ng photo (hal. sa gitna ng kalsada o sa baha).</li>' +
        '<li>Lugar at problema ang i-report, hindi tao. Iwasang makunan ang mukha, plate number at personal na detalye ng iba.</li>' +
        '<li>Totoo at nakita mo mismo ang i-report. Pwedeng i-hide o i-delete ng moderator ang mali, duplicate o spam, at ma-suspend ang paulit-ulit lumalabag.</li>' +
        '<li>Sa pag-tick ng Terms &amp; Conditions, pumapayag kang ipakita sa public ang photo, location, username at profile photo mo kasama ng report.</li>' +
        '</ul></section>' +

        /* 11. FAQ */
        '<section class="card stack-s faq" id="g-faq"><h2><span class="step">11</span>FAQ</h2>' +
        faq('Hindi lumalabas ang location ko. Ano ang gagawin?', 'I-allow ang location permission ng site na ito sa browser, i-on ang GPS o Location ng phone, at lumabas sa open na lugar. Gumagana lang ang location sa https o localhost; https ang live site kaya ok ito sa phone.') +
        faq('Bakit file picker ang lumalabas sa laptop imbes na camera?', 'Ang "Open camera" ay gumagamit ng camera capture ng phone browser. Sa desktop browser walang ganoon, kaya file picker ang lumalabas. Sa phone diretso itong nagbubukas ng camera.') +
        faq('Bakit nawala ang mga report o account na ginawa ko?', 'Demo pa ito: sa browser mo lang naka-save ang data (localStorage). Nawawala ito kapag nag-clear ng browser data, nag-reset ang admin ng demo data, o may bagong version ng demo seed. Hindi rin ito lumilipat sa ibang device.') +
        faq('Bakit 450 lang ang naka-display?', 'Para hindi mabigat at mabagal ang page lalo na sa phone. Pero sa lahat ng data tumatakbo ang search, filter at sort: i-refine lang ang search para makita ang hinahanap mo.') +
        faq('Paano nagiging Confirmed fixed ang isang report?', 'Kapag may nag-update na Fixed na (may AFTER photo), kailangan pa itong i-confirm ng nag-report, ng moderator, o ng 3 ibang user bago maging Confirmed fixed.') +
        faq('Pwede ko bang i-edit ang report ko?', 'Wala pang edit sa demo. Pwede kang mag-send ng update na may note (hal. tamang detalye), o i-contact ang admin sa Contact Us. Pwedeng palitan ng moderator ang status o i-hide ang mali.') +
        faq('Bakit pula at kumikislap ang ilang report sa mapa?', 'Urgent ang severity nila at hindi pa na-fix. Kapag na-update na sa Fixed o Confirmed fixed, nagiging green ang pin at thumbnail at humihinto ang kislap.') +
        '</section>' +

        '</div></div></div>';

      // Smooth scroll sa section nang hindi binabago ang route (hash router ang #/… links; plain id ang anchors dito).
      root.querySelector('.guide__toc').addEventListener('click', function (e) {
        var a = e.target.closest('[data-anchor]'); if (!a) return;
        e.preventDefault();
        var el = root.querySelector('#' + a.getAttribute('data-anchor'));
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
      });
    }

    var off = AN.store.on(render);
    render();
    return off;
  };
})();
