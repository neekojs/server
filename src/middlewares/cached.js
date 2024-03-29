module.exports = function (cacheSvr, keyGen) {
    if (typeof keyGen !== 'function') {
        keyGen = function (ctx) {
            return ctx._matchedRouteName || 'yuumi';
        }
    }

    return async function (ctx, next) {
        let key = keyGen(ctx);

        let val = await cacheSvr.get(key);
        if (val) {
            ctx.body = val;
            return true;
        }

        await next();

        if (ctx.status === 200) {
            await cacheSvr.set(key, ctx.body);
        }
    };
};
