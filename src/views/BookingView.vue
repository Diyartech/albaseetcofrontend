<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBookingStore } from '../stores/bookingStore'
import { useCarStore } from '../stores/carStore'
import { useBranchStore } from '../stores/branchStore'
import CarCard from '../components/CarCard.vue'
import SearchWidget from '../components/SearchWidget.vue'
import { 
  Car, Shield, User, CreditCard, CheckCircle2, ChevronLeft, 
  ChevronRight, Search, Check, AlertCircle, Printer, Download,
  Sparkles, Calendar, MapPin, Tag, RefreshCw, Edit3, ArrowUpDown
} from 'lucide-vue-next'

const bookingStore = useBookingStore()
const carStore = useCarStore()
const branchStore = useBranchStore()
const router = useRouter()
const route = useRoute()

// Open SearchWidget edit options drawer by default on entering booking page from Fleet
const showEditSearchModal = ref(true)

onMounted(() => {
  if (route.query.edit === 'true' || route.query.fromFleet === 'true' || true) {
    showEditSearchModal.value = true
    if (bookingStore.selectedCar && bookingStore.currentStep === 1) {
      bookingStore.currentStep = 2
    }
  }
})

// Payment Form Mock Data
const cardForm = ref({
  cardNumber: '4111 2222 3333 4444',
  holderName: 'SAAD AL-OTIBI',
  expiry: '08/28',
  cvv: '123'
})

const isProcessingPayment = ref(false)
const bookingSuccessAlert = ref('')

async function submitPayment() {
  bookingSuccessAlert.value = ''
  isProcessingPayment.value = true
  
  try {
    const res = await bookingStore.confirmBooking()
    if (res && res.bookingRef) {
      bookingSuccessAlert.value = `تم تأكيد حجزك وحفظه بنجاح! رقم المرجع: ${res.bookingRef}`
      
      setTimeout(() => {
        router.push({
          path: '/manage-booking',
          query: {
            ref: res.bookingRef,
            id: res.idNumber || bookingStore.customerForm.idNumber || ''
          }
        })
      }, 1200)
    }
  } catch (err) {
    console.error('Payment confirmation error:', err)
  } finally {
    isProcessingPayment.value = false
  }
}

function handlePrint() {
  window.print()
}

function startNewBooking() {
  bookingStore.resetBooking()
  router.push('/')
}

const currentPickupBranchName = computed(() => {
  if (bookingStore.serviceType === 'delivery') {
    return bookingStore.deliveryAddress
  }
  const b = branchStore.branches.find(br => br.id === bookingStore.pickupBranchId)
  return b ? `${b.name} (${b.cityName})` : 'جدة - محطة السليمانية'
})
</script>

