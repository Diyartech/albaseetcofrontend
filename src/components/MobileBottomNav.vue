<script setup>
import { useRoute } from 'vue-router'
import { Home, Car, CalendarCheck, ShieldCheck, Tag, Phone } from 'lucide-vue-next'

const route = useRoute()
</script>

<template>
  <nav class="mobile-bottom-nav">
    <router-link to="/" class="nav-btn" :class="{ active: route.path === '/' }">
      <Home :size="20" />
      <span>الرئيسية</span>
    </router-link>

    <router-link to="/booking" class="nav-btn" :class="{ active: route.path === '/booking' }">
      <Car :size="20" />
      <span>الحجز</span>
    </router-link>

    <router-link to="/manage-booking" class="nav-btn" :class="{ active: route.path === '/manage-booking' }">
      <CalendarCheck :size="20" />
      <span>إدارة الحجز</span>
    </router-link>

    <router-link to="/fleet" class="nav-btn" :class="{ active: route.path === '/fleet' }">
      <ShieldCheck :size="20" />
      <span>الأسطول</span>
    </router-link>

    <router-link to="/offers" class="nav-btn" :class="{ active: route.path === '/offers' }">
      <Tag :size="20" />
      <span>العروض</span>
    </router-link>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(7, 28, 24, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  z-index: 900;
  padding: 0.4rem 0.5rem;
  justify-content: space-around;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  color: var(--text-light);
  font-size: 0.72rem;
  font-weight: 600;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.nav-btn.active {
  color: var(--gold);
  font-weight: 800;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
  }
}
</style>
