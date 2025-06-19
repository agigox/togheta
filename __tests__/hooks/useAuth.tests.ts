import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../../src/hooks/useAuth';

// Mock Firebase Auth methods
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

// Mock the Firebase auth module
jest.mock('~/firebase', () => ({
  auth: { mockAuth: true },
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
}));
// Tests for useAuth hook
describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock for onAuthStateChanged
    mockOnAuthStateChanged.mockImplementation(() => {
      return jest.fn(); // Return unsubscribe function
    });
  });

  it('should initialize with null user and loading true', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('should set user and loading false when auth state changes to logged in user', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    // Mock onAuthStateChanged to immediately call the callback with a user
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate calling the callback with a user immediately
      callback(mockUser);
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    // After auth state change, should have user and not be loading
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle auth state change to null user (sign out)', async () => {
    // Mock onAuthStateChanged to call callback with null (signed out)
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn(); // Return unsubscribe function
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return the correct interface structure with all auth methods', () => {
    const { result } = renderHook(() => useAuth());

    // Verify the hook returns the expected structure
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('signup');
    expect(result.current).toHaveProperty('logout');
    
    // Verify methods are functions
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.signup).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  describe('Auth Methods', () => {
    it('should call createUserWithEmailAndPassword for signup', async () => {
      const mockUserCredential = {
        user: { uid: 'new-user', email: 'new@example.com' }
      };
      
      mockCreateUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signup('test@example.com', 'password123');
      });

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        { mockAuth: true },
        'test@example.com',
        'password123'
      );
    });

    it('should call signInWithEmailAndPassword for login', async () => {
      const mockUserCredential = {
        user: { uid: 'existing-user', email: 'user@example.com' }
      };
      
      mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('user@example.com', 'password123');
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        { mockAuth: true },
        'user@example.com',
        'password123'
      );
    });

    it('should call signOut for logout', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalledWith({ mockAuth: true });
    });

    it('should handle signup errors', async () => {
      const mockError = new Error('Email already in use');
      mockCreateUserWithEmailAndPassword.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await expect(act(async () => {
        await result.current.signup('test@example.com', 'password123');
      })).rejects.toThrow('Email already in use');

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        { mockAuth: true },
        'test@example.com',
        'password123'
      );
    });

    it('should handle login errors', async () => {
      const mockError = new Error('Invalid credentials');
      mockSignInWithEmailAndPassword.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await expect(act(async () => {
        await result.current.login('user@example.com', 'wrongpassword');
      })).rejects.toThrow('Invalid credentials');

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        { mockAuth: true },
        'user@example.com',
        'wrongpassword'
      );
    });

    it('should handle logout errors', async () => {
      const mockError = new Error('Logout failed');
      mockSignOut.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await expect(act(async () => {
        await result.current.logout();
      })).rejects.toThrow('Logout failed');

      expect(mockSignOut).toHaveBeenCalledWith({ mockAuth: true });
    });
  });

  it('should unsubscribe from auth state changes on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

});