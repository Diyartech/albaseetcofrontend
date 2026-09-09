import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'
import { apiService } from '../services/api'
import { useBookingStore } from './bookingStore'

const defaultCarsList = [
  {
    id: 1,
    name: 'تويوتا كامري 2026',
    orSimilar: 'أو ما شابه ذلك',
    year: 2026,
    category: 'midsize',
    categoryId: 'midsize',
    engineType: '4 سلندر 2.5L',
    fuelType: 'بنزين 91',
    branchId: 'all',
    dailyRate: 180,
    weeklyDiscount: 0.10,
    monthlyDiscount: 0.25,
    passengers: 5,
    doors: 4,
    transmission: 'أوتوماتيك',
    luggage: 3,
    availableCount: 3,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=80',
    badge: 'الأكثر طلباً',
    features: ['شاشة لمس 9 بوصة', 'كاميرا خلفية', 'مثبت سرعة ذكي', 'بلوتوث USB'],
    branchStockJson: '{"1": 2, "2": 1}',
    branchStock: { "1": 2, "2": 1 }
  },
  {
    id: 2,
    name: 'هيونداي إكسنت 2025',
    orSimilar: 'أو ما شابه ذلك',
    year: 2025,
    category: 'economy',
    categoryId: 'economy',
    engineType: '4 سلندر 1.6L',
    fuelType: 'بنزين 91',
    branchId: 'all',
    dailyRate: 110,
    weeklyDiscount: 0.10,
    monthlyDiscount: 0.25,
    passengers: 5,
    doors: 4,
    transmission: 'أوتوماتيك',
    luggage: 2,
    availableCount: 4,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    badge: 'اقتصادية جداً',
    features: ['مكيف قوي', 'بلوتوث', 'حساسات خلفية', 'توفير وقود'],
    branchStockJson: '{"1": 2, "2": 2}',
    branchStock: { "1": 2, "2": 2 }
  },
  {
    id: 3,
    name: 'نيسان صني 2025',
    orSimilar: 'أو ما شابه ذلك',
    year: 2025,
    category: 'economy',
    categoryId: 'economy',
    engineType: '4 سلندر 1.6L',
    fuelType: 'بنزين 91',
    branchId: 'all',
    dailyRate: 100,
    weeklyDiscount: 0.10,
    monthlyDiscount: 0.25,
    passengers: 5,
    doors: 4,
    transmission: 'أوتوماتيك',
    luggage: 2,
    availableCount: 5,
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600&auto=format&fit=crop&q=80',
    badge: 'سعر مميز',
    features: ['مدخل USB', 'نظام فرامل ABS', 'وسائد هوائية'],
    branchStockJson: '{"1": 3, "2": 2}',
    branchStock: { "1": 3, "2": 2 }
  },
  {
    id: 4,
    name: 'تويوتا يارس 2026',
    orSimilar: 'أو ما شابه ذلك',
    year: 2026,
    category: 'compact',
    categoryId: 'compact',
    engineType: '4 سلندر 1.5L',
    fuelType: 'بنزين 91',
    branchId: 'all',
    dailyRate: 125,
    weeklyDiscount: 0.10,
    monthlyDiscount: 0.25,
    passengers: 5,
    doors: 4,
    transmission: 'أوتوماتيك',
    luggage: 2,
    availableCount: 3,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
    badge: 'موديل حديث',
    features: ['شاشة ذكية', 'كاميرا خلفية', 'أنظمة أمان متطورة'],
    branchStockJson: '{"1": 2, "2": 1}',
    branchStock: { "1": 2, "2": 1 }
  },
  {
    id: 5,
    name: 'هيونداي توسان 2026',
    orSimilar: 'أو ما شابه ذلك',
    year: 2026,
    category: 'suv',
    categoryId: 'suv',
    engineType: '4 سلندر 2.0L Turbo',
    fuelType: 'بنزين 95',
    branchId: 'all',
    dailyRate: 260,
    weeklyDiscount: 0.12,
    monthlyDiscount: 0.28,
    passengers: 5,
    doors: 4,
    transmission: 'أوتوماتيك',
    luggage: 4,
    availableCount: 2,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    badge: 'عائلية SUV',
    features: ['دفع رباعي', 'فتحة بانوراما', 'مقاعد جلد', 'شاشة ملاحة'],
    branchStockJson: '{"1": 1, "2": 1}',
    branchStock: { "1": 1, "2": 1 }
  },
  {
    id: 6,
    name: 'مرسيدس E-Class 2026',
    orSimilar: 'أو ما شابه ذلك',
    year: 2026,
    category: 'luxury',
    categoryId: 'luxury',
    engineType: '4 سلندر 2.0L Turbo',
    fuelType: 'بنزين 95',
    branchId: 'all',
    dailyRate: 650,
    weeklyDiscount: 0.15,
    monthlyDiscount: 0.30,
    passengers: 5,
    doors: 4,
    transmission: 'أوتوماتيك',
    luggage: 3,
    availableCount: 1,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80',
    badge: 'فخامة مطلقة',
    features: ['نظام صوتی Burmester', 'إضاءة محيطية 64 لون', 'مقاعد مساج'],
    branchStockJson: '{"1": 1}',
    branchStock: { "1": 1 }
  }
]

