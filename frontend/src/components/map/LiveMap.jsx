import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/stores';
import {
  Navigation, Crosshair, Layers, Zap, Compass, Maximize2, ShieldCheck,
  TrendingUp, Radio
} from 'lucide-react';

// Fix Leaflet default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Tile Providers for Production Grade Appearance (Clean, High-Res, Zero Watermarks)
const TILE_PROVIDERS = {
  voyager: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    maxNativeZoom: 19,
    subdomains: 'abc',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    maxNativeZoom: 19,
    subdomains: 'abcd',
  },
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
    maxNativeZoom: 19,
    subdomains: 'abc',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    maxNativeZoom: 19,
    subdomains: 'abc',
  },
};

// ── High-Definition Realistic Vehicle SVGs (Cab, Bike, Auto/Toto) ───────────────
const CAB_SVG = `
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Cab Roof Taxi Sign -->
    <rect x="11.5" y="5.2" width="5" height="2.2" rx="0.6" fill="#facc15" stroke="#ca8a04" stroke-width="0.5"/>
    <!-- Cab Aerodynamic Body -->
    <path d="M4 17.5C4 16.5 4.7 15.6 5.6 15.4L7.2 15L9 9.5C9.5 8 10.8 7 12.4 7H15.6C17.2 7 18.5 8 19 9.5L20.8 15L22.4 15.4C23.3 15.6 24 16.5 24 17.5V20.5C24 21.3 23.3 22 22.5 22H21.5C21.5 20.6 20.4 19.5 19 19.5C17.6 19.5 16.5 20.6 16.5 22H11.5C11.5 20.6 10.4 19.5 9 19.5C7.6 19.5 6.5 20.6 6.5 22H5.5C4.7 22 4 21.3 4 20.5V17.5Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5"/>
    <!-- Windshield and Tinted Windows -->
    <path d="M9.8 14.5L11.2 9.8C11.4 9.3 11.8 9 12.3 9H15.7C16.2 9 16.6 9.3 16.8 9.8L18.2 14.5H9.8Z" fill="#1e293b"/>
    <!-- Headlights Glow -->
    <circle cx="6.5" cy="18" r="1.3" fill="#fef08a"/>
    <circle cx="21.5" cy="18" r="1.3" fill="#fef08a"/>
    <!-- Wheels with Rims -->
    <circle cx="9" cy="22" r="2.6" fill="#0f172a" stroke="#ffffff" stroke-width="0.8"/>
    <circle cx="9" cy="22" r="1" fill="#94a3b8"/>
    <circle cx="19" cy="22" r="2.6" fill="#0f172a" stroke="#ffffff" stroke-width="0.8"/>
    <circle cx="19" cy="22" r="1" fill="#94a3b8"/>
  </svg>
`;

const BIKE_SVG = `
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Rear Spoke Wheel -->
    <circle cx="7" cy="19" r="4.2" fill="#0f172a" stroke="#ffffff" stroke-width="1.2"/>
    <circle cx="7" cy="19" r="2" fill="#94a3b8"/>
    <circle cx="7" cy="19" r="0.8" fill="#ffffff"/>
    <!-- Front Spoke Wheel -->
    <circle cx="21" cy="19" r="4.2" fill="#0f172a" stroke="#ffffff" stroke-width="1.2"/>
    <circle cx="21" cy="19" r="2" fill="#94a3b8"/>
    <circle cx="21" cy="19" r="0.8" fill="#ffffff"/>
    <!-- Motorcycle Chassis -->
    <path d="M7 19L11.5 13.5H16.5L21 19" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 13.5L14 8H16.5L18 13.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Aerodynamic Fuel Tank -->
    <path d="M13 11.5C13 10.2 14.2 9.2 16 9.2H17.8L18.8 12.5H14.5C13.6 12.5 13 12 13 11.5Z" fill="#ffedd5" stroke="#ffffff" stroke-width="0.8"/>
    <!-- Sport Handlebars -->
    <path d="M15 7.5H19" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
    <!-- Headlight Beam -->
    <path d="M19 8.5L24 7.5V10.5L19 9.5" fill="#fef08a" opacity="0.9"/>
    <!-- Rider Cushion Seat -->
    <path d="M10 12.5H13C13.6 12.5 14 13 14 13.5H9.5C9.5 13 9.7 12.5 10 12.5Z" fill="#0f172a"/>
  </svg>
`;

