/* Ayusin Natin — seed demo data.
   Lahat ng ulat, user at bilang dito ay HALIMBAWA lang.
   Kapag may database na, ito ang papalitan ng totoong query (tingnan ang README). */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});

  AN.CATEGORIES = [
    { id: 'kalsada', label: 'Kalsada at lubak', short: 'Kalsada', tint: '#E9DFCF' },
    { id: 'baha', label: 'Baha at drainage', short: 'Baha', tint: '#CFE0EE' },
    { id: 'ilaw', label: 'Street light', short: 'Ilaw', tint: '#E6E0C4' },
    { id: 'basura', label: 'Basura', short: 'Basura', tint: '#D8E2CF' },
    { id: 'tulay', label: 'Tulay at sidewalk', short: 'Tulay', tint: '#DDD8D0' },
    { id: 'tubig', label: 'Tubig', short: 'Tubig', tint: '#CDE4E6' },
    { id: 'kable', label: 'Kable at poste', short: 'Kable', tint: '#E0D6DF' },
    { id: 'trapiko', label: 'Traffic at signage', short: 'Traffic', tint: '#EBD9CC' },
    { id: 'pasilidad', label: 'Public facility', short: 'Facility', tint: '#D6DCEB' },
    { id: 'kalikasan', label: 'Landslide at natumbang puno', short: 'Landslide', tint: '#D3E0D0' },
    { id: 'proyekto', label: 'Unfinished project', short: 'Project', tint: '#E4DCCB' },
    { id: 'iba', label: 'Iba pa', short: 'Iba pa', tint: '#DCE1E6' }
  ];

  // Ayos ng status mula simula hanggang dulo. (Ang mga key ay nananatili; label lang ang Taglish.)
  AN.STATUSES = {
    'naiulat': { label: 'Reported', group: 'bukas', color: '#B45309' },
    'na-verify': { label: 'Verified', group: 'bukas', color: '#B45309' },
    'inaaksyunan': { label: 'In progress', group: 'aksyon', color: '#1D4ED8' },
    'naayos': { label: 'Fixed', group: 'ayos', color: '#166534' },
    'kumpirmado': { label: 'Confirmed fixed', group: 'ayos', color: '#166534' }
  };

  AN.STATUS_GROUPS = [
    { id: 'bukas', label: 'Hindi pa na-fix', color: '#B45309' },
    { id: 'aksyon', label: 'In progress', color: '#1D4ED8' },
    { id: 'ayos', label: 'Fixed', color: '#166534' }
  ];

  AN.SEVERITIES = [
    { id: 'abala', label: 'Abala lang' },
    { id: 'delikado', label: 'Delikado' },
    { id: 'agaran', label: 'Urgent' }
  ];

  // Totoong larawan para sa demo reports: Wikimedia Commons, lahat kuha sa Pilipinas, CC0 / CC BY / CC BY-SA / public domain.
  // Bawat category: before (problema) at after (na-fix). Ipinapakita ang credit sa detail page.
  // Kapag walang entry para sa isang category, SVG placeholder ang gamit (tingnan ang demoPhoto sa js/ui.js).
  AN.DEMO_PHOTOS = {
    kalsada: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/0604San_Ildefonso-San_Rafael_bypass_road_54.jpg/960px-0604San_Ildefonso-San_Rafael_bypass_road_54.jpg', page: 'https://commons.wikimedia.org/wiki/File:0604San_Ildefonso-San_Rafael_bypass_road_54.jpg', author: 'Judgefloro', license: 'CC0', place: 'San Ildefonso, Bulacan' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/1088Construction_of_Arterial_Road_Bypass_Project%2C_Phase_III_public_transport_25.jpg/960px-1088Construction_of_Arterial_Road_Bypass_Project%2C_Phase_III_public_transport_25.jpg', page: 'https://commons.wikimedia.org/wiki/File:1088Construction_of_Arterial_Road_Bypass_Project,_Phase_III_public_transport_25.jpg', author: 'Judgefloro', license: 'CC0', place: 'Plaridel, Bulacan' }
    },
    baha: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Quiapo%2C_Manila_Floods_Habagat-Carina_2024-2.jpg/960px-Quiapo%2C_Manila_Floods_Habagat-Carina_2024-2.jpg', page: 'https://commons.wikimedia.org/wiki/File:Quiapo,_Manila_Floods_Habagat-Carina_2024-2.jpg', author: 'Michael Peronce', license: 'CC BY-SA 4.0', place: 'Quiapo, Manila' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/01095jfEstero_de_Valencia_Pasig_River_Commission_Maynilad_Sampaloc_Santa_Mesa_Manila_Linear_Parkfvf_01.jpg/960px-01095jfEstero_de_Valencia_Pasig_River_Commission_Maynilad_Sampaloc_Santa_Mesa_Manila_Linear_Parkfvf_01.jpg', page: 'https://commons.wikimedia.org/wiki/File:01095jfEstero_de_Valencia_Pasig_River_Commission_Maynilad_Sampaloc_Santa_Mesa_Manila_Linear_Parkfvf_01.jpg', author: 'Judgefloro', license: 'Public domain', place: 'Santa Mesa, Manila' }
    },
    ilaw: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/C-6_Road_at_Night.JPG/960px-C-6_Road_at_Night.JPG', page: 'https://commons.wikimedia.org/wiki/File:C-6_Road_at_Night.JPG', author: 'Elmer B. Domingo', license: 'CC BY-SA 3.0', place: 'Taguig' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Taft_Avenue%2C_Ermita_night_view_%28Manila%3B_02-04-2021%29_wiki.jpg/960px-Taft_Avenue%2C_Ermita_night_view_%28Manila%3B_02-04-2021%29_wiki.jpg', page: 'https://commons.wikimedia.org/wiki/File:Taft_Avenue,_Ermita_night_view_(Manila;_02-04-2021)_wiki.jpg', author: 'Patrick Roque', license: 'CC BY-SA 4.0', place: 'Ermita, Manila' }
    },
    basura: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Dirty_estero_%28drain%29_in_Manila%2C_Philippines_%283486251054%29.jpg/960px-Dirty_estero_%28drain%29_in_Manila%2C_Philippines_%283486251054%29.jpg', page: 'https://commons.wikimedia.org/wiki/File:Dirty_estero_(drain)_in_Manila,_Philippines_(3486251054).jpg', author: 'SuSanA Secretariat / Philipp Feiereisen', license: 'CC BY 2.0', place: 'Quiapo, Manila' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/01023JfSanta_Mesa_Pureza_Estero_Barangays_Magsaysay_Boulevard_Sampaloc_Manilafvf_02.jpg/960px-01023JfSanta_Mesa_Pureza_Estero_Barangays_Magsaysay_Boulevard_Sampaloc_Manilafvf_02.jpg', page: 'https://commons.wikimedia.org/wiki/File:01023JfSanta_Mesa_Pureza_Estero_Barangays_Magsaysay_Boulevard_Sampaloc_Manilafvf_02.jpg', author: 'Judgefloro', license: 'Public domain', place: 'Santa Mesa, Manila' }
    },
    tulay: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/A_Sidewalk_possibly_for_improvement_in_Osme%C3%B1a_Boulevard_%282024-12-31%29.jpg/960px-A_Sidewalk_possibly_for_improvement_in_Osme%C3%B1a_Boulevard_%282024-12-31%29.jpg', page: 'https://commons.wikimedia.org/wiki/File:A_Sidewalk_possibly_for_improvement_in_Osme%C3%B1a_Boulevard_(2024-12-31).jpg', author: 'Wide Awake!', license: 'CC BY 4.0', place: 'Cebu City' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Sidewalk_in_Osme%C3%B1a_Boulevard_%282024-12-31%29.jpg/960px-Sidewalk_in_Osme%C3%B1a_Boulevard_%282024-12-31%29.jpg', page: 'https://commons.wikimedia.org/wiki/File:Sidewalk_in_Osme%C3%B1a_Boulevard_(2024-12-31).jpg', author: 'Wide Awake!', license: 'CC BY 4.0', place: 'Cebu City' }
    },
    tubig: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/Pointing_at_a_leaking_pipe.jpg/960px-Pointing_at_a_leaking_pipe.jpg', page: 'https://commons.wikimedia.org/wiki/File:Pointing_at_a_leaking_pipe.jpg', author: 'Nokalfirstimeokaynaman', license: 'CC BY-SA 4.0', place: 'San Nicolas, Manila' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/7556Bulacan_Bulk_Water_Supply_Project_water_pipelines_42.jpg/960px-7556Bulacan_Bulk_Water_Supply_Project_water_pipelines_42.jpg', page: 'https://commons.wikimedia.org/wiki/File:7556Bulacan_Bulk_Water_Supply_Project_water_pipelines_42.jpg', author: 'Judgefloro', license: 'CC0', place: 'Guiguinto, Bulacan' }
    },
    kable: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Spaghetti_wires_in_General_Maxilom_Avenue_%282025-03-01%29.jpg/960px-Spaghetti_wires_in_General_Maxilom_Avenue_%282025-03-01%29.jpg', page: 'https://commons.wikimedia.org/wiki/File:Spaghetti_wires_in_General_Maxilom_Avenue_(2025-03-01).jpg', author: 'Wide Awake!', license: 'CC BY 4.0', place: 'Cebu City' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Meralco_employees_in_Aerial_work_platforms_in_Bulacan_02.jpg/960px-Meralco_employees_in_Aerial_work_platforms_in_Bulacan_02.jpg', page: 'https://commons.wikimedia.org/wiki/File:Meralco_employees_in_Aerial_work_platforms_in_Bulacan_02.jpg', author: 'FBenjr123', license: 'CC BY-SA 4.0', place: 'Doña Remedios Trinidad, Bulacan' }
    },
    trapiko: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Traffic_light_in_Magallanes_Street_%282025-03-09%29.jpg/960px-Traffic_light_in_Magallanes_Street_%282025-03-09%29.jpg', page: 'https://commons.wikimedia.org/wiki/File:Traffic_light_in_Magallanes_Street_(2025-03-09).jpg', author: 'Wide Awake!', license: 'CC BY 4.0', place: 'Cebu City' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/9471Pulilan_Baliuag_Diversion_Road_Markings_100.jpg/960px-9471Pulilan_Baliuag_Diversion_Road_Markings_100.jpg', page: 'https://commons.wikimedia.org/wiki/File:9471Pulilan_Baliuag_Diversion_Road_Markings_100.jpg', author: 'Judgefloro', license: 'CC0', place: 'Pulilan, Bulacan' }
    },
    pasilidad: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Ash-Covered_Basketball_Court_in_Taguig_20200113.jpg/960px-Ash-Covered_Basketball_Court_in_Taguig_20200113.jpg', page: 'https://commons.wikimedia.org/wiki/File:Ash-Covered_Basketball_Court_in_Taguig_20200113.jpg', author: 'Raku Hachijo', license: 'CC BY-SA 4.0', place: 'Taguig' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/6062Sucat_Muntinlupa_Park_Covered_Court_Laguna_de_Bay_14.jpg/960px-6062Sucat_Muntinlupa_Park_Covered_Court_Laguna_de_Bay_14.jpg', page: 'https://commons.wikimedia.org/wiki/File:6062Sucat_Muntinlupa_Park_Covered_Court_Laguna_de_Bay_14.jpg', author: 'Judgefloro', license: 'CC0', place: 'Muntinlupa' }
    },
    kalikasan: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Earthslide_partially_blocking_Puray-Mascap_Road%2C_Rizal_Province%2C_Philippines.jpg/960px-Earthslide_partially_blocking_Puray-Mascap_Road%2C_Rizal_Province%2C_Philippines.jpg', page: 'https://commons.wikimedia.org/wiki/File:Earthslide_partially_blocking_Puray-Mascap_Road,_Rizal_Province,_Philippines.jpg', author: 'Paul Christian B. Yang-ed', license: 'CC BY-SA 4.0', place: 'Rodriguez, Rizal' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Reinforced_slope_of_Quezon_National_Forest_Park.jpg/960px-Reinforced_slope_of_Quezon_National_Forest_Park.jpg', page: 'https://commons.wikimedia.org/wiki/File:Reinforced_slope_of_Quezon_National_Forest_Park.jpg', author: 'McNeil Gaila', license: 'CC BY-SA 4.0', place: 'Atimonan, Quezon' }
    },
    proyekto: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Borongan_Unfinished_Diversion_Road.jpg/960px-Borongan_Unfinished_Diversion_Road.jpg', page: 'https://commons.wikimedia.org/wiki/File:Borongan_Unfinished_Diversion_Road.jpg', author: 'TheNuggeteer', license: 'CC BY-SA 4.0', place: 'Borongan, Eastern Samar' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/9599Plaridel_Bypass_Arterial_Road_Bypass_Project_San_Rafael_Bulacan_13.jpg/960px-9599Plaridel_Bypass_Arterial_Road_Bypass_Project_San_Rafael_Bulacan_13.jpg', page: 'https://commons.wikimedia.org/wiki/File:9599Plaridel_Bypass_Arterial_Road_Bypass_Project_San_Rafael_Bulacan_13.jpg', author: 'Judgefloro', license: 'CC0', place: 'San Rafael, Bulacan' }
    },
    iba: {
      before: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Philippines_-_Siay%2C_Zamboanga_Sibugay_-_Siay-Payao_Road_in_Barangay_Balucanan_%282022-06-12%29.jpg/960px-Philippines_-_Siay%2C_Zamboanga_Sibugay_-_Siay-Payao_Road_in_Barangay_Balucanan_%282022-06-12%29.jpg', page: 'https://commons.wikimedia.org/wiki/File:Philippines_-_Siay,_Zamboanga_Sibugay_-_Siay-Payao_Road_in_Barangay_Balucanan_(2022-06-12).jpg', author: 'Jayvee Enaguas', license: 'CC BY 4.0', place: 'Siay, Zamboanga Sibugay' },
      after: { src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Line_3_Shaw_Boulevard_Station_sidewalk_fronting_Shangri-La_Plaza.jpg/960px-Line_3_Shaw_Boulevard_Station_sidewalk_fronting_Shangri-La_Plaza.jpg', page: 'https://commons.wikimedia.org/wiki/File:Line_3_Shaw_Boulevard_Station_sidewalk_fronting_Shangri-La_Plaza.jpg', author: 'LastCelebration', license: 'CC0', place: 'Mandaluyong' }
    }
  };

  // Maliit na listahan ng mga lungsod para sa demo. Papalitan ito ng buong PSGC
  // (rehiyon > lalawigan > lungsod/bayan > barangay) kapag may database na.
  AN.PLACES = [
    ['Quezon City', 'Metro Manila', 'NCR', 14.6760, 121.0437],
    ['Manila', 'Metro Manila', 'NCR', 14.5995, 120.9842],
    ['Marikina', 'Metro Manila', 'NCR', 14.6507, 121.1029],
    ['Pasig', 'Metro Manila', 'NCR', 14.5764, 121.0851],
    ['Caloocan', 'Metro Manila', 'NCR', 14.6500, 120.9667],
    ['Makati', 'Metro Manila', 'NCR', 14.5547, 121.0244],
    ['Taguig', 'Metro Manila', 'NCR', 14.5176, 121.0509],
    ['Antipolo', 'Rizal', 'CALABARZON', 14.6255, 121.1245],
    ['Batangas City', 'Batangas', 'CALABARZON', 13.7565, 121.0583],
    ['Lucena', 'Quezon', 'CALABARZON', 13.9373, 121.6170],
    ['Baguio', 'Benguet', 'CAR', 16.4023, 120.5960],
    ['Dagupan', 'Pangasinan', 'Ilocos Region', 16.0433, 120.3333],
    ['Laoag', 'Ilocos Norte', 'Ilocos Region', 18.1978, 120.5936],
    ['Tuguegarao', 'Cagayan', 'Cagayan Valley', 17.6132, 121.7270],
    ['San Fernando', 'Pampanga', 'Central Luzon', 15.0286, 120.6898],
    ['Malolos', 'Bulacan', 'Central Luzon', 14.8433, 120.8114],
    ['Naga', 'Camarines Sur', 'Bicol Region', 13.6218, 123.1948],
    ['Legazpi', 'Albay', 'Bicol Region', 13.1391, 123.7438],
    ['Calapan', 'Oriental Mindoro', 'MIMAROPA', 13.4115, 121.1803],
    ['Puerto Princesa', 'Palawan', 'MIMAROPA', 9.7392, 118.7353],
    ['Iloilo City', 'Iloilo', 'Western Visayas', 10.7202, 122.5621],
    ['Roxas City', 'Capiz', 'Western Visayas', 11.5853, 122.7511],
    ['Bacolod', 'Negros Occidental', 'Negros Island Region', 10.6765, 122.9509],
    ['Dumaguete', 'Negros Oriental', 'Negros Island Region', 9.3068, 123.3054],
    ['Cebu City', 'Cebu', 'Central Visayas', 10.3157, 123.8854],
    ['Mandaue', 'Cebu', 'Central Visayas', 10.3236, 123.9223],
    ['Lapu-Lapu', 'Cebu', 'Central Visayas', 10.3103, 123.9494],
    ['Tagbilaran', 'Bohol', 'Central Visayas', 9.6412, 123.8556],
    ['Tacloban', 'Leyte', 'Eastern Visayas', 11.2433, 125.0040],
    ['Ormoc', 'Leyte', 'Eastern Visayas', 11.0064, 124.6075],
    ['Catbalogan', 'Samar', 'Eastern Visayas', 11.7753, 124.8861],
    ['Zamboanga City', 'Zamboanga del Sur', 'Zamboanga Peninsula', 6.9214, 122.0790],
    ['Pagadian', 'Zamboanga del Sur', 'Zamboanga Peninsula', 7.8257, 123.4370],
    ['Cagayan de Oro', 'Misamis Oriental', 'Northern Mindanao', 8.4542, 124.6319],
    ['Iligan', 'Lanao del Norte', 'Northern Mindanao', 8.2280, 124.2452],
    ['Davao City', 'Davao del Sur', 'Davao Region', 7.1907, 125.4553],
    ['General Santos', 'South Cotabato', 'SOCCSKSARGEN', 6.1164, 125.1716],
    ['Koronadal', 'South Cotabato', 'SOCCSKSARGEN', 6.5031, 124.8469],
    ['Butuan', 'Agusan del Norte', 'Caraga', 8.9475, 125.5406],
    ['Surigao City', 'Surigao del Norte', 'Caraga', 9.7571, 125.5138],
    ['Cotabato City', 'Maguindanao del Norte', 'BARMM', 7.2236, 124.2464]
  ].map(function (p) {
    return { city: p[0], province: p[1], region: p[2], lat: p[3], lng: p[4] };
  });

  AN.DEMO_USERS = [
    { username: 'juan_dc', role: 'user', note: 'Demo user' },
    { username: 'maria.santos', role: 'moderator', note: 'Demo moderator' },
    { username: 'admin_ana', role: 'admin', note: 'Demo super admin' },
    { username: 'lgu_engineering', role: 'lgu', note: 'Demo LGU account' },
    { username: 'kuyarod', role: 'user', note: 'Demo user' },
    { username: 'ilongga_bea', role: 'user', note: 'Demo user' },
    { username: 'cdo_mark', role: 'user', note: 'Demo user' },
    { username: 'davao_liza', role: 'user', note: 'Demo user' },
    { username: 'bisdak_ben', role: 'user', note: 'Demo user' }
  ];

  AN.ROLES = { user: 'User', moderator: 'Moderator', lgu: 'LGU / Agency', admin: 'Super Admin' };

  // [lungsod, kategorya, status, ilang araw na, pamagat, paglalarawan, apektado, lala, palatandaan]
  var ROWS = [
    ['Quezon City', 'kalsada', 'kumpirmado', 12, 'Malalim na lubak sa tapat ng palengke', 'Malalim na lubak, dalawang motor na ang sumemplang ngayong linggo.', 18, 'delikado', 'Tapat ng palengke'],
    ['Marikina', 'baha', 'inaaksyunan', 6, 'Baha tuwing ulan dahil sa baradong kanal', 'Kahit mahinang ulan, umaabot sa tuhod ang tubig. Barado ng basura ang kanal.', 47, 'delikado', 'Kanto malapit sa covered court'],
    ['Cebu City', 'ilaw', 'naayos', 9, 'Patay na ilaw sa buong kalye', 'Limang poste ang walang ilaw. Madilim at delikado sa mga naglalakad pauwi.', 22, 'delikado', 'Kalye sa likod ng simbahan'],
    ['Davao City', 'kalsada', 'naiulat', 4, 'Bukas na manhole sa pedestrian lane', 'Walang takip ang manhole sa mismong tawiran. Kahoy lang ang nakapatong.', 31, 'agaran', 'Tawiran sa tapat ng terminal'],
    ['Manila', 'basura', 'na-verify', 2, 'Tambak ng basura sa kanto', 'Tatlong araw nang hindi nahahakot. Umaabot na sa kalsada ang tambak.', 14, 'abala', 'Kanto ng eskinita'],
    ['Pasig', 'trapiko', 'naiulat', 1, 'Sirang traffic light sa interseksyon', 'Kumukurap na dilaw lang ang ilaw. Nagkakagulo ang mga sasakyan tuwing rush hour.', 26, 'delikado', 'Interseksyon malapit sa tulay'],
    ['Caloocan', 'kable', 'na-verify', 3, 'Nakalaylay na kable sa eskinita', 'Abot-kamay na ang kable. Dinadaanan ito ng mga bata papuntang eskwela.', 19, 'agaran', 'Eskinita sa tabi ng sari-sari store'],
    ['Makati', 'tulay', 'inaaksyunan', 8, 'Sirang hagdan ng footbridge', 'Kalawangin at may butas ang ilang baitang ng footbridge.', 11, 'delikado', 'Footbridge sa tapat ng sakayan'],
    ['Taguig', 'tubig', 'naiulat', 2, 'Tagas sa pangunahing tubo', 'Dalawang araw nang umaagos ang tubig sa kalsada.', 9, 'abala', 'Tapat ng barangay hall'],
    ['Antipolo', 'kalikasan', 'inaaksyunan', 5, 'Gumuhong lupa sa gilid ng kalsada', 'Natabunan ang kalahati ng lane matapos ang malakas na ulan.', 16, 'delikado', 'Paakyat na bahagi ng kalsada'],
    ['Baguio', 'trapiko', 'naiulat', 1, 'Natumbang road sign sa kurbada', 'Wala nang babala sa matarik na kurbada. Madulas pa kapag umuulan.', 7, 'delikado', 'Matarik na kurbada'],
    ['Baguio', 'kalikasan', 'kumpirmado', 20, 'Natumbang puno na humarang sa daan', 'Isang lane lang ang nadadaanan dahil sa natumbang pine tree.', 13, 'delikado', 'Malapit sa parke'],
    ['Dagupan', 'baha', 'naiulat', 3, 'Hindi humuhupang baha sa kalye', 'Isang linggo nang may tubig kahit walang ulan.', 28, 'abala', 'Kalye papuntang palengke'],
    ['Tuguegarao', 'ilaw', 'kumpirmado', 25, 'Walang ilaw sa tapat ng paaralan', 'Madilim ang tawiran ng mga estudyanteng panggabi.', 15, 'delikado', 'Tapat ng paaralan'],
    ['Laoag', 'pasilidad', 'na-verify', 6, 'Sirang bubong ng covered court', 'May malaking butas ang bubong. Hindi magamit kapag umuulan.', 8, 'abala', 'Covered court ng barangay'],
    ['San Fernando', 'baha', 'inaaksyunan', 10, 'Baradong drainage sa palengke', 'Umaapaw ang maruming tubig sa mga pwesto tuwing umuulan.', 34, 'delikado', 'Gilid ng palengke'],
    ['Malolos', 'kalsada', 'naiulat', 5, 'Lubak-lubak na kalsada papuntang paaralan', 'Halos buong kalye ang may lubak. Hirap ang mga tricycle.', 21, 'abala', 'Daan papuntang elementarya'],
    ['Batangas City', 'tulay', 'naiulat', 7, 'Sirang railing ng tulay', 'Nawawala ang bahagi ng railing sa gilid ng tulay.', 12, 'agaran', 'Maliit na tulay sa ilog'],
    ['Lucena', 'basura', 'naayos', 11, 'Ilegal na tambakan sa bakanteng lote', 'Ginagawang tambakan ang bakanteng lote. Mabaho at nilalangaw.', 17, 'abala', 'Bakanteng lote sa kanto'],
    ['Naga', 'kalsada', 'inaaksyunan', 9, 'Hukay sa kalsada na walang harang', 'May malalim na hukay na walang babala o harang sa gabi.', 23, 'agaran', 'Tapat ng botika'],
    ['Legazpi', 'kable', 'naiulat', 2, 'Nakahilig na poste ng kuryente', 'Kapansin-pansin ang hilig ng poste matapos ang bagyo.', 10, 'delikado', 'Kanto malapit sa plaza'],
    ['Puerto Princesa', 'pasilidad', 'naiulat', 4, 'Sirang palikuran sa pampublikong parke', 'Walang tubig at sira ang mga pinto ng palikuran.', 6, 'abala', 'Parke sa baybayin'],
    ['Calapan', 'proyekto', 'na-verify', 15, 'Natigil na paggawa ng kalsada', 'Ilang linggo nang nakatiwangwang ang hinukay na bahagi ng kalsada.', 29, 'abala', 'Daan papuntang pier'],
    ['Iloilo City', 'tulay', 'naiulat', 1, 'Gumuhong bahagi ng bangketa', 'Bumigay ang semento ng bangketa sa tabi ng kanal.', 9, 'delikado', 'Bangketa sa tabi ng kanal'],
    ['Iloilo City', 'ilaw', 'naayos', 14, 'Kumukurap na mga ilaw sa esplanade', 'Halos kalahati ng mga ilaw ang kumukurap o patay.', 12, 'abala', 'Esplanade'],
    ['Bacolod', 'kalsada', 'naiulat', 6, 'Malalaking lubak sa pangunahing kalsada', 'Sunod-sunod na lubak. Umiiwas ang mga sasakyan sa kabilang lane.', 33, 'delikado', 'Malapit sa gasolinahan'],
    ['Roxas City', 'tubig', 'inaaksyunan', 4, 'Mahinang tubig sa buong barangay', 'Halos walang lumalabas sa gripo mula umaga hanggang hapon.', 41, 'abala', 'Buong barangay'],
    ['Mandaue', 'baha', 'naiulat', 2, 'Umaapaw na kanal tuwing high tide', 'Pumapasok ang tubig sa mga bahay kapag sabay ang ulan at high tide.', 25, 'delikado', 'Kanal sa tabi ng kalsada'],
    ['Lapu-Lapu', 'trapiko', 'kumpirmado', 30, 'Burado nang pedestrian lane sa tapat ng paaralan', 'Hindi na makita ang guhit ng tawiran.', 14, 'delikado', 'Tapat ng paaralan'],
    ['Tagbilaran', 'basura', 'naiulat', 1, 'Hindi nahakot na basura sa plaza', 'Puno na ang mga basurahan at nagkalat sa paligid.', 5, 'abala', 'Plaza'],
    ['Dumaguete', 'ilaw', 'inaaksyunan', 5, 'Patay na ilaw sa boulevard', 'Tatlong magkakasunod na poste ang walang ilaw.', 11, 'abala', 'Boulevard'],
    ['Tacloban', 'pasilidad', 'inaaksyunan', 12, 'Sirang waiting shed', 'Butas ang bubong at sira ang upuan ng waiting shed.', 9, 'abala', 'Waiting shed sa sakayan'],
    ['Ormoc', 'kalsada', 'naayos', 8, 'Bitak-bitak na kalsada sa kurbada', 'May malalaking bitak sa aspalto. Delikado sa motor.', 16, 'delikado', 'Kurbada bago ang tulay'],
    ['Catbalogan', 'kalikasan', 'naiulat', 3, 'Bitak sa lupa sa tabi ng kalsada', 'May lumalaking bitak sa gilid ng burol sa itaas ng kalsada.', 8, 'agaran', 'Gilid ng burol'],
    ['Cagayan de Oro', 'basura', 'na-verify', 2, 'Tambak ng basura sa tabing-ilog', 'Itinatapon ang basura sa pampang. Inaanod kapag umuulan.', 13, 'abala', 'Pampang ng ilog'],
    ['Iligan', 'tulay', 'naiulat', 9, 'Butas sa sahig ng hanging bridge', 'May mga tablang nawawala sa sahig ng tulay.', 20, 'agaran', 'Hanging bridge'],
    ['General Santos', 'kalsada', 'inaaksyunan', 7, 'Lubak sa harap ng fish port', 'Malalim na lubak na napupuno ng tubig kapag umuulan.', 18, 'abala', 'Daan papuntang fish port'],
    ['Zamboanga City', 'tubig', 'kumpirmado', 18, 'Tagas ng tubo sa bangketa', 'Nasasayang ang tubig at madulas ang bangketa.', 7, 'abala', 'Bangketa sa tapat ng tindahan'],
    ['Butuan', 'baha', 'naiulat', 4, 'Baha sa underpass', 'Hindi madaanan ang underpass kapag malakas ang ulan.', 27, 'delikado', 'Underpass'],
    ['Cotabato City', 'ilaw', 'naiulat', 6, 'Madilim na tulay sa gabi', 'Walang gumaganang ilaw sa buong haba ng tulay.', 19, 'delikado', 'Tulay'],
    ['Surigao City', 'proyekto', 'naiulat', 10, 'Hindi natapos na drainage', 'Bukas pa rin ang hinukay na kanal. Walang harang.', 22, 'delikado', 'Tabi ng kalsada'],
    ['Koronadal', 'kable', 'naayos', 13, 'Mababang kable na sumasabit sa truck', 'Ilang beses nang nasabit ng dumaraang truck ang kable.', 10, 'delikado', 'Malapit sa rotonda'],
    ['Pagadian', 'kalsada', 'naiulat', 3, 'Madulas at lubak na matarik na kalsada', 'Lubak ang matarik na bahagi. Hirap umakyat ang mga tricycle.', 12, 'delikado', 'Matarik na bahagi'],
    ['Quezon City', 'baha', 'naiulat', 1, 'Baha sa ilalim ng flyover', 'Lagpas-gulong ang tubig pagkatapos ng isang oras na ulan.', 38, 'delikado', 'Ilalim ng flyover'],
    ['Manila', 'tulay', 'naiulat', 5, 'Sirang tiles sa underpass', 'Nakaangat ang mga tiles. Madaling matisod.', 9, 'abala', 'Underpass'],
    ['Cebu City', 'kalsada', 'inaaksyunan', 3, 'Lubak sa paanan ng flyover', 'Biglang lubak pagbaba ng flyover. Hindi kita sa gabi.', 24, 'delikado', 'Paanan ng flyover'],
    ['Davao City', 'basura', 'kumpirmado', 16, 'Nakakalat na basura sa baybayin', 'Maraming plastik at basura sa pampublikong dalampasigan.', 21, 'abala', 'Pampublikong dalampasigan'],
    ['Pasig', 'iba', 'naiulat', 2, 'Inabandonang sasakyan sa bangketa', 'Ilang buwan nang nakaharang. Napipilitang maglakad sa kalsada ang mga tao.', 6, 'abala', 'Bangketa sa tabi ng paaralan']
  ];

  var DAY = 86400000;

  AN.buildSeed = function (now) {
    var plain = AN.DEMO_USERS.filter(function (u) { return u.role === 'user'; });
    var reports = ROWS.map(function (row, i) {
      var place = AN.PLACES.filter(function (p) { return p.city === row[0]; })[0];
      var created = now - row[3] * DAY - ((i * 7) % 11) * 3600000;
      var age = now - created;
      var reporter = plain[i % plain.length].username;
      var other = plain[(i + 2) % plain.length].username;
      var status = row[2];
      var order = ['naiulat', 'na-verify', 'inaaksyunan', 'naayos', 'kumpirmado'];
      var reached = order.indexOf(status);
      var at = function (f) { return new Date(created + age * f).toISOString(); };
      var history = [{ type: 'naiulat', by: reporter, role: 'user', at: at(0), note: row[5] }];
      if (reached >= 1) history.push({ type: 'na-verify', by: 'maria.santos', role: 'moderator', at: at(0.06), note: 'Malinaw ang photo at tugma ang location.' });
      if (reached >= 2) history.push({ type: 'inaaksyunan', by: 'lgu_engineering', role: 'lgu', at: at(0.4), note: 'Naka-schedule na ang repair.' });
      if (reached >= 3) history.push({ type: 'naayos', by: other, role: 'user', at: at(0.75), note: 'Fixed na. Nag-upload ng bagong photo bilang proof.' });
      if (reached >= 4) history.push({ type: 'kumpirmado', by: reporter, role: 'user', at: at(0.9), note: 'Na-confirm ng nag-report at ng ibang residente.' });
      var photos = [{ kind: 'before', src: 'demo:' + row[1] + ':before', by: reporter, at: at(0) }];
      if (reached >= 3) photos.push({ kind: 'after', src: 'demo:' + row[1] + ':after', by: other, at: at(0.75) });
      return {
        id: 'AN-' + String(101 + i).padStart(6, '0'),
        title: row[4],
        description: row[5],
        category: row[1],
        severity: row[7],
        status: status,
        hidden: false,
        needsReview: status === 'naiulat' && row[3] <= 2,
        lat: +(place.lat + (((i * 37) % 9) - 4) * 0.0011).toFixed(6),
        lng: +(place.lng + (((i * 53) % 9) - 4) * 0.0011).toFixed(6),
        accuracy: null,
        locationSource: 'seed',
        region: place.region,
        province: place.province,
        city: place.city,
        barangay: '',
        landmark: row[8],
        photos: photos,
        reporter: reporter,
        createdAt: at(0),
        updatedAt: history[history.length - 1].at,
        affected: row[6],
        affectedBy: [],
        confirmations: reached >= 4 ? 4 : reached === 3 ? 1 : 0,
        confirmedBy: [],
        history: history,
        demo: true
      };
    });
    return { reports: reports, users: AN.DEMO_USERS.map(function (u) { return { username: u.username, role: u.role, note: u.note, suspended: false }; }) };
  };
})();
