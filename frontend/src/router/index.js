import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const routes = [
    { 
        path: '/login', 
        name: 'Login', 
        component: () => import('../views/Login.vue') 
    },
    { 
        path: '/user-dashboard', 
        name: 'UserDashboard',
        component: () => import('../views/UserDashboard.vue'), 
        meta: { requiresAuth: true, roles: ['user', 'admin'] } 
    },
    { 
        path: '/admin-dashboard', 
        name: 'AdminDashboard',
        component: () => import('../views/AdminDashboard.vue'), 
        meta: { requiresAuth: true, roles: ['admin'] } 
    },
    { path: '/', redirect: '/login' },
    { path: '/:catchAll(.*)', redirect: '/login' } 
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    // Pinia store can be accessed outside of components after being injected in main.js
    const store = useUserStore();
    
    // Check 1: Authentication
    if (to.meta.requiresAuth && !store.isLoggedIn) {
        return next('/login');
    } 
    
    // Check 2: Role Authorization
    if (to.meta.roles && store.isLoggedIn && !to.meta.roles.includes(store.role)) {
        return next('/unauthorized'); // You need to create this view
    }
    
    // Check 3: Prevent logged-in users from seeing the login page
    if (to.name === 'Login' && store.isLoggedIn) {
        return next(store.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
    }

    next();
});

export default router;