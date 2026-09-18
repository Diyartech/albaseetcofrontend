<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCarStore } from '../stores/carStore'
import { useBranchStore } from '../stores/branchStore'
import { useBookingStore } from '../stores/bookingStore'
import CarCard from '../components/CarCard.vue'
import { 
  Car, ArrowUpDown, Search, MapPin, Calendar, Layers, RefreshCw 
} from 'lucide-vue-next'

const carStore = useCarStore()
const branchStore = useBranchStore()
const bookingStore = useBookingStore()

onMounted(() => {
  carStore.fetchCarsFromBackend()
  carStore.fetchLookupsFromBackend()
  branchStore.fetchBranchesFromBackend()
})

const searchQuery = ref('')
const selectedBranch = ref('all')
const selectedCategory = ref('all')
const selectedModelYear = ref('all')
const sortBy = ref('price_asc')

watch(selectedBranch, (newBranch) => {
  if (newBranch && newBranch !== 'all') {
    const b = branchStore.branches.find(br => br.id == newBranch)
    if (b) {
      bookingStore.pickupBranchId = b.id
      bookingStore.dropoffBranchId = b.id
      if (b.cityId) {
        bookingStore.pickupCity = b.cityId
        bookingStore.dropoffCity = b.cityId
      }
    }
  }
})

// Extract unique available model years from the cars array dynamically
const availableModelYears = computed(() => {
  const years = new Set()
  carStore.cars.forEach(c => {
    if (c.year) years.add(c.year)
  })
  return Array.from(years).sort((a, b) => b - a)
})

// Filter & Sort cars list dynamically based on all 3 filters + search query
const searchedAndFilteredCars = computed(() => {
  let list = [...carStore.cars]

  // 1. Branch Filter (اختيار الفرع)
  if (selectedBranch.value !== 'all') {
    const sBranchId = String(selectedBranch.value)
    list = list.filter(c => {
      if (!c.branchId || c.branchId === 'all' || c.branchId === '') return true
      if (String(c.branchId) === sBranchId) return true
      
      const bStock = c.branchStock || (typeof c.branchStockJson === 'string' ? JSON.parse(c.branchStockJson || '{}') : {})
      if (bStock[sBranchId] !== undefined && parseInt(bStock[sBranchId]) > 0) {
        return true
      }
      return false
    })
  }

  // 2. Category Filter (اختيار فئة السيارة)
  if (selectedCategory.value !== 'all') {
    list = list.filter(c => c.categoryId === selectedCategory.value || c.category === selectedCategory.value)
  }

  // 3. Model Year Filter (اختيار سنة الصنع)
  if (selectedModelYear.value !== 'all') {
    list = list.filter(c => String(c.year) === String(selectedModelYear.value))
  }

  // 4. Text Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.orSimilar && c.orSimilar.toLowerCase().includes(q))
    )
  }

  // 5. Sorting
  if (sortBy.value === 'price_asc') {
    list.sort((a, b) => a.dailyRate - b.dailyRate)
  } else if (sortBy.value === 'price_desc') {
    list.sort((a, b) => b.dailyRate - a.dailyRate)
  } else if (sortBy.value === 'year_desc') {
    list.sort((a, b) => b.year - a.year)
  }

  return list
})

function resetFilters() {
  selectedBranch.value = 'all'
  selectedCategory.value = 'all'
  selectedModelYear.value = 'all'
  searchQuery.value = ''
  sortBy.value = 'price_asc'
}
</script>