<template>
  <div class="booking-page section-padding">
    <div class="container">
      
      <!-- Top Sticky Search Summary Bar (طريقة الحجز المستوردة من Key.sa) -->
      <div class="search-summary-top-bar card">
        <div class="summary-info">
          <div class="info-pill mode-pill">
            <span class="pill-label">نوع الإيجار:</span>
            <strong>{{ bookingStore.rentalMode === 'daily' ? 'يومي' : bookingStore.rentalMode === 'weekly' ? 'أسبوعي' : 'شهري (فليكس)' }}</strong>
          </div>

          <div class="info-pill">
            <MapPin :size="16" class="text-primary" />
            <span class="pill-label">الاستلام:</span>
            <strong>{{ currentPickupBranchName }}</strong>
          </div>

          <div class="info-pill">
            <Calendar :size="16" class="text-gold" />
            <span class="pill-label">المدة:</span>
            <strong>{{ bookingStore.pickupDate }} إلى {{ bookingStore.dropoffDate }} ({{ bookingStore.rentalDays }} أيام)</strong>
          </div>
        </div>

        <button class="btn btn-outline-primary btn-sm edit-search-btn" @click="showEditSearchModal = !showEditSearchModal">
          <Edit3 :size="16" />
          <span>{{ showEditSearchModal ? 'إخلاق التعديل' : 'تعديل البحث' }}</span>
        </button>
      </div>

      <!-- Collapsible Quick Search Box -->
      <div v-if="showEditSearchModal" class="collapsible-search-box mb-4">
        <SearchWidget />
      </div>

      <!-- Key.sa 3-Step Wizard Progress Indicator Bar -->
      <div class="stepper-bar card mb-4">
        <div 
          class="step-item" 
          :class="{ active: bookingStore.currentStep === 1, completed: bookingStore.currentStep > 1 }"
          @click="bookingStore.currentStep = 1"
        >
          <div class="step-num">01</div>
          <div class="step-label">اختر السيارة</div>
        </div>

        <div class="step-divider"></div>

        <div 
          class="step-item" 
          :class="{ active: bookingStore.currentStep === 2, completed: bookingStore.currentStep > 2 }"
          @click="bookingStore.selectedCar && (bookingStore.currentStep = 2)"
        >
          <div class="step-num">02</div>
          <div class="step-label">السعر والإضافات</div>
        </div>

        <div class="step-divider"></div>

        <div 
          class="step-item" 
          :class="{ active: bookingStore.currentStep === 3, completed: bookingStore.activeConfirmedBooking }"
        >
          <div class="step-num">03</div>
          <div class="step-label">الدفع والتأكيد</div>
        </div>
      </div>

      <!-- ===================================================================
           STEP 1: SELECT CAR (01 اختر السيارة - مطابق لموقع Key.sa)
           =================================================================== -->
      <div v-if="bookingStore.currentStep === 1" class="step-content">
        
        <!-- Filter Bar Pills & Sorting Header -->
        <div class="filter-header-bar card">
          <div class="category-pills">
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

          <div class="filter-controls">
            <label class="checkbox-label toggle-avail">
              <input type="checkbox" v-model="carStore.availableOnly" />
              <span>إظهار السيارات المتوفرة فقط</span>
            </label>

            <div class="sort-select-wrapper">
              <ArrowUpDown :size="16" class="text-primary" />
              <select v-model="carStore.sortBy" class="form-control form-select filter-select">
                <option value="price_asc">ترتيب بالسعر: الأرخص أولاً</option>
                <option value="price_desc">ترتيب بالسعر: الأعلى أولاً</option>
                <option value="year_desc">الأحدث موديل</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Car Inventory Grid -->
        <div class="cars-grid">
          <CarCard 
            v-for="car in carStore.filteredCars" 
            :key="car.id" 
            :car="car"
            :is-selected="bookingStore.selectedCar?.id === car.id"
            @select="bookingStore.selectedCar = car; bookingStore.currentStep = 2"
          />
        </div>
      </div>

      <!-- ===================================================================
           STEP 2: PRICE & EXTRAS (02 السعر والإضافات - مطابق لموقع Key.sa)
           =================================================================== -->
      <div v-else-if="bookingStore.currentStep === 2" class="step-content wizard-layout">
        <div class="main-wizard-col">
          <!-- Car Selected Preview Banner -->
          <div class="car-summary-banner card">
            <img :src="bookingStore.selectedCar.image" :alt="bookingStore.selectedCar.name" class="banner-car-img" />
            <div class="banner-car-info">
              <span class="badge badge-gold">{{ bookingStore.selectedCar.category }}</span>
              <h2 class="car-title">{{ bookingStore.selectedCar.name }}</h2>
              <p class="car-sub">{{ bookingStore.selectedCar.orSimilar }}</p>
              <div class="specs-mini">
                <span>👥 {{ bookingStore.selectedCar.passengers }} ركاب</span>
                <span>⚙️ {{ bookingStore.selectedCar.transmission }}</span>
                <span>🧳 {{ bookingStore.selectedCar.luggage }} حقائب</span>
              </div>
            </div>
            <button class="btn btn-outline btn-sm change-car-btn" @click="bookingStore.currentStep = 1">
              تغيير السيارة
            </button>
          </div>

          <!-- Protection Coverage Options (خيارات تغطية التأمين) -->
          <div class="section-box card">
            <h3 class="section-title">
              <Shield :size="20" class="text-primary" />
              <span>خيارات التغطية التأمينية لمشوارك 🛡️</span>
            </h3>

            <div class="insurance-options-list">
              <label 
                v-for="opt in bookingStore.activeInsuranceOptions" 
                :key="opt.id" 
                class="insurance-card"
                :class="{ active: bookingStore.selectedInsurance === opt.id }"
              >
                <input 
                  type="radio" 
                  name="insurance" 
                  :value="opt.id" 
                  v-model="bookingStore.selectedInsurance" 
                />
                <div class="insurance-content">
                  <div class="ins-header">
                    <div class="d-flex align-items-center gap-2">
                      <h4>{{ opt.name }}</h4>
                      <span v-if="opt.badge" class="badge badge-gold text-xs">{{ opt.badge }}</span>
                    </div>
                    <strong class="ins-price">
                      {{ opt.pricePerDay === 0 ? 'مجاناً' : `+${opt.pricePerDay} ر.س / يوم` }}
                    </strong>
                  </div>
                  <p class="ins-desc">{{ opt.desc }}</p>
                  <div v-if="opt.deductibleAmount !== undefined" class="text-xs text-muted mt-1">
                    مبلغ التحمل عند الحادث: <strong>{{ opt.deductibleAmount === 0 ? '0 ر.س (إعفاء تام)' : `${opt.deductibleAmount} ر.س` }}</strong>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Add-ons Selection (الإضافات والخدمات المتاحة) -->
          <div class="section-box card">
            <h3 class="section-title">
              <Sparkles :size="20" class="text-gold" />
              <span>الإضافات والخدمات المتاحة 🧰</span>
            </h3>

            <div class="add-ons-list">
              <label 
                v-for="item in bookingStore.activeAddOnsList" 
                :key="item.id" 
                class="addon-item card" 
                :class="{ active: item.selected }"
              >
                <input 
                  type="checkbox" 
                  v-model="item.selected" 
                />
                <div class="addon-info">
                  <h4>{{ item.name }}</h4>
                  <p>{{ item.desc }}</p>
                </div>
                <strong class="addon-price">
                  {{ item.pricingMode === 'oneTime' ? `+${item.oneTimePrice} ر.س (رسوم ثابتة)` : `+${item.pricePerDay} ر.س / يوم` }}
                </strong>
              </label>
            </div>
          </div>

          <!-- Wizard Action Buttons -->
          <div class="wizard-actions">
            <button class="btn btn-outline" @click="bookingStore.currentStep = 1">
              <ChevronRight :size="18" />
              <span>الرجوع لاختيار السيارة</span>
            </button>
            <button class="btn btn-orange btn-lg" @click="bookingStore.currentStep = 3">
              <span>متابعة لتأكيد الحجز والدفع</span>
              <ChevronLeft :size="18" />
            </button>
          </div>
        </div>

        <!-- Sticky Price Summary Sidebar -->
        <aside class="sidebar-col card">
          <h3 class="sidebar-title">تفاصيل وسعر الحجز</h3>
          
          <div class="summary-details">
            <div class="sum-row">
              <span>مدة الإيجار:</span>
              <strong>{{ bookingStore.rentalDays }} أيام</strong>
            </div>

            <div class="sum-row">
              <span>قيمة إيجار المركبة الأساسية:</span>
              <span>{{ bookingStore.carTotalBeforeDiscount.toFixed(2) }} ر.س</span>
            </div>

            <div v-if="bookingStore.insuranceTotal > 0" class="sum-row">
              <span>قيمة التغطية التأمينية:</span>
              <span>+{{ bookingStore.insuranceTotal.toFixed(2) }} ر.س</span>
            </div>

            <div v-if="bookingStore.addOnsTotal > 0" class="sum-row">
              <span>قيمة الإضافات المختارة:</span>
              <span>+{{ bookingStore.addOnsTotal.toFixed(2) }} ر.س</span>
            </div>

            <div v-if="bookingStore.appliedDiscount > 0" class="sum-row discount-row">
              <span>خصم الكود الترويجي:</span>
              <span class="text-orange">-{{ bookingStore.discountAmount.toFixed(2) }} ر.س</span>
            </div>

            <hr class="card-divider" />

            <div class="sum-row vat-row">
              <span>ضريبة القيمة المضافة (15%):</span>
              <span>{{ bookingStore.vatAmount.toFixed(2) }} ر.س</span>
            </div>

            <div class="sum-row total-row">
              <span>المبلغ الإجمالي النهائي:</span>
              <strong class="grand-total">{{ bookingStore.grandTotal.toFixed(2) }} ر.س</strong>
            </div>
          </div>
        </aside>
      </div>

      <!-- ===================================================================
           STEP 3: PAYMENT & CUSTOMER DETAILS (03 الدفع والتأكيد - مطابق لموقع Key.sa)
           =================================================================== -->
      <div v-else-if="bookingStore.currentStep === 3" class="step-content">
        
        <!-- Confirmed Printable Receipt Screen -->
        <!-- Confirmed Printable Official Tax Invoice Screen (الفاتورة الإلكترونية المعتمدة وعقد الحجز) -->
        <div v-if="bookingStore.activeConfirmedBooking" class="receipt-container card printable-invoice">
          
          <!-- Top Banner Status -->
          <div class="receipt-banner">
            <div class="success-icon"><CheckCircle2 :size="48" /></div>
            <div class="banner-text">
              <h2>تم تأكيد حجزك بنجاح وسداد الفاتورة! 🎉</h2>
              <p>شكراً لاختيارك شركة البسيط لتأجير السيارات. تم إصدار العقد وإرسال النسخة الرقمية إلى بريدك الإلكتروني.</p>
            </div>
            <div class="invoice-status-tag">
              <span>الحالة: مؤكد ومدفوع ✅</span>
            </div>
          </div>

          <!-- Official Company Tax Header -->
          <div class="invoice-header-area">
            <div class="brand-company-info">
              <h3 class="company-name">شركة البسيط لتأجير السيارات 🚗</h3>
              <p class="tax-reg">الرقم الضريبي (VAT Reg No): <strong>310987654300003</strong></p>
              <p class="company-address">المملكة العربية السعودية - الرياض / جدة</p>
            </div>

            <div class="invoice-meta-info">
              <div class="meta-item">
                <span class="meta-label">رقم مرجع الحجز (Booking Ref):</span>
                <strong class="meta-val highlight-ref">{{ bookingStore.activeConfirmedBooking.bookingRef }}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-label">تاريخ وقت الإصدار:</span>
                <strong class="meta-val">{{ bookingStore.activeConfirmedBooking.createdAt }}</strong>
              </div>
              <div class="meta-item">
                <span class="meta-label">طريقة السداد:</span>
                <strong class="meta-val text-primary">{{ bookingStore.activeConfirmedBooking.paymentMethod }}</strong>
              </div>
            </div>
          </div>

          <hr class="card-divider" />

          <!-- Invoice Details 3-Column Grid -->
          <div class="invoice-details-grid">
            
            <!-- Column 1: Customer Details -->
            <div class="detail-block-card">
              <h4 class="block-title">
                <User :size="18" class="text-primary" />
                <span>بيانات المستأجر الرئيسي</span>
              </h4>
              <div class="info-list">
                <p><strong>اسم العميل:</strong> {{ bookingStore.activeConfirmedBooking.customerName }}</p>
                <p><strong>الهوية / الإقامة:</strong> {{ bookingStore.activeConfirmedBooking.idNumber }}</p>
                <p><strong>رقم الجوال:</strong> {{ bookingStore.activeConfirmedBooking.customerPhone }}</p>
                <p><strong>البريد الإلكتروني:</strong> {{ bookingStore.activeConfirmedBooking.email || 'customer@albaseetco.com' }}</p>
                <p><strong>رخصة القيادة:</strong> {{ bookingStore.activeConfirmedBooking.licenseNumber || 'LIC-100200' }}</p>
              </div>
            </div>

            <!-- Column 2: Vehicle & Branch Specs -->
            <div class="detail-block-card">
              <h4 class="block-title">
                <Car :size="18" class="text-gold" />
                <span>تفاصيل المركبة وموقع الاستلام</span>
              </h4>
              <div class="info-list">
                <p><strong>السيارة والموديل:</strong> {{ bookingStore.activeConfirmedBooking.carName }}</p>
                <p><strong>الفئة والتناظر:</strong> {{ bookingStore.activeConfirmedBooking.carCategory }} ({{ bookingStore.activeConfirmedBooking.carOrSimilar }})</p>
                <p><strong>موقع/فرع الاستلام:</strong> {{ bookingStore.activeConfirmedBooking.pickupBranch }}</p>
                <p><strong>تاريخ ووقت الاستلام:</strong> <span class="text-primary">{{ bookingStore.activeConfirmedBooking.pickupDate }}</span></p>
                <p><strong>تاريخ ووقت الإرجاع:</strong> <span class="text-gold">{{ bookingStore.activeConfirmedBooking.dropoffDate }}</span></p>
                <p><strong>مدة الإيجار الإجمالية:</strong> <strong>{{ bookingStore.activeConfirmedBooking.rentalDays }} أيام</strong></p>
              </div>
            </div>

            <!-- Column 3: ZATCA QR Verification Simulation -->
            <div class="detail-block-card qr-block">
              <h4 class="block-title">
                <Shield :size="18" class="text-primary" />
                <span>الفاتورة الإلكترونية المعتمدة (ZATCA)</span>
              </h4>
              <div class="qr-code-wrapper">
                <!-- Simulated ZATCA SVG QR Code -->
                <svg class="zatca-qr-svg" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#ffffff" />
                  <!-- QR Corner Anchors -->
                  <rect x="5" y="5" width="25" height="25" fill="#004D40" />
                  <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                  <rect x="13" y="13" width="9" height="9" fill="#004D40" />
                  <rect x="70" y="5" width="25" height="25" fill="#004D40" />
                  <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                  <rect x="78" y="13" width="9" height="9" fill="#004D40" />
                  <rect x="5" y="70" width="25" height="25" fill="#004D40" />
                  <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                  <rect x="13" y="78" width="9" height="9" fill="#004D40" />
                  <!-- Random Data Dots -->
                  <rect x="35" y="10" width="8" height="8" fill="#004D40" />
                  <rect x="50" y="15" width="8" height="8" fill="#D4AF37" />
                  <rect x="35" y="30" width="12" height="8" fill="#004D40" />
                  <rect x="55" y="35" width="10" height="10" fill="#004D40" />
                  <rect x="70" y="45" width="15" height="8" fill="#D4AF37" />
                  <rect x="40" y="55" width="18" height="8" fill="#004D40" />
                  <rect x="65" y="60" width="8" height="15" fill="#004D40" />
                  <rect x="35" y="75" width="15" height="15" fill="#004D40" />
                  <rect x="60" y="80" width="25" height="10" fill="#004D40" />
                </svg>
                <p class="qr-label">رمز الفاتورة الإلكترونية المعتمد من هيئة الزكاة والضريبة والجمارك</p>
              </div>
            </div>

          </div>

          <!-- Itemized Tax Invoice Financial Breakdown Table -->
          <div class="financial-table-wrapper my-4">
            <h4 class="table-title">تفاصيل الحساب والتكلفة المالية للفاتورة</h4>
            <table class="financial-table">
              <thead>
                <tr>
                  <th>بيان الخدمة / التغطية</th>
                  <th>الكمية / الأيام</th>
                  <th>المبلغ الخاضع للضريبة (ر.س)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>إيجار المركبة الأساسي: {{ bookingStore.activeConfirmedBooking.carName }}</strong>
                    <span class="sub-line d-block text-muted">فئة {{ bookingStore.activeConfirmedBooking.carCategory }}</span>
                  </td>
                  <td>{{ bookingStore.activeConfirmedBooking.rentalDays }} أيام</td>
                  <td>{{ bookingStore.activeConfirmedBooking.carBaseTotal }} ر.س</td>
                </tr>

                <tr>
                  <td>
                    <strong>خيار التغطية التأمينية:</strong>
                    <span class="sub-line d-block text-muted">{{ bookingStore.activeConfirmedBooking.insuranceName }}</span>
                  </td>
                  <td>{{ bookingStore.activeConfirmedBooking.rentalDays }} أيام</td>
                  <td>{{ bookingStore.activeConfirmedBooking.insuranceTotal > 0 ? `+${bookingStore.activeConfirmedBooking.insuranceTotal} ر.س` : 'مجاناً 0.00 ر.س' }}</td>
                </tr>

                <tr v-if="parseFloat(bookingStore.activeConfirmedBooking.addOnsTotal) > 0">
                  <td><strong>الإضافات والخدمات المختارة</strong></td>
                  <td>مجمّع</td>
                  <td>+{{ bookingStore.activeConfirmedBooking.addOnsTotal }} ر.س</td>
                </tr>

                <tr v-if="parseFloat(bookingStore.activeConfirmedBooking.discountAmount) > 0" class="row-discount">
                  <td><strong>خصم الكود الترويجي المفعل</strong></td>
                  <td>-</td>
                  <td class="text-orange">-{{ bookingStore.activeConfirmedBooking.discountAmount }} ر.س</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2"><strong>المجموع غير شامل الضريبة (Subtotal):</strong></td>
                  <td><strong>{{ bookingStore.activeConfirmedBooking.subtotal }} ر.س</strong></td>
                </tr>
                <tr>
                  <td colspan="2"><strong>ضريبة القيمة المضافة (VAT 15%):</strong></td>
                  <td><strong>{{ bookingStore.activeConfirmedBooking.vatAmount }} ر.س</strong></td>
                </tr>
                <tr class="grand-total-row">
                  <td colspan="2"><strong>المبلغ الإجمالي النهائي المدفوع (Grand Total):</strong></td>
                  <td class="total-price-cell"><strong>{{ bookingStore.activeConfirmedBooking.grandTotal }} ر.س</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Actions Footer -->
          <div class="receipt-actions no-print">
            <button class="btn btn-outline" @click="handlePrint">
              <Printer :size="18" />
              <span>طباعة العقد والفاتورة</span>
            </button>
            <button class="btn btn-primary" @click="router.push('/manage-booking')">
              <CheckCircle2 :size="18" />
              <span>إدارة الحجوزات</span>
            </button>
            <button class="btn btn-orange" @click="startNewBooking">
              <RefreshCw :size="18" />
              <span>إجراء حجز جديد</span>
            </button>
          </div>

        </div>

        <!-- Customer Form & Payment Step Layout -->
        <div v-else class="wizard-layout">
          <div class="main-wizard-col">
            
            <!-- Quick ID Search Box (استرجع معلوماتك لتتمكن من الدفع بشكل أسرع - مطابق لـ Key) -->
            <div class="section-box card lookup-box">
              <div class="lookup-header">
                <User :size="22" class="text-primary" />
                <div>
                  <h3>استرجع معلوماتك لتتمكن من الدفع بشكل أسرع</h3>
                  <p class="text-muted">أدخل رقم الهوية/الإقامة لاستدعاء بياناتك المسجلة سابقاً</p>
                </div>
              </div>

              <div class="lookup-input-group">
                <input 
                  type="text" 
                  v-model="bookingStore.customerIdQuery" 
                  class="form-control" 
                  placeholder="رقم الهوية الوطنية أو الإقامة (مثال: 1098765432)"
                />
                <button class="btn btn-primary" @click="bookingStore.searchCustomerById">
                  <Search :size="16" />
                  <span>استرجاع البيانات</span>
                </button>
              </div>
            </div>

            <!-- Customer Personal Details Form -->
            <div class="section-box card">
              <h3 class="section-title">
                <User :size="20" class="text-primary" />
                <span>بيانات المستأجر الرئيسي</span>
              </h3>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">اللقب *</label>
                  <select v-model="bookingStore.customerForm.title" class="form-control form-select">
                    <option value="السيد">السيد</option>
                    <option value="السيدة">السيدة</option>
                    <option value="الآنسة">الآنسة</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">الاسم الأول *</label>
                  <input type="text" v-model="bookingStore.customerForm.firstName" class="form-control" placeholder="الاسم الأول" />
                </div>

                <div class="form-group">
                  <label class="form-label">اللقب / العائلة *</label>
                  <input type="text" v-model="bookingStore.customerForm.lastName" class="form-control" placeholder="اسم العائلة" />
                </div>

                <div class="form-group">
                  <label class="form-label">نوع الهوية *</label>
                  <select v-model="bookingStore.customerForm.idType" class="form-control form-select">
                    <option value="بطاقة هوية وطنية">بطاقة هوية وطنية</option>
                    <option value="إقامة مقيم">إقامة مقيم</option>
                    <option value="جواز سفر">جواز سفر زائر</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">رقم الهوية / الإقامة *</label>
                  <input type="text" v-model="bookingStore.customerForm.idNumber" class="form-control" placeholder="رقم الهوية" />
                </div>

                <div class="form-group">
                  <label class="form-label">رقم الجوال *</label>
                  <input type="text" v-model="bookingStore.customerForm.phone" class="form-control" placeholder="05xxxxxxxx" />
                </div>

                <div class="form-group">
                  <label class="form-label">البريد الإلكتروني *</label>
                  <input type="email" v-model="bookingStore.customerForm.email" class="form-control" placeholder="name@domain.com" />
                </div>

                <div class="form-group">
                  <label class="form-label">رقم رخصة القيادة *</label>
                  <input type="text" v-model="bookingStore.customerForm.licenseNumber" class="form-control" placeholder="رقم الرخصة" />
                </div>
              </div>
            </div>

            <!-- Promo Code Input (الرمز الترويجي) -->
            <div class="section-box card">
              <h3 class="section-title">
                <Tag :size="20" class="text-orange" />
                <span>الرمز الترويجي (كود الخصم)</span>
              </h3>

              <div class="promo-input-group">
                <input 
                  type="text" 
                  v-model="bookingStore.promoCode" 
                  class="form-control" 
                  placeholder="أدخل الرمز الترويجي (مثال: BASEET15 أو KEY2026)" 
                />
                <button class="btn btn-orange" @click="bookingStore.applyPromoCode">
                  <span>تطبيق الخصم</span>
                </button>
              </div>

              <p v-if="bookingStore.promoSuccessMessage" class="text-success mt-2">{{ bookingStore.promoSuccessMessage }}</p>
              <p v-if="bookingStore.promoErrorMessage" class="text-danger mt-2">{{ bookingStore.promoErrorMessage }}</p>
            </div>

            <!-- Payment Methods Grid (إضافة مدى، فيزا، تابي وتمارا - مطابق لدليل المفتاح والبسيط) -->
            <div class="section-box card">
              <h3 class="section-title">
                <CreditCard :size="20" class="text-primary" />
                <span>اختيار طريقة الدفع</span>
              </h3>

              <div class="payment-methods-grid">
                <button 
                  class="pay-method-card"
                  :class="{ active: bookingStore.selectedPaymentMethod === 'mada' }"
                  @click="bookingStore.selectedPaymentMethod = 'mada'"
                >
                  <span class="pay-logo mada">مدى mada</span>
                  <span>بطاقة مدى</span>
                </button>

                <button 
                  class="pay-method-card"
                  :class="{ active: bookingStore.selectedPaymentMethod === 'card' }"
                  @click="bookingStore.selectedPaymentMethod = 'card'"
                >
                  <span class="pay-logo visa">VISA / MasterCard</span>
                  <span>بطاقة ائتمان</span>
                </button>

                <button 
                  class="pay-method-card"
                  :class="{ active: bookingStore.selectedPaymentMethod === 'tabby' }"
                  @click="bookingStore.selectedPaymentMethod = 'tabby'"
                >
                  <span class="pay-logo tabby">تابي tabby</span>
                  <span>قسّمها على 4 دفعات</span>
                </button>

                <button 
                  class="pay-method-card"
                  :class="{ active: bookingStore.selectedPaymentMethod === 'tamara' }"
                  @click="bookingStore.selectedPaymentMethod = 'tamara'"
                >
                  <span class="pay-logo tamara">تمارا tamara</span>
                  <span>ادفع على 4 أجزاء</span>
                </button>
              </div>

              <!-- Card Inputs if Mada or Visa selected -->
              <div v-if="['mada', 'card'].includes(bookingStore.selectedPaymentMethod)" class="card-inputs-box">
                <div class="form-group">
                  <label class="form-label">رقم البطاقة</label>
                  <input type="text" v-model="cardForm.cardNumber" class="form-control" />
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">اسم حامل البطاقة</label>
                    <input type="text" v-model="cardForm.holderName" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">تاريخ الانتهاء</label>
                    <input type="text" v-model="cardForm.expiry" class="form-control" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">رمز التحقق (CVV)</label>
                    <input type="text" v-model="cardForm.cvv" class="form-control" />
                  </div>
                </div>
              </div>

              <!-- BNPL info if Tabby or Tamara selected -->
              <div v-else class="bnpl-info-box card">
                <h4>قسّم فاتورتك على 4 دفعات بقيمة <strong>{{ (bookingStore.grandTotal / 4).toFixed(2) }} ر.س</strong> / شهر</h4>
                <p class="text-muted">بدون أي فوائد أو رسوم خفية، متوافق مع أحكام الشريعة الإسلامية.</p>
              </div>

              <!-- Validation Error Alert Message -->
              <div v-if="bookingStore.bookingErrorMessage" class="alert-error-box my-3">
                <AlertCircle :size="20" />
                <span>{{ bookingStore.bookingErrorMessage }}</span>
              </div>

              <button 
                class="btn btn-orange btn-lg pay-now-btn mt-3" 
                :disabled="isProcessingPayment"
                @click="submitPayment"
              >
                <span v-if="!isProcessingPayment" class="btn-flex-content">
                  <CheckCircle2 :size="20" />
                  <span>تأكيد الحجز والدفع الآن ({{ bookingStore.grandTotal.toFixed(2) }} ر.س)</span>
                </span>
                <span v-else class="btn-flex-content">
                  <RefreshCw :size="20" class="spin-icon" />
                  <span>جاري تأكيد حجزك وحفظ البيانات في السجل...</span>
                </span>
              </button>

              <div v-if="bookingSuccessAlert" class="alert-success-banner my-3">
                <CheckCircle2 :size="22" />
                <span>{{ bookingSuccessAlert }} - جاري توجيهك لشاشة تفاصيل الحجز الآن...</span>
              </div>
            </div>

            <!-- Back to Extras Button -->
            <div class="wizard-actions">
              <button class="btn btn-outline" @click="bookingStore.currentStep = 2">
                <ChevronRight :size="18" />
                <span>الرجوع للإضافات</span>
              </button>
            </div>
          </div>

          <!-- Sticky Sidebar Order Summary -->
          <aside class="sidebar-col card">
            <h3 class="sidebar-title">ملخص النهائي للحجز</h3>
            <div class="summary-details">
              <div class="sum-row">
                <span>السيارة المختارة:</span>
                <strong>{{ bookingStore.selectedCar?.name }}</strong>
              </div>
              <div class="sum-row">
                <span>مدة الإيجار:</span>
                <strong>{{ bookingStore.rentalDays }} أيام</strong>
              </div>
              <div class="sum-row discount-row" v-if="bookingStore.appliedDiscount > 0">
                <span>خصم الكود الترويجي:</span>
                <span class="text-orange">-{{ bookingStore.discountAmount.toFixed(2) }} ر.س</span>
              </div>
              <div class="sum-row total-row">
                <span>المبلغ المطلوب:</span>
                <strong class="grand-total">{{ bookingStore.grandTotal.toFixed(2) }} ر.س</strong>
              </div>
            </div>
          </aside>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.search-summary-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #071C18 0%, #004D40 100%);
  color: var(--text-white);
  border-radius: var(--radius-lg);
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.info-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
}

