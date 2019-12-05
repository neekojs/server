const Memcached = require('memcached');

class McCache {
    constructor(_options) {
        this.fusing = false;
        const options = Object.assign({}, {
            retry: 500,
            poolSize: 5,
            retries: 5,
            failure: 20,
            reconnect: 18000000,
        }, _options);

        this.options = options;
        this._memcached = new Memcached(options.ip, options);
        this._memcached.on('failure', detail => {
            this.fusing = true;
            console.log(`mc cache failure, ${detail.server}: ${detail.messages.join(',')}`);
        });
        this._memcached.on('issue', detail => {
            console.log(`mc cache issue, ${detail.server}: ${detail.messages.join(',')}`);
        });
        this._memcached.on('reconnect', detail => {
            this.fusing = false;
            console.log(`mc cache reconnect, ${detail.server}: ${detail.messages.join(',')}`);
        });
        this._memcached.on('reconnecting', detail => {
            console.log(`Total downtime caused by server, ${detail.server}: ${detail.totalDownTime}ms`);
        });
        this._memcached.on('remove', detail => {
            this.fusing = true;
            console.log(`remove, ${detail.server}: ${detail.messages.join(',')}`);
        });
    }

    get(key) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (self.fusing) return resolve('');
            self._memcached.get(key, (err, data) => {
                if (err) {
                    console.log('mc cache get error : ', err);
                    return reject(err);
                }
                return resolve(data);
            })
        });
    }

    set(key, value, lifetime = 10) {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (self.fusing) return resolve('');
            self._memcached.set(key, value, lifetime, (err) => {
                if (err) {
                    console.log('mc cache set error : ', err);
                    return reject(err);
                }
                return resolve();
            })
        });
    }

    del(key) {
        // todo mc delete
        console.log('todo', key);
    }
}

module.exports = McCache;
