import Vue from 'vue';
import ElementUI from 'element-ui';
import App from './App';
import router from './router';
import store from './store';

Vue.use(ElementUI);

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
