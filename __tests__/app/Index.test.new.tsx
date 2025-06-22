import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Index from '../../app/index';

// Mock the entire index component's dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock Zustand stores
jest.mock('~/stores', () => ({
  useAuthStore: jest.fn(),
  useFamilyStore: jest.fn(),
}));

jest.mock('~/shared', () => ({
  LoadingScreen: ({ message }: { message: string }) => `LoadingScreen: ${message}`,
}));

// Get the mocked functions
const { useAuthStore, useFamilyStore } = jest.requireMock('~/stores');

describe('Index screen routing logic', () => {
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
  });

  it('redirects to /auth when user is not authenticated', async () => {
    useAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    useFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: false,
      subscribeToUserFamily: jest.fn(),
      reset: jest.fn(),
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/auth');
    });
  });

  it('redirects to /onboarding when user is authenticated but has no family', async () => {
    useAuthStore.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    useFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: false,
      subscribeToUserFamily: jest.fn(() => jest.fn()),
      reset: jest.fn(),
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('redirects to /tasks when user is authenticated and has family', async () => {
    useAuthStore.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    useFamilyStore.mockReturnValue({
      hasFamilyId: true,
      loading: false,
      subscribeToUserFamily: jest.fn(() => jest.fn()),
      reset: jest.fn(),
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/tasks');
    });
  });

  it('shows loading screen when auth is loading', async () => {
    useAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
    });

    useFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: false,
      subscribeToUserFamily: jest.fn(),
      reset: jest.fn(),
    });

    const { getByText } = render(<Index />);

    expect(getByText('LoadingScreen: Loading...')).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('shows loading screen when family is loading', async () => {
    useAuthStore.mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    useFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: true,
      subscribeToUserFamily: jest.fn(() => jest.fn()),
      reset: jest.fn(),
    });

    const { getByText } = render(<Index />);

    expect(getByText('LoadingScreen: Loading...')).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('shows loading screen when both auth and family are loading', async () => {
    useAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
    });

    useFamilyStore.mockReturnValue({
      hasFamilyId: false,
      loading: true,
      subscribeToUserFamily: jest.fn(),
      reset: jest.fn(),
    });

    const { getByText } = render(<Index />);

    expect(getByText('LoadingScreen: Loading...')).toBeTruthy();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