.pill-label {
  color: var(--text-light);
}

.mode-pill {
  background: var(--gold);
  color: var(--primary-deep);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.edit-search-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.edit-search-btn:hover {
  background: var(--gold);
  color: var(--primary-deep);
}

.stepper-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-radius: var(--radius-xl);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  opacity: 0.5;
  transition: var(--transition);
}

.step-item.active {
  opacity: 1;
}

.step-item.active .step-num {
  background: var(--orange);
  color: white;
  box-shadow: var(--shadow-orange);
}

.step-item.completed .step-num {
  background: var(--primary);
  color: white;
}

.step-num {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--bg-subtle);
  color: var(--text-dark);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-label {
  font-weight: 800;
  font-size: 1rem;
}

.step-divider {
  flex: 1;
  height: 2px;
  background: var(--border-light);
  margin: 0 1.5rem;
}

.filter-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.category-pills {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
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

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.filter-select {
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
}

.cars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.wizard-layout {
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 1.75rem;
}

.section-box {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
}

.car-summary-banner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.75rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #F8FAF9 0%, #EDF2F0 100%);
}

.banner-car-img {
  width: 140px;
  height: 80px;
  object-fit: contain;
}

.banner-car-info {
  flex: 1;
}

.specs-mini {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
}

.insurance-options-list, .add-ons-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.insurance-card, .addon-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-light);
  cursor: pointer;
  transition: var(--transition);
}

