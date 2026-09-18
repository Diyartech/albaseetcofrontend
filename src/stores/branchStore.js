import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { apiService } from '../services/api'

export function parseBranchOperatingHours(hoursStr, closedDates = []) {
  const parsedClosedDates = Array.isArray(closedDates) 
    ? closedDates 
    : (typeof closedDates === 'string' && closedDates.trim() ? closedDates.split(',').map(d => d.trim()).filter(Boolean) : [])

  if (!hoursStr || hoursStr.includes('24') || hoursStr.toLowerCase().includes('24/7')) {
    return {
      is24h: true,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      shifts: [{ start: '00:00', end: '24:00', label: '24 ساعة / 7 أيام' }],
      closedDates: parsedClosedDates,
      displayText: hoursStr || '24 ساعة / 7 أيام'
    }
  }

  // Default active days: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  let activeDays = [0, 1, 2, 3, 4, 5, 6]

  if (hoursStr.includes('السبت - الخميس') || hoursStr.includes('السبت للخميس')) {
    activeDays = [6, 0, 1, 2, 3, 4] // Sat to Thu (Friday closed)
  } else if (hoursStr.includes('الأحد - الخميس') || hoursStr.includes('الأحد للخميس')) {
    activeDays = [0, 1, 2, 3, 4] // Sun to Thu (Fri & Sat closed)
  } else if (hoursStr.includes('السبت - الجمعة') || hoursStr.includes('طوال الأسبوع')) {
    activeDays = [0, 1, 2, 3, 4, 5, 6]
  }

  const shifts = []

  function parse12hTo24h(timePart, defaultAmPm) {
    if (!timePart) return '08:00'
    const trimmed = timePart.trim()
    const match = trimmed.match(/(\d{1,2}):(\d{2})\s*(ص|م)?/)
    if (!match) return '08:00'
    let h = parseInt(match[1], 10)
    const m = match[2]
    const ampm = match[3] || defaultAmPm
    if (ampm === 'م' && h < 12) h += 12
    if (ampm === 'ص' && h === 12) h = 0
    if (ampm === 'م' && h === 12) h = 12
    return `${h.toString().padStart(2, '0')}:${m}`
  }

  const parts = hoursStr.split(/[|,\n]/)
  parts.forEach(part => {
    const rangeMatch = part.match(/(\d{1,2}:\d{2}\s*(?:ص|م)?)\s*[-–إلى]\s*(\d{1,2}:\d{2}\s*(?:ص|م)?)/)
    if (rangeMatch) {
      const startStr = rangeMatch[1].trim()
      const endStr = rangeMatch[2].trim()
      
      const start24 = parse12hTo24h(startStr, 'ص')
      let end24 = parse12hTo24h(endStr, 'م')
      if ((endStr.includes('12:00') || endStr.includes('00:00')) && (endStr.includes('ص') || endStr.includes('م'))) {
        if (endStr.includes('12:00 م') || endStr.includes('12:00 مساءً')) {
          end24 = '12:00'
        } else if (endStr.includes('12:00 ص') || endStr.includes('12:00 صباحاً')) {
          end24 = '24:00'
        }
      }
      shifts.push({ start: start24, end: end24, label: `${startStr} - ${endStr}` })
    }
  })

  if (shifts.length === 0) {
    shifts.push({ start: '08:00', end: '23:00', label: '08:00 ص - 11:00 م' })
  }

  return {
    is24h: false,
    activeDays,
    shifts,
    closedDates: parsedClosedDates,
    displayText: hoursStr
  }
}

// Initial list of major Saudi cities
const INITIAL_CITIES = [
  { id: 'riyadh', name: 'الرياض' },
  { id: 'jeddah', name: 'جدة' },
  { id: 'dammam', name: 'الدمام' },
  { id: 'makkah', name: 'مكة المكرمة' },
  { id: 'madinah', name: 'المدينة المنورة' },
  { id: 'khobar', name: 'الخبر' },
  { id: 'abha', name: 'أبها' },
  { id: 'tabuk', name: 'تبوك' },
  { id: 'qassim', name: 'القصيم' },
  { id: 'hail', name: 'حائل' },
  { id: 'jazan', name: 'جازان' },
  { id: 'najran', name: 'نجران' },
  { id: 'bisha', name: 'بيشة' },
  { id: 'yanbu', name: 'ينبع' },
  { id: 'jubail', name: 'الجبيل' },
  { id: 'taif', name: 'الطائف' },
  { id: 'ahsa', name: 'الأحساء' },
  { id: 'khamis_mushait', name: 'خميس مشيط' },
  { id: 'arar', name: 'عرعر' },
  { id: 'sakaka', name: 'سكاكا' }
]

function getInitialCities() {
  const custom = JSON.parse(localStorage.getItem('custom_cities') || '[]')
  const map = new Map()
  INITIAL_CITIES.forEach(c => map.set(c.id, c))
  custom.forEach(c => {
    if (c.id && c.name) map.set(c.id, c)
  })
  return Array.from(map.values())
}

