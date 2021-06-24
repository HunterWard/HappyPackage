
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: 'devices', component: () => import('pages/Devices.vue')},
      { path: 'library', component: () => import('pages/Library.vue')},
      { path: 'explorer', component: () => import('pages/Explorer.vue')},
      { path: 'options', component: () => import('pages/Options.vue')},
      { path: 'setup', component: () => import('pages/Setup.vue')}
    ]
  },
]

export default routes
