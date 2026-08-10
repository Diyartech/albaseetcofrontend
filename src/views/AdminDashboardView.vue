<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../stores/adminStore'
import { useCarStore } from '../stores/carStore'
import { useBranchStore } from '../stores/branchStore'
import { apiService } from '../services/api'
import { 
  LayoutDashboard, Image, Car, MapPin, Settings, 
  Plus, Trash2, Edit, CheckCircle, Eye, Power, Save,
  TrendingUp, Users, DollarSign, ExternalLink, X, LogOut,
  CalendarCheck, Calendar, Filter, Search, RefreshCw, FileText, CheckCircle2, XCircle,
  Lock, AlertCircle
} from 'lucide-vue-next'

const adminStore = useAdminStore()
const carStore = useCarStore()
const branchStore = useBranchStore()
const router = useRouter()

// Inline Login State
const inlineEmail = ref('admin@albaseet.sa')
const inlinePassword = ref('admin123')
const inlineError = ref('')
const isInlineSubmitting = ref(false)

async function handleInlineLogin() {
  inlineError.value = ''
  if (!inlineEmail.value || !inlinePassword.value) {
    inlineError.value = 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
    return
  }
  isInlineSubmitting.value = true
  try {
    await adminStore.login(inlineEmail.value, inlinePassword.value)
    isInlineSubmitting.value = false
    adminStore.fetchLiveStats()
    fetchAdminBookings()
  } catch (err) {
    isInlineSubmitting.value = false
    inlineError.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى'
  }
}

function handleLogout() {
  adminStore.logout()
  router.push('/')
}

const activeTab = ref('overview') // 'overview', 'bookings', 'banners', 'cars', 'branches', 'settings'

// Bookings Management State (Live from SQL Server)
const adminBookingsList = ref([])
const isBookingsLoading = ref(false)
const bookingStatusFilter = ref('all') // 'all', 'active', 'completed', 'cancelled'
const bookingFilterStartDate = ref('')
const bookingFilterEndDate = ref('')
const bookingSearchQuery = ref('')

async function fetchAdminBookings() {
  isBookingsLoading.value = true
  try {
    const list = await apiService.getAdminBookings({
      status: bookingStatusFilter.value,
      startDate: bookingFilterStartDate.value,
      endDate: bookingFilterEndDate.value,
      search: bookingSearchQuery.value
    })
    adminBookingsList.value = list || []
  } catch (err) {
    console.error('Failed to load admin bookings:', err)
  } finally {
    isBookingsLoading.value = false
  }
}

function clearBookingFilters() {
  bookingStatusFilter.value = 'all'
  bookingFilterStartDate.value = ''
  bookingFilterEndDate.value = ''
  bookingSearchQuery.value = ''
  fetchAdminBookings()
}

async function handleAdminCancelBooking(refNumber) {
  if (!confirm(`هل أنت تأكد من رغبتك في إلغاء الحجز رقم ${refNumber}؟ سيتم إرجاع السيارة للأسطول المتاح.`)) {
    return
  }
  try {
    await apiService.cancelBooking(refNumber)
    alert(`تم إلغاء الحجز رقم ${refNumber} وإعادة السيارة للمخزون المتاح بنجاح.`)
    fetchAdminBookings()
    adminStore.fetchLiveStats()
  } catch (err) {
    alert(err.message || 'حدث خطأ أثناء إلغاء الحجز')
  }
}

onMounted(() => {
  if (adminStore.isLoggedIn) {
    adminStore.fetchLiveStats()
    fetchAdminBookings()
  }
})

watch(activeTab, (newTab) => {
  if (newTab === 'overview' || newTab === 'bookings') {
    adminStore.fetchLiveStats()
    fetchAdminBookings()
  }
})

// Banner Form State
const isBannerModalOpen = ref(false)
const editingBannerId = ref(null)
const bannerForm = ref({
  badge: 'خصومات خاصة',
  title: '',
  subtitle: '',
  promoCode: 'BASEET15',
  bgGradient: 'linear-gradient(135deg, #071C18 0%, #004D40 100%)',
  ctaText: 'احجز الآن'
})

function openAddBannerModal() {
  editingBannerId.value = null
  bannerForm.value = {
    badge: 'عرض جديد',
    title: '',
    subtitle: '',
    promoCode: 'NEW2026',
    bgGradient: 'linear-gradient(135deg, #071C18 0%, #004D40 100%)',
    ctaText: 'احجز الآن'
  }
  isBannerModalOpen.value = true
}

function openEditBannerModal(b) {
  editingBannerId.value = b.id
  bannerForm.value = { ...b }
  isBannerModalOpen.value = true
}

function saveBanner() {
  if (editingBannerId.value) {
    adminStore.updateBanner(editingBannerId.value, bannerForm.value)
  } else {
    adminStore.addBanner(bannerForm.value)
  }
  isBannerModalOpen.value = false
}

// Cars CMS Filtering & State
const carAdminSearch = ref('')
const carAdminCategory = ref('all')

const filteredAdminCars = computed(() => {
  let list = carStore.cars
  if (carAdminCategory.value !== 'all') {
    list = list.filter(c => c.categoryId === carAdminCategory.value)
  }
  if (carAdminSearch.value.trim()) {
    const q = carAdminSearch.value.trim().toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q)))
  }
  return list
})

const isCarModalOpen = ref(false)
const editingCarId = ref(null)
const carForm = ref({
  name: '',
  orSimilar: 'أو ما شابه ذلك',
  year: 2026,
  categoryId: 'economy',
  dailyRate: 140,
  weeklyDiscount: 10,
  monthlyDiscount: 25,
  passengers: 4,
  doors: 4,
  transmission: 'أوتوماتيك',
  luggage: 2,
  availableCount: 15,
  image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
  badge: 'الأكثر طلباً',
  features: 'تكييف ممتاز, بلوتوث, حساسات خلفية',
  isActive: true
})

