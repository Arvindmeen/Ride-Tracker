/**
 * Apache Flink Pricing Engine — Design Stub
 *
 * This file documents the pricing engine architecture.
 * The actual Flink job runs as a separate JVM process (Java/Scala).
 * This Node.js file shows how the backend interacts with Flink's output.
 *
 * Flink Job: DynamicPricingJob
 * ─────────────────────────────
 * Input:  Kafka topic 'ride.requested' (stream of ride requests)
 * Input:  Kafka topic 'driver.gps'     (stream of driver locations)
 *
 * Processing every 30 seconds (tumbling window):
 *  1. Count demand = ride requests per H3 cell in last 5 min
 *  2. Count supply = available drivers per H3 cell (from Redis GEO)
 *  3. Calculate ratio = demand / supply
 *  4. Apply surge formula:
 *     if ratio > 3.0 → surge = 3.0x (cap)
 *     if ratio > 2.0 → surge = 2.5x
 *     if ratio > 1.5 → surge = 2.0x
 *     if ratio > 1.2 → surge = 1.5x
 *     else           → surge = 1.0x
 *  5. Write to Redis: HSET surge:multipliers {cellId} {surge}
 *  6. Produce to Kafka 'pricing.updated': { cellId, surge, demand, supply, timestamp }
 *  7. Insert into PostgreSQL pricing_snapshots table
 *
 * Output: Kafka topic 'pricing.updated'
 *
 * Backend interaction:
 *  - Fare estimate: reads surge from Redis (fast, sub-millisecond)
 *  - Admin map: receives WebSocket push from Kafka consumer 'pricing.updated'
 *  - Analytics: reads from pricing_snapshots PostgreSQL table
 */

/**
 * Surge calculation formula (mirrors Flink job logic for frontend validation)
 * Used for client-side fare estimates while backend is being built.
 */
export function calculateSurge(demand, supply) {
  if (supply === 0) return 3.0;
  const ratio = demand / supply;
  if (ratio >= 3.0) return 3.0;
  if (ratio >= 2.0) return 2.5;
  if (ratio >= 1.5) return 2.0;
  if (ratio >= 1.2) return 1.5;
  return 1.0;
}

export function calculateFare({ category, distanceKm, durationMin, surgeMultiplier = 1.0, promoDiscount = 0 }) {
  const pricing = {
    ECONOMY:  { base: 40, perKm: 12, perMin: 1.5 },
    PREMIUM:  { base: 80, perKm: 22, perMin: 3.0 },
    XL:       { base: 70, perKm: 18, perMin: 2.5 },
    MOTO:     { base: 20, perKm: 7,  perMin: 0.8 },
    AUTO:     { base: 25, perKm: 9,  perMin: 1.0 },
    CARPOOL:  { base: 30, perKm: 8,  perMin: 1.0 },
  };

  const p = pricing[category] || pricing.ECONOMY;
  const baseFare = p.base + (distanceKm * p.perKm) + (durationMin * p.perMin);
  const surgedFare = baseFare * surgeMultiplier;
  const discount = promoDiscount;
  const tax = (surgedFare - discount) * 0.05;
  const total = Math.round(surgedFare - discount + tax);

  return {
    base: Math.round(p.base),
    distance: Math.round(distanceKm * p.perKm),
    time: Math.round(durationMin * p.perMin),
    surge: Math.round(baseFare * (surgeMultiplier - 1)),
    surgeMultiplier,
    discount: Math.round(discount),
    tax: Math.round(tax),
    total,
    currency: 'INR',
  };
}
