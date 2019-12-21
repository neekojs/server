const Router = require('koa-router');
const { request } = require('@neekojs/utils');
const Server = require('./server');

class Yuumi extends Server {
    constructor(serverUrl) {
        super();
        this.serverUrl = serverUrl || '';

        const route = new Router();
        route.get('yuumi-purge', '/yuumi/purge', async ctx => {
            if (this.cacheSvr.flush) {
                this.cacheSvr.flush();
                ctx.body = `{"code":0,"message":"flush"}`;
            }
        });
        route.get('yuumi-push', '/yuumi/server/push', async ctx => {
            const { key } = ctx.query || {};
            if (key && key.length < 16) {
                await this.cacheSvr.del(key);
                ctx.body = `{"code":0,"message":"ok","data":{key:"${key}"}}`;
            }
        });
        route.get('yuumi-pull', '/yuumi/client/pull', async ctx => {
            // todo
            ctx.body = 'ok.';
        });

        this.app.use(route.routes());
        this.app.use(route.allowedMethods());
    }

    async getServerConfig(appName, config) {
        console.log('请求服务配置', appName);
        if (typeof config === 'object') {
            return config;
        }
        const params = { appName };
        const res = await request({ url: config || this.serverUrl, data: params });
        return res.data;
    }

    async getVueResources(appName, serverConfig) {
        const self = this;
        const cacheSvr = self.getCacheSvr();
        let result = cacheSvr.get(appName);
        if (result) return result;

        let config = await self.getServerConfig(appName, serverConfig);
        if (!config || !config.template) {
            throw Error('请检查服务配置是否正确');
        }
        let assets = [{ url: config.template }, { url: config.manifest }, { url: config.bundle }];
        let resArr = await request(assets);

        result = {
            template: resArr[0] ? resArr[0].data : '',
            manifest: resArr[1] ? resArr[1].data : {},
            bundle: resArr[2] ? resArr[2].data : {},
        };
        cacheSvr.set(appName, result);
        return result;
    }

}

module.exports = Yuumi;