function openAddCarModal() {
  editingCarId.value = null
  carForm.value = {
    name: '',
    orSimilar: 'أو ما شابه ذلك',
    year: 2026,
    categoryId: 'economy',
    dailyRate: 140,
    weeklyDiscount: 10,
    monthlyDiscount: 25,
    passengers: 4,
    doors: 4,
    transmission: 'أوتوماتيك',
    luggage: 2,
    availableCount: 15,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    badge: 'الأكثر طلباً',
    features: 'تكييف ممتاز, بلوتوث, حساسات خلفية',
    isActive: true
  }
  isCarModalOpen.value = true
}

function openEditCarModal(c) {
  editingCarId.value = c.id
  const featuresText = Array.isArray(c.features) 
    ? c.features.join(', ') 
    : (c.features || '')

  carForm.value = {
    name: c.name || '',
    orSimilar: c.orSimilar || 'أو ما شابه ذلك',
    year: c.year || 2026,
    categoryId: c.categoryId || 'economy',
    dailyRate: c.dailyRate || 140,
    weeklyDiscount: typeof c.weeklyDiscount === 'number' ? (c.weeklyDiscount < 1 ? c.weeklyDiscount * 100 : c.weeklyDiscount) : 10,
    monthlyDiscount: typeof c.monthlyDiscount === 'number' ? (c.monthlyDiscount < 1 ? c.monthlyDiscount * 100 : c.monthlyDiscount) : 25,
    passengers: c.passengers || 4,
    doors: c.doors || 4,
    transmission: c.transmission || 'أوتوماتيك',
    luggage: c.luggage || 2,
    availableCount: c.availableCount || 10,
    image: c.image || '',
    badge: c.badge || 'الأكثر طلباً',
    features: featuresText,
    isActive: c.isActive !== undefined ? c.isActive : true
  }
  isCarModalOpen.value = true
}

function saveCar() {
  if (editingCarId.value) {
    carStore.updateCar(editingCarId.value, carForm.value)
  } else {
    carStore.addCar(carForm.value)
  }
  isCarModalOpen.value = false
}

// Branch Form State
const isBranchModalOpen = ref(false)
const editingBranchId = ref(null)
const branchForm = ref({
  name: '',
  cityId: 'jeddah',
  cityName: 'جدة',
  address: '',
  phone: '8002440204',
  isAirport: false,
  hours: 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً',
  latitude: 21.5432,
  longitude: 39.1728,
  isActive: true
})

function openAddBranchModal() {
  editingBranchId.value = null
  branchForm.value = {
    name: '',
    cityId: 'jeddah',
    cityName: 'جدة',
    address: '',
    phone: '8002440204',
    isAirport: false,
    hours: 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً | الجمعة 05:00 مساءً - 10:00 مساءً',
    latitude: 21.5432,
    longitude: 39.1728,
    isActive: true
  }
  isBranchModalOpen.value = true
}

function openEditBranchModal(br) {
  editingBranchId.value = br.id
  branchForm.value = {
    name: br.name || '',
    cityId: br.cityId || 'jeddah',
    cityName: br.cityName || 'جدة',
    address: br.address || '',
    phone: br.phone || '8002440204',
    isAirport: br.isAirport || false,
    hours: br.hours || br.operatingHours || 'السبت - الخميس 10:00 صباحاً - 10:00 مساءً',
    latitude: br.latitude || 21.5432,
    longitude: br.longitude || 39.1728,
    isActive: br.isActive !== undefined ? br.isActive : true
  }
  isBranchModalOpen.value = true
}

function saveBranch() {
  const cityObj = branchStore.cities.find(c => c.id === branchForm.value.cityId)
  if (cityObj) {
    branchForm.value.cityName = cityObj.name
  }
  if (editingBranchId.value) {
    branchStore.updateBranch(editingBranchId.value, branchForm.value)
  } else {
    branchStore.addBranch(branchForm.value)
  }
  isBranchModalOpen.value = false
}

function viewLiveSite() {
  router.push('/')
}
</script>

