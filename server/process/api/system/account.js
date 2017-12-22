let conf = require('../../../common/conf');
let msg = require('../../../common/msg');
let _ = require('underscore');
let jwt = require('koa-jwt');
let md5 = require('md5');

let check = (v) => {
    if (v != undefined && (v > 0 || v.length > 0)) {
        return true;
    }
    return false;
};

let makeToken = (token, timestamp) => {
    return md5(`${token}${timestamp}`);
};

let getThroughDataProc = (type, optype, sendData) => {
    return msg.send(`data@${type}.${optype}`, sendData)
        .then(({ result, res }) => {
            return Promise.resolve(result);
        });
};

module.exports = (router) => {

    router
        .get('/account/getUserIp', function* () {

            let ip = this.req.headers['x-forwarded-for'] ||
                this.req.connection.remoteAddress ||
                this.req.socket.remoteAddress ||
                this.req.connection.socket.remoteAddress;

            this.session.userip = ip;

            this.body = {
                result: { ip: ip },
                res: {
                    status: true
                }
            };

        })
        .get('/account/getsession', function* () {

            this.body = {
                result: { lasttime: this.session.lasttime, id: this.session.userid },
                res: {
                    status: true
                }
            };

        })
        .get('/account/logout', function* () {
            this.session.userid = null;
            this.session.username = null;
            this.session.account = null;

            this.redirect('/');
        })
        .post('/account/login', function* () {
            yield Promise.resolve()
                .then(() => getThroughDataProc('db', 'query', {
                    _key: 'user',
                    username: this.request.body.username,
                    password: this.request.body.password
                }))
                .then((result) => {
                    let hasResult = (result.list && result.list.length);
                    let user = null;
                    
                    if (hasResult && result.list[0]) {
                        user = result.list[0];

                        this.session.userid = user._id;
                        this.session.username = user.username;
                        this.session.account = user.account;
                        this.session.lasttime = +new Date();

                        let apiToken = jwt.sign(
                            {uid: user._id},
                            conf.apiTokenSecretKey,
                            {expiresIn: +conf.apiTokenExpire}
                        );

                        let token = {
                            id: user._id,
                            token: makeToken(user.account, +new Date())
                        };

                        this.body = {
                            code: 1,
                            apiToken,
                            token,
                            path: '/room',
                            desc: 'login success'
                        };

                    } else {

                        this.body = {
                            code: -1,
                            desc: '用户名密码错误'
                        };

                    }
                })
                .catch((err) => {

                    console.log(`[error] ${err.message}\n${err.stack}`);

                    this.body = {

                        code: -1,
                        desc: `[error] ${err.message}\n${err.stack}`
                    };

                });

        })
        .get('/admin/getcustom/:status/:sid', function* () {
            let qs = null;

            if (this.params.status != undefined && this.params.status > 0) {

                qs = {
                    _key: 'custom',
                    status: this.params.status,
                    _sort: 'update_time:desc'
                };

            } else {

                qs = {
                    _key: 'custom',
                    _sort: 'update_time:desc'
                };

            }

            if (this.params.sid != undefined && this.params.sid > 0) {

                qs.userid = +this.params.sid;

            }

            yield Promise.resolve()
                .then(() => getThroughDataProc('db', 'query', qs))
                .then((result) => {

                    this.body = {
                        code: 1,
                        customs: result.list
                    };

                })
                .catch((err) => {

                    console.log(`[error] ${err.message}\n${err.stack}`);

                    this.body = {
                        code: -1,
                        desc: `[error] ${err.message}\n${err.stack}`
                    };

                });

        })
        .get('/admin/custom/:cid', function* () {
            let customs, qs = {
                _key: 'custom',
                _id: this.params.cid
            };

            yield Promise.resolve()
                .then(() => getThroughDataProc('db', 'query', qs))
                .then((result) => {

                    let read = result.list[0].read;

                    if (read.indexOf(`${this.session.userid}-`) < 0) {

                        read += `${this.session.userid}-`;

                    }

                    customs = result;

                    return getThroughDataProc('db', 'save', {
                        _key: 'custom',
                        _save: [{
                            _id: +this.params.cid,
                            read: read
                        }]
                    });

                })
                .then((result) => {

                    this.body = {
                        code: 1,
                        customs: customs.list
                    };

                })
                .catch((err) => {

                    console.log(`[error] ${err.message}\n${err.stack}`);

                    this.body = {
                        code: -1,
                        desc: `[error] ${err.message}\n${err.stack}`
                    };

                });
        });

};
