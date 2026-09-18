<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/bookingStore'
import { useBranchStore } from '../stores/branchStore'
import LocationMapModal from './LocationMapModal.vue'
import VueDateTimePicker from './VueDateTimePicker.vue'
import { 
  Calendar, Clock, MapPin, Search, Navigation, 
  ChevronDown, RefreshCw, AlertCircle, Map, X 
} from 'lucide-vue-next'

const bookingStore = useBookingStore()
const branchStore = useBranchStore()
const router = useRouter()

const isMapModalOpen = ref(false)
const todayStr = computed(() => new Date().toISOString().split('T')[0])

const selectedPickupBranch = computed(() => {
  return branchStore.branches.find(b => b.id === bookingStore.pickupBranchId) || branchStore.branches[0]
})

const selectedDropoffBranch = computed(() => {
  if (bookingStore.sameDropoffBranch) return selectedPickupBranch.value
  return branchStore.branches.find(b => b.id === bookingStore.dropoffBranchId) || branchStore.branches[0]
})

const isDropoffManuallyChanged = ref(false)
const activeBranchPopover = ref(null) // 'pickup', 'dropoff', or null
const branchSearchFilter = ref('')
const branchCategoryFilter = ref('all') // 'all' (جميع الفروع)
const hoveredBranch = ref(null)

const currentActiveBranch = computed(() => {
  if (hoveredBranch.value) return hoveredBranch.value
  if (activeBranchPopover.value === 'pickup') {
    return selectedPickupBranch.value
  }
  if (activeBranchPopover.value === 'dropoff') {
    return selectedDropoffBranch.value
  }
  return selectedPickupBranch.value || branchStore.branches[0]
})

const filteredBranchesForPopover = computed(() => {
  let list = [...branchStore.branches]
  if (branchCategoryFilter.value === 'airports') {
    list = list.filter(b => b.isAirport)
  }
  if (branchSearchFilter.value.trim()) {
    const q = branchSearchFilter.value.trim().toLowerCase()
    list = list.filter(b => 
      b.name.toLowerCase().includes(q) || 
      (b.cityName && b.cityName.toLowerCase().includes(q))
    )
  }
  return list
})

function selectBranchFromPopover(branch) {
  if (activeBranchPopover.value === 'pickup') {
    bookingStore.pickupBranchId = branch.id
    if (!isDropoffManuallyChanged.value) {
      bookingStore.dropoffBranchId = branch.id
      bookingStore.sameDropoffBranch = true
    }
  } else if (activeBranchPopover.value === 'dropoff') {
    bookingStore.dropoffBranchId = branch.id
    if (branch.id !== bookingStore.pickupBranchId) {
      isDropoffManuallyChanged.value = true
      bookingStore.sameDropoffBranch = false
    } else {
      isDropoffManuallyChanged.value = false
      bookingStore.sameDropoffBranch = true
    }
  }
  activeBranchPopover.value = null
}

function resetDropoffToPickup() {
  bookingStore.dropoffBranchId = bookingStore.pickupBranchId
  bookingStore.sameDropoffBranch = true
  isDropoffManuallyChanged.value = false
}

