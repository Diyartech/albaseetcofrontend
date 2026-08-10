<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBookingStore } from '../stores/bookingStore'
import { MapPin, Navigation, Check, X, Compass, Search, Layers } from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'select'])
const bookingStore = useBookingStore()

const mapContainer = ref(null)
let map = null
let marker = null
let currentTileLayer = null

const mapMode = ref('roadmap') // 'roadmap' or 'satellite'
const searchQuery = ref('')
const selectedLat = ref(21.5433)
const selectedLng = ref(39.1728)
const resolvedAddress = ref('جدة - حي الروضة، طريق المدينة المنورة')
const isLocating = ref(false)

// Google Maps Tile URLs
const googleRoadmapUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
const googleSatelliteUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'

const cities = [
  { name: 'جدة', lat: 21.5433, lng: 39.1728, sampleAddress: 'جدة - حي الروضة، طريق المدينة المنورة' },
  { name: 'الرياض', lat: 24.7136, lng: 46.6753, sampleAddress: 'الرياض - حي الياسمين، طريق أنس بن مالك' },
  { name: 'الدمام', lat: 26.4207, lng: 50.0888, sampleAddress: 'الدمام - حي الشاطئ، طريق كورنيش الدمام' },
  { name: 'أبها', lat: 18.2164, lng: 42.5053, sampleAddress: 'أبها - حي الموظفين، طريق الملك فهد' }
]

function resolveAddressFromCoords(lat, lng) {
  let closestCity = cities[0]
  let minDistance = 999999

  cities.forEach(c => {
    const dist = Math.hypot(c.lat - lat, c.lng - lng)
    if (dist < minDistance) {
      minDistance = dist
      closestCity = c
    }
  })

  selectedLat.value = lat
  selectedLng.value = lng
  resolvedAddress.value = `${closestCity.name} - موقع محدد على خرائط جوجل (إحداثيات: ${lat.toFixed(4)}, ${lng.toFixed(4)})`
}

function destroyMap() {
  if (map) {
    try {
      map.remove()
    } catch (e) {
      // ignore
    }
    map = null
    marker = null
    currentTileLayer = null
  }
}

