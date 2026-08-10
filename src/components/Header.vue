<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../stores/adminStore'
import { 
  Menu, User, Globe, Phone, Car, Search, ShieldCheck, 
  LayoutDashboard, CalendarCheck, Lock, X, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-vue-next'
import NavigationDrawer from './NavigationDrawer.vue'

const adminStore = useAdminStore()
const router = useRouter()

const isDrawerOpen = ref(false)
const currentLang = ref('العربية')

// Login Modal State
const isLoginModalOpen = ref(false)
const loginEmail = ref('admin@albaseet.sa')
const loginPassword = ref('admin123')
const loginError = ref('')
const isSubmitting = ref(false)

function toggleLang() {
  currentLang.value = currentLang.value === 'العربية' ? 'English' : 'العربية'
}

function openLoginModal() {
  if (adminStore.isLoggedIn) {
    router.push('/admin')
  } else {
    loginError.value = ''
    isLoginModalOpen.value = true
  }
}

async function handleLoginSubmit() {
  loginError.value = ''
  if (!loginEmail.value || !loginPassword.value) {
    loginError.value = 'يرجى إدخال البريد الإلكتروني وكلمة المرور أولاً'
    return
  }

  isSubmitting.value = true
  try {
    await adminStore.login(loginEmail.value, loginPassword.value)
    isSubmitting.value = false
    isLoginModalOpen.value = false
    router.push('/admin')
  } catch (err) {
    isSubmitting.value = false
    loginError.value = 'خطأ في تسجيل الدخول: البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.'
  }
}
</script>

<template>
  <header class="main-header">
    <div class="top-announcement-bar">
      <div class="container announcement-content">
        <div class="announcement-text">
          <span class="badge-tag">{{ adminStore.announcementBadge }}</span>
          {{ adminStore.announcementText }}
        </div>
        <div class="top-contact">
          <a :href="`tel:${adminStore.supportPhone}`" class="phone-link">
            <Phone :size="14" />
            <span>{{ adminStore.supportPhone }} (مجاني)</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header Bar -->
    <div class="nav-bar">
      <div class="container nav-container">
        <!-- Menu Drawer Toggle Button -->
        <button class="drawer-trigger" @click="isDrawerOpen = true" aria-label="فتح القائمة الجانبية">
          <Menu :size="26" />
          <span class="menu-label">القائمة</span>
        </button>

        <!-- Brand Logo -->
        <router-link to="/" class="header-logo">
          <img src="/logo.png" alt="شركة البسيط المتحدة لتأجير السيارات" class="official-logo-img" />
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="desktop-nav">
          <router-link to="/" class="nav-link" active-class="active">الرئيسية</router-link>
          <router-link to="/booking" class="nav-link" active-class="active">الحجز</router-link>
          <router-link to="/manage-booking" class="nav-link" active-class="active">إدارة الحجز</router-link>
          <router-link to="/fleet" class="nav-link" active-class="active">الأسطول</router-link>
          <router-link to="/branches" class="nav-link" active-class="active">الفروع</router-link>
          <router-link to="/offers" class="nav-link" active-class="active">العروض</router-link>
        </nav>

        <!-- Action Tools Bar -->
        <div class="header-actions">
          
          <!-- Manage Booking Button (زر إدارة الحجز) -->
          <router-link to="/manage-booking" class="icon-action-btn manage-btn" title="الاستعلام وإدارة الحجز">
            <CalendarCheck :size="18" class="text-gold" />
            <span class="btn-text">إدارة الحجز</span>
          </router-link>

          <!-- Login / Admin CMS Button (زر تسجيل الدخول / لوحة التحكم) -->
          <button v-if="!adminStore.isLoggedIn" class="icon-action-btn login-btn" @click="openLoginModal" title="تسجيل الدخول">
            <User :size="18" />
            <span class="btn-text">تسجيل الدخول</span>
          </button>

          <router-link v-else to="/admin" class="icon-action-btn admin-active-btn" title="لوحة التحكم">
            <LayoutDashboard :size="18" class="text-gold" />
            <span class="btn-text">لوحة التحكم</span>
          </router-link>

          <!-- Language Switcher -->
          <button class="icon-action-btn lang-btn" @click="toggleLang" title="تغيير اللغة">
            <Globe :size="18" />
            <span>{{ currentLang }}</span>
          </button>

          <!-- Book Now CTA -->
          <router-link to="/booking" class="btn btn-orange btn-sm book-cta-btn">
            <Car :size="16" />
            <span>احجز الآن</span>
          </router-link>

        </div>
      </div>
    </div>

    <!-- Admin Login Modal Dialog -->
    <Teleport to="body">
      <div v-if="isLoginModalOpen" class="login-modal-overlay" @click="isLoginModalOpen = false">
        <div class="login-modal-card card" @click.stop>
          <div class="login-header">
            <div class="login-icon-circle">
              <Lock :size="28" class="text-primary" />
            </div>
            <div>
              <h3>تسجيل دخول الإدارة والنظام 🔒</h3>
              <p class="text-muted">أدخل البريد الإلكتروني وكلمة المرور للدخول إلى لوحة التحكم</p>
            </div>
            <button class="close-pop-btn" @click="isLoginModalOpen = false">
              <X :size="18" />
            </button>
          </div>

          <hr class="card-divider my-3" />

          <form @submit.prevent="handleLoginSubmit" class="login-form">
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني</label>
              <input 
                type="email" 
                v-model="loginEmail" 
                class="form-control" 
                placeholder="admin@albaseet.sa"
                required 
              />
            </div>

            <div class="form-group mt-3">
              <label class="form-label">كلمة المرور</label>
              <input 
                type="password" 
                v-model="loginPassword" 
                class="form-control" 
                placeholder="••••••••"
                required 
              />
            </div>

            <div v-if="loginError" class="login-error-msg mt-3">
              <AlertCircle :size="18" class="text-danger flex-shrink-0" />
              <span>{{ loginError }}</span>
            </div>

            <div class="modal-actions mt-4">
              <button type="button" class="btn btn-outline" @click="isLoginModalOpen = false" :disabled="isSubmitting">إلغاء</button>
              <button type="submit" class="btn btn-primary login-submit-btn" :disabled="isSubmitting">
                <RefreshCw v-if="isSubmitting" :size="18" class="spin-icon" />
                <CheckCircle2 v-else :size="18" />
                <span>{{ isSubmitting ? 'جاري التحقق والتسجيل...' : 'دخول لوحة التحكم' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Navigation Drawer Component -->
    <NavigationDrawer :is-open="isDrawerOpen" @close="isDrawerOpen = false" @open-login="openLoginModal" />
  </header>
</template>

<style scoped>
.main-header {
  position: sticky;
  top: 0;
  z-index: 500;
  width: 100%;
  background: var(--bg-card);
  box-shadow: 0 4px 20px rgba(0, 77, 64, 0.08);
}

.top-announcement-bar {
  background: var(--primary-dark);
  color: var(--text-white);
  font-size: 0.8rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.announcement-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-tag {
  background: var(--gold);
  color: var(--primary-deep);
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  margin-left: 0.5rem;
}

.top-contact .phone-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--gold);
  font-weight: 700;
}

.nav-bar {
  padding: 0.85rem 0;
  background: var(--bg-card);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.drawer-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--primary);
  font-weight: 700;
  transition: var(--transition);
}

.drawer-trigger:hover {
  background: var(--primary-surface);
}

.header-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.official-logo-img {
  height: 48px;
  max-width: 210px;
  object-fit: contain;
  transition: var(--transition);
}

.official-logo-img:hover {
  transform: scale(1.03);
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-link {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
  padding: 0.5rem 0.2rem;
  position: relative;
  transition: var(--transition);
}

.nav-link:hover, .nav-link.active {
  color: var(--primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  right: 0;
  left: 0;
  height: 3px;
  background: var(--gold);
  border-radius: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.icon-action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dark);
  background: var(--bg-card);
  transition: var(--transition);
  cursor: pointer;
}

.icon-action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-surface);
}

.admin-active-btn {
  border-color: var(--gold);
  background: var(--primary-surface);
  color: var(--primary-deep);
}

/* Login Modal Styling */
.login-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-modal-card {
  width: 440px;
  max-width: 92vw;
  padding: 2rem;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
}

.login-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.login-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.login-header h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-dark);
}

.close-pop-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.login-error-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FFEBEE;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.login-submit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spin-icon {
  animation: spinLoader 0.8s linear infinite;
}

@keyframes spinLoader {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .desktop-nav {
    display: none;
  }
}

@media (max-width: 768px) {
  .top-announcement-bar {
    display: none;
  }
  .nav-bar {
    padding: 0.5rem 0;
  }
  .nav-container {
    gap: 0.5rem;
  }
  .official-logo-img {
    height: 38px;
    max-width: 150px;
  }
  .menu-label {
    display: none;
  }
  .drawer-trigger {
    padding: 0.4rem;
  }
  .btn-text, .admin-active-btn, .lang-btn {
    display: none;
  }
  .login-btn, .manage-btn {
    padding: 0.45rem;
  }
  .book-cta-btn {
    padding: 0.45rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
