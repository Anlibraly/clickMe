export default {
    joinRoom (room, state) {

        state.nowRoom = room;
        this.$cookie.set('room', JSON.stringify(room), {
            expires: '2h'
        });

    },

    exitRoom (room, state) {

        state.nowRoom = null;
        this.$cookie.set('room', '', 1);

    }

};
