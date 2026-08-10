<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../stores/adminStore'
import { useCarStore } from '../stores/carStore'
import { useBranchStore } from '../stores/branchStore'
import { apiService } from '../services/api'
import SearchWidget from '../components/SearchWidget.vue'
import CarCard from '../components/CarCard.vue'
import { 
  ShieldCheck, Award, Clock, Sparkles, MapPin, 
  ChevronLeft, Gift, Zap, Percent, CheckCircle
} from 'lucide-vue-next'

const adminStore = useAdminStore()
const carStore = useCarStore()
const branchStore = useBranchStore()
const router = useRouter()

const publicBanners = ref([])
const isPublicBannersFetched = ref(false)

onMounted(async () => {
  try {
    const banners = await apiService.getBanners(false) // Public Endpoint: Active Banners Only
    isPublicBannersFetched.value = true
    if (banners && Array.isArray(banners)) {
      publicBanners.value = banners.map(b => ({
        id: b.id,
        badge: b.badgeText,
        title: b.title,
        subtitle: b.subtitle,
        promoCode: b.promoCode,
        bgGradient: b.bgGradient || 'linear-gradient(135deg, #071C18 0%, #004D40 100%)',
        ctaText: b.ctaText || 'احجز الآن',
        active: b.isActive
      }))
    }
  } catch (err) {
    console.log('API error fetching public banners.')
  }
  if (carStore.fetchCarsFromBackend) carStore.fetchCarsFromBackend()
  if (branchStore.fetchBranchesFromBackend) branchStore.fetchBranchesFromBackend()
})

const activeBanners = computed(() => {
  if (isPublicBannersFetched.value) {
    return publicBanners.value
  }
  return adminStore.banners.filter(b => b.active)
})

const activeBannerIndex = ref(0)
const currentBanner = computed(() => {
  if (!activeBanners.value || activeBanners.value.length === 0) return null
  const idx = activeBannerIndex.value % activeBanners.value.length
  return activeBanners.value[idx] || activeBanners.value[0]
})

function goToFleet() {
  router.push('/fleet')
}

function copyPromo(code) {
  navigator.clipboard.writeText(code)
  alert(`تم نسخ كود الخصم: ${code}`)
}
</script>

