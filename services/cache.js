const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const config = require('config');

const redisUrl = config.get('redisURI');
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

const populateModel = function( doc, pop ){
    const model = new this.model(doc);

    for (const key in pop) {
        const { model: childModel, path } = pop[key];
        model[path] = new childModel(doc[path]);
    }

    return model;
}

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || 'default');

    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name });

    const cacheValue = await client.hget(this.hashKey, key);

    if ( cacheValue ) {
        const doc = JSON.parse( cacheValue );

        if (Array.isArray(doc)) {
            return doc.map( d => {
                return populateModel.call(this, d, this.mongooseOptions().populate);
            });
        }
        return populateModel.call(this, doc, this.mongooseOptions().populate);
     }

    const result = await exec.apply(this, arguments);

    if (result) client.hset(this.hashKey, key, JSON.stringify(result));

    return result;
};

const clearHash = function(hashKey){
    client.del(JSON.stringify(hashKey));
}

module.exports = {
    clearHash
}