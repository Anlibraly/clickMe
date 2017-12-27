import Vue from 'vue';
import Router from 'vue-router';
import login from '../components/auth/login';
import roomList from '../components/room/list';
// import Management from '../components/main/management/Management';
// import Timeline from '../components/main/time_show/Timeline';
// import TimeSlide from '../components/main/time_show/TimeSlide';
import store from '../store';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/login',
            component: login
        },
        {
            path: '/room',
            component: roomList,
            children: [
                {
                    path: 'list',
                    component: roomList
                }
            ]
        }, {
            path: '/',
            redirect: '/room'
        }
    ]
});

router.beforeEach((to, from, next) => {

    console.log(store.state);

    // 登录验证
    if (!to.path.startsWith('/login') && !store.state.user) {

        next('/login');

    } else {

        next();

    }

});

export default router;