const AUTO_SVG = `
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Iconic Yellow Canopy Roof -->
    <path d="M5.5 12.5C5.5 8.5 8.5 6 12.5 6H17.5C20.5 6 22.8 8 23.3 11L24.5 15.5H5.2L5.5 12.5Z" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
    <!-- Curved Windshield -->
    <path d="M20.5 11L22 15H17V11H20.5Z" fill="#38bdf8" opacity="0.8"/>
    <!-- Classic Emerald Green Body (Indian Auto / Solar E-Toto) -->
    <path d="M4.8 15.5H23.5L22.5 20.2C22.2 21.2 21.2 21.8 20.2 21.8H7.8C6.8 21.8 5.8 21.2 5.5 20.2L4.8 15.5Z" fill="#16a34a" stroke="#ffffff" stroke-width="0.8"/>
    <!-- Open Passenger Door Cabin -->
    <rect x="8.5" y="11.5" width="7" height="4" rx="0.8" fill="#0f172a" opacity="0.7"/>
    <!-- 3-Wheeler Front Single Wheel -->
    <circle cx="21.5" cy="22" r="2.8" fill="#0f172a" stroke="#ffffff" stroke-width="1"/>
    <circle cx="21.5" cy="22" r="1.1" fill="#94a3b8"/>
    <!-- 3-Wheeler Rear Wheel -->
    <circle cx="8.5" cy="22" r="2.8" fill="#0f172a" stroke="#ffffff" stroke-width="1"/>
    <circle cx="8.5" cy="22" r="1.1" fill="#94a3b8"/>
    <!-- Single Round Headlight -->
    <circle cx="24" cy="17.2" r="1.3" fill="#fef08a" stroke="#eab308" stroke-width="0.5"/>
  </svg>
`;

// Ultra-crisp SVG vector icons for Rider and Drivers (Bike, Cab, Auto/Toto)
function createVehicleIcon(category, status, heading = 0) {
  const isBike = category === 'MOTO' || category === 'BIKE' || category === 'CAMPUS_BIKE';
  const isAuto = category === 'AUTO' || category === 'TOTO' || category === 'CAMPUS_AUTO';

  let discBg = 'linear-gradient(135deg, #1e40af, #0f172a)';
  let glowColor = 'rgba(37,99,235,0.45)';
  let badgeLabel = '🚗 CAB';
  let badgeText = '#60a5fa';
  let badgeBorder = 'rgba(96,165,250,0.35)';
  let vehicleSvg = CAB_SVG;

  if (isBike) {
    discBg = 'linear-gradient(135deg, #ea580c, #7c2d12)';
    glowColor = 'rgba(234,88,12,0.45)';
    badgeLabel = '🏍️ BIKE';
    badgeText = '#fb923c';
    badgeBorder = 'rgba(251,146,60,0.35)';
    vehicleSvg = BIKE_SVG;
  } else if (isAuto) {
    discBg = 'linear-gradient(135deg, #059669, #064e3b)';
    glowColor = 'rgba(16,185,129,0.45)';
    badgeLabel = '🛺 AUTO';
    badgeText = '#34d399';
    badgeBorder = 'rgba(52,211,153,0.35)';
    vehicleSvg = AUTO_SVG;
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
      <div style="
        width: 40px; height: 40px; border-radius: 50%;
        background: ${discBg};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.45), 0 0 0 3px ${glowColor};
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        ${vehicleSvg}
      </div>
      <div style="
        background: #090d16; color: ${badgeText}; font-size: 8px; font-weight: 900;
        padding: 1.5px 6px; border-radius: 9999px; margin-top: 2px;
        border: 1px solid ${badgeBorder};
        box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap; letter-spacing: 0.4px;
        display: flex; align-items: center; gap: 3px;
      ">
        ${badgeLabel}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-vehicle-marker',
    iconSize: [46, 56],
    iconAnchor: [23, 28],
    popupAnchor: [0, -24],
  });
}