.insurance-card.active, .addon-item.active {
  border-color: var(--primary);
  background: var(--primary-surface);
}

.ins-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.3rem;
}

.ins-price, .addon-price {
  color: var(--primary);
  font-weight: 800;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.sidebar-col {
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 90px;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light);
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sum-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.total-row {
  font-size: 1.1rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 2px solid var(--border-light);
}

.grand-total {
  color: var(--orange-hover);
  font-size: 1.4rem;
}

.lookup-box {
  background: var(--primary-surface);
  border: 1px solid var(--primary-light);
}

.lookup-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.lookup-input-group, .promo-input-group {
  display: flex;
  gap: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.pay-method-card {
  padding: 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.85rem;
  transition: var(--transition);
}

.pay-method-card.active {
  border-color: var(--orange);
  background: var(--orange-light);
}

.pay-logo {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 900;
}

.card-inputs-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.pay-now-btn {
  width: 100%;
}

.receipt-container {
  padding: 3rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.success-icon {
  color: var(--accent-green);
  margin-bottom: 1rem;
}

.booking-ref-badge {
  font-size: 1.2rem;
  background: var(--primary-surface);
  color: var(--primary);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  display: inline-block;
  margin: 1rem 0;
}

.receipt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--bg-main);
  border-radius: var(--radius-lg);
}

.receipt-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.alert-error-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #FFEBEE;
  color: #C62828;
  border: 1px solid #FFCDD2;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.95rem;
}

