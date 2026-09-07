// Realistic analytics mock data for Mumbai mobility platform

const makeHourly = (baseVal, peakHours = [8, 9, 18, 19, 20]) =>
  Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${h.toString().padStart(2, '0')}:00`,
    value: Math.round(baseVal * (peakHours.includes(h) ? 1.8 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5)),
  }));

const makeDailySeries = (days, baseVal, trend = 0) =>
  Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    const dow = d.getDay();
    const weekendBoost = (dow === 0 || dow === 6) ? 1.3 : 1;
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: Math.round((baseVal + trend * i) * weekendBoost * (0.85 + Math.random() * 0.3)),
    };
  });

export const MOCK_ANALYTICS = {
  rideVolume: makeDailySeries(30, 3200, 15),
  revenue: makeDailySeries(30, 480000, 4000),
  activeUsers: makeDailySeries(30, 8400, 60),
  driverUtilization: makeDailySeries(30, 72, 0.2),
  avgETA: makeDailySeries(30, 4.8, -0.02),
  cancellationRate: makeDailySeries(30, 7.2, -0.05),
  driverSupply: makeDailySeries(30, 1240, 8),
  platformCommission: makeDailySeries(30, 96000, 800),

  peakHours: makeHourly(240),

  demandByRegion: [
    { region: 'Andheri', demand: 103, supply: 34, rides: 21, revenue: 52400 },
    { region: 'Mumbai Central', demand: 84, supply: 52, rides: 14, revenue: 38200 },
    { region: 'Powai', demand: 78, supply: 31, rides: 13, revenue: 41800 },
    { region: 'Bandra', demand: 61, supply: 48, rides: 9, revenue: 28600 },
    { region: 'Ghatkopar', demand: 55, supply: 43, rides: 8, revenue: 19200 },
    { region: 'Worli', demand: 42, supply: 58, rides: 6, revenue: 16800 },
    { region: 'Dadar', demand: 38, supply: 47, rides: 5, revenue: 14100 },
    { region: 'Colaba', demand: 29, supply: 19, rides: 4, revenue: 12600 },
  ],

  todayStats: {
    totalRides: 3487,
    revenue: 524300,
    activeUsers: 9210,
    onlineDrivers: 1312,
    availableDrivers: 724,
    activeRides: 188,
    avgETA: 4.3,
    cancellationRate: 6.8,
    surgeZones: 3,
    openIncidents: 4,
  },

  categoryBreakdown: [
    { category: 'ECONOMY', rides: 1820, revenue: 182000, share: 52 },
    { category: 'PREMIUM', rides: 420, revenue: 126000, share: 12 },
    { category: 'XL', rides: 380, revenue: 98800, share: 11 },
    { category: 'AUTO', rides: 510, revenue: 61200, share: 15 },
    { category: 'MOTO', rides: 290, revenue: 34800, share: 8 },
    { category: 'CARPOOL', rides: 67, revenue: 21440, share: 2 },
  ],
};
