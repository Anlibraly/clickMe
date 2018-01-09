let conf = require('../../../common/conf');
let msg = require('../../../common/msg');
let g = require('../../../common/const');
let _ = require('underscore');
let jwt = require('koa-jwt');
let md5 = require('md5');

let makeToken = (token, timestamp) => md5(`${token}${timestamp}`);

let getThroughDataProc = (type, optype, sendData) =>
    msg.send(`data@${type}.${optype}`, sendData)
        .then(({result}) => Promise.resolve(result));

module.exports = (router) => {

    router
        .get('/account/getUserIp', function* () {

            let ip = this.req.headers['x-forwarded-for'] ||
                this.req.connection.remoteAddress ||
                this.req.socket.remoteAddress ||
                this.req.connection.socket.remoteAddress;

            this.session.userip = ip;

            yield this.body = {
                result: {
                    ip: ip
                },
                res: {
                    status: true
                }
            };

        })
        .get('/account/getsession', function* () {

            yield this.body = {
                result: {
                    lasttime: this.session.lasttime,
                    id: this.session.userid
                },
                res: {
                    status: true
                }
            };

        })
        .get('/account/logout', function* () {

            this.session.userid = null;
            this.session.username = null;
            this.session.account = null;

            yield this.redirect('/');

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
                            {
                                uid: user._id
                            },
                            conf.apiTokenSecretKey,
                            {
                                expiresIn: +conf.apiTokenExpire
                            }
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
        .post('/room/list', function* () {

            yield Promise.resolve()
                .then(() => getThroughDataProc('db', 'query', {
                    _key: 'room',
                    status: 1,
                    _page: this.request.body.page,
                    _size: g.ROOM_PER_PAGE
                }))
                .then((result) => {

                    let hasResult = (result.list && result.list.length);
                    let rooms = [],
                        aids = [],
                        rcache = [],
                        rids = [],
                        rewards = {};

                    if (hasResult) {

                        _.each(result.list, r => {

                            rooms.push({
                                _id: r._id,
                                name: r.name,
                                thumb: r.thumb,
                                player: r.player,
                                rewardid: r.rewardid
                            });

                            aids.push(r.rewardid);
                            rcache.push(`rpeos_${r._id}`);
                            rids.push(r._id);

                        });

                        return getThroughDataProc('cache', 'query', {
                            _key: rcache
                        })
                        .then((rlist) => (rcache = rlist || {}))
                        .then(() => getThroughDataProc('db', 'query', {
                            _key: 'reward',
                            _id: `~=${_.uniq(aids).join(';')}`
                        }))
                        .then((rew_result) => {

                            if (rew_result.list && rew_result.list.length > 0) {

                                rewards = _.indexBy(rew_result.list, '_id');

                            }
                            
                        })
                        .then(() => getThroughDataProc('db', 'query', {
                            _key: 'riddle',
                            roomid: `~=${_.uniq(rids).join(';')}`,
                            status: 0
                        }))
                        .then((rew_result) => {

                            let riddle = {};

                            if (rew_result.list && rew_result.list.length > 0) {

                                riddle = _.indexBy(rew_result.list, 'roomid');

                            }

                            _.each(rooms, room => {

                                room.pnum = +rcache[`rpeos_${room._id}`] || 0;
                                if (rewards[room.rewardid]) {

                                    room.name += `_${rewards[room.rewardid].name}`;
                                    room.totle = rewards[room.rewardid].winnum;

                                } else {

                                    room.name += '_神秘奖品';
                                    room.totle = 0;

                                }

                                if (riddle[room._id]) {

                                    room.awards = `${+riddle[room._id].answer.toString(2)}${(1 << +room.player).toString(2).slice(1)}`.slice(0, +room.player);

                                } else {

                                    room.awards = `${(1 << +room.player).toString(2).slice(1)}`;

                                }

                                delete room.rewardid;
                                
                            });

                            this.body = {
                                code: 1,
                                rooms
                            };

                        });

                    }

                    this.body = {
                        code: 0,
                        desc: '没有更多房间'
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
        .get('/admin/getcustom/:status/:sid', function* () {

            let qs = null;

            if (this.params.status !== undefined && this.params.status > 0) {

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

            if (this.params.sid !== undefined && this.params.sid > 0) {

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

            let customs,
                qs = {
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
                .then(() => {

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