<template>
  <div class="admin-dashboard-page">
    <!-- Admin Top Header Bar -->
    <header class="admin-top-header">
      <div class="container header-flex">
        <div class="brand-block">
          <img src="/logo.png" alt="البسيط" class="admin-logo" />
          <span class="admin-badge">لوحة التحكم الرئيسية (CMS)</span>
        </div>

        <div class="header-actions">
          <button class="btn btn-gold btn-sm" @click="viewLiveSite">
            <Eye :size="16" />
            <span>عرض الموقع المباشر</span>
          </button>
          
          <button v-if="adminStore.isLoggedIn" class="btn btn-danger-outline btn-sm logout-action-btn" @click="handleLogout" title="تسجيل الخروج من الحساب">
            <LogOut :size="16" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>

    <!-- IF NOT LOGGED IN: Show Inline Admin Login Card -->
    <div v-if="!adminStore.isLoggedIn" class="container inline-login-wrapper">
      <div class="inline-login-card card">
        <div class="login-badge-icon">
          <Lock :size="36" class="text-gold" />
        </div>
        <h2 class="login-card-title">تسجيل دخول الإدارة والنظام 🔒</h2>
        <p class="login-card-desc">أدخل البريد الإلكتروني وكلمة المرور للدخول إلى لوحة تحكم المحتوى</p>

        <form @submit.prevent="handleInlineLogin" class="inline-login-form">
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني</label>
            <input 
              type="email" 
              v-model="inlineEmail" 
              class="form-control" 
              placeholder="admin@albaseet.sa"
              required 
            />
          </div>

          <div class="form-group mt-3">
            <label class="form-label">كلمة المرور</label>
            <input 
              type="password" 
              v-model="inlinePassword" 
              class="form-control" 
              placeholder="••••••••"
              required 
            />
          </div>

          <div v-if="inlineError" class="login-error-msg mt-3">
            <AlertCircle :size="18" class="text-danger flex-shrink-0" />
            <span>{{ inlineError }}</span>
          </div>

          <button type="submit" class="btn btn-orange w-100 mt-4 inline-submit-btn" :disabled="isInlineSubmitting">
            <RefreshCw v-if="isInlineSubmitting" :size="18" class="spin-icon" />
            <CheckCircle2 v-else :size="18" />
            <span>{{ isInlineSubmitting ? 'جاري التحقق والتسجيل...' : 'دخول لوحة التحكم الآن' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- IF LOGGED IN: Show Full Admin Body Container -->
    <div v-else class="container admin-body-container">
      <!-- Admin Sidebar Menu -->
      <aside class="admin-sidebar card">
        <nav class="sidebar-nav">
          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'overview' }"
            @click="activeTab = 'overview'"
          >
            <LayoutDashboard :size="18" />
            <span>نظرة عامة والإحصائيات</span>
          </button>

          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'bookings' }"
            @click="activeTab = 'bookings'"
          >
            <CalendarCheck :size="18" class="text-gold" />
            <span>إدارة الحجوزات والفلترة</span>
          </button>

          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'banners' }"
            @click="activeTab = 'banners'"
          >
            <Image :size="18" />
            <span>إعلانات السلايدر (Hero)</span>
          </button>

          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'cars' }"
            @click="activeTab = 'cars'"
          >
            <Car :size="18" />
            <span>إدارة السيارات والأسعار</span>
          </button>

          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'branches' }"
            @click="activeTab = 'branches'"
          >
            <MapPin :size="18" />
            <span>إدارة الفروع والمواقع</span>
          </button>

          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            <Settings :size="18" />
            <span>إعدادات الشريط العلوي والموقع</span>
          </button>
        </nav>
      </aside>

      <!-- Main Dashboard Content Area -->
      <main class="admin-main-content">
        
        <!-- ===================================================================
             TAB 1: OVERVIEW & ANALYTICS (Live DB Stats)
             =================================================================== -->
        <div v-if="activeTab === 'overview'" class="tab-pane">
          <div class="pane-header flex-between">
            <div>
              <h2 class="heading-md">إحصائيات ونظرة عامة من واقع قاعدة البيانات 📊</h2>
              <p class="text-muted">متابعة فورية وحية لأداء الحجوزات، الإيرادات، وأسلوب التشغيل بالأسطول</p>
            </div>
            <button class="btn btn-outline btn-sm" @click="adminStore.fetchLiveStats()" title="تحديث البيانات">
              <RefreshCw :size="16" />
              <span>تحديث حقيقي</span>
            </button>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card card">
              <div class="kpi-icon green"><DollarSign :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">إجمالي الإيرادات المؤكدة</span>
                <strong class="kpi-val">{{ adminStore.stats.totalRevenue }}</strong>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon gold"><TrendingUp :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">إجمالي عدد الحجوزات</span>
                <strong class="kpi-val">{{ adminStore.stats.totalBookings }} حجز</strong>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon primary"><CheckCircle2 :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">الحجوزات السارية (النشطة)</span>
                <strong class="kpi-val">{{ adminStore.stats.activeBookings }} حجز ساري</strong>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon orange"><CalendarCheck :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">الحجوزات المكتملة (المنتهية)</span>
                <strong class="kpi-val">{{ adminStore.stats.completedBookings }} مكتمل</strong>
              </div>
            </div>
          </div>

          <!-- Secondary Analytics Row -->
          <div class="kpi-grid mt-3">
            <div class="kpi-card card">
              <div class="kpi-icon danger"><XCircle :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">معدل ونسبة الإلغاء</span>
                <strong class="kpi-val">{{ adminStore.stats.cancellationRate }} ({{ adminStore.stats.cancelledBookings }} حجز)</strong>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon gold"><DollarSign :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">متوسط قيمة العقد/الحجز</span>
                <strong class="kpi-val">{{ adminStore.stats.avgBookingValue }}</strong>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon primary"><Car :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">مخزون أسطول السيارات المتاح</span>
                <strong class="kpi-val">{{ adminStore.stats.availableCarsStock }} سيارة جاهزة</strong>
              </div>
            </div>

            <div class="kpi-card card">
              <div class="kpi-icon orange"><MapPin :size="24" /></div>
              <div class="kpi-info">
                <span class="kpi-label">عدد الفروع النشطة</span>
                <strong class="kpi-val">{{ adminStore.stats.activeBranchesCount }} فرع</strong>
              </div>
            </div>
          </div>

          <!-- Quick Actions Grid -->
          <div class="quick-cms-box card mt-4">
            <h3 class="section-title">إجراءات سريعة للتحكم بصفحة الرئيسية</h3>
            <div class="quick-btns-row">
              <button class="btn btn-outline-primary" @click="openAddBannerModal">
                <Plus :size="16" />
                <span>إضافة بنر إعلاني جديد</span>
              </button>
              <button class="btn btn-outline-primary" @click="openAddCarModal">
                <Plus :size="16" />
                <span>إضافة سيارة جديدة للأسطول</span>
              </button>
              <button class="btn btn-outline-primary" @click="openAddBranchModal">
                <Plus :size="16" />
                <span>إضافة فرع جديد</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             TAB 2: BOOKINGS MANAGEMENT & FILTERS (Live SQL Server Data)
             =================================================================== -->
        <div v-else-if="activeTab === 'bookings'" class="tab-pane">
          <div class="pane-header flex-between">
            <div>
              <h2 class="heading-md">سجل وإدارة الحجوزات الكاملة 📅</h2>
              <p class="text-muted">متابعة فورية لكافة العقود مع إمكانية الفلترة بالتاريخ والحالة والبحث المباشر</p>
            </div>
            <button class="btn btn-outline btn-sm" @click="fetchAdminBookings" :disabled="isBookingsLoading">
              <RefreshCw :size="16" :class="{ 'spin-icon': isBookingsLoading }" />
              <span>تحديث السجل</span>
            </button>
          </div>

          <!-- Bookings Filter Bar -->
          <div class="filter-bar-card card mb-4">
            <div class="filter-grid">
              <!-- Status Filter -->
              <div class="filter-group">
                <label class="filter-label">حالة الحجز</label>
                <select v-model="bookingStatusFilter" @change="fetchAdminBookings" class="form-control">
                  <option value="all">جميع الحالات (الكل)</option>
                  <option value="active">الحجوزات السارية (النشطة)</option>
                  <option value="completed">الحجوزات المنتهية (المكتملة)</option>
                  <option value="cancelled">الحجوزات الملغاة</option>
                </select>
              </div>

              <!-- From Date Filter -->
              <div class="filter-group">
                <label class="filter-label">من تاريخ الاستلام</label>
                <input 
                  type="date" 
                  v-model="bookingFilterStartDate" 
                  @change="fetchAdminBookings" 
                  class="form-control" 
                />
              </div>

              <!-- To Date Filter -->
              <div class="filter-group">
                <label class="filter-label">إلى تاريخ الاستلام</label>
                <input 
                  type="date" 
                  v-model="bookingFilterEndDate" 
                  @change="fetchAdminBookings" 
                  class="form-control" 
                />
              </div>

              <!-- Search Query -->
              <div class="filter-group search-group">
                <label class="filter-label">بحث نصي فوري</label>
                <div class="search-input-wrapper">
                  <Search :size="16" class="search-icon" />
                  <input 
                    type="text" 
                    v-model="bookingSearchQuery" 
                    @input="fetchAdminBookings"
                    placeholder="رقم الحجز، اسم العميل، الهوية، الجوال..." 
                    class="form-control" 
                  />
                </div>
              </div>
            </div>

            <div class="filter-actions-row mt-3">
              <button class="btn btn-subtle btn-sm" @click="clearBookingFilters">
                <X :size="14" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
              <span class="text-muted text-sm">عرض {{ adminBookingsList.length }} حجز مطبق عليه الفلتر الحالي</span>
            </div>
          </div>

          <!-- Bookings Data Table -->
          <div class="card bookings-table-card">
            <div v-if="isBookingsLoading" class="p-5 text-center">
              <RefreshCw :size="32" class="spin-icon text-primary mb-2" />
              <p class="text-muted">جاري تحميل سجل الحجوزات من قاعدة البيانات...</p>
            </div>

            <div v-else-if="adminBookingsList.length === 0" class="empty-bookings-box p-5 text-center">
              <CalendarCheck :size="48" class="text-muted mb-2" />
              <h4>لا توجد حجوزات مطابقة للفلاتر الحالية</h4>
              <p class="text-muted">قم بتغيير نطاق التاريخ أو حالة الحجز لرؤية النتائج</p>
              <button class="btn btn-outline btn-sm mt-3" @click="clearBookingFilters">إظهار كافة الحجوزات</button>
            </div>

            <div v-else class="table-responsive">
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>رقم المرجع</th>
                    <th>بيانات المستأجر</th>
                    <th>السيارة والنوع</th>
                    <th>تاريخ الاستلام والفرع</th>
                    <th>تاريخ التسليم والفرع</th>
                    <th>المدة والنوع</th>
                    <th>الإجمالي النهائي</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(b, idx) in adminBookingsList" :key="b.id || idx" :class="{ 'row-cancelled': b.statusKey === 'cancelled' }">
                    <td class="text-muted font-mono">{{ idx + 1 }}</td>
                    <td>
                      <strong class="text-primary font-mono">{{ b.bookingRef }}</strong>
                      <div class="text-xs text-muted">{{ b.createdAt }}</div>
                    </td>
                    <td>
                      <div class="font-bold">{{ b.customerName }}</div>
                      <div class="text-xs text-muted font-mono">{{ b.customerPhone }} | {{ b.nationalId }}</div>
                    </td>
                    <td>
                      <div class="font-bold">{{ b.carName }}</div>
                      <span class="badge-subtle">{{ b.carCategory }}</span>
                    </td>
                    <td>
                      <div class="text-xs font-bold">{{ b.pickupDatetime }}</div>
                      <div class="text-xs text-muted">{{ b.pickupBranch }}</div>
                    </td>
                    <td>
                      <div class="text-xs font-bold">{{ b.dropoffDatetime }}</div>
                      <div class="text-xs text-muted">{{ b.dropoffBranch }}</div>
                    </td>
                    <td>
                      <span class="font-bold">{{ b.rentalDays }} أيام</span>
                      <div class="text-xs text-muted">{{ b.rentalMode === 'Daily' ? 'يومي' : b.rentalMode === 'Weekly' ? 'أسبوعي' : 'شهري' }}</div>
                    </td>
                    <td>
                      <strong class="text-success font-mono">{{ b.grandTotal }} ر.س</strong>
                      <div class="text-xs text-muted">{{ b.paymentMethod }}</div>
                    </td>
                    <td>
                      <span 
                        class="status-pill"
                        :class="{
                          'active': b.statusKey === 'active' || b.status === 'ساري ونشط',
                          'completed': b.statusKey === 'completed' || b.status === 'منتهي',
                          'cancelled': b.statusKey === 'cancelled' || b.status === 'ملغى'
                        }"
                      >
                        {{ b.status }}
                      </span>
                    </td>
                    <td>
                      <div class="actions-flex">
                        <button 
                          v-if="b.statusKey !== 'cancelled' && b.status !== 'ملغى'" 
                          class="action-btn danger" 
                          title="إلغاء الحجز وإعادة السيارة للمخزون"
                          @click="handleAdminCancelBooking(b.bookingRef)"
                        >
                          <XCircle :size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             TAB 2: HERO BANNERS SLIDER CMS
             =================================================================== -->
        <div v-else-if="activeTab === 'banners'" class="tab-pane">
          <div class="pane-header flex-between">
            <div>
              <h2 class="heading-md">إدارة سلايدر الإعلانات الرئيسية (Hero Banners)</h2>
              <p class="text-muted">التحكم في البنرات الإعلانية الظاهرة في أعلى الصفحة الرئيسية</p>
            </div>
            <button class="btn btn-orange" @click="openAddBannerModal">
              <Plus :size="18" />
              <span>إضافة بنر جديد</span>
            </button>
          </div>

          <div class="banners-list-grid">
            <div 
              v-for="b in adminStore.banners" 
              :key="b.id" 
              class="banner-item-card card"
              :style="{ background: b.bgGradient }"
            >
              <div class="banner-card-top">
                <span class="badge badge-gold">{{ b.badge }}</span>
                <span class="badge" :class="b.active ? 'badge-primary' : 'badge-gray'">
                  {{ b.active ? 'مفعل' : 'معطل' }}
                </span>
              </div>

              <h3 class="b-title">{{ b.title }}</h3>
              <p class="b-sub">{{ b.subtitle }}</p>
              <p class="b-code">الكود الترويجي: <strong>{{ b.promoCode }}</strong></p>

              <div class="b-actions">
                <button class="btn btn-sm btn-gold" @click="openEditBannerModal(b)">
                  <Edit :size="14" />
                  <span>تعديل</span>
                </button>
                <button class="btn btn-sm btn-outline" @click="adminStore.toggleBannerActive(b.id)">
                  <Power :size="14" />
                  <span>{{ b.active ? 'تعطيل' : 'تفعيل' }}</span>
                </button>
                <button class="btn btn-sm btn-outline-red" @click="adminStore.deleteBanner(b.id)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             TAB 3: CARS INVENTORY CMS (إدارة السيارات والأسعار)
             =================================================================== -->
        <div v-else-if="activeTab === 'cars'" class="tab-pane">
          <div class="pane-header flex-between">
            <div>
              <h2 class="heading-md">إدارة أسطول السيارات والأسعار 🚗💰</h2>
              <p class="text-muted">إضافة، تعديل أسعار، وتحديث كميات وأعداد السيارات في الموقع بمرونة كاملة</p>
            </div>
            <button class="btn btn-orange" @click="openAddCarModal">
              <Plus :size="18" />
              <span>إضافة سيارة جديدة</span>
            </button>
          </div>

          <!-- Cars Filter Toolbar Bar -->
          <div class="cars-toolbar-card card mb-4">
            <div class="cars-toolbar-grid">
              <div class="search-input-wrapper">
                <Search :size="16" class="search-icon" />
                <input 
                  type="text" 
                  v-model="carAdminSearch" 
                  placeholder="ابحث عن سيارة باسم الموديل أو الفئة..." 
                  class="form-control" 
                />
              </div>

              <select v-model="carAdminCategory" class="form-control form-select">
                <option value="all">جميع الفئات (الكل)</option>
                <option value="economy">اقتصادية</option>
                <option value="compact">صغيرة</option>
                <option value="midsize">سدان متوسطة</option>
                <option value="luxury">فخمة</option>
                <option value="suv">متعددة الاستخدامات / عائلية</option>
                <option value="commercial">تجارية</option>
                <option value="premium">بريميوم</option>
              </select>
            </div>
          </div>

          <!-- Desktop Table View (شاشة الكمبيوتر) -->
          <div class="table-responsive card desktop-cars-table">
            <table class="cms-table">
              <thead>
                <tr>
                  <th>السيارة الموديل</th>
                  <th>الفئة</th>
                  <th>السعر اليومي</th>
                  <th>الخصومات (أسبوعي/شهري)</th>
                  <th>المتوفّر بالمخزون</th>
                  <th>المواصفات والشارة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in filteredAdminCars" :key="c.id">
                  <td class="car-cell">
                    <img :src="c.image" :alt="c.name" class="table-car-img" />
                    <div>
                      <strong>{{ c.name }}</strong>
                      <span class="d-block text-muted text-xs">{{ c.year }} | {{ c.orSimilar }}</span>
                    </div>
                  </td>
                  <td><span class="badge badge-primary">{{ c.category }}</span></td>
                  <td><strong class="text-primary font-mono">{{ c.dailyRate }} ر.س / يوم</strong></td>
                  <td>
                    <div class="text-xs">أسبوعي: <strong>{{ Math.round((c.weeklyDiscount || 0.1) * 100) }}%</strong></div>
                    <div class="text-xs text-muted">شهري: <strong>{{ Math.round((c.monthlyDiscount || 0.25) * 100) }}%</strong></div>
                  </td>
                  <td>
                    <span class="stock-pill" :class="c.availableCount > 0 ? 'in-stock' : 'out-stock'">
                      {{ c.availableCount > 0 ? `${c.availableCount} سيارات جاهزة` : 'محجوز بالكامل' }}
                    </span>
                  </td>
                  <td>
                    <div class="text-xs">{{ c.passengers }} ركاب / {{ c.transmission }}</div>
                    <span class="badge badge-gold mt-1">{{ c.badge }}</span>
                  </td>
                  <td>
                    <div class="tbl-actions">
                      <button class="action-icon-btn" @click="openEditCarModal(c)" title="تعديل السعر والبيانات">
                        <Edit :size="16" />
                      </button>
                      <button class="action-icon-btn text-danger" @click="carStore.deleteCar(c.id)" title="حذف السيارة">
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards Grid View (شاشة الجوال) -->
          <div class="mobile-cars-grid">
            <div v-for="c in filteredAdminCars" :key="c.id" class="mobile-car-admin-card card">
              <div class="car-card-top-flex">
                <img :src="c.image" :alt="c.name" class="mobile-car-thumb" />
                <div class="car-main-meta">
                  <span class="badge badge-primary text-xs">{{ c.category }}</span>
                  <h4 class="car-name-title">{{ c.name }}</h4>
                  <div class="text-xs text-muted">موديل {{ c.year }} ({{ c.orSimilar }})</div>
                </div>
              </div>

              <div class="car-price-stock-row mt-2">
                <div class="price-box">
                  <span class="price-lbl">السعر اليومي:</span>
                  <strong class="text-primary price-val">{{ c.dailyRate }} ر.س</strong>
                </div>

                <span class="stock-pill" :class="c.availableCount > 0 ? 'in-stock' : 'out-stock'">
                  {{ c.availableCount }} سيارات
                </span>
              </div>

              <div class="car-specs-row text-xs text-muted mt-2">
                <span>👥 {{ c.passengers }} ركاب</span>
                <span>⚙️ {{ c.transmission }}</span>
                <span class="badge badge-gold text-xs">{{ c.badge }}</span>
              </div>

              <div class="car-admin-actions-bar mt-3">
                <button class="btn btn-sm btn-gold flex-1" @click="openEditCarModal(c)">
                  <Edit :size="14" />
                  <span>تعديل السعر</span>
                </button>
                <button class="btn btn-sm btn-outline-red" @click="carStore.deleteCar(c.id)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             TAB 4: BRANCHES CMS
             =================================================================== -->
        <div v-else-if="activeTab === 'branches'" class="tab-pane">
          <div class="pane-header flex-between">
            <div>
              <h2 class="heading-md">إدارة فروع البسيط والمطارات</h2>
              <p class="text-muted">التحكم في بيانات ومواقع الفروع الظاهرة للعملاء</p>
            </div>
            <button class="btn btn-orange" @click="openAddBranchModal">
              <Plus :size="18" />
              <span>إضافة فرع جديد</span>
            </button>
          </div>

          <div class="branches-table-list card">
            <div v-for="br in branchStore.branches" :key="br.id" class="branch-row-item">
              <div class="br-info">
                <span class="badge badge-primary">{{ br.cityName }}</span>
                <span v-if="br.isAirport" class="badge badge-gold">فرع مطار ✈️</span>
                <h4>{{ br.name }}</h4>
                <p class="text-muted"><MapPin :size="14" /> {{ br.address }} - هاتف: {{ br.phone }}</p>
              </div>

              <div class="tbl-actions">
                <button class="btn btn-sm btn-outline" @click="openEditBranchModal(br)">
                  <Edit :size="14" />
                  <span>تعديل</span>
                </button>
                <button class="btn btn-sm btn-outline-red" @click="branchStore.deleteBranch(br.id)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===================================================================
             TAB 5: SITE SETTINGS CMS
             =================================================================== -->
        <div v-else-if="activeTab === 'settings'" class="tab-pane">
          <div class="pane-header">
            <h2 class="heading-md">إعدادات الشريط العلوي والموقع العام</h2>
            <p class="text-muted">التحكم في نص الإعلانات العلوي، أرقام الدعم، ومعلومات الموقع</p>
          </div>

          <div class="settings-form-card card">
            <div class="form-group">
              <label class="form-label">نص الشارة العلوية (Badge)</label>
              <input type="text" v-model="adminStore.announcementBadge" class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">نص شريط الإعلان المباشر في أعلى الموقع</label>
              <input type="text" v-model="adminStore.announcementText" class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">رقم هاتف الدعم المجاني الموحد</label>
              <input type="text" v-model="adminStore.supportPhone" class="form-control" />
            </div>

            <div class="save-status-box text-success">
              <CheckCircle :size="18" />
              <span>جميع التغييرات تُحفظ تلقائياً وتنعكس فوراً على كافة صفحات الموقع!</span>
            </div>
          </div>
        </div>

      </main>
    </div>

    <!-- Banner Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="isBannerModalOpen" class="modal-overlay" @click="isBannerModalOpen = false">
        <div class="modal-card card" @click.stop>
          <div class="modal-header">
            <h3>{{ editingBannerId ? 'تعديل البنر الإعلاني' : 'إضافة بنر إعلاني جديد' }}</h3>
            <button class="close-btn" @click="isBannerModalOpen = false"><X :size="20" /></button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">نص الشارة المميزة (Badge)</label>
              <input type="text" v-model="bannerForm.badge" class="form-control" />
            </div>

            <div class="form-group">
              <label class="form-label">عنوان الإعلان الرئيسي *</label>
              <input type="text" v-model="bannerForm.title" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">العنوان الفرعي الوصفي</label>
              <textarea v-model="bannerForm.subtitle" class="form-control" rows="2"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">الرمز الترويجي الخاص بالإعلان</label>
              <input type="text" v-model="bannerForm.promoCode" class="form-control" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" @click="isBannerModalOpen = false">إلغاء</button>
            <button class="btn btn-primary" @click="saveBanner">حفظ وتحديث</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Car Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="isCarModalOpen" class="modal-overlay" @click="isCarModalOpen = false">
        <div class="modal-card card" @click.stop>
          <div class="modal-header">
            <h3>{{ editingCarId ? 'تعديل بيانات السيارة' : 'إضافة سيارة جديدة للأسطول' }}</h3>
            <button class="close-btn" @click="isCarModalOpen = false"><X :size="20" /></button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">اسم السيارة والموديل *</label>
                <input type="text" v-model="carForm.name" class="form-control" required placeholder="مثال: هيونداي أي 10 (Hyundai i10)" />
              </div>

              <div class="form-group">
                <label class="form-label">عبارة التناظر (or_similar)</label>
                <input type="text" v-model="carForm.orSimilar" class="form-control" placeholder="أو ما شابه ذلك" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">فئة السيارة (category_id) *</label>
                <select v-model="carForm.categoryId" class="form-control form-select">
                  <option value="economy">اقتصادية (economy)</option>
                  <option value="compact">صغيرة (compact)</option>
                  <option value="midsize">سدان متوسطة (midsize)</option>
                  <option value="luxury">فخمة (luxury)</option>
                  <option value="suv">عائلية / SUV</option>
                  <option value="commercial">تجارية (commercial)</option>
                  <option value="premium">بريميوم (premium)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">السعر اليومي - daily_rate (ر.س) *</label>
                <input type="number" step="0.01" v-model.number="carForm.dailyRate" class="form-control" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">نسبة الخصم الأسبوعي (%)</label>
                <input type="number" step="1" v-model.number="carForm.weeklyDiscount" class="form-control" placeholder="مثال: 10" />
              </div>

              <div class="form-group">
                <label class="form-label">نسبة الخصم الشهري (%)</label>
                <input type="number" step="1" v-model.number="carForm.monthlyDiscount" class="form-control" placeholder="مثال: 25" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">سنة الصنع (model_year)</label>
                <input type="number" v-model.number="carForm.year" class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">الكمية المتوفرة (available_stock)</label>
                <input type="number" v-model.number="carForm.availableCount" class="form-control" />
              </div>
            </div>

            <div class="form-grid three-col">
              <div class="form-group">
                <label class="form-label">عدد الركاب (passengers)</label>
                <input type="number" v-model.number="carForm.passengers" class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">عدد الأبواب (doors)</label>
                <input type="number" v-model.number="carForm.doors" class="form-control" />
              </div>

              <div class="form-group">
                <label class="form-label">سعة الحقائب (luggage)</label>
                <input type="number" v-model.number="carForm.luggage" class="form-control" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">ناقل الحركة (transmission)</label>
                <select v-model="carForm.transmission" class="form-control form-select">
                  <option value="أوتوماتيك">أوتوماتيك</option>
                  <option value="يدوي">يدوي (عادي)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">الشارة المميزة (badge)</label>
                <input type="text" v-model="carForm.badge" class="form-control" placeholder="مثال: الأكثر طلباً / وفر أكثر" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">رابط صورة السيارة (image_url)</label>
              <input type="text" v-model="carForm.image" class="form-control" placeholder="https://..." />
            </div>

            <div class="form-group">
              <label class="form-label">المميزات والخصائص (features) - مفصولة بفاصلة</label>
              <textarea v-model="carForm.features" class="form-control" rows="2" placeholder="تكييف ممتاز, بلوتوث, حساسات خلفية, اقتصادية جداً"></textarea>
            </div>

            <label class="checkbox-label mt-2">
              <input type="checkbox" v-model="carForm.isActive" />
              <span>السيارة مفعلة وتظهر بالأسطول والمنصة (is_active)</span>
            </label>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" @click="isCarModalOpen = false">إلغاء</button>
            <button class="btn btn-primary" @click="saveCar">حفظ السيارة</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Branch Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="isBranchModalOpen" class="modal-overlay" @click="isBranchModalOpen = false">
        <div class="modal-card card" @click.stop>
          <div class="modal-header">
            <h3>{{ editingBranchId ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد' }}</h3>
            <button class="close-btn" @click="isBranchModalOpen = false"><X :size="20" /></button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">اسم الفرع (name) *</label>
                <input type="text" v-model="branchForm.name" class="form-control" required placeholder="مثال: محطة قطار السليمانية" />
              </div>

              <div class="form-group">
                <label class="form-label">المدينة (city_id / city_name) *</label>
                <select v-model="branchForm.cityId" class="form-control form-select">
                  <option v-for="c in branchStore.cities" :key="c.id" :value="c.id">{{ c.name }} ({{ c.id }})</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">العنوان بالتفصيل (address)</label>
              <input type="text" v-model="branchForm.address" class="form-control" placeholder="مثال: محطة قطار السليمانية بجدة" />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">رقم هاتف الفرع (phone)</label>
                <input type="text" v-model="branchForm.phone" class="form-control" placeholder="8002440204" />
              </div>

              <div class="form-group">
                <label class="form-label">ساعات وأوقات العمل (operating_hours)</label>
                <input type="text" v-model="branchForm.hours" class="form-control" placeholder="السبت - الخميس 10:00 ص - 10:00 م" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">خط العرض (latitude)</label>
                <input type="number" step="0.0001" v-model.number="branchForm.latitude" class="form-control" placeholder="21.5432" />
              </div>

              <div class="form-group">
                <label class="form-label">خط الطول (longitude)</label>
                <input type="number" step="0.0001" v-model.number="branchForm.longitude" class="form-control" placeholder="39.1728" />
              </div>
            </div>

            <div class="form-grid mt-2">
              <label class="checkbox-label">
                <input type="checkbox" v-model="branchForm.isAirport" />
                <span>فرع مطار (is_airport ✈️)</span>
              </label>

              <label class="checkbox-label">
                <input type="checkbox" v-model="branchForm.isActive" />
                <span>الفرع مفعل ويظهر بالمنصة (is_active)</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline" @click="isBranchModalOpen = false">إلغاء</button>
            <button class="btn btn-primary" @click="saveBranch">حفظ الفرع</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-dashboard-page {
  min-height: 100vh;
  background: var(--bg-main);
}

.admin-top-header {
  background: var(--bg-dark);
  color: var(--text-white);
  padding: 0.85rem 0;
  border-bottom: 2px solid var(--gold);
}

.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-logo {
  height: 40px;
  object-fit: contain;
}

.admin-badge {
  background: var(--gold-light);
  color: var(--primary-deep);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
}

.admin-body-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 1.75rem;
  padding-top: 2rem;
  padding-bottom: 3rem;
}

.admin-sidebar {
  padding: 1rem;
  height: fit-content;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: var(--transition);
  text-align: right;
}

.nav-tab:hover {
  background: var(--bg-subtle);
  color: var(--primary);
}

.nav-tab.active {
  background: var(--primary);
  color: white;
}

.pane-header {
  margin-bottom: 1.5rem;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.kpi-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon.gold { background: var(--gold-light); color: var(--gold); }
.kpi-icon.primary { background: var(--primary-surface); color: var(--primary); }
.kpi-icon.orange { background: var(--orange-light); color: var(--orange); }
.kpi-icon.green { background: #E8F5E9; color: #2E7D32; }

.kpi-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
}

.kpi-val {
  font-size: 1.15rem;
  color: var(--text-dark);
}

.quick-cms-box {
  padding: 1.5rem;
}

.quick-btns-row {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.banners-list-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.banner-item-card {
  padding: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
}

.banner-card-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.b-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.b-sub {
  font-size: 0.88rem;
  opacity: 0.85;
  margin-bottom: 1rem;
}

.b-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.table-responsive {
  overflow-x: auto;
}

.cms-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.cms-table th, .cms-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.9rem;
}

.cms-table th {
  background: var(--bg-subtle);
  font-weight: 800;
}

/* Filter Bar Styling */
.filter-bar-card {
  padding: 1.5rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dark);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper .search-icon {
  position: absolute;
  right: 0.75rem;
  color: var(--text-muted);
}

.search-input-wrapper .form-control {
  padding-right: 2.25rem;
}

.filter-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-light);
  padding-top: 0.75rem;
}

