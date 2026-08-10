<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/bookingStore'
import { useBranchStore } from '../stores/branchStore'
import LocationMapModal from './LocationMapModal.vue'
import VueDateTimePicker from './VueDateTimePicker.vue'
import { 
  Calendar, Clock, MapPin, Search, Navigation, 
  ChevronDown, RefreshCw, AlertCircle, Map 
} from 'lucide-vue-next'

const bookingStore = useBookingStore()
const branchStore = useBranchStore()
const router = useRouter()

const isMapModalOpen = ref(false)
const todayStr = computed(() => new Date().toISOString().split('T')[0])

const filteredPickupBranches = computed(() => {
  return branchStore.branches.filter(b => b.cityId === bookingStore.pickupCity)
})

const filteredDropoffBranches = computed(() => {
  return branchStore.branches.filter(b => b.cityId === bookingStore.dropoffCity)
})

function openMapModal() {
  isMapModalOpen.value = false
  nextTick(() => {
    isMapModalOpen.value = true
  })
}

function selectDeliveryService() {
  bookingStore.serviceType = 'delivery'
  openMapModal()
}

function handleSearch() {
  bookingStore.validateBookingDates()
  bookingStore.currentStep = 1
  router.push('/booking')
}

function handleLocationSelected(address) {
  bookingStore.deliveryAddress = address
}
</script>

<template>
  <div class="search-widget-container card glass-card">
    <!-- Mode Tabs: Daily / Weekly / Monthly (من المستند) -->
    <div class="rental-mode-tabs">
      <button 
        class="mode-tab" 
        :class="{ active: bookingStore.rentalMode === 'daily' }"
        @click="bookingStore.rentalMode = 'daily'"
      >
        <span class="mode-icon">📅</span>
        <span>يومي</span>
      </button>

      <button 
        class="mode-tab" 
        :class="{ active: bookingStore.rentalMode === 'weekly' }"
        @click="bookingStore.rentalMode = 'weekly'"
      >
        <span class="mode-icon">🗓️</span>
        <span>أسبوعي</span>
        <span class="tab-badge">خصم 10%</span>
      </button>

      <button 
        class="mode-tab" 
        :class="{ active: bookingStore.rentalMode === 'monthly' }"
        @click="bookingStore.rentalMode = 'monthly'"
      >
        <span class="mode-icon">🚘</span>
        <span>شهري (فليكس)</span>
        <span class="tab-badge badge-gold-tab">خصم 25%</span>
      </button>
    </div>

    <!-- Service Type Toggle: Pickup vs Delivery -->
    <div class="service-toggle-row">
      <div class="toggle-group">
        <button 
          class="toggle-btn"
          :class="{ active: bookingStore.serviceType === 'pickup' }"
          @click="bookingStore.serviceType = 'pickup'"
        >
          <MapPin :size="18" />
          <span>استلام من الفرع</span>
        </button>

        <button 
          class="toggle-btn"
          :class="{ active: bookingStore.serviceType === 'delivery' }"
          @click="selectDeliveryService"
        >
          <Navigation :size="18" />
          <span>توصيل إلى موقعك 🗺️</span>
        </button>
      </div>

      <div class="duration-pill">
        <span>مدة الإيجار المحسوبة:</span>
        <strong>{{ bookingStore.rentalDays }} أيام</strong>
      </div>
    </div>

    <!-- Form Fields Grid -->
    <div class="search-fields-grid">
      <!-- Location Selector -->
      <div v-if="bookingStore.serviceType === 'pickup'" class="field-block col-span-2">
        <label class="field-label">
          <MapPin :size="16" class="text-primary" />
          <span>موقع الاستلام (المدينة والفرع)</span>
        </label>
        <div class="select-duo">
          <select v-model="bookingStore.pickupCity" class="form-control form-select city-select">
            <option v-for="c in branchStore.cities" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>

          <select v-model="bookingStore.pickupBranchId" class="form-control form-select branch-select">
            <option v-for="b in filteredPickupBranches" :key="b.id" :value="b.id">
              {{ b.name }} {{ b.isAirport ? '✈️ (المطار)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Delivery Address Input & Map Picker Trigger -->
      <div v-else class="field-block col-span-2">
        <label class="field-label">
          <Navigation :size="16" class="text-orange" />
          <span>عنوان وموقع التوصيل المحدد</span>
        </label>
        <div class="input-with-button">
          <input 
            type="text" 
            v-model="bookingStore.deliveryAddress" 
            class="form-control" 
            placeholder="ادخل اسم الشارع والحي أو اختر من الخريطة"
          />
          <button class="btn btn-orange btn-sm open-map-btn" @click="openMapModal">
            <Map :size="16" />
            <span>تحديد على الخريطة</span>
          </button>
        </div>
      </div>

      <!-- Pickup Date & Time -->
      <div class="field-block">
        <VueDateTimePicker 
          v-model:modelValueDate="bookingStore.pickupDate"
          v-model:modelValueTime="bookingStore.pickupTime"
          label="تاريخ ووقت الاستلام"
          :min-date="todayStr"
          popover-align="right"
          icon-color-class="text-primary"
          @change="bookingStore.validateBookingDates()"
        />
      </div>

      <!-- Dropoff Date & Time -->
      <div class="field-block">
        <VueDateTimePicker 
          v-model:modelValueDate="bookingStore.dropoffDate"
          v-model:modelValueTime="bookingStore.dropoffTime"
          label="تاريخ ووقت التسليم (الإرجاع)"
          :min-date="bookingStore.pickupDate"
          :min-time="bookingStore.pickupTime"
          popover-align="left"
          icon-color-class="text-gold"
          @change="bookingStore.validateBookingDates()"
        />
      </div>

      <!-- Search Submit Button -->
      <div class="field-block action-block">
        <label class="field-label transparent-label">.</label>
        <button class="btn btn-orange btn-lg search-submit-btn" @click="handleSearch">
          <Search :size="20" />
          <span>بحث عن السيارات المتوفرة</span>
        </button>
      </div>
    </div>

    <!-- Different Return Branch Option -->
    <div class="return-option-row">
      <label class="checkbox-label">
        <input type="checkbox" v-model="bookingStore.sameDropoffBranch" :value="false" />
        <span>تسليم السيارة في فرع مختلف عن فرع الاستلام</span>
      </label>

      <div v-if="!bookingStore.sameDropoffBranch" class="different-dropoff-selects">
        <select v-model="bookingStore.dropoffCity" class="form-control form-select sm-select">
          <option v-for="c in branchStore.cities" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="bookingStore.dropoffBranchId" class="form-control form-select sm-select">
          <option v-for="b in filteredDropoffBranches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
    </div>

    <!-- Location Map Modal -->
    <LocationMapModal 
      :is-open="isMapModalOpen" 
      @close="isMapModalOpen = false" 
      @select="handleLocationSelected" 
    />
  </div>
</template>

<style scoped>
.search-widget-container {
  padding: 1.75rem;
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 50px rgba(0, 77, 64, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.rental-mode-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid var(--bg-subtle);
  padding-bottom: 0.75rem;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-muted);
  background: var(--bg-subtle);
  transition: var(--transition);
}

.mode-tab:hover {
  background: rgba(0, 77, 64, 0.08);
  color: var(--primary);
}

.mode-tab.active {
  background: var(--primary);
  color: var(--text-white);
  box-shadow: var(--shadow-sm);
}

.tab-badge {
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-full);
}

.badge-gold-tab {
  background: var(--gold);
  color: var(--primary-deep);
}

.service-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.toggle-group {
  display: flex;
  background: var(--bg-subtle);
  padding: 0.3rem;
  border-radius: var(--radius-lg);
  gap: 0.3rem;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: var(--transition);
}

.toggle-btn.active {
  background: var(--bg-card);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.duration-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--gold-light);
  color: #7A5B00;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  border: 1px solid var(--gold-border);
}

