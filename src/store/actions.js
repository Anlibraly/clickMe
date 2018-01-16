import axios from 'axios';
import g from '../assets/const';

let responseCB = res => {

    if (res.status === g.HTTP_SUC_CODE) {

        return res.data;

    }

    return {};

};

export default {
    intoRoom: ({commit, socket}, {roomId, apiToken}) =>
        socket.emit('room', {
            roomId,
            apiToken
        }),
    searchRoom: query =>
        axios.get('/api/room/search', {
            params: query
        }).then((res) => responseCB(res)),
    // 获取房间信息
    fetchRoom: room =>
        axios.get(`/api/room/fetch?id=${room._id}`)
            .then((res) => responseCB(res)),
    // 获取房间列表
    fetchRoomList: ({commit}, {page = 0, apiToken}) =>
        axios.post('/api/room/list', {
            page,
            apiToken
        })
        .then((res) => responseCB(res)),
    login: ({commit}, {username, password}) =>
        axios.post('/api/account/login', {
            username,
            password
        })
        .then((res) => {
            
            commit('LOGIN_SUC', res);
            
            return res.data;

        })

};
