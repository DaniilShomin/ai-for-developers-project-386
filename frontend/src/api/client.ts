const API_BASE_URL = '/api/v1'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  // TimeSlots API
  async getTimeSlots(ownerId: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams({ owner_id: ownerId })
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    return this.request(`/timeslots?${params.toString()}`, { method: 'GET' })
  }

  async createTimeSlot(data: { ownerId: string; startTime: string }) {
    const body = {
      owner_id: data.ownerId,
      start_time: data.startTime
    }
    return this.request('/timeslots', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async deleteTimeSlot(id: string) {
    return this.request(`/timeslots/${id}`, { method: 'DELETE' })
  }

  // Bookings API
  async getBookings(
    ownerId?: string,
    bookerId?: string,
    status?: 'confirmed' | 'cancelled'
  ) {
    const params = new URLSearchParams()
    if (ownerId) params.append('ownerId', ownerId)
    if (bookerId) params.append('bookerId', bookerId)
    if (status) params.append('status', status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/bookings${query}`, { method: 'GET' })
  }

  async getBooking(id: string) {
    return this.request(`/bookings/${id}`, { method: 'GET' })
  }

  async createBooking(data: {
    timeSlotId: string
    bookerName: string
    bookerEmail: string
    bookerPhone?: string
    notes?: string
  }) {
    const body = {
      time_slot_id: data.timeSlotId,
      booker_name: data.bookerName,
      booker_email: data.bookerEmail,
      booker_phone: data.bookerPhone,
      notes: data.notes
    }
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async cancelBooking(id: string) {
    return this.request(`/bookings/${id}`, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
