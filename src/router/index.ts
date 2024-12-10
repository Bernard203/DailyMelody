import {createRouter, createWebHashHistory} from "vue-router"

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        redirect: '/login',
    }, {
        path: '/login',
        component: () => import('../views/user/Login.vue'),
        meta: {title: '用户登录'}
    }, {
        path: '/register',
        component: () => import('../views/user/Register.vue'),
        meta: {title: '用户注册'}
    }, {
        path: '/home',
        redirect: '/allStore',
        component: () => import('../views/Home.vue'),
        children: [
            {
                path: '/dashboard',
                name: 'Dashboard',
                component: () => import('../views/user/Dashboard.vue'),
                meta: {title: '个人信息'}
            },
            {
                path: '/musicPlayer',
                name: 'musicPlayer',
                component: () => import('../views/music/MusicPlayer.vue'),
                meta: {title: '推歌主页'}
            },
            {
                path: '/createMusic',
                name: 'createMusic',
                component: () => import('../views/music/CreateMusic.vue'),
                meta: {
                    title: '创建歌曲',
                    permission: ['MANAGER']
                }
            },
            {
                path: '/favouriteSongs',
                name: 'favouriteSongs',
                component: () => import('../views/music/FavouriteSongs.vue'),
                meta: {title: '收藏歌单'}
            },
        ]
    }, {
        path: '/404',
        name: '404',
        component: () => import('../views/NotFound.vue'),
        meta: {title: '404'}
    }, {
        path: '/:catchAll(.*)',
        redirect: '/404'
    }]
})
//
// router.beforeEach((to, _, next) => {
//     const token: string | null = sessionStorage.getItem('token')
//     const role: string | null = sessionStorage.getItem('role')
//     const storeId: string | null = sessionStorage.getItem('storeId')
//
//     if (to.meta.title) {
//         document.title = to.meta.title
//     }
//
//     if (!token) {
//         if (to.path === '/login' || to.path === '/register') {
//             next()
//         } else {
//             next('/login')
//         }
//         return
//     }
//
//     if (to.meta.permission && !to.meta.permission.includes(role!)) {
//         next('/404')
//         return
//     }
//
//     if (to.name === 'createProduct' && to.params.storeId !== storeId) {
//         next('/404')
//         return
//     }
//
//     next()
// })


export {router}