// Active Assigned Ride Vehicle Marker (supports smooth heading, speed badge, and passenger onboard)
function createActiveRideVehicleIcon(category, heading = 0, isBoarded = false, driverName = 'Driver', speed = 0) {
  const isBike = category === 'MOTO' || category === 'BIKE';
  const isAuto = category === 'AUTO' || category === 'TOTO';

  const themeColor = isBoarded ? '#2563eb' : '#f59e0b';
  const glow = isBoarded ? 'rgba(37,99,235,0.6)' : 'rgba(245,158,11,0.6)';
  const badgeText = isBoarded ? '🚗 + 👤 ON TRIP' : '🚖 APPROACHING';

  const vehicleSvg = isBike ? BIKE_SVG : isAuto ? AUTO_SVG : CAB_SVG;

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate3d(0,0,0); pointer-events: auto;">
      <!-- Pulsing Wave Beacon -->
      <div style="
        position: absolute; width: 62px; height: 62px; border-radius: 50%;
        background: ${glow}; opacity: 0.4;
        animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        top: 2px;
      "></div>

      <!-- Main Vehicle Disc -->
      <div style="
        position: relative; width: 48px; height: 48px; border-radius: 50%;
        background: linear-gradient(135deg, ${themeColor}, #020617);
        border: 3px solid #ffffff;
        box-shadow: 0 6px 18px rgba(0,0,0,0.5), 0 0 0 3px ${glow};
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.4s ease-out;
      ">
        <div style="transform: rotate(${heading || 0}deg); display: flex; align-items: center; justify-content: center;">
          ${vehicleSvg}
        </div>
      </div>

      <!-- Status & Name Pill -->
      <div style="
        background: #090d16; color: #ffffff; font-size: 8.5px; font-weight: 900;
        padding: 2.5px 7px; border-radius: 9999px; margin-top: 3px;
        border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        white-space: nowrap; display: flex; align-items: center; gap: 4px;
      ">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isBoarded ? '#60a5fa' : '#34d399'}; box-shadow: 0 0 6px ${isBoarded ? '#60a5fa' : '#34d399'};"></span>
        <span>${badgeText}</span>
        ${speed > 0 ? `<span style="color: #94a3b8; font-family: monospace;">· ${speed}km/h</span>` : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'active-assigned-vehicle-marker',
    iconSize: [68, 70],
    iconAnchor: [34, 28],
    popupAnchor: [0, -28],
  });
}

// Mock nearby passengers on campus and city waiting for dispatches
const MOCK_PASSENGERS = [
  { id: 'pass-1', name: 'Aarav Sharma', location: { lat: 22.3175, lng: 87.3090 }, destination: 'Kharagpur Stn', badge: 'Student' },
  { id: 'pass-2', name: 'Sneha Roy', location: { lat: 22.3195, lng: 87.3045 }, destination: 'Tech Mkt', badge: 'Faculty' },
  { id: 'pass-3', name: 'Rohan Gupta', location: { lat: 22.3155, lng: 87.3110 }, destination: 'Main Gate', badge: 'Commuter' },
  { id: 'pass-4', name: 'Ananya Sen', location: { lat: 22.3210, lng: 87.3075 }, destination: 'Nalanda Complex', badge: 'Researcher' },
];

function createPickupIcon(label = 'YOU (PICKUP)', userImage = null, userName = 'You') {
  // Format clean user-facing location pill
  const cleanLabel = (label && label !== 'YOU' && label !== 'You')
    ? (label.toUpperCase().includes('YOU') ? label : `YOU · ${label}`)
    : 'YOU (PICKUP)';

  const avatarHtml = userImage ? `
    <img src="${userImage}" alt="${userName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
  ` : `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #2563eb, #1e40af); border-radius: 50%;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none" style="margin-top: 1px;">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
      <span style="font-size: 8px; font-weight: 900; line-height: 1; letter-spacing: 0.8px; color: #ffffff; margin-top: -1px; text-shadow: 0 1px 2px rgba(0,0,0,0.6);">YOU</span>
    </div>
  `;

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
      <!-- Location & YOU Top Badge -->
      <div style="
        background: #1d4ed8; color: #ffffff; font-size: 9.5px; font-weight: 800;
        padding: 3.5px 9px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(29,78,216,0.55);
        margin-bottom: 4px; white-space: nowrap; border: 2px solid #ffffff;
        display: flex; align-items: center; gap: 4px; letter-spacing: 0.3px;
      ">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; box-shadow: 0 0 6px #60a5fa;"></span>
        <span>📍 ${cleanLabel}</span>
      </div>

      <!-- Pulsing Radar Puck Container -->
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <!-- Concentric Ping Wave -->
        <div style="
          position: absolute; inset: -10px; border-radius: 50%;
          background: rgba(37,99,235,0.25);
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <!-- Dashed Accuracy Ring -->
        <div style="
          position: absolute; inset: -3px; border-radius: 50%;
          border: 2px dashed rgba(59,130,246,0.8);
        "></div>
        <!-- Central YOU Disc -->
        <div style="
          width: 38px; height: 38px; border-radius: 50%;
          border: 3px solid #ffffff; box-shadow: 0 4px 16px rgba(37,99,235,0.65), 0 0 0 2px rgba(37,99,235,0.4);
          overflow: hidden; display: flex; align-items: center; justify-content: center;
          background: #1e3a8a;
        ">
          ${avatarHtml}
        </div>
      </div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [110, 72], iconAnchor: [55, 62], popupAnchor: [0, -56] });
}

