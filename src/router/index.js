import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue'
import FaultManagement from '@/views/FaultManagement.vue'
import CreateFault from '../views/CreateFault.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/fault-management', component: FaultManagement },
  { path: '/create-fault', component: CreateFault }
]
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;