'use strict';

const API_TOKEN_EXPIRE = 7200;

const LAUNCH = 8000;
const WEB = 8090;
const DATA = 8100;
const API = 8120;
const SOCKET = 8140;
const SERVER_PORT = {
    LAUNCH,
    DATA,
    API,
    SOCKET,
    WEB
};

const SOCKET_PORT = 9000;
const SOCKET_TIMEOUT = 1000;
const SOCKET_SEND_WAIT = 50;

module.exports = {
    API_TOKEN_EXPIRE,
    SERVER_PORT,
    SOCKET_PORT,
    SOCKET_SEND_WAIT,
    SOCKET_TIMEOUT
};
