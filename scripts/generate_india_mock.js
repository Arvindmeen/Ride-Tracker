/**
 * generate_india_mock.js
 * Generates: 100,000 users + 1,200 drivers (all Indian states/districts)
 *          + 500,000 ride records + realistic analytics
 * Run from project root: node scripts/generate_india_mock.js
 */
const fs   = require('fs');
const path = require('path');

// Deterministic PRNG
let seed = 42;
function rng()       { seed=(seed*1664525+1013904223)&0xFFFFFFFF; return (seed>>>0)/0xFFFFFFFF; }
function ri(a,b)     { return Math.floor(rng()*(b-a+1))+a; }
function rf(a,b)     { return +(rng()*(b-a)+a).toFixed(2); }
function pick(arr)   { return arr[Math.floor(rng()*arr.length)]; }

function weightedPick(arr, weights) {
  const total = weights.reduce((a,b)=>a+b,0);
  let r = rng()*total;
  for(let i=0;i<arr.length;i++){r-=weights[i];if(r<=0)return arr[i];}
  return arr[arr.length-1];
}
function jitter(base, rangeKm=12) {
  const deg = rangeKm/111;
  return +(base+(rng()*2-1)*deg).toFixed(6);
}
function genPhone() {
  const p=['98','97','96','95','94','93','92','91','90','89','88','87','86','85','84','83','82','81','80'];
  return `+91 ${pick(p)}${ri(100,999)} ${ri(10000,99999)}`;
}
function genEmail(f,l) {
  const d=pick(['gmail.com','yahoo.com','outlook.com','rediffmail.com','hotmail.com','ymail.com']);
  return `${f.toLowerCase()}.${l.toLowerCase()}${ri(1,9999)}@${d}`;
}
function genPlate(stCode) {
  const ABBR={WB:'WB',MH:'MH',DL:'DL',KA:'KA',TN:'TN',TS:'TS',AP:'AP',GJ:'GJ',RJ:'RJ',UP:'UP',MP:'MP',BR:'BR',OD:'OD',HR:'HR',PB:'PB',KL:'KL',JH:'JH',CT:'CG',UK:'UK',HP:'HP',AS:'AS',JK:'JK',GA:'GA',CH:'CH',TR:'TR',MN:'MN',SK:'SK',NL:'NL',ML:'ML',MZ:'MZ',AR:'AR',AN:'AN',LA:'LA',PY:'PY',DD:'DD',LD:'LD'};
  const p=ABBR[stCode]||'MH', n=ri(1,99).toString().padStart(2,'0');
  const L=String.fromCharCode(65+ri(0,25))+String.fromCharCode(65+ri(0,25));
  return `${p} ${n} ${L} ${ri(1000,9999)}`;
}

