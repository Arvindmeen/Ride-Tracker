export const MOCK_GRID_CELLS = [
  { id: 'GRID_001', center: { lat: 19.076, lng: 72.8777 }, demand: 84, supply: 52, activeRides: 14, availableDrivers: 7, avgETA: 3.2, ratio: 1.62, surge: 1.5, isHighDemand: true, isSurge: true, zone: 'Mumbai Central' },
  { id: 'GRID_002', center: { lat: 19.0176, lng: 72.8562 }, demand: 61, supply: 48, activeRides: 9, availableDrivers: 11, avgETA: 4.1, ratio: 1.27, surge: 1.2, isHighDemand: false, isSurge: false, zone: 'Bandra' },
  { id: 'GRID_003', center: { lat: 19.1136, lng: 72.8697 }, demand: 103, supply: 34, activeRides: 21, availableDrivers: 4, avgETA: 7.8, ratio: 3.03, surge: 2.5, isHighDemand: true, isSurge: true, zone: 'Andheri' },
  { id: 'GRID_004', center: { lat: 19.0607, lng: 72.8362 }, demand: 42, supply: 58, activeRides: 6, availableDrivers: 16, avgETA: 2.1, ratio: 0.72, surge: 1.0, isHighDemand: false, isSurge: false, zone: 'Worli' },
  { id: 'GRID_005', center: { lat: 18.9387, lng: 72.8354 }, demand: 29, supply: 19, activeRides: 4, availableDrivers: 3, avgETA: 5.4, ratio: 1.53, surge: 1.4, isHighDemand: false, isSurge: false, zone: 'Colaba' },
  { id: 'GRID_006', center: { lat: 19.1663, lng: 72.9561 }, demand: 78, supply: 31, activeRides: 13, availableDrivers: 5, avgETA: 6.2, ratio: 2.52, surge: 2.0, isHighDemand: true, isSurge: true, zone: 'Powai' },
  { id: 'GRID_007', center: { lat: 19.1255, lng: 72.9085 }, demand: 55, supply: 43, activeRides: 8, availableDrivers: 9, avgETA: 3.7, ratio: 1.28, surge: 1.2, isHighDemand: false, isSurge: false, zone: 'Ghatkopar' },
  { id: 'GRID_008', center: { lat: 19.033, lng: 72.844 }, demand: 38, supply: 47, activeRides: 5, availableDrivers: 12, avgETA: 2.4, ratio: 0.81, surge: 1.0, isHighDemand: false, isSurge: false, zone: 'Dadar' },
];

const surgeByHour = [1,1,1,1,1,1.1,1.3,1.8,2.0,1.5,1.2,1.1,1,1.1,1.2,1.3,1.5,1.8,2.2,2.5,2,1.5,1.2,1];

export const MOCK_PRICING_HISTORY = Array.from({ length: 24 }, (_, i) => {
  const ts = new Date(Date.now() - (23 - i) * 3600000);
  const surge = surgeByHour[ts.getHours()] || 1;
  const demand = Math.round(30 + surge * 40 + Math.random() * 15);
  const supply = Math.round(65 - surge * 10 - Math.random() * 8);
  return { timestamp: ts.toISOString(), hour: ts.getHours(), demand, supply, surge, price: Math.round(40 * surge) };
});
