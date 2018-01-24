let msg = require('./msg');
let g = require('./const');

let generateRiddle = rdLength => parseInt((1 << rdLength) * Math.random());

let getThroughDataProc = (type, optype, sendData) =>
    msg.send(`data@${type}.${optype}`, sendData)
        .then(({result}) => Promise.resolve(result));

let getRiddle = roomid =>
    /* getThroughDataProc('cache', 'query', {
        _key: `riddle_${roomid}`
    })
    .then((riddle) => {

        if (riddle) {

            return Promise.resolve(JSON.parse(riddle));
        
        }

        return  */
        getThroughDataProc('db', 'query', {
            _key: 'riddle',
            roomid,
            status: 0
        })
        .then((rdResult) => {

            if (rdResult.list && rdResult.list.length > 0) {

                let rd = rdResult.list[0];

                return Promise.resolve(rd);

/*                 return getThroughDataProc('cache', 'save', {
                    _key: `riddle_${roomid}`,
                    _value: JSON.stringify(rd),
                    _ttl: g.ONE_YEAR
                })
                .then(() => Promise.resolve(rd)); */

            }

            return Promise.resolve(null);

        });

/*     }); */

let getRoom = roomid =>
    getThroughDataProc('db', 'query', {
        _key: 'room',
        _id: roomid,
        status: 1
    })
    .then((room) => {

        if (room.list && room.list.length > 0) {

            return Promise.resolve(room.list[0]);

        }

        return Promise.resolve(null);

    });

let updateRoom = room =>
    getThroughDataProc('db', 'save', {
        _key: 'room',
        _save: [room]
    });

let updateRidle = riddle =>
    getThroughDataProc('db', 'save', {
        _key: 'riddle',
        _save: [riddle]
    });

let newRiddle = roomid =>
    getRiddle(roomid)
    .then((rd) => {
        
        if (!rd) {

            return getRoom(roomid)
            .then((room) => {

                if (room) {

                    let riddle = generateRiddle(+room.player);
                    let newRd = {
                        riddle,
                        roomid,
                        answer: 0,
                        status: 0,
                        ansindex: 0,
                        len: +room.player,
                        ctime: +new Date()
                    };

                    return updateRidle(newRd)
                    .then((rids) => {

                        console.log('aaaa', rids);

                        newRd._id = rids[0];

                        return getThroughDataProc('cache', 'save', {
                            _key: `riddle_${roomid}`,
                            _value: JSON.stringify(newRd),
                            _ttl: g.ONE_YEAR
                        })
                        .then(() => Promise.resolve(newRd));

                    });

                }

            });

        }

        return Promise.resolve(rd);

    });

let getAnswers = riddleid =>
    getThroughDataProc('db', 'query', {
        _key: 'answer',
        riddleid
    })
    .then((answers) => {

        if (answers.list && answers.list.length > 0) {

            return Promise.resolve(answers.list);

        }

        return Promise.resolve([]);

    });

let doAnswer = answer =>
    getThroughDataProc('db', 'save', {
        _key: 'answer',
        _save: [answer]
    });

let judgeAnswer = (index, length, answer, riddle) => {

    riddle = riddle.toString(2);

    let moreZero = length - riddle.length;

    riddle = `${(1 << moreZero).toString(2).slice(1)}${riddle}`;
    console.log(riddle, answer, index, length);

    riddle = riddle.slice(0, index);

    let right = (+answer === parseInt(riddle, 2));

    if (right) {

        if (index === length) {

            return 1;

        }

        return 0;

    }

    return -1;

};

let turnAnswer = (answer, ansIndex, riddleLen) => {

    let nowAns = answer.toString(2);
    let moreZero = ansIndex - nowAns.length;

    return `${(1 << moreZero).toString(2).slice(1)}${nowAns}${(1 << +riddleLen).toString(2).slice(1)}`.slice(0, +riddleLen);

};

module.exports = {
    getThroughDataProc,
    getRiddle,
    getRoom,
    newRiddle,
    updateRoom,
    updateRidle,
    getAnswers,
    doAnswer,
    judgeAnswer,
    turnAnswer
};
