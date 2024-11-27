const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

client.on('connect', () => {
    console.log('Redis connected');
});

client.on('error', (err) => {
    console.log('Redis error: ', err);
});

module.exports = client;
