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
  const defaultBanners = [
    {
      id: 1,
      badge: 'خصومات خاصة',
      title: 'وفر حتى 20% عند استئجار منتجات سامسونج والبسيط',
      subtitle: 'عرض حصري لفترة محدودة على فئة السدان الكبيرة والاقتصادية',
      promoCode: 'BASEET15',
      bgGradient: 'linear-gradient(135deg, #071C18 0%, #004D40 100%)',
      ctaText: 'احجز عرضك الآن',
      active: true
    },
    {
      id: 2,
      badge: 'برنامج الولاء',
      title: 'سواها المفتاح والبسيط! تكسب نقاط مزدوجة مع كل رحلة',
      subtitle: 'استبدل نقاطك بأيام إيجار مجانية أو ترقية فئة السيارة تلقائياً',
      promoCode: 'KEY2026',
      bgGradient: 'linear-gradient(135deg, #1A1805 0%, #7A5B00 100%)',
      ctaText: 'استكشف برنامج الولاء',
      active: true
    },
    {
      id: 3,
      badge: 'العرض الشهري',
      title: 'تأجير فليكس الشهري بأفضل سعر بالمملكة',
      subtitle: 'سيارة تحت تصرفك شهر كاملاً شاملة التأمين والتوصيل المباشر',
      promoCode: 'MONTHLY25',
      bgGradient: 'linear-gradient(135deg, #1B003A 0%, #004D40 100%)',
      ctaText: 'اشترك شهرياً',
      active: true
    }
  ]

  const banners = ref(
    JSON.parse(localStorage.getItem('admin_banners')) || defaultBanners
  )

  async function fetchBannersFromBackend() {
    try {
      const apiBanners = await apiService.getBanners(true)
      if (apiBanners && apiBanners.length > 0) {
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
      }
    } catch (err) {
      console.log('Using local banner cache.')
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

  async function fetchLiveStats() {
    try {
      const data = await apiService.getAdminStats()
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
      console.log('Using local stats fallback')
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
    JSON.parse(localStorage.getItem('admin_user')) || { name: 'المدير العام', email: 'admin@albaseet.sa' }
  )

  async function login(email, password) {
    if (!email || !password) {
      throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }
    
    try {
      const res = await apiService.login(email, password)
      if (res && res.success) {
        isLoggedIn.value = true
        adminUser.value = { name: res.name || 'المدير العام', email: res.email || email, role: res.role || 'SuperAdmin' }
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
      // Fallback for demo if API unreachable
      if (err.message && err.message.includes('HTTP error') === false && !err.message.includes('Failed to fetch')) {
        throw err
      }
      if (email === 'admin@albaseet.sa' && password === 'admin123') {
        isLoggedIn.value = true
        adminUser.value = { name: 'المدير العام', email: email, role: 'SuperAdmin' }
        localStorage.setItem('admin_isLoggedIn', 'true')
        localStorage.setItem('admin_user', JSON.stringify(adminUser.value))
        return true
      }
      throw err
    }
  }

  function logout() {
    isLoggedIn.value = false
    adminUser.value = null
    localStorage.removeItem('admin_isLoggedIn')
    localStorage.removeItem('admin_user')
  }

  return {
    announcementText,
    announcementBadge,
    supportPhone,
    banners,
    stats,
    isLoggedIn,
    adminUser,
    login,
    logout,
    fetchLiveStats,
    fetchBannersFromBackend,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive
  }
})
