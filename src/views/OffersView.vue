<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/bookingStore'
import { Tag, Sparkles, Copy, Check, ChevronLeft } from 'lucide-vue-next'

const bookingStore = useBookingStore()
const router = useRouter()

const offers = ref([
  {
    id: 1,
    title: 'خصم البسيط العام 15%',
    subtitle: 'على جميع فئات السيارات عند الحجز المباشر عبر الموقع',
    code: 'BASEET15',
    discount: '15%',
    badge: 'خصم عام',
    validity: 'صالح حتى نهاية شهر أغسطس 2026',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    title: 'عرض الشريك Key لربيع 2026',
    subtitle: 'خصم حصري 20% على السيارات الفخمة والسدان العائلية',
    code: 'KEY2026',
    discount: '20%',
    badge: 'عرض فخم',
    validity: 'صالح لجميع فروع المطارات',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    title: 'وفر في الإيجار الشهري (فليكس)',
    subtitle: 'خصم يصل إلى 25% على السيارات الاقتصادية عند التأجير لمدة 30 يوماً فأكثر',
    code: 'MONTHLY25',
    discount: '25%',
    badge: 'إيجار شهري',
    validity: 'شامل الصيانة والتأمين',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80'
  }
])

const copiedCode = ref('')

function applyAndBook(code) {
  bookingStore.promoCode = code
  bookingStore.applyPromoCode()
  copiedCode.value = code
  setTimeout(() => {
    router.push('/booking')
  }, 600)
}
</script>

<template>
  <div class="offers-page section-padding">
    <div class="container">
      <div class="page-header card">
        <div class="header-content">
          <div class="icon-box"><Tag :size="32" /></div>
          <div>
            <h1 class="heading-lg">عروض وتخفيضات شركة البسيط والمفتاح</h1>
            <p class="text-muted">نسخ كود الخصم بضغطة زر وتطبيقه مباشرة على حجزك</p>
          </div>
        </div>
      </div>

      <!-- Offers Grid -->
      <div class="offers-grid">
        <div v-for="offer in offers" :key="offer.id" class="offer-card card">
          <div class="offer-img-box">
            <img :src="offer.image" :alt="offer.title" />
            <span class="offer-discount-badge">{{ offer.discount }} خصم</span>
          </div>

          <div class="offer-body">
            <span class="badge badge-gold mb-2">{{ offer.badge }}</span>
            <h3 class="offer-title">{{ offer.title }}</h3>
            <p class="offer-sub">{{ offer.subtitle }}</p>
            <span class="offer-validity">{{ offer.validity }}</span>

            <div class="offer-code-bar">
              <div class="code-text">الكود: <strong>{{ offer.code }}</strong></div>
              <button class="btn btn-orange btn-sm" @click="applyAndBook(offer.code)">
                <span>{{ copiedCode === offer.code ? 'تم النسخ والتطبيق!' : 'تطبيق الكود واحجز' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  padding: 2rem;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.icon-box {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--gold-light);
  color: var(--gold);
  border: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.offer-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.offer-img-box {
  height: 180px;
  position: relative;
}

.offer-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.offer-discount-badge {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: var(--orange);
  color: white;
  font-size: 1.1rem;
  font-weight: 900;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-orange);
}

.offer-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.offer-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.offer-sub {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.offer-validity {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.offer-code-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-main);
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  margin-top: auto;
}

.code-text {
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .offers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .offers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
