let koa = require('koa');
let router = require('koa-router');
let morgan = require('koa-morgan');
let koaBody = require('koa-body');
let mount = require('koa-mount');
let jwt = require('koa-jwt');
let session = require('koa-session');
let _ = require('underscore');
let render = require('koa-ejs');
let conditional = require('koa-conditional-get');
let staticServer = require('koa-static');
let etag = require('koa-etag');
let path = require('path');
let file = require('../../common/file');
let msg = require('../../common/msg');
let pmid = process.env.pm_id;
let app = koa();
let systemApi = koa();
let systemRouter = router();
let conf = require('../../common/conf');

// filter apiToken from request
let filterFieldFromReq = (that, field) => {

    let req = that.request;

    if (req.body[field]) {

        delete req.body[field];
    }

    if (req.query[field]) {

        delete req.query[field];

    }

};

// ================================================================================
// Api Service
// ================================================================================
let apiServer = () => {

    app.listen(conf.apiPort);

    let opts = { maxAge: 2 * 60 * 60 * 1000, key: 'clickMe-session-2018' };

    app.keys = ['clickMe-session-2016'];

    app.use(session(opts, app));

    app.use(staticServer(path.join(__dirname, '../../../../product/app/')));

    app.on('error', function (err, ctx) {

        console.log(err);

    });
    
    render(app, {
        root: path.join(__dirname, '../../../../product/app/'),
        layout: '__layout',
        viewExt: 'html',
        cache: false,
        debug: true
    });

    app.use(morgan.middleware('dev'))
        .use(koaBody({
            jsonLimit: '10mb',
            formLimit: '10mb',
            textLimit: '10mb'
        }))
        .use(function* (next) {

            yield next;

            this.response.set('clickMe-server', `api/${pmid}`);

            this.response.set('Access-Control-Allow-Origin', conf.serverAddress.replace(/\/$/, ''));

        })
        .use(function* (next) {

            let jwtGenerator = jwt({
                secret: conf.apiTokenSecretKey,
                getToken: function () {

                    let token = (this.request.body.apiToken || this.request.query.apiToken);

                    // prevent negative affect
                    filterFieldFromReq(this, 'apiToken');

                    return token || this.get('x-api-auth');

                }

            }).unless({
                path: conf.apiTokenUnlessPath,
                custom: function(){
                    // except purview api
                    return /^\/system\/account/.test(this.url);
                }
            });

            // jwt has `passthrough` attr if don't need to verify
            // why here to judge is performance consider
            // because even though passthrough is true, 
            // it's still would verify
            if (conf.apiTokenNeedVerify === 'true') {

                let emptyGen = function* () { 

                };

                let jwtVerify = jwtGenerator.call(this, emptyGen());

                let isOver = false;

                try {

                    let a = yield* jwtVerify;

                    console.log('aaaa', a);

                } catch (e) {

                    isOver = true;

                    this.body = {
                        res: {
                            status: false,
                            msg: '401 Authorization failed',
                            stack: e && e.stack
                        }
                    };

                }

                if (!isOver) {

                    yield next;

                }

            } else {

                // prevent negative affect
                filterFieldFromReq(this, 'apiToken');

                yield next;

            }

        })
        .use(function* (next) {

            try {

                yield next;

            } catch (e) {

                this.body = {
                    res: {
                        status: false,
                        msg: e.message,
                        stack: e.stack
                    }
                };

            }
        })
        .use(mount('/system', systemApi));
};

let mountSystemApi = () => {

    file.recurse('./product/server/process/api/system/', (abspath, rootdir, subdir, filename) => {

        if (!/\.js$/.test(filename)) return;

        let fn = require(`./system/${filename}`);

        if (_.isFunction(fn)) {

            fn(systemRouter);

        } else {

            console.log(`[warning] can\'t load system api : ${filename}`);

        }

    });

    systemApi
        .use(systemRouter.routes())
        .use(systemRouter.allowedMethods());

};

// ================================================================================
// Socket / server
// ================================================================================
Promise.resolve()
    .then(() => msg.spawnSocket('api', pmid, {}))
    .then(() => {

        mountSystemApi();

        apiServer();

    })
    .catch((err) => console.log(`[error] ${err.message}\n${err.stack}`));