@media (max-width: 1024px) {
  .cars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .wizard-layout {
    grid-template-columns: 1fr;
  }
  .sidebar-col {
    position: static;
  }
}

@media (max-width: 768px) {
  .search-summary-top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 1rem;
  }
  .summary-info {
    gap: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
  }
  .stepper-bar {
    padding: 0.85rem 1rem;
    justify-content: space-around;
  }
  .step-label {
    font-size: 0.8rem;
  }
  .step-num {
    width: 34px;
    height: 34px;
    font-size: 0.85rem;
  }
  .step-divider {
    display: none;
  }
  .car-summary-banner {
    flex-direction: column;
    text-align: center;
  }
  .banner-car-img {
    width: 100%;
    max-width: 180px;
    height: auto;
  }
  .specs-mini {
    justify-content: center;
    flex-wrap: wrap;
  }
  .cars-grid {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .payment-methods-grid {
    grid-template-columns: 1fr 1fr;
  }
  .lookup-input-group, .promo-input-group {
    flex-direction: column;
  }
}

.printable-invoice {
  padding: 2rem;
  border-radius: var(--radius-xl);
  box-shadow: 0 15px 45px rgba(0, 77, 64, 0.1);
  background: var(--bg-card);
}

.receipt-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: linear-gradient(135deg, #071C18 0%, #004D40 100%);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.75rem;
}

