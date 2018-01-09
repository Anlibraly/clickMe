let _ = require('underscore');
let msg = require('../../common/msg');
let file = require('../../common/file');
let g = require('../../common/const');
let pmid = process.env.pm_id;
let task = {};
let taskId = 1;
let runTime = 0;

// 仅运行list内的任务
let onlyRun = [];

let scanFilePathPrefix = './product/server/process/task/';
let loadFilePathPrefix = '../task/';

let saveTask = () => msg.send('data@cache.save', {
    _key: 'taskList',
    _value: JSON.stringify(_.toArray(task)),
    _ttl: g.ONE_YEAR
});

// ================================================================================
// Task Services
// ================================================================================
let runOnceTask = (curTask, runTaskDate) => {

    if (!curTask.status) {

        curTask.status = {
            times: 0,
            errorTimes: 0
        };

    }

    if (!curTask.status.firstTime) {

        curTask.status.firstTime = runTaskDate;

    }

    try {

        curTask.status.status = 'running';
        curTask.main(msg);
        curTask.status.times++;
        curTask.status.lastRunDate = runTaskDate;
        console.log(`Task: SUCCESS  ${curTask.name}`);

    } catch (e) {

        curTask.status.status = 'error';
        curTask.status.errorTimes++;
        curTask.status.lastErrorMsg = e.message;
        console.error(`Task: ${e.message}\n${e.stack}`);

    }

    if (curTask.status.status === 'running') {

        curTask.status.status = 'wait';

    }

    // whatever save task
    saveTask();

};

// load task
let loadTask = () => {

    file.recurse(scanFilePathPrefix, (abspath, rootdir, subdir, filename) => {

        let taskName = filename.replace(/\.js$/, '');

        if (taskName === 'master' || taskName === '.DS_Store') {

            return;

        }

        if (onlyRun.length > 0 && onlyRun.indexOf(taskName) === -1) {

            return;

        }

        task[taskName] = require(loadFilePathPrefix + filename);

        // 写入任务状态
        // status : running/wait/error
        task[taskName].status = {
            times: 0,
            status: 'wait',
            errorTimes: 0,
            lastErrorMsg: '',
            lastRunDate: null,
            firstTime: null,
            stop: 'false'
        };
        task[taskName]._id = taskId++;

        if (task[taskName].immediately) {

            runOnceTask(task[taskName], +new Date());

        }

    });

};

// when task should stop
let shouldStop = (tmpTask, currentTimestamp) => {

    if (!tmpTask.status) {

        tmpTask.status = {};

    }

    if (tmpTask.status.stop === 'true') {

        return true;

    }

    // 判断任务的error times，如果任务执行的错误次数大于5次则忽略当前任务
    if (tmpTask.status.errorTimes > 5) {

        return true;

    }

    // 判断start/end date
    if ((tmpTask.startDate && +new Date(tmpTask.startDate) > currentTimestamp) ||
        (tmpTask.endDate && +new Date(tmpTask.endDate) < currentTimestamp)) {

        return true;

    }

    // 判断 maxtimes
    if (tmpTask.maxTimes && tmpTask.status.times >= tmpTask.maxTimes) {

        return true;

    }

    return false;

};

// it's the time run task?
let runTaskByTime = (tmpTask, currentTimestamp) => {

    // check time
    let dt = new Date(currentTimestamp);
    let now = {
        second: dt.getSeconds(),
        minute: dt.getMinutes(),
        hour: dt.getHours(),
        day: dt.getDay(),
        date: dt.getDate()
    };

    // time is like ['hour:4;minute:10;second:0']
    _.find(tmpTask.time, (t) => {

        let math = true;

        t = t.split(';');

        _.find(t, (vt) => {

            vt = vt.split(':');

            if (+now[vt[0]] !== +vt[1]) {

                math = false;

                return true;

            }

        });

        if (math) {

            runOnceTask(tmpTask, currentTimestamp);

            return true;
            
        }

    });

};

let taskServer = () => {

    // load all the tasks
    loadTask();

    saveTask()
        .then(() => {

            // start run task
            setInterval(() => {

                let d = +new Date();

                // 任务运行次数递增
                runTime++;

                // 循环遍历每一个任务
                _.each(task, (v) => {

                    if (shouldStop(v, d)) {

                        return;

                    }

                    // run loop task
                    if (v.type === 'loop' && runTime % v.interval === 0) {

                        runOnceTask(v, d);

                        return;

                    }

                    // run the specified date task
                    if (v.type === 'time') {

                        runTaskByTime(v, d);

                        return;

                    }

                });

            }, g.TASK_INTERVAL);

        });

};

let Action = {};

Action.switchTask = (data, res) => {

    let curTask = false;

    let message = '';

    // find the will change task
    _.find(task, (v) => {

        if (+v._id === +data.tid) {

            curTask = v;

            return true;

        }

    });

    if (curTask) {

        curTask.status.stop = data.stop;

        if (data.stop === 'true') {

            curTask.status.status = 'stop';

        } else {

            curTask.status.status = 'wait';

        }

        saveTask();

    } else {

        message = 'task not found';

    }

    res({
        res: {
            message,
            status: true
        }
    });

};

// ================================================================================
// Socket / server
// ================================================================================
Promise.resolve()
    .then(() => msg.spawnSocket('task', pmid, Action))
    .then(() => {

        taskServer();

    })
    .catch((err) => console.error(`Task: ${err.message}\n${err.stack}`));