/* Admin Data Table */
.admin-data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.admin-data-table th, .admin-data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.85rem;
}

.admin-data-table th {
  background: var(--primary-dark);
  color: var(--text-white);
  font-weight: 700;
}

.admin-data-table tr.row-cancelled {
  background: rgba(255, 82, 82, 0.04);
}

.badge-subtle {
  background: var(--bg-subtle);
  color: var(--text-muted);
  font-size: 0.7rem;
  padding: 0.15rem 0.45rem;
  border-radius: var(--radius-sm);
  display: inline-block;
  margin-top: 0.2rem;
}

.status-pill {
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 800;
  display: inline-block;
}

.status-pill.active {
  background: #E8F5E9;
  color: #2E7D32;
}

.status-pill.completed {
  background: #E3F2FD;
  color: #1565C0;
}

.status-pill.cancelled {
  background: #FFEBEE;
  color: #C62828;
}

.actions-flex {
  display: flex;
  gap: 0.35rem;
}

.action-btn {
  padding: 0.35rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.action-btn.danger {
  color: #D32F2F;
}

.action-btn.danger:hover {
  background: #FFEBEE;
}

@media (max-width: 1024px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

.car-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.table-car-img {
  width: 60px;
  height: 40px;
  object-fit: contain;
}

.tbl-actions {
  display: flex;
  gap: 0.5rem;
}

.action-icon-btn {
  padding: 0.4rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: var(--transition);
}

.action-icon-btn:hover {
  background: var(--bg-subtle);
  color: var(--primary);
}

.branches-table-list {
  display: flex;
  flex-direction: column;
}

.branch-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.settings-form-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.save-status-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  background: #E8F5E9;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
}

.btn-outline-red {
  border: 1px solid var(--accent-red);
  color: var(--accent-red);
}

.btn-outline-red:hover {
  background: var(--accent-red);
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 680px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-grid.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-danger-outline {
  background: transparent;
  border: 1px solid #FF5252;
  color: #FF5252;
  font-weight: 700;
  transition: var(--transition);
}

.btn-danger-outline:hover {
  background: #FF5252;
  color: #FFFFFF;
}

/* Inline Login Card Component */
.inline-login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 1rem;
}

.inline-login-card {
  width: 440px;
  max-width: 100%;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 15px 45px rgba(0, 77, 64, 0.12);
  border: 1px solid var(--border-light);
}

.login-badge-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.login-card-title {
  font-size: 1.35rem;
  font-weight: 900;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.login-card-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1.75rem;
}

.inline-login-form {
  width: 100%;
  text-align: right;
}

.inline-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 800;
}

