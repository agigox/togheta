import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { auth } from '~/firebase';
import {
  AUTH_STORAGE_KEYS,
  isAuthTokenValid,
  clearAllAuthData,
  getStoredUserData,
} from '~/shared/utils/authStorage';
import { syncUserToFirestore } from '~/firebase/families';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearPersistedData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Persist user authentication state to SecureStore
  const persistAuthState = async (firebaseUser: User | null) => {
    try {
      if (firebaseUser) {
        // Store user data securely
        await SecureStore.setItemAsync(
          AUTH_STORAGE_KEYS.USER_DATA,
          JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            emailVerified: firebaseUser.emailVerified,
          })
        );

        // Store authentication timestamp
        await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
        await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.AUTH_STATE, 'authenticated');

        // Get and store the Firebase token
        const token = await firebaseUser.getIdToken();
        await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.USER_TOKEN, token);
      } else {
        // Clear stored data on logout
        await clearAllAuthData();
      }
    } catch (error) {
      console.error('Error persisting auth state:', error);
    }
  }; // Load persisted auth state on app startup
  const loadPersistedAuthState = async () => {
    try {
      console.log('Loading persisted auth state...');

      // Check if we have any stored auth data first
      const storedAuthState = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.AUTH_STATE);

      if (storedAuthState === 'authenticated') {
        // We have stored data, check if it's still valid
        const isValid = await isAuthTokenValid();

        if (isValid) {
          console.log('Found valid persisted auth state - restoring user');

          // Try to restore user data from storage while Firebase initializes
          const userData = await getStoredUserData();
          if (userData) {
            console.log('Restoring user from secure storage:', userData.email);
            // Create a mock user object for immediate auth state
            const mockUser = {
              uid: userData.uid,
              email: userData.email,
              displayName: userData.displayName,
              emailVerified: userData.emailVerified,
            } as User;

            setUser(mockUser);
            setIsAuthenticated(true);
            setLoading(false); // Set loading to false here since we have valid data
          }
        } else {
          console.log('Found expired auth state, clearing data');
          await clearAllAuthData();
          setLoading(false);
        }
      } else {
        console.log('No persisted auth state found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading persisted auth state:', error);
      setLoading(false);
    }
  };

  // Clear all persisted authentication data
  const clearPersistedData = async () => {
    await clearAllAuthData();
  };

  useEffect(() => {
    let mounted = true;

    // Load any persisted auth state first
    const initializeAuth = async () => {
      await loadPersistedAuthState();

      // Set up Firebase auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        console.log(
          '🔥 Firebase auth state changed:',
          firebaseUser ? `authenticated (${firebaseUser.email})` : 'not authenticated'
        );

        // Only update state if Firebase gives us a different result than what we restored
        if (firebaseUser) {
          // Firebase confirmed authentication - update with real user object
          setUser(firebaseUser);
          setIsAuthenticated(true);
          await persistAuthState(firebaseUser);
          
          // No family setup here - it should only happen during signup
        } else {
          // Firebase says not authenticated - but check if we have valid stored data
          const storedAuthState = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.AUTH_STATE);
          if (storedAuthState === 'authenticated') {
            const isValid = await isAuthTokenValid();
            if (!isValid) {
              // Stored data is invalid, clear everything
              console.log('🧹 Firebase auth lost and stored data invalid - clearing all');
              setUser(null);
              setIsAuthenticated(false);
              await clearAllAuthData();
            }
            // If stored data is valid, keep the restored user state
          } else {
            // No stored auth state, user is definitely not authenticated
            setUser(null);
            setIsAuthenticated(false);
          }
        }

        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      mounted = false;
      unsubscribePromise.then((unsubscribe) => unsubscribe?.());
    };
  }, []);

  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up successfully:', userCredential.user.uid);
      
      // Create user document but don't create family - let onboarding handle family setup
      await syncUserToFirestore({
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || undefined,
      });
      
      console.log('✅ User document created, ready for onboarding');
      console.log('🔄 User should be redirected to onboarding by app/index.tsx routing logic');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully:', userCredential.user.uid);
      
      // No family setup during login - it should only happen during signup
      // Family management is handled separately via useFamily hook
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      await clearPersistedData();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signup,
        login,
        logout,
        clearPersistedData,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