// ── INDIA STATES & DISTRICTS ──────────────────────────────────────────────────
const STATES = [
  {code:'AN',name:'Andaman & Nicobar Islands',d:[{n:'South Andaman',lt:11.623,lg:92.726},{n:'North Andaman',lt:12.960,lg:92.865},{n:'Nicobars',lt:7.000,lg:93.833}]},
  {code:'AP',name:'Andhra Pradesh',d:[{n:'Visakhapatnam',lt:17.686,lg:83.218},{n:'Vijayawada',lt:16.506,lg:80.648},{n:'Guntur',lt:16.306,lg:80.436},{n:'Tirupati',lt:13.628,lg:79.419},{n:'Nellore',lt:14.442,lg:79.986},{n:'Kurnool',lt:15.828,lg:78.037},{n:'Kadapa',lt:14.467,lg:78.824},{n:'Anantapur',lt:14.681,lg:77.600},{n:'Kakinada',lt:16.989,lg:82.247},{n:'Rajahmundry',lt:16.997,lg:81.779},{n:'Vizianagaram',lt:18.106,lg:83.420},{n:'Srikakulam',lt:18.294,lg:83.893},{n:'Ongole',lt:15.505,lg:80.049}]},
  {code:'AR',name:'Arunachal Pradesh',d:[{n:'Itanagar',lt:27.084,lg:93.605},{n:'Naharlagun',lt:27.102,lg:93.695},{n:'Tawang',lt:27.586,lg:91.868},{n:'Ziro',lt:27.595,lg:93.829},{n:'Pasighat',lt:28.066,lg:95.333},{n:'Bomdila',lt:27.265,lg:92.415}]},
  {code:'AS',name:'Assam',d:[{n:'Guwahati',lt:26.144,lg:91.736},{n:'Silchar',lt:24.833,lg:92.778},{n:'Dibrugarh',lt:27.472,lg:94.912},{n:'Jorhat',lt:26.750,lg:94.203},{n:'Nagaon',lt:26.350,lg:92.684},{n:'Tinsukia',lt:27.491,lg:95.353},{n:'Bongaigaon',lt:26.475,lg:90.558},{n:'Tezpur',lt:26.633,lg:92.788},{n:'Dhubri',lt:26.019,lg:89.975},{n:'Karimganj',lt:24.864,lg:92.360}]},
  {code:'BR',name:'Bihar',d:[{n:'Patna',lt:25.594,lg:85.137},{n:'Gaya',lt:24.791,lg:84.999},{n:'Muzaffarpur',lt:26.120,lg:85.364},{n:'Bhagalpur',lt:25.242,lg:86.984},{n:'Darbhanga',lt:26.154,lg:85.891},{n:'Begusarai',lt:25.418,lg:86.127},{n:'Arrah',lt:25.551,lg:84.664},{n:'Purnia',lt:25.777,lg:87.475},{n:'Katihar',lt:25.539,lg:87.581},{n:'Bihar Sharif',lt:25.198,lg:85.517},{n:'Siwan',lt:26.221,lg:84.354},{n:'Nawada',lt:24.887,lg:85.539}]},
  {code:'CT',name:'Chhattisgarh',d:[{n:'Raipur',lt:21.251,lg:81.629},{n:'Bhilai',lt:21.208,lg:81.378},{n:'Bilaspur',lt:22.079,lg:82.139},{n:'Durg',lt:21.190,lg:81.284},{n:'Korba',lt:22.359,lg:82.750},{n:'Raigarh',lt:21.897,lg:83.395},{n:'Jagdalpur',lt:19.075,lg:82.035},{n:'Rajnandgaon',lt:21.099,lg:81.029},{n:'Ambikapur',lt:23.121,lg:83.196}]},
  {code:'GA',name:'Goa',d:[{n:'Panaji',lt:15.490,lg:73.827},{n:'Vasco da Gama',lt:15.398,lg:73.814},{n:'Margao',lt:15.283,lg:73.986},{n:'Mapusa',lt:15.593,lg:73.809},{n:'Ponda',lt:15.403,lg:73.993}]},
  {code:'GJ',name:'Gujarat',d:[{n:'Ahmedabad',lt:23.022,lg:72.571},{n:'Surat',lt:21.170,lg:72.831},{n:'Vadodara',lt:22.307,lg:73.181},{n:'Rajkot',lt:22.303,lg:70.802},{n:'Bhavnagar',lt:21.764,lg:72.151},{n:'Jamnagar',lt:22.470,lg:70.057},{n:'Gandhinagar',lt:23.215,lg:72.636},{n:'Junagadh',lt:21.522,lg:70.457},{n:'Anand',lt:22.564,lg:72.928},{n:'Gandhidham',lt:23.075,lg:70.133},{n:'Mehsana',lt:23.588,lg:72.369},{n:'Surendranagar',lt:22.727,lg:71.639}]},
  {code:'HR',name:'Haryana',d:[{n:'Gurugram',lt:28.459,lg:77.026},{n:'Faridabad',lt:28.408,lg:77.317},{n:'Ambala',lt:30.378,lg:76.776},{n:'Yamunanagar',lt:30.129,lg:77.267},{n:'Rohtak',lt:28.895,lg:76.606},{n:'Hisar',lt:29.149,lg:75.721},{n:'Panipat',lt:29.390,lg:76.963},{n:'Karnal',lt:29.685,lg:76.990},{n:'Sonipat',lt:28.993,lg:77.015},{n:'Bhiwani',lt:28.797,lg:76.132},{n:'Panchkula',lt:30.694,lg:76.860},{n:'Rewari',lt:28.194,lg:76.612}]},
  {code:'HP',name:'Himachal Pradesh',d:[{n:'Shimla',lt:31.104,lg:77.173},{n:'Dharamshala',lt:32.219,lg:76.323},{n:'Mandi',lt:31.708,lg:76.932},{n:'Solan',lt:30.904,lg:77.112},{n:'Baddi',lt:30.957,lg:76.790},{n:'Kullu',lt:31.959,lg:77.108},{n:'Nahan',lt:30.558,lg:77.296},{n:'Hamirpur',lt:31.686,lg:76.521}]},
  {code:'JH',name:'Jharkhand',d:[{n:'Ranchi',lt:23.344,lg:85.309},{n:'Jamshedpur',lt:22.804,lg:86.202},{n:'Dhanbad',lt:23.795,lg:86.430},{n:'Bokaro',lt:23.669,lg:86.151},{n:'Deoghar',lt:24.484,lg:86.695},{n:'Hazaribagh',lt:23.992,lg:85.362},{n:'Giridih',lt:24.191,lg:86.306},{n:'Ramgarh',lt:23.636,lg:85.508}]},
  {code:'KA',name:'Karnataka',d:[{n:'Bengaluru',lt:12.971,lg:77.594},{n:'Mysuru',lt:12.295,lg:76.639},{n:'Hubballi',lt:15.364,lg:75.124},{n:'Mangaluru',lt:12.914,lg:74.856},{n:'Belagavi',lt:15.849,lg:74.497},{n:'Kalaburagi',lt:17.329,lg:76.834},{n:'Davanagere',lt:14.464,lg:75.921},{n:'Ballari',lt:15.139,lg:76.921},{n:'Tumakuru',lt:13.337,lg:77.117},{n:'Shivamogga',lt:13.929,lg:75.568},{n:'Udupi',lt:13.340,lg:74.742},{n:'Hassan',lt:13.007,lg:76.096}]},
  {code:'KL',name:'Kerala',d:[{n:'Thiruvananthapuram',lt:8.524,lg:76.936},{n:'Kochi',lt:9.931,lg:76.267},{n:'Kozhikode',lt:11.258,lg:75.780},{n:'Thrissur',lt:10.527,lg:76.214},{n:'Kannur',lt:11.874,lg:75.370},{n:'Kollam',lt:8.893,lg:76.614},{n:'Alappuzha',lt:9.498,lg:76.338},{n:'Palakkad',lt:10.786,lg:76.654},{n:'Malappuram',lt:11.051,lg:76.071},{n:'Kottayam',lt:9.591,lg:76.522},{n:'Idukki',lt:9.918,lg:77.102},{n:'Kasaragod',lt:12.499,lg:74.986},{n:'Pathanamthitta',lt:9.264,lg:76.787},{n:'Wayanad',lt:11.685,lg:76.132}]},
  {code:'LA',name:'Ladakh',d:[{n:'Leh',lt:34.152,lg:77.577},{n:'Kargil',lt:34.553,lg:76.134}]},
  {code:'LD',name:'Lakshadweep',d:[{n:'Kavaratti',lt:10.562,lg:72.636},{n:'Andrott',lt:10.816,lg:73.653}]},
  {code:'MP',name:'Madhya Pradesh',d:[{n:'Bhopal',lt:23.259,lg:77.412},{n:'Indore',lt:22.719,lg:75.857},{n:'Jabalpur',lt:23.181,lg:79.986},{n:'Gwalior',lt:26.218,lg:78.182},{n:'Ujjain',lt:23.179,lg:75.784},{n:'Sagar',lt:23.838,lg:78.737},{n:'Rewa',lt:24.536,lg:81.303},{n:'Satna',lt:24.580,lg:80.832},{n:'Dewas',lt:22.967,lg:76.053},{n:'Ratlam',lt:23.331,lg:75.036},{n:'Burhanpur',lt:21.304,lg:76.229},{n:'Katni',lt:23.833,lg:80.400},{n:'Singrauli',lt:24.199,lg:82.674}]},
  {code:'MH',name:'Maharashtra',d:[{n:'Mumbai',lt:19.076,lg:72.877},{n:'Pune',lt:18.520,lg:73.856},{n:'Nagpur',lt:21.145,lg:79.088},{n:'Nashik',lt:20.005,lg:73.789},{n:'Aurangabad',lt:19.876,lg:75.343},{n:'Solapur',lt:17.686,lg:75.906},{n:'Amravati',lt:20.937,lg:77.779},{n:'Kolhapur',lt:16.705,lg:74.243},{n:'Thane',lt:19.218,lg:72.978},{n:'Navi Mumbai',lt:19.033,lg:73.029},{n:'Akola',lt:20.709,lg:77.008},{n:'Latur',lt:18.395,lg:76.560},{n:'Jalgaon',lt:21.007,lg:75.562},{n:'Nanded',lt:19.138,lg:77.321},{n:'Sangli',lt:16.852,lg:74.581}]},
  {code:'MN',name:'Manipur',d:[{n:'Imphal',lt:24.817,lg:93.936},{n:'Churachandpur',lt:24.333,lg:93.673},{n:'Thoubal',lt:24.633,lg:93.998},{n:'Bishnupur',lt:24.620,lg:93.770}]},
  {code:'ML',name:'Meghalaya',d:[{n:'Shillong',lt:25.578,lg:91.893},{n:'Tura',lt:25.514,lg:90.214},{n:'Jowai',lt:25.446,lg:92.200},{n:'Nongstoin',lt:25.519,lg:91.267}]},
  {code:'MZ',name:'Mizoram',d:[{n:'Aizawl',lt:23.730,lg:92.717},{n:'Lunglei',lt:22.888,lg:92.734},{n:'Champhai',lt:23.463,lg:93.320}]},
  {code:'NL',name:'Nagaland',d:[{n:'Kohima',lt:25.670,lg:94.107},{n:'Dimapur',lt:25.904,lg:93.727},{n:'Mokokchung',lt:26.325,lg:94.519}]},
  {code:'OD',name:'Odisha',d:[{n:'Bhubaneswar',lt:20.296,lg:85.824},{n:'Cuttack',lt:20.462,lg:85.882},{n:'Rourkela',lt:22.260,lg:84.853},{n:'Berhampur',lt:19.314,lg:84.794},{n:'Sambalpur',lt:21.466,lg:83.975},{n:'Puri',lt:19.813,lg:85.831},{n:'Balasore',lt:21.493,lg:86.931},{n:'Baripada',lt:21.934,lg:86.728},{n:'Angul',lt:20.840,lg:85.102},{n:'Bhadrak',lt:21.057,lg:86.495}]},
  {code:'PY',name:'Puducherry',d:[{n:'Puducherry',lt:11.941,lg:79.808},{n:'Karaikal',lt:10.925,lg:79.838},{n:'Mahe',lt:11.700,lg:75.533},{n:'Yanam',lt:16.733,lg:82.216}]},
  {code:'PB',name:'Punjab',d:[{n:'Ludhiana',lt:30.901,lg:75.857},{n:'Amritsar',lt:31.634,lg:74.872},{n:'Jalandhar',lt:31.326,lg:75.576},{n:'Patiala',lt:30.339,lg:76.386},{n:'Bathinda',lt:30.211,lg:74.945},{n:'Mohali',lt:30.704,lg:76.717},{n:'Hoshiarpur',lt:31.514,lg:75.911},{n:'Gurdaspur',lt:32.035,lg:75.401},{n:'Moga',lt:30.815,lg:75.173},{n:'Pathankot',lt:32.274,lg:75.652}]},
  {code:'RJ',name:'Rajasthan',d:[{n:'Jaipur',lt:26.912,lg:75.787},{n:'Jodhpur',lt:26.238,lg:73.024},{n:'Kota',lt:25.213,lg:75.864},{n:'Bikaner',lt:28.022,lg:73.311},{n:'Ajmer',lt:26.449,lg:74.639},{n:'Udaipur',lt:24.585,lg:73.712},{n:'Bhilwara',lt:25.347,lg:74.631},{n:'Alwar',lt:27.553,lg:76.634},{n:'Bharatpur',lt:27.215,lg:77.494},{n:'Sikar',lt:27.609,lg:75.139},{n:'Sri Ganganagar',lt:29.911,lg:73.873},{n:'Tonk',lt:26.168,lg:75.789},{n:'Pali',lt:25.771,lg:73.323}]},
  {code:'SK',name:'Sikkim',d:[{n:'Gangtok',lt:27.338,lg:88.606},{n:'Namchi',lt:27.166,lg:88.366},{n:'Mangan',lt:27.515,lg:88.534}]},
  {code:'TN',name:'Tamil Nadu',d:[{n:'Chennai',lt:13.082,lg:80.270},{n:'Coimbatore',lt:11.016,lg:76.955},{n:'Madurai',lt:9.925,lg:78.119},{n:'Tiruchirappalli',lt:10.790,lg:78.704},{n:'Salem',lt:11.664,lg:78.146},{n:'Tirunelveli',lt:8.713,lg:77.756},{n:'Erode',lt:11.341,lg:77.717},{n:'Vellore',lt:12.916,lg:79.132},{n:'Thoothukudi',lt:8.764,lg:78.134},{n:'Tiruppur',lt:11.108,lg:77.341},{n:'Ranipet',lt:12.922,lg:79.332},{n:'Dindigul',lt:10.367,lg:77.980},{n:'Thanjavur',lt:10.787,lg:79.137},{n:'Kancheepuram',lt:12.833,lg:79.700},{n:'Kumbakonam',lt:10.960,lg:79.384}]},
  {code:'TS',name:'Telangana',d:[{n:'Hyderabad',lt:17.385,lg:78.486},{n:'Warangal',lt:17.978,lg:79.594},{n:'Nizamabad',lt:18.672,lg:78.094},{n:'Karimnagar',lt:18.438,lg:79.128},{n:'Khammam',lt:17.247,lg:80.151},{n:'Ramagundam',lt:18.750,lg:79.500},{n:'Nalgonda',lt:17.050,lg:79.267},{n:'Mahbubnagar',lt:16.748,lg:77.987},{n:'Adilabad',lt:19.664,lg:78.532},{n:'Siddipet',lt:18.101,lg:78.852}]},
  {code:'TR',name:'Tripura',d:[{n:'Agartala',lt:23.831,lg:91.286},{n:'Dharmanagar',lt:24.368,lg:92.167},{n:'Udaipur',lt:23.535,lg:91.481},{n:'Belonia',lt:23.250,lg:91.450}]},
  {code:'UP',name:'Uttar Pradesh',d:[{n:'Lucknow',lt:26.846,lg:80.946},{n:'Kanpur',lt:26.449,lg:80.331},{n:'Agra',lt:27.176,lg:78.008},{n:'Varanasi',lt:25.317,lg:82.973},{n:'Prayagraj',lt:25.435,lg:81.846},{n:'Ghaziabad',lt:28.669,lg:77.453},{n:'Noida',lt:28.535,lg:77.391},{n:'Meerut',lt:28.984,lg:77.706},{n:'Gorakhpur',lt:26.760,lg:83.373},{n:'Bareilly',lt:28.367,lg:79.430},{n:'Moradabad',lt:28.838,lg:78.773},{n:'Aligarh',lt:27.897,lg:78.088},{n:'Mathura',lt:27.492,lg:77.673},{n:'Jhansi',lt:25.448,lg:78.568},{n:'Saharanpur',lt:29.964,lg:77.546},{n:'Firozabad',lt:27.157,lg:78.395},{n:'Lakhimpur',lt:27.949,lg:80.782},{n:'Hapur',lt:28.727,lg:77.775}]},
  {code:'UK',name:'Uttarakhand',d:[{n:'Dehradun',lt:30.316,lg:78.032},{n:'Haridwar',lt:29.945,lg:78.164},{n:'Roorkee',lt:29.854,lg:77.888},{n:'Kashipur',lt:29.210,lg:78.964},{n:'Haldwani',lt:29.218,lg:79.513},{n:'Rudrapur',lt:28.977,lg:79.400},{n:'Rishikesh',lt:30.086,lg:78.267},{n:'Kotdwar',lt:29.748,lg:78.524},{n:'Almora',lt:29.597,lg:79.659}]},
  {code:'WB',name:'West Bengal',d:[{n:'Kolkata',lt:22.572,lg:88.363},{n:'Howrah',lt:22.595,lg:88.263},{n:'Durgapur',lt:23.520,lg:87.311},{n:'Asansol',lt:23.688,lg:86.968},{n:'Siliguri',lt:26.727,lg:88.395},{n:'Malda',lt:25.010,lg:88.143},{n:'Murshidabad',lt:24.179,lg:88.267},{n:'Bardhaman',lt:23.232,lg:87.861},{n:'Haldia',lt:22.066,lg:88.058},{n:'Krishnanagar',lt:23.400,lg:88.493},{n:'Barasat',lt:22.722,lg:88.479},{n:'Kharagpur',lt:22.346,lg:87.232},{n:'Jalpaiguri',lt:26.542,lg:88.717},{n:'Balurghat',lt:25.215,lg:88.768},{n:'Bishnupur',lt:23.075,lg:87.320}]},
  {code:'DL',name:'Delhi',d:[{n:'Central Delhi',lt:28.656,lg:77.210},{n:'New Delhi',lt:28.613,lg:77.209},{n:'North Delhi',lt:28.704,lg:77.102},{n:'South Delhi',lt:28.527,lg:77.229},{n:'East Delhi',lt:28.650,lg:77.315},{n:'West Delhi',lt:28.646,lg:77.085},{n:'North East Delhi',lt:28.688,lg:77.295},{n:'North West Delhi',lt:28.722,lg:77.090},{n:'South West Delhi',lt:28.582,lg:77.069},{n:'Shahdara',lt:28.672,lg:77.277}]},
  {code:'JK',name:'Jammu & Kashmir',d:[{n:'Srinagar',lt:34.083,lg:74.797},{n:'Jammu',lt:32.726,lg:74.857},{n:'Anantnag',lt:33.731,lg:75.148},{n:'Baramulla',lt:34.208,lg:74.342},{n:'Sopore',lt:34.299,lg:74.474},{n:'Udhampur',lt:32.915,lg:75.132},{n:'Kathua',lt:32.381,lg:75.516}]},
  {code:'CH',name:'Chandigarh',d:[{n:'Chandigarh',lt:30.733,lg:76.779}]},
  {code:'DD',name:'Dadra & Nagar Haveli and Daman & Diu',d:[{n:'Silvassa',lt:20.276,lg:72.996},{n:'Daman',lt:20.397,lg:72.832},{n:'Diu',lt:20.714,lg:70.992}]},
];

