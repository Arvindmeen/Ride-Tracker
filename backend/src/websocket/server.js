/**
 * WebSocket Server — Real-time Event Hub
 * TODO: Install: npm i ws
 *
 * Event types pushed to clients:
 *  DRIVER_LOCATION_UPDATE  — { driverId, lat, lng, speed, heading }
 *  RIDE_STATUS_UPDATE      — { rideId, status, eta }
 *  DRIVER_ASSIGNED         — { rideId, driver, vehicle, eta }
 *  SURGE_UPDATE            — { cellId, multiplier }
 *  INCIDENT_ALERT          — { incidentId, severity, message }
 *
 * Client subscriptions:
 *  User app subscribes to: their rideId events
 *  Driver app subscribes to: their driverId + incoming requests
 *  Admin map subscribes to: all driver locations + surge zones
 *
 * Architecture:
 *  Kafka consumer 'driver.gps' → update Redis GEO → broadcast via WebSocket
 *  Kafka consumer 'ride.*'    → push ride status updates to relevant clients
 *  Kafka consumer 'pricing.*' → push surge updates to admin map
 */

// import { WebSocketServer, WebSocket } from 'ws';
//
// const clients = new Map(); // clientId → { ws, subscriptions: Set<string> }
//
// export function startWebSocket(server) {
//   const wss = new WebSocketServer({ server, path: '/ws' });
//
//   wss.on('connection', (ws, req) => {
//     // TODO: Extract JWT from query params: const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
//     // TODO: Verify JWT → get userId, role
//     const clientId = `client_${Date.now()}`;
//     clients.set(clientId, { ws, subscriptions: new Set() });
//
//     ws.on('message', (data) => {
//       const msg = JSON.parse(data);
//       if (msg.type === 'SUBSCRIBE') {
//         clients.get(clientId)?.subscriptions.add(msg.channel);
//       }
//     });
//
//     ws.on('close', () => clients.delete(clientId));
//     ws.on('error', (err) => console.error('WS error:', err));
//   });
//
//   console.log('✅ WebSocket server started on /ws');
//   return wss;
// }
//
// export function broadcast(channel, data) {
//   const payload = JSON.stringify({ channel, data, timestamp: Date.now() });
//   clients.forEach(({ ws, subscriptions }) => {
//     if (subscriptions.has(channel) && ws.readyState === WebSocket.OPEN) {
//       ws.send(payload);
//     }
//   });
// }

export const startWebSocket = () => { console.log('🔌 WebSocket: not configured (stub)'); };
export const broadcast = () => {};
