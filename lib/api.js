// API utility functions for events management

// Ensure we have a proper base URL
const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000');

// Events API functions
export const eventsAPI = {
  // Get all events
  async getAll(params = {}) {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/events?${searchParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return response.json();
  },

  // Get single event by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    
    return response.json();
  },

  // Create new event
  async create(eventData) {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }
    
    return response.json();
  },

  // Update event
  async update(id, eventData) {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...eventData }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }
    
    return response.json();
  },

  // Delete event
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/api/events?id=${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete event');
    }
    
    return response.json();
  },
};

// Generic API error handler
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Format date for display
export const formatDate = (dateString) => {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format time for display
export const formatTime = (timeString) => {
  return timeString; // Can be enhanced for time formatting if needed
};

// Check if event is upcoming
export const isUpcoming = (dateString) => {
  return new Date(dateString) > new Date();
};

// Sort events by date
export const sortEventsByDate = (events, ascending = false) => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};