// ── NAME POOLS ────────────────────────────────────────────────────────────────
const FM = ['Rahul','Amit','Arun','Suresh','Ravi','Rajesh','Vijay','Sanjay','Deepak','Mohan','Naveen','Kiran','Vishal','Ankit','Rohit','Prakash','Ajay','Pradeep','Shankar','Mahesh','Ramesh','Ganesh','Dinesh','Satish','Girish','Harish','Naresh','Lokesh','Mukesh','Rakesh','Umesh','Kamlesh','Nitesh','Ritesh','Hitesh','Ramakrishna','Krishnamurthy','Venkatesh','Satheesh','Palanisamy','Murugesan','Rajan','Selvam','Arumugam','Srinivasan','Subramanian','Narayanan','Ramaswamy','Dakshinamurthy','Thirumalai','Annamalai','Periasamy','Kumaravel','Thangavel','Manivel','Arjunan','Bhaskaran','Chandrasekaran','Srinath','Ravichandran','Devendran','Elangovan','Govindarajan','Harikrishnan','Jayakumar','Karuppaswamy','Loganathan','Muthusamy','Nallathambi','Palaniappan','Rajagopalan','Saravanan','Wasim','Aakash','Bharat','Chirag','Divesh','Eshan','Farhan','Gaurav','Hemant','Ishan','Jatin','Karthik','Lalit','Manish','Nikhil','Om','Piyush','Rounak','Sahil','Tarun','Udit','Varun','Yatin','Zaid','Aryan','Brijesh','Chetan','Dhruv','Harsh','Inder','Jayesh','Krunal','Lakshman','Manoj','Nirav','Omkar','Paresh','Roshan','Shyam','Tejas','Uday'];
const FF = ['Priya','Sunita','Kavita','Anita','Rita','Sita','Geeta','Meena','Seema','Reema','Veena','Neena','Leena','Sheena','Heena','Meera','Deepa','Sapna','Sonal','Pooja','Payal','Komal','Kanchan','Pallavi','Shweta','Rekha','Smita','Usha','Asha','Lata','Gita','Sudha','Radha','Madhuri','Savitri','Lalitha','Kamala','Vimala','Nirmala','Saroja','Vijaya','Kavitha','Sumathi','Lekha','Vanitha','Nalini','Vani','Meenakshi','Revathi','Bhavani','Saranya','Lavanya','Divya','Nithya','Ramya','Surya','Sindhu','Renu','Vinitha','Chithra','Ambiga','Suganya','Umadevi','Latha','Jeevitha','Deepalakshmi','Hemalatha','Jaya','Kumari','Malathi','Nandini','Padmini','Parvathi','Rajalakshmi','Rani','Santhi','Tara','Uma','Vasantha','Yamini','Zeenat','Aishwarya','Bhagyalakshmi','Chandra','Devi','Eswari','Fathima','Gayathri','Hema','Indira','Janaki','Kalyani','Lakshmi','Mala','Oviya','Preethi','Sakthi','Thenmozhi','Vennila','Yazhini'];
const LN = ['Kumar','Sharma','Singh','Verma','Gupta','Patel','Shah','Mehta','Jain','Agarwal','Mishra','Pandey','Tiwari','Shukla','Dubey','Yadav','Chauhan','Rajput','Thakur','Choudhary','Das','Dey','Ghosh','Bose','Chatterjee','Banerjee','Mukherjee','Sen','Roy','Saha','Mandal','Nandi','Biswas','Paul','Mondal','Nath','Kundu','Mitra','Chakraborty','Bhattacharya','Reddy','Rao','Naidu','Pillai','Nair','Menon','Iyer','Iyengar','Krishnan','Subramanian','Swaminathan','Gowda','Hegde','Shetty','Kamath','Bhat','Desai','Joshi','Kulkarni','Deshpande','Patil','More','Jadhav','Shinde','Bhosale','Kamble','Sawant','Pawar','Gaikwad','Khan','Shaikh','Ansari','Siddiqui','Qureshi','Malik','Ahmed','Hussain','Lal','Ram','Srivastava','Bajpai','Tripathi','Dwivedi','Chaturvedi','Awasthi','Saxena','Mathur','Bhatnagar','Rastogi','Garg','Bansal','Goyal','Aggarwal','Mittal','Singhal','Khandelwal'];

