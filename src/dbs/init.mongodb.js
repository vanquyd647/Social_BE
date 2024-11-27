'use strict';

const mongoose = require('mongoose');
const { db: {host, name, port}} = require("../configs/mongodb.config");

const connectDB = `mongodb://${host}:${port}/${name}`;


class Database {
    constructor() {
        this.connect();
    }

    // Connect to the database
    connect(type = 'mongodb') {
        if(1 ===1){
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }

        mongoose.connect(connectDB).then( _ => {
            console.log(`MongoDB connected ${name}`);
        }).catch((err) => {
            console.error(err);
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