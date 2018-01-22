import Vue from 'vue';
import MintUI from 'mint-ui';
import './assets/reset.css';
import 'mint-ui/lib/style.css';
import App from './App';
import router from './router';
import store from './store';
import VueCookie from 'vue-cookie';
import sockets from './store/sockets';

Vue.use(VueCookie);
Vue.use(MintUI);

let socket = sockets.connect();

socket.on('reward', (msg) => {

    store.state.messages.push(msg);

    console.log(msg);

});

socket.on('sys', (res) => {

    console.log('system info: ', res);

});

socket.on('chat', (res) => {

    store.state.conversation.push(res);

});

store.state.socket = socket;

new Vue({
    el: '#app',
    template: '<App/>',
    components: {
        App
    },
    render: h => h(App),
    router,
    store
});