// Vehicle data
const V_ECONOMY=['Swift Dzire','Alto K10','WagonR','Celerio','S-Presso','Kwid','Datsun Go','Ignis'];
const V_PREMIUM=['Honda City','Hyundai Verna','Maruti Ciaz','Toyota Etios','VW Vento','Tata Tigor','Skoda Rapid'];
const V_XL=['Maruti Ertiga','Toyota Innova','Kia Carens','Mahindra Marazzo','Renault Triber'];
const V_MOTO=['Honda Activa','TVS Jupiter','Bajaj Pulsar 150','Hero Splendor Plus','Suzuki Access','Yamaha FZ S'];
const V_AUTO=['Bajaj RE','Piaggio Ape','TVS King','Mahindra Treo','OSM Rage+'];
const V_TOTO=['Mayuri E-Rickshaw','Saarthi EV','Lohia Humrahi','YC Electric','Goenka Passenger EV'];
const V_EV=['Tata Nexon EV','Tata Tigor EV','MG ZS EV','Ola S1 Pro','Hyundai Kona Electric'];
const VMOD={ECONOMY:V_ECONOMY,PREMIUM:V_PREMIUM,XL:V_XL,MOTO:V_MOTO,AUTO:V_AUTO,TOTO:V_TOTO,EV:V_EV};
const CATS=['ECONOMY','PREMIUM','XL','MOTO','AUTO','TOTO','EV'];
const CAT_W=[40,15,12,18,8,5,2];
const PAYS=['UPI','CASH','CARD','WALLET','CORPORATE'];
const PAY_W=[45,25,18,10,2];
const STATUSES=['AVAILABLE','ON_RIDE','OFFLINE','BREAK'];
const ST_W=[45,35,15,5];
const COLORS=['White','Silver','Black','Grey','Red','Blue','Yellow-Black','Green','Teal Blue','Pearl White'];
const CANCEL_R=['Driver took too long','Changed plans','Wrong destination','Found cheaper option','Driver asked to cancel','Unable to locate driver','Booked by mistake'];
const LANDMARKS=['Railway Station','Airport','Bus Stand','Shopping Mall','Hospital','Tech Park','University Gate','Market Area','Metro Station','Hotel Lobby','Government Office','College Campus','Industrial Area','Cinema Hall','Stadium','Temple','Park Entrance','Residential Colony'];

