'use strict';

const API_TOKEN_EXPIRE = 7200;

const LAUNCH = 8000;
const WEB = 8090;
const DATA = 8100;
const API = 8120;
const SOCKET = 8140;
const TASK = 8160;
const SERVER_PORT = {
    LAUNCH,
    DATA,
    API,
    SOCKET,
    WEB,
    TASK
};

const SOCKET_PORT = 9000;
const SOCKET_TIMEOUT = 3000;
const SOCKET_SEND_WAIT = 50;

const ROOM_PER_PAGE = 10;

const REDIS_TTL = 86400;

const FILE_END = 0xFEFF;

const ONE_YEAR = 31536000;

const TASK_INTERVAL = 1000;

module.exports = {
    API_TOKEN_EXPIRE,
    SERVER_PORT,
    SOCKET_PORT,
    SOCKET_SEND_WAIT,
    SOCKET_TIMEOUT,
    ROOM_PER_PAGE,
    TASK_INTERVAL,
    REDIS_TTL,
    FILE_END,
    ONE_YEAR
};