function createOriginWaypointIcon(label = 'Trip Origin') {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
      <div style="
        background: #0f172a; color: #94a3b8; font-size: 8.5px; font-weight: 800;
        padding: 2px 7px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        margin-bottom: 3px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2); letter-spacing: 0.3px;
        display: flex; align-items: center; gap: 3px;
      ">
        <span style="color: #10b981;">🏁</span>
        <span>Start: ${label}</span>
      </div>
      <div style="
        width: 18px; height: 18px; border-radius: 50%;
        background: #10b981; border: 2.5px solid #ffffff;
        box-shadow: 0 2px 8px rgba(16,185,129,0.5);
      "></div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [96, 42], iconAnchor: [48, 38], popupAnchor: [0, -34] });
}

function createPassengerIcon(passenger) {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="
        width: 30px; height: 30px; border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #3730a3);
        border: 2px solid #ffffff; box-shadow: 0 3px 10px rgba(99,102,241,0.45);
        display: flex; align-items: center; justify-content: center; color: white;
        font-size: 11px; font-weight: 900;
      ">
        ${passenger.name ? passenger.name.charAt(0) : '👤'}
      </div>
      <div style="
        background: rgba(15,23,42,0.9); color: #c7d2fe; font-size: 7.5px; font-weight: 800;
        padding: 1px 5px; border-radius: 9999px; margin-top: 2px; white-space: nowrap;
        border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        ${passenger.name ? passenger.name.split(' ')[0] : 'Rider'} (Waiting)
      </div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [50, 48], iconAnchor: [25, 24], popupAnchor: [0, -22] });
}

function createDestIcon(label = 'DESTINATION') {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
      <div style="
        background: #dc2626; color: #ffffff; font-size: 9px; font-weight: 800;
        padding: 3px 8px; border-radius: 9999px; box-shadow: 0 3px 12px rgba(220,38,38,0.5);
        margin-bottom: 4px; white-space: nowrap; border: 1.5px solid #ffffff; letter-spacing: 0.3px;
      ">
        🏁 ${label}
      </div>
      <div style="
        width: 32px; height: 32px; border-radius: 50%;
        background: linear-gradient(135deg, #ef4444, #991b1b);
        border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(220,38,38,0.6);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
      </div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [90, 60], iconAnchor: [45, 54], popupAnchor: [0, -50] });
}

function isValidCoordinate(point) {
  return Boolean(
    point &&
    Number.isFinite(Number(point.lat)) &&
    Number.isFinite(Number(point.lng)) &&
    Number(point.lat) >= -90 && Number(point.lat) <= 90 &&
    Number(point.lng) >= -180 && Number(point.lng) <= 180
  );
}

