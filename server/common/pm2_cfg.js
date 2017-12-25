'use strict';
let g           = require('./const');

exports.servers = {
    data: {
        name: 'data',
        script: 'product/server/process/data/master.js',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        exec_mode: 'cluster',
        instances: 1,
        out_file: './logs/data_out.log',
        error_file: './logs/data_err.log',
        log_file: './logs/data_log.log'
    },
    api: {
        name: 'api',
        script: './product/server/process/api/master.js',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        exec_mode: 'cluster',
        instances: 1,
        out_file: './logs/api_out.log',
        error_file: './logs/api_err.log',
        log_file: './logs/api_log.log',
        node_args: '--max-old-space-size=150 --harmony'
    },
    socket: {
        name: 'socket',
        script: './product/server/process/socket/master.js',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        exec_mode: 'cluster',
        instances: 1,
        out_file: './logs/socket_out.log',
        error_file: './logs/socket_err.log',
        log_file: './logs/socket_log.log',
        node_args: '--harmony',
        max_memory_restart: '300M'
    }
};

exports.ports = {
    data: g.SERVER_PORT.DATA,
    api: g.SERVER_PORT.API,
    socket: g.SERVER_PORT.SOCKET
};
