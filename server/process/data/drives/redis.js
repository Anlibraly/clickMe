let _ = require('underscore');
let redis = require('redis');
let conf = require('../../../common/settings');

let client = redis.createClient({
    host: conf.redisAddress,
    port: conf.redisPort
});

client.on('connect', () => console.log('redis connect'));
client.on('error', (err) => console.error(`${err.message}\n${err.stack}`));
client.on('end', () => console.log('redis connect end'));

let addOne = (key, value) => {

    if (!key || !value) {

        return Promise.resolve(false);

    }

    let [attrValues, attrKeys] = [_.values(value), _.keys(value)];

    return Promise.resolve()
        .then(() => module.exports.get(`s:${key}:next`))
        .then((result) => {

            let success = true;

            result = result[0];
            success = client.set(`s:${key}:next`, +result + 1);
            _.each(attrValues, (v, k) => {

                success = (success && client.hset(`s:${key}:${result}`, attrKeys[k], v));

            });

            return Promise.resolve(success ? +result : false);

        })
        .catch((e) => {

            console.warn(e);

            return Promise.resolve(false);

        });

};

let updateOne = (key, value) => {

    if (!key || !value) {

        return Promise.resolve(false);

    }

    let {_id, ...attrs} = value;

    return Promise.resolve()
        .then(() => module.exports.hlen(`s:${key}:${_id}`))
        .then((result) => {

            let success = true;

            if (+result === 0) {

                return Promise.resolve(true);

            }

            _.each(attrs, (v, k) => {

                success = (success && client.hset(`s:${key}:${_id}`, k, v));

            });

            return Promise.resolve(success);

        })
        .catch((e) => {

            console.warn(e);

            return Promise.resolve(false);

        });

};

let sortByType = (type) =>
    (left, right) => {

        let a = left.criteria;
        let b = right.criteria;

        if (a !== b) {

            if (a > b || a === void 0) {

                return (type === 'asc' ? 1 : -1);

            }

            if (a < b || b === void 0) {

                return (type === 'asc' ? -1 : 1);

            }

        }

        return left.index - right.index;

    };

let cpiCheck = (value, cpi) => {

    if (cpi.cpi === '>') {

        return +value > +cpi.val;

    } else if (cpi.cpi === '<') {

        return +value < +cpi.val;

    } else if (cpi.cpi === '>=') {

        return +value >= +cpi.val;

    } else if (cpi.cpi === '<=') {

        return +value <= +cpi.val;

    } else if (cpi.cpi === '~=') {

        return cpi.val.split(';').indexOf(String(value)) !== -1;

    } else if (cpi.cpi === '!=') {

        return String(value) !== String(cpi.val);

    } else if (cpi.cpi === '*=') {

        let reg = new RegExp(cpi.val);

        return reg.test(value);

    } else if (cpi.cpi === '^=') {

        let reg = new RegExp(`^${cpi.val}`);

        return reg.test(value);

    } else if (cpi.cpi === '$=') {

        let reg = new RegExp(`${cpi.val}$`);

        return reg.test(value);

    } else if (cpi.cpi === '==') {

        return String(value) === String(cpi.val);

    }

    return false;

};

let attrsFilter = (record, attrs) => {

    let passes = [];
    let results = [];

    _.each(attrs, (v, k) => {

        let pass = true;

        _.each(v.cpis, (sv) => {

            results.push(cpiCheck(record[k], sv));

        });

        if (v.conn === 'or') {

            pass = _.some(results);

        } else {

            pass = _.every(results);

        }

        passes.push(pass);

    });

    return _.every(passes);

};

