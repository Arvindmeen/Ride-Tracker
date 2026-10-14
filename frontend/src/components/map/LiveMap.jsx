import React, { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/stores';
import {
  Navigation, Crosshair, Layers, Zap, Compass, Maximize2, ShieldCheck,
  TrendingUp, Radio, X
} from 'lucide-react';
import { formatDuration } from '@/utils/formatters';

// Fix Leaflet default marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Tile Providers: 100% Free, Official OpenStreetMap Stack (Full Street Names, Zero Watermarks, Zero API Keys Required)
const TILE_PROVIDERS = {
  osm: {
    name: 'Standard OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    maxNativeZoom: 19,
    subdomains: 'abc',
    className: '',
  },
  light: {
    name: 'Street View',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    maxNativeZoom: 19,
    subdomains: 'abc',
    className: '',
  },
  voyager: {
    name: 'Detailed (HOT)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    maxNativeZoom: 19,
    subdomains: 'abc',
    className: '',
  },
  dark: {
    name: 'Night View',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    maxNativeZoom: 19,
    subdomains: 'abc',
    className: 'dark-tiles',
  },
};

// ── High-Definition Top-Down Navigation Vehicle SVGs (Head points UP at 0°) ──────
const TOPDOWN_CAB_SVG = `
  <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Sedan Body (Aerodynamic EV) -->
    <path d="M22 10C22 7 25 5 32 5C39 5 42 7 42 10L45 20L46 44C46 50 43 54 32 54C21 54 18 50 18 44L19 20L22 10Z" fill="#F8FAFC" stroke="#0F172A" stroke-width="2.5"/>
    <!-- Front Windshield -->
    <path d="M23 18C25 15 28 14 32 14C36 14 39 15 41 18L42 25H22L23 18Z" fill="#1E293B"/>
    <!-- Roof with EV / Taxi Beacon -->
    <rect x="25" y="27" width="14" height="9" rx="2" fill="#3B82F6" stroke="#1D4ED8" stroke-width="1"/>
    <rect x="28" y="30" width="8" height="3" rx="1" fill="#FACC15"/>
    <!-- Rear Window -->
    <path d="M23 42L24 38H40L41 42C39 44 36 45 32 45C28 45 25 44 23 42Z" fill="#1E293B"/>
    <!-- Side Mirrors -->
    <rect x="15" y="19" width="4" height="2.5" rx="1" fill="#F8FAFC" stroke="#0F172A" stroke-width="1"/>
    <rect x="45" y="19" width="4" height="2.5" rx="1" fill="#F8FAFC" stroke="#0F172A" stroke-width="1"/>
    <!-- Front Headlights (Pointing forward at top) -->
    <rect x="22" y="6" width="5" height="3.5" rx="1.5" fill="#FEF08A" stroke="#FACC15" stroke-width="0.8"/>
    <rect x="37" y="6" width="5" height="3.5" rx="1.5" fill="#FEF08A" stroke="#FACC15" stroke-width="0.8"/>
    <!-- Dual Rear Taillights -->
    <rect x="20" y="52" width="6" height="2.5" rx="1" fill="#EF4444"/>
    <rect x="38" y="52" width="6" height="2.5" rx="1" fill="#EF4444"/>
  </svg>
`;

const TOPDOWN_TOTO_SVG = `
  <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- E-Toto Canopy Roof (Green EV) -->
    <path d="M20 16C20 11 24 8 32 8C40 8 44 11 44 16L45 42C45 48 42 51 32 51C22 51 19 48 19 42L20 16Z" fill="#10B981" stroke="#064E3B" stroke-width="2.5"/>
    <!-- Front Nose & Steering Extension -->
    <path d="M28 8V4C28 2.5 29.5 1 32 1C34.5 1 36 2.5 36 4V8H28Z" fill="#047857" stroke="#064E3B" stroke-width="1.5"/>
    <circle cx="32" cy="4" r="2" fill="#0F172A"/>
    <!-- Front Windshield -->
    <path d="M22 17C25 14 28 13.5 32 13.5C36 13.5 39 14 42 17L43 23H21L22 17Z" fill="#022C22"/>
    <!-- Driver Seat -->
    <rect x="27" y="25" width="10" height="5" rx="1.5" fill="#0F172A"/>
    <!-- Passenger Bench -->
    <rect x="22" y="38" width="20" height="8" rx="2" fill="#065F46" stroke="#047857" stroke-width="1"/>
    <!-- Front Headlights (Pointing forward at top) -->
    <circle cx="27" cy="8" r="2.2" fill="#FEF08A" stroke="#FACC15" stroke-width="0.8"/>
    <circle cx="37" cy="8" r="2.2" fill="#FEF08A" stroke="#FACC15" stroke-width="0.8"/>
    <!-- Chrome Grab Rails -->
    <line x1="17" y1="22" x2="17" y2="44" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <line x1="47" y1="22" x2="47" y2="44" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
    <!-- Rear Taillights -->
    <rect x="21" y="49.5" width="5" height="2" rx="1" fill="#EF4444"/>
    <rect x="38" y="49.5" width="5" height="2" rx="1" fill="#EF4444"/>
  </svg>
`;

const TOPDOWN_BIKE_SVG = `
  <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Front Tire (Points forward at top) -->
    <rect x="30" y="4" width="4" height="12" rx="2" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <!-- Wide Handlebars with Grips -->
    <path d="M19 14L28 16L32 16L36 16L45 14" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Dual Side Mirrors -->
    <circle cx="18" cy="13" r="2" fill="#94A3B8"/>
    <circle cx="46" cy="13" r="2" fill="#94A3B8"/>
    <!-- Headlight Beam -->
    <circle cx="32" cy="14" r="3" fill="#FEF08A" stroke="#FACC15" stroke-width="1"/>
    <!-- Bike Frame & Tank (Orange EV) -->
    <path d="M26 20C26 18 28 17 32 17C36 17 38 18 38 20L39 34C39 37 36 39 32 39C28 39 25 37 25 34L26 20Z" fill="#F97316" stroke="#C2410C" stroke-width="2"/>
    <!-- Rider Cushion Seat -->
    <path d="M27 28C27 26 29 25 32 25C35 25 37 26 37 28L36 43C36 45 34 46 32 46C30 46 28 45 28 43L27 28Z" fill="#0F172A"/>
    <!-- Rear Tire -->
    <rect x="30" y="47" width="4" height="12" rx="2" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <!-- Rear Taillight -->
    <rect x="29" y="45" width="6" height="2" rx="1" fill="#EF4444"/>
  </svg>
`;

const TOPDOWN_TRANSPORTER_SVG = `
  <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Front Cabin (Points forward at top) -->
    <path d="M20 12C20 8 23 6 32 6C41 6 44 8 44 12L44 26H20L20 12Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
    <!-- Windshield -->
    <path d="M22 16C25 14 28 13 32 13C36 13 39 14 42 16L42 22H22L22 16Z" fill="#1E293B"/>
    <!-- Front Headlights -->
    <rect x="21" y="7" width="5" height="3" rx="1" fill="#FEF08A" stroke="#FACC15" stroke-width="0.8"/>
    <rect x="38" y="7" width="5" height="3" rx="1" fill="#FEF08A" stroke="#FACC15" stroke-width="0.8"/>
    <!-- Cargo Bed Container (Blue) -->
    <rect x="18" y="27" width="28" height="28" rx="2" fill="#0284C7" stroke="#0369A1" stroke-width="2"/>
    <line x1="24" y1="27" x2="24" y2="55" stroke="#38BDF8" stroke-width="1.5"/>
    <line x1="40" y1="27" x2="40" y2="55" stroke="#38BDF8" stroke-width="1.5"/>
    <!-- Rear Taillights -->
    <rect x="19" y="53" width="5" height="2" rx="1" fill="#EF4444"/>
    <rect x="40" y="53" width="5" height="2" rx="1" fill="#EF4444"/>
  </svg>
`;

// Ultra-crisp vector icons for Ambient Fleet Drivers (Head points in direction of travel!)
function createVehicleIcon(category, status, heading = 0) {
  const cat = String(category || '').toUpperCase();
  const isBike = cat.includes('BIKE') || cat.includes('MOTO');
  const isAuto = cat.includes('AUTO') || cat.includes('TOTO');
  const isTransporter = cat.includes('TRANSPORTER') || cat.includes('XL');

  let discBg = 'linear-gradient(135deg, #1e40af, #0f172a)';
  let glowColor = 'rgba(37,99,235,0.45)';
  let badgeLabel = '🚗 CAB';
  let badgeText = '#60a5fa';
  let badgeBorder = 'rgba(96,165,250,0.35)';
  let vehicleHtml = TOPDOWN_CAB_SVG;

  if (isBike) {
    discBg = 'linear-gradient(135deg, #ea580c, #7c2d12)';
    glowColor = 'rgba(234,88,12,0.45)';
    badgeLabel = '🏍️ BIKE';
    badgeText = '#fb923c';
    badgeBorder = 'rgba(251,146,60,0.35)';
    vehicleHtml = TOPDOWN_BIKE_SVG;
  } else if (isAuto) {
    discBg = 'linear-gradient(135deg, #059669, #064e3b)';
    glowColor = 'rgba(16,185,129,0.45)';
    badgeLabel = '🛺 TOTO';
    badgeText = '#34d399';
    badgeBorder = 'rgba(52,211,153,0.35)';
    vehicleHtml = TOPDOWN_TOTO_SVG;
  } else if (isTransporter) {
    discBg = 'linear-gradient(135deg, #0284c7, #0369a1)';
    glowColor = 'rgba(2,132,199,0.45)';
    badgeLabel = '🚚 TRANSPORTER';
    badgeText = '#38bdf8';
    badgeBorder = 'rgba(56,189,248,0.35)';
    vehicleHtml = TOPDOWN_TRANSPORTER_SVG;
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
      <div style="
        width: 44px; height: 44px; border-radius: 50%;
        background: ${discBg};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 14px rgba(0,0,0,0.45), 0 0 0 3px ${glowColor};
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <!-- Vehicle Head points in direction of path! -->
        <div style="
          transform: rotate(${heading || 0}deg);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          ${vehicleHtml}
        </div>
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
    iconSize: [48, 58],
    iconAnchor: [24, 29],
    popupAnchor: [0, -25],
  });
}