console.log('Generating 100,000 users...');
const USERS=[];
for(let i=0;i<100000;i++){
  const isF=rng()<0.42;
  const first=pick(isF?FF:FM), last=pick(LN);
  const state=pick(STATES), dist=pick(state.d);
  const rides=ri(0,850), rating=rides===0?null:+rf(3.2,5.0).toFixed(1);
  USERS.push({
    id:`U${String(i+1).padStart(6,'0')}`,
    name:`${first} ${last}`, email:genEmail(first,last), phone:genPhone(),
    gender:isF?'F':'M', role:'USER', rating, totalRides:rides,
    joinedAt:new Date(Date.now()-ri(7,1200)*86400000).toISOString().slice(0,10),
    isActive:rng()<0.78, isVerified:rng()<0.91,
    preferredPayment:weightedPick(PAYS,PAY_W),
    state:state.name, stateCode:state.code, city:dist.n,
    homeLocation:{lat:jitter(dist.lt,8),lng:jitter(dist.lg,8)},
    emergencyContact:rng()<0.65?{name:`${pick(isF?FM:FF)} ${last}`,phone:genPhone(),relation:pick(['Mother','Father','Spouse','Sibling','Friend','Colleague'])}:null,
  });
}
console.log('  Done:',USERS.length,'users');

