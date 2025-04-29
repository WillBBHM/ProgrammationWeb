
// Simple in-memory database simulation for our application

export interface Reservation {
  id: string;
  boatId: string;
  startDate: string;
  endDate: string;
  fullName: string;
  email: string;
  phone: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface User {
  username: string;
  password: string;
}

// We'll use localStorage to store our data
const RESERVATIONS_KEY = 'voyagemarin_reservations';
const USERS_KEY = 'voyagemarin_users';
const CURRENT_USER_KEY = 'voyagemarin_current_user';

// User-related functions
export const getAllUsers = (): User[] => {
  const storedData = localStorage.getItem(USERS_KEY);
  return storedData ? JSON.parse(storedData) : [];
};

export const saveUser = (user: User): void => {
  const users = getAllUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authenticateUser = (username: string, password: string): boolean => {
  const users = getAllUsers();
  return users.some(user => user.username === username && user.password === password);
};

export const setCurrentUser = (username: string | null): void => {
  if (username) {
    localStorage.setItem(CURRENT_USER_KEY, username);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getCurrentUser = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

// Initialize default user if none exists
const initializeDefaultUser = () => {
  const users = getAllUsers();
  if (users.length === 0) {
    const defaultUser = { username: 'toto', password: '123' };
    saveUser(defaultUser);
  }
};

// Call this function to ensure we have a default user
initializeDefaultUser();

// Get all reservations
export const getAllReservations = (): Reservation[] => {
  const storedData = localStorage.getItem(RESERVATIONS_KEY);
  return storedData ? JSON.parse(storedData) : [];
};

// Get reservation by ID
export const getReservationById = (id: string): Reservation | null => {
  const reservations = getAllReservations();
  return reservations.find(res => res.id === id) || null;
};

// Get reservations by boat ID
export const getReservationsByBoatId = (boatId: string): Reservation[] => {
  const reservations = getAllReservations();
  return reservations.filter(res => res.boatId === boatId);
};

// Get reservations by user email
export const getReservationsByEmail = (email: string): Reservation[] => {
  const reservations = getAllReservations();
  return reservations.filter(res => res.email === email);
};

// Get reservations by username
export const getReservationsByUsername = (username: string): Reservation[] => {
  const reservations = getAllReservations();
  return reservations.filter(res => res.fullName === username);
};

// Save a new reservation
export const saveReservation = (reservation: Reservation): void => {
  const reservations = getAllReservations();
  reservations.push(reservation);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
};

// Update an existing reservation
export const updateReservation = (updatedReservation: Reservation): boolean => {
  const reservations = getAllReservations();
  const index = reservations.findIndex(res => res.id === updatedReservation.id);
  
  if (index === -1) return false;
  
  reservations[index] = updatedReservation;
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  return true;
};

// Delete a reservation
export const deleteReservation = (id: string): boolean => {
  const reservations = getAllReservations();
  const filteredReservations = reservations.filter(res => res.id !== id);
  
  if (filteredReservations.length === reservations.length) return false;
  
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(filteredReservations));
  return true;
};

// Check if a boat is available for the given date range
export const isBoatAvailable = (boatId: string, startDate: string, endDate: string, excludeReservationId?: string): boolean => {
  const reservations = getAllReservations().filter(res => 
    res.boatId === boatId && 
    res.status !== 'cancelled' &&
    (excludeReservationId ? res.id !== excludeReservationId : true)
  );
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (const res of reservations) {
    const resStart = new Date(res.startDate);
    const resEnd = new Date(res.endDate);
    
    // Check if there's an overlap in the date ranges
    if ((start <= resEnd && end >= resStart)) {
      return false; // The boat is not available for these dates
    }
  }
  
  return true; // The boat is available
};
