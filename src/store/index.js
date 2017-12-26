import Vue from 'vue';
import Vuex from 'vuex';
import VueCookie from 'vue-cookie';
import apis from './apis';
import methods from './methods';

Vue.use(Vuex);
Vue.use(VueCookie);

const store = new Vuex.Store({
    state: {
        user: null,
        nowRoom: null,
        conversation: []
    },
    apis,
    methods
});

export default store;