console.log('Generating 1,200 drivers...');
const DRIVERS=[];
const KGP=[
  {name:'Subhash Mondal',phone:'+91 94340 12891',sc:'WB',d:{n:'Kharagpur',lt:22.319,lg:87.304},cat:'TOTO',mk:'Mayuri',mo:'Campus E-Rickshaw (Toto)',pl:'WB 29 AB 1042',rt:4.92,rd:4120,te:820,tr:18},
  {name:'Bikas Ghosh',phone:'+91 98321 44589',sc:'WB',d:{n:'Kharagpur',lt:22.317,lg:87.309},cat:'AUTO',mk:'Bajaj',mo:'Campus Auto Rickshaw',pl:'WB 29 CD 3918',rt:4.85,rd:2890,te:1150,tr:14},
  {name:'Anup Das',phone:'+91 97335 88120',sc:'WB',d:{n:'Kharagpur',lt:22.339,lg:87.322},cat:'ECONOMY',mk:'Maruti',mo:'Swift Dzire Tour',pl:'WB 29 EF 5821',rt:4.88,rd:3410,te:2400,tr:7},
  {name:'Tapan Roy',phone:'+91 96472 31908',sc:'WB',d:{n:'Kharagpur',lt:22.315,lg:87.305},cat:'TOTO',mk:'Yatri',mo:'Campus Electric Toto',pl:'WB 29 GH 7190',rt:4.94,rd:5120,te:940,tr:21},
  {name:'Raju Toto',phone:'+91 95123 45678',sc:'WB',d:{n:'Kharagpur',lt:22.316,lg:87.306},cat:'TOTO',mk:'Mayuri',mo:'Campus E-Rickshaw (Toto)',pl:'WB 29 KL 2211',rt:4.78,rd:2100,te:680,tr:15},
];

function mkDrv(idx,name,phone,sc,d,cat,mk,mo,pl,rt,rd,te,tr){
  const st=STATES.find(s=>s.code===sc)||STATES[0];
  const oMs=ri(1800000,28800000);
  const status=weightedPick(STATUSES,ST_W);
  return {
    id:`D${String(idx+1).padStart(5,'0')}`,
    name, phone, gender:rng()<0.08?'F':'M',
    state:st.name, stateCode:sc, city:d.n, region:d.n, status,
    rating:rt, totalRides:rd,
    acceptanceRate:ri(82,99), cancellationRate:+rf(0.5,6.0).toFixed(1),
    vehicle:{make:mk,model:mo,plate:pl,year:ri(2018,2025),color:pick(COLORS),category:cat,
      seats:cat==='MOTO'?1:cat==='AUTO'||cat==='TOTO'?ri(3,4):cat==='XL'?ri(5,7):4,
      fuelType:cat==='EV'||cat==='TOTO'?'ELECTRIC':cat==='MOTO'?pick(['PETROL','CNG']):pick(['PETROL','DIESEL','CNG'])},
    location:{lat:jitter(d.lt,12),lng:jitter(d.lg,12)},
    speed:status==='ON_RIDE'?ri(18,55):0, heading:ri(0,359),
    lastUpdated:new Date().toISOString(),
    onlineSince:new Date(Date.now()-oMs).toISOString(),
    todayEarnings:te, todayRides:tr, todayOnlineMin:Math.round(oMs/60000),
    performanceScore:Math.min(100,Math.round(rt*20-ri(0,5))),
    safetyScore:Math.min(100,Math.round(rt*20+ri(0,3))),
    punctualityScore:Math.min(100,Math.round(rt*20-ri(0,7))),
    documents:[
      {type:'LICENSE',status:rng()<0.95?'VERIFIED':'PENDING',expiresAt:`${ri(2026,2030)}-${ri(1,12).toString().padStart(2,'0')}-01`},
      {type:'INSURANCE',status:rng()<0.92?'VERIFIED':'PENDING',expiresAt:`${ri(2025,2028)}-${ri(1,12).toString().padStart(2,'0')}-01`},
      {type:'REGISTRATION',status:'VERIFIED'},
      {type:'BACKGROUND_CHECK',status:rng()<0.97?'VERIFIED':'PENDING'},
      {type:'POLLUTION_CERT',status:rng()<0.89?'VERIFIED':'EXPIRED'},
    ],
    bankAccount:{upiId:`${name.split(' ')[0].toLowerCase()}${ri(100,9999)}@${pick(['okicici','oksbi','okhdfcbank','paytm','ybl'])}`,settledToday:+rf(0,te*0.88).toFixed(2)},
  };
}

KGP.forEach((k,i)=>DRIVERS.push(mkDrv(i,k.name,k.phone,k.sc,k.d,k.cat,k.mk,k.mo,k.pl,k.rt,k.rd,k.te,k.tr)));
for(let i=KGP.length;i<1200;i++){
  const state=pick(STATES), dist=pick(state.d);
  const isF=rng()<0.07;
  const first=pick(isF?FF:FM), last=pick(LN);
  const cat=weightedPick(CATS,CAT_W);
  const mo=pick(VMOD[cat]||V_ECONOMY);
  DRIVERS.push(mkDrv(i,`${first} ${last}`,genPhone(),state.code,dist,cat,pick(['Maruti','Honda','Hyundai','Tata','Mahindra','Bajaj','TVS','Hero']),mo,genPlate(state.code),+rf(3.5,5.0).toFixed(2),ri(50,8000),ri(0,28)*ri(60,320),ri(0,28)));
}
console.log('  Done:',DRIVERS.length,'drivers');

console.log('Generating 500,000 ride records (this takes ~30s)...');
const ALL_RIDES=[];
const UIDS=USERS.map(u=>u.id);
const DIDS=DRIVERS.map(d=>d.id);
const RIDE_ST=['RIDE_COMPLETED','RIDE_COMPLETED','RIDE_COMPLETED','RIDE_COMPLETED','CANCELLED','DRIVER_APPROACHING','RIDE_STARTED'];
const RIDE_STW=[55,55,55,55,15,3,2];

