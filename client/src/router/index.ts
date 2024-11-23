import {createRouter, createWebHistory, Router} from "vue-router";

declare module "vue-router" {
    interface RouteMeta {
        requiresAuth?: boolean;
    }
}

const routes = [
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/Login.vue"),
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("@/views/Register.vue"),
    },
    {
        path: "/",
        name: "Home",
        component: () => import("@/views/Home.vue"),
        meta: {
            requiresAuth: true,
        },
    },
]

const buildRouter = (): Router => {
    const r = routes;

    return createRouter({
        scrollBehavior(to) {
            if (to.params.section) {
                return {
                    el: `#${to.params.section}`,
                    top: 75,
                    behavior: "smooth",
                };
            }
            return {
                top: 0,
                behavior: "smooth",
            };
        },
        history: createWebHistory(),
        routes: r,
    });
};

const router = buildRouter();

export default router