import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'

export const useBookingStore = defineStore('booking', () => {
  // Rental configuration
  const rentalMode = ref('daily') // 'daily', 'weekly', 'monthly'
  const serviceType = ref('pickup') // 'pickup', 'delivery'
  
  // Locations
  const pickupCity = ref('jeddah')
  const pickupBranchId = ref(1) // Default: محطة قطار السليمانية
  const deliveryAddress = ref('حي الروضة، طريق المدينة المنورة، جدة')
  
  const sameDropoffBranch = ref(true)
  const dropoffCity = ref('jeddah')
  const dropoffBranchId = ref(1)

  // Dates & Times (Defaults: tomorrow 11:30 to day after 11:30)
  const today = new Date()
  const defaultPickupDate = new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0]
  const defaultDropoffDate = new Date(today.setDate(today.getDate() + 2)).toISOString().split('T')[0]
  
  const pickupDate = ref(defaultPickupDate)
  const pickupTime = ref('11:30')
  const dropoffDate = ref(defaultDropoffDate)
  const dropoffTime = ref('11:30')

  // Calculated duration (in days)
  const rentalDays = computed(() => {
    if (!pickupDate.value || !dropoffDate.value) return 1
    const p = new Date(pickupDate.value)
    const d = new Date(dropoffDate.value)
    const diffTime = d.getTime() - p.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (rentalMode.value === 'weekly' && diffDays < 7) return 7
    if (rentalMode.value === 'monthly' && diffDays < 30) return 30
    return diffDays > 0 ? diffDays : 1
  })

  // Selected Car
  const selectedCar = ref(null)

  // Wizard Step (1: Choose Car, 2: Extras, 3: Details, 4: Payment)
  const currentStep = ref(1)

  // Protection & Insurance
  const insuranceOptions = ref([
    { id: 'basic', name: 'تغطية مجانية أساسية من الولاء', pricePerDay: 0, desc: 'تغطية ضد الحوادث مع نسبة تحمل استقطاع نظامي' },
    { id: 'full', name: 'أمان المطارات والتغطية الشاملة', pricePerDay: 35, desc: 'تغطية شاملة للمركبة والإعفاء التام من نسبة التحمل' },
    { id: 'shield', name: 'درع البسيط التام (شامل + زجاج وإطارات)', pricePerDay: 60, desc: 'حماية كاملة 100% تشمل الأضرار الناتجة عن الحصى والزجاج' }
  ])
  const selectedInsurance = ref('basic')

  // Add-ons
  const addOns = ref({
    openKm: { enabled: false, pricePerDay: 50, label: 'كيلومتر مفتوح (كيلومترات لا محدوة)' },
    babySeat: { enabled: false, pricePerDay: 15, label: 'مقعد أطفال آمن' },
    extraDriver: { enabled: false, pricePerDay: 35, label: 'إضافة سائق إضافي معتمد' },
    airportDelivery: { enabled: false, pricePerDay: 0, oneTimePrice: 40, label: 'خدمة التوصيل والاستلام السريع' }
  })

  // Promo Code
  const promoCode = ref('')
  const appliedDiscount = ref(0) // Discount percentage
  const promoSuccessMessage = ref('')
  const promoErrorMessage = ref('')

  async function applyPromoCode() {
    promoSuccessMessage.value = ''
    promoErrorMessage.value = ''
    const code = promoCode.value.trim().toUpperCase()

    try {
      const res = await apiService.validatePromoCode(code)
      if (res && res.discountPercentage) {
        appliedDiscount.value = res.discountPercentage
        promoSuccessMessage.value = `تم تطبيق كود الخصم ${res.code} بنجاح!`
        return
      }
    } catch (err) {
      console.log('Falling back to local promo validation.')
    }

    if (code === 'BASEET15') {
      appliedDiscount.value = 0.15
      promoSuccessMessage.value = 'تم تطبيق خصم البسيط 15% بنجاح!'
    } else if (code === 'KEY2026') {
      appliedDiscount.value = 0.20
      promoSuccessMessage.value = 'تم تطبيق خصم Key الترويجي 20% بنجاح!'
    } else if (code.length > 0) {
      promoErrorMessage.value = 'كود الخصم غير صحيح أو منتهي الصلاحية'
    }
  }

  // Customer Details & ID Quick Lookup
  const customerIdQuery = ref('')
  const customerFound = ref(false)

  const customerForm = ref({
    title: 'السيد',
    firstName: '',
    lastName: '',
    idType: 'بطاقة هوية وطنية',
    idNumber: '',
    phone: '',
    email: '',
    licenseNumber: '',
    acceptTerms: true
  })

  async function searchCustomerById() {
    const q = customerIdQuery.value.trim()
    if (!q) return

    try {
      const found = await apiService.lookupCustomer(q)
      if (found) {
        customerForm.value.firstName = found.firstName
        customerForm.value.lastName = found.lastName
        customerForm.value.phone = found.phone
        customerForm.value.email = found.email
        customerForm.value.licenseNumber = found.licenseNumber
        customerForm.value.idNumber = found.nationalId
        customerForm.value.idType = found.idType || 'بطاقة هوية وطنية'
        customerFound.value = true
        return
      }
    } catch (err) {
      console.log('Customer not found in backend, falling back to local simulation.')
    }

    if (q === '1098765432') {
      customerForm.value.firstName = 'سعد'
      customerForm.value.lastName = 'العتيبي'
      customerForm.value.phone = '0501234567'
      customerForm.value.email = 'saad@albaseetco.com'
      customerForm.value.licenseNumber = 'LIC-998877'
      customerForm.value.idNumber = '1098765432'
      customerFound.value = true
    } else {
      customerFound.value = false
      alert('لم يتم العثور على بيانات مسبقة برقم الهوية هذا. يرجى إكمال النموذج للتسجيل.')
    }
  }

  // Date Validation & Auto Adjustments
  const dateValidationError = ref('')
  const bookingErrorMessage = ref('')

  function validateBookingDates() {
    dateValidationError.value = ''
    const todayStr = new Date().toISOString().split('T')[0]

    if (pickupDate.value < todayStr) {
      dateValidationError.value = 'تاريخ الاستلام لا يمكن أن يكون في الماضي (قبل اليوم الحالي).'
      pickupDate.value = todayStr
      return false
    }

    const pickupDt = new Date(`${pickupDate.value}T${pickupTime.value || '11:30'}:00`)
    const dropoffDt = new Date(`${dropoffDate.value}T${dropoffTime.value || '11:30'}:00`)

    if (dropoffDt <= pickupDt) {
      dateValidationError.value = 'تاريخ ووقت التسليم والإرجاع يجب أن يكون دائماً بعد تاريخ ووقت الاستلام.'
      
      const nextDay = new Date(pickupDt.getTime() + 24 * 60 * 60 * 1000)
      dropoffDate.value = nextDay.toISOString().split('T')[0]
      return false
    }

    return true
  }

  // Financial Calculations
  const carTotalBeforeDiscount = computed(() => {
    if (!selectedCar.value) return 0
    let rate = selectedCar.value.dailyRate
    
    if (rentalMode.value === 'weekly') {
      rate *= (1 - (selectedCar.value.weeklyDiscount || 0.1))
    } else if (rentalMode.value === 'monthly') {
      rate *= (1 - (selectedCar.value.monthlyDiscount || 0.25))
    }
    
    return rate * rentalDays.value
  })

  const insuranceTotal = computed(() => {
    const opt = insuranceOptions.value.find(i => i.id === selectedInsurance.value)
    return (opt ? opt.pricePerDay : 0) * rentalDays.value
  })

  const addOnsTotal = computed(() => {
    let sum = 0
    if (addOns.value.openKm.enabled) sum += addOns.value.openKm.pricePerDay * rentalDays.value
    if (addOns.value.babySeat.enabled) sum += addOns.value.babySeat.pricePerDay * rentalDays.value
    if (addOns.value.extraDriver.enabled) sum += addOns.value.extraDriver.pricePerDay * rentalDays.value
    if (addOns.value.airportDelivery.enabled) sum += addOns.value.airportDelivery.oneTimePrice
    return sum
  })

  const discountAmount = computed(() => {
    return carTotalBeforeDiscount.value * appliedDiscount.value
  })

  const subtotal = computed(() => {
    return (carTotalBeforeDiscount.value - discountAmount.value) + insuranceTotal.value + addOnsTotal.value
  })

  const vatAmount = computed(() => {
    return subtotal.value * 0.15 // 15% KSA VAT
  })

  const grandTotal = computed(() => {
    return subtotal.value + vatAmount.value
  })

  const pointsEarned = computed(() => {
    return Math.floor(grandTotal.value * 2)
  })

  const selectedPaymentMethod = ref('mada') // 'mada', 'card', 'tabby', 'tamara'

  const bookingsHistory = ref([
    {
      bookingRef: 'BAS-98214',
      status: 'مؤكد',
      carName: 'سوزوكي ديزاير 2025',
      pickupBranch: 'محطة قطار السليمانية - جدة',
      pickupDate: '2026-08-10 11:30',
      dropoffDate: '2026-08-13 11:30',
      customerName: 'سعد العتيبي',
      customerPhone: '0501234567',
      totalAmount: 489.15,
      createdAt: '2026-08-05'
    }
  ])

  const activeConfirmedBooking = ref(null)

  async function confirmBooking() {
    bookingErrorMessage.value = ''

    // 1. Customer Details Validation
    const form = customerForm.value
    if (!form.idNumber || form.idNumber.trim().length < 10) {
      bookingErrorMessage.value = 'يرجى إدخال رقم الهوية الوطنية أو الإقامة بشكل صحيح (10 أرقام)'
      return null
    }
    if (!form.firstName || !form.firstName.trim() || !form.lastName || !form.lastName.trim()) {
      bookingErrorMessage.value = 'يرجى إدخال الاسم الأول واسم العائلة بالكامل'
      return null
    }
    if (!form.phone || form.phone.trim().length < 9) {
      bookingErrorMessage.value = 'يرجى إدخال رقم الجوال بشكل صحيح (مثال: 0501234567)'
      return null
    }
    if (!form.email || !form.email.includes('@')) {
      bookingErrorMessage.value = 'يرجى إدخال بريد إلكتروني صحيح'
      return null
    }

    // 2. Dates & Times Validation
    if (!validateBookingDates()) {
      bookingErrorMessage.value = dateValidationError.value || 'يرجى التأكد من صحة تواريخ وساعات الإيجار'
      return null
    }

    // 3. Selected Car Stock & Availability Check
    if (!selectedCar.value) {
      bookingErrorMessage.value = 'يرجى اختيار سيارة من الأسطول لإتمام الحجز'
      return null
    }

    const currentStock = selectedCar.value.availableCount !== undefined 
      ? selectedCar.value.availableCount 
      : (selectedCar.value.availableStock !== undefined ? selectedCar.value.availableStock : 1)

    if (currentStock <= 0 || selectedCar.value.isActive === false) {
      bookingErrorMessage.value = 'عذراً، هذه السيارة غير متوفرة حالياً بالأسطول (محجوزة بالكامل)'
      return null
    }

    let refCode = 'BAS-' + Math.floor(10000 + Math.random() * 90000)

    try {
      const payload = {
        nationalId: form.idNumber.trim(),
        title: form.title || 'السيد',
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        licenseNumber: form.licenseNumber || 'LIC-100200',
        carId: selectedCar.value.id,
        rentalMode: rentalMode.value === 'monthly' ? 3 : rentalMode.value === 'weekly' ? 2 : 1,
        serviceType: serviceType.value === 'delivery' ? 2 : 1,
        pickupBranchId: pickupBranchId.value,
        dropoffBranchId: sameDropoffBranch.value ? pickupBranchId.value : dropoffBranchId.value,
        deliveryAddress: serviceType.value === 'delivery' ? deliveryAddress.value : null,
        pickupDatetime: new Date(`${pickupDate.value}T${pickupTime.value}:00`).toISOString(),
        dropoffDatetime: new Date(`${dropoffDate.value}T${dropoffTime.value}:00`).toISOString(),
        insuranceCode: selectedInsurance.value,
        promoCode: promoCode.value || null,
        paymentMethod: selectedPaymentMethod.value === 'visa' ? 2 : selectedPaymentMethod.value === 'tabby' ? 3 : selectedPaymentMethod.value === 'tamara' ? 4 : 1
      }

      const apiBooking = await apiService.createBooking(payload)

      if (apiBooking && apiBooking.bookingRef) {
        refCode = apiBooking.bookingRef
      }

      // Deduct available stock live
      if (selectedCar.value.availableCount !== undefined) {
        selectedCar.value.availableCount = Math.max(0, selectedCar.value.availableCount - 1)
      }
      if (selectedCar.value.availableStock !== undefined) {
        selectedCar.value.availableStock = Math.max(0, selectedCar.value.availableStock - 1)
      }
    } catch (err) {
      console.error('API createBooking Error:', err)
      const errDetail = err.response?.data?.message || err.message || 'حدث خطأ في معالجة الحجز بـ API'
      bookingErrorMessage.value = errDetail
      return null
    }

    const newBooking = {
      bookingRef: refCode,
      status: 'مؤكد ومدفوع',
      carName: selectedCar.value ? selectedCar.value.name : 'سيارة مختارة',
      carImage: selectedCar.value ? selectedCar.value.image : '',
      carCategory: selectedCar.value ? selectedCar.value.category : 'اقتصادية',
      carOrSimilar: selectedCar.value ? selectedCar.value.orSimilar : 'أو ما شابه ذلك',
      pickupBranch: serviceType.value === 'delivery' ? `توصيل إلى: ${deliveryAddress.value}` : 'محطة قطار السليمانية - جدة',
      dropoffBranch: sameDropoffBranch.value ? (serviceType.value === 'delivery' ? `توصيل إلى: ${deliveryAddress.value}` : 'محطة قطار السليمانية - جدة') : 'الفرع المحدد',
      pickupDate: `${pickupDate.value} - ${pickupTime.value}`,
      dropoffDate: `${dropoffDate.value} - ${dropoffTime.value}`,
      customerName: `${form.firstName} ${form.lastName}`,
      customerPhone: form.phone,
      idNumber: form.idNumber,
      email: form.email,
      licenseNumber: form.licenseNumber || 'LIC-100200',
      paymentMethod: selectedPaymentMethod.value === 'mada' ? 'مدى Mada' : selectedPaymentMethod.value === 'tabby' ? 'تابي Tabby (4 دفعات)' : selectedPaymentMethod.value === 'tamara' ? 'تمارا Tamara' : 'بطاقة ائتمان Visa/MasterCard',
      rentalDays: rentalDays.value,
      carBaseTotal: carTotalBeforeDiscount.value.toFixed(2),
      insuranceName: insuranceOptions.value.find(i => i.id === selectedInsurance.value)?.name || 'تغطية أساسية',
      insuranceTotal: insuranceTotal.value.toFixed(2),
      addOnsTotal: addOnsTotal.value.toFixed(2),
      discountAmount: discountAmount.value.toFixed(2),
      subtotal: subtotal.value.toFixed(2),
      vatAmount: vatAmount.value.toFixed(2),
      grandTotal: grandTotal.value.toFixed(2),
      pointsEarned: pointsEarned.value,
      createdAt: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }

    bookingsHistory.value.unshift(newBooking)
    activeConfirmedBooking.value = newBooking
    return newBooking
  }

  function resetBooking() {
    currentStep.value = 1
    selectedCar.value = null
    appliedDiscount.value = 0
    promoCode.value = ''
    bookingErrorMessage.value = ''
    dateValidationError.value = ''
    activeConfirmedBooking.value = null
  }

  return {
    rentalMode,
    serviceType,
    pickupCity,
    pickupBranchId,
    deliveryAddress,
    sameDropoffBranch,
    dropoffCity,
    dropoffBranchId,
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    rentalDays,
    selectedCar,
    currentStep,
    insuranceOptions,
    selectedInsurance,
    addOns,
    promoCode,
    appliedDiscount,
    promoSuccessMessage,
    promoErrorMessage,
    applyPromoCode,
    customerIdQuery,
    customerFound,
    customerForm,
    searchCustomerById,
    carTotalBeforeDiscount,
    insuranceTotal,
    addOnsTotal,
    discountAmount,
    subtotal,
    vatAmount,
    grandTotal,
    pointsEarned,
    selectedPaymentMethod,
    bookingsHistory,
    dateValidationError,
    bookingErrorMessage,
    validateBookingDates,
    confirmBooking,
    resetBooking
  }
})