.spin-icon {
  animation: spinLoader 0.8s linear infinite;
}

@keyframes spinLoader {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logout-action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-md);
}

/* Cars Management Toolbar & Mobile Grid */
.cars-toolbar-card {
  padding: 1.25rem;
}

.cars-toolbar-grid {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 1rem;
}

.stock-pill {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  display: inline-block;
}

.stock-pill.in-stock {
  background: #E8F5E9;
  color: #2E7D32;
}

.stock-pill.out-stock {
  background: #FFEBEE;
  color: #C62828;
}

.mobile-cars-grid {
  display: none;
  flex-direction: column;
  gap: 1rem;
}

.mobile-car-admin-card {
  padding: 1.25rem;
}

.car-card-top-flex {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-car-thumb {
  width: 80px;
  height: 55px;
  object-fit: contain;
  border-radius: var(--radius-md);
  background: var(--bg-subtle);
}

.car-main-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.car-name-title {
  font-size: 1rem;
  font-weight: 800;
}

.car-price-stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px dashed var(--border-light);
  padding-top: 0.75rem;
}

.price-lbl {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: 0.3rem;
}

.price-val {
  font-size: 1.1rem;
  font-weight: 900;
}

.car-specs-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.car-admin-actions-bar {
  display: flex;
  gap: 0.5rem;
}

