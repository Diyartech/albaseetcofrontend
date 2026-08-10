import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { apiService } from '../services/api'

export const useBranchStore = defineStore('branch', () => {
  const cities = ref([
    { id: 'riyadh', name: 'الرياض' },
    { id: 'jeddah', name: 'جدة' },
    { id: 'dammam', name: 'الدمام' },
    { id: 'abha', name: 'أبها' }
  ])

  const initialBranches = [
    {
      id: 1,
      name: 'محطة قطار السليمانية',
      cityId: 'jeddah',
      cityName: 'جدة',
      address: 'محطة قطار السليمانية بجدة',
      phone: '8002440204',
      isAirport: false,
      hours: 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً',
      latitude: 21.5432,
      longitude: 39.1728,
      isActive: true,
      coords: '21.5432,39.1728'
    },
    {
      id: 2,
      name: 'فندق الإنتركونتيننتال',
      cityId: 'jeddah',
      cityName: 'جدة',
      address: 'فندق الإنتركونتيننتال الحمراء، جدة',
      phone: '8002440204',
      isAirport: false,
      hours: 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً',
      latitude: 21.5184,
      longitude: 39.1622,
      isActive: true,
      coords: '21.5184,39.1622'
    },
    {
      id: 3,
      name: 'فندق ريتز كارلتون',
      cityId: 'jeddah',
      cityName: 'جدة',
      address: 'فندق الريتز كارلتون بالحمراء، جدة',
      phone: '8002440204',
      isAirport: false,
      hours: 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً',
      latitude: 21.5211,
      longitude: 39.1589,
      isActive: true,
      coords: '21.5211,39.1589'
    },
    {
      id: 4,
      name: 'فندق أصيلة',
      cityId: 'jeddah',
      cityName: 'جدة',
      address: 'شارع الأمير محمد بن عبدالعزيز، الأندلس، جدة 23326',
      phone: '8002440204',
      isAirport: false,
      hours: 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً',
      latitude: 21.5540,
      longitude: 39.1650,
      isActive: true,
      coords: '21.5540,39.1650'
    },
    {
      id: 5,
      name: 'مطار الملك خالد الدولي T5',
      cityId: 'riyadh',
      cityName: 'الرياض',
      address: 'مطار الملك خالد الدولي، صالة 5، الرياض',
      phone: '8002440204',
      isAirport: true,
      hours: 'مفتوح 24 ساعة طوال أيام الأسبوع',
      latitude: 24.9576,
      longitude: 46.6988,
      isActive: true,
      coords: '24.9576,46.6988'
    },
    {
      id: 6,
      name: 'فرع طريق الملك عبد العزيز',
      cityId: 'riyadh',
      cityName: 'الرياض',
      address: 'طريق الملك عبدالعزيز، حي الياسمين، الرياض',
      phone: '8002440204',
      isAirport: false,
      hours: 'السبت - الخميس 08:00 صباحاً - 11:00 مساءً',
      latitude: 24.7743,
      longitude: 46.6380,
      isActive: true,
      coords: '24.7743,46.6380'
    },
    {
      id: 7,
      name: 'مطار أبها الدولي',
      cityId: 'abha',
      cityName: 'أبها',
      address: 'صالة الوصول، مطار أبها الدولي',
      phone: '8002440204',
      isAirport: true,
      hours: 'مفتوح 24 ساعة طوال أيام الأسبوع',
      latitude: 18.2403,
      longitude: 42.6567,
      isActive: true,
      coords: '18.2403,42.6567'
    },
    {
      id: 8,
      name: 'مطار الملك فهد الدولي',
      cityId: 'dammam',
      cityName: 'الدمام',
      address: 'صالة الوصول، مطار الملك فهد الدولي بالدمام',
      phone: '8002440204',
      isAirport: true,
      hours: 'مفتوح 24 ساعة طوال أيام الأسبوع',
      latitude: 26.4712,
      longitude: 49.7979,
      isActive: true,
      coords: '26.4712,49.7979'
    }
  ]

  const branches = ref(
    JSON.parse(localStorage.getItem('admin_branches')) || initialBranches
  )

  async function fetchBranchesFromBackend() {
    try {
      const apiBranches = await apiService.getBranches('all')
      if (apiBranches && apiBranches.length > 0) {
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
      }
    } catch (err) {
      console.log('Using local branch store cache.')
    }
  }

  onMounted(() => {
    fetchBranchesFromBackend()
  })

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
    fetchBranchesFromBackend,
    addBranch,
    updateBranch,
    deleteBranch
  }
})
