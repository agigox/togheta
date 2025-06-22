import { useAuthStore } from './authStore';
import { useFamilyStore } from './familyStore';
import { useTasksStore } from './tasksStore';

// Initialize all stores
export const initializeStores = () => {
  console.log('🚀 Initializing Zustand stores...');
  
  // Initialize auth store with Firebase listener
  useAuthStore.getState().initializeAuth();
  
  console.log('✅ Stores initialized');
};

// Reset all stores (useful for logout or testing)
export const resetAllStores = () => {
  console.log('🔄 Resetting all stores...');
  
  useFamilyStore.getState().reset();
  useTasksStore.getState().reset();
  
  console.log('✅ All stores reset');
};
