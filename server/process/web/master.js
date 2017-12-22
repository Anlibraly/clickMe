let koa = require('koa');
let router = require('koa-router');
let morgan = require('koa-morgan');
let koaBody = require('koa-body');
let render = require('koa-ejs');
let conditional = require('koa-conditional-get');
let staticServer = require('koa-static');
let etag = require('koa-etag');
let path = require('path');
let msg = require('../../common/msg');

let pmid = process.env.pm_id;
let app = koa();
let webRouter = router();

let webServer = () => {

    app.use(staticServer(path.join(__dirname, '../../../../product/app/')));

    app.on('error', err => {

        console.log(err);

    });

    render(app, {
        root: path.join(__dirname, '../../../../product/app/'),
        layout: '__layout',
        viewExt: 'html',
        cache: false,
        debug: true
    });

    app.use(function* () {

        yield this.render('index', {
            layout: false
        });

    })
        .use(morgan.middleware('dev'))
        .use(conditional())
        .use(etag())
        .use(koaBody({
            jsonLimit: '10mb',
            formLimit: '10mb',
            textLimit: '10mb'
        }))
        .use(function* (next) {

            this.response.set('clickMe-server', `web/${pmid}`);

            yield next;

        })
        .use(webRouter.routes())
        .use(webRouter.allowedMethods());

    app.listen(8090);

};

Promise.resolve()
    .then(() => msg.spawnSocket('web', pmid, {}))
    .then(() => {

        webServer();

    })
    .catch((err) => console.log(`[error] ${err.message}\n${err.stack}`));
