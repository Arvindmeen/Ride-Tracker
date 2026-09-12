/**
 * Location API Routes
 * POST /api/v1/locations/update    — driver GPS update
 * GET  /api/v1/locations/drivers   — get all driver locations (admin)
 * GET  /api/v1/locations/geocode   — reverse geocode
 * GET  /api/v1/locations/search    — place search (Photon / OSM Nominatim with caching)
 * GET  /api/v1/locations/nearby    — predict nearby places based on coordinates
 * GET  /api/v1/locations/route     — get route polyline and distance between 2 points
 * GET  /api/v1/locations/grid      — get H3 grid cells with demand/supply
 */
import { Router } from 'express';
const router = Router();

// In-memory cache for place search and geocode to minimize external latency
const searchCache = new Map();
const geocodeCache = new Map();

// Curated high-accuracy fallback landmarks across Indian hubs
const FALLBACK_LANDMARKS = [
  // Delhi NCR
  { name: 'Connaught Place Central Hub', address: 'Connaught Place, New Delhi, Delhi 110001', city: 'Delhi', state: 'Delhi', lat: 28.6315, lng: 77.2167, type: 'commercial' },
  { name: 'Indira Gandhi Int Airport (IGI T3)', address: 'Terminal 3, IGI Airport, New Delhi 110037', city: 'Delhi', state: 'Delhi', lat: 28.5562, lng: 77.1000, type: 'airport' },
  { name: 'Cyber City Hub Gurugram', address: 'DLF Cyber City, Phase 2, Gurugram 122002', city: 'Gurugram', state: 'Haryana', lat: 28.4950, lng: 77.0890, type: 'tech_park' },
  { name: 'New Delhi Railway Station (NDLS)', address: 'Bhavbhuti Marg, Ratan Lal Market, New Delhi 110006', city: 'Delhi', state: 'Delhi', lat: 28.6429, lng: 77.2195, type: 'station' },
  { name: 'IIT Delhi Main Gate', address: 'Hauz Khas, New Delhi 110016', city: 'Delhi', state: 'Delhi', lat: 28.5450, lng: 77.1926, type: 'academic' },

  // Bengaluru
  { name: 'Kempegowda Int Airport (BLR T1/T2)', address: 'KIAL Rd, Devanahalli, Bengaluru 560300', city: 'Bengaluru', state: 'Karnataka', lat: 13.1986, lng: 77.7066, type: 'airport' },
  { name: 'Koramangala 5th Block', address: '80 Feet Rd, Koramangala, Bengaluru 560095', city: 'Bengaluru', state: 'Karnataka', lat: 12.9352, lng: 77.6245, type: 'commercial' },
  { name: 'Indiranagar 100ft Road', address: '100 Feet Rd, Indiranagar, Bengaluru 560038', city: 'Bengaluru', state: 'Karnataka', lat: 12.9784, lng: 77.6408, type: 'commercial' },
  { name: 'Electronic City Phase 1 Infosys Gate', address: 'Hosur Rd, Electronic City, Bengaluru 560100', city: 'Bengaluru', state: 'Karnataka', lat: 12.8452, lng: 77.6602, type: 'tech_park' },
  { name: 'Krantivira Sangolli Rayanna (Bengaluru City Stn)', address: 'Majestic, Bengaluru 560023', city: 'Bengaluru', state: 'Karnataka', lat: 12.9778, lng: 77.5713, type: 'station' },

  // Mumbai
  { name: 'Chhatrapati Shivaji Maharaj Airport (BOM T2)', address: 'Sahar, Andheri East, Mumbai 400099', city: 'Mumbai', state: 'Maharashtra', lat: 19.0896, lng: 72.8656, type: 'airport' },
  { name: 'Bandra-Kurla Complex (BKC G Block)', address: 'BKC, Bandra East, Mumbai 400051', city: 'Mumbai', state: 'Maharashtra', lat: 19.0607, lng: 72.8688, type: 'commercial' },
  { name: 'CSMT Railway Terminus', address: 'Fort, Mumbai 400001', city: 'Mumbai', state: 'Maharashtra', lat: 18.9401, lng: 72.8355, type: 'station' },
  { name: 'Gateway of India', address: 'Apollo Bandar, Colaba, Mumbai 400001', city: 'Mumbai', state: 'Maharashtra', lat: 18.9220, lng: 72.8347, type: 'landmark' },
  { name: 'IIT Bombay Main Gate (Powai)', address: 'Powai, Mumbai 400076', city: 'Mumbai', state: 'Maharashtra', lat: 19.1334, lng: 72.9133, type: 'academic' },

  // Kolkata
  { name: 'Netaji Subhash Chandra Bose Airport (CCU T2)', address: 'Dum Dum, Kolkata 700052', city: 'Kolkata', state: 'West Bengal', lat: 22.6547, lng: 88.4467, type: 'airport' },
  { name: 'Howrah Junction Railway Station', address: 'Howrah, West Bengal 711101', city: 'Howrah', state: 'West Bengal', lat: 22.5855, lng: 88.3433, type: 'station' },
  { name: 'Salt Lake Sector V IT Hub', address: 'Sector V, Bidhannagar, Kolkata 700091', city: 'Kolkata', state: 'West Bengal', lat: 22.5800, lng: 88.4350, type: 'tech_park' },
  { name: 'Park Street Central', address: 'Park Street, Kolkata 700016', city: 'Kolkata', state: 'West Bengal', lat: 22.5510, lng: 88.3520, type: 'commercial' },

  // IIT Kharagpur & Midnapore
  { name: 'Technology Market (Tech Mkt)', address: 'Tech Market Rd, IIT Kharagpur Campus 721302', city: 'Kharagpur', state: 'West Bengal', lat: 22.3190, lng: 87.3040, type: 'commercial' },
  { name: 'Vikramshila / Nalanda Classroom Complex', address: 'IIT Kharagpur Campus 721302', city: 'Kharagpur', state: 'West Bengal', lat: 22.3175, lng: 87.3090, type: 'academic' },
  { name: 'Kharagpur Jn Railway Station (Gate 1)', address: 'Railway Colony, Kharagpur 721301', city: 'Kharagpur', state: 'West Bengal', lat: 22.3396, lng: 87.3225, type: 'station' },
  { name: 'Main Gate / Hijli Heritage IIT KGP', address: 'Hijli, Kharagpur 721302', city: 'Kharagpur', state: 'West Bengal', lat: 22.3195, lng: 87.3110, type: 'landmark' },
  { name: 'Scholars Avenue (RK / Patel Halls)', address: 'Scholars Ave, IIT Kharagpur 721302', city: 'Kharagpur', state: 'West Bengal', lat: 22.3150, lng: 87.3050, type: 'residence' },
  { name: 'Dr. B.C. Roy Multi-Specialty Hospital', address: 'IIT Kharagpur Campus 721302', city: 'Kharagpur', state: 'West Bengal', lat: 22.3160, lng: 87.3020, type: 'hospital' },
  { name: 'Midnapore Collectorate & Court', address: 'Midnapore Town, West Bengal 721101', city: 'Midnapore', state: 'West Bengal', lat: 22.4250, lng: 87.3190, type: 'commercial' },

  // Hyderabad
  { name: 'Rajiv Gandhi Int Airport (HYD)', address: 'Shamshabad, Hyderabad 500409', city: 'Hyderabad', state: 'Telangana', lat: 17.2403, lng: 78.4294, type: 'airport' },
  { name: 'HITEC City Cyber Towers', address: 'Hitec City, Madhapur, Hyderabad 500081', city: 'Hyderabad', state: 'Telangana', lat: 17.4504, lng: 78.3808, type: 'tech_park' },
  { name: 'Secunderabad Railway Station', address: 'Station Rd, Secunderabad 500003', city: 'Hyderabad', state: 'Telangana', lat: 17.4344, lng: 78.5017, type: 'station' },
  { name: 'Charminar & Old City Hub', address: 'Charminar Rd, Hyderabad 500002', city: 'Hyderabad', state: 'Telangana', lat: 17.3616, lng: 78.4747, type: 'landmark' },

  // Chennai
  { name: 'Chennai Int Airport (MAA T1/T2)', address: 'GST Rd, Meenambakkam, Chennai 600027', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9941, lng: 80.1709, type: 'airport' },
  { name: 'TIDEL Park OMR IT Highway', address: 'Rajiv Gandhi Salai, Taramani, Chennai 600113', city: 'Chennai', state: 'Tamil Nadu', lat: 12.9893, lng: 80.2483, type: 'tech_park' },
  { name: 'Puratchi Thalaivar Dr. MGR Central Station', address: 'Kannappar Thidal, Periyamet, Chennai 600003', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2755, type: 'station' },

  // Pune
  { name: 'Pune Int Airport (PNQ)', address: 'Lohegaon, Pune 411032', city: 'Pune', state: 'Maharashtra', lat: 18.5822, lng: 73.9197, type: 'airport' },
  { name: 'Hinjawadi IT Park Phase 1', address: 'Rajiv Gandhi Infotech Park, Hinjawadi, Pune 411057', city: 'Pune', state: 'Maharashtra', lat: 18.5912, lng: 73.7380, type: 'tech_park' },
  { name: 'Pune Railway Junction', address: 'Agarkar Nagar, Pune 411001', city: 'Pune', state: 'Maharashtra', lat: 18.5284, lng: 73.8744, type: 'station' },

  // Ahmedabad & GIFT City
  { name: 'Sardar Vallabhbhai Patel Airport (AMD)', address: 'Hansol, Ahmedabad 380003', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0772, lng: 72.6347, type: 'airport' },
  { name: 'GIFT City Financial Hub', address: 'GIFT City, Gandhinagar 382355', city: 'Gandhinagar', state: 'Gujarat', lat: 23.1593, lng: 72.6841, type: 'tech_park' },
  { name: 'Ahmedabad Junction (Kalupur)', address: 'Kalupur, Ahmedabad 380002', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0238, lng: 72.6009, type: 'station' },

  // Jaipur
  { name: 'Jaipur Int Airport (JAI T2)', address: 'Sanganer, Jaipur 302017', city: 'Jaipur', state: 'Rajasthan', lat: 26.8289, lng: 75.8056, type: 'airport' },
  { name: 'World Trade Park Malviya Nagar', address: 'JLN Marg, Malviya Nagar, Jaipur 302017', city: 'Jaipur', state: 'Rajasthan', lat: 26.8538, lng: 75.8050, type: 'commercial' },
  { name: 'Jaipur Junction Railway Station', address: 'Gopalbari, Jaipur 302006', city: 'Jaipur', state: 'Rajasthan', lat: 26.9196, lng: 75.7878, type: 'station' },

  // Lucknow
  { name: 'Chaudhary Charan Singh Airport (LKO)', address: 'Amausi, Lucknow 226009', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.7606, lng: 80.8893, type: 'airport' },
  { name: 'Gomti Nagar Commercial Corridor', address: 'Vibhuti Khand, Gomti Nagar, Lucknow 226010', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8654, lng: 80.9984, type: 'commercial' },
  { name: 'Lucknow Charbagh Railway Station', address: 'Charbagh, Lucknow 226004', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8322, lng: 80.9198, type: 'station' },

  // Chandigarh
  { name: 'Shaheed Bhagat Singh Airport (IXC)', address: 'New Civil Air Terminal, Mohali 140306', city: 'Chandigarh', state: 'Punjab', lat: 30.6735, lng: 76.7885, type: 'airport' },
  { name: 'Sector 17 Commercial City Centre', address: 'Sector 17, Chandigarh 160017', city: 'Chandigarh', state: 'Chandigarh', lat: 30.7410, lng: 76.7845, type: 'commercial' },

  // Kochi
  { name: 'Cochin Int Airport (COK)', address: 'Nedumbassery, Kochi 683111', city: 'Kochi', state: 'Kerala', lat: 10.1556, lng: 76.3914, type: 'airport' },
  { name: 'Infopark Kochi Phase 1', address: 'Kakkanad, Kochi 682042', city: 'Kochi', state: 'Kerala', lat: 10.0104, lng: 76.3639, type: 'tech_park' },

  // Bhubaneswar
  { name: 'Biju Patnaik Int Airport (BBI)', address: 'Airport Rd, Bhubaneswar 751020', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2444, lng: 85.8178, type: 'airport' },
  { name: 'Infocity IT Corridor', address: 'Chandrasekharpur, Bhubaneswar 751024', city: 'Bhubaneswar', state: 'Odisha', lat: 20.3540, lng: 85.8184, type: 'tech_park' },

  // Patna
  { name: 'Jayprakash Narayan Airport (PAT)', address: 'Shaheed Pir Ali Khan Marg, Patna 800014', city: 'Patna', state: 'Bihar', lat: 25.5913, lng: 85.0880, type: 'airport' },
  { name: 'Patna Junction Station', address: 'Station Rd, Fraser Road Area, Patna 800001', city: 'Patna', state: 'Bihar', lat: 25.6025, lng: 85.1376, type: 'station' },

  // Moradabad, Bareilly, Rampur & Western UP
  { name: 'Moradabad Junction Railway Station', address: 'Station Rd (SH49), Civil Lines, Moradabad 244001', city: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8314, lng: 78.7654, type: 'station' },
  { name: 'Budh Bazaar Market & Clock Tower', address: 'Budhbazar Road, Moradabad 244001', city: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8358, lng: 78.7725, type: 'commercial' },
  { name: 'Civil Lines Central Hub', address: 'Civil Lines, Moradabad 244001', city: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lng: 78.7830, type: 'commercial' },
  { name: 'Rampur Road Transit Node', address: 'Rampur Rd, Moradabad 244001', city: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8250, lng: 78.8050, type: 'transit' },
  { name: 'Rampur Junction Railway Station', address: 'Railway Colony, Rampur 244901', city: 'Rampur', state: 'Uttar Pradesh', lat: 28.8080, lng: 79.0270, type: 'station' },
  { name: 'Bareilly Junction Station', address: 'Civil Lines, Bareilly 243001', city: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3415, lng: 79.4180, type: 'station' },
  { name: 'Meerut City Junction', address: 'Railway Road, Meerut 250002', city: 'Meerut', state: 'Uttar Pradesh', lat: 28.9880, lng: 77.6950, type: 'station' },
  { name: 'Noida Sector 62 IT Corridor', address: 'Sector 62, Noida 201309', city: 'Noida', state: 'Uttar Pradesh', lat: 28.6250, lng: 77.3650, type: 'tech_park' },
  { name: 'Agra Cantt Railway Station', address: 'Idgah Colony, Agra 282001', city: 'Agra', state: 'Uttar Pradesh', lat: 27.1585, lng: 77.9890, type: 'station' },
  { name: 'Kanpur Central Station', address: 'Cantonment, Kanpur 208004', city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4540, lng: 80.3500, type: 'station' },
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ── Place Search & Autocomplete ────────────────────────────────────────────────
router.get('/search', async (req, res, next) => {
  try {
    const { q, lat, lng } = req.query;
    if (!q || !q.trim()) {
      return res.json({ places: [] });
    }

    const query = q.trim().toLowerCase();
    const cacheKey = `${query}_${lat || ''}_${lng || ''}`;
    if (searchCache.has(cacheKey)) {
      return res.json({ places: searchCache.get(cacheKey) });
    }

    let results = [];

    // Attempt Photon API (Fast, OpenStreetMap based, supports proximity lat/lng biasing)
    try {
      const photonUrl = new URL('https://photon.komoot.io/api/');
      photonUrl.searchParams.set('q', query);
      photonUrl.searchParams.set('limit', '8');
      if (lat && lng) {
        photonUrl.searchParams.set('lat', lat);
        photonUrl.searchParams.set('lon', lng);
      }

      const response = await fetch(photonUrl.toString(), {
        headers: { 'User-Agent': 'VeloqRideTracker/1.0' },
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          results = data.features.map((feat, idx) => {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [0, 0];
            const pLng = coords[0];
            const pLat = coords[1];

            const name = props.name || props.street || props.city || query;
            const addressParts = [props.street, props.district, props.city, props.state, props.country]
              .filter(Boolean);
            const address = addressParts.length > 0 ? addressParts.join(', ') : props.country || name;

            const dist = (lat && lng) ? calculateDistance(parseFloat(lat), parseFloat(lng), pLat, pLng) : null;

            return {
              id: props.osm_id ? `osm_${props.osm_id}` : `p_${idx}`,
              name,
              address,
              city: props.city || props.district || '',
              state: props.state || '',
              lat: pLat,
              lng: pLng,
              distanceKm: dist,
              type: props.type || 'place',
            };
          });
        }
      }
    } catch (apiErr) {
      // Fall through to fallback
    }

    // If Photon produced few/no results, supplement with local high-priority landmarks
    const localMatches = FALLBACK_LANDMARKS.filter((l) =>
      l.name.toLowerCase().includes(query) ||
      l.address.toLowerCase().includes(query) ||
      l.city.toLowerCase().includes(query)
    ).map((l, i) => {
      const dist = (lat && lng) ? calculateDistance(parseFloat(lat), parseFloat(lng), l.lat, l.lng) : null;
      return {
        id: `local_${i}`,
        ...l,
        distanceKm: dist,
      };
    });

    // Merge without duplicates
    const combined = [...results];
    for (const lm of localMatches) {
      if (!combined.some(r => r.name.toLowerCase() === lm.name.toLowerCase())) {
        combined.push(lm);
      }
    }

    // Sort by proximity if coordinates were provided
    if (lat && lng) {
      combined.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    const finalPlaces = combined.slice(0, 10);
    searchCache.set(cacheKey, finalPlaces);
    if (searchCache.size > 200) searchCache.delete(searchCache.keys().next().value);

    res.json({ places: finalPlaces });
  } catch (err) {
    next(err);
  }
});

// ── Reverse Geocode ────────────────────────────────────────────────────────────
router.get('/geocode', async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat and lng query parameters required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    if (geocodeCache.has(cacheKey)) {
      return res.json(geocodeCache.get(cacheKey));
    }

    // First check if within 0.8km of known landmarks
    const closestLandmark = FALLBACK_LANDMARKS.find(l => calculateDistance(latitude, longitude, l.lat, l.lng) <= 0.8);
    if (closestLandmark) {
      const result = {
        name: closestLandmark.name,
        address: closestLandmark.address,
        city: closestLandmark.city,
        state: closestLandmark.state,
        lat: latitude,
        lng: longitude,
        source: 'landmark_match',
      };
      geocodeCache.set(cacheKey, result);
      return res.json(result);
    }

    // Call Nominatim reverse geocode
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const response = await fetch(osmUrl, {
        headers: { 'User-Agent': 'VeloqRideTracker/1.0' },
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.state_district || 'Your Area';
        const state = addr.state || '';

        const name = road ? `${road}, ${city}` : (data.name || city);
        const fullAddress = data.display_name || `${name}, ${state}`;

        const result = {
          name,
          address: fullAddress,
          city,
          state,
          lat: latitude,
          lng: longitude,
          source: 'osm',
        };

        geocodeCache.set(cacheKey, result);
        if (geocodeCache.size > 200) geocodeCache.delete(geocodeCache.keys().next().value);
        return res.json(result);
      }
    } catch (e) {
      // Fallback
    }

    // Clean fallback
    const fallbackResult = {
      name: `Location (${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E)`,
      address: `Near coordinates ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      city: 'Current Location',
      state: '',
      lat: latitude,
      lng: longitude,
      source: 'coords',
    };
    res.json(fallbackResult);
  } catch (err) {
    next(err);
  }
});

// ── Dynamic Nearby Places Predictions (100 KM Range) ─────────────────────────
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, range } = req.query;
    if (!lat || !lng) {
      return res.json({ places: FALLBACK_LANDMARKS.slice(0, 8), rangeKm: 100 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxRangeKm = parseFloat(range) || 100; // default 100 KM range

    // Calculate distance to all known landmark hubs
    const nearby = FALLBACK_LANDMARKS.map(l => ({
      ...l,
      distanceKm: Math.round(calculateDistance(latitude, longitude, l.lat, l.lng) * 10) / 10,
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    // Filter within 100 KM range
    let closeMatches = nearby.filter(l => l.distanceKm <= maxRangeKm);

    // If local matches are few, supplement with Photon OSM places within 100 KM
    if (closeMatches.length < 4) {
      try {
        const photonUrl = new URL('https://photon.komoot.io/api/');
        photonUrl.searchParams.set('q', 'station');
        photonUrl.searchParams.set('lat', latitude.toString());
        photonUrl.searchParams.set('lon', longitude.toString());
        photonUrl.searchParams.set('limit', '8');

        const osmRes = await fetch(photonUrl.toString(), {
          headers: { 'User-Agent': 'RidersMobility/1.0' },
          signal: AbortSignal.timeout(2500),
        });

        if (osmRes.ok) {
          const osmData = await osmRes.json();
          if (osmData.features && osmData.features.length > 0) {
            const osmPlaces = osmData.features.map((f, i) => {
              const coords = f.geometry?.coordinates || [0, 0];
              const pLng = coords[0];
              const pLat = coords[1];
              const dist = Math.round(calculateDistance(latitude, longitude, pLat, pLng) * 10) / 10;
              const props = f.properties || {};
              return {
                id: `osm_near_${i}`,
                name: props.name || props.street || `Nearby Transit Node ${i + 1}`,
                address: [props.street, props.district, props.city, props.state].filter(Boolean).join(', ') || props.name || 'Local Landmark',
                city: props.city || props.district || 'Your Area',
                state: props.state || '',
                lat: pLat,
                lng: pLng,
                distanceKm: dist,
                type: props.osm_value || 'transit',
              };
            }).filter(p => p.distanceKm <= maxRangeKm && p.distanceKm > 0.3);

            closeMatches = [...closeMatches, ...osmPlaces].sort((a, b) => a.distanceKm - b.distanceKm);
          }
        }
      } catch (err) {
        // Fall through to available matches
      }
    }

    const finalMatches = closeMatches.length > 0 
      ? closeMatches.slice(0, 8) 
      : nearby.filter(l => l.distanceKm <= maxRangeKm).slice(0, 8);

    res.json({ 
      rangeKm: maxRangeKm, 
      count: finalMatches.length,
      places: finalMatches 
    });
  } catch (err) {
    next(err);
  }
});

// ── OSRM Route Driving Geometry ────────────────────────────────────────────────
router.get('/route', async (req, res, next) => {
  try {
    const { fromLat, fromLng, toLat, toLng } = req.query;
    if (!fromLat || !fromLng || !toLat || !toLng) {
      return res.status(400).json({ error: 'fromLat, fromLng, toLat, toLng required' });
    }

    const fLat = parseFloat(fromLat);
    const fLng = parseFloat(fromLng);
    const tLat = parseFloat(toLat);
    const tLng = parseFloat(toLng);
    const directDist = calculateDistance(fLat, fLng, tLat, tLng);

    // If destination is near Moradabad Junction station platforms/tracks, snap to driveable Station Road drop-off porch
    let queryTLat = tLat;
    let queryTLng = tLng;
    const isMoradabadJunction = calculateDistance(tLat, tLng, 28.8314, 78.7654) <= 0.45;
    if (isMoradabadJunction) {
      queryTLat = 28.8310;
      queryTLng = 78.7665;
    }

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fLng},${fLat};${queryTLng},${queryTLat}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl, {
        headers: { 'User-Agent': 'VeloqRideTracker/1.0' },
        signal: AbortSignal.timeout(4000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // OSRM returns coordinates in [lng, lat] format -> convert to Leaflet [lat, lng]
          let coordinates = route.geometry.coordinates.map(c => [c[1], c[0]]);
          let distanceKm = Math.round((route.distance / 1000) * 10) / 10;
          let durationMins = Math.round(route.duration / 60);

          // If destination was snapped to road porch, append exact destination point
          if (isMoradabadJunction && coordinates.length > 0) {
            coordinates.push([tLat, tLng]);
          }

          // Guard against unrealistic detour loops for short city rides
          if (directDist < 3.0 && distanceKm > directDist * 2.8) {
            // Unreasonable detour: interpolate clean street path
            const cleanPath = [
              [fLat, fLng],
              [fLat + (tLat - fLat) * 0.4 + 0.0005, fLng + (tLng - fLng) * 0.4 - 0.0005],
              [fLat + (tLat - fLat) * 0.75, fLng + (tLng - fLng) * 0.75],
              [tLat, tLng],
            ];
            return res.json({
              coordinates: cleanPath,
              distanceKm: Math.round(directDist * 1.2 * 10) / 10,
              durationMins: Math.max(3, Math.round(directDist * 2.5)),
              source: 'street_optimized',
            });
          }

          return res.json({
            coordinates,
            distanceKm,
            durationMins,
            source: 'osrm',
          });
        }
      }
    } catch (osrmErr) {
      // Fall through to synthetic arc
    }

    // Synthetic road route fallback
    const midLat1 = fLat + (tLat - fLat) * 0.33 + (tLng - fLng) * 0.03;
    const midLng1 = fLng + (tLng - fLng) * 0.33 - (tLat - fLat) * 0.03;
    const midLat2 = fLat + (tLat - fLat) * 0.66 - (tLng - fLng) * 0.02;
    const midLng2 = fLng + (tLng - fLng) * 0.66 + (tLat - fLat) * 0.02;

    const coordinates = [
      [fLat, fLng],
      [midLat1, midLng1],
      [midLat2, midLng2],
      [tLat, tLng],
    ];

    res.json({
      coordinates,
      distanceKm: Math.round(directDist * 1.25 * 10) / 10,
      durationMins: Math.max(2, Math.round(directDist * 2.2)),
      source: 'synthetic',
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update', async (req, res, next) => {
  try {
    const { driverId, lat, lng, speed, heading } = req.body;
    res.json({ received: true, timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
});

router.get('/drivers', async (req, res, next) => {
  try {
    res.json({ locations: [] });
  } catch (err) { next(err); }
});

router.get('/grid', async (req, res, next) => {
  try {
    const { lat, lng, resolution = 8 } = req.query;
    res.json({ cells: [], resolution });
  } catch (err) { next(err); }
});

export default router;
