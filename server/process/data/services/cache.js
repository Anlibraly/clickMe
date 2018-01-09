let _ = require('underscore');
let g = require('../../../common/const');
let helper = require('../helper');
let redis = require('../drives/redis');

// ========================================================
// Cache Action
// ========================================================
let Action = {
    cache: {}
};

Action.cache.getCacheList = (req, res) => {

    let keys = [],
        result = [];

    redis.keys('c:*')
        .then((resp) => {

            keys = resp;

            return Promise.resolve(keys);

        })
        .then(redis.ttl)
        .then((ttls) => {

            _.each(keys, (v, k) => {

                result.push({
                    key: keys[k].replace(/^c\:/, ''),
                    ttl: ttls[k]
                });

            });

            return Promise.resolve(result);

        })
        .then((resp) => helper.cbResponse(resp, res))
        .catch((err) => helper.cbCatch(err, res));

};

// ========================================================
// Record Action
// ========================================================
Action.cache.save = (req = {}, res) => {

    let {
		_key: key,
        _value: value,
        _ttl: ttl = g.REDIS_TTL
	} = req;

    redis.set(`c:${key}`, value, ttl)
        .then((result) => helper.cbResponse(result, res))
        .catch((err) => helper.cbCatch(err, res));

};

Action.cache.query = (req = {}, res) => {

    let {_key: key} = req;

    redis.get(`c:${key}`)
        .then((result) => helper.cbResponse(result[0], res))
        .catch((err) => helper.cbCatch(err, res));

};

Action.cache.remove = (req = {}, res) => {

    let status = true;
    let {_keys: keys} = req;

    redis.del(keys)
        .then((result) => {

            _.find(result, (v) => {

                if (!v) {

                    status = false;

                    return true;

                }

            });

            return Promise.resolve(result);

        })
        .then((result) => helper.cbResponse(result, res, status))
        .catch((err) => helper.cbCatch(err, res));

};

// 删除uid用户的所有缓存
Action.cache.dels = (req = {}, res) => {

    let {_uids: uids} = req;

    let delPromises = [];

    _.each(uids.split(';'), (uid) => {

        delPromises.push(
            redis.keys(`c:p_${uid}_*`)
                .then(redis.del)
        );

    });

    Promise.all(delPromises)
        .then(() => helper.cbResponse({}, res))
        .catch((err) => helper.cbCatch(err, res));

};

module.exports = Action;
