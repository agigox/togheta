import * as SecureStore from 'expo-secure-store';

// Auth-related utility functions for enhanced persistence

export const AUTH_STORAGE_KEYS = {
  USER_TOKEN: 'user_auth_token',
  USER_DATA: 'user_data',
  LAST_LOGIN: 'last_login_timestamp',
  AUTH_STATE: 'auth_state',
  USER_PREFERENCES: 'user_preferences',
} as const;

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  familyId?: string;
  lastActiveFamily?: string;
}

// Get user data from secure storage
export const getStoredUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting stored user data:', error);
    return null;
  }
};

// Store user preferences
export const storeUserPreferences = async (preferences: UserPreferences): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error storing user preferences:', error);
  }
};

// Get user preferences
export const getStoredUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const preferences = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.USER_PREFERENCES);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('Error getting stored user preferences:', error);
    return null;
  }
};

// Check if auth token is still valid
export const isAuthTokenValid = async (): Promise<boolean> => {
  try {
    const lastLogin = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.LAST_LOGIN);
    const authState = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.AUTH_STATE);

    if (!lastLogin || authState !== 'authenticated') {
      return false;
    }

    const lastLoginDate = new Date(lastLogin);
    const now = new Date();
    const daysDiff = (now.getTime() - lastLoginDate.getTime()) / (1000 * 3600 * 24);

    // Consider token valid for 30 days
    return daysDiff < 30;
  } catch (error) {
    console.error('Error checking auth token validity:', error);
    return false;
  }
};

// Get auth token if valid
export const getValidAuthToken = async (): Promise<string | null> => {
  try {
    const isValid = await isAuthTokenValid();
    if (!isValid) return null;

    return await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.USER_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Clear all auth-related data
export const clearAllAuthData = async (): Promise<void> => {
  try {
    const keys = Object.values(AUTH_STORAGE_KEYS);
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key).catch(() => {})));
    console.log('All auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
