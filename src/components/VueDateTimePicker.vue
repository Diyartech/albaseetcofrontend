<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Calendar, Clock, ChevronRight, ChevronLeft, Check, X } from 'lucide-vue-next'

const props = defineProps({
  modelValueDate: {
    type: String,
    required: true // 'YYYY-MM-DD'
  },
  modelValueTime: {
    type: String,
    default: '11:30' // 'HH:mm'
  },
  label: {
    type: String,
    default: 'اختر التاريخ والوقت'
  },
  minDate: {
    type: String,
    default: '' // 'YYYY-MM-DD'
  },
  minTime: {
    type: String,
    default: '' // 'HH:mm' if same min date
  },
  iconColorClass: {
    type: String,
    default: 'text-primary'
  },
  popoverAlign: {
    type: String,
    default: 'right' // 'right' or 'left'
  }
})

const emit = defineEmits(['update:modelValueDate', 'update:modelValueTime', 'change'])

const isOpen = ref(false)
const popoverRef = ref(null)
const popoverStyle = ref({})

// Calendar Navigation State
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth()) // 0-11

const monthNames = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

const weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

// Dynamic Floating Position for Teleported Popover
function updatePosition() {
  if (!popoverRef.value || !isOpen.value) return
  const rect = popoverRef.value.getBoundingClientRect()
  const isMobile = window.innerWidth <= 640

  if (isMobile) {
    popoverStyle.value = {}
    return
  }

  let top = rect.bottom + 8
  let right = window.innerWidth - rect.right
  let left = rect.left

  // If opening below goes off screen bottom, adjust top
  if (top + 460 > window.innerHeight && rect.top > 460) {
    top = Math.max(10, rect.top - 460)
  }

  if (props.popoverAlign === 'left') {
    popoverStyle.value = {
      position: 'fixed',
      top: `${Math.max(10, top)}px`,
      left: `${Math.max(10, left)}px`,
      right: 'auto',
      zIndex: 999999
    }
  } else {
    popoverStyle.value = {
      position: 'fixed',
      top: `${Math.max(10, top)}px`,
      right: `${Math.max(10, right)}px`,
      left: 'auto',
      zIndex: 999999
    }
  }
}

function openPicker() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    syncCalendarMonth()
    nextTick(() => {
      updatePosition()
    })
  }
}

// Predefined 30-min time slots
const timeSlots = computed(() => {
  const slots = []
  for (let h = 0; h < 24; h++) {
    for (let m of ['00', '30']) {
      const hh = h.toString().padStart(2, '0')
      const timeStr = `${hh}:${m}`
      
      const period = h >= 12 ? 'مساءً' : 'صباحاً'
      const h12 = h % 12 === 0 ? 12 : h % 12
      const label = `${h12}:${m} ${period}`
      
      let isDisabled = false
      if (props.minDate && props.modelValueDate === props.minDate && props.minTime) {
        if (timeStr <= props.minTime) {
          isDisabled = true
        }
      }

      slots.push({ value: timeStr, label, isDisabled })
    }
  }
  return slots
})

function syncCalendarMonth() {
  if (props.modelValueDate) {
    const d = new Date(props.modelValueDate + 'T00:00:00')
    if (!isNaN(d.getTime())) {
      currentYear.value = d.getFullYear()
      currentMonth.value = d.getMonth()
    }
  }
}

