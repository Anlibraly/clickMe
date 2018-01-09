let extend = require('node.extend');
let msg = require('../../common/msg');
let pmid = process.env.pm_id;
let action = {};

// ================================================================================
// Socket / server
// ================================================================================
Promise.resolve()
    .then(() => msg.spawnSocket('data', pmid, action))
    .then(() => {

        extend.apply(this, [
            true,
            action,
            require('./services/db.js'),
            require('./services/cache.js')
        ]);

    })
    .catch((err) => console.log(`[error] ${err.message}\n${err.stack}`));
