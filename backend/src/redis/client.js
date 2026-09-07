/**
 * Redis Client
 * TODO: Install: npm i ioredis
 * TODO: Set REDIS_* env vars
 *
 * Used for:
 *  - Driver GEO locations: GEOADD / GEORADIUS
 *  - Surge multipliers: HSET surge:multipliers cellId value
 *  - Demand counters: INCR demand:cell:{h3id}
 *  - Session / JWT refresh tokens: SET token:userId value EX 86400
 *  - Rate limiting: INCR ratelimit:{ip} EX 900
 *  - Fare estimate cache: SET estimate:{pickupCell}:{destCell} fare EX 60
 */

// import Redis from 'ioredis';
//
// export const redis = new Redis({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: parseInt(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD || undefined,
//   retryStrategy: (times) => Math.min(times * 50, 2000),
// });
//
// redis.on('connect', () => console.log('✅ Redis connected'));
// redis.on('error', (err) => console.error('Redis error:', err));
//
// // GEO helpers
// export const updateDriverLocation = (driverId, lng, lat) =>
//   redis.geoadd('driver_locations', lng, lat, driverId);
//
// export const getNearbyDrivers = (lng, lat, radiusKm) =>
//   redis.georadius('driver_locations', lng, lat, radiusKm, 'km', 'WITHCOORD', 'WITHDIST', 'ASC');
//
// export const getSurgeMultiplier = (cellId) =>
//   redis.hget('surge:multipliers', cellId).then(v => parseFloat(v) || 1.0);
//
// export const setSurgeMultiplier = (cellId, value) =>
//   redis.hset('surge:multipliers', cellId, value);
//
// export const incrementDemand = (cellId) =>
//   redis.incr(`demand:cell:${cellId}`);

export const redis = null; // TODO: replace with real Redis client
console.log('⚡ Redis: not connected (stub — see backend/src/redis/client.js)');
