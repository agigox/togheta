import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useAuthStore, useFamilyStore } from '../../src/stores';

// Import the component after mocking
import Index from '../../app/index';

// Mock expo-router with proper jest functions
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock store modules
jest.mock('../../src/stores', () => ({
  useAuthStore: jest.fn(),
  useFamilyStore: jest.fn(),
}));

describe('Index Component Routing Logic', () => {
  const mockSubscribeToUserFamily = jest.fn();
  const mockResetFamily = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    
    (useFamilyStore as jest.Mock).mockReturnValue({
      hasFamilyId: false,
      loading: false,
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockResetFamily,
    });
  });

  it('should redirect to /auth when user is not authenticated', async () => {
    render(<Index />);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/auth');
    });
  });

  it('should reset family store when user is not authenticated', async () => {
    render(<Index />);
    
    await waitFor(() => {
      expect(mockResetFamily).toHaveBeenCalled();
    });
  });

  it('should redirect to /onboarding when user is authenticated but has no family', async () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    render(<Index />);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should redirect to /tasks when user is authenticated and has family', async () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });
    
    (useFamilyStore as jest.Mock).mockReturnValue({
      hasFamilyId: true,
      loading: false,
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockResetFamily,
    });

    render(<Index />);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/tasks');
    });
  });

  it('should wait when auth is loading', async () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true, // Auth is loading
    });

    render(<Index />);
    
    // Should not redirect immediately
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should wait when family is loading', async () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { uid: 'test-user', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });
    
    (useFamilyStore as jest.Mock).mockReturnValue({
      hasFamilyId: false,
      loading: true, // Family is loading
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockResetFamily,
    });

    render(<Index />);
    
    // Should not redirect immediately
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should set up family subscription when user is authenticated', async () => {
    const mockUser = { uid: 'test-user', email: 'test@example.com' };
    
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      loading: false,
    });

    render(<Index />);
    
    await waitFor(() => {
      expect(mockSubscribeToUserFamily).toHaveBeenCalledWith(mockUser.uid);
    });
  });
});
