import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { apiService } from '../services/api'

const defaultBranchesList = [
  {
    id: 1,
    name: 'فرع مطار الملك خالد الدولي - T5',
    cityId: 'riyadh',
    cityName: 'الرياض',
    address: 'صالة المطار رقم 5 - الرياض',
    phone: '8002440201',
    isAirport: true,
    hours: '24 ساعة / 7 أيام',
    latitude: 24.9576,
    longitude: 46.6988,
    isActive: true
  },
  {
    id: 2,
    name: 'فرع محطة قطار السليمانية - جدة',
    cityId: 'jeddah',
    cityName: 'جدة',
    address: 'طريق الحرمين - حي السليمانية - جدة',
    phone: '8002440202',
    isAirport: false,
    hours: '08:00 ص - 11:00 م',
    latitude: 21.5432,
    longitude: 39.1728,
    isActive: true
  },
  {
    id: 3,
    name: 'فرع مطار الملك فهد الدولي - الدمام',
    cityId: 'dammam',
    cityName: 'الدمام',
    address: 'صالة القدوم - مطار الملك فهد - الدمام',
    phone: '8002440203',
    isAirport: true,
    hours: '24 ساعة / 7 أيام',
    latitude: 26.4712,
    longitude: 49.7978,
    isActive: true
  },
  {
    id: 4,
    name: 'فرع مطار أبها الدولي',
    cityId: 'abha',
    cityName: 'أبها',
    address: 'صالة الوصول - مطار أبها',
    phone: '8002440204',
    isAirport: true,
    hours: '24 ساعة / 7 أيام',
    latitude: 18.2404,
    longitude: 42.6566,
    isActive: true
  }
]

export const useBranchStore = defineStore('branch', () => {
  const cities = ref([
    { id: 'riyadh', name: 'الرياض' },
    { id: 'jeddah', name: 'جدة' },
    { id: 'dammam', name: 'الدمام' },
    { id: 'abha', name: 'أبها' }
  ])

  const branches = ref([...defaultBranchesList])

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
      console.error('Error fetching branches from Backend API, retaining default branches:', err)
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
    fetchBranchesFromBackend,
    addBranch,
    updateBranch,
    deleteBranch
  }
})
