const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect().catch(console.error);

async function getCache(key) { try { const r = await client.get(key); return r ? JSON.parse(r) : null; } catch (e) { console.error('Redis get error', e); return null; } }
async function setCache(key, value, ttlSec = 300) { try { await client.set(key, JSON.stringify(value), { EX: ttlSec }); } catch (e) { console.error('Redis set error', e); } }

module.exports = { client, getCache, setCache };
