const Koa = require('koa');
const LocalCache = require('./common/lc-cache');
const { vueSSR } = require('./renderer/vue');

class Server {
    constructor() {
        this.app = new Koa();
        this.cacheSvr = new LocalCache();
    }

    use(...args) {
        this.app.use.apply(this.app, args);
    }

    listen(...args) {
        this.app.listen.apply(this.app, args);
    }

    setCacheSvr(cacheSvr) {
        if (cacheSvr && typeof cacheSvr.get === 'function'
            && typeof cacheSvr.set === 'function'
            && typeof cacheSvr.del === 'function') {
            this.cacheSvr = cacheSvr;
        }
    }

    getCacheSvr() {
        return this.cacheSvr;
    }

    async getVueResources(appName, serverConfig) {
        throw Error('function[getVueResources] must be overwrite');
    }

    injectVueSSR() {
        this.app.context.vueSSR = async ({ appName, context: _context, serverConfig }) => {
            const ctx = this;
            const src = await this.getVueResources(appName, serverConfig);
            const context = Object.assign({ url: ctx.url }, ctx.state, _context);
            const options = {
                appName,
                context,
                template: src.template,
                manifest: src.manifest,
                bundle: src.bundle,
                cacheBundle: false,
                runInNewContext: false,
                inject: context.inject !== false,
                shouldPreload: context.shouldPreload,
            };

            return await vueSSR(options);
        };
    }

    injectEjsSSR() {
    }
}

module.exports = Server;