// Active Assigned Ride Vehicle Marker (Vehicle head points in direction of path!)
function createActiveRideVehicleIcon(category, heading = 0, isBoarded = false, driverName = 'Driver', speed = 0, isArrived = false) {
  const cat = String(category || '').toUpperCase();
  const isBike = cat.includes('BIKE') || cat.includes('MOTO');
  const isAuto = cat.includes('AUTO') || cat.includes('TOTO');
  const isTransporter = cat.includes('TRANSPORTER') || cat.includes('XL');

  const themeColor = isBoarded ? '#2563eb' : isArrived ? '#059669' : isAuto ? '#10b981' : isBike ? '#f97316' : '#3b82f6';
  const glow = isBoarded ? 'rgba(37,99,235,0.65)' : isArrived ? 'rgba(5,150,105,0.7)' : isAuto ? 'rgba(16,185,129,0.65)' : isBike ? 'rgba(249,115,22,0.65)' : 'rgba(59,130,246,0.65)';
  
  const badgeText = isBoarded
    ? (isAuto ? '🛺 ON TRIP' : isBike ? '🏍️ ON TRIP' : isTransporter ? '🚚 ON TRIP' : '🚗 ON TRIP')
    : isArrived || speed === 0
    ? (isAuto ? '🛺 TOTO AT PICKUP' : isBike ? '🏍️ BIKE AT PICKUP' : isTransporter ? '🚚 TRANSPORTER AT PICKUP' : '🚗 CAB AT PICKUP')
    : (isAuto ? '🛺 TOTO ARRIVING' : isBike ? '🏍️ BIKE ARRIVING' : isTransporter ? '🚚 TRANSPORTER ARRIVING' : '🚗 CAB ARRIVING');

  const vehicleHtml = isAuto
    ? TOPDOWN_TOTO_SVG
    : isBike
    ? TOPDOWN_BIKE_SVG
    : isTransporter
    ? TOPDOWN_TRANSPORTER_SVG
    : TOPDOWN_CAB_SVG;

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate3d(0,0,0); pointer-events: auto;">
      <!-- Pulsing Wave Beacon -->
      <div style="
        position: absolute; width: 66px; height: 66px; border-radius: 50%;
        background: ${glow}; opacity: 0.45;
        animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
        top: 2px;
      "></div>

      <!-- Main Vehicle Disc -->
      <div style="
        position: relative; width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(135deg, ${themeColor}, #020617);
        border: 2.5px solid #ffffff;
        box-shadow: 0 8px 24px rgba(0,0,0,0.55), 0 0 0 3px ${glow};
        display: flex; align-items: center; justify-content: center;
      ">
        <!-- Directional Pointer Needle on Rim (Rotates 360° to point motion direction) -->
        <div style="
          position: absolute; inset: -4px; border-radius: 50%;
          pointer-events: none;
          transform: rotate(${heading || 0}deg);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <div style="
            position: absolute; top: -5px; left: 50%; transform: translateX(-50%);
            width: 0; height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 9px solid #ffffff;
            filter: drop-shadow(0 0 4px ${glow});
          "></div>
        </div>

        <!-- Vehicle Head points in direction of path! (Smooth 360° rotation) -->
        <div style="
          transform: rotate(${heading || 0}deg);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <!-- Forward Headlight Ray Beam (Emits forward from head) -->
          <div style="
            position: absolute; top: -14px; width: 28px; height: 18px;
            background: radial-gradient(ellipse at bottom, rgba(254,240,138,0.7) 0%, rgba(254,240,138,0.15) 60%, transparent 100%);
            clip-path: polygon(25% 100%, 75% 100%, 100% 0%, 0% 0%);
            filter: blur(1px); pointer-events: none;
          "></div>

          ${vehicleHtml}
        </div>
      </div>

      <!-- Live Speed & Dispatch Status Pill (Always horizontal and legible) -->
      <div style="
        background: #090d16; color: #ffffff; font-size: 8.5px; font-weight: 900;
        padding: 2.5px 8px; border-radius: 9999px; margin-top: 4px;
        border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        white-space: nowrap; display: flex; align-items: center; gap: 4px;
      ">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${isBoarded ? '#60a5fa' : isArrived ? '#10b981' : '#34d399'}; box-shadow: 0 0 6px ${isBoarded ? '#60a5fa' : isArrived ? '#10b981' : '#34d399'};"></span>
        <span>${badgeText}</span>
        ${speed > 0 ? `<span style="color: #94a3b8; font-family: monospace;">· ${speed}km/h</span>` : `<span style="color: #34d399; font-weight: bold;">· Parked</span>`}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'active-assigned-vehicle-marker',
    iconSize: [72, 74],
    iconAnchor: [36, 30],
    popupAnchor: [0, -30],
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
    Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) &&
    Number(lat) >= -90 && Number(lat) <= 90 && Number(lng) >= -180 && Number(lng) <= 180
  )) ? bounds : null;

  const flyToSafe = (point, targetZoom) => {
    if (!isValidCoordinate(point)) return;
    const safeZoom = Number.isFinite(Number(targetZoom)) ? Number(targetZoom) : 15;
    try {
      map.flyTo([Number(point.lat), Number(point.lng)], safeZoom, { duration: 0.8 });
    } catch (error) {
      console.warn('Skipped invalid map camera update:', error);
    }
  };

  useEffect(() => {
    // Invalidate size immediately, and at progressive frames to handle flexbox, modal/tab transition, and mobile layout changes
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);
    const t4 = setTimeout(() => map.invalidateSize(), 1200);

    const container = map.getContainer();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      });
      ro.observe(container);
    }

    const onWinResize = () => {
      try {
        map.invalidateSize();
      } catch (e) {}
    };
    window.addEventListener('resize', onWinResize);
    window.addEventListener('orientationchange', onWinResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onWinResize);
      window.removeEventListener('orientationchange', onWinResize);
    };
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
            flyToSafe(validCenter, zoom);
          }
        }
      } else if (validCenter) {
        flyToSafe(validCenter, zoom);
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
            flyToSafe(validCenter, zoom);
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
        flyToSafe(validCenter, zoom);
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
  routePolyline,
  tripCoordinates = null,
  showSurgeZones = false,
  tileTheme = 'osm', // 'osm' (Standard OpenStreetMap default) | 'voyager' | 'dark' | 'light'
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
  const requestedCenter = center || (pickup?.lat ? { lat: pickup.lat, lng: pickup.lng } : destination?.lat ? { lat: destination.lat, lng: destination.lng } : storeCenter);
  const mapCenter = isValidCoordinate(requestedCenter)
    ? { lat: Number(requestedCenter.lat), lng: Number(requestedCenter.lng) }
    : { lat: 22.3149, lng: 87.3105 };
  const currentZoom = zoom || storeZoom || 14;

  const [activeTheme, setActiveTheme] = useState(tileTheme || 'osm');
  const [isExploring, setIsExploring] = useState(false);
  const [recenterCount, setRecenterCount] = useState(0);

  // Swipe / Slide-to-dismiss animated state for the on-map Trip HUD
  const [isHudDismissed, setIsHudDismissed] = useState(false);
  const [hudDragOffset, setHudDragOffset] = useState(0);
  const [isHudDragging, setIsHudDragging] = useState(false);
  const [hudExitDirection, setHudExitDirection] = useState(null); // 'left' | 'right' | null
  const hudDragStartX = useRef(0);
  const hudCurrentDragX = useRef(0);

  // Re-display HUD when ride stage changes or new ride starts
  useEffect(() => {
    setIsHudDismissed(false);
    setHudExitDirection(null);
    setHudDragOffset(0);
  }, [rideStage, activeRide?.id]);

  const handleHudDragStart = (clientX) => {
    setIsHudDragging(true);
    hudDragStartX.current = clientX;
    hudCurrentDragX.current = 0;
  };

  const handleHudDragMove = (clientX) => {
    if (!isHudDragging) return;
    const deltaX = clientX - hudDragStartX.current;
    hudCurrentDragX.current = deltaX;
    setHudDragOffset(deltaX);
  };

  const handleHudDragEnd = () => {
    if (!isHudDragging) return;
    setIsHudDragging(false);
    const offset = hudCurrentDragX.current;
    if (Math.abs(offset) > 75) {
      // Swiped smoothly past threshold! Animate off in that direction and delete/dismiss
      const dir = offset > 0 ? 'right' : 'left';
      setHudExitDirection(dir);
      setTimeout(() => {
        setIsHudDismissed(true);
        setHudExitDirection(null);
        setHudDragOffset(0);
      }, 260);
    } else {
      // Snap back smoothly
      setHudDragOffset(0);
    }
  };

  const handleDismissHud = (dir = 'right') => {
    setHudExitDirection(dir);
    setTimeout(() => {
      setIsHudDismissed(true);
      setHudExitDirection(null);
      setHudDragOffset(0);
    }, 260);
  };

  const handleRecenter = () => {
    setIsExploring(false);
    setRecenterCount((c) => c + 1);
    onRecenterGPS?.();
  };

  // Compute initial camera framing bounds strictly between pickup and destination
  // Moving driver coordinates MUST NEVER force fitBounds or jerk the user's camera view!
  const bounds = useMemo(() => {
    const points = [];
    if (isValidCoordinate(activeDriverLocation) && !isValidCoordinate(destination)) {
      points.push([Number(activeDriverLocation.lat), Number(activeDriverLocation.lng)]);
    }
    if (isValidCoordinate(pickup)) points.push([Number(pickup.lat), Number(pickup.lng)]);
    if (isValidCoordinate(destination)) points.push([Number(destination.lat), Number(destination.lng)]);
    return points.length >= 2 ? points : null;
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, activeDriverLocation?.lat, activeDriverLocation?.lng]);

  // 1. Trip Polyline (Pickup -> Destination)
  const tripPositions = useMemo(() => {
    if (tripCoordinates?.length > 1 && tripCoordinates.every(([lat, lng]) => (
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
    ))) {
      return tripCoordinates.map(([lat, lng]) => [Number(lat), Number(lng)]);
    }
    const isStarted = rideStage === 'RIDE_STARTED' || activeRide?.status === 'RIDE_STARTED';
    const activeRoute = routeCoordinates || routePolyline;
    if (isStarted && activeRoute?.length > 1 && activeRoute.every(([lat, lng]) => (
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
    ))) {
      return activeRoute.map(([lat, lng]) => [Number(lat), Number(lng)]);
    }
    if (isValidCoordinate(pickup) && isValidCoordinate(destination)) {
      const midLat = (Number(pickup.lat) + Number(destination.lat)) / 2 + (Number(pickup.lng) - Number(destination.lng)) * 0.08;
      const midLng = (Number(pickup.lng) + Number(destination.lng)) / 2 - (Number(pickup.lat) - Number(destination.lat)) * 0.08;
      return [
        [Number(pickup.lat), Number(pickup.lng)],
        [midLat, midLng],
        [Number(destination.lat), Number(destination.lng)],
      ];
    }
    return null;
  }, [tripCoordinates, routeCoordinates, routePolyline, pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, rideStage, activeRide?.status]);

  // 2. Approach Polyline (Driver -> Pickup)
  const approachPositions = useMemo(() => {
    const isStarted = rideStage === 'RIDE_STARTED' || activeRide?.status === 'RIDE_STARTED' || rideStage === 'RIDE_COMPLETED' || activeRide?.status === 'RIDE_COMPLETED';
    if (isStarted) return null;
    const activeRoute = routeCoordinates || routePolyline;
    if (activeRoute?.length > 1 && activeRoute.every(([lat, lng]) => (
      Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
    ))) {
      return activeRoute.map(([lat, lng]) => [Number(lat), Number(lng)]);
    }
    return null;
  }, [routeCoordinates, routePolyline, rideStage, activeRide?.status]);

  const tileConfig = TILE_PROVIDERS[activeTheme] || TILE_PROVIDERS.osm;
  const isPassengerOnBoard = rideStage === 'RIDE_STARTED' || activeRide?.status === 'RIDE_STARTED';
  const isTripCompleted = rideStage === 'RIDE_COMPLETED' || activeRide?.status === 'RIDE_COMPLETED';

  return (
    <div
      style={{ height: height || '100%', minHeight: '100%' }}
      className={`relative w-full h-full min-h-[300px] bg-slate-900 overflow-hidden ${className}`}
    >
      {/* Floating Exploration Banner (Uber / Google Maps style) */}
      {isExploring && !isTripCompleted && (
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

      {/* ── REAL-TIME ON-MAP FLOATING TRIP HUD (Slide-to-Dismiss / Swipeable) ── */}
      {activeDriverLocation && (activeRide || rideStage) && !isTripCompleted && (
        !isHudDismissed ? (
          <div
            className="absolute top-3 left-3 z-[400] max-w-xs sm:max-w-sm w-[calc(100%-1.5rem)] sm:w-full pointer-events-auto select-none touch-none"
            style={{
              transform: hudExitDirection === 'right'
                ? 'translateX(120%) scale(0.92)'
                : hudExitDirection === 'left'
                ? 'translateX(-120%) scale(0.92)'
                : hudDragOffset !== 0
                ? `translateX(${hudDragOffset}px) rotate(${hudDragOffset * 0.035}deg)`
                : 'translateX(0px)',
              opacity: hudExitDirection
                ? 0
                : hudDragOffset !== 0
                ? Math.max(0.12, 1 - Math.abs(hudDragOffset) / 220)
                : 1,
              transition: isHudDragging
                ? 'none'
                : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.28s ease',
            }}
            onTouchStart={(e) => handleHudDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleHudDragMove(e.touches[0].clientX)}
            onTouchEnd={handleHudDragEnd}
            onTouchCancel={handleHudDragEnd}
            onPointerDown={(e) => {
              if (e.target.closest('button')) return;
              try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch(_) {}
              handleHudDragStart(e.clientX);
            }}
            onPointerMove={(e) => handleHudDragMove(e.clientX)}
            onPointerUp={(e) => {
              try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch(_) {}
              handleHudDragEnd();
            }}
            onPointerCancel={handleHudDragEnd}
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-white cursor-grab active:cursor-grabbing hover:border-slate-600 transition-colors">
              {/* Top Drag Indicator / Dismiss Hint */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="w-10 h-1 rounded-full bg-slate-600/70 mx-auto" />
              </div>

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

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full font-bold">
                    {typeof activeDriverSpeed === 'number'
                      ? (activeDriverSpeed > 0 ? `${activeDriverSpeed} km/h` : 'Parked')
                      : typeof activeDriverLocation?.speed === 'number' && activeDriverLocation.speed > 0
                      ? `${activeDriverLocation.speed} km/h`
                      : 'Parked'}
                  </span>
                  {/* Quick Animated Dismiss Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissHud('right');
                    }}
                    className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Slide to remove (or tap ✕)"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2.5">
                <div>
                  <p className="text-lg font-black tracking-tight text-white leading-tight">
                    {activeDriverEta ? formatDuration(activeDriverEta) : isPassengerOnBoard ? '14 mins' : '3 mins'}
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

              {/* Discreet Swipe Hint */}
              <div className="mt-2 text-center">
                <span className="text-[9px] font-semibold text-slate-400/80 tracking-tight">
                  ↔ Slide smoothly left or right to dismiss
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsHudDismissed(false)}
            className="absolute top-3 left-3 z-[400] bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-xl text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 animate-in fade-in"
            title="Tap to view Ride HUD"
          >
            <span>{isPassengerOnBoard ? '🚗' : '🛺'}</span>
            <span>Show Ride Status</span>
          </button>
        )
      )}

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={currentZoom}
        style={{ height: '100%', width: '100%', minHeight: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        minZoom={4}
        maxZoom={20}
      >
        <TileLayer
          key={activeTheme}
          attribution={tileConfig.attribution}
          url={tileConfig.url}
          maxZoom={20}
          maxNativeZoom={tileConfig.maxNativeZoom || 19}
          subdomains={tileConfig.subdomains || 'abc'}
          className={tileConfig.className || ''}
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

        {/* ── Dynamic Route Polylines (Trip Route + Driver Approach) ────────── */}
        {/* 1. Trip Leg: Pickup to Destination */}
        {tripPositions && (
          <>
            {/* Outer Ambient Glow */}
            <Polyline
              positions={tripPositions}
              pathOptions={{ color: '#3b82f6', weight: 8, opacity: 0.35, lineCap: 'round', lineJoin: 'round' }}
            />
            {/* High-Definition Core Line */}
            <Polyline
              positions={tripPositions}
              pathOptions={{ color: '#2563eb', weight: 4.5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }}
            />
            {/* Directional Route Flow */}
            <Polyline
              positions={tripPositions}
              pathOptions={{ color: '#93c5fd', weight: 2, opacity: 0.9, dashArray: '6, 12', lineCap: 'round' }}
            />
          </>
        )}

        {/* 2. Driver Approach Leg: Driver Starting Position to Pickup Spot */}
        {approachPositions && (
          <>
            <Polyline
              positions={approachPositions}
              pathOptions={{ color: '#06b6d4', weight: 6, opacity: 0.4, lineCap: 'round', lineJoin: 'round' }}
            />
            <Polyline
              positions={approachPositions}
              pathOptions={{ color: '#0891b2', weight: 3.5, opacity: 0.95, dashArray: '5, 9', lineCap: 'round' }}
            />
          </>
        )}

        {/* Fleet Drivers on Map (Only when not in focused single active ride) */}
        {(!activeDriverLocation || !isPassengerOnBoard) && drivers.filter(d => d.status !== 'OFFLINE' && isValidCoordinate(d.location)).map(driver => (
          <Marker
            key={driver.id}
            position={[Number(driver.location.lat), Number(driver.location.lng)]}
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
        {isValidCoordinate(activeDriverLocation) && (
          <Marker
            position={[Number(activeDriverLocation.lat), Number(activeDriverLocation.lng)]}
            icon={createActiveRideVehicleIcon(
              activeDriverLocation.category || activeRide?.category || activeRide?.driverInfo?.category || 'MOTO',
              typeof activeDriverLocation.heading === 'number' ? activeDriverLocation.heading : 0,
              isPassengerOnBoard,
              activeRide?.driverInfo?.name || 'Driver',
              typeof activeDriverSpeed === 'number' ? activeDriverSpeed : (activeDriverLocation.speed || 0),
              rideStage === 'DRIVER_ARRIVED' || activeRide?.status === 'DRIVER_ARRIVED'
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
                {(() => {
                  const popCat = String(activeRide?.category || activeDriverLocation.category || activeRide?.driverInfo?.category || '').toUpperCase();
                  const popEmoji = popCat.includes('AUTO') || popCat.includes('TOTO') ? '🛺' : popCat.includes('BIKE') || popCat.includes('MOTO') ? '🏍️' : popCat.includes('XL') ? '🚚' : '🚗';
                  const popName = popCat.includes('AUTO') || popCat.includes('TOTO') ? 'Toto' : popCat.includes('BIKE') || popCat.includes('MOTO') ? 'Bike' : popCat.includes('XL') ? 'Transporter' : 'Cab';
                  return (
                    <p className="text-slate-600 font-medium">
                      {isPassengerOnBoard ? `${popEmoji} Passenger on board · Heading to destination` : `${popEmoji} ${popName} approaching pickup point`}
                    </p>
                  );
                })()}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pickup Marker: Shows live YOU beacon when waiting; transitions to start origin waypoint once in transit or completed */}
        {isValidCoordinate(pickup) && (
          <>
            {!isPassengerOnBoard && !isTripCompleted && (
              <Circle
                center={[Number(pickup.lat), Number(pickup.lng)]}
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
              position={[Number(pickup.lat), Number(pickup.lng)]}
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
        {showNearbyPassengers && MOCK_PASSENGERS.filter(p => isValidCoordinate(p.location)).map((passenger) => (
          <Marker
            key={passenger.id}
            position={[Number(passenger.location.lat), Number(passenger.location.lng)]}
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
        {isValidCoordinate(destination) && (
          <>
            {isTripCompleted && (
              <Circle
                center={[Number(destination.lat), Number(destination.lng)]}
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
              position={[Number(destination.lat), Number(destination.lng)]}
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

          {/* Theme switcher pill (100% Free OpenStreetMap Day / Night) */}
          <div className="bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-1">
            <button
              onClick={() => setActiveTheme(activeTheme === 'dark' ? 'osm' : 'dark')}
              className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              title="Toggle Map Style (OpenStreetMap Day / Night)"
            >
              <Layers size={11} className="text-blue-600" />
              <span>{activeTheme === 'dark' ? 'Day' : 'Night'}</span>
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