for(let i=0;i<500000;i++){
  const uid=pick(UIDS), did=pick(DIDS);
  const drv=DRIVERS.find(d=>d.id===did);
  const usr=USERS.find(u=>u.id===uid);
  const st=STATES.find(s=>s.code===(usr?.stateCode||'MH'))||STATES[0];
  const dist=pick(st.d);
  const status=weightedPick(RIDE_ST,RIDE_STW);
  const cat=drv?.vehicle?.category||weightedPick(CATS,CAT_W);
  const BASE={ECONOMY:40,PREMIUM:80,XL:70,MOTO:20,AUTO:30,TOTO:20,EV:60};
  const PER={ECONOMY:12,PREMIUM:18,XL:16,MOTO:8,AUTO:10,TOTO:8,EV:15};
  const bf=BASE[cat]||40, pKm=PER[cat]||12;
  const dKm=+rf(0.8,45).toFixed(1);
  const surge=rng()<0.12?ri(10,80):0;
  const discount=rng()<0.2?ri(5,50):0;
  const sub=bf+Math.round(dKm*pKm)+Math.round(dKm*1.2)+surge;
  const tax=+(sub*0.05).toFixed(2);
  const total=+(sub+tax-discount).toFixed(2);
  const msAgo=ri(0,730)*86400000+ri(0,23)*3600000;
  const reqAt=new Date(Date.now()-msAgo).toISOString();
  const lat1=jitter(dist.lt,10),lng1=jitter(dist.lg,10);
  const lat2=jitter(dist.lt,12),lng2=jitter(dist.lg,12);
  ALL_RIDES.push({
    id:`R${String(i+1).padStart(7,'0')}`,
    userId:uid, driverId:did, status, category:cat,
    pickup:{lat:lat1,lng:lng1,address:`${pick(LANDMARKS)}, ${dist.n}, ${st.name}`,name:`${dist.n} ${pick(LANDMARKS)}`},
    destination:{lat:lat2,lng:lng2,address:`${pick(LANDMARKS)}, ${dist.n}, ${st.name}`,name:`${dist.n} ${pick(LANDMARKS)}`},
    fare:{base:bf,distanceCharge:Math.round(dKm*pKm),timeCharge:Math.round(dKm*1.2),surge,discount,tax,total,currency:'INR'},
    payment:{id:`PAY${String(i+1).padStart(7,'0')}`,method:weightedPick(PAYS,PAY_W),status:status==='RIDE_COMPLETED'?'COMPLETED':status==='CANCELLED'?'VOID':'PENDING',amount:total,currency:'INR',tip:status==='RIDE_COMPLETED'&&rng()<0.18?ri(10,100):0},
    distance:dKm,duration:Math.round(dKm*2.8+ri(2,8)),
    requestedAt:reqAt,
    ...(status!=='CANCELLED'?{acceptedAt:new Date(Date.now()-msAgo+ri(20000,90000)).toISOString()}:{}),
    ...(status==='RIDE_COMPLETED'||status==='RIDE_STARTED'?{startedAt:new Date(Date.now()-msAgo+ri(90000,600000)).toISOString()}:{}),
    ...(status==='RIDE_COMPLETED'?{completedAt:new Date(Date.now()-msAgo+Math.round(dKm*120000)).toISOString(),userRating:ri(3,5),driverRating:ri(3,5)}:{}),
    ...(status==='CANCELLED'?{cancelledAt:new Date(Date.now()-msAgo+ri(20000,300000)).toISOString(),cancellationReason:pick(CANCEL_R)}:{}),
    driverInfo:drv?{name:drv.name,phone:drv.phone,vehicle:`${drv.vehicle.make} ${drv.vehicle.model}`,plate:drv.vehicle.plate,rating:drv.rating}:undefined,
    state:st.name, stateCode:st.code, district:dist.n,
    isScheduled:rng()<0.04, isSplitFare:rng()<0.06,
  });
  if((i+1)%100000===0)process.stdout.write(`  ${i+1}/500000...\n`);
}
console.log('  Done:',ALL_RIDES.length,'rides');

// Analytics
console.log('Generating analytics...');
const mkH=(base,peaks=[8,9,18,19,20])=>Array.from({length:24},(_,h)=>({hour:h,label:`${h.toString().padStart(2,'0')}:00`,value:Math.round(base*(peaks.includes(h)?1.7+rng()*0.5:0.4+rng()*0.5))}));
const mkS=(days,base,trend=0)=>Array.from({length:days},(_,i)=>{const d=new Date(Date.now()-(days-1-i)*86400000);const wb=[0,6].includes(d.getDay())?1.25:1;return{date:d.toISOString().slice(0,10),label:d.toLocaleDateString('en-IN',{month:'short',day:'numeric'}),value:Math.round((base+trend*i)*wb*(0.82+rng()*0.36))};});

const stMap={};ALL_RIDES.forEach(r=>{stMap[r.stateCode]=(stMap[r.stateCode]||0)+1;});
const ANALYTICS={
  summary:{totalUsers:USERS.length,totalDrivers:DRIVERS.length,totalRides:ALL_RIDES.length,completedRides:ALL_RIDES.filter(r=>r.status==='RIDE_COMPLETED').length,cancelledRides:ALL_RIDES.filter(r=>r.status==='CANCELLED').length,activeRides:ALL_RIDES.filter(r=>r.status==='RIDE_STARTED'||r.status==='DRIVER_APPROACHING').length,totalGMV:+ALL_RIDES.filter(r=>r.status==='RIDE_COMPLETED').reduce((s,r)=>s+r.fare.total,0).toFixed(2),onlineDrivers:DRIVERS.filter(d=>d.status!=='OFFLINE').length,availableDrivers:DRIVERS.filter(d=>d.status==='AVAILABLE').length,statesActive:STATES.length,districtsActive:STATES.reduce((s,st)=>s+st.d.length,0)},
  todayStats:{totalRides:ri(3200,4800),revenue:ri(480000,780000),activeUsers:ri(8400,14200),onlineDrivers:DRIVERS.filter(d=>d.status!=='OFFLINE').length,availableDrivers:DRIVERS.filter(d=>d.status==='AVAILABLE').length,activeRides:DRIVERS.filter(d=>d.status==='ON_RIDE').length,avgETA:+rf(3.2,5.8).toFixed(1),cancellationRate:+rf(5.5,8.2).toFixed(1),surgeZones:ri(2,8),openIncidents:ri(1,6)},
  rideVolume:mkS(90,3200,18),revenue:mkS(90,520000,5500),activeUsers:mkS(90,9800,80),driverUtilization:mkS(90,68,0.15),avgETA:mkS(90,4.6,-0.01),cancellationRate:mkS(90,7.1,-0.04),driverSupply:mkS(90,780,1.5),platformCommission:mkS(90,104000,1100),peakHours:mkH(320),
  demandByState:STATES.map(s=>({state:s.name,stateCode:s.code,demand:stMap[s.code]||0,supply:DRIVERS.filter(d=>d.stateCode===s.code).length,revenue:Math.round((stMap[s.code]||0)*142)})).sort((a,b)=>b.demand-a.demand),
  categoryBreakdown:CATS.map(c=>{const cr=ALL_RIDES.filter(r=>r.category===c);return{category:c,rides:cr.length,revenue:cr.reduce((s,r)=>s+r.fare.total,0),share:+((cr.length/ALL_RIDES.length)*100).toFixed(1),avgFare:cr.length?+(cr.reduce((s,r)=>s+r.fare.total,0)/cr.length).toFixed(2):0};}),
};

