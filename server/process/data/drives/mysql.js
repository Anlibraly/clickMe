let mysql = require('mysql');
let _ = require('underscore');
let conf = require('../../../common/settings');

let pool = mysql.createPool({
    host: conf.dbHost,
    user: conf.dbUser,
    password: conf.dbPassword,
    database: conf.dbName
});

pool.on('connection', () => console.log('mysql pool connect'));
pool.on('enqueue', () => console.log('mysql pool waiting for available connection slot'));
pool.on('error', (err) => console.log(`mysql pool error : ${err.code}, ${err.message}`));

// promisify mysql connection query
let promisifyQuery = (sql) =>

    new Promise((resolve, reject) => {

        pool.getConnection((err, conn) => {

            if (err) {

                reject(err);

                return;

            }

            conn.query(sql, (error, rows) => {

                conn.release();

                if (error) {

                    reject(error);

                } else {

                    resolve(rows);

                }

            });

        });

    });

let addRecord = (key, value) => {

    if (!value || !key) {

        return Promise.resolve(false);

    }

    let [
        attrValues,
        attrKeys
    ] = [
        _.values(value),
        _.keys(value)
    ];

    _.each(attrValues, (v, k) => {

        attrValues[k] = String(v)
            .replace(/\\/g, '\\\\')
            .replace(/\'/g, '\\\'');

    });

    if (attrValues.length <= 0) {

        return Promise.resolve(false);

    }

    let sql = `insert into ${key} (\`${attrKeys.join('\`, \`')}\`)
               values ('${attrValues.join('\', \'')}');`;

    return Promise.resolve()
        .then(() => promisifyQuery(sql))
        .then((rows) => +rows.insertId);

};

let updateRecord = (key, value) => {

    if (!value || !key || !value._id) {

        return Promise.resolve(false);

    }

    let {
        _id,
        ...attrs
    } = value;

    let attrList = [];

    _.each(_.pairs(attrs), (v) => {

        let filterChars = String(v[1])
            .replace(/\\/g, '\\\\')
            .replace(/\'/g, '\\\'');

        attrList.push(`\`${v[0]}\`='${filterChars}'`);

    });

    let sql = `update ${key}
               set ${attrList.join(', ')}
               where _id=${_id};`;

    return Promise.resolve()
        .then(() => promisifyQuery(sql))
        .then(() => true);

};

let delRecord = (key, _id) => {

    if (!_id || !key) {

        return Promise.resolve(false);

    }

    let sql = `delete from ${key} where _id=${_id};`;

    return Promise.resolve()
        .then(() => promisifyQuery(sql))
        .then(() => true);

};

// 'add_time' {cip: '>', val: 100}
let cpiToSql = (field, cpi) => {

    if (!field || !cpi) {

        throw new Error('field, cpi should not be empty');

    }

    let subsql;

    let cval = (String(cpi.val) || '');

    let value = cval.replace(/\\/g, '\\\\')
        .replace(/\'/g, '\\\'');

    if (['>', '<', '>=', '<='].indexOf(cpi.cpi) !== -1) {

        subsql = `\`${field}\` ${cpi.cpi} '${value}'`;

    } else if (cpi.cpi === '~=') {

        value = value.split(';');

        value = value.join('\',\'');

        subsql = `\`${field}\` in ('${value}')`;

    } else if (cpi.cpi === '!=') {

        subsql = `\`${field}\` != '${value}'`;

    } else if (cpi.cpi === '*=') {

        subsql = `\`${field}\` like '%${value}%'`;

    } else if (cpi.cpi === '^=') {

        subsql = `\`${field}\` like '${value}%'`;

    } else if (cpi.cpi === '$=') {

        subsql = `\`${field}\` like '%${value}'`;

    } else if (cpi.cpi === '==') {

        if (value.indexOf('#=') === 0) {

            value = value.substring(2);

            subsql = `\`${field}\` not like '%${value}%'`;

        } else {

            subsql = `\`${field}\` = '${value}'`;

        }

    }

    return subsql;

};

module.exports = {

    getTableList () {

        this.listDbTables();

    },

    listDbTables () {

        return promisifyQuery(`select * from information_schema.tables where table_schema='clickMe';`);

    },

    getTableStruct (tableKey) {

        this.listTableColumns(tableKey);

    },

    listTableColumns (tableKey) {

        return promisifyQuery(`show columns from ${tableKey};`);

    },

    resetTable (tableKey) {

        this.truncateTable(tableKey);

    },

    truncateTable (tableKey) {

        return promisifyQuery(`truncate table ${tableKey};`);

    },

    query (query) {

        let sql = 'select ';
        let where = [];
        let sort = [];

        // inlcude
        query.include = (query.include || []);

        if (query.include.length === 0) {

            sql += '*';

        } else {

            // 选择字段

            sql += `\`${query.include.join('`,`')}\``;

        }

        // key
        sql += `\nfrom ${query.key}`;

        // attrs: table field filter
        _.each(query.attrs, (v, k) => {

            let subsql = [];

            // 'add_time' {cip: '>', val: 100}
            _.each(v.cpis, (sv) => {

                subsql.push(cpiToSql(k, sv));

            });

            subsql = _.without(subsql, undefined);

            if (subsql.length > 0) {

                where.push(`( ${subsql.join(` ${(v.conn || 'and')} `)} )`);

            }

        });

        if (where.length > 0) {

            sql += `\nwhere ${where.join(' and ')}`;

        }

        // sort
        _.each(_.pairs(query.sort), (v) => {

            sort.push(`${v[0]} ${v[1] || 'asc'}`);

        });

        if (sort.length > 0) {

            sql += `\norder by ${sort.join(', ')}`;

        }

        // page / size
        if (+query.size > 0) {

            sql += `\nlimit ${query.size * (query.page - 1)},${query.size}`;

        }

        sql += ';';

        let countSql = sql.split(/\n/);
        let {
            size,
            page
        } = query;

        let hasSize = +size > 0;
        let total = 1;

        countSql.splice(0, 1, 'select count(*) as total');

        countSql.pop();

        countSql = countSql.join('\n');

        return Promise.resolve()
            .then(() => {

                if (hasSize) {

                    return promisifyQuery(countSql)
                        .then((count) => {

                            total = Math.ceil(+count[0].total / size);

                        });

                }
                
            })
            .then(() => promisifyQuery(sql))
            .then((rows) => ({
                rows,
                page,
                size,
                total
            }));

    },

    save ({
        key,
        add,
        update,
        del
    }) {

        let savePromise = [];

        let saveResult = {
            ar: [],
            ur: [],
            dr: []
        };

        let done = () => Promise.resolve(saveResult);

        return Promise.resolve()
            .then(() => {

                _.each(add, (v, k) => savePromise.push(
                    addRecord(key, v)
                        .then((r) => (saveResult.ar[k] = r))
                        .catch(() => (saveResult.ar[k] = false))
                ));

                _.each(update, (v, k) => savePromise.push(
                    updateRecord(key, v)
                        .then((r) => (saveResult.ur[k] = r))
                        .catch(() => (saveResult.ur[k] = false))
                ));

                _.each(del, (v, k) => savePromise.push(
                    delRecord(key, v)
                        .then((r) => (saveResult.dr[k] = r))
                        .catch(() => (saveResult.dr[k] = false))
                ));

            })
            .then(() => Promise.all(savePromise))
            .then(done, done);

    }

};
