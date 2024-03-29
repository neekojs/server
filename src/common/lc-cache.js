class LcCache {
    constructor() {
        this.localCached = {};
    }

    get(key) {
        return this.localCached[key];
    }

    set(key, val) {
        this.localCached[key] = val;
    }

    del(key) {
        delete this.localCached[key];
    }

    flush() {
        this.localCached = {};
    }

    keys() {
        return Object.keys(this.localCached);
    }
}

module.exports = LcCache;
