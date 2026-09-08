import React from 'react';
import { clsx } from 'clsx';

/**
 * Realistic vector vehicle icons for Bike/Moto, Auto Rickshaw, City Cab, Premium Sedan, XL SUV, and Carpool.
 * High-fidelity, scalable SVG graphics with fine automotive details.
 */
export function VehicleIcon({ category = 'ECONOMY', size = 'md', className, active = false }) {
  const cat = String(category).toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // ── 1. MOTO / BIKE ─────────────────────────────────────────────────────────────
  if (cat === 'MOTO' || cat === 'BIKE' || cat === 'MOTORCYCLE') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(currentSize, 'shrink-0 transition-transform duration-200', className)}
      >
        <defs>
          <linearGradient id="bikeBodyGrad" x1="16" y1="20" x2="48" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="metalGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#94A3B8" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="32" cy="54" rx="26" ry="3.5" fill="#0F172A" fillOpacity="0.12" />

        {/* Rear Wheel (Left) */}
        <circle cx="16" cy="42" r="10" stroke="#1E293B" strokeWidth="4" fill="#F8FAFC" />
        <circle cx="16" cy="42" r="6" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="16" cy="42" r="2.5" fill="#334155" />

        {/* Front Wheel (Right) */}
        <circle cx="48" cy="42" r="10" stroke="#1E293B" strokeWidth="4" fill="#F8FAFC" />
        <circle cx="48" cy="42" r="6" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="48" cy="42" r="2.5" fill="#334155" />

        {/* Exhaust pipe */}
        <path d="M22 45L34 45C36 45 38 44 39 42L40 40" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Main Chassis & Engine block */}
        <path d="M24 42L32 40L36 34L28 34Z" fill="#334155" />
        <circle cx="31" cy="38" r="3" fill="#64748B" />

        {/* Rear Swingarm */}
        <line x1="16" y1="42" x2="28" y2="40" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

        {/* Front Fork suspension */}
        <line x1="48" y1="42" x2="40" y2="22" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

        {/* Bike Body, Fuel Tank & Tail */}
        <path
          d="M17 31C20 31 22 30 25 30C27 30 29 27 32 25C35 23 40 24 41 27L43 31L33 34L22 34L16 33C14.5 33 14 31 17 31Z"
          fill="url(#bikeBodyGrad)"
        />

        {/* Sport Seat (Black Leather) */}
        <path
          d="M19 30C21 30 24 30 26 30C27.5 30 28 29 29 28C26 28 23 28 20 28.5C18 29 17.5 30 19 30Z"
          fill="#0F172A"
        />

        {/* Handlebar & Windshield Visor */}
        <path d="M38 21L42 19L44 20" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M42 19L44 14C44 14 46 16 46 18L43 22" fill="#38BDF8" fillOpacity="0.8" />

        {/* Headlight */}
        <circle cx="45.5" cy="23.5" r="2" fill="#FACC15" />
        <path d="M46.5 22L51 21" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path d="M47 24L52 24.5" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

        {/* Speed Badge */}
        <circle cx="34" cy="28" r="1.5" fill="#93C5FD" />
      </svg>
    );
  }

  // ── 2. AUTO RICKSHAW ───────────────────────────────────────────────────────────
  if (cat === 'AUTO' || cat === 'RICKSHAW' || cat === 'TUKTUK') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(currentSize, 'shrink-0 transition-transform duration-200', className)}
      >
        <defs>
          <linearGradient id="autoYellowRoof" x1="16" y1="12" x2="48" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FACC15" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="autoGreenBody" x1="14" y1="28" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="32" cy="54" rx="26" ry="3.5" fill="#0F172A" fillOpacity="0.12" />

        {/* Rear Wheel (Left) */}
        <circle cx="18" cy="45" r="8" stroke="#1E293B" strokeWidth="3.5" fill="#F8FAFC" />
        <circle cx="18" cy="45" r="4.5" stroke="#94A3B8" strokeWidth="1.5" />
        <circle cx="18" cy="45" r="2" fill="#334155" />

        {/* Front Wheel (Right - Single) */}
        <circle cx="47" cy="46" r="7" stroke="#1E293B" strokeWidth="3" fill="#F8FAFC" />
        <circle cx="47" cy="46" r="4" stroke="#94A3B8" strokeWidth="1.2" />
        <circle cx="47" cy="46" r="1.8" fill="#334155" />

        {/* Auto Lower Body (Green Metal Chassis) */}
        <path
          d="M13 36C13 33 15 31 18 31H34V42H17C14.8 42 13 40.2 13 38V36Z"
          fill="url(#autoGreenBody)"
        />
        {/* Front Cockpit Floor & Mudguard */}
        <path
          d="M34 38L42 38C44 38 46 39.5 47 41.5L48 43L43 45L34 45V38Z"
          fill="#065F46"
        />

        {/* Signature Auto Rickshaw Curved Hood/Roof (Yellow Canopy) */}
        <path
          d="M12 25C12 18 16 14 23 14H40C44 14 47 17 48 21L49 26H13C12.4 26 12 25.5 12 25Z"
          fill="url(#autoYellowRoof)"
        />

        {/* Front Windshield Glass */}
        <path
          d="M41 21L47.5 24.5L44 35L38 35L38 21H41Z"
          fill="#BAE6FD"
          fillOpacity="0.85"
          stroke="#0F172A"
          strokeWidth="1.2"
        />

        {/* Passenger Open Window / Entrance with Rear Pillar */}
        <path
          d="M15 26H35V33H15V26Z"
          fill="#1E293B"
          fillOpacity="0.2"
        />
        <rect x="23" y="26" width="2" height="7" fill="#EAB308" />

        {/* Passenger Seat Cushion */}
        <path d="M16 32H27C28 32 28.5 33 28.5 34V36H15V33C15 32.4 15.4 32 16 32Z" fill="#334155" />

        {/* Driver Handlebar */}
        <line x1="39" y1="34" x2="43" y2="33" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

        {/* Front Round Headlight */}
        <circle cx="50" cy="38" r="2.5" fill="#FACC15" stroke="#E2E8F0" strokeWidth="0.8" />
        <path d="M51 36.5L55 35" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path d="M52 39.5L56 40.5" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

        {/* Yellow/Black Decorative Waist Stripe */}
        <line x1="13" y1="35" x2="34" y2="35" stroke="#FACC15" strokeWidth="1.5" />
      </svg>
    );
  }

  // ── 3. CAB / ECONOMY (Sedan / Hatchback Taxi) ──────────────────────────────────
  if (cat === 'ECONOMY' || cat === 'CAB' || cat === 'TAXI' || cat === 'MINI') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(currentSize, 'shrink-0 transition-transform duration-200', className)}
      >
        <defs>
          <linearGradient id="cabBodyGrad" x1="10" y1="20" x2="54" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="cabGlassGrad" x1="20" y1="20" x2="44" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BAE6FD" />
            <stop offset="1" stopColor="#7DD3FC" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="32" cy="54" rx="27" ry="3.5" fill="#0F172A" fillOpacity="0.14" />

        {/* Rear Wheel */}
        <circle cx="18" cy="46" r="7.5" stroke="#0F172A" strokeWidth="3.5" fill="#F1F5F9" />
        <circle cx="18" cy="46" r="4" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="18" cy="46" r="1.8" fill="#1E293B" />

        {/* Front Wheel */}
        <circle cx="47" cy="46" r="7.5" stroke="#0F172A" strokeWidth="3.5" fill="#F1F5F9" />
        <circle cx="47" cy="46" r="4" stroke="#64748B" strokeWidth="1.5" />
        <circle cx="47" cy="46" r="1.8" fill="#1E293B" />

        {/* Taxi Rooftop Light */}
        <rect x="29" y="15" width="8" height="3" rx="1" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.8" />
        <rect x="31" y="14" width="4" height="1" fill="#FEF08A" />

        {/* Main Car Body Profile */}
        <path
          d="M8 38C8 35 10 33 13 33L19 33L24 21C25 19 27 18 30 18H40C43 18 45.5 19.5 47 22L52 32L56 34C58 35 59 37 59 39V43C59 44.5 57.5 45.5 56 45.5H53.5C52.5 42 49 40 46 40C43 40 39.5 42 38.5 45.5H26.5C25.5 42 22 40 19 40C16 40 12.5 42 11.5 45.5H10C8.5 45.5 8 44.5 8 43V38Z"
          fill="url(#cabBodyGrad)"
        />

        {/* Windows Cabin Glass */}
        <path
          d="M24.5 22.5C25.2 21 26.5 20 28.5 20H33V31H19.5L24.5 22.5Z"
          fill="url(#cabGlassGrad)"
          fillOpacity="0.9"
        />
        <path
          d="M35 20H39.5C41.5 20 43 21 44.2 23L48.5 31H35V20Z"
          fill="url(#cabGlassGrad)"
          fillOpacity="0.9"
        />

        {/* Center Pillar */}
        <line x1="34" y1="20" x2="34" y2="31" stroke="#1D4ED8" strokeWidth="2" />

        {/* Door Handle Accents */}
        <rect x="29" y="34" width="3" height="1.2" rx="0.6" fill="#1E293B" />
        <rect x="39" y="34" width="3" height="1.2" rx="0.6" fill="#1E293B" />

        {/* Front Headlight */}
        <path d="M54 36L58 37C58.5 37.2 59 38 59 39L54 39V36Z" fill="#FEF08A" />

        {/* Rear Taillight */}
        <path d="M8 36L10 36V40L8 40V36Z" fill="#F43F5E" />
      </svg>
    );
  }

  // ── 4. PREMIUM (Luxury Executive Sedan) ────────────────────────────────────────
  if (cat === 'PREMIUM' || cat === 'SEDAN' || cat === 'LUXURY') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(currentSize, 'shrink-0 transition-transform duration-200', className)}
      >
        <defs>
          <linearGradient id="premBodyGrad" x1="8" y1="18" x2="56" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E1B4B" />
            <stop offset="0.5" stopColor="#312E81" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="premGlassGrad" x1="20" y1="18" x2="46" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" stopOpacity="0.75" />
            <stop offset="1" stopColor="#0284C7" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="chromeGrad" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset="0.5" stopColor="#CBD5E1" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>
        </defs>

        {/* Ground shadow with premium dark blur effect */}
        <ellipse cx="32" cy="54" rx="28" ry="3.5" fill="#0F172A" fillOpacity="0.2" />

        {/* Alloy Wheels (Sport Rim with Multi-spoke) */}
        <circle cx="17" cy="46" r="7.5" stroke="#0F172A" strokeWidth="3" fill="#1E293B" />
        <circle cx="17" cy="46" r="4.5" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 1" />
        <circle cx="17" cy="46" r="1.8" fill="#F8FAFC" />

        <circle cx="48" cy="46" r="7.5" stroke="#0F172A" strokeWidth="3" fill="#1E293B" />
        <circle cx="48" cy="46" r="4.5" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 1" />
        <circle cx="48" cy="46" r="1.8" fill="#F8FAFC" />

        {/* Sleek Aerodynamic Sedan Chassis */}
        <path
          d="M6 38C6 35.5 8 33.5 11 33.5L18 33.5L25 21C26.5 18.5 29 17.5 32 17.5H42C45 17.5 48 19 49.5 22L55 32L59 34.5C60.5 35.5 61 37 61 39V43C61 44.5 59.5 45.5 58 45.5H55C54 42 50.5 40 47.5 40C44.5 40 41 42 40 45.5H25C24 42 20.5 40 17.5 40C14.5 40 11 42 10 45.5H8C6.5 45.5 6 44.5 6 43V38Z"
          fill="url(#premBodyGrad)"
        />

        {/* Chrome Waistline Accent */}
        <path d="M12 34.5L56 34.5" stroke="url(#chromeGrad)" strokeWidth="1.2" strokeLinecap="round" />

        {/* Tinted Executive Cabin Windows */}
        <path
          d="M25.5 22.5C26.5 20.5 28 19.5 30.5 19.5H35V31.5H20.5L25.5 22.5Z"
          fill="url(#premGlassGrad)"
        />
        <path
          d="M37 19.5H41.5C43.5 19.5 45.5 20.5 46.8 22.5L51.5 31.5H37V19.5Z"
          fill="url(#premGlassGrad)"
        />

        {/* Chrome Door handles */}
        <rect x="31" y="36" width="3.5" height="1.2" rx="0.6" fill="#CBD5E1" />
        <rect x="42" y="36" width="3.5" height="1.2" rx="0.6" fill="#CBD5E1" />

        {/* Xenon Crystal Headlight */}
        <path d="M56 36L60.5 37.5L61 39.5L56 39V36Z" fill="#E0F2FE" />
        <line x1="57" y1="38" x2="61" y2="38" stroke="#38BDF8" strokeWidth="1" />

        {/* LED Taillight Strip */}
        <path d="M6 36.5L8.5 36.5L8.5 39.5L6 39.5V36.5Z" fill="#EF4444" />
      </svg>
    );
  }

  // ── 5. XL (Spacious SUV / 6-7 Seater) ──────────────────────────────────────────
  if (cat === 'XL' || cat === 'SUV' || cat === 'VAN') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx(currentSize, 'shrink-0 transition-transform duration-200', className)}
      >
        <defs>
          <linearGradient id="suvBodyGrad" x1="8" y1="16" x2="56" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F766E" />
            <stop offset="1" stopColor="#115E59" />
          </linearGradient>
          <linearGradient id="suvGlassGrad" x1="18" y1="16" x2="48" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#99F6E4" stopOpacity="0.8" />
            <stop offset="1" stopColor="#2DD4BF" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="32" cy="54" rx="28" ry="3.5" fill="#0F172A" fillOpacity="0.15" />

        {/* Rugged Big Wheels */}
        <circle cx="17" cy="46" r="8" stroke="#0F172A" strokeWidth="4" fill="#F8FAFC" />
        <circle cx="17" cy="46" r="4.5" stroke="#475569" strokeWidth="1.5" />
        <circle cx="17" cy="46" r="2" fill="#1E293B" />

        <circle cx="48" cy="46" r="8" stroke="#0F172A" strokeWidth="4" fill="#F8FAFC" />
        <circle cx="48" cy="46" r="4.5" stroke="#475569" strokeWidth="1.5" />
        <circle cx="48" cy="46" r="2" fill="#1E293B" />

        {/* SUV Roof Rack Rails */}
        <line x1="20" y1="13" x2="45" y2="13" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
        <line x1="23" y1="14" x2="23" y2="16" stroke="#475569" strokeWidth="1.5" />
        <line x1="42" y1="14" x2="42" y2="16" stroke="#475569" strokeWidth="1.5" />

        {/* Bold SUV Chassis */}
        <path
          d="M7 36C7 33 8.5 31 11.5 31H16L21 16C21.8 14.8 23.5 14 25 14H46C48 14 50 15 51 17L56 30L59 32C60.5 33 61.5 35 61.5 37V42C61.5 44 60 45 58 45H55C54 41.5 50.5 39 47 39C43.5 39 40 41.5 39 45H26C25 41.5 21.5 39 18 39C14.5 39 11 41.5 10 45H8.5C7.2 45 7 44 7 42V36Z"
          fill="url(#suvBodyGrad)"
        />

        {/* Multi-Window Cabin (3 Rows) */}
        <path d="M22 17H31V29H16L22 17Z" fill="url(#suvGlassGrad)" />
        <rect x="33" y="17" width="10" height="12" fill="url(#suvGlassGrad)" />
        <path d="M45 17H47C48.2 17 49.5 17.8 50 19L54 29H45V17Z" fill="url(#suvGlassGrad)" />

        {/* Headlight */}
        <path d="M57 33L61 34.5V38H56V33Z" fill="#FEF08A" />

        {/* Taillight */}
        <path d="M7 32L9.5 32V38H7V32Z" fill="#F43F5E" />
      </svg>
    );
  }

  // ── 6. CARPOOL / SHARE ────────────────────────────────────────────────────────
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx(currentSize, 'shrink-0 transition-transform duration-200', className)}
    >
      <ellipse cx="32" cy="54" rx="26" ry="3.5" fill="#0F172A" fillOpacity="0.12" />
      <circle cx="18" cy="46" r="7.5" stroke="#0F172A" strokeWidth="3.5" fill="#F1F5F9" />
      <circle cx="47" cy="46" r="7.5" stroke="#0F172A" strokeWidth="3.5" fill="#F1F5F9" />
      <path
        d="M8 38C8 35 10 33 13 33L19 33L24 21C25 19 27 18 30 18H40C43 18 45.5 19.5 47 22L52 32L56 34C58 35 59 37 59 39V43C59 44.5 57.5 45.5 56 45.5H53.5C52.5 42 49 40 46 40C43 40 39.5 42 38.5 45.5H26.5C25.5 42 22 40 19 40C16 40 12.5 42 11.5 45.5H10C8.5 45.5 8 44.5 8 43V38Z"
        fill="#4F46E5"
      />
      <circle cx="28" cy="24" r="3" fill="#A5B4FC" />
      <circle cx="38" cy="24" r="3" fill="#A5B4FC" />
      <path d="M25 29C25 27 27 27 28 27C29 27 31 27 31 29" stroke="#E0E7FF" strokeWidth="1.5" />
      <path d="M35 29C35 27 37 27 38 27C39 27 41 27 41 29" stroke="#E0E7FF" strokeWidth="1.5" />
    </svg>
  );
}