module.exports = {

    keys (pattern = '') {

        return new Promise((resolve, reject) => {

            client.keys(pattern, (err, reply) => {

                if (err) {

                    reject(err);

                    return;

                }

                resolve(reply || []);

            });

        });

    },

    ttl (keys = []) {

        keys = [].concat(keys);

        let getPromise = [];

        _.each(keys, (v) => {

            getPromise.push(
                new Promise((resolve) => {

                    client.ttl(v, (err, reply) => {

                        if (err) {

                            resolve(false);
                        
                        }

                        resolve(reply);

                    });

                })

            );

        });

        return Promise.all(getPromise);

    },

    set (key, value, ttl) {

        if (!key) {
            
            return Promise.resolve(false);
        
        }

        client.set(String(key), String(value));
        if (+ttl > 0) {

            client.expire(key, +ttl);

        }

        return Promise.resolve(true);

    },

    setMany (values) {

        values = [].concat(values);
        let setPromise = [];

        _.each(values, (val) => {

            setPromise.push(this.set(val.key, val.value, val.ttl));

        });

        return Promise.all(setPromise);

    },

    get (keys = []) {

        keys = [].concat(keys);

        return new Promise((resolve, reject) => {

            client.mget(keys, (err, reply) => {

                if (err) {

                    reject(err);
                    
                    return;

                }

                _.each(reply, (v, k) => {

                    if (v === null) {

                        reply[k] = undefined;

                    }

                });

                resolve(reply);

            });

        });

    },

    del (keys = []) {

        let result = [];

        keys = [].concat(keys);

        return new Promise((resolve) => {

            _.each(keys, (v) => {

                result.push(client.del(v));

            });

            resolve(result);

        });

    },

    hget (key, fields) {

        fields = [].concat(fields);

        return new Promise((resolve, reject) => {

            client.hmget(key, fields, (err, reply) => {

                if (err) {
                    
                    reject(err);
                    
                    return;

                }

                let result = {};

                _.each(reply, (v, k) => {

                    result[fields[k]] = (v === null ? undefined : v);

                });

                result._id = +key.split(':')[2];

                resolve(result);

            });

        });

    },

    hgetall (key) {

        return new Promise((resolve, reject) => {

            client.hgetall(key, (err, reply) => {

                if (err) {
                    
                    reject(err);
                    
                    return;
                
                }

                let result = {};

                _.each(reply, (v, k) => {

                    result[k] = (v === null ? undefined : v);

                });

                result._id = +key.split(':')[2];
                resolve(result);

            });

        });

    },

    hlen (key) {

        return new Promise((resolve, reject) => {

            client.hlen(key, (err, reply) => {

                if (err) {
                    
                    reject(err);
                    
                    return;
                
                }

                resolve(reply);

            });

        });

    },

    save ({
        key,
        add,
        update,
        del
    }) {

        let saveResult = {
            ar: [],
            ur: [],
            dr: []
        };

        let resultMarkMap = {
            add: 'ar',
            update: 'ur',
            del: 'dr'
        };

        let delOne = (k, _id) => client.del(`s:${k}:${_id}`);

        let fn = {
            addOne,
            updateOne,
            delOne
        };

        if (!key) {

            return Promise.resolve(saveResult);

        }

        return Promise.resolve()
            .then(() => module.exports.get(`s:${key}:name`))
            .then((result) => {

                if (result[0] === undefined) {

                    throw new Error('store not exist.');

                }

            })
            .then(() => new Promise((resolve) => {

                let lists = {
                    add,
                    update,
                    del
                };
                let names = _.keys(lists);
                let offset = 0;
                let next = (index) => {

                    let name = names[index];
                    let v;

                    if (name === undefined) {

                        resolve(saveResult);

                        return;

                    }

                    v = (lists[name] ? lists[name][offset] : undefined);
                    if (v === undefined) {

                        offset = 0;

                        return next(index + 1);

                    }

                    fn[`${name}One`](key, v)
                        .then((r) => (saveResult[resultMarkMap[name]][offset] = r))
                        .then(() => {

                            offset++;
                            next(index);

                        });

                };

                next(0);

            }));

    },

    query (query) {

        let {
            page = 1,
            size
        } = query;
        let total = 0;
        let next = 1;

        return Promise.resolve()
            .then(() => this.get(`s:${query.key}:next`))
            .then((nexts) => (next = +nexts[0]))
            .then(() => this.keys(`s:${query.key}:[^n]*`))
            .then((ids) => {

                let getPromise = [];

                _.each(ids, (v) => getPromise.push(this.hgetall(v)));

                return Promise.all(getPromise);

            })
            .then((rows) => _.sortBy(rows, '_id'))
            .then((rows) => {

                let sortFilter = [];

                _.each(_.pairs(query.sort), (v) => {

                    sortFilter.push({
                        key: v[0],
                        by: v[1] || 'asc'
                    });

                });

                // sort
                _.each(sortFilter, (v) => {

                    let mapedRows = _.map(rows, (value, index) => ({
                        value: value,
                        index: index,
                        criteria: value[v.key]
                    }));

                    let sortValue = mapedRows.sort(sortByType(v.by));

                    rows = _.pluck(sortValue, 'value');

                });

                return Promise.resolve(rows);

            })
            .then((rows) => {

                let result = [];

                _.each(rows, (v) => {

                    // filter the result by field condition
                    if (attrsFilter(v, query.attrs)) {

                        let len = (query.include ? query.include.length : 0);

                        // if filter the specified fields
                        if (len > 0) {

                            v = _.pick.apply(_, [v, '_id'].concat(query.include));

                        }

                        result.push(v);

                    }

                });

                return Promise.resolve(result);

            })
            .then((rows) => {

                // size / page
                if (+size > 0) {

                    total = Math.ceil(rows.length / size);
                    rows = rows.slice(size * (page - 1), size * page);

                } else {

                    total = 1;

                }

                return Promise.resolve(rows);
                
            })
            .then((rows) => ({
                rows,
                page,
                size,
                total,
                next
            }));

    }

};
