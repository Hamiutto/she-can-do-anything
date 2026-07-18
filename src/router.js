import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import FiveTimesPage from './pages/FiveTimesPage.vue'
import LifeTemplatesPage from './pages/LifeTemplatesPage.vue'
import QaSquarePage from './pages/QaSquarePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/five-times', name: 'five-times', component: FiveTimesPage },
    { path: '/life-templates', name: 'life-templates', component: LifeTemplatesPage },
    { path: '/qa-square', name: 'qa-square', component: QaSquarePage }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
