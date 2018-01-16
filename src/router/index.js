import Vue from 'vue';
import Router from 'vue-router';
import login from '../components/auth/login';
import roomList from '../components/room/list';
import detial from '../components/room/detail';
// import Management from '../components/main/management/Management';
// import Timeline from '../components/main/time_show/Timeline';
// import TimeSlide from '../components/main/time_show/TimeSlide';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/login',
            component: login
        }, {
            path: '/room',
            component: roomList,
        }, {
            path: '/detail',
            component: detial,
        }, {
            path: '/',
            redirect: '/room'
        }
    ]
});

router.beforeEach((to, from, next) => {

    // 登录验证
    if (!to.path.startsWith('/login') && !Vue.cookie.get('clickme-apiToken')) {

        next('/login');

    } else {

        next();

    }

});

export default router;
