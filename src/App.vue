<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
</script>

<template>
  <div id="app-layout">
    <Header />
    <main class="main-body">
      <router-view />
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
</template>

<style scoped>
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-body {
  flex: 1;
  width: 100%;
}

@media (max-width: 768px) {
  .main-body {
    padding-bottom: 60px; /* Space for MobileBottomNav */
  }
}
</style>