.receipt-banner h2 {
  font-size: 1.3rem;
  font-weight: 800;
}

.invoice-status-tag {
  margin-right: auto;
  background: var(--gold);
  color: var(--primary-deep);
  padding: 0.4rem 1rem;
  border-radius: var(--radius-full);
  font-weight: 800;
  font-size: 0.85rem;
  white-space: nowrap;
}

.invoice-header-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.company-name {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--primary);
}

.tax-reg {
  font-size: 0.9rem;
  color: var(--text-dark);
}

.invoice-meta-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: var(--bg-subtle);
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  font-size: 0.88rem;
}

.highlight-ref {
  color: var(--orange-hover);
  font-size: 1rem;
}

.invoice-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.detail-block-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.85rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light);
}

.info-list p {
  margin-bottom: 0.45rem;
  font-size: 0.88rem;
}

.qr-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.zatca-qr-svg {
  width: 110px;
  height: 110px;
  border: 4px solid var(--primary);
  border-radius: var(--radius-sm);
}

.qr-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.2;
}

.financial-table-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 1.25rem;
}

.table-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--primary);
}

.financial-table {
  width: 100%;
  border-collapse: collapse;
}

.financial-table th, .financial-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.9rem;
}

.financial-table th {
  background: var(--bg-subtle);
  font-weight: 800;
  color: var(--text-dark);
  text-align: right;
}

.financial-table tfoot tr td {
  border-bottom: none;
  font-size: 0.95rem;
}

.grand-total-row {
  background: var(--primary-surface);
  font-size: 1.2rem !important;
}

.total-price-cell {
  color: var(--orange-hover);
  font-size: 1.3rem !important;
}

.receipt-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-flex-content {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: center;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.alert-success-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--primary-surface);
  color: var(--primary);
  border: 1.5px solid var(--primary);
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 800;
  font-size: 0.95rem;
  box-shadow: var(--shadow-sm);
}

@media print {
  body * {
    visibility: hidden;
  }
  .printable-invoice, .printable-invoice * {
    visibility: visible;
  }
  .printable-invoice {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    box-shadow: none;
    border: none;
  }
  .no-print {
    display: none !important;
  }
}

@media (max-width: 1024px) {
  .invoice-details-grid {
    grid-template-columns: 1fr;
  }
  .invoice-header-area {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .receipt-banner {
    flex-direction: column;
    text-align: center;
  }
  .invoice-status-tag {
    margin-right: 0;
  }
  .receipt-actions {
    flex-direction: column;
  }
}
</style>
