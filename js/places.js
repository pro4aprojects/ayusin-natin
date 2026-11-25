/* Ayusin Natin — PH address list para sa dropdown ng Complete address (Region > Province > City/Municipality > Barangay).
   DEMO na listahan: lahat ng region at province, mga pangunahing city/municipality kada province, at barangay para sa
   mga demo city. Ang buong PSGC (lahat ng bayan at 42,000+ barangay) ay ilo-load mula sa database kapag may backend na.
   Kapag walang barangay sa listahan, may text field na pwedeng i-type. */
(function () {
  'use strict';
  var AN = (window.AN = window.AN || {});

  // [region id, region name, [[province, [city/municipality, ...]], ...]]
  var R = [
    ['NCR', 'National Capital Region (NCR)', [
      ['Metro Manila', ['Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela']]
    ]],
    ['CAR', 'Cordillera Administrative Region (CAR)', [
      ['Abra', ['Bangued', 'Bucay', 'Dolores', 'Lagangilang', 'Pidigan', 'Tayum']],
      ['Apayao', ['Kabugao', 'Conner', 'Flora', 'Luna', 'Pudtol', 'Santa Marcela']],
      ['Benguet', ['Baguio', 'La Trinidad', 'Itogon', 'Tuba', 'Tublay', 'Sablan', 'Bokod', 'Buguias', 'Mankayan']],
      ['Ifugao', ['Lagawe', 'Banaue', 'Kiangan', 'Lamut', 'Alfonso Lista', 'Hungduan']],
      ['Kalinga', ['Tabuk', 'Rizal', 'Pinukpuk', 'Lubuagan', 'Tinglayan', 'Pasil']],
      ['Mountain Province', ['Bontoc', 'Sagada', 'Bauko', 'Besao', 'Sabangan', 'Tadian']]
    ]],
    ['R1', 'Region I (Ilocos Region)', [
      ['Ilocos Norte', ['Laoag', 'Batac', 'San Nicolas', 'Paoay', 'Pagudpud', 'Bacarra', 'Sarrat', 'Dingras']],
      ['Ilocos Sur', ['Vigan', 'Candon', 'Bantay', 'Narvacan', 'Santa', 'Tagudin', 'Cabugao']],
      ['La Union', ['San Fernando', 'Agoo', 'Bauang', 'Naguilian', 'Bacnotan', 'Aringay', 'Rosario']],
      ['Pangasinan', ['Lingayen', 'Dagupan', 'Alaminos', 'San Carlos', 'Urdaneta', 'Bayambang', 'Binmaley', 'Calasiao', 'Mangaldan', 'Malasiqui', 'Rosales', 'Tayug', 'Bolinao']]
    ]],
    ['R2', 'Region II (Cagayan Valley)', [
      ['Batanes', ['Basco', 'Itbayat', 'Ivana', 'Mahatao', 'Sabtang', 'Uyugan']],
      ['Cagayan', ['Tuguegarao', 'Aparri', 'Solana', 'Peñablanca', 'Enrile', 'Gattaran', 'Lal-lo', 'Baggao']],
      ['Isabela', ['Ilagan', 'Cauayan', 'Santiago', 'Roxas', 'Echague', 'Alicia', 'San Mateo', 'Tumauini', 'Cabagan']],
      ['Nueva Vizcaya', ['Bayombong', 'Solano', 'Bambang', 'Bagabag', 'Dupax del Norte', 'Kasibu']],
      ['Quirino', ['Cabarroguis', 'Diffun', 'Maddela', 'Aglipay', 'Saguday', 'Nagtipunan']]
    ]],
    ['R3', 'Region III (Central Luzon)', [
      ['Aurora', ['Baler', 'Maria Aurora', 'San Luis', 'Dipaculao', 'Casiguran', 'Dingalan']],
      ['Bataan', ['Balanga', 'Mariveles', 'Dinalupihan', 'Orani', 'Hermosa', 'Limay', 'Orion', 'Abucay']],
      ['Bulacan', ['Malolos', 'Meycauayan', 'San Jose del Monte', 'Baliuag', 'Marilao', 'Bocaue', 'Santa Maria', 'Plaridel', 'Pulilan', 'Hagonoy', 'Calumpit', 'Guiguinto', 'Balagtas', 'Bulakan', 'Obando', 'Norzagaray', 'San Miguel', 'San Rafael', 'San Ildefonso']],
      ['Nueva Ecija', ['Palayan', 'Cabanatuan', 'Gapan', 'San Jose', 'Science City of Muñoz', 'Talavera', 'Guimba', 'San Leonardo', 'Santa Rosa', 'Jaen']],
      ['Pampanga', ['San Fernando', 'Angeles', 'Mabalacat', 'Apalit', 'Arayat', 'Bacolor', 'Candaba', 'Floridablanca', 'Guagua', 'Lubao', 'Mexico', 'Porac', 'Santa Rita', 'Santo Tomas']],
      ['Tarlac', ['Tarlac City', 'Capas', 'Concepcion', 'Paniqui', 'Gerona', 'Camiling', 'Bamban', 'Moncada', 'Victoria']],
      ['Zambales', ['Iba', 'Olongapo', 'Subic', 'Castillejos', 'San Antonio', 'San Marcelino', 'Botolan', 'Masinloc']]
    ]],
    ['R4A', 'Region IV-A (CALABARZON)', [
      ['Batangas', ['Batangas City', 'Lipa', 'Tanauan', 'Santo Tomas', 'Calaca', 'Bauan', 'Nasugbu', 'Lemery', 'Taal', 'Rosario', 'San Juan', 'Balayan', 'Tuy', 'Mabini']],
      ['Cavite', ['Trece Martires', 'Imus', 'Bacoor', 'Dasmariñas', 'General Trias', 'Cavite City', 'Tagaytay', 'Carmona', 'Silang', 'Kawit', 'Noveleta', 'Rosario', 'Tanza', 'Naic', 'General Mariano Alvarez']],
      ['Laguna', ['Santa Cruz', 'Calamba', 'San Pablo', 'Biñan', 'Santa Rosa', 'Cabuyao', 'San Pedro', 'Los Baños', 'Bay', 'Pagsanjan', 'Pila', 'Siniloan', 'Nagcarlan']],
      ['Quezon', ['Lucena', 'Tayabas', 'Candelaria', 'Sariaya', 'Pagbilao', 'Atimonan', 'Gumaca', 'Infanta', 'Mauban', 'Tiaong', 'Unisan']],
      ['Rizal', ['Antipolo', 'Cainta', 'Taytay', 'Rodriguez (Montalban)', 'San Mateo', 'Binangonan', 'Angono', 'Tanay', 'Teresa', 'Morong', 'Cardona', 'Baras', 'Pililla', 'Jalajala']]
    ]],
    ['R4B', 'MIMAROPA Region', [
      ['Marinduque', ['Boac', 'Mogpog', 'Santa Cruz', 'Torrijos', 'Buenavista', 'Gasan']],
      ['Occidental Mindoro', ['Mamburao', 'San Jose', 'Sablayan', 'Rizal', 'Magsaysay', 'Abra de Ilog']],
      ['Oriental Mindoro', ['Calapan', 'Pinamalayan', 'Naujan', 'Roxas', 'Bongabong', 'Victoria', 'Puerto Galera', 'Baco']],
      ['Palawan', ['Puerto Princesa', 'El Nido', 'Coron', "Brooke's Point", 'Roxas', 'Narra', 'Taytay', 'Aborlan']],
      ['Romblon', ['Romblon', 'Odiongan', 'San Agustin', 'Cajidiocan', 'Looc', 'San Fernando']]
    ]],
    ['R5', 'Region V (Bicol Region)', [
      ['Albay', ['Legazpi', 'Tabaco', 'Ligao', 'Daraga', 'Guinobatan', 'Camalig', 'Polangui', 'Tiwi', 'Oas']],
      ['Camarines Norte', ['Daet', 'Labo', 'Mercedes', 'Jose Panganiban', 'Paracale', 'Vinzons']],
      ['Camarines Sur', ['Pili', 'Naga', 'Iriga', 'Libmanan', 'Calabanga', 'Nabua', 'Goa', 'Tigaon', 'Sipocot']],
      ['Catanduanes', ['Virac', 'San Andres', 'Bato', 'Viga', 'Pandan', 'Caramoran']],
      ['Masbate', ['Masbate City', 'Aroroy', 'Milagros', 'Mandaon', 'Cataingan', 'Placer']],
      ['Sorsogon', ['Sorsogon City', 'Bulan', 'Gubat', 'Irosin', 'Castilla', 'Pilar', 'Matnog']]
    ]],
    ['R6', 'Region VI (Western Visayas)', [
      ['Aklan', ['Kalibo', 'Malay', 'Ibajay', 'Banga', 'New Washington', 'Numancia']],
      ['Antique', ['San Jose de Buenavista', 'Sibalom', 'Culasi', 'Pandan', 'Hamtic', 'Tibiao']],
      ['Capiz', ['Roxas City', 'Panay', 'Pontevedra', 'Panitan', 'Pilar', 'Dumarao', 'Mambusao']],
      ['Guimaras', ['Jordan', 'Buenavista', 'Nueva Valencia', 'San Lorenzo', 'Sibunag']],
      ['Iloilo', ['Iloilo City', 'Passi', 'Oton', 'Pavia', 'Santa Barbara', 'Miagao', 'Pototan', 'Dumangas', 'Janiuay', 'Leganes', 'Tigbauan', 'Guimbal']]
    ]],
    ['NIR', 'Negros Island Region (NIR)', [
      ['Negros Occidental', ['Bacolod', 'Silay', 'Talisay', 'Bago', 'Kabankalan', 'San Carlos', 'Sagay', 'Cadiz', 'Himamaylan', 'Victorias', 'La Carlota', 'Sipalay', 'Escalante']],
      ['Negros Oriental', ['Dumaguete', 'Bayawan', 'Bais', 'Tanjay', 'Canlaon', 'Guihulngan', 'Sibulan', 'Valencia', 'Dauin']],
      ['Siquijor', ['Siquijor', 'Larena', 'Lazi', 'Maria', 'San Juan', 'Enrique Villanueva']]
    ]],
    ['R7', 'Region VII (Central Visayas)', [
      ['Bohol', ['Tagbilaran', 'Panglao', 'Dauis', 'Tubigon', 'Talibon', 'Ubay', 'Carmen', 'Jagna', 'Loboc']],
      ['Cebu', ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Talisay', 'Toledo', 'Danao', 'Carcar', 'Naga', 'Bogo', 'Minglanilla', 'Consolacion', 'Liloan', 'Cordova', 'Compostela', 'Balamban', 'Moalboal', 'Oslob', 'Bantayan']]
    ]],
    ['R8', 'Region VIII (Eastern Visayas)', [
      ['Biliran', ['Naval', 'Biliran', 'Caibiran', 'Culaba', 'Kawayan', 'Almeria']],
      ['Eastern Samar', ['Borongan', 'Guiuan', 'Dolores', 'Oras', 'Can-avid', 'Balangiga']],
      ['Leyte', ['Tacloban', 'Ormoc', 'Baybay', 'Palo', 'Tanauan', 'Dulag', 'Abuyog', 'Carigara', 'Hilongos', 'Kananga']],
      ['Northern Samar', ['Catarman', 'Laoang', 'Allen', 'Bobon', 'San Roque', 'Catubig']],
      ['Samar', ['Catbalogan', 'Calbayog', 'Basey', 'Gandara', 'Paranas', 'Santa Rita']],
      ['Southern Leyte', ['Maasin', 'Sogod', 'Liloan', 'Hinunangan', 'Saint Bernard', 'Macrohon']]
    ]],
    ['R9', 'Region IX (Zamboanga Peninsula)', [
      ['Zamboanga del Norte', ['Dipolog', 'Dapitan', 'Sindangan', 'Liloy', 'Polanco', 'Katipunan', 'Roxas']],
      ['Zamboanga del Sur', ['Pagadian', 'Zamboanga City', 'Molave', 'Aurora', 'Dumingag', 'Tukuran', 'Labangan']],
      ['Zamboanga Sibugay', ['Ipil', 'Kabasalan', 'Siay', 'Payao', 'Diplahan', 'Titay', 'Imelda']]
    ]],
    ['R10', 'Region X (Northern Mindanao)', [
      ['Bukidnon', ['Malaybalay', 'Valencia', 'Maramag', 'Quezon', 'Manolo Fortich', 'Don Carlos', 'Kibawe']],
      ['Camiguin', ['Mambajao', 'Catarman', 'Guinsiliban', 'Mahinog', 'Sagay']],
      ['Lanao del Norte', ['Tubod', 'Iligan', 'Kapatagan', 'Lala', 'Kauswagan', 'Maigo', 'Bacolod']],
      ['Misamis Occidental', ['Oroquieta', 'Ozamiz', 'Tangub', 'Jimenez', 'Plaridel', 'Clarin', 'Calamba']],
      ['Misamis Oriental', ['Cagayan de Oro', 'Gingoog', 'El Salvador', 'Tagoloan', 'Villanueva', 'Jasaan', 'Balingasag', 'Opol', 'Initao']]
    ]],
    ['R11', 'Region XI (Davao Region)', [
      ['Davao de Oro', ['Nabunturan', 'Monkayo', 'Maco', 'Mabini', 'Pantukan', 'Maragusan', 'Montevista']],
      ['Davao del Norte', ['Tagum', 'Panabo', 'Island Garden City of Samal', 'Carmen', 'Santo Tomas', 'Kapalong', 'Asuncion']],
      ['Davao del Sur', ['Digos', 'Davao City', 'Santa Cruz', 'Bansalan', 'Hagonoy', 'Matanao', 'Sulop']],
      ['Davao Occidental', ['Malita', 'Santa Maria', 'Don Marcelino', 'Jose Abad Santos', 'Sarangani']],
      ['Davao Oriental', ['Mati', 'Baganga', 'Lupon', 'Governor Generoso', 'Banaybanay', 'Cateel']]
    ]],
    ['R12', 'Region XII (SOCCSKSARGEN)', [
      ['Cotabato', ['Kidapawan', 'Midsayap', 'Kabacan', "M'lang", 'Pikit', 'Carmen', 'Makilala', 'Matalam']],
      ['Sarangani', ['Alabel', 'Glan', 'Malungon', 'Maasim', 'Maitum', 'Kiamba', 'Malapatan']],
      ['South Cotabato', ['Koronadal', 'General Santos', 'Polomolok', 'Tupi', 'Surallah', 'Banga', 'Tantangan', 'Lake Sebu', "T'boli"]],
      ['Sultan Kudarat', ['Isulan', 'Tacurong', 'Lebak', 'Kalamansig', 'President Quirino', 'Esperanza', 'Lambayong']]
    ]],
    ['R13', 'Region XIII (Caraga)', [
      ['Agusan del Norte', ['Cabadbaran', 'Butuan', 'Buenavista', 'Nasipit', 'Carmen', 'Jabonga', 'Kitcharao']],
      ['Agusan del Sur', ['Prosperidad', 'Bayugan', 'San Francisco', 'Trento', 'Esperanza', 'Bunawan', 'Talacogon']],
      ['Dinagat Islands', ['San Jose', 'Basilisa', 'Cagdianao', 'Dinagat', 'Libjo', 'Loreto', 'Tubajon']],
      ['Surigao del Norte', ['Surigao City', 'Dapa', 'Del Carmen', 'General Luna', 'Placer', 'Mainit', 'Claver']],
      ['Surigao del Sur', ['Tandag', 'Bislig', 'Hinatuan', 'Lianga', 'Barobo', 'San Francisco', 'Cantilan']]
    ]],
    ['BARMM', 'Bangsamoro (BARMM)', [
      ['Basilan', ['Lamitan', 'Isabela City', 'Maluso', 'Sumisip', 'Tipo-Tipo', 'Lantawan']],
      ['Lanao del Sur', ['Marawi', 'Malabang', 'Balindong', 'Wao', 'Bayang', 'Masiu']],
      ['Maguindanao del Norte', ['Datu Odin Sinsuat', 'Cotabato City', 'Sultan Kudarat', 'Parang', 'Upi', 'Buldon']],
      ['Maguindanao del Sur', ['Buluan', 'Datu Piang', 'Shariff Aguak', 'Ampatuan', 'Datu Paglas']],
      ['Sulu', ['Jolo', 'Patikul', 'Indanan', 'Parang', 'Maimbung', 'Talipao']],
      ['Tawi-Tawi', ['Bongao', 'Panglima Sugala', 'Simunul', 'Sitangkai', 'Languyan']]
    ]]
  ];

  // Barangay kada demo city, key = 'Province|City'. (Sample lang; kung wala ang barangay, may text field.)
  var B = {
    'Metro Manila|Quezon City': ['Bagong Pag-asa', 'Bagbag', 'Batasan Hills', 'Commonwealth', 'Culiat', 'Fairview', 'Holy Spirit', 'Kamuning', 'Novaliches Proper', 'Pasong Tamo', 'Payatas', 'Project 6', 'Sauyo', 'Tandang Sora', 'U.P. Campus'],
    'Metro Manila|Manila': ['Binondo', 'Ermita', 'Intramuros', 'Malate', 'Paco', 'Pandacan', 'Port Area', 'Quiapo', 'Sampaloc', 'San Andres', 'San Miguel', 'San Nicolas', 'Santa Ana', 'Santa Cruz', 'Santa Mesa', 'Tondo'],
    'Metro Manila|Marikina': ['Barangka', 'Calumpang', 'Concepcion Uno', 'Concepcion Dos', 'Fortune', 'Industrial Valley Complex', 'Jesus dela Peña', 'Malanday', 'Marikina Heights', 'Nangka', 'Parang', 'San Roque', 'Santa Elena', 'Santo Niño', 'Tañong', 'Tumana'],
    'Metro Manila|Pasig': ['Bagong Ilog', 'Bambang', 'Buting', 'Caniogan', 'Dela Paz', 'Kapasigan', 'Kapitolyo', 'Malinao', 'Manggahan', 'Maybunga', 'Oranbo', 'Pinagbuhatan', 'Pineda', 'Rosario', 'Sagad', 'San Antonio', 'San Joaquin', 'San Miguel', 'Santa Lucia', 'Santolan', 'Ugong'],
    'Metro Manila|Caloocan': ['Barangay 1', 'Barangay 12', 'Barangay 28', 'Barangay 45', 'Barangay 72', 'Barangay 98', 'Barangay 120', 'Barangay 142', 'Barangay 160', 'Barangay 171', 'Barangay 176 (Bagong Silang)', 'Barangay 178', 'Barangay 188'],
    'Metro Manila|Makati': ['Bangkal', 'Bel-Air', 'Carmona', 'Dasmariñas', 'Forbes Park', 'Guadalupe Nuevo', 'Guadalupe Viejo', 'Kasilawan', 'La Paz', 'Magallanes', 'Olympia', 'Palanan', 'Pio del Pilar', 'Pitogo', 'Poblacion', 'San Antonio', 'San Isidro', 'San Lorenzo', 'Santa Cruz', 'Singkamas', 'Tejeros', 'Urdaneta', 'Valenzuela'],
    'Metro Manila|Taguig': ['Bagumbayan', 'Bambang', 'Calzada', 'Central Bicutan', 'Central Signal Village', 'Fort Bonifacio', 'Hagonoy', 'Ibayo-Tipas', 'Katuparan', 'Ligid-Tipas', 'Lower Bicutan', 'Maharlika Village', 'Napindan', 'New Lower Bicutan', 'North Signal Village', 'Palingon', 'Pinagsama', 'San Miguel', 'Santa Ana', 'South Signal Village', 'Tanyag', 'Tuktukan', 'Upper Bicutan', 'Ususan', 'Wawa', 'Western Bicutan'],
    'Rizal|Antipolo': ['Bagong Nayon', 'Beverly Hills', 'Calawis', 'Cupang', 'Dalig', 'Dela Paz', 'Inarawan', 'Mambugan', 'Mayamot', 'Muntindilaw', 'San Isidro', 'San Jose', 'San Juan', 'San Luis', 'San Roque', 'Santa Cruz'],
    'Batangas|Batangas City': ['Alangilan', 'Balagtas', 'Banaba Center', 'Bolbok', 'Calicanto', 'Cuta', 'Kumintang Ibaba', 'Kumintang Ilaya', 'Libjo', 'Pallocan West', 'Poblacion', 'Santa Rita Karsada', 'Soro-soro Ibaba', 'Tabangao', 'Wawa'],
    'Quezon|Lucena': ['Barangay 1 (Poblacion)', 'Barangay 5 (Poblacion)', 'Cotta', 'Dalahican', 'Domoit', 'Gulang-Gulang', 'Ibabang Dupay', 'Ibabang Iyam', 'Ilayang Dupay', 'Ilayang Iyam', 'Isabang', 'Market View', 'Mayao Crossing', 'Ransohan', 'Talao-Talao'],
    'Benguet|Baguio': ['Aurora Hill Proper', 'Bakakeng Central', 'Burnham-Legarda', 'Camp 7', 'Dominican Hill-Mirador', "Engineers' Hill", 'Guisad Central', 'Irisan', 'Loakan Proper', 'Lourdes Subdivision Proper', 'Pacdal', 'Pinsao Proper', 'Quezon Hill Proper', 'San Luis Village', 'Session Road Area', 'Trancoville'],
    'Pangasinan|Dagupan': ['Bonuan Binloc', 'Bonuan Boquig', 'Bonuan Gueset', 'Calmay', 'Carael', 'Lucao', 'Malued', 'Mangin', 'Pantal', 'Poblacion Oeste', 'Pogo Chico', 'Pogo Grande', 'Salisay', 'Tapuac', 'Tebeng'],
    'Ilocos Norte|Laoag': ['San Lorenzo', 'Santa Joaquina', 'Nuestra Señora del Rosario', 'San Pedro', 'Santa Angela', 'San Jose', 'Santo Tomas', 'Santa Balbina', 'San Matias', 'Balatong', 'Barit-Pandan', 'Buttong', 'Calayab', 'Gabu Norte', 'Suyo', 'Vira'],
    'Cagayan|Tuguegarao': ['Annafunan East', 'Annafunan West', 'Atulayan Norte', 'Bagay', 'Buntun', 'Caggay', 'Capatan', 'Caritan Centro', 'Carig Sur', 'Centro 1 (Poblacion)', 'Centro 10 (Poblacion)', 'Cataggaman Nuevo', 'Linao East', 'Pengue-Ruyu', 'San Gabriel', 'Ugac Sur'],
    'Pampanga|San Fernando': ['Alasas', 'Baliti', 'Bulaon', 'Calulut', 'Del Carmen', 'Del Pilar', 'Dela Paz Norte', 'Dolores', 'Juliana', 'Lara', 'Lourdes', 'Magliman', 'Maimpis', 'Malino', 'Quebiawan', 'San Agustin', 'San Jose', 'San Juan', 'Santa Lucia', 'Santo Niño', 'Santo Rosario (Poblacion)', 'Sindalan', 'Telabastagan'],
    'Bulacan|Malolos': ['Anilao', 'Atlag', 'Bagong Bayan', 'Balite', 'Bulihan', 'Caingin', 'Canalate', 'Catmon', 'Dakila', 'Guinhawa', 'Longos', 'Mabolo', 'Mojon', 'Pinagbakahan', 'San Vicente (Poblacion)', 'Santo Niño (Poblacion)', 'Sumapang Matanda', 'Tikay'],
    'Camarines Sur|Naga': ['Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas', 'Calauag', 'Cararayan', 'Carolina', 'Concepcion Grande', 'Concepcion Pequeña', 'Dayangdang', 'Del Rosario', 'Dinaga', 'Igualdad Interior', 'Lerma', 'Liboton', 'Mabolo', 'Pacol', 'Panicuason', 'Peñafrancia', 'Sabang', 'San Felipe', 'San Francisco', 'San Isidro', 'Santa Cruz', 'Tabuco', 'Tinago', 'Triangulo'],
    'Albay|Legazpi': ['Arimbay', 'Bagong Abre', 'Banquerohan', 'Bigaa', 'Bogtong', 'Bonot', 'Cabugao', 'Cruzada', 'Dap-dap', 'Dita', 'Estanza', 'Gogon', 'Homapon', 'Imalnod', 'Lamba', 'Maslog', 'Padang', 'Puro', 'Rawis', 'Tamaoyan', 'Taysan', 'Washington Drive'],
    'Palawan|Puerto Princesa': ['Bagong Pag-asa', 'Bagong Sikat', 'Bagong Silang', 'Bancao-Bancao', 'Irawan', 'Iwahig', 'Liwanag', 'Mabuhay', 'Mandaragat', 'Maningning', 'Masipag', 'Model', 'Pagkakaisa', 'Sabang', 'San Jose', 'San Manuel', 'San Miguel', 'San Pedro', 'Santa Lourdes', 'Santa Monica', 'Sicsican', 'Tagburos', 'Tiniguiban'],
    'Oriental Mindoro|Calapan': ['Balingayan', 'Balite', 'Baruyan', 'Bayanan I', 'Bayanan II', 'Camilmil', 'Canubing I', 'Guinobatan', 'Ibaba East', 'Ibaba West', 'Ilaya', 'Lalud', 'Lumangbayan', 'Masipit', 'Parang', 'Salong', 'San Vicente Central', 'San Vicente East', 'Santa Isabel', 'Santo Niño', 'Sapul', 'Suqui', 'Tawiran', 'Wawa'],
    'Iloilo|Iloilo City': ['Balantang', 'Bito-on', 'Bolilao', 'Calumpang', 'Cuartero', 'Dungon A', 'Dungon B', 'Hibao-an Sur', 'Lanit', 'Lapuz Norte', 'Magsaysay Village', 'Mandurriao', 'Molo Boulevard', 'Nabitasan', 'Quintin Salas', 'Rizal Estanzuela', 'Sambag', 'San Isidro (Jaro)', 'San Jose (Arevalo)', 'San Pedro (Molo)', 'Santa Cruz', 'Santo Niño Sur', 'So-oc', 'Tabucan', 'Tagbac', 'Ungka', 'Villa Anita'],
    'Capiz|Roxas City': ['Banica', 'Barra', 'Baybay', 'Bolo', 'Cagay', 'Culasi', 'Dumolog', 'Inzo Arnaldo Village', 'Lanot', 'Lawaan', 'Libas', 'Loctugan', 'Lonoy', 'Milibili', 'Poblacion I', 'Poblacion V', 'Poblacion XI', 'Punta Cogon', 'Punta Tabuc', 'San Jose', 'Sibaguan', 'Tanque', 'Tiza'],
    'Negros Occidental|Bacolod': ['Alangilan', 'Alijis', 'Banago', 'Barangay 1 (Poblacion)', 'Barangay 21 (Poblacion)', 'Bata', 'Cabug', 'Estefania', 'Felisa', 'Granada', 'Handumanan', 'Mandalagan', 'Mansilingan', 'Montevista', 'Pahanocoy', 'Punta Taytay', 'Singcang-Airport', 'Sum-ag', 'Taculing', 'Tangub', 'Villamonte', 'Vista Alegre'],
    'Negros Oriental|Dumaguete': ['Bagacay', 'Bajumpandan', 'Balugo', 'Banilad', 'Bantayan', 'Batinguel', 'Bunao', 'Cadawinonan', 'Calindagan', 'Camanjac', 'Candau-ay', 'Cantil-e', 'Daro', 'Junob', 'Looc', 'Mangnao-Canal', 'Motong', 'Piapi', 'Poblacion 1', 'Poblacion 8', 'Pulantubig', 'Tabuctubig', 'Taclobo', 'Talay'],
    'Cebu|Cebu City': ['Apas', 'Banilad', 'Basak Pardo', 'Basak San Nicolas', 'Bulacao', 'Busay', 'Capitol Site', 'Carreta', 'Cogon Ramos', 'Day-as', 'Duljo-Fatima', 'Ermita', 'Guadalupe', 'Hipodromo', 'Inayawan', 'Kalunasan', 'Kamputhaw', 'Kasambagan', 'Labangon', 'Lahug', 'Luz', 'Mabolo', 'Mambaling', 'Pahina Central', 'Pardo', 'Pasil', 'Pit-os', 'Punta Princesa', 'Sambag I', 'Sambag II', 'San Nicolas Proper', 'Santa Cruz', 'Santo Niño', 'Sawang Calero', 'T. Padilla', 'Talamban', 'Tejero', 'Tinago', 'Tisa', 'Zapatera'],
    'Cebu|Mandaue': ['Alang-alang', 'Bakilid', 'Banilad', 'Basak', 'Cabancalan', 'Cambaro', 'Canduman', 'Casili', 'Casuntingan', 'Centro', 'Cubacub', 'Guizo', 'Ibabao-Estancia', 'Jagobiao', 'Labogon', 'Looc', 'Maguikay', 'Mantuyong', 'Opao', 'Pagsabungan', 'Pakna-an', 'Subangdaku', 'Tabok', 'Tawason', 'Tingub', 'Tipolo', 'Umapad'],
    'Cebu|Lapu-Lapu': ['Agus', 'Babag', 'Bankal', 'Baring', 'Basak', 'Buaya', 'Calawisan', 'Canjulao', 'Caw-oy', 'Gun-ob', 'Ibo', 'Looc', 'Mactan', 'Maribago', 'Marigondon', 'Pajac', 'Pajo', 'Poblacion', 'Punta Engaño', 'Pusok', 'Sabang', 'Santa Rosa', 'Subabasbas', 'Talima', 'Tingo', 'Tungasan'],
    'Bohol|Tagbilaran': ['Bool', 'Booy', 'Cabawan', 'Cogon', 'Dampas', 'Dao', 'Manga', 'Mansasa', 'Poblacion I', 'Poblacion II', 'Poblacion III', 'San Isidro', 'Taloto', 'Tiptip', 'Ubujan'],
    'Leyte|Tacloban': ['Abucay', 'Apitong', 'Bagacay', 'Basper', 'Cabalawan', 'Caibaan', 'Calanipawan', 'Diit', 'Marasbaras', 'Palanog', 'Sagkahan', 'San Jose', 'Tagpuro', 'Utap', 'V&G Subdivision'],
    'Leyte|Ormoc': ['Alegria', 'Bantigue', 'Cogon', 'Curva', 'District 1 (Poblacion)', 'District 15 (Poblacion)', 'District 29 (Poblacion)', 'Dolores', 'Donghol', 'Ipil', 'Linao', 'Luna', 'Macabug', 'Margen', 'Naungan', 'Punta', 'San Isidro', 'San Pablo', 'Valencia'],
    'Samar|Catbalogan': ['Barangay 1 (Poblacion)', 'Barangay 7 (Poblacion)', 'Barangay 13 (Poblacion)', 'Bunuanan', 'Canlapwas', 'Guindapunan', 'Guinsorongan', 'Ibol', 'Lagundi', 'Maulong', 'Mercedes', 'Muñoz', 'Payao', 'Pupua', 'San Andres', 'San Pablo', 'Socorro'],
    'Zamboanga del Sur|Zamboanga City': ['Ayala', 'Baliwasan', 'Boalan', 'Cabatangan', 'Calarian', 'Canelar', 'Culianan', 'Divisoria', 'Guiwan', 'Mercedes', 'Pasonanca', 'Putik', 'Recodo', 'San Jose Gusu', 'San Roque', 'Santa Barbara', 'Santa Maria', 'Sinunuc', 'Talon-Talon', 'Tetuan', 'Tugbungan', 'Tumaga', 'Zone I', 'Zone IV'],
    'Zamboanga del Sur|Pagadian': ['Balangasan', 'Baloyboan', 'Banale', 'Bogo', 'Bomba', 'Bulatok', 'Dampalan', 'Danlugan', 'Dao', 'Dumagoc', 'Gatas', 'Kagawasan', 'Kawit', 'Lala', 'Lenienza', 'Lumbia', 'Napolan', 'San Francisco', 'San Jose', 'San Pedro', 'Santa Lucia', 'Santa Maria', 'Santiago', 'Santo Niño', 'Tiguma', 'Tuburan', 'White Beach'],
    'Misamis Oriental|Cagayan de Oro': ['Agusan', 'Balulang', 'Bayabas', 'Bugo', 'Bulua', 'Camaman-an', 'Canitoan', 'Carmen', 'Consolacion', 'Cugman', 'Gusa', 'Indahag', 'Iponan', 'Kauswagan', 'Lapasan', 'Lumbia', 'Macabalan', 'Macasandig', 'Nazareth', 'Pagatpat', 'Patag', 'Puerto', 'Puntod', 'Tablon', 'Barangay 1 (Poblacion)', 'Barangay 40 (Poblacion)'],
    'Lanao del Norte|Iligan': ['Abuno', 'Acmac', 'Bagong Silang', 'Buru-un', 'Dalipuga', 'Del Carmen', 'Hinaplanon', 'Kiwalan', 'Mahayahay', 'Mandulog', 'Maria Cristina', 'Palao', 'Poblacion', 'Pugaan', 'Saray', 'San Miguel', 'San Roque', 'Santa Elena', 'Santa Filomena', 'Santiago', 'Santo Rosario', 'Suarez', 'Tambacan', 'Tibanga', 'Tipanoy', 'Tomas Cabili', 'Tubod', 'Ubaldo Laya', 'Villa Verde'],
    'Davao del Sur|Davao City': ['Agdao', 'Bago Aplaya', 'Baliok', 'Bangkal', 'Bucana', 'Buhangin', 'Bunawan', 'Cabantian', 'Catalunan Grande', 'Catalunan Pequeño', 'Dumoy', 'Indangan', 'Lanang', 'Langub', 'Ma-a', 'Matina Aplaya', 'Matina Crossing', 'Matina Pangi', 'Mintal', 'Pampanga', 'Panacan', 'Poblacion District', 'Sasa', 'Talomo', 'Tibungco', 'Toril', 'Tugbok', 'Ulas'],
    'South Cotabato|General Santos': ['Apopong', 'Baluan', 'Batomelong', 'Buayan', 'Bula', 'Calumpang', 'City Heights', 'Conel', 'Dadiangas East', 'Dadiangas North', 'Dadiangas South', 'Dadiangas West', 'Fatima', 'Katangawan', 'Labangal', 'Lagao', 'Ligaya', 'Mabuhay', 'Olympog', 'San Isidro', 'San Jose', 'Siguel', 'Sinawal', 'Tambler', 'Tinagacan', 'Upper Labay'],
    'South Cotabato|Koronadal': ['Assumption', 'Avanceña', 'Cacub', 'Caloocan', 'Carpenter Hill', 'Concepcion', 'Esperanza', 'General Paulino Santos', 'Mabini', 'Magsaysay', 'Mambucal', 'Morales', 'Namnama', 'New Pangasinan', 'Paraiso', 'Rotonda', 'San Isidro', 'San Jose', 'San Roque', 'Santa Cruz', 'Santo Niño', 'Saravia', 'Topland', 'Zone I', 'Zone II', 'Zone III', 'Zone IV'],
    'Agusan del Norte|Butuan': ['Agao (Poblacion)', 'Ampayon', 'Antongalon', 'Baan KM 3', 'Baan Riverside', 'Bading', 'Bancasi', 'Banza', 'Bayanihan', 'Bit-os', 'Bobon', 'Buhangin', 'Dagohoy', 'Doongan', 'Golden Ribbon', 'Holy Redeemer', 'Humabon', 'Imadejas', 'Jose Rizal (Poblacion)', 'Lapu-lapu', 'Libertad', 'Limaha', 'Los Angeles', 'Lumbocan', 'Mahay', 'Mahogany', 'Obrero', 'Ong Yiu', 'Pangabugan', 'San Ignacio', 'San Vicente', 'Sikatuna', 'Silongan', 'Sumilihon', 'Tandang Sora', 'Tiniwisan', 'Villa Kananga'],
    'Surigao del Norte|Surigao City': ['Alang-alang', 'Anomar', 'Bilabid', 'Bonifacio', 'Cabongbongan', 'Canlanipa', 'Ipil', 'Lipata', 'Luna', 'Mabini', 'Mabua', 'Mapawa', 'Mat-i', 'Orok', 'Poctoy', 'Quezon', 'Rizal', 'Sabang', 'San Juan', 'San Pedro', 'Serna', 'Sidlakan', 'Silop', 'Sukailang', 'Taft', 'Togbongon', 'Trinidad', 'Washington'],
    'Maguindanao del Norte|Cotabato City': ['Bagua', 'Bagua I', 'Bagua II', 'Bagua III', 'Kalanganan', 'Kalanganan I', 'Kalanganan II', 'Poblacion', 'Poblacion I', 'Poblacion IV', 'Poblacion VIII', 'Rosary Heights', 'Rosary Heights 5', 'Rosary Heights 10', 'Tamontaka', 'Tamontaka 2', 'Tamontaka 5']
  };

  AN.PH_REGIONS = R.map(function (r) {
    return { id: r[0], name: r[1], provinces: r[2].map(function (p) { return { name: p[0], cities: p[1].slice() }; }) };
  });

  AN.ph = {
    regions: function () { return AN.PH_REGIONS; },
    region: function (id) { return AN.PH_REGIONS.filter(function (r) { return r.id === id; })[0] || null; },
    provinces: function (regionId) { var r = AN.ph.region(regionId); return r ? r.provinces : []; },
    cities: function (regionId, province) {
      var p = AN.ph.provinces(regionId).filter(function (x) { return x.name === province; })[0];
      return p ? p.cities : [];
    },
    /** Barangay ng city kung nasa demo list; [] kung wala (i-type na lang). */
    barangays: function (province, city) { return (B[province + '|' + city] || []).slice(); }
  };
})();
