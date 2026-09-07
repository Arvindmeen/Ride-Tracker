/**
 * Kafka Producers
 * TODO: Install: npm i kafkajs
 *
 * Topics:
 *  ride.requested      — new ride booking
 *  ride.assigned       — driver assigned by Flink
 *  ride.started        — ride begun
 *  ride.completed      — ride finished
 *  ride.cancelled      — ride cancelled
 *  driver.gps          — driver GPS update (high-throughput)
 *  driver.status       — driver online/offline
 *  pricing.updated     — Flink pricing engine output
 *  incidents.critical  — ops alert
 *  auth.events         — login / logout events
 */

// import { Kafka } from 'kafkajs';
//
// const kafka = new Kafka({
//   clientId: process.env.KAFKA_CLIENT_ID || 'ridetracker-backend',
//   brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
//   retry: { initialRetryTime: 300, retries: 8 },
// });
//
// const producer = kafka.producer({
//   allowAutoTopicCreation: false,
//   transactionalId: 'ridetracker-producer',
// });
//
// export const connectProducer = async () => {
//   await producer.connect();
//   console.log('✅ Kafka producer connected');
// };
//
// export const produce = async (topic, key, value) => {
//   await producer.send({
//     topic,
//     messages: [{ key, value: JSON.stringify(value) }],
//   });
// };
//
// // Convenience producers
// export const emitRideRequested = (ride) => produce('ride.requested', ride.id, ride);
// export const emitDriverGPS = (driverId, lat, lng, speed) =>
//   produce('driver.gps', driverId, { driverId, lat, lng, speed, timestamp: Date.now() });
// export const emitRideCancelled = (rideId, reason) =>
//   produce('ride.cancelled', rideId, { rideId, reason, timestamp: Date.now() });

export const produce = async () => { console.warn('Kafka not configured'); };
console.log('📨 Kafka: not connected (stub — see backend/src/kafka/producers.js)');