function handleClickOutside(event) {
  const widget = document.querySelector('.search-widget-container')
  if (widget && !widget.contains(event.target)) {
    activeBranchPopover.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

    <!-- Form Fields Grid (5-Field Layout) -->
    <div class="search-fields-grid">
      
      <!-- Pickup Branch Box Trigger -->
      <div v-if="bookingStore.serviceType === 'pickup'" class="field-block">
        <label class="field-label">
          <MapPin :size="16" class="text-primary" />
          <span>موقع الاستلام</span>
        </label>

        <div 
          class="custom-select-trigger-box"
          :class="{ active: activeBranchPopover === 'pickup' }"
          @click.stop="activeBranchPopover = activeBranchPopover === 'pickup' ? null : 'pickup'"
        >
          <div class="trigger-main-text">
            <strong>{{ selectedPickupBranch ? selectedPickupBranch.name : 'اختر الفرع' }}</strong>
          </div>
          <ChevronDown :size="16" class="text-muted chevron-icon" :class="{ rotated: activeBranchPopover === 'pickup' }" />
        </div>
      </div>

      <!-- Dropoff Branch Box Trigger (Placed Right Next to Pickup Branch) -->
      <div v-if="bookingStore.serviceType === 'pickup'" class="field-block">
        <label class="field-label">
          <RefreshCw :size="14" class="text-gold" />
          <span>موقع التسليم</span>
        </label>

        <div 
          class="custom-select-trigger-box"
          :class="{ active: activeBranchPopover === 'dropoff' }"
          @click.stop="activeBranchPopover = activeBranchPopover === 'dropoff' ? null : 'dropoff'"
        >
          <div class="trigger-main-text">
            <strong>{{ selectedDropoffBranch ? selectedDropoffBranch.name : 'اختر الفرع' }}</strong>
          </div>
          <ChevronDown :size="16" class="text-muted chevron-icon" :class="{ rotated: activeBranchPopover === 'dropoff' }" />
        </div>
      </div>

      <!-- Delivery Address Input (If Delivery Service) -->
      <div v-if="bookingStore.serviceType === 'delivery'" class="field-block col-span-2">
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
          label="تاريخ / وقت الإستلام"
          :min-date="todayStr"
          :branch-hours="selectedPickupBranch?.hours"
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
          label="تاريخ / وقت التسليم"
          :min-date="bookingStore.pickupDate"
          :min-time="bookingStore.pickupTime"
          :branch-hours="selectedDropoffBranch?.hours"
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
          <span>بحث</span>
        </button>
      </div>
    </div>

    <!-- Backdrop Overlay for Mobile -->
    <div 
      v-if="activeBranchPopover" 
      class="popover-backdrop" 
      @click="activeBranchPopover = null"
    ></div>

    <!-- Interactive Popover Dropdown Panel (الشاشة المنسدلة المرفقة بالصورة 2) -->
    <div 
      v-if="activeBranchPopover" 
      class="branch-picker-popover card shadow-xl"
      @click.stop
    >
      <!-- Mobile Header Bar -->
      <div class="popover-mobile-header">
        <span class="popover-mobile-title">
          {{ activeBranchPopover === 'pickup' ? 'اختر فرع الاستلام 📍' : 'اختر فرع التسليم 🏁' }}
        </span>
        <button 
          type="button" 
          class="btn-close-popover" 
          @click="activeBranchPopover = null"
          title="إغلاق"
        >
          <X :size="18" />
        </button>
      </div>

      <div class="popover-layout-grid">
        
        <!-- Right Column: Tabs (جميع الفروع) -->
        <div class="popover-tabs-column">
          <button 
            type="button" 
            class="tab-filter-btn active"
            @click="branchCategoryFilter = 'all'"
          >
            <span>جميع الفروع</span>
          </button>
        </div>

        <!-- Center Column: Branch Cards Grid & Search Filter -->
        <div class="popover-branches-column">
          <div class="popover-search-header mb-2">
            <input 
              type="text" 
              v-model="branchSearchFilter" 
              class="form-control form-control-sm branch-filter-input" 
              placeholder="ابحث عن فرع أو مدينة..." 
            />
          </div>

          <div class="branches-cards-container">
            <div 
              v-for="b in filteredBranchesForPopover" 
              :key="b.id"
              class="branch-item-card"
              :class="{ 
                active: (activeBranchPopover === 'pickup' && bookingStore.pickupBranchId === b.id) || (activeBranchPopover === 'dropoff' && bookingStore.dropoffBranchId === b.id)
              }"
              @mouseenter="hoveredBranch = b"
              @click="selectBranchFromPopover(b)"
            >
              <div class="branch-name-text">{{ b.name }}</div>
              <div class="branch-city-text">{{ b.cityName || 'المدينة' }}</div>
            </div>
            <div v-if="filteredBranchesForPopover.length === 0" class="no-branches-msg">
              لا توجد فروع مطابقة للبحث
            </div>
          </div>
        </div>

        <!-- Left Column: Operating Hours Details (توقيت الفرع) -->
        <div class="popover-hours-column">
          <h4 class="hours-title font-bold mb-2">توقيت الفرع</h4>
          
          <div v-if="currentActiveBranch" class="hours-details-card">
            <div class="hours-days-label font-bold mb-1">
              {{ currentActiveBranch.is24h || currentActiveBranch.hours?.includes('24') ? 'طوال الأسبوع' : 'السبت - الخميس:' }}
            </div>
            <div class="hours-time-value font-mono font-bold text-dark mb-1">
              {{ currentActiveBranch.hours || '10:00 صباحاً إلى 10:00 مساءً' }}
            </div>
            <div v-if="currentActiveBranch.phone" class="phone-value text-xs text-muted">
              📞 {{ currentActiveBranch.phone }}
            </div>
          </div>
        </div>

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
  position: relative;
  z-index: 1050;
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
  grid-template-columns: 1.2fr 1.2fr 1fr 1fr 1.1fr;
  gap: 1rem;
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

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.hours-badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.73rem;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
  max-width: 55%;
  transition: all 0.3s ease;
}

.hours-badge-inline.highlight {
  background: var(--gold-light);
  color: var(--primary-deep);
  border-color: var(--gold);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.25);
  transform: translateY(-1px);
}

.hours-text-compact {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
}

