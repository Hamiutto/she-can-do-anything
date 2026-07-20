import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import FiveTimesPage from './pages/FiveTimesPage.vue'
import LifeTemplatesPage from './pages/LifeTemplatesPage.vue'
import QaSquarePage from './pages/QaSquarePage.vue'
import ThanksPage from './pages/ThanksPage.vue'
import TeamPage from './pages/TeamPage.vue'
import LoginPage from './pages/LoginPage.vue'
import ProfilePage from './pages/ProfilePage.vue'
import ProfilePublicPage from './pages/ProfilePublicPage.vue'
import { useAuth } from './composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/five-times', name: 'five-times', component: FiveTimesPage },
    { path: '/life-templates', name: 'life-templates', component: LifeTemplatesPage },
    { path: '/qa-square', name: 'qa-square', component: QaSquarePage },
    { path: '/particle', name: 'particle', component: () => import('./pages/ParticlePage.vue') },
    { path: '/thanks', name: 'thanks', component: ThanksPage },
    { path: '/team', name: 'team', component: TeamPage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/profile', name: 'profile', component: ProfilePage, meta: { requiresAuth: true } },
    { path: '/profile/:userId', name: 'profile-public', component: ProfilePublicPage },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

// Navigation guard
router.beforeEach((to) => {
  const { state } = useAuth()
  if (to.meta.requiresAuth && !state.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  // Redirect logged-in users away from login page
  if (to.path === '/login' && state.isLoggedIn) {
    return { path: '/' }
  }
})

export default router
