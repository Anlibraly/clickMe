import axios from 'axios';
import g from '../assets/const';

let responseCB = res => {

    if (res.status === g.HTTP_SUC_CODE) {

        return res.res;

    }

    return [];

};

export default {

    searchRoom: query =>
        axios.get('/api/room/search', {
            params: query
        }).then((res) => responseCB(res)),
    // 获取房间信息
    fetchRoom: room =>
        axios.get(`/api/room/fetch?id=${room._id}`)
            .then((res) => responseCB(res)),
    // 获取房间列表
    fetchRoomList: () =>
        axios.get('/api/room/list')
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
