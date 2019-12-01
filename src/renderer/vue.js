const VueServerRenderer = require('vue-server-renderer');
const LRU = require('lru-cache');

const lruSvr = new LRU({
    max: 500,
    maxAge: 1000 * 60,
});
const defaultCache = {
    get: (key, cb) => {
        let str = lruSvr.get(key);
        cb(str)
    },
    set: (key, val) => {
        lruSvr.set(key, val);
    }
};
const _bundleCache = {};
const _renderCache = {};

function createRenderer(option) {
    const bundle = (typeof option.bundle === 'string') ? JSON.parse(option.bundle) : option.bundle;
    const manifest = (typeof option.manifest === 'string') ? JSON.parse(option.manifest) : option.manifest;
    return VueServerRenderer.createBundleRenderer(option.bundle, {
        template: option.template,
        clientManifest: option.manifest,
        runInNewContext: option.runInNewContext || false,
        inject: option.inject !== false,
        shouldPreload: option.shouldPreload || function () {
            return true;
        },
        cache: option.cache || defaultCache
    })
}

function getRenderer(option) {
    // 无 appName
    if (!option.appName || !option.cacheBundle) {
        return createRenderer(option);
    }

    // 有 appName
    const appName = option.appName;
    if (
        _bundleCache[appName] === option.bundle
        && _renderCache[appName]
    ) {
        return _renderCache[appName];
    }
    _bundleCache[appName] = option.bundle;
    _renderCache[appName] = createRenderer(option);
    return _renderCache[appName]
}

function vueSSR(option) {
    return new Promise(function (resolve, reject) {
        console.log('SSR renderToString');
        getRenderer(option).renderToString(option.context, function (err, html) {
            if (err) return reject(err);
            return resolve(html);
        })
    })
}


module.exports = {
    vueSSR
};