.flex-1 {
  flex: 1;
}

/* Media Queries for Mobile Responsiveness */
@media (max-width: 1024px) {
  .admin-body-container {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding-top: 1rem;
    padding-bottom: 2rem;
  }
  
  .sidebar-nav {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.4rem;
    -webkit-overflow-scrolling: touch;
  }
  
  .nav-tab {
    white-space: nowrap;
    padding: 0.65rem 0.95rem;
    font-size: 0.85rem;
    flex-shrink: 0;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }
  
  .banners-list-grid {
    grid-template-columns: 1fr;
  }

  .cars-toolbar-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-top-header {
    padding: 0.6rem 0;
  }
  .header-flex {
    gap: 0.5rem;
  }
  .brand-block {
    gap: 0.5rem;
  }
  .admin-logo {
    height: 32px;
  }
  .admin-badge {
    display: none;
  }
  .header-actions {
    gap: 0.4rem;
  }
  .header-actions .btn {
    padding: 0.4rem 0.65rem;
    font-size: 0.8rem;
  }
  .pane-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .pane-header h2 {
    font-size: 1.15rem;
  }
  .kpi-card {
    padding: 0.85rem;
    gap: 0.65rem;
  }
  .kpi-icon {
    width: 40px;
    height: 40px;
  }
  .kpi-label {
    font-size: 0.75rem;
  }
  .kpi-val {
    font-size: 1rem;
    font-weight: 800;
  }
  .quick-btns-row {
    flex-direction: column;
    gap: 0.6rem;
  }
  .quick-btns-row .btn {
    width: 100%;
  }

  .desktop-cars-table {
    display: none;
  }
  
  .mobile-cars-grid {
    display: flex;
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .kpi-card {
    padding: 1rem;
  }
  .kpi-val {
    font-size: 1.1rem;
  }
}
</style>
