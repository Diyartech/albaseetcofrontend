<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBranchStore } from '../stores/branchStore'
import { MapPin, Clock, Phone, Navigation, Search } from 'lucide-vue-next'

const branchStore = useBranchStore()
const router = useRouter()

const selectedCity = ref('all')
const airportOnly = ref(false)

const filteredBranches = computed(() => {
  let result = [...branchStore.branches]
  if (selectedCity.value !== 'all') {
    result = result.filter(b => b.cityId === selectedCity.value)
  }
  if (airportOnly.value) {
    result = result.filter(b => b.isAirport)
  }
  return result
})

function bookFromBranch(branch) {
  router.push('/booking')
}
</script>

<template>
  <div class="branches-page section-padding">
    <div class="container">
      <div class="page-header card">
        <div class="header-content">
          <div class="icon-box"><MapPin :size="32" /></div>
          <div>
            <h1 class="heading-lg">شبكة فروع شركة البسيط والمفتاح</h1>
            <p class="text-muted">متواجدون دائماً بالقرب منك في كافة مطارات ومدن المملكة الرئيسية</p>
          </div>
        </div>
      </div>

      <!-- Filters & City Selector (من المستند) -->
      <div class="branches-filter-bar card">
        <div class="city-selector-pills">
          <button 
            class="city-pill" 
            :class="{ active: selectedCity === 'all' }"
            @click="selectedCity = 'all'"
          >
            جميع المدن
          </button>

          <button 
            v-for="c in branchStore.cities" 
            :key="c.id" 
            class="city-pill"
            :class="{ active: selectedCity === c.id }"
            @click="selectedCity = c.id"
          >
            {{ c.name }}
          </button>
        </div>

        <label class="checkbox-label">
          <input type="checkbox" v-model="airportOnly" />
          <span>فروع المطارات فقط ✈️</span>
        </label>
      </div>

      <!-- Branches Grid -->
      <div class="branches-grid">
        <div v-for="b in filteredBranches" :key="b.id" class="branch-card card">
          <div class="branch-top-bar">
            <span class="badge badge-primary">{{ b.cityName }}</span>
            <span v-if="b.isAirport" class="badge badge-gold">فرع مطار ✈️</span>
          </div>

          <h3 class="branch-name">{{ b.name }}</h3>
          <p class="branch-info"><MapPin :size="16" class="text-primary" /> {{ b.address }}</p>
          <p class="branch-info"><Clock :size="16" class="text-gold" /> {{ b.hours }}</p>
          <p class="branch-info"><Phone :size="16" class="text-orange" /> {{ b.phone }}</p>

          <div class="branch-actions">
            <button class="btn btn-outline btn-sm" @click="alert('جاري فتح الاتجاهات في Google Maps...')">
              <Navigation :size="14" />
              <span>الاتجاهات</span>
            </button>
            <button class="btn btn-orange btn-sm" @click="bookFromBranch(b)">
              <span>احجز الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  padding: 2rem;
  margin-bottom: 1.5rem;
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
  background: var(--primary-surface);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.branches-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.city-selector-pills {
  display: flex;
  gap: 0.5rem;
}

.city-pill {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  background: var(--bg-subtle);
  font-weight: 700;
  font-size: 0.9rem;
  transition: var(--transition);
}

.city-pill.active {
  background: var(--primary);
  color: white;
}

.branches-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.branch-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.branch-top-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.branch-name {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.branch-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.branch-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.branch-actions button {
  flex: 1;
}

@media (max-width: 1024px) {
  .branches-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .branches-grid {
    grid-template-columns: 1fr;
  }
}
</style>
