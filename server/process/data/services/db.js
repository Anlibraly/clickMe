let _ = require('underscore');
let mysql = require('../drives/mysql');
let helper = require('../helper');

// ========================================================
// Table Action
// ========================================================
let Action = {
    db: {}
};

Action.db.listDbTables = (req, res) => {

    mysql.listDbTables()
    .then((result) => helper.cbResponse(result, res))
    .catch((err) => helper.cbCatch(err, res));

};

Action.db.listTableColumns = (tableKey, res) => {

    if (!tableKey) {

        helper.cbCatch(new Error('table key is undefined.'), res);

        return;

    }

    mysql.listTableColumns(tableKey)
        .then((result) => helper.cbResponse(result, res))
        .catch((err) => helper.cbCatch(err, res));

};

Action.db.truncateTable = (tableKey, res) => {

    if (!tableKey) {

        helper.cbCatch(new Error('table key is undefined.'), res);

        return;

    }

    mysql.truncateTable(tableKey)
        .then((result) => helper.cbResponse(result, res))
        .catch((err) => helper.cbCatch(err, res));

};

// ========================================================
// Record Action
// ========================================================
Action.db.save = (req = {}, res) => {

    if (!helper.checkModel(req._key)) {

        helper.cbCatch(new Error('model not define.'), res);

        return;

    }

    let {
        _key: key = null,
        _save: save = []
    } = req;

    let {
        map,
        add,
        update,
        del
    } = helper.parseSaveObject(key, save);

    mysql.save({
        key,
        add,
        update,
        del
    })
    .then(({
        ar,
        ur,
        dr
    }) => helper.createSaveObject({
        map,
        ar,
        ur,
        dr
    }))
    .then((result) => helper.cbResponse(result, res))
    .catch((err) => helper.cbCatch(err, res));

};

Action.db.query = (req = {}, res) => {

    if (!helper.checkModel(req._key)) {

        helper.cbCatch(new Error('model not define.'), res);

        return;

    }

    let {
        _key: key = null,
        _size: size1 = 0,
        _page: page1 = 1,
        _sort: sort = '',
        _include: include = '',
        ...attrs
    } = req;

    attrs = helper.parseAttrs(attrs);

    sort = helper.parseSort(sort);

    include = helper.parseInclude(include);

    if (page1 <= 0) {

        page1 = 1;
    
    }

    let query = {
        key,
        size: size1,
        page: page1,
        sort,
        include,
        attrs
    };

    mysql.query(query)
        .then(({
            rows,
            page,
            size,
            total
        }) => {

            let list = [];

            _.each(rows, (v) => {

                list.push(helper.modelValueDecode(key, v));

            });

            return Promise.resolve({
                list,
                page,
                size,
                total
            });

        })
        .then((result) => helper.cbResponse(result, res))
        .catch((err) => helper.cbCatch(err, res));

};

module.exports = Action;