<template>
  <div class="fleet-page section-padding">
    <div class="container">
      <!-- Header -->
      <div class="page-header card">
        <div class="header-content">
          <div class="icon-box"><Car :size="28" /></div>
          <div>
            <h1 class="heading-lg">أسطول سيارات البسيط</h1>
            <p class="text-muted">استعرض كافة فئات السيارات المتاحة في فروعنا بالمملكة وقم بتصفيتها حسب الفرع، الفئة، وسنة الصنع</p>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="fleet-toolbar card glass-card">
        <!-- Top Toolbar Header: Quick Search & Reset -->
        <div class="toolbar-top-row">
          <div class="search-input-box">
            <Search :size="18" class="search-icon" />
            <input 
              type="text" 
              v-model="searchQuery" 
              class="form-control fleet-search-input" 
              placeholder="ابحث باسم السيارة (مثال: كامري، ديزاير، مرسيدس...)" 
            />
          </div>

          <button 
            v-if="selectedBranch !== 'all' || selectedCategory !== 'all' || selectedModelYear !== 'all' || searchQuery"
            class="btn btn-outline btn-sm reset-btn" 
            @click="resetFilters"
            title="إعادة إرسال وتسهيل جميع خيارات البحث والتصفية"
          >
            <RefreshCw :size="14" />
            <span>إعادة ضبط التصفية</span>
          </button>
        </div>

        <!-- 3 Core Filters Controls Grid (اختيار الفرع + الفئة + سنة الصنع + الترتيب) -->
        <div class="filters-controls-grid">
          <!-- 1. Branch Selector (اختيار الفرع) -->
          <div class="filter-group">
            <label class="filter-label">
              <MapPin :size="16" class="text-primary" />
              <span>اختيار الفرع</span>
            </label>
            <select v-model="selectedBranch" class="form-control form-select filter-select">
              <option value="all">🏢 جميع الفروع بالمملكة</option>
              <option v-for="b in branchStore.branches" :key="b.id" :value="b.id">
                📍 {{ b.name }} ({{ b.cityName }}) {{ b.isAirport ? '✈️' : '' }}
              </option>
            </select>
          </div>

          <!-- 2. Category Selector (اختيار فئة السيارة) -->
          <div class="filter-group">
            <label class="filter-label">
              <Layers :size="16" class="text-gold" />
              <span>فئة السيارة</span>
            </label>
            <select v-model="selectedCategory" class="form-control form-select filter-select">
              <option value="all">🚗 جميع الفئات</option>
              <option v-for="cat in carStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- 3. Model Year Selector (اختيار سنة الصنع) -->
          <div class="filter-group">
            <label class="filter-label">
              <Calendar :size="16" class="text-orange" />
              <span>سنة الصنع (الموديل)</span>
            </label>
            <select v-model="selectedModelYear" class="form-control form-select filter-select">
              <option value="all">📅 جميع سنوات الصنع</option>
              <option v-for="year in availableModelYears" :key="year" :value="year">
                موديل {{ year }}
              </option>
            </select>
          </div>

          <!-- 4. Sorting Control -->
          <div class="filter-group">
            <label class="filter-label">
              <ArrowUpDown :size="16" class="text-dark" />
              <span>ترتيب حسب السعر</span>
            </label>
            <select v-model="sortBy" class="form-control form-select filter-select">
              <option value="price_asc">السعر: من الأرخص للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأرخص</option>
              <option value="year_desc">الموديل: الأحدث أولاً</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results Stats Bar -->
      <div class="results-meta-bar mb-3 flex-between text-xs text-muted">
        <span>عرض <strong>{{ searchedAndFilteredCars.length }}</strong> سيارات مطابقة لشروط التصفية</span>
      </div>

      <!-- Inventory Grid -->
      <div v-if="searchedAndFilteredCars.length > 0" class="cars-grid">
        <CarCard 
          v-for="car in searchedAndFilteredCars" 
          :key="car.id" 
          :car="car"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state card text-center p-5">
        <Car :size="48" class="text-muted mb-2" />
        <h3>لا توجد سيارات مطابقة لخيارات التصفية المختارة</h3>
        <p class="text-muted mb-3">جرب اختيار فرع آخر، أو سنة صنع أوسع، أو اضغط زر إعادة ضبط التصفية</p>
        <button class="btn btn-primary btn-sm" @click="resetFilters">
          <RefreshCw :size="14" class="me-1" />
          <span>إعادة ضبط التصفية</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  padding: 1.75rem;
  margin-bottom: 1.25rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--primary-surface);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fleet-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.toolbar-top-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.search-input-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.fleet-search-input {
  padding-right: 2.75rem;
  height: 46px;
  background: var(--bg-main);
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  height: 46px;
}

.filters-controls-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dark);
}

.filter-select {
  height: 46px;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: var(--radius-md);
}

.cat-filters {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.4rem;
  -webkit-overflow-scrolling: touch;
  border-top: 1px dashed var(--border-light);
  padding-top: 0.85rem;
}

.cat-pill {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: var(--transition);
  cursor: pointer;
}

.cat-pill.active {
  background: var(--primary);
  color: white;
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.empty-state {
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 1024px) {
  .filters-controls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: 1.25rem;
  }
  .header-content {
    gap: 0.75rem;
  }
  .icon-box {
    width: 42px;
    height: 42px;
  }
  .fleet-toolbar {
    padding: 1rem;
    gap: 1rem;
  }
  .toolbar-top-row {
    flex-direction: column;
  }
  .filters-controls-grid {
    grid-template-columns: 1fr;
  }
  .cars-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>