<template>
  <div class="home-view">
    <!-- Hero Banner Section -->
    <section v-if="currentBanner" class="hero-section" :style="{ background: currentBanner.bgGradient }">
      <div class="container hero-container">
        <div class="hero-content">
          <span class="hero-badge">
            <Sparkles :size="14" />
            {{ currentBanner.badge }}
          </span>
          <h1 class="hero-title">{{ currentBanner.title }}</h1>
          <p class="hero-subtitle">{{ currentBanner.subtitle }}</p>

          <div class="hero-promo-box">
            <span>استخدم كود الخصم: <strong>{{ currentBanner.promoCode }}</strong></span>
            <button class="btn btn-sm btn-gold" @click="copyPromo(currentBanner.promoCode)">نسخ الكود</button>
          </div>
        </div>

        <div class="banner-controls">
          <button 
            v-for="(b, idx) in activeBanners" 
            :key="b.id" 
            class="dot-btn" 
            :class="{ active: idx === (activeBannerIndex % activeBanners.length) }"
            @click="activeBannerIndex = idx"
          ></button>
        </div>
      </div>
    </section>

    <!-- Search Widget Floating Container (من المستند) -->
    <section class="search-section">
      <div class="container">
        <SearchWidget />
      </div>
    </section>

    <!-- Category Filter Bar & Fleet Preview -->
    <section class="fleet-preview-section section-padding">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="heading-lg">أسطول سيارات البسيط</h2>
            <p class="text-muted">اختر سيارتك المفضلة من بين أحدث موديلات 2025 - 2026</p>
          </div>
          <button class="btn btn-outline-primary" @click="goToFleet">
            <span>عرض كل الأسطول</span>
            <ChevronLeft :size="18" />
          </button>
        </div>

        <!-- Category Selector Pills -->
        <div class="category-pills">
          <button 
            v-for="cat in carStore.categories" 
            :key="cat.id" 
            class="cat-pill"
            :class="{ active: carStore.selectedCategory === cat.id }"
            @click="carStore.selectedCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Cars Grid -->
        <div class="cars-grid">
          <CarCard 
            v-for="car in carStore.filteredCars.slice(0, 6)" 
            :key="car.id" 
            :car="car"
          />
        </div>
      </div>
    </section>

    <!-- Why Choose Al-Baseet (مميزات شركة البسيط) -->
    <section class="why-us-section section-padding">
      <div class="container">
        <div class="text-center section-header-centered">
          <span class="badge badge-gold">لماذا شركة البسيط؟</span>
          <h2 class="heading-lg">خدمات متكاملة تجعل رحلتك أسهل وأكثر أماناً</h2>
        </div>

        <div class="features-grid">
          <div class="feature-card card">
            <div class="feature-icon"><Zap :size="32" /></div>
            <h3>استلام وتسليم سريع</h3>
            <p>إنهاء إجراءاتك خلال أقل من 3 دقائق من فروعنا بالمطارات أو التوصيل المباشر لموقعك.</p>
          </div>

          <div class="feature-card card">
            <div class="feature-icon"><ShieldCheck :size="32" /></div>
            <h3>تغطية تأمينية شاملة</h3>
            <p>تأمين شامل يعفيك من نسبة التحمل في حالات الحوادث، مع أمان الزجاج والإطارات.</p>
          </div>

          <div class="feature-card card">
            <div class="feature-icon"><Percent :size="32" /></div>
            <h3>أسعار منافسة بدون رسوم خفية</h3>
            <p>أسعار شفافة شاملة ضريبة القيمة المضافة مع خصومات حصرية للإيجار الأسبوعي والشهري.</p>
          </div>

          <div class="feature-card card">
            <div class="feature-icon"><Gift :size="32" /></div>
            <h3>برنامج الولاء والمكافآت</h3>
            <p>اكسب نقاطاً مضاعفة مع كل عملية حجز واستبدلها بأيام إيجار مجانية وتسهيلات خاصة.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Branches Highlight Section (من الصفحة 5 في المستند) -->
    <section class="branches-highlight-section section-padding bg-subtle">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="heading-lg">فروع البسيط المميزة في المملكة</h2>
            <p class="text-muted">نخدمك في أكثر من 20 فرعاً ومطاراً رئيسياً بالرياض وجدة والدمام وأبها</p>
          </div>
          <router-link to="/branches" class="btn btn-outline-primary">
            <span>استكشف الفروع</span>
            <ChevronLeft :size="18" />
          </router-link>
        </div>

        <div class="branches-grid">
          <div v-for="b in branchStore.branches.slice(0, 4)" :key="b.id" class="branch-card card">
            <div class="branch-card-header">
              <span class="badge badge-primary">{{ b.cityName }}</span>
              <span v-if="b.isAirport" class="badge badge-gold">المطار ✈️</span>
            </div>
            <h3 class="branch-name">{{ b.name }}</h3>
            <p class="branch-address"><MapPin :size="14" /> {{ b.address }}</p>
            <p class="branch-hours"><Clock :size="14" /> {{ b.hours }}</p>

            <router-link to="/booking" class="btn btn-sm btn-orange w-full">
              <span>احجز من هذا الفرع</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-section {
  color: var(--text-white);
  padding: 4rem 0 7rem;
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(212, 175, 55, 0.2);
  color: var(--gold);
  border: 1px solid var(--gold);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.hero-title {
  font-size: 2.75rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 1rem;
  max-width: 800px;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--text-light);
  margin-bottom: 2rem;
  max-width: 650px;
}

.hero-promo-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.banner-controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
}

.dot-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: var(--transition);
}

.dot-btn.active {
  background: var(--gold);
  width: 32px;
  border-radius: var(--radius-full);
}

.search-section {
  margin-top: -4.5rem;
  position: relative;
  z-index: 100;
}

.section-padding {
  padding: 4.5rem 0;
}

.bg-subtle {
  background: var(--bg-subtle);
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;

}

.section-header-centered {
  margin-bottom: 3rem;

}

.category-pills {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
}

.cat-pill {
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1.5px solid var(--border-light);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-dark);
  white-space: nowrap;
  transition: var(--transition);
}

.cat-pill:hover, .cat-pill.active {
  background: var(--primary);
  color: var(--text-white);
  border-color: var(--primary);
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

}

.feature-card {
  padding: 2rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: var(--primary-surface);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.feature-card h3 {
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.feature-card p {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.branches-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.branch-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;

}

.branch-card-header {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.branch-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.branch-address, .branch-hours {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.branch-hours {
  margin-bottom: 1.25rem;
}

.w-full {
  width: 100%;
}

@media (max-width: 1024px) {
  .cars-grid, .features-grid, .branches-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 2.5rem 0 3.5rem;
  }
  .hero-title {
    font-size: 1.45rem;
  }
  .hero-subtitle {
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }
  .hero-promo-box {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
  }
  .search-section {
    margin-top: -1.5rem;
  }
  .section-padding {
    padding: 2.5rem 0;
  }
  .cars-grid, .features-grid, .branches-grid {
    grid-template-columns: 1fr;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