// Write files
const OUT=path.resolve(__dirname,'../frontend/src/mock');
function writeESM(fname,expName,data){
  const filePath=path.join(OUT,fname);
  const json=JSON.stringify(data,null,0);
  let extra='';
  if(fname==='users.js') extra='\nexport const CURRENT_USER = MOCK_USERS[0];\n';
  if(fname==='drivers.js') extra='\nexport const CURRENT_DRIVER = MOCK_DRIVERS[0];\n';
  if(fname==='rides.js') extra='\nexport const ACTIVE_RIDE = MOCK_RIDES.find(r => r.status === \'DRIVER_APPROACHING\') || MOCK_RIDES[0];\n';
  const content=`// AUTO-GENERATED \u2013 do not edit. Re-run: node scripts/generate_india_mock.js\n// Generated: ${new Date().toISOString()} | Records: ${Array.isArray(data)?data.length:'object'}\nexport const ${expName} = ${json};${extra}`;
  fs.writeFileSync(filePath,content,'utf8');
  const kb=(Buffer.byteLength(content)/1024).toFixed(1);
  console.log(`  ${fname} (${kb} KB)`);
}

writeESM('users.js',     'MOCK_USERS',     USERS.slice(0,500));
writeESM('users_all.js', 'ALL_USERS',      USERS);
writeESM('drivers.js',   'MOCK_DRIVERS',   DRIVERS);
writeESM('rides.js',     'MOCK_RIDES',     ALL_RIDES.slice(0,1000));
writeESM('rides_all.js', 'ALL_RIDES',      ALL_RIDES);
writeESM('analytics.js', 'MOCK_ANALYTICS', ANALYTICS);

// Incidents
const DIDS2=DRIVERS.map(d=>d.id);
const UIDS2=USERS.map(u=>u.id);
const INC=Array.from({length:80},(_,i)=>({id:`INC${String(i+1).padStart(4,'0')}`,type:pick(['UNSAFE_DRIVING','ROUTE_DEVIATION','SOS_TRIGGERED','PASSENGER_COMPLAINT','DRIVER_COMPLAINT','PAYMENT_DISPUTE','OTP_MISMATCH','VEHICLE_BREAKDOWN']),rideId:pick(ALL_RIDES.slice(0,500)).id,userId:pick(UIDS2),driverId:pick(DIDS2),status:pick(['OPEN','INVESTIGATING','RESOLVED','CLOSED']),priority:pick(['LOW','MEDIUM','HIGH','CRITICAL']),description:pick(['Driver deviated from set route','Passenger reported rude behavior','SOS triggered by passenger','Payment dispute after completion','Driver refused OTP start','Vehicle broke down mid-ride','Surge fare dispute','Wrong pickup confirmed by OTP']),createdAt:new Date(Date.now()-ri(0,7)*86400000).toISOString(),resolvedAt:rng()<0.6?new Date(Date.now()-ri(0,3)*86400000).toISOString():null}));
writeESM('incidents.js', 'MOCK_INCIDENTS', INC);

// Pricing
writeESM('pricing.js', 'MOCK_PRICING', {baseFares:{ECONOMY:40,PREMIUM:80,XL:70,MOTO:20,AUTO:30,TOTO:20,EV:60},perKmRates:{ECONOMY:12,PREMIUM:18,XL:16,MOTO:8,AUTO:10,TOTO:8,EV:15},perMinRates:{ECONOMY:1.5,PREMIUM:2.5,XL:2,MOTO:1,AUTO:1.2,TOTO:1,EV:2},platformCommission:0.12,gst:0.05,cancellationFee:{ECONOMY:25,PREMIUM:50,XL:40,MOTO:10,AUTO:15,TOTO:10,EV:40},peakSurge:{maxMultiplier:2.0,surgeThreshold:0.7,cooldown:900},minimumFare:{ECONOMY:40,PREMIUM:80,XL:70,MOTO:20,AUTO:25,TOTO:20,EV:60}});

// Mock index
fs.writeFileSync(path.join(OUT,'index.js'),`// AUTO-GENERATED mock data index\nexport { MOCK_USERS, CURRENT_USER } from './users.js';\nexport { ALL_USERS } from './users_all.js';\nexport { MOCK_DRIVERS, CURRENT_DRIVER } from './drivers.js';\nexport { MOCK_RIDES, ACTIVE_RIDE } from './rides.js';\nexport { ALL_RIDES } from './rides_all.js';\nexport { MOCK_ANALYTICS } from './analytics.js';\nexport { MOCK_INCIDENTS } from './incidents.js';\nexport { MOCK_PRICING } from './pricing.js';\n`,'utf8');

console.log('\n✅ Generation complete!');
console.log(`   Users:     ${USERS.length.toLocaleString()}`);
console.log(`   Drivers:   ${DRIVERS.length.toLocaleString()}`);
console.log(`   Rides:     ${ALL_RIDES.length.toLocaleString()}`);
console.log(`   States:    ${STATES.length}`);
console.log(`   Districts: ${STATES.reduce((s,st)=>s+st.d.length,0)}`);
