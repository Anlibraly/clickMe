import g from '../assets/const';
export default {
    JOIN_ROOM (state, room) {

        state.nowRoom = room;
        this.$cookie.set('room', JSON.stringify(room), {
            expires: '2h'
        });

    },

    EXIT_ROOM (state) {

        state.nowRoom = null;
        this.$cookie.set('room', '', 1);

    },

    LOGIN_SUC (state, res) {

        let data = {
            code: -1
        };

        if (res.status === g.HTTP_SUC_CODE) {

            data = res.data;

        }
        
        if (data.code > 0) {

            state.user = data.token;

        }

    }

};
