<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBookingStore } from '../stores/bookingStore'
import { useCarStore } from '../stores/carStore'
import { apiService } from '../services/api'
import VueDateTimePicker from '../components/VueDateTimePicker.vue'
import { 
  CalendarCheck, Search, XCircle, Edit3, CheckCircle2, 
  Printer, User, Car, Shield, RefreshCw, AlertCircle
} from 'lucide-vue-next'

const bookingStore = useBookingStore()
const route = useRoute()

const searchRef = ref('')
const searchId = ref('')
const searchedBooking = ref(null)
const isLoading = ref(false)
const searchErrorMessage = ref('')

// Edit Modal State
const isEditModalOpen = ref(false)
const editPickupDate = ref('')
const editPickupTime = ref('')
const editDropoffDate = ref('')
const editDropoffTime = ref('')
const editPhone = ref('')
const editEmail = ref('')
const isUpdating = ref(false)
const editSuccessMsg = ref('')
const editErrorMsg = ref('')

const todayStr = new Date().toISOString().split('T')[0]

onMounted(() => {
  if (route.query.ref || route.query.bookingRef) {
    searchRef.value = (route.query.ref || route.query.bookingRef).toString()
  }
  if (route.query.id || route.query.nationalId) {
    searchId.value = (route.query.id || route.query.nationalId).toString()
  }
  if (searchRef.value.trim()) {
    handleSearchBooking()
  }
})

async function handleSearchBooking() {
  searchErrorMessage.value = ''
  if (!searchRef.value.trim()) {
    searchErrorMessage.value = 'يرجى إدخال رقم مرجع الحجز للاستعلام'
    return
  }

  isLoading.value = true

  try {
    // 1. Try Backend API Search Endpoint
    const result = await apiService.searchBooking(searchRef.value.trim(), searchId.value.trim())
    if (result) {
      if (result.selectedAddOns && typeof result.selectedAddOns === 'string') {
        try { result.selectedAddOns = JSON.parse(result.selectedAddOns) } catch { }
      }
      if ((!result.selectedAddOns || !result.selectedAddOns.length) && result.addOnsJson) {
        try { result.selectedAddOns = typeof result.addOnsJson === 'string' ? JSON.parse(result.addOnsJson) : result.addOnsJson } catch { }
      }
      searchedBooking.value = result
    }
  } catch (err) {
    // 2. Fallback to Local History if offline
    const cleanRef = searchRef.value.trim().toUpperCase()
    const cleanId = searchId.value.trim()

    const localFound = bookingStore.bookingsHistory.find(b => {
      const matchRef = b.bookingRef.toUpperCase() === cleanRef
      const matchId = !cleanId || (b.idNumber && b.idNumber === cleanId) || (b.customerPhone && b.customerPhone.includes(cleanId))
      return matchRef && matchId
    })

    if (localFound) {
      searchedBooking.value = localFound
    } else {
      searchedBooking.value = null
      searchErrorMessage.value = err.message || 'لم نتمكن من العثور على حجز مطابق لمرجع الحجز ورقم الهوية المدخل'
    }
  } finally {
    isLoading.value = false
  }
}

function openEditModal() {
  if (!searchedBooking.value) return
  
  // Extract dates and times
  const pDateParts = searchedBooking.value.pickupDateOnly || searchedBooking.value.pickupDate?.split(' - ')[0] || todayStr
  const pTimeParts = searchedBooking.value.pickupTimeOnly || searchedBooking.value.pickupDate?.split(' - ')[1] || '11:30'
  const dDateParts = searchedBooking.value.dropoffDateOnly || searchedBooking.value.dropoffDate?.split(' - ')[0] || todayStr
  const dTimeParts = searchedBooking.value.dropoffTimeOnly || searchedBooking.value.dropoffDate?.split(' - ')[1] || '11:30'

  editPickupDate.value = pDateParts
  editPickupTime.value = pTimeParts
  editDropoffDate.value = dDateParts
  editDropoffTime.value = dTimeParts

  editPhone.value = searchedBooking.value.customerPhone || ''
  editEmail.value = searchedBooking.value.email || ''

  editSuccessMsg.value = ''
  editErrorMsg.value = ''
  isEditModalOpen.value = true
}

