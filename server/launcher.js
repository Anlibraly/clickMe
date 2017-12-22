'use strict';

let _ = require('underscore');
let pm2 = require('pm2');
let msg = require('./common/msg');
let pmid = process.env.pm_id;
let procs = process.argv.slice(2);

if (procs && procs[0] !== undefined) {
    procs = procs[0].split(',');
}
// ================================================================================
// start
// ================================================================================
let start = () => {

    console.log('>>>>>>>>>> NEREUS <<<<<<<<<<');
    console.log('Launch services...');

    let serverList = require('./common/pm2_cfg').servers;
    // 连接pm2
    pm2.connect(() => {
        let already = [], serverKeys = _.keys(serverList);
        let startOne = (key) => {
            if (key === undefined) { return; }

            // no args start all or start the specify process
            if (procs.length !== 0
                && procs.indexOf(key) === -1) {
                startOne(serverKeys.shift());
                return;
            }

            console.log(`launch ${key}`);
            if (already.indexOf(key) === -1) {
                pm2.start(serverList[key], () => {
                    startOne(serverKeys.shift());
                });
            } else {
                pm2.restart(key, () => {
                    startOne(serverKeys.shift());
                });
            }
        };

        pm2.list((err, list) => {
            _.each(list, (app) => {
                already.push(app.name);
            });

            startOne(serverKeys.shift());
        });

    });

};

Promise.resolve()
    .then(() => msg.spawnSocket('launcher', pmid, {
        contact: (data, res) => {
            console.log(`${data.name} - ${data.port} started`);
            res();
        }
    }))
    .then(() => start())
    .catch((err) => console.log(`[error] ${err.message}\n${err.stack}`));
