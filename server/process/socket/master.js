let g = require('../../common/const');
let msg = require('../../common/msg');
let conf = require('../../common/conf');
let roomMethods = require('./room');
let jwt = require('koa-jwt');
let _ = require('underscore');
let pmid = process.env.pm_id;
let io;

let socketAllow = ['db', 'store', 'cache'];
// ================================================================================
// Socket Service
// ================================================================================
let socketReq = (req, socket) => {

    let key = '',
        type = '';
    let target = req.target || '';
    let reqId = req.id || '';
    let queryObj = {};
    let serviceType = 'data';

    if (req.query) {

        type = 'query';
        key = req.query._key;
        queryObj = req.query;

    } else if (req.save) {

        type = 'save';
        key = req.save._key;
        queryObj = req.save;

    }

    // check allow target
    if (socketAllow.indexOf(target) === -1
        || _.isEmpty(key)) {

        socket.emit(`res_${reqId}`, {
            res: {
                status: false,
                msg: 'arguments error.'
            }
        });
        console.error(`Socket: [${type}] ${target}@${key} arguments error.`);

        return;

    }

    // op type, query or save, query will redirect to qdata
    msg.send(`${serviceType}@${target}.${type}`, queryObj)
        .then((result) => {

            socket.emit(`res_${reqId}`, result);

        });

};

let roomReq = (req, socket) => {

    if (req.target && roomMethods[req.target]) {

        roomMethods[req.target](req, socket, io);

    }

};

let socketServer = () => {

    io.on('connection', (socket) => {

        socket.on('req', (req) => {

            let pass = true;

            if (conf.apiTokenNeedVerify === 'true') {

                if (!req.apiToken) {

                    pass = false;

                } else {

                    try {

                        // should like { uid: [uid], iat: 1470116394, exp: 1470202794 }
                        pass = jwt.verify(req.apiToken, conf.apiTokenSecretKey, {});
                        // attach msg to xmsg log
                        let entity = req.query || req.save;

                        entity._attach = `table [${entity._key}], (UID: ${pass.uid})`;

                    } catch (e) {

                        console.warn(`Socket: ${e.message}\n${e.stack}`);
                        pass = false;

                    }

                }

            }

            if (pass) {

                socketReq(req, socket);

            } else {

                socket.emit(`res_${req.id || ''}`, {
                    res: {
                        status: false,
                        msg: '401 Authorization failed'
                    }
                });

            }

        });

        socket.on('room', (req) => {

            let pass = true;

            if (conf.apiTokenNeedVerify === 'true') {

                if (!req.apiToken) {

                    pass = false;

                } else {

                    try {

                        // should like { uid: [uid], iat: 1470116394, exp: 1470202794 }
                        pass = jwt.verify(req.apiToken, conf.apiTokenSecretKey, {});
                        // attach msg to xmsg log
                        let action = req.target || 'none';

                        req._attach = `action [${action}], (UID: ${pass.uid})`;

                    } catch (e) {

                        console.warn(`Socket: ${e.message}\n${e.stack}`);
                        pass = false;

                    }

                }

            }

            if (pass) {

                roomReq(req, socket);

            } else {

                socket.emit(`res_${req.id || ''}`, {
                    res: {
                        status: false,
                        msg: '401 Authorization failed'
                    }
                });

            }

        });

    });

};

let timers = {};

let flush = (key, IO) => {

    IO.sockets.emit('RC', key);
    timers[key] = null;

};

// ================================================================================
// Socket / server
// ================================================================================
if (pmid || pmid === 0) {

    Promise.resolve()
    .then(() => (io = require('socket.io')(+conf.socketPort + Number(pmid))))
    .then(() => {

        msg.spawnSocket('socket', pmid, {

            remoteChange: (name, res) => {

                // io.sockets.emit('RC', name);
                if (timers[name]) {

                    clearTimeout(timers[name]);

                }
                
                timers[name] = setTimeout(() => {

                    flush(name, io);
                    
                }, +conf.rctimeout || g.SOCKET_TIMEOUT);

                res();

            },
            confChange: () => {

                io.sockets.emit('confChange', conf.toClientConf(conf._originConf));

            },
            remoteNotice: (msg0) => {

                io.sockets.emit('remoteNotice', msg0);

            },
            liveCheck: (data, res) => {

                io.sockets.emit('liveCheck', +new Date());
                res();

            },
            remoteLogoutUser: (uid, res) => {

                io.sockets.emit('remoteLogoutUser', uid);
                res();

            },
            wmsRenderModule: ({
                token,
                dataJson,
                mo
            }, res) => {

                io.sockets.emit(`wms_${token}_module`, JSON.stringify({
                    dataJson,
                    mo
                }));
                res();

            },
            wmsRenderPage: ({
                token,
                modules,
                page,
                po,
                app
            }, res) => {

                io.sockets.emit(`wms_${token}_page`, JSON.stringify({
                    modules,
                    page,
                    app,
                    po
                }));
                res();

            },
            wmsPackApp: ({
                token,
                pages,
                ao,
                app
            }, res) => {
                
                io.sockets.emit(`wms_${token}_packApp`, JSON.stringify({
                    pages,
                    app,
                    ao
                }));
                res();

            }

        });

        // setInterval(() => {

        //     io.sockets.emit('reward', 'you win a reward!!');

        // }, g.SOCKET_TIMEOUT);

    })
    .then(() => socketServer())
    .catch((err) => console.error(`Socket: ${err.message}\n${err.stack}`));
    
}