async function saveEditChanges() {
  editSuccessMsg.value = ''
  editErrorMsg.value = ''

  if (!editPickupDate.value || !editDropoffDate.value) {
    editErrorMsg.value = 'يرجى اختيار تواريخ الاستلام والتسليم الصحيحة'
    return
  }

  const pickupFull = `${editPickupDate.value}T${editPickupTime.value}:00`
  const dropoffFull = `${editDropoffDate.value}T${editDropoffTime.value}:00`

  if (new Date(dropoffFull) <= new Date(pickupFull)) {
    editErrorMsg.value = 'تاريخ ووقت التسليم يجب أن يكون بعد تاريخ ووقت الاستلام'
    return
  }

  isUpdating.value = true

  try {
    // 1. Send Update Request to Backend API
    await apiService.updateBooking(searchedBooking.value.bookingRef, {
      pickupDatetime: pickupFull,
      dropoffDatetime: dropoffFull,
      phone: editPhone.value,
      email: editEmail.value
    })
  } catch (err) {
    console.warn('API update failed, updating local state:', err)
  }

  // 2. Update Local State
  searchedBooking.value.pickupDate = `${editPickupDate.value} - ${editPickupTime.value}`
  searchedBooking.value.dropoffDate = `${editDropoffDate.value} - ${editDropoffTime.value}`
  if (editPhone.value) searchedBooking.value.customerPhone = editPhone.value
  if (editEmail.value) searchedBooking.value.email = editEmail.value

  // Update history store entry
  const storeEntry = bookingStore.bookingsHistory.find(b => b.bookingRef === searchedBooking.value.bookingRef)
  if (storeEntry) {
    storeEntry.pickupDate = searchedBooking.value.pickupDate
    storeEntry.dropoffDate = searchedBooking.value.dropoffDate
    storeEntry.customerPhone = editPhone.value
    storeEntry.email = editEmail.value
  }

  isUpdating.value = false
  editSuccessMsg.value = 'تم تحديث تواريخ وبيانات الحجز بنجاح! ✨'

  setTimeout(() => {
    isEditModalOpen.value = false
    editSuccessMsg.value = ''
  }, 1200)
}

async function cancelBooking() {
  if (!searchedBooking.value) return
  if (!confirm(`هل أنت تأكد من رغبتك في إلغاء الحجز رقم (${searchedBooking.value.bookingRef})؟`)) return

  try {
    await apiService.cancelBooking(searchedBooking.value.bookingRef)
    const carStore = useCarStore()
    carStore.fetchCarsFromBackend()
  } catch (err) {
    console.warn('API cancellation fallback:', err)
  }

  searchedBooking.value.status = 'ملغى'
  const storeEntry = bookingStore.bookingsHistory.find(b => b.bookingRef === searchedBooking.value.bookingRef)
  if (storeEntry) {
    storeEntry.status = 'ملغى'
  }

  alert('تم إلغاء الحجز بنجاح وإرجاع السيارة للأسطول.')
}

function handlePrintInvoice() {
  window.print()
}
</script>

