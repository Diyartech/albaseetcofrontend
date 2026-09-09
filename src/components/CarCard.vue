<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/bookingStore'
import { Users, DoorClosed, Gauge, Briefcase, Check, ShieldAlert } from 'lucide-vue-next'

const props = defineProps({
  car: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])
const bookingStore = useBookingStore()
const router = useRouter()

const calculatedTotal = computed(() => {
  let rate = props.car.dailyRate
  if (bookingStore.rentalMode === 'weekly') {
    rate *= (1 - (props.car.weeklyDiscount || 0.1))
  } else if (bookingStore.rentalMode === 'monthly') {
    rate *= (1 - (props.car.monthlyDiscount || 0.25))
  }
  return (rate * bookingStore.rentalDays).toFixed(2)
})

const availableForSelectedBranch = computed(() => {
  if (!bookingStore.pickupBranchId || bookingStore.pickupBranchId === 'all') {
    return props.car.availableCount !== undefined ? props.car.availableCount : (props.car.availableStock !== undefined ? props.car.availableStock : 1)
  }
  const bStock = props.car.branchStock || (typeof props.car.branchStockJson === 'string' ? JSON.parse(props.car.branchStockJson || '{}') : {})
  const key = String(bookingStore.pickupBranchId)
  if (bStock[key] !== undefined) {
    return parseInt(bStock[key]) || 0
  }
  return props.car.availableCount || 0
})

const isOutOfStock = computed(() => {
  return availableForSelectedBranch.value <= 0 || props.car.isActive === false
})

function handleBookClick() {
  if (isOutOfStock.value) return
  bookingStore.selectedCar = props.car
  emit('select', props.car)
  bookingStore.currentStep = 2
  router.push({ path: '/booking', query: { edit: 'true', fromFleet: 'true' } })
}
</script>

<template>
  <div class="car-card card" :class="{ 'selected-card': isSelected, 'out-of-stock-card': isOutOfStock }">
    <!-- Badge & Image Container -->
    <div class="card-header-area">
      <span class="badge badge-gold badge-top">{{ car.badge || car.category }}</span>
      <span v-if="isOutOfStock" class="badge badge-red badge-stock">
        غير متوفرة بهذا الفرع 🔴
      </span>
      <span v-else-if="availableForSelectedBranch < 10" class="badge badge-orange badge-stock">
        متوفر {{ availableForSelectedBranch }} سيارات بفرع الحجز
      </span>
      <div class="car-img-wrapper">
        <img :src="car.image" :alt="car.name" class="car-img" />
      </div>
    </div>

    <!-- Details Body -->
    <div class="car-body">
      <div class="car-title-block">
        <h3 class="car-name">{{ car.name }}</h3>
        <span class="or-similar">{{ car.orSimilar }}</span>
      </div>

      <!-- Car Specifications Icons -->
      <div class="specs-grid">
        <div class="spec-item" title="عدد الركاب">
          <Users :size="16" />
          <span>{{ car.passengers }}</span>
        </div>
        <div class="spec-item" title="الأبواب">
          <DoorClosed :size="16" />
          <span>{{ car.doors }}</span>
        </div>
        <div class="spec-item" title="القير">
          <Gauge :size="16" />
          <span>{{ car.transmission }}</span>
        </div>
        <div class="spec-item" title="سعة الأمتعة">
          <Briefcase :size="16" />
          <span>{{ car.luggage }}</span>
        </div>
      </div>

      <!-- Feature Tags -->
      <div class="features-row">
        <span v-for="(feat, idx) in (car.features || []).slice(0, 3)" :key="idx" class="feat-tag">
          <Check :size="12" />
          {{ feat }}
        </span>
      </div>

      <hr class="card-divider" />

      <!-- Price & Action CTA -->
      <div class="card-footer-area">
        <div class="price-box">
          <div class="daily-rate">
            <span class="amount">{{ car.dailyRate }}</span>
            <span class="currency">ر.س / يوم</span>
          </div>
          <div class="total-rate">
            <span>إجمالي {{ bookingStore.rentalDays }} أيام: </span>
            <strong class="total-num">{{ calculatedTotal }} ر.س</strong>
          </div>
        </div>

        <button 
          class="btn select-btn"
          :class="isOutOfStock ? 'btn-outline-red' : 'btn-orange'"
          :disabled="isOutOfStock"
          @click="handleBookClick"
        >
          <span>{{ isOutOfStock ? 'غير متوفرة' : isSelected ? 'تم الاختيار' : 'احجز الآن' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.car-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: var(--transition);
}

.car-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(0, 77, 64, 0.12);
  border-color: var(--primary-light);
}

.selected-card {
  border: 2px solid var(--orange);
  box-shadow: var(--shadow-orange);
}

.card-header-area {
  position: relative;
  background: radial-gradient(circle at center, #F8FAF9 0%, #EDF2F0 100%);
  padding: 1.5rem 1rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.badge-top {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.badge-stock {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
}

.badge-red {
  background: #FFEBEE;
  color: #C62828;
  border: 1px solid #FFCDD2;
}

.out-of-stock-card {
  opacity: 0.75;
  filter: grayscale(0.25);
}

.btn-outline-red {
  border: 1px solid #EF5350;
  color: #C62828;
  background: #FFEBEE;
  cursor: not-allowed;
}

.car-img-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.car-img {
  max-width: 90%;
  max-height: 150px;
  object-fit: contain;
  transition: var(--transition);
}

.car-card:hover .car-img {
  transform: scale(1.05);
}

.car-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.car-title-block {
  margin-bottom: 1rem;
}

.car-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-dark);
}

.or-similar {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.specs-grid {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-main);
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  margin-bottom: 0.85rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.features-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.feat-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.72rem;
  color: var(--primary);
  background: var(--primary-surface);
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.card-divider {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 0.75rem 0;
}

.card-footer-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: auto;
}

.price-box {
  display: flex;
  flex-direction: column;
}

.daily-rate {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.daily-rate .amount {
  font-size: 1.35rem;
  font-weight: 900;
  color: var(--primary);
}

.daily-rate .currency {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.total-rate {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.total-num {
  color: var(--orange-hover);
}

.select-btn {
  padding: 0.6rem 1.25rem;
}

@media (max-width: 480px) {
  .card-header-area {
    height: 160px;
  }
  .specs-grid {
    justify-content: space-around;
    padding: 0.5rem;
  }
  .spec-item {
    font-size: 0.78rem;
  }
  .daily-rate .amount {
    font-size: 1.15rem;
  }
  .card-footer-area {
    flex-direction: column;
    align-items: stretch;
    gap: 0.85rem;
  }
  .select-btn {
    width: 100%;
  }
}
</style>
