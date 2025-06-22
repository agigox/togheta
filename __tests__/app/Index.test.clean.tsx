import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Index from '../../app/index';

// Mock the entire index component's dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Create mock functions first
const mockReset = jest.fn();
const mockSubscribeToUserFamily = jest.fn(() => jest.fn());

// Mock Zustand stores
const mockUseAuthStore = jest.fn();
const mockUseFamilyStore = jest.fn() as jest.MockedFunction<any> & {
  getState: jest.MockedFunction<any>;
};

// Mock the store with getState method
(mockUseFamilyStore as any).getState = jest.fn(() => ({
  reset: mockReset,
}));

jest.mock('~/stores', () => ({
  useAuthStore: mockUseAuthStore,
  useFamilyStore: mockUseFamilyStore,
}));

jest.mock('~/shared', () => ({
  LoadingScreen: ({ message }: { message: string }) => `LoadingScreen: ${message}`,
}));

describe('Index screen routing logic', () => {
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
  });

  it('redirects to /auth when user is not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    mockUseFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: false,
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockReset,
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/auth');
    });
  });

  it('redirects to /onboarding when user is authenticated but has no family', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    mockUseFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: false,
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockReset,
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/onboarding');
    });

    expect(mockSubscribeToUserFamily).toHaveBeenCalledWith('123');
  });

  it('redirects to /tasks when user is authenticated and has family', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    mockUseFamilyStore.mockReturnValue({
      hasFamilyId: true,
      loading: false,
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockReset,
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/tasks');
    });

    expect(mockSubscribeToUserFamily).toHaveBeenCalledWith('123');
  });

  it('shows loading screen when auth is loading', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
    });

    mockUseFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: false,
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockReset,
    });

    const { getByText } = render(<Index />);

    expect(getByText('LoadingScreen: Loading...')).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('shows loading screen when family is loading', async () => {
    mockUseAuthStore.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    mockUseFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: true,
      subscribeToUserFamily: mockSubscribeToUserFamily,
      reset: mockReset,
    });

    const { getByText } = render(<Index />);

    expect(getByText('LoadingScreen: Loading...')).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
