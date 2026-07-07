import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import MapView from '../pages/MapView.vue'

const routes = [
  {
    path: '/',
    name: 'index',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'MapView',
        component: MapView,
      },
    ],
  },
]

// /manage is only built into the dev server bundle. It is dropped from the
// production build because GitHub Pages is static and has no backend to
// write to.
if (import.meta.env.DEV) {
  routes[0].children.push({
    path: 'manage',
    name: 'ManageView',
    component: () => import('../pages/ManageView.vue'),
  })
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