onMounted(() => {
  syncCalendarMonth()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

function handleClickOutside(event) {
  if (!isOpen.value) return
  const popoverEl = document.querySelector('.teleported-popover')
  if (popoverRef.value && popoverRef.value.contains(event.target)) return
  if (popoverEl && popoverEl.contains(event.target)) return
  isOpen.value = false
}

// Generate Day Cells for the active Calendar Month
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  
  const todayStr = new Date().toISOString().split('T')[0]
  const effectiveMinDate = props.minDate || todayStr

  const days = []

  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ dayNum: '', isBlank: true })
  }

  for (let d = 1; d <= totalDays; d++) {
    const mm = (month + 1).toString().padStart(2, '0')
    const dd = d.toString().padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`

    const isToday = dateStr === todayStr
    const isSelected = dateStr === props.modelValueDate
    const isDisabled = effectiveMinDate ? dateStr < effectiveMinDate : false

    days.push({
      dateStr,
      dayNum: d,
      isBlank: false,
      isToday,
      isSelected,
      isDisabled
    })
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectDay(day) {
  if (day.isBlank || day.isDisabled) return
  emit('update:modelValueDate', day.dateStr)
  emit('change')

  if (props.minDate && day.dateStr === props.minDate && props.minTime) {
    if (props.modelValueTime <= props.minTime) {
      const validSlot = timeSlots.value.find(s => !s.isDisabled)
      if (validSlot) {
        emit('update:modelValueTime', validSlot.value)
      }
    }
  }
}

function selectTime(timeVal, isDisabled) {
  if (isDisabled) return
  emit('update:modelValueTime', timeVal)
  emit('change')
}

const formattedDisplay = computed(() => {
  if (!props.modelValueDate) return 'اختر التاريخ'
  const d = new Date(props.modelValueDate + 'T00:00:00')
  if (isNaN(d.getTime())) return props.modelValueDate

  const dayName = weekDays[d.getDay()]
  const dayNum = d.getDate()
  const monthName = monthNames[d.getMonth()]
  const year = d.getFullYear()

  const timeSlot = timeSlots.value.find(s => s.value === props.modelValueTime)
  const timeFormatted = timeSlot ? timeSlot.label : props.modelValueTime

  return `${dayName}، ${dayNum} ${monthName} ${year} - ${timeFormatted}`
})
</script>

<template>
  <div class="datetime-picker-wrapper" ref="popoverRef">
    <!-- Trigger Input Box -->
    <div 
      class="picker-trigger-card" 
      :class="{ active: isOpen }"
      @click="openPicker"
    >
      <div class="trigger-icon-area">
        <Calendar :size="18" :class="iconColorClass" />
      </div>
      <div class="trigger-text-area">
        <span class="picker-label">{{ label }}</span>
        <strong class="picker-value" :title="formattedDisplay">{{ formattedDisplay }}</strong>
      </div>
      <Clock :size="16" class="text-muted clock-icon" />
    </div>

    <!-- Teleport Popover Modal + Backdrop Overlay directly to Body -->
    <Teleport to="body">
      <div v-if="isOpen" class="calendar-backdrop-overlay" @click="isOpen = false"></div>

      <Transition name="fade-slide">
        <div 
          v-if="isOpen" 
          class="calendar-popover card teleported-popover"
          :style="popoverStyle"
          @click.stop
        >
          <div class="popover-header">
            <h4>تقويم حجز البسيط 📅</h4>
            <button class="close-pop-btn" @click="isOpen = false"><X :size="16" /></button>
          </div>

          <div class="popover-body">
            <!-- Calendar Month Section -->
            <div class="calendar-section">
              <div class="month-header">
                <button class="nav-month-btn" @click="prevMonth"><ChevronRight :size="18" /></button>
                <strong class="month-title">{{ monthNames[currentMonth] }} {{ currentYear }}</strong>
                <button class="nav-month-btn" @click="nextMonth"><ChevronLeft :size="18" /></button>
              </div>

              <!-- Days of Week Header -->
              <div class="weekdays-grid">
                <span v-for="wd in weekDays" :key="wd" class="wd-cell">{{ wd }}</span>
              </div>

              <!-- Calendar Days Grid -->
              <div class="days-grid">
                <button
                  v-for="(day, idx) in calendarDays"
                  :key="idx"
                  class="day-cell"
                  :class="{
                    blank: day.isBlank,
                    today: day.isToday,
                    selected: day.isSelected,
                    disabled: day.isDisabled
                  }"
                  :disabled="day.isBlank || day.isDisabled"
                  @click="selectDay(day)"
                >
                  {{ day.dayNum }}
                </button>
              </div>
            </div>

            <!-- Time Picker Section -->
            <div class="time-section">
              <h5 class="time-title">
                <Clock :size="14" class="text-gold" />
                <span>وقت الاستلام / الإرجاع</span>
              </h5>

              <div class="time-slots-list custom-scroll">
                <button
                  v-for="ts in timeSlots"
                  :key="ts.value"
                  class="time-slot-btn"
                  :class="{
                    selected: ts.value === modelValueTime,
                    disabled: ts.isDisabled
                  }"
                  :disabled="ts.isDisabled"
                  @click="selectTime(ts.value, ts.isDisabled)"
                >
                  <span>{{ ts.label }}</span>
                  <Check v-if="ts.value === modelValueTime" :size="12" />
                </button>
              </div>
            </div>
          </div>

          <div class="popover-footer">
            <button class="btn btn-primary btn-sm done-btn" @click="isOpen = false">
              <Check :size="16" />
              <span>تأكيد الاختيار</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.datetime-picker-wrapper {
  position: relative;
  width: 100%;
}

.picker-trigger-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: var(--bg-card);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
  user-select: none;
  overflow: hidden;
}

.picker-trigger-card:hover, .picker-trigger-card.active {
  border-color: var(--primary);
  box-shadow: 0 4px 14px rgba(0, 77, 64, 0.12);
  background: var(--bg-surface);
}

.trigger-icon-area {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trigger-text-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0; /* Enables text-overflow: ellipsis */
}

.picker-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

.picker-value {
  font-size: 0.88rem;
  color: var(--text-dark);
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.clock-icon {
  opacity: 0.6;
  flex-shrink: 0;
}

/* Popover Modal Container */
.calendar-backdrop-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 999998 !important;
}

/* Popover Modal Container */
.calendar-popover.teleported-popover {
  position: fixed !important;
  z-index: 999999 !important;
  width: 530px;
  max-width: 94vw;
  padding: 1.25rem;
  background: #FFFFFF !important;
  color: #1E293B !important;
  border: 1.5px solid var(--border-light) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.35) !important;
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-light);
}

.popover-header h4 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0F172A !important;
}

.close-pop-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.popover-body {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 1.25rem;
}

/* Calendar Month Section */
.calendar-section {
  display: flex;
  flex-direction: column;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.month-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--primary) !important;
}

.nav-month-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.nav-month-btn:hover {
  background: var(--primary-surface);
  color: var(--primary);
}

.weekdays-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.5rem;
}

.wd-cell {
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748B !important;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  height: 36px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #1E293B !important;
  transition: var(--transition);
}

.day-cell.blank {
  cursor: default;
}

.day-cell:hover:not(.blank):not(.disabled) {
  background: var(--primary-surface) !important;
  color: var(--primary) !important;
}

.day-cell.today {
  border: 1.5px solid var(--gold);
  color: var(--primary-deep) !important;
  font-weight: 900;
}

.day-cell.selected {
  background: var(--primary) !important;
  color: #FFFFFF !important;
  box-shadow: var(--shadow-sm);
}

.day-cell.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Time Picker Section */
.time-section {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-light);
  padding-right: 1rem;
}

.time-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: #0F172A !important;
}

.time-slots-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 220px;
  overflow-y: auto;
  padding-left: 0.25rem;
}

.time-slot-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 700;
  background: #F1F5F9 !important;
  color: #1E293B !important;
  transition: var(--transition);
}

.time-slot-btn:hover:not(.disabled) {
  background: var(--primary-surface) !important;
  color: var(--primary) !important;
}

.time-slot-btn.selected {
  background: var(--orange) !important;
  color: #FFFFFF !important;
}

.time-slot-btn.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  text-decoration: line-through;
}

.popover-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
}

.done-btn {
  padding: 0.45rem 1.25rem;
}

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .calendar-backdrop-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    z-index: 999998 !important;
  }

  .calendar-popover.teleported-popover {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    transform: translate(-50%, -50%) !important;
    width: 92vw !important;
    max-height: 85vh !important;
    overflow-y: auto !important;
    z-index: 999999 !important;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5) !important;
    padding: 1rem !important;
  }

  .popover-body {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .time-section {
    border-right: none;
    padding-right: 0;
    border-top: 1px solid var(--border-light);
    padding-top: 0.75rem;
  }

  .time-slots-list {
    max-height: 150px;
  }
}
</style>
