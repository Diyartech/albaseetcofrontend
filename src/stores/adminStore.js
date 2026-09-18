import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { apiService } from '../services/api'

export const useAdminStore = defineStore('admin', () => {
  // Top Announcement Bar Settings
  const announcementText = ref(
    localStorage.getItem('admin_announcementText') || 'احصل على خصم 15% على تأجير السيارات عند استخدام كود BASEET15'
  )
  const announcementBadge = ref(
    localStorage.getItem('admin_announcementBadge') || 'خصم حصري'
  )
  const supportPhone = ref(
    localStorage.getItem('admin_supportPhone') || '8002440204'
  )

  // Hero Slider Banners CMS
  const banners = ref([])

  async function fetchBannersFromBackend() {
    try {
      const apiBanners = await apiService.getBanners(true)
      if (apiBanners && Array.isArray(apiBanners)) {
        banners.value = apiBanners.map(b => ({
          id: b.id,
          badge: b.badgeText,
          title: b.title,
          subtitle: b.subtitle,
          promoCode: b.promoCode,
          bgGradient: b.bgGradient || 'linear-gradient(135deg, #071C18 0%, #004D40 100%)',
          ctaText: b.ctaText || 'احجز الآن',
          active: b.isActive
        }))
      } else {
        banners.value = []
      }
    } catch (err) {
      console.error('Error fetching banners from Backend API:', err)
      banners.value = []
    }
  }

  // System Analytics Overview (Live from DB)
  const stats = ref({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: '0.00 ر.س',
    cancellationRate: '0%',
    avgBookingValue: '0.00 ر.س',
    activeCarsCount: 0,
    availableCarsStock: 0,
    activeBranchesCount: 0
  })

  async function fetchLiveStats(branchId = null) {
    try {
      const targetBranchId = branchId || (adminUser.value?.role === 'BranchUser' ? adminUser.value?.branchId : null)
      const data = await apiService.getAdminStats(targetBranchId)
      if (data) {
        stats.value = {
          totalBookings: data.totalBookings || 0,
          activeBookings: data.activeBookings || 0,
          completedBookings: data.completedBookings || 0,
          cancelledBookings: data.cancelledBookings || 0,
          totalRevenue: data.totalRevenue || '0.00 ر.س',
          cancellationRate: data.cancellationRate || '0%',
          avgBookingValue: data.avgBookingValue || '0.00 ر.س',
          activeCarsCount: data.activeCarsCount || 0,
          availableCarsStock: data.availableCarsStock || 0,
          activeBranchesCount: data.activeBranchesCount || 0
        }
      }
    } catch (err) {
      console.error('Error fetching live stats from Backend API:', err)
      stats.value = {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: '0.00 ر.س',
        cancellationRate: '0%',
        avgBookingValue: '0.00 ر.س',
        activeCarsCount: 0,
        availableCarsStock: 0,
        activeBranchesCount: 0
      }
    }
  }

  // Branch Users & Admins Management State
  const adminUsersList = ref([])
  const isUsersLoading = ref(false)

  async function fetchAdminUsers() {
    isUsersLoading.value = true
    try {
      const users = await apiService.getAdminUsers()
      adminUsersList.value = users || []
    } catch (err) {
      console.error('Error fetching admin users:', err)
    } finally {
      isUsersLoading.value = false
    }
  }

  async function addAdminUser(userData) {
    try {
      await apiService.createAdminUser(userData)
      await fetchAdminUsers()
    } catch (err) {
      console.error('Error creating admin user:', err)
      throw err
    }
  }

  async function updateAdminUser(id, userData) {
    try {
      await apiService.updateAdminUser(id, userData)
      await fetchAdminUsers()
    } catch (err) {
      console.error('Error updating admin user:', err)
      throw err
    }
  }

  async function deleteAdminUser(id) {
    try {
      await apiService.deleteAdminUser(id)
      await fetchAdminUsers()
    } catch (err) {
      console.error('Error deleting admin user:', err)
      throw err
    }
  }

  onMounted(() => {
    fetchBannersFromBackend()
    fetchLiveStats()
  })

  // Watchers to persist edits to LocalStorage
  watch(
    banners,
    (newVal) => {
      localStorage.setItem('admin_banners', JSON.stringify(newVal))
    },
    { deep: true }
  )

  watch(announcementText, (newVal) => {
    localStorage.setItem('admin_announcementText', newVal)
  })

  watch(announcementBadge, (newVal) => {
    localStorage.setItem('admin_announcementBadge', newVal)
  })

  watch(supportPhone, (newVal) => {
    localStorage.setItem('admin_supportPhone', newVal)
  })

  // Banner CRUD Actions (Synced with Backend API)
  async function addBanner(bannerData) {
    try {
      await apiService.createBanner({
        badgeText: bannerData.badge,
        title: bannerData.title,
        subtitle: bannerData.subtitle,
        promoCode: bannerData.promoCode,
        bgGradient: bannerData.bgGradient,
        ctaText: bannerData.ctaText || 'احجز الآن',
        displayOrder: banners.value.length + 1,
        isActive: true
      })
      fetchBannersFromBackend()
    } catch (err) {
      const newId = banners.value.length ? Math.max(...banners.value.map(b => b.id)) + 1 : 1
      banners.value.push({ id: newId, ...bannerData, active: true })
    }
  }

  async function updateBanner(id, bannerData) {
    try {
      await apiService.updateBanner(id, {
        id: id,
        badgeText: bannerData.badge,
        title: bannerData.title,
        subtitle: bannerData.subtitle,
        promoCode: bannerData.promoCode,
        bgGradient: bannerData.bgGradient,
        ctaText: bannerData.ctaText,
        isActive: bannerData.active !== undefined ? bannerData.active : true
      })
      fetchBannersFromBackend()
    } catch (err) {
      const idx = banners.value.findIndex(b => b.id === id)
      if (idx !== -1) {
        banners.value[idx] = { ...banners.value[idx], ...bannerData }
      }
    }
  }

  async function deleteBanner(id) {
    try {
      await apiService.deleteBanner(id)
      fetchBannersFromBackend()
    } catch (err) {
      banners.value = banners.value.filter(b => b.id !== id)
    }
  }

  async function toggleBannerActive(id) {
    const banner = banners.value.find(b => b.id === id)
    if (banner) {
      banner.active = !banner.active
      try {
        await apiService.updateBanner(id, {
          id: id,
          badgeText: banner.badge,
          title: banner.title,
          subtitle: banner.subtitle,
          promoCode: banner.promoCode,
          bgGradient: banner.bgGradient,
          ctaText: banner.ctaText,
          isActive: banner.active
        })
      } catch (err) {
        console.log('Local active toggle applied.')
      }
    }
  }

  // Authentication State
  const isLoggedIn = ref(localStorage.getItem('admin_isLoggedIn') === 'true')
  const adminUser = ref(
    JSON.parse(localStorage.getItem('admin_user')) || { name: 'المدير العام', email: 'admin@albaseet.sa', role: 'SuperAdmin', branchId: null }
  )

  async function login(email, password) {
    if (!email || !password) {
      throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }
    
    try {
      const res = await apiService.login(email, password)
      if (res && res.success) {
        isLoggedIn.value = true
        adminUser.value = {
          name: res.name || 'مستخدم النظام',
          email: res.email || email,
          role: res.role || 'SuperAdmin',
          branchId: res.branchId || null
        }
        localStorage.setItem('admin_isLoggedIn', 'true')
        localStorage.setItem('admin_user', JSON.stringify(adminUser.value))
        if (res.token) {
          localStorage.setItem('admin_token', res.token)
        }
        return true
      } else {
        throw new Error(res?.message || 'بيانات الدخول غير صحيحة')
      }
    } catch (err) {
      throw err
    }
  }

  function logout() {
    isLoggedIn.value = false
    adminUser.value = null
    localStorage.removeItem('admin_isLoggedIn')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
  }

  return {
    announcementText,
    announcementBadge,
    supportPhone,
    banners,
    stats,
    adminUsersList,
    isUsersLoading,
    isLoggedIn,
    adminUser,
    login,
    logout,
    fetchLiveStats,
    fetchBannersFromBackend,
    fetchAdminUsers,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive
  }
})
