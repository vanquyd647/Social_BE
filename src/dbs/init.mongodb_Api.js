'use strict';

const mongoose = require('mongoose');

// Update the `mongodb+srv` connection string as per your requirements
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const clusterURL = process.env.CLUSTER_URL;
const name = process.env.DB_NAME;


const connectDB = `mongodb+srv://${dbUser}:${dbPassword}@${clusterURL}/${name}?retryWrites=true&w=majority&appName=Cluster0`;

class Database {
    constructor() {
        this.connect();
    }

    // Connect to the database
    connect(type = 'mongodb+srv') {
        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }

        mongoose.connect(connectDB, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        }).then(() => {
            console.log(`MongoDB connected to database: ${name}`);
        }).catch((err) => {
            console.error('Error connecting to MongoDB:', err);
        });
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Database();
        }

        return this.instance;
    }
}

const instance = Database.getInstance();

module.exports = instance;