export const useBranchStore = defineStore('branch', () => {
  const cities = ref(getInitialCities())

  const branches = ref([])

  function addCity(cityName) {
    if (!cityName || !cityName.trim()) return null
    const name = cityName.trim()
    const existing = cities.value.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const slug = name.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w\u0600-\u06FF]/g, '') || `city_${Date.now()}`

    const newCity = { id: slug, name }
    cities.value.push(newCity)

    // Save to custom cities in localStorage
    const storedCustom = JSON.parse(localStorage.getItem('custom_cities') || '[]')
    if (!storedCustom.some(c => c.id === slug)) {
      storedCustom.push(newCity)
      localStorage.setItem('custom_cities', JSON.stringify(storedCustom))
    }
    return newCity
  }

  async function fetchBranchesFromBackend() {
    try {
      const apiBranches = await apiService.getBranches('all')
      if (apiBranches && Array.isArray(apiBranches)) {
        apiBranches.forEach(b => {
          if (b.cityId && b.cityName && !cities.value.some(c => c.id === b.cityId)) {
            cities.value.push({ id: b.cityId, name: b.cityName })
          }
        })

        branches.value = apiBranches.map(b => ({
          id: b.id,
          name: b.name,
          cityId: b.cityId,
          cityName: b.cityName,
          address: b.address,
          phone: b.phone,
          isAirport: b.isAirport,
          hours: b.operatingHours,
          latitude: b.latitude,
          longitude: b.longitude,
          isActive: b.isActive !== undefined ? b.isActive : true,
          coords: `${b.latitude || 21.5432},${b.longitude || 39.1728}`
        }))
      } else {
        branches.value = []
      }
    } catch (err) {
      console.error('Error fetching branches from Backend API:', err)
      branches.value = []
    }
  }

  fetchBranchesFromBackend()

  watch(
    branches,
    (newVal) => {
      localStorage.setItem('admin_branches', JSON.stringify(newVal))
    },
    { deep: true }
  )

  async function addBranch(branchData) {
    try {
      const city = cities.value.find(c => c.id === branchData.cityId)
      await apiService.createBranch({
        cityId: branchData.cityId,
        cityName: branchData.cityName || (city ? city.name : 'الرياض'),
        name: branchData.name,
        address: branchData.address || '',
        phone: branchData.phone || '8002440204',
        isAirport: branchData.isAirport || false,
        operatingHours: branchData.hours || 'السبت - الخميس 09:00 ص - 10:00 م',
        latitude: typeof branchData.latitude === 'number' ? branchData.latitude : 21.5432,
        longitude: typeof branchData.longitude === 'number' ? branchData.longitude : 39.1728,
        isActive: branchData.isActive !== undefined ? branchData.isActive : true
      })
      fetchBranchesFromBackend()
    } catch (err) {
      const newId = branches.value.length ? Math.max(...branches.value.map(b => b.id)) + 1 : 1
      const city = cities.value.find(c => c.id === branchData.cityId)
      branches.value.push({
        id: newId,
        cityName: city ? city.name : 'الرياض',
        hours: 'السبت - الخميس 09:00 ص - 10:00 م',
        phone: '8002440204',
        ...branchData
      })
    }
  }

  async function updateBranch(id, branchData) {
    try {
      const city = cities.value.find(c => c.id === branchData.cityId)
      await apiService.updateBranch(id, {
        id: id,
        cityId: branchData.cityId,
        cityName: branchData.cityName || (city ? city.name : 'الرياض'),
        name: branchData.name,
        address: branchData.address,
        phone: branchData.phone || '8002440204',
        isAirport: branchData.isAirport || false,
        operatingHours: branchData.hours || 'السبت - الخميس 09:00 ص - 10:00 م',
        latitude: typeof branchData.latitude === 'number' ? branchData.latitude : 21.5432,
        longitude: typeof branchData.longitude === 'number' ? branchData.longitude : 39.1728,
        isActive: branchData.isActive !== undefined ? branchData.isActive : true
      })
      fetchBranchesFromBackend()
    } catch (err) {
      const idx = branches.value.findIndex(b => b.id === id)
      if (idx !== -1) {
        const city = cities.value.find(c => c.id === branchData.cityId)
        branches.value[idx] = { 
          ...branches.value[idx], 
          ...branchData, 
          cityName: city ? city.name : branches.value[idx].cityName 
        }
      }
    }
  }

  async function deleteBranch(id) {
    try {
      await apiService.deleteBranch(id)
      fetchBranchesFromBackend()
    } catch (err) {
      branches.value = branches.value.filter(b => b.id !== id)
    }
  }

  return {
    cities,
    branches,
    addCity,
    fetchBranchesFromBackend,
    addBranch,
    updateBranch,
    deleteBranch
  }
})
