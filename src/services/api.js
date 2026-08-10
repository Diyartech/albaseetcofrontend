// Centralized Backend API Client for Al-Baseet Rent a Car Web API (.NET 10 / SQL Server)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5014/api'
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error ${response.status}`)
    }
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.warn(`[Backend API Fallback]: ${error.message} - Using local cache.`)
    throw error
  }
}

export const apiService = {
  // Cars API
  async getCars(category = 'all', sortBy = 'price_asc') {
    return await request(`/cars?category=${category}&sortBy=${sortBy}`)
  },
  async getCarById(id) {
    return await request(`/cars/${id}`)
  },
  async createCar(carData) {
    return await request('/cars', {
      method: 'POST',
      body: JSON.stringify(carData),
    })
  },
  async updateCar(id, carData) {
    return await request(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(carData),
    })
  },
  async deleteCar(id) {
    return await request(`/cars/${id}`, {
      method: 'DELETE',
    })
  },

  // Branches API
  async getBranches(cityId = 'all') {
    return await request(`/branches?cityId=${cityId}`)
  },
  async createBranch(branchData) {
    return await request('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    })
  },
  async updateBranch(id, branchData) {
    return await request(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(branchData),
    })
  },
  async deleteBranch(id) {
    return await request(`/branches/${id}`, {
      method: 'DELETE',
    })
  },

  // Banners API (Public for Home Page returns active only; Admin returns all)
  async getBanners(forAdmin = false) {
    const endpoint = forAdmin ? '/banners/admin' : '/banners'
    return await request(endpoint)
  },
  async createBanner(bannerData) {
    return await request('/banners', {
      method: 'POST',
      body: JSON.stringify(bannerData),
    })
  },
  async updateBanner(id, bannerData) {
    return await request(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bannerData),
    })
  },
  async deleteBanner(id) {
    return await request(`/banners/${id}`, {
      method: 'DELETE',
    })
  },

  // Bookings API
  async createBooking(bookingData) {
    return await request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  },
  async getBookingByRef(refNumber) {
    return await request(`/bookings/${refNumber}`)
  },
  async searchBooking(bookingRef, nationalId) {
    return await request(`/bookings/search?bookingRef=${encodeURIComponent(bookingRef)}&nationalId=${encodeURIComponent(nationalId || '')}`)
  },
  async updateBooking(refNumber, updateData) {
    return await request(`/bookings/${refNumber}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  },
  async cancelBooking(refNumber) {
    return await request(`/bookings/${refNumber}/cancel`, {
      method: 'POST',
    })
  },

  // Customer Lookup API
  async lookupCustomer(nationalId) {
    return await request(`/customers/lookup/${nationalId}`)
  },

  // Promo Code Validation API
  async validatePromoCode(code) {
    return await request(`/promocodes/validate/${code}`)
  },

  // Auth API
  async login(email, password) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  // Admin Dashboard & Bookings Management API
  async getAdminStats() {
    return await request('/bookings/admin/stats')
  },

  async getAdminBookings(filters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.search) params.append('search', filters.search)
    return await request(`/bookings/admin/all?${params.toString()}`)
  }
}
