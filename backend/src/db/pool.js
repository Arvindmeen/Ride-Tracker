/**
 * PostgreSQL Database Connection Pool
 *
 * TODO: Install: npm i pg
 * TODO: Set DB_* env vars in .env
 *
 * Usage:
 *   import { query } from './db/pool.js';
 *   const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */

// import pg from 'pg';
// const { Pool } = pg;
//
// export const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT),
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });
//
// export const query = (text, params) => pool.query(text, params);
//
// pool.on('error', (err) => {
//   console.error('PostgreSQL pool error:', err);
// });

export const pool = null; // TODO: replace with real pool
export const query = async () => { throw new Error('Database not configured yet'); };

console.log('📦 PostgreSQL: not connected (stub — see backend/src/db/pool.js)');