.search-fields-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  align-items: flex-end;
}

.col-span-2 {
  grid-column: span 2;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dark);
}

.transparent-label {
  opacity: 0;
}

.select-duo {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.5rem;
}

.datetime-inputs {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 0.4rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.open-map-btn {
  white-space: nowrap;
}

.search-submit-btn {
  width: 100%;
  height: 48px;
}

.return-option-row {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.different-dropoff-selects {
  display: flex;
  gap: 0.5rem;
}

.sm-select {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
}

@media (max-width: 1024px) {
  .search-fields-grid {
    grid-template-columns: 1fr 1fr;
  }
  .col-span-2 {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .search-widget-container {
    padding: 1rem;
    border-radius: var(--radius-lg);
  }
  .rental-mode-tabs {
    flex-direction: row;
    gap: 0.35rem;
  }
  .mode-tab {
    flex: 1;
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
    justify-content: center;
    text-align: center;
  }
  .mode-icon {
    display: none;
  }
  .tab-badge {
    display: none;
  }
  .search-fields-grid {
    grid-template-columns: 1fr;
  }
  .col-span-2 {
    grid-column: span 1;
  }
  .select-duo {
    grid-template-columns: 1fr;
  }
  .input-with-button {
    flex-direction: column;
  }
  .open-map-btn {
    width: 100%;
  }
}
</style>
