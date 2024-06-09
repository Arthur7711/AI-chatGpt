import { createRouter, createWebHashHistory } from "vue-router";

import App from "./pages/Home.vue";
import NoAcces from "./pages/403.vue";

const routes = [
  {
    path: "/",
    component: App,
  },
  {
    path: "/playground",
    component: App,
  },
  {
    path: "/403",
    component: NoAcces,
    name: "403",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