.transparent-label {
  opacity: 0;
}

.select-duo {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.5rem;
}

.branch-hours-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  background: rgba(0, 77, 64, 0.05);
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-light);
}

.branch-hours-pill strong {
  color: var(--primary);
  font-weight: 700;
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

.custom-select-trigger-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  background: var(--bg-card);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  min-height: 48px;
  transition: all 0.2s ease;
}

.custom-select-trigger-box:hover,
.custom-select-trigger-box.active {
  border-color: #FF7300;
  box-shadow: 0 4px 12px rgba(255, 115, 0, 0.15);
}

.trigger-main-text {
  font-size: 0.9rem;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Branch Picker Popover Modal (طابق تماماً لصورة العميل المرفقة) */
.branch-picker-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  z-index: 999999;
  margin-top: 0.25rem;
  background: #EAEAEA; /* Light grey background matching reference screenshot */
  border: 1.5px solid #D5D5D5;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
}

.popover-layout-grid {
  display: grid;
  grid-template-columns: 150px 1fr 220px;
  gap: 1.25rem;
  align-items: stretch;
}

/* Right Tabs Column */
.popover-tabs-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 2px solid #CCC;
  padding-left: 0.75rem;
}

.tab-filter-btn {
  padding: 0.75rem 0.5rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.88rem;
  background: #FFFFFF;
  color: #333333;
  border: 1px solid #DDD;
  text-align: center;
  white-space: nowrap;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab-filter-btn.active {
  background: #FF7300; /* Distinct orange background from screenshot */
  color: #FFFFFF;
  border-color: #FF7300;
}

/* Center Branch Cards Grid Column */
.popover-branches-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.branch-filter-input {
  border-radius: var(--radius-md);
  border: 1px solid #CCC;
  padding: 0.4rem 0.75rem;
}

.branches-cards-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  max-height: 240px;
  overflow-y: auto;
  padding-left: 0.25rem;
}

.branch-item-card {
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: center;
  padding: 0.65rem 0.85rem;
  background: #FFFFFF;
  border: 1px solid #DDD;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.branch-item-card:hover {
  background: #FFF3E6;
  border-color: #FF7300;
}

.branch-item-card.active {
  background: #FF7300;
  color: #FFFFFF;
  border-color: #FF7300;
}

.branch-item-card.active .branch-name-text,
.branch-item-card.active .branch-city-text {
  color: #FFFFFF !important;
}

.branch-name-text {
  font-weight: 700;
  font-size: 0.85rem;
  color: #222222;
}

.branch-city-text {
  font-size: 0.8rem;
  color: #777777;
  text-align: left;
}

/* Left Hours Column */
.popover-hours-column {
  border-right: 2px solid #CCC;
  padding-right: 0.75rem;
  display: flex;
  flex-direction: column;
}

.hours-title {
  font-size: 0.95rem;
  color: #FF7300;
}

.hours-details-card {
  background: transparent;
  font-size: 0.88rem;
}

.hours-time-value {
  font-size: 0.9rem;
  color: #111;
}

@media (max-width: 1024px) {
  .search-fields-grid {
    grid-template-columns: 1fr 1fr;
  }
  .col-span-2 {
    grid-column: span 2;
  }
  .popover-layout-grid {
    grid-template-columns: 1fr;
  }
  .popover-tabs-column, .popover-hours-column {
    border: none;
    padding: 0;
  }
}

.popover-backdrop {
  display: none;
}

.popover-mobile-header {
  display: none;
}

@media (max-width: 768px) {
  .popover-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999998;
    backdrop-filter: blur(2px);
  }

  .branch-picker-popover {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    width: 100%;
    max-height: 82vh;
    border-radius: 20px 20px 0 0;
    z-index: 999999;
    margin: 0;
    padding: 1.25rem;
    background: #FFFFFF;
    border: none;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
    overflow-y: auto;
    animation: slideUpPopover 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUpPopover {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .popover-mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #EEEEEE;
  }

  .popover-mobile-title {
    font-size: 1.1rem;
    font-weight: 800;
    color: #222222;
  }

  .btn-close-popover {
    background: #F0F0F0;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #444444;
    transition: background 0.2s;
  }

  .btn-close-popover:hover {
    background: #E0E0E0;
  }

  .popover-layout-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .popover-tabs-column {
    display: none;
  }

  .popover-hours-column {
    border-right: none;
    border-top: 1px dashed #DDD;
    padding-right: 0;
    padding-top: 0.75rem;
    margin-top: 0.5rem;
  }

  .branches-cards-container {
    grid-template-columns: 1fr;
    max-height: 220px;
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
  .branches-cards-container {
    grid-template-columns: 1fr;
  }
}
</style>