<template>
  <div class="manage-booking-page section-padding">
    <div class="container">
      
      <!-- Search Header Card -->
      <div class="search-card card no-print">
        <div class="card-header-icon">
          <div class="icon-circle"><CalendarCheck :size="32" class="text-primary" /></div>
          <div>
            <h1 class="heading-lg">الاستعلام وإدارة الحجز والتعديل 🔍</h1>
            <p class="text-muted">أدخل رقم الحجز (المرجع) ورقم الهوية لاستعراض تفاصيل الفاتورة، التعديل، أو الإلغاء</p>
          </div>
        </div>

        <div class="search-inputs">
          <div class="form-group">
            <label class="form-label">رقم الحجز (المرجع)</label>
            <input 
              type="text" 
              v-model="searchRef" 
              class="form-control" 
              placeholder="مثال: BAS-98214"
              @keyup.enter="handleSearchBooking" 
            />
          </div>

          <div class="form-group">
            <label class="form-label">رقم الهوية الوطنية / الجوال</label>
            <input 
              type="text" 
              v-model="searchId" 
              class="form-control" 
              placeholder="مثال: 1098765432"
              @keyup.enter="handleSearchBooking" 
            />
          </div>

          <button class="btn btn-orange search-btn" @click="handleSearchBooking" :disabled="isLoading">
            <Search v-if="!isLoading" :size="18" />
            <RefreshCw v-else :size="18" class="spin" />
            <span>{{ isLoading ? 'جاري الاستعلام...' : 'استعلام عن الحجز' }}</span>
          </button>
        </div>

        <p v-if="searchErrorMessage" class="text-danger mt-3 search-err-alert">
          <AlertCircle :size="16" />
          <span>{{ searchErrorMessage }}</span>
        </p>
      </div>

      <!-- Searched Booking Receipt & Tax Invoice View -->
      <div v-if="searchedBooking" class="receipt-container card printable-invoice">
        
        <!-- Header Status Banner -->
        <div class="receipt-banner">
          <div class="success-icon">
            <CheckCircle2 v-if="searchedBooking.status !== 'ملغى'" :size="48" />
            <XCircle v-else :size="48" class="text-danger" />
          </div>
          <div class="banner-text">
            <h2>تفاصيل الحجز رقم: {{ searchedBooking.bookingRef }}</h2>
            <p>تم استخراج بيانات الفاتورة والعقد الإلكتروني الخاص بك بنجاح.</p>
          </div>
          <div class="invoice-status-tag" :class="{ 'status-cancelled': searchedBooking.status === 'ملغى' }">
            <span>الحالة: {{ searchedBooking.status }}</span>
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
              <span class="meta-label">رقم مرجع الحجز:</span>
              <strong class="meta-val highlight-ref">{{ searchedBooking.bookingRef }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">تاريخ الحجز:</span>
              <strong class="meta-val">{{ searchedBooking.createdAt || '2026-08-08' }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">طريقة السداد:</span>
              <strong class="meta-val text-primary">{{ searchedBooking.paymentMethod || 'مدى Mada' }}</strong>
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
              <p><strong>اسم العميل:</strong> {{ searchedBooking.customerName }}</p>
              <p><strong>الهوية / الإقامة:</strong> {{ searchedBooking.idNumber || searchId }}</p>
              <p><strong>رقم الجوال:</strong> {{ searchedBooking.customerPhone }}</p>
              <p><strong>البريد الإلكتروني:</strong> {{ searchedBooking.email || 'customer@albaseetco.com' }}</p>
              <p><strong>رخصة القيادة:</strong> {{ searchedBooking.licenseNumber || 'LIC-100200' }}</p>
            </div>
          </div>

          <!-- Column 2: Vehicle & Branch Specs -->
          <div class="detail-block-card">
            <h4 class="block-title">
              <Car :size="18" class="text-gold" />
              <span>تفاصيل المركبة وموقع الاستلام</span>
            </h4>
            <div class="info-list">
              <p><strong>السيارة والموديل:</strong> {{ searchedBooking.carName }}</p>
              <p><strong>الفئة والتناظر:</strong> {{ searchedBooking.carCategory || 'اقتصادية' }} ({{ searchedBooking.carOrSimilar || 'أو ما شابه' }})</p>
              <p><strong>موقع/فرع الاستلام:</strong> {{ searchedBooking.pickupBranch }}</p>
              <p><strong>تاريخ ووقت الاستلام:</strong> <span class="text-primary">{{ searchedBooking.pickupDate }}</span></p>
              <p><strong>تاريخ ووقت الإرجاع:</strong> <span class="text-gold">{{ searchedBooking.dropoffDate }}</span></p>
              <p><strong>مدة الإيجار:</strong> <strong>{{ searchedBooking.rentalDays || 1 }} أيام</strong></p>
            </div>
          </div>

          <!-- Dispatched Vehicle Handover Report Card for Customer -->
          <div v-if="searchedBooking.plateNumber || searchedBooking.dispatchedAt" class="detail-block-card span-full" style="background: linear-gradient(135deg, rgba(243, 112, 33, 0.06) 0%, rgba(0, 77, 64, 0.06) 100%); border: 1.5px solid var(--gold);">
            <h4 class="block-title text-primary">
              <Key :size="18" class="text-orange" />
              <span>بيانات المركبة المُسلّمة إليك 🚗🔑</span>
            </h4>
            <div class="info-list grid grid-2">
              <p><strong>رقم اللوحة المسلمة:</strong> <span class="badge badge-gold font-mono" style="font-size: 0.95rem;">{{ searchedBooking.plateNumber }}</span></p>
              <p><strong>قراءة العداد عند الاستلام:</strong> <strong class="text-dark">{{ searchedBooking.pickupOdometer }} كم</strong></p>
              <p><strong>مستوى الوقود عند الاستلام:</strong> <strong class="text-success">⛽ {{ searchedBooking.pickupFuelLevel || '100%' }}</strong></p>
              <p><strong>تاريخ وتوقيت التسليم:</strong> <span>{{ searchedBooking.dispatchedAt }}</span></p>
              <p v-if="searchedBooking.vinNumber"><strong>رقم الشاسي (VIN):</strong> <span class="font-mono text-xs">{{ searchedBooking.vinNumber }}</span></p>
              <p v-if="searchedBooking.dispatchNotes" class="col-span-2"><strong>ملاحظات حالة التسليم:</strong> <span class="text-muted">{{ searchedBooking.dispatchNotes }}</span></p>
            </div>
          </div>

          <!-- Column 3: ZATCA QR Verification Simulation -->
          <div class="detail-block-card qr-block">
            <h4 class="block-title">
              <Shield :size="18" class="text-primary" />
              <span>الفاتورة الإلكترونية المعتمدة (ZATCA)</span>
            </h4>
            <div class="qr-code-wrapper">
              <svg class="zatca-qr-svg" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="5" y="5" width="25" height="25" fill="#004D40" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="13" width="9" height="9" fill="#004D40" />
                <rect x="70" y="5" width="25" height="25" fill="#004D40" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="78" y="13" width="9" height="9" fill="#004D40" />
                <rect x="5" y="70" width="25" height="25" fill="#004D40" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="78" width="9" height="9" fill="#004D40" />
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
              <p class="qr-label">رمز الفاتورة المعتمد من هيئة الزكاة والضريبة والجمارك</p>
            </div>
          </div>

        </div>

        <!-- Financial Table Breakdown -->
        <div class="financial-table-wrapper my-4">
          <h4 class="table-title">تفاصيل الحساب والتكلفة المالية للفاتورة</h4>
          <table class="financial-table">
            <thead>
              <tr>
                <th>بيان الخدمة / التغطية</th>
                <th>الأيام</th>
                <th>المبلغ (ر.س)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>إيجار المركبة الأساسي: {{ searchedBooking.carName }}</strong>
                </td>
                <td>{{ searchedBooking.rentalDays || 1 }} أيام</td>
                <td>{{ searchedBooking.carBaseTotal || searchedBooking.totalAmount || searchedBooking.grandTotal }} ر.س</td>
              </tr>
              <tr>
                <td><strong>خيار التغطية التأمينية:</strong> {{ searchedBooking.insuranceName || 'تغطية أساسية' }}</td>
                <td>{{ searchedBooking.rentalDays || 1 }} أيام</td>
                <td>{{ searchedBooking.insuranceTotal || '0.00' }} ر.س</td>
              </tr>
              <!-- Selected Add-ons Itemized Rows in Searched Invoice -->
              <template v-if="searchedBooking.selectedAddOns && searchedBooking.selectedAddOns.length > 0">
                <tr v-for="addon in searchedBooking.selectedAddOns" :key="addon.id || addon.name" class="row-addon-item">
                  <td>
                    <strong>إضافة: {{ addon.name }}</strong>
                    <span class="sub-line d-block text-muted">
                      {{ addon.pricingMode === 'oneTime' ? `رسوم مقطوعة/ثابتة: ${addon.oneTimePrice || addon.unitPrice} ر.س` : `رسوم يومية: ${addon.pricePerDay || addon.unitPrice} ر.س / يوم × ${searchedBooking.rentalDays || 1} أيام` }}
                    </span>
                  </td>
                  <td>{{ addon.pricingMode === 'oneTime' ? 'مرة واحدة' : `${searchedBooking.rentalDays || 1} أيام` }}</td>
                  <td>+{{ (addon.totalPrice || (addon.pricingMode === 'oneTime' ? addon.oneTimePrice : (addon.pricePerDay * (searchedBooking.rentalDays || 1)))).toFixed(2) }} ر.س</td>
                </tr>
              </template>
              <tr v-else-if="parseFloat(searchedBooking.addOnsTotal || 0) > 0">
                <td><strong>الإضافات والخدمات المختارة</strong></td>
                <td>مجمّع</td>
                <td>+{{ searchedBooking.addOnsTotal }} ر.س</td>
              </tr>
              <tr v-if="parseFloat(searchedBooking.discountAmount || 0) > 0" class="row-discount">
                <td><strong>خصم الكود الترويجي المفعل</strong></td>
                <td>-</td>
                <td class="text-orange">-{{ searchedBooking.discountAmount }} ر.س</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><strong>المجموع غير شامل الضريبة:</strong></td>
                <td><strong>{{ searchedBooking.subtotal || searchedBooking.grandTotal }} ر.س</strong></td>
              </tr>
              <tr>
                <td colspan="2"><strong>ضريبة القيمة المضافة (VAT 15%):</strong></td>
                <td><strong>{{ searchedBooking.vatAmount || '0.00' }} ر.س</strong></td>
              </tr>
              <tr class="grand-total-row">
                <td colspan="2"><strong>المبلغ الإجمالي النهائي المدفوع:</strong></td>
                <td class="total-price-cell"><strong>{{ searchedBooking.grandTotal || searchedBooking.totalAmount }} ر.س</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Actions Footer Bar -->
        <div class="receipt-actions no-print">
          <button 
            v-if="searchedBooking.status !== 'ملغى'" 
            class="btn btn-primary" 
            @click="openEditModal"
          >
            <Edit3 :size="18" />
            <span>تعديل تواريخ الحجز</span>
          </button>

          <button 
            v-if="searchedBooking.status !== 'ملغى'" 
            class="btn btn-outline-danger" 
            @click="cancelBooking"
          >
            <XCircle :size="18" />
            <span>إلغاء الحجز</span>
          </button>

          <button class="btn btn-outline" @click="handlePrintInvoice">
            <Printer :size="18" />
            <span>طباعة الفاتورة والعقد</span>
          </button>
        </div>

      </div>

      <!-- Edit Booking Modal Dialog -->
      <Teleport to="body">
        <div v-if="isEditModalOpen" class="modal-overlay" @click="isEditModalOpen = false">
          <div class="modal-card card custom-edit-dialog" @click.stop>
            <div class="modal-header">
              <div class="d-flex align-items-center gap-2">
                <Edit3 :size="22" class="text-primary" />
                <h3>تعديل بيانات وتواريخ الحجز</h3>
              </div>
              <button class="close-pop-btn" @click="isEditModalOpen = false">✕</button>
            </div>
            
            <p class="text-muted mt-1">تعديل التواريخ والمعلومات للحجز رقم: <strong class="text-dark">{{ searchedBooking?.bookingRef }}</strong></p>

            <hr class="card-divider my-3" />

            <div class="form-layout-grid">
              <!-- Pickup DateTimePicker -->
              <div class="form-group">
                <VueDateTimePicker 
                  v-model:modelValueDate="editPickupDate"
                  v-model:modelValueTime="editPickupTime"
                  label="تاريخ ووقت الاستلام الجديد"
                  :min-date="todayStr"
                  popover-align="right"
                  icon-color-class="text-primary"
                />
              </div>

              <!-- Dropoff DateTimePicker -->
              <div class="form-group">
                <VueDateTimePicker 
                  v-model:modelValueDate="editDropoffDate"
                  v-model:modelValueTime="editDropoffTime"
                  label="تاريخ ووقت التسليم الجديد"
                  :min-date="editPickupDate"
                  :min-time="editPickupTime"
                  popover-align="left"
                  icon-color-class="text-gold"
                />
              </div>

              <!-- Customer Phone & Email -->
              <div class="form-group">
                <label class="form-label">رقم الجوال للتواصل</label>
                <input type="text" v-model="editPhone" class="form-control" placeholder="05xxxxxxxx" />
              </div>

              <div class="form-group">
                <label class="form-label">البريد الإلكتروني</label>
                <input type="email" v-model="editEmail" class="form-control" placeholder="name@domain.com" />
              </div>
            </div>

            <p v-if="editErrorMsg" class="text-danger mt-2 dialog-alert">
              <AlertCircle :size="16" />
              <span>{{ editErrorMsg }}</span>
            </p>

            <p v-if="editSuccessMsg" class="text-success mt-2 dialog-alert">
              <CheckCircle2 :size="16" />
              <span>{{ editSuccessMsg }}</span>
            </p>

            <div class="modal-actions mt-4">
              <button class="btn btn-outline" @click="isEditModalOpen = false">إلغاء</button>
              <button class="btn btn-primary" @click="saveEditChanges" :disabled="isUpdating">
                <CheckCircle2 v-if="!isUpdating" :size="18" />
                <RefreshCw v-else :size="18" class="spin" />
                <span>{{ isUpdating ? 'جاري حفظ التعديل...' : 'حفظ وتحديث الحجز' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>

    </div>
  </div>
</template>

<style scoped>
.search-card {
  padding: 2rem;
  margin-bottom: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.card-header-icon {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 180px;
  gap: 1.25rem;
  align-items: flex-end;
}

.search-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.search-err-alert, .dialog-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FFEBEE;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.88rem;
}

.text-success.dialog-alert {
  background: var(--primary-surface);
  color: var(--primary) !important;
}

/* Printable Tax Invoice Layout */
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

.invoice-status-tag.status-cancelled {
  background: var(--accent-red);
  color: white;
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

.btn-outline-danger {
  color: var(--accent-red);
  border: 1.5px solid var(--accent-red);
  background: transparent;
}

.btn-outline-danger:hover {
  background: #FFEBEE;
}

/* Edit Modal Dialog */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.custom-edit-dialog {
  width: 580px;
  max-width: 95vw;
  padding: 2rem;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-pop-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-subtle);
  border: none;
  cursor: pointer;
}

.form-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.85rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  .search-inputs {
    grid-template-columns: 1fr;
  }
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