function initGoogleMap() {
  if (!mapContainer.value) return

  // Always recreate map cleanly
  destroyMap()

  // Custom Google Maps Red Pin Marker
  const googlePinIcon = L.divIcon({
    className: 'google-map-pin',
    html: `
      <div class="g-pin-wrapper">
        <div class="g-pin-pulse"></div>
        <div class="g-pin-body">
          <div class="g-pin-dot"></div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44]
  })

  map = L.map(mapContainer.value, {
    zoomControl: false
  }).setView([selectedLat.value, selectedLng.value], 13)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  currentTileLayer = L.tileLayer(googleRoadmapUrl, {
    attribution: 'Map data © Google Maps',
    maxZoom: 20
  }).addTo(map)

  marker = L.marker([selectedLat.value, selectedLng.value], {
    icon: googlePinIcon,
    draggable: true
  }).addTo(map)

  map.on('click', (e) => {
    const { lat, lng } = e.latlng
    marker.setLatLng([lat, lng])
    resolveAddressFromCoords(lat, lng)
  })

  marker.on('dragend', (e) => {
    const { lat, lng } = e.target.getLatLng()
    resolveAddressFromCoords(lat, lng)
  })

  setTimeout(() => {
    if (map) {
      map.invalidateSize()
    }
  }, 150)
}

function toggleMapLayer(mode) {
  mapMode.value = mode
  if (!map) return

  if (currentTileLayer) {
    map.removeLayer(currentTileLayer)
  }

  const newUrl = mode === 'satellite' ? googleSatelliteUrl : googleRoadmapUrl
  currentTileLayer = L.tileLayer(newUrl, {
    attribution: 'Map data © Google Maps',
    maxZoom: 20
  }).addTo(map)
}

function searchLocation() {
  if (!searchQuery.value.trim()) return

  const query = searchQuery.value.trim()
  const matchedCity = cities.find(c => query.includes(c.name))

  if (matchedCity) {
    jumpToCity(matchedCity)
  } else {
    resolvedAddress.value = `${query} - موقع محدد على خرائط جوجل`
  }
}

function jumpToCity(city) {
  selectedLat.value = city.lat
  selectedLng.value = city.lng
  resolvedAddress.value = city.sampleAddress

  if (map) {
    map.flyTo([city.lat, city.lng], 14, { duration: 1 })
    if (marker) marker.setLatLng([city.lat, city.lng])
  }
}

function locateUserGPS() {
  if (navigator.geolocation) {
    isLocating.value = true
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        isLocating.value = false
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        resolvedAddress.value = `موقعك الحقيقي المباشر (Google GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`
        selectedLat.value = lat
        selectedLng.value = lng

        if (map) {
          map.flyTo([lat, lng], 16, { duration: 1 })
          if (marker) marker.setLatLng([lat, lng])
        }
      },
      () => {
        isLocating.value = false
        alert('تعذر الوصول لموقعك الحالي تلقائياً. يمكنك اختيار الموقع يدوياً على الخريطة.')
      }
    )
  }
}

function confirmLocationSelection() {
  bookingStore.deliveryAddress = resolvedAddress.value
  emit('select', resolvedAddress.value)
  emit('close')
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setTimeout(() => {
        initGoogleMap()
      }, 100)
    })
  } else {
    destroyMap()
  }
})

onMounted(() => {
  if (props.isOpen) {
    nextTick(() => {
      setTimeout(() => {
        initGoogleMap()
      }, 100)
    })
  }
})

onUnmounted(() => {
  destroyMap()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="emit('close')">
      <div class="map-modal-card card" @click.stop>
        <!-- Google Maps Modal Header -->
        <div class="modal-header">
          <div class="header-title">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282020%29.svg" alt="Google Maps" class="gmap-icon-img" />
            <div>
              <h3>تحديد موقع التوصيل على خرائط جوجل (Google Maps)</h3>
              <p class="text-muted">انقر على الخريطة أو اسحب المؤشر الأحمر لتحديد عنوان التسليم</p>
            </div>
          </div>

          <button class="close-btn" @click="emit('close')" aria-label="إغلاق">
            <X :size="22" />
          </button>
        </div>

        <!-- Google Search & Map Controls Bar -->
        <div class="map-toolbar">
          <div class="search-box-wrap">
            <Search :size="18" class="search-icon" />
            <input 
              type="text" 
              v-model="searchQuery" 
              class="form-control g-search-input" 
              placeholder="ابحث بالحي أو الشارع (مثال: حي النخيل الرياض، طريق الكورنيش جدة)" 
              @keyup.enter="searchLocation"
            />
            <button class="btn btn-primary btn-sm search-btn" @click="searchLocation">بحث</button>
          </div>

          <div class="toolbar-actions">
            <!-- Map Mode Selector -->
            <div class="map-mode-toggle">
              <button 
                class="mode-btn" 
                :class="{ active: mapMode === 'roadmap' }" 
                @click="toggleMapLayer('roadmap')"
              >
                خريطة
              </button>
              <button 
                class="mode-btn" 
                :class="{ active: mapMode === 'satellite' }" 
                @click="toggleMapLayer('satellite')"
              >
                أقمار صناعية
              </button>
            </div>

            <!-- GPS Locate -->
            <button class="btn btn-outline btn-sm gps-btn" @click="locateUserGPS" :disabled="isLocating">
              <Compass :size="16" class="text-orange" />
              <span>{{ isLocating ? 'جاري تحديد المكان...' : 'موقعي GPS' }}</span>
            </button>
          </div>
        </div>

        <!-- City Quick Jump Bar -->
        <div class="city-jump-bar">
          <span class="toolbar-label">المدن الرئيسية:</span>
          <div class="city-pills-row">
            <button 
              v-for="c in cities" 
              :key="c.name" 
              class="city-pill-btn" 
              @click="jumpToCity(c)"
            >
              📍 {{ c.name }}
            </button>
          </div>
        </div>

        <!-- Google Maps Canvas Wrapper -->
        <div class="map-wrapper">
          <div ref="mapContainer" class="leaflet-map-canvas"></div>
        </div>

        <!-- Location Footer Bar -->
        <div class="map-footer">
          <div class="address-preview">
            <MapPin :size="22" class="text-orange flex-shrink-0" />
            <div>
              <span class="preview-label">العنوان المحدد على خرائط جوجل:</span>
              <p class="address-text">{{ resolvedAddress }}</p>
            </div>
          </div>

          <button class="btn btn-orange btn-lg confirm-loc-btn" @click="confirmLocationSelection">
            <Check :size="20" />
            <span>تأكيد هذا الموقع للتوصيل</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 28, 24, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.map-modal-card {
  width: 960px;
  max-width: 95vw;
  height: 88vh;
  max-height: 720px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-card);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.gmap-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.header-title h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-dark);
}

.close-btn {
  padding: 0.4rem;
  border-radius: 50%;
  color: var(--text-muted);
  transition: var(--transition);
}

.close-btn:hover {
  background: var(--bg-subtle);
  color: var(--text-dark);
}

.map-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--bg-subtle);
  border-bottom: 1px solid var(--border-light);
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box-wrap {
  position: relative;
  flex: 1;
  min-width: 280px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.search-icon {
  position: absolute;
  right: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
}

.g-search-input {
  padding-right: 2.5rem;
  height: 42px;
}

.search-btn {
  height: 42px;
  padding: 0 1.25rem;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.map-mode-toggle {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 0.2rem;
  border-radius: var(--radius-md);
}

.mode-btn {
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: var(--transition);
}

.mode-btn.active {
  background: var(--primary);
  color: white;
}

.city-jump-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.5rem;
  background: #F4F6F8;
  border-bottom: 1px solid var(--border-light);
}

.toolbar-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
}

.city-pills-row {
  display: flex;
  gap: 0.5rem;
}

.city-pill-btn {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-dark);
  transition: var(--transition);
}

.city-pill-btn:hover {
  background: var(--gold);
  color: var(--primary-deep);
  border-color: var(--gold);
}

.map-wrapper {
  flex: 1;
  width: 100%;
  height: 380px;
  position: relative;
}

.leaflet-map-canvas {
  width: 100%;
  height: 100%;
  min-height: 380px;
  background: #E5E3DF;
}

.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  gap: 1.5rem;
}

.address-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.preview-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: block;
}

.address-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-dark);
}

.confirm-loc-btn {
  padding: 0.75rem 1.75rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }
  .map-modal-card {
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    margin: 0;
  }
  .modal-header {
    padding: 0.6rem 1rem;
  }
  .modal-header h3 {
    font-size: 0.95rem;
  }
  .modal-header p {
    font-size: 0.75rem;
  }
  .map-toolbar {
    padding: 0.5rem 0.85rem;
    gap: 0.5rem;
  }
  .search-box-wrap {
    min-width: 100%;
  }
  .toolbar-actions {
    width: 100%;
    justify-content: space-between;
  }
  .city-jump-bar {
    padding: 0.4rem 0.85rem;
    overflow-x: auto;
  }
  .city-pills-row {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .map-wrapper {
    flex: 1;
    height: 100%;
    min-height: 0;
  }
  .leaflet-map-canvas {
    min-height: 0;
    height: 100%;
  }
  .map-footer {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.65rem;
    flex-shrink: 0;
    background: var(--bg-card);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }
  .address-preview {
    font-size: 0.82rem;
  }
  .address-text {
    font-size: 0.85rem;
    line-height: 1.3;
  }
  .confirm-loc-btn {
    width: 100%;
    padding: 0.85rem;
    font-size: 1rem;
  }
}
</style>

<style>
/* Custom Red Google Maps Pin Marker */
.google-map-pin {
  background: transparent;
  border: none;
}

.g-pin-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.g-pin-body {
  width: 28px;
  height: 38px;
  background: #EA4335;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4);
  border: 2px solid #FFFFFF;
  animation: bounceGPin 1.2s infinite alternate ease-in-out;
}

.g-pin-dot {
  width: 10px;
  height: 10px;
  background: #FFFFFF;
  border-radius: 50%;
  transform: rotate(45deg);
}

.g-pin-pulse {
  position: absolute;
  bottom: 0;
  width: 28px;
  height: 10px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 50%;
  animation: pulseShadow 1.2s infinite ease-out;
}

@keyframes bounceGPin {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}

@keyframes pulseShadow {
  0% { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(1.4); opacity: 0.1; }
}
</style>
