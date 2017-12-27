import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        user: null,
        nowRoom: null,
        conversation: [],
        cookies: {},
        socket: null,
        messages: []
    },
    actions,
    mutations
});

export default store;