export const useCarStore = defineStore('car', () => {
  const cars = ref([...defaultCarsList])
  const engineTypes = ref([])
  const fuelTypes = ref([])
  const categories = ref([
    { id: 'all', name: 'الكل' },
    { id: 'economy', name: 'اقتصادية' },
    { id: 'compact', name: 'صغيرة' },
    { id: 'midsize', name: 'سدان متوسطة' },
    { id: 'luxury', name: 'فخمة' },
    { id: 'suv', name: 'عائلية SUV' },
    { id: 'commercial', name: 'تجارية' },
    { id: 'premium', name: 'بريميوم' }
  ])
  const isLoading = ref(false)

  async function fetchCarsFromBackend() {
    isLoading.value = true
    try {
      const apiCars = await apiService.getCars(selectedCategory.value, sortBy.value)
      if (apiCars && apiCars.length > 0) {
        cars.value = apiCars.map(c => ({
          id: c.id,
          name: c.name,
          orSimilar: c.orSimilar,
          year: c.modelYear,
          category: c.categoryId,
          categoryId: c.categoryId,
          engineType: c.engineType || '4 سلندر 1.6L',
          fuelType: c.fuelType || 'بنزين 91',
          branchId: c.branchId || 'all',
          dailyRate: c.dailyRate,
          weeklyDiscount: c.weeklyDiscountRate,
          monthlyDiscount: c.monthlyDiscountRate,
          passengers: c.passengers,
          doors: c.doors,
          transmission: c.transmission,
          luggage: c.luggageCapacity,
          availableCount: c.availableStock,
          image: c.imageUrl,
          badge: c.badge,
          features: typeof c.featuresJson === 'string' ? JSON.parse(c.featuresJson || '[]') : c.featuresJson,
          branchStockJson: c.branchStockJson || '{}',
          branchStock: (() => {
            try {
              if (!c.branchStockJson || c.branchStockJson === 'null') return {}
              return typeof c.branchStockJson === 'string' ? JSON.parse(c.branchStockJson) : (c.branchStockJson || {})
            } catch {
              return {}
            }
          })()
        }))
      }
    } catch (err) {
      console.error('Error fetching cars from Backend API, retaining default cars:', err)
    } finally {
      isLoading.value = false
    }
  }

  function getCarStockForBranch(car, branchId) {
    if (!car) return 0
    if (!branchId || branchId === 'all') return car.availableCount || 0
    const bStock = car.branchStock || {}
    const strBranchId = String(branchId)
    if (bStock[strBranchId] !== undefined) {
      return parseInt(bStock[strBranchId]) || 0
    }
    return car.availableCount || 0
  }

  async function fetchLookupsFromBackend() {
    try {
      const [engList, fuelList, catList] = await Promise.all([
        apiService.getEngineTypes().catch(() => []),
        apiService.getFuelTypes().catch(() => []),
        apiService.getCategories().catch(() => [])
      ])
      if (engList && engList.length) {
        engineTypes.value = engList.map((e, idx) => typeof e === 'object' ? { id: String(e.id), name: e.name } : { id: String(idx + 1), name: e })
      }
      if (fuelList && fuelList.length) {
        fuelTypes.value = fuelList.map((f, idx) => typeof f === 'object' ? { id: String(f.id), name: f.name } : { id: String(idx + 1), name: f })
      }
      if (catList && catList.length) {
        categories.value = catList.map(c => typeof c === 'object' ? { id: c.id || c.categoryId, name: c.name || c.nameAr || c.name } : { id: c, name: c })
      }
    } catch (err) {
      console.error('Error fetching lookups from Backend API:', err)
    }
  }

  function getEngineTypeName(val) {
    if (!val) return '4 سلندر 1.6L'
    const fallbackMap = {
      '1': '4 سلندر 1.6L',
      '2': '4 سلندر 2.0L',
      '3': '4 سلندر 2.5L',
      '4': '6 سلندر V6 3.5L',
      '5': '8 سلندر V8 5.7L',
      '6': 'محرك هجين Hybrid',
      '7': 'محرك كهربائي 100%'
    }
    const match = engineTypes.value.find(e => String(e.id) === String(val) || e.name === val)
    if (match && match.name) return match.name
    return fallbackMap[String(val)] || val
  }

  function getEngineTypeId(val) {
    if (!val) return '1'
    const match = engineTypes.value.find(e => String(e.id) === String(val) || e.name === val)
    return match ? match.id : val
  }

  function getFuelTypeName(val) {
    if (!val) return 'بنزين 91'
    const fallbackMap = {
      '1': 'بنزين 91',
      '2': 'بنزين 95',
      '3': 'ديزل',
      '4': 'هجين Hybrid',
      '5': 'كهربائي 100%'
    }
    const match = fuelTypes.value.find(f => String(f.id) === String(val) || f.name === val)
    if (match && match.name) return match.name
    return fallbackMap[String(val)] || val
  }

  function getFuelTypeId(val) {
    if (!val) return '1'
    const match = fuelTypes.value.find(f => String(f.id) === String(val) || f.name === val)
    return match ? match.id : val
  }

  // Trigger initial fetch
  fetchCarsFromBackend()
  fetchLookupsFromBackend()

  watch(engineTypes, (val) => localStorage.setItem('admin_engine_types', JSON.stringify(val)), { deep: true })
  watch(fuelTypes, (val) => localStorage.setItem('admin_fuel_types', JSON.stringify(val)), { deep: true })
  watch(categories, (val) => localStorage.setItem('admin_car_categories', JSON.stringify(val)), { deep: true })

  // Engine Types CRUD
  async function addEngineType(name) {
    if (name && !engineTypes.value.includes(name)) {
      engineTypes.value.push(name)
      try { await apiService.addEngineType(name) } catch {}
    }
  }

  function updateEngineType(oldName, newName) {
    const idx = engineTypes.value.indexOf(oldName)
    if (idx !== -1 && newName) {
      engineTypes.value[idx] = newName
    }
  }

  function deleteEngineType(name) {
    engineTypes.value = engineTypes.value.filter(e => e !== name)
  }

  // Fuel Types CRUD
  async function addFuelType(name) {
    if (name && !fuelTypes.value.includes(name)) {
      fuelTypes.value.push(name)
      try { await apiService.addFuelType(name) } catch {}
    }
  }

  function updateFuelType(oldName, newName) {
    const idx = fuelTypes.value.indexOf(oldName)
    if (idx !== -1 && newName) {
      fuelTypes.value[idx] = newName
    }
  }

  function deleteFuelType(name) {
    fuelTypes.value = fuelTypes.value.filter(f => f !== name)
  }

  // Categories CRUD
  async function addCategory(catData) {
    if (catData.name && !categories.value.some(c => c.id === catData.id)) {
      const newCat = {
        id: catData.id || ('cat_' + Date.now()),
        name: catData.name
      }
      categories.value.push(newCat)
      try { await apiService.addCategory(newCat.id, newCat.name) } catch {}
    }
  }

  function updateCategory(id, newName) {
    const item = categories.value.find(c => c.id === id)
    if (item && newName) {
      item.name = newName
    }
  }

  function deleteCategory(id) {
    if (id !== 'all') {
      categories.value = categories.value.filter(c => c.id !== id)
    }
  }

  const selectedCategory = ref('all')
  const sortBy = ref('price_asc')
  const availableOnly = ref(false)

  const filteredCars = computed(() => {
    let result = [...cars.value]

    // 1. Category Filter
    if (selectedCategory.value !== 'all') {
      result = result.filter(c => c.categoryId === selectedCategory.value)
    }

    // 2. Branch Filter
    const bookingStore = useBookingStore()
    if (bookingStore.serviceType === 'pickup' && bookingStore.pickupBranchId) {
      const selectedBranchId = String(bookingStore.pickupBranchId)
      result = result.filter(c => {
        if (!c.branchId || c.branchId === 'all' || c.branchId === '') return true
        if (String(c.branchId) === selectedBranchId || c.branchId === bookingStore.pickupCity) return true

        const bStock = c.branchStock || (typeof c.branchStockJson === 'string' ? JSON.parse(c.branchStockJson || '{}') : {})
        if (bStock[selectedBranchId] !== undefined && parseInt(bStock[selectedBranchId]) > 0) {
          return true
        }

        return false
      })
    }

    // 3. Availability Filter
    if (availableOnly.value) {
      result = result.filter(c => c.availableCount > 0)
    }

    // 4. Sorting
    if (sortBy.value === 'price_asc') {
      result.sort((a, b) => a.dailyRate - b.dailyRate)
    } else if (sortBy.value === 'price_desc') {
      result.sort((a, b) => b.dailyRate - a.dailyRate)
    } else if (sortBy.value === 'year_desc') {
      result.sort((a, b) => b.year - a.year)
    }

    return result
  })

  // CRUD Methods for Admin
  async function addCar(carData) {
    const featuresArr = typeof carData.features === 'string'
      ? carData.features.split(',').map(s => s.trim()).filter(Boolean)
      : (carData.features || [])

    const weeklyDisc = typeof carData.weeklyDiscount === 'number' 
      ? (carData.weeklyDiscount > 1 ? carData.weeklyDiscount / 100 : carData.weeklyDiscount) 
      : 0.10
    const monthlyDisc = typeof carData.monthlyDiscount === 'number' 
      ? (carData.monthlyDiscount > 1 ? carData.monthlyDiscount / 100 : carData.monthlyDiscount) 
      : 0.25

    const payload = {
      name: carData.name ? carData.name.trim() : 'سيارة جديدة',
      orSimilar: carData.orSimilar || 'أو ما شابه ذلك',
      modelYear: Number(carData.year) || 2026,
      categoryId: carData.categoryId || 'economy',
      engineType: String(carData.engineType || '1'),
      fuelType: String(carData.fuelType || '1'),
      branchId: String(carData.branchId || 'all'),
      dailyRate: Number(carData.dailyRate) || 140,
      weeklyDiscountRate: weeklyDisc,
      monthlyDiscountRate: monthlyDisc,
      passengers: Number(carData.passengers) || 4,
      doors: Number(carData.doors) || 4,
      transmission: carData.transmission || 'أوتوماتيك',
      luggageCapacity: Number(carData.luggage) || 2,
      availableStock: Number(carData.availableCount) || 1,
      imageUrl: carData.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      badge: carData.badge || 'الأكثر طلباً',
      featuresJson: JSON.stringify(featuresArr),
      branchStockJson: typeof carData.branchStock === 'object' ? JSON.stringify(carData.branchStock) : (carData.branchStockJson || '{}'),
      isActive: carData.isActive !== undefined ? carData.isActive : true
    }

    try {
      await apiService.createCar(payload)
      await fetchCarsFromBackend()
    } catch (err) {
      console.error('Error creating car on backend API:', err)
      throw err
    }
  }

  async function updateCar(id, carData) {
    const featuresArr = typeof carData.features === 'string'
      ? carData.features.split(',').map(s => s.trim()).filter(Boolean)
      : (carData.features || [])

    const weeklyDisc = typeof carData.weeklyDiscount === 'number' 
      ? (carData.weeklyDiscount > 1 ? carData.weeklyDiscount / 100 : carData.weeklyDiscount) 
      : 0.10
    const monthlyDisc = typeof carData.monthlyDiscount === 'number' 
      ? (carData.monthlyDiscount > 1 ? carData.monthlyDiscount / 100 : carData.monthlyDiscount) 
      : 0.25

    const payload = {
      id: id,
      name: carData.name ? carData.name.trim() : 'سيارة',
      orSimilar: carData.orSimilar || 'أو ما شابه ذلك',
      modelYear: Number(carData.year) || 2026,
      categoryId: carData.categoryId || 'economy',
      engineType: String(carData.engineType || '1'),
      fuelType: String(carData.fuelType || '1'),
      branchId: String(carData.branchId || 'all'),
      dailyRate: Number(carData.dailyRate) || 140,
      weeklyDiscountRate: weeklyDisc,
      monthlyDiscountRate: monthlyDisc,
      passengers: Number(carData.passengers) || 4,
      doors: Number(carData.doors) || 4,
      transmission: carData.transmission || 'أوتوماتيك',
      luggageCapacity: Number(carData.luggage) || 2,
      availableStock: Number(carData.availableCount) || 1,
      imageUrl: carData.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      badge: carData.badge || 'الأكثر طلباً',
      featuresJson: JSON.stringify(featuresArr),
      branchStockJson: typeof carData.branchStock === 'object' ? JSON.stringify(carData.branchStock) : (carData.branchStockJson || '{}'),
      isActive: carData.isActive !== undefined ? carData.isActive : true
    }

    try {
      await apiService.updateCar(id, payload)
      await fetchCarsFromBackend()
    } catch (err) {
      console.error('Error updating car on backend API:', err)
      throw err
    }
  }

  async function deleteCar(id) {
    try {
      await apiService.deleteCar(id)
      await fetchCarsFromBackend()
    } catch (err) {
      console.error('Error deleting car on backend API:', err)
      throw err
    }
  }

  return {
    cars,
    categories,
    engineTypes,
    fuelTypes,
    selectedCategory,
    sortBy,
    availableOnly,
    filteredCars,
    isLoading,
    fetchCarsFromBackend,
    fetchLookupsFromBackend,
    addCar,
    updateCar,
    deleteCar,
    addEngineType,
    updateEngineType,
    deleteEngineType,
    addFuelType,
    updateFuelType,
    deleteFuelType,
    addCategory,
    updateCategory,
    deleteCategory,
    getEngineTypeName,
    getEngineTypeId,
    getFuelTypeName,
    getFuelTypeId,
    getCarStockForBranch
  }
})
