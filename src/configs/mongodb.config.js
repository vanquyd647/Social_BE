const dev  = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        name: process.env.DB_NAME || 'social-network',
        port: process.env.DB_PORT || 27017
    }
}

const env =  process.env.NODE_ENV || 'dev';
const config = {dev};

module.exports = config[env];