// Map Controller for smooth transitions without overriding manual user exploration
function MapController({ center, zoom, bounds, isExploring, setIsExploring, recenterTrigger }) {
  const map = useMap();
  const isUserInteractingRef = useRef(false);
  const lastBoundsKey = useRef('');
  const lastCenterKey = useRef('');
  const isInitialMount = useRef(true);
  const validCenter = isValidCoordinate(center)
    ? { lat: Number(center.lat), lng: Number(center.lng) }
    : null;
  const validBounds = Array.isArray(bounds) && bounds.length >= 2 && bounds.every(([lat, lng]) => (
    Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
  )) ? bounds : null;

  useEffect(() => {
    // Invalidate size immediately and after 150ms to ensure no grey tiles
    map.invalidateSize();
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);

  // Comprehensive tracking of user zoom, scroll wheel, touch, and drag gestures
  useEffect(() => {
    const container = map.getContainer();

    const onUserGesture = () => {
      isUserInteractingRef.current = true;
      setIsExploring?.(true);
    };

    // DOM events directly on the canvas container to catch wheel scroll and touches instantly
    container.addEventListener('wheel', onUserGesture, { passive: true });
    container.addEventListener('touchstart', onUserGesture, { passive: true });
    container.addEventListener('pointerdown', onUserGesture, { passive: true });
    container.addEventListener('mousedown', onUserGesture, { passive: true });

    // Leaflet map events
    map.on('dragstart', onUserGesture);
    map.on('zoomstart', onUserGesture);
    map.on('movestart', onUserGesture);

    return () => {
      container.removeEventListener('wheel', onUserGesture);
      container.removeEventListener('touchstart', onUserGesture);
      container.removeEventListener('pointerdown', onUserGesture);
      container.removeEventListener('mousedown', onUserGesture);
      map.off('dragstart', onUserGesture);
      map.off('zoomstart', onUserGesture);
      map.off('movestart', onUserGesture);
    };
  }, [map, setIsExploring]);

  // Handle explicit recenter command (e.g. user taps Re-center button or Live GPS button)
  useEffect(() => {
    if (recenterTrigger) {
      isUserInteractingRef.current = false;
      setIsExploring?.(false);
      if (validBounds) {
        try {
          map.fitBounds(validBounds, { padding: [60, 60], maxZoom: 15, animate: true });
        } catch (e) {
          if (validCenter) {
            map.flyTo([validCenter.lat, validCenter.lng], zoom || 15, { duration: 0.8 });
          }
        }
      } else if (validCenter) {
        map.flyTo([validCenter.lat, validCenter.lng], zoom || 15, { duration: 0.8 });
      }
    }
  }, [recenterTrigger, validBounds, validCenter, zoom, map, setIsExploring]);

  // Handle explicit route destination/pickup changes and search location animations
  useEffect(() => {
    if (validBounds) {
      const boundsKey = `${validBounds[0][0].toFixed(3)},${validBounds[0][1].toFixed(3)}-${validBounds[1][0].toFixed(3)},${validBounds[1][1].toFixed(3)}`;
      if (boundsKey !== lastBoundsKey.current) {
        lastBoundsKey.current = boundsKey;
        isUserInteractingRef.current = false;
        setIsExploring?.(false);
        try {
          map.fitBounds(validBounds, { padding: [60, 60], maxZoom: 15, animate: true });
        } catch (e) {
          if (validCenter) {
            map.flyTo([validCenter.lat, validCenter.lng], zoom || 14, { duration: 1.0 });
          }
        }
        isInitialMount.current = false;
      }
    } else if (validCenter) {
      const centerKey = `${validCenter.lat.toFixed(4)},${validCenter.lng.toFixed(4)}`;
      if (centerKey !== lastCenterKey.current) {
        lastCenterKey.current = centerKey;
        isUserInteractingRef.current = false;
        setIsExploring?.(false);
        map.flyTo([validCenter.lat, validCenter.lng], zoom || 15, { duration: 1.0 });
        isInitialMount.current = false;
      }
    }
  }, [validBounds, validCenter, zoom, map, setIsExploring]);

  return null;
}

// On-Map Tactile Zoom & Re-center Controls with Street Detail Badge
function MapZoomControls({ onRecenter, isExploring, onUserZoom }) {
  const map = useMap();
  const [currentZoomLevel, setCurrentZoomLevel] = useState(map.getZoom() || 15);

  useEffect(() => {
    const handleZoomEnd = () => {
      setCurrentZoomLevel(map.getZoom());
    };
    map.on('zoomend', handleZoomEnd);
    return () => map.off('zoomend', handleZoomEnd);
  }, [map]);

  const handleZoomIn = () => {
    onUserZoom?.();
    map.zoomIn();
  };

  const handleZoomOut = () => {
    onUserZoom?.();
    map.zoomOut();
  };

  return (
    <div className="absolute right-3 bottom-5 z-[400] flex flex-col items-end gap-1.5 pointer-events-auto select-none">
      {/* Detail Level Indicator Pill */}
      <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-md border border-slate-200 text-[10px] font-extrabold text-slate-700 tracking-tight flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        <span>
          {currentZoomLevel >= 18 ? '🔍 Street Gate View' : currentZoomLevel >= 15 ? '🏘️ Neighborhood' : '🗺️ City Overview'} ({Math.round(currentZoomLevel)}x)
        </span>
      </div>

      {isExploring && (
        <button
          onClick={onRecenter}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl shadow-xl border border-blue-500 flex items-center gap-1.5 transition-all mb-0.5 hover:scale-105 active:scale-95 animate-in fade-in zoom-in-95"
          title="Re-center map to current location or route"
        >
          <Crosshair size={13} className="animate-spin" />
          <span>Re-center GPS</span>
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:bg-slate-200 font-black text-lg border-b border-slate-100 transition-colors"
          title="Zoom In (High Detail Street View)"
          aria-label="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 active:bg-slate-200 font-black text-lg transition-colors"
          title="Zoom Out (Overview)"
          aria-label="Zoom Out"
        >
          -
        </button>
      </div>
    </div>
  );
}

// Driver popup info card
function DriverPopup({ driver }) {
  const isBike = driver.vehicle?.category === 'MOTO' || driver.vehicle?.category === 'BIKE';
  const isAuto = driver.vehicle?.category === 'AUTO' || driver.vehicle?.category === 'TOTO';
  const categoryLabel = isBike ? '🏍️ Rapido Bike Taxi' : isAuto ? '🛺 Campus Toto / Auto' : '🚗 Sedan Cab';

  return (
    <div className="p-3 min-w-[220px] text-slate-900 font-sans">
      <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {driver.name?.charAt(0) || 'D'}
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm leading-tight">{driver.name}</p>
          <div className="flex items-center gap-1 text-xs mt-0.5">
            <span className="text-amber-500 font-bold">★ {driver.rating || 4.9}</span>
            <span className="text-slate-400">· {driver.totalRides || driver.todayRides || 120} trips</span>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-slate-600">
        <p className="font-bold text-slate-800">{categoryLabel}</p>
        <p className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block font-semibold">
          {driver.vehicle?.plate || 'WB 29 AB 1042'} · {driver.vehicle?.model || 'Hero Splendor / Swift'}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            driver.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {driver.status === 'AVAILABLE' ? 'Available for Dispatch' : 'On Active Trip'}
          </span>
          {driver.speed > 0 && <span className="font-mono text-slate-500 font-bold">{driver.speed} km/h</span>}
        </div>
      </div>
    </div>
  );
}

// ── Production-Grade LiveMap Component ────────────────────────────────────────
export default function LiveMap({
  center,
  zoom = 14,
  drivers: externalDrivers,
  pickup,
  destination,
  activeDriverLocation,
  routeCoordinates,
  showSurgeZones = false,
  tileTheme = 'light', // 'light' (white clean default) | 'voyager' | 'dark' | 'osm'
  onDriverClick,
  height = '100%',
  className = '',
  showTelemetryOverlay = true,
  user,
  userImage,
  userName,
  showNearbyPassengers = true,
  onRecenterGPS,
  rideStage = null, // 'DRIVER_APPROACHING' | 'DRIVER_ARRIVED' | 'RIDE_STARTED' | 'RIDE_COMPLETED'
  activeRide = null,
  activeDriverEta = null,
  activeDriverDistance = null,
  activeDriverSpeed = null,
  children,
}) {
  const { drivers: storeDrivers, center: storeCenter, zoom: storeZoom, selectDriver } = useMapStore();
  const drivers = externalDrivers || storeDrivers;
  const mapCenter = center || (pickup?.lat ? { lat: pickup.lat, lng: pickup.lng } : destination?.lat ? { lat: destination.lat, lng: destination.lng } : storeCenter || { lat: 22.3149, lng: 87.3105 });
  const currentZoom = zoom || storeZoom || 14;

  const [activeTheme, setActiveTheme] = useState(tileTheme);
  const [isExploring, setIsExploring] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);

  const handleRecenter = () => {
    setIsExploring(false);
    setRecenterCount((c) => c + 1);
    onRecenterGPS?.();
  };

  // Compute initial camera framing bounds strictly between pickup and destination
  // Moving driver coordinates MUST NEVER force fitBounds or jerk the user's camera view!
  const bounds = useMemo(() => {
    const points = [];
    if (activeDriverLocation?.lat && activeDriverLocation?.lng && !destination?.lat) {
      points.push([activeDriverLocation.lat, activeDriverLocation.lng]);
    }
    if (pickup?.lat && pickup?.lng) points.push([pickup.lat, pickup.lng]);
    if (destination?.lat && destination?.lng) points.push([destination.lat, destination.lng]);
    return points.length >= 2 ? points : null;
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, activeDriverLocation?.lat, activeDriverLocation?.lng]);

  // Route polyline points
  const polylinePositions = useMemo(() => {
    if (routeCoordinates && routeCoordinates.length > 1) return routeCoordinates;
    if (pickup?.lat && destination?.lat) {
      // Create a smooth mid-point arc line between pickup & destination
      const midLat = (pickup.lat + destination.lat) / 2 + (pickup.lng - destination.lng) * 0.08;
      const midLng = (pickup.lng + destination.lng) / 2 - (pickup.lat - destination.lat) * 0.08;
      return [
        [pickup.lat, pickup.lng],
        [midLat, midLng],
        [destination.lat, destination.lng],
      ];
    }
    return null;
  }, [routeCoordinates, pickup, destination]);

  const tileConfig = TILE_PROVIDERS[activeTheme] || TILE_PROVIDERS.light || TILE_PROVIDERS.voyager;
  const isPassengerOnBoard = rideStage === 'RIDE_STARTED' || activeRide?.status === 'RIDE_STARTED';
  const isTripCompleted = rideStage === 'RIDE_COMPLETED' || activeRide?.status === 'RIDE_COMPLETED';

  return (
    <div style={{ height }} className={`relative w-full h-full bg-slate-100 overflow-hidden ${className}`}>
      {/* Floating Exploration Banner (Uber / Google Maps style) */}
      {isExploring && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-auto">
          <button
            onClick={handleRecenter}
            className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-blue-200 text-xs font-black text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-top-2"
            title="Click to snap camera back to current route/location"
          >
            <Crosshair size={13} className="text-blue-600 animate-spin" />
            <span>Exploring Map · Tap to Re-center</span>
          </button>
        </div>
      )}

      {/* ── REAL-TIME ON-MAP FLOATING TRIP HUD (Only during active passenger rides) ── */}
      {activeDriverLocation && (activeRide || rideStage) && (
        <div className="absolute top-3 left-3 z-[400] max-w-xs sm:max-w-sm w-full pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-white">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isPassengerOnBoard ? 'bg-blue-400' : 'bg-amber-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isPassengerOnBoard ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  {rideStage === 'DRIVER_APPROACHING' ? 'Driver En Route' :
                   rideStage === 'DRIVER_ARRIVED' ? 'Driver at Pickup' :
                   rideStage === 'RIDE_STARTED' ? 'Trip in Progress' :
                   rideStage === 'RIDE_COMPLETED' ? 'Arrived at Destination' : 'Active Ride'}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full font-bold">
                {activeDriverSpeed || activeDriverLocation.speed || 32} km/h
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2.5">
              <div>
                <p className="text-lg font-black tracking-tight text-white leading-tight">
                  {activeDriverEta ? `${activeDriverEta} mins` : isPassengerOnBoard ? '14 mins' : '3 mins'}
                  <span className="text-xs font-medium text-slate-400 ml-1.5">
                    ({activeDriverDistance ? `${activeDriverDistance} km` : isPassengerOnBoard ? '4.8 km' : '1.2 km'})
                  </span>
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                  {isPassengerOnBoard ? `Heading to ${destination?.name || 'Destination'}` : `Meeting you at ${pickup?.name || 'Pickup'}`}
                </p>
              </div>

              {activeRide?.otp && (
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ride OTP</span>
                  <span className="font-mono text-sm font-black bg-white/10 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    {activeRide.otp}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={currentZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        minZoom={4}
        maxZoom={20}
      >
        <TileLayer
          attribution={tileConfig.attribution}
          url={tileConfig.url}
          maxZoom={20}
          maxNativeZoom={tileConfig.maxNativeZoom || 19}
          subdomains={tileConfig.subdomains || 'abc'}
        />
        <MapController
          center={mapCenter}
          zoom={currentZoom}
          bounds={bounds}
          isExploring={isExploring}
          setIsExploring={setIsExploring}
          recenterTrigger={recenterCount}
        />
        <MapZoomControls
          onRecenter={handleRecenter}
          isExploring={isExploring}
          onUserZoom={() => setIsExploring(true)}
        />

        {/* Route Polyline (Glow & Main Path) */}
        {polylinePositions && (
          <>
            {/* Soft Ambient Outer Glow */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#3b82f6', weight: 8, opacity: 0.4, lineCap: 'round', lineJoin: 'round' }}
            />
            {/* Core Solid High-Contrast Line */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#1d4ed8', weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
            />
            {/* Animated Directional Dash */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: '#93c5fd', weight: 2, opacity: 0.9, dashArray: '6, 12', lineCap: 'round' }}
            />
          </>
        )}

        {/* Fleet Drivers on Map (Only when not in focused single active ride) */}
        {(!activeDriverLocation || !isPassengerOnBoard) && drivers.filter(d => d.status !== 'OFFLINE').map(driver => (
          <Marker
            key={driver.id}
            position={[driver.location.lat, driver.location.lng]}
            icon={createVehicleIcon(driver.vehicle?.category, driver.status, driver.heading)}
            eventHandlers={{
              click: () => { selectDriver(driver.id); onDriverClick?.(driver); },
            }}
          >
            <Popup>
              <DriverPopup driver={driver} />
            </Popup>
          </Marker>
        ))}

        {/* Active Assigned Driver in Motion (Animated marker with Heading & Passenger Onboard) */}
        {activeDriverLocation && (
          <Marker
            position={[activeDriverLocation.lat, activeDriverLocation.lng]}
            icon={createActiveRideVehicleIcon(
              activeDriverLocation.category || activeRide?.driverInfo?.category || 'MOTO',
              activeDriverLocation.heading || 45,
              isPassengerOnBoard,
              activeRide?.driverInfo?.name || 'Driver',
              activeDriverSpeed || activeDriverLocation.speed || 30
            )}
          >
            <Popup>
              <div className="p-2.5 text-xs font-bold text-slate-900 min-w-[190px]">
                <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                    {(activeRide?.driverInfo?.name || 'D').charAt(0)}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">{activeRide?.driverInfo?.name || 'Assigned Driver'}</p>
                    <p className="text-[10px] text-emerald-600">
                      ★ {activeRide?.driverInfo?.rating || 4.9} · {activeRide?.driverInfo?.vehicle || 'Verified Vehicle'}
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 font-medium">
                  {isPassengerOnBoard ? '🚗 Passenger on board · Heading to destination' : '🚖 Approaching pickup point'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pickup Marker: Shows live YOU beacon when waiting; transitions to start origin waypoint once in transit or completed */}
        {pickup?.lat && pickup?.lng && (
          <>
            {!isPassengerOnBoard && !isTripCompleted && (
              <Circle
                center={[pickup.lat, pickup.lng]}
                radius={40}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
            )}
            <Marker
              position={[pickup.lat, pickup.lng]}
              icon={isPassengerOnBoard || isTripCompleted
                ? createOriginWaypointIcon(pickup.name ? pickup.name.split(',')[0] : 'Origin')
                : createPickupIcon(
                    pickup.name ? pickup.name.split(',')[0] : 'YOU (PICKUP)',
                    pickup.userImage || user?.avatar || userImage,
                    pickup.userName || user?.name || userName || 'You'
                  )
              }
            >
              <Popup>
                <div className="p-2 text-xs font-bold text-slate-900 min-w-[170px]">
                  <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      🏁
                    </div>
                    <div>
                      <p className="text-slate-900 font-black">Trip Origin</p>
                      <p className="text-[10px] text-slate-500">Boarding Location</p>
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium">
                    📍 {pickup.name || pickup.address || 'Your Pickup Location'}
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Nearby Passengers on Campus / City Roads */}
        {showNearbyPassengers && MOCK_PASSENGERS.map((passenger) => (
          <Marker
            key={passenger.id}
            position={[passenger.location.lat, passenger.location.lng]}
            icon={createPassengerIcon(passenger)}
          >
            <Popup>
              <div className="p-2 text-xs font-sans text-slate-900 min-w-[160px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {passenger.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{passenger.name}</p>
                    <p className="text-[10px] text-slate-500">{passenger.badge} · Waiting</p>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                  Heading to {passenger.destination}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Destination Marker: Transitions to live YOU ARRIVED beacon once trip is completed! */}
        {destination?.lat && destination?.lng && (
          <>
            {isTripCompleted && (
              <Circle
                center={[destination.lat, destination.lng]}
                radius={40}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.18,
                  weight: 2,
                  dashArray: '4, 4',
                }}
              />
            )}
            <Marker
              position={[destination.lat, destination.lng]}
              icon={isTripCompleted
                ? createPickupIcon(
                    destination.name ? `YOU (ARRIVED) · ${destination.name.split(',')[0]}` : 'YOU (ARRIVED)',
                    pickup?.userImage || user?.avatar || userImage,
                    pickup?.userName || user?.name || userName || 'You'
                  )
                : createDestIcon(destination.name ? destination.name.split('(')[0] : 'DESTINATION')
              }
            >
              <Popup>
                <div className="p-2 text-xs font-bold text-slate-900">
                  {isTripCompleted ? '📍 You Arrived: ' : '🏁 Destination: '}
                  {destination.name || destination.address || 'Dropoff Point'}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Surge Zone Heatmap Circles */}
        {showSurgeZones && (
          <>
            <Circle
              center={[mapCenter.lat + 0.005, mapCenter.lng - 0.004]}
              radius={600}
              pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1.5, dashArray: '4,4' }}
            />
            <Circle
              center={[mapCenter.lat - 0.006, mapCenter.lng + 0.005]}
              radius={750}
              pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.12, weight: 1.5, dashArray: '4,4' }}
            />
          </>
        )}

        {children}
      </MapContainer>

      {/* Floating Modern Telemetry Badge */}
      {showTelemetryOverlay && (
        <div className="absolute top-3 right-3 z-10 pointer-events-auto flex items-center gap-1.5">
          {onRecenterGPS && (
            <button
              onClick={onRecenterGPS}
              className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-md text-[11px] font-extrabold text-blue-700 hover:bg-blue-50 transition-all flex items-center gap-1.5"
              title="Re-center map on your live GPS position"
            >
              <Crosshair size={13} className="text-blue-600 animate-spin-slow" />
              <span>Center GPS</span>
            </button>
          )}

          {/* Theme switcher pill */}
          <div className="bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1">
            <button
              onClick={() => setActiveTheme(activeTheme === 'voyager' ? 'dark' : 'voyager')}
              className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              title="Toggle Map Style (Voyager / Dark)"
            >
              <Layers size={11} className="text-blue-600" />
              <span>{activeTheme === 'voyager' ? 'Voyager' : 'Night'}</span>
            </button>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-md text-[11px] font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Live GPS Telemetry</span>
            <span className="sm:hidden">Live</span>
          </div>
        </div>
      )}
    </div>
  );
}
