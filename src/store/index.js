import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        login: null,
        nowRoom: null,
        conversation: [],
        cookies: {},
        token: null,
        socket: null,
        messages: [],
        user: null,
        backAction: () => {}
    },
    actions,
    mutations
});

export default store;
