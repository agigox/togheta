import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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

// Flag to prevent multiple auth initializations
let authInitialized = false;

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearPersistedData: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  
  // Internal methods
  persistAuthState: (firebaseUser: User | null) => Promise<void>;
  loadPersistedAuthState: () => Promise<void>;
}

// Create the auth store
export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      loading: true,
      isAuthenticated: false,

      setUser: (user) => {
        console.log(
          '🔥 Setting user in store:',
          user ? `authenticated (${user.email})` : 'not authenticated'
        );
        set({ 
          user, 
          isAuthenticated: !!user,
          loading: false 
        });
      },
      
      setLoading: (loading) => set({ loading }),

      // Persist user authentication state to SecureStore
      persistAuthState: async (firebaseUser: User | null) => {
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
      },

      // Load persisted auth state on app startup
      loadPersistedAuthState: async () => {
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

                set({ 
                  user: mockUser,
                  isAuthenticated: true,
                  loading: false 
                });
              }
            } else {
              console.log('Found expired auth state, clearing data');
              await clearAllAuthData();
              set({ loading: false });
            }
          } else {
            console.log('No persisted auth state found');
            set({ loading: false });
          }
        } catch (error) {
          console.error('Error loading persisted auth state:', error);
          set({ loading: false });
        }
      },

      clearPersistedData: async () => {
        await clearAllAuthData();
      },

      initializeAuth: () => {
        if (authInitialized) {
          console.log('🔄 Auth already initialized, skipping...');
          return;
        }
        
        const { loadPersistedAuthState, persistAuthState } = get();
        
        // Load any persisted auth state first
        const initializeAuthFlow = async () => {
          await loadPersistedAuthState();

          // Set up Firebase auth state listener
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log(
              '🔥 Firebase auth state changed:',
              firebaseUser ? `authenticated (${firebaseUser.email})` : 'not authenticated'
            );

            // Only update state if Firebase gives us a different result than what we restored
            if (firebaseUser) {
              // Firebase confirmed authentication - update with real user object
              set({ 
                user: firebaseUser,
                isAuthenticated: true,
                loading: false 
              });
              await persistAuthState(firebaseUser);
            } else {
              // Firebase says not authenticated - but check if we have valid stored data
              const storedAuthState = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.AUTH_STATE);
              if (storedAuthState === 'authenticated') {
                const isValid = await isAuthTokenValid();
                if (!isValid) {
                  // Stored data is invalid, clear everything
                  console.log('🧹 Firebase auth lost and stored data invalid - clearing all');
                  set({ 
                    user: null,
                    isAuthenticated: false,
                    loading: false 
                  });
                  await clearAllAuthData();
                }
                // If stored data is valid, keep the restored user state
              } else {
                // No stored auth state, user is definitely not authenticated
                set({ 
                  user: null,
                  isAuthenticated: false,
                  loading: false 
                });
              }
            }
          });

          return unsubscribe;
        };

        authInitialized = true;
        initializeAuthFlow();
      },

      signup: async (email, password) => {
        set({ loading: true });
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
          
          set({ 
            user: userCredential.user,
            isAuthenticated: true,
            loading: false 
          });
        } catch (error) {
          console.error('Signup error:', error);
          set({ loading: false });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log('User logged in successfully:', userCredential.user.uid);
          
          set({ 
            user: userCredential.user,
            isAuthenticated: true,
            loading: false 
          });
        } catch (error) {
          console.error('Login error:', error);
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await signOut(auth);
          await get().clearPersistedData();
          console.log('User logged out successfully');
          
          set({ 
            user: null,
            isAuthenticated: false,
            loading: false 
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
