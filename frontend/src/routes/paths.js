/** Paths for shared navigation. Feature owners should reuse these routes. */
export const PATHS = Object.freeze({
  home: '/',
  dashboard: '/dashboard',
  login: '/login',
  signup: '/signup',
  trips: '/trips',
  trip: (tripId) => `/trips/${encodeURIComponent(tripId)}`,
  schedule: (tripId) => `/trips/${encodeURIComponent(tripId)}/schedule`,
  places: (tripId) => `/trips/${encodeURIComponent(tripId)}/places`,
  expenses: (tripId) => `/trips/${encodeURIComponent(tripId)}/expenses`,
  settlement: (tripId) => `/trips/${encodeURIComponent(tripId)}/settlement`,
  statistics: (tripId) => `/trips/${encodeURIComponent(tripId)}/statistics`,
});

/** This ID belongs to example UI data only, not to a real API record. */
export const DEMO_TRIP_ID = 'demo-jeju';
