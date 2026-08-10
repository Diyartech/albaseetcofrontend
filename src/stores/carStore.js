import { defineStore } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'
import { apiService } from '../services/api'

export const useCarStore = defineStore('car', () => {
  const initialCars = [
    {
      id: 1,
      name: 'هيونداي أي 10 (Hyundai i10)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2026,
      category: 'اقتصادية',
      categoryId: 'economy',
      dailyRate: 142.94,
      weeklyDiscount: 0.1,
      monthlyDiscount: 0.25,
      passengers: 4,
      doors: 4,
      transmission: 'أوتوماتيك',
      luggage: 1,
      availableCount: 21,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      badge: 'الأكثر طلباً',
      features: ['تكييف ممتاز', 'بلوتوث', 'حساسات خلفية', 'اقتصادية جداً في الوقود']
    },
    {
      id: 2,
      name: 'سوزوكي ديزاير (Suzuki Dzire)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2025,
      category: 'اقتصادية',
      categoryId: 'economy',
      dailyRate: 135.70,
      weeklyDiscount: 0.12,
      monthlyDiscount: 0.28,
      passengers: 5,
      doors: 4,
      transmission: 'أوتوماتيك',
      luggage: 2,
      availableCount: 18,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80',
      badge: 'وفر أكثر',
      features: ['مقاعد مريحة', 'استهلاك وقود ضئيل', 'نظام صوتي مميز']
    },
    {
      id: 3,
      name: 'إم جي 3 (MG 3)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2026,
      category: 'صغيرة',
      categoryId: 'compact',
      dailyRate: 135.66,
      weeklyDiscount: 0.10,
      monthlyDiscount: 0.25,
      passengers: 4,
      doors: 4,
      transmission: 'أوتوماتيك',
      luggage: 1,
      availableCount: 15,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80',
      badge: 'موديل السنة',
      features: ['شاشة لمس', 'كاميرا خلفية', 'تصميم عصري شبابي']
    },
    {
      id: 4,
      name: 'تويوتا كامري (Toyota Camry)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2026,
      category: 'سدان متوسطة',
      categoryId: 'midsize',
      dailyRate: 245.00,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      passengers: 5,
      doors: 4,
      transmission: 'أوتوماتيك',
      luggage: 3,
      availableCount: 12,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=80',
      badge: 'الأفضل للعائلات',
      features: ['مثبت سرعة ذكي', 'جلد فاخر', 'فتحة سقف', 'مساعد حارة']
    },
    {
      id: 5,
      name: 'تويوتا فورتشنر (Toyota Fortuner)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2025,
      category: 'متعددة الاستخدامات / عائلية',
      categoryId: 'suv',
      dailyRate: 420.00,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.32,
      passengers: 7,
      doors: 5,
      transmission: 'أوتوماتيك',
      luggage: 4,
      availableCount: 8,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
      badge: 'دفع رباعي 4x4',
      features: ['7 مقاعد واسعة', 'دفع رباعي قوي', 'شاشات خلفية', 'تبريد للمقاعد']
    },
    {
      id: 6,
      name: 'مرسيدس E-Class (Mercedes E-Class)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2026,
      category: 'فخمة',
      categoryId: 'luxury',
      dailyRate: 850.00,
      weeklyDiscount: 0.18,
      monthlyDiscount: 0.35,
      passengers: 5,
      doors: 4,
      transmission: 'أوتوماتيك',
      luggage: 3,
      availableCount: 5,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80',
      badge: 'VIP فخامة مطلق',
      features: ['نظام قيادة ذاتية جزئي', 'صوت Burmester المحيطي', 'إضاءة محيطية 64 لون', 'مقاعد مساج']
    },
    {
      id: 7,
      name: 'تويوتا هايس باص (Toyota HiAce)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2025,
      category: 'تجارية',
      categoryId: 'commercial',
      dailyRate: 380.00,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      passengers: 12,
      doors: 4,
      transmission: 'أوتوماتيك',
      luggage: 6,
      availableCount: 6,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80',
      badge: 'لنقل المجموعات',
      features: ['تكييف شامل لكل الصفوف', 'مساحة تخزين ضخمة', 'مقاعد مريحة']
    },
    {
      id: 8,
      name: 'لكزس ES 350 (Lexus ES 350)',
      orSimilar: 'أو ما شابه ذلك',
      year: 2026,
      category: 'بريميوم',
      categoryId: 'premium',
      dailyRate: 620.00,
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      passengers: 5,
      doors: 4,
      transmission: 'أوتوماتيك',
      luggage: 3,
      availableCount: 9,
      image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80',
      badge: 'راحة ورقي',
      features: ['محرك V6 هادئ', 'جلد طبيعي', 'شاشة 12.3 بوصة', 'عزل صوتي فائق']
    }
  ]

  const cars = ref(
    JSON.parse(localStorage.getItem('admin_cars')) || initialCars
  )
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
          features: typeof c.featuresJson === 'string' ? JSON.parse(c.featuresJson || '[]') : c.featuresJson
        }))
      }
    } catch (err) {
      console.log('Using local car store cache.')
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchCarsFromBackend()
  })

  watch(
    cars,
    (newVal) => {
      localStorage.setItem('admin_cars', JSON.stringify(newVal))
    },
    { deep: true }
  )

  const categories = ref([
    { id: 'all', name: 'الكل' },
    { id: 'economy', name: 'اقتصادية' },
    { id: 'compact', name: 'صغيرة' },
    { id: 'midsize', name: 'سدان متوسطة' },
    { id: 'luxury', name: 'فخمة' },
    { id: 'suv', name: 'متعددة الاستخدامات / عائلية' },
    { id: 'commercial', name: 'تجارية' },
    { id: 'premium', name: 'بريميوم' }
  ])

  const selectedCategory = ref('all')
  const sortBy = ref('price_asc')
  const availableOnly = ref(false)

  const filteredCars = computed(() => {
    let result = [...cars.value]

    if (selectedCategory.value !== 'all') {
      result = result.filter(c => c.categoryId === selectedCategory.value)
    }

    if (availableOnly.value) {
      result = result.filter(c => c.availableCount > 0)
    }

    if (sortBy.value === 'price_asc') {
      result.sort((a, b) => a.dailyRate - b.dailyRate)
    } else if (sortBy.value === 'price_desc') {
      result.sort((a, b) => b.dailyRate - a.dailyRate)
    } else if (sortBy.value === 'year_desc') {
      result.sort((a, b) => b.year - a.year)
    }

    return result
  })

  // CRUD Methods for Admin (Synced with Backend API)
  async function addCar(carData) {
    try {
      const featuresArr = typeof carData.features === 'string'
        ? carData.features.split(',').map(s => s.trim()).filter(Boolean)
        : (carData.features || [])

      await apiService.createCar({
        name: carData.name,
        orSimilar: carData.orSimilar || 'أو ما شابه ذلك',
        modelYear: carData.year || 2026,
        categoryId: carData.categoryId,
        dailyRate: carData.dailyRate,
        weeklyDiscountRate: typeof carData.weeklyDiscount === 'number' ? (carData.weeklyDiscount > 1 ? carData.weeklyDiscount / 100 : carData.weeklyDiscount) : 0.10,
        monthlyDiscountRate: typeof carData.monthlyDiscount === 'number' ? (carData.monthlyDiscount > 1 ? carData.monthlyDiscount / 100 : carData.monthlyDiscount) : 0.25,
        passengers: carData.passengers || 5,
        doors: carData.doors || 4,
        transmission: carData.transmission || 'أوتوماتيك',
        luggageCapacity: carData.luggage || 2,
        availableStock: carData.availableCount || 1,
        imageUrl: carData.image,
        badge: carData.badge || 'الأكثر طلباً',
        featuresJson: JSON.stringify(featuresArr),
        isActive: carData.isActive !== undefined ? carData.isActive : true
      })
      fetchCarsFromBackend()
    } catch (err) {
      const newId = cars.value.length ? Math.max(...cars.value.map(c => c.id)) + 1 : 1
      cars.value.push({ id: newId, ...carData })
    }
  }

  async function updateCar(id, carData) {
    try {
      const featuresArr = typeof carData.features === 'string'
        ? carData.features.split(',').map(s => s.trim()).filter(Boolean)
        : (carData.features || [])

      await apiService.updateCar(id, {
        id: id,
        name: carData.name,
        orSimilar: carData.orSimilar || 'أو ما شابه ذلك',
        modelYear: carData.year || 2026,
        categoryId: carData.categoryId,
        dailyRate: carData.dailyRate,
        weeklyDiscountRate: typeof carData.weeklyDiscount === 'number' ? (carData.weeklyDiscount > 1 ? carData.weeklyDiscount / 100 : carData.weeklyDiscount) : 0.10,
        monthlyDiscountRate: typeof carData.monthlyDiscount === 'number' ? (carData.monthlyDiscount > 1 ? carData.monthlyDiscount / 100 : carData.monthlyDiscount) : 0.25,
        passengers: carData.passengers || 5,
        doors: carData.doors || 4,
        transmission: carData.transmission || 'أوتوماتيك',
        luggageCapacity: carData.luggage || 2,
        availableStock: carData.availableCount || 1,
        imageUrl: carData.image,
        badge: carData.badge || 'الأكثر طلباً',
        featuresJson: JSON.stringify(featuresArr),
        isActive: carData.isActive !== undefined ? carData.isActive : true
      })
      fetchCarsFromBackend()
    } catch (err) {
      const idx = cars.value.findIndex(c => c.id === id)
      if (idx !== -1) {
        cars.value[idx] = { ...cars.value[idx], ...carData }
      }
    }
  }

  async function deleteCar(id) {
    try {
      await apiService.deleteCar(id)
      fetchCarsFromBackend()
    } catch (err) {
      cars.value = cars.value.filter(c => c.id !== id)
    }
  }

  return {
    cars,
    categories,
    selectedCategory,
    sortBy,
    availableOnly,
    filteredCars,
    isLoading,
    fetchCarsFromBackend,
    addCar,
    updateCar,
    deleteCar
  }
})
