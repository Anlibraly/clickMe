import axios from 'axios';
import g from '../assets/const';
import {Promise} from 'core-js/library/web/timers';

let responseCB = res => {

    if (res.status === g.HTTP_SUC_CODE) {

        return Promise.resolve(res.res);

    }

    return Promise.resolve([]);

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
    login: ({username, password}) =>
        axios.post('/api/account/login', {
            username,
            password
        }).then((res) => {

            if (res.code > 0) {

                this.$cookie.set('clickme-token', res.token, {
                    expires: '4h'
                });

                this.$cookie.set('clickme-apiToken', res.apiToken, {
                    expires: '4h'
                });

                this.$store.state.user = res.token;

                return Promise.resolve(true);

            }

            return Promise.resolve(false);

        })

};
