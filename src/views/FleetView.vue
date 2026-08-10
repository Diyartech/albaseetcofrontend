<script setup>
import { ref, computed } from 'vue'
import { useCarStore } from '../stores/carStore'
import CarCard from '../components/CarCard.vue'
import { Car, Filter, ArrowUpDown, Search } from 'lucide-vue-next'

const carStore = useCarStore()
const searchQuery = ref('')

const searchedAndFilteredCars = computed(() => {
  let list = carStore.filteredCars
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
  }
  return list
})
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
            <p class="text-muted">استعرض كافة فئات السيارات المتاحة في فروعنا بالمملكة ورتبها حسب السعر</p>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="fleet-toolbar card">
        <!-- Quick Search Bar -->
        <div class="search-input-box">
          <Search :size="18" class="search-icon" />
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control fleet-search-input" 
            placeholder="ابحث باسم السيارة (مثال: كامري، ديزاير، مرسيدس...)" 
          />
        </div>

        <!-- Category Filters Pill Row -->
        <div class="cat-filters">
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

        <!-- Sort Select Box -->
        <div class="sort-box">
          <ArrowUpDown :size="18" class="text-primary flex-shrink-0 sort-icon" />
          <select v-model="carStore.sortBy" class="form-control form-select sm-select">
            <option value="price_asc">ترتيب حسب السعر: الأرخص أولاً</option>
            <option value="price_desc">ترتيب حسب السعر: الأعلى أولاً</option>
            <option value="year_desc">الأحدث موديل 2025-2026</option>
          </select>
        </div>
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
        <h3>لا توجد سيارات مطابقة للبحث</h3>
        <p class="text-muted">جرب البحث باسم آخر أو تغيير تصفية الفئة</p>
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
  padding: 1.25rem;
  margin-bottom: 1.75rem;
}

.search-input-box {
  position: relative;
  width: 100%;
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

.cat-filters {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.4rem;
  -webkit-overflow-scrolling: touch;
}

.cat-pill {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: var(--transition);
}

.cat-pill.active {
  background: var(--primary);
  color: white;
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  position: relative;
  background: var(--bg-card);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 0 0.85rem;
  transition: var(--transition);
  min-height: 48px;
}

.sort-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 77, 64, 0.1);
}

.sm-select {
  border: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
  padding: 0.6rem 0.5rem 0.6rem 2.25rem !important;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.5 !important;
  min-height: 46px;
  height: auto !important;
  width: 100%;
  outline: none;
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
  .cars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
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
    gap: 0.85rem;
  }
  .cars-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>
