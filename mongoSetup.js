const { MongoClient } = require('mongodb');
const { mongo_uri } = require('./config.json');

const mongo = new MongoClient(mongo_uri, { maxPoolSize: 10 });

module.exports = {
    mongo,
};
