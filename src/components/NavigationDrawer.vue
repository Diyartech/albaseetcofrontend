<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../stores/adminStore'
import { 
  X, Home, Car, CalendarCheck, ShieldCheck, MapPin, 
  Tag, Briefcase, Phone, HelpCircle, User, Globe, LayoutDashboard
} from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'open-login'])
const router = useRouter()
const adminStore = useAdminStore()

function navigateTo(path) {
  router.push(path)
  emit('close')
}

function handleAdminClick() {
  emit('close')
  if (adminStore.isLoggedIn) {
    router.push('/admin')
  } else {
    emit('open-login')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="drawer-overlay" @click="emit('close')">
      <aside class="drawer-panel" @click.stop>
        <!-- Header -->
        <div class="drawer-header">
          <div class="brand">
            <img src="/logo.png" alt="شركة البسيط المتحدة لتأجير السيارات" class="drawer-logo-img" />
          </div>
          <button class="close-btn" @click="emit('close')" aria-label="إغلاق القائمة">
            <X :size="24" />
          </button>
        </div>

        <!-- Quick User Bar -->
        <div class="user-quick-bar">
          <div class="user-avatar">
            <User :size="20" />
          </div>
          <div class="user-info">
            <p class="user-greeting">مرحباً بك في البسيط</p>
            <p class="user-action">سجل الدخول أو أنشئ حساباً كعضو ولاء</p>
          </div>
        </div>

        <!-- Menu Links -->
        <nav class="drawer-nav">
          <ul class="nav-list">
            <li>
              <button class="nav-item" @click="navigateTo('/')">
                <Home :size="20" />
                <span>الرئيسية</span>
              </button>
            </li>
            <li>
              <button class="nav-item" @click="navigateTo('/booking')">
                <Car :size="20" />
                <span>إحجز السيارة (الحجز)</span>
              </button>
            </li>
            <li>
              <button class="nav-item" @click="navigateTo('/manage-booking')">
                <CalendarCheck :size="20" />
                <span>إدارة الحجز (تعديل / إلغاء)</span>
              </button>
            </li>
            <li>
              <button class="nav-item" @click="navigateTo('/fleet')">
                <ShieldCheck :size="20" />
                <span>أسطول السيارات</span>
              </button>
            </li>
            <li>
              <button class="nav-item" @click="navigateTo('/branches')">
                <MapPin :size="20" />
                <span>مواقع الفروع</span>
              </button>
            </li>
            <li>
              <button class="nav-item highlight-badge" @click="navigateTo('/offers')">
                <Tag :size="20" />
                <span>العروض الحصرية</span>
                <span class="badge-new">جديد</span>
              </button>
            </li>
            <li>
              <button class="nav-item" @click="navigateTo('/careers')">
                <Briefcase :size="20" />
                <span>الوظائف</span>
              </button>
            </li>
            <li>
              <button class="nav-item" @click="navigateTo('/faq')">
                <HelpCircle :size="20" />
                <span>الأسئلة الأكثر شيوعاً</span>
              </button>
            </li>
            <li>
              <button class="nav-item" @click="navigateTo('/contact')">
                <Phone :size="20" />
                <span>معلومات عنا - اتصل بنا</span>
              </button>
            </li>
            <li>
              <button class="nav-item text-gold" @click="handleAdminClick">
                <LayoutDashboard :size="20" />
                <span>لوحة تحكم المحتوى (Admin CMS)</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Footer Actions -->
        <div class="drawer-footer">
          <button class="lang-switch-btn">
            <Globe :size="18" />
            <span>English</span>
          </button>
          <div class="support-num">
            <Phone :size="16" />
            <span>خدمة العملاء: 8002440204</span>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 28, 24, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: flex-start;
  animation: fadeIn 0.25s ease;
}

.drawer-panel {
  width: 320px;
  max-width: 85vw;
  height: 100%;
  background: var(--bg-dark);
  color: var(--text-white);
  display: flex;
  flex-direction: column;
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.4);
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  display: flex;
  align-items: center;
}

.drawer-logo-img {
  height: 42px;
  max-width: 190px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.15));
}

.close-btn {
  color: var(--text-light);
  padding: 0.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-white);
}

.user-quick-bar {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.5rem;
  background: var(--bg-dark-card);
  margin: 1rem 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--gold-hover));
  color: var(--bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-greeting {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gold);
}

.user-action {
  font-size: 0.75rem;
  color: var(--text-light);
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1rem;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  color: var(--text-light);
  font-size: 0.95rem;
  font-weight: 600;
  transition: var(--transition);
  text-align: right;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--gold);
  transform: translateX(-4px);
}

.badge-new {
  margin-right: auto;
  background: var(--orange);
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
}

.drawer-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.lang-switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-white);
  font-weight: 600;
}

.support-num {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--gold);
  font-weight: 700;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
