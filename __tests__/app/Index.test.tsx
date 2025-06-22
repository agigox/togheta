import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Index from '../../app/index';

// Mock the entire index component's dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock all the complex dependencies at the top level
jest.mock('~/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('~/hooks/useUserFamily', () => ({
  useUserFamily: jest.fn(),
}));

jest.mock('~/shared', () => ({
  LoadingScreen: ({ message }: { message: string }) => `LoadingScreen: ${message}`,
}));

// Get the mocked functions
const { useAuth } = jest.requireMock('~/context/AuthContext');
const { useUserFamily } = jest.requireMock('~/hooks/useUserFamily');

describe('Index screen routing logic', () => {
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
  });

  it('redirects to /auth when user is not authenticated', async () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false, // authLoading
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      clearPersistedData: jest.fn(),
    });

    useUserFamily.mockReturnValue({
      familyId: null,
      hasFamilyId: false,
      loading: false, // familyLoading
      error: null,
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/auth');
    });
  });

  it('redirects to /onboarding when user has no family ID', async () => {
    useAuth.mockReturnValue({
      user: { uid: '123' } as any,
      isAuthenticated: true,
      loading: false, // authLoading
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      clearPersistedData: jest.fn(),
    });

    useUserFamily.mockReturnValue({
      familyId: null,
      hasFamilyId: false,
      loading: false, // familyLoading
      error: null,
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('redirects to /tasks when user is authenticated and has family ID', async () => {
    useAuth.mockReturnValue({
      user: { uid: '123' } as any,
      isAuthenticated: true,
      loading: false, // authLoading
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      clearPersistedData: jest.fn(),
    });

    useUserFamily.mockReturnValue({
      familyId: 'family123',
      hasFamilyId: true,
      loading: false, // familyLoading
      error: null,
    });

    render(<Index />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/tasks');
    });
  });

  it('does not redirect while loading auth state', async () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true, // authLoading = true
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      clearPersistedData: jest.fn(),
    });

    useUserFamily.mockReturnValue({
      familyId: null,
      hasFamilyId: false,
      loading: false, // familyLoading
      error: null,
    });

    render(<Index />);

    // Should not redirect while loading
    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });

  it('does not redirect while loading family state', async () => {
    useAuth.mockReturnValue({
      user: { uid: '123' } as any,
      isAuthenticated: true,
      loading: false, // authLoading
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      clearPersistedData: jest.fn(),
    });

    useUserFamily.mockReturnValue({
      familyId: null,
      hasFamilyId: false,
      loading: true, // familyLoading = true
      error: null,
    });

    render(<Index />);

    // Should not redirect while loading
    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });

  it('does not redirect while both auth and family are loading', async () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true, // authLoading = true
      signup: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      clearPersistedData: jest.fn(),
    });

    useUserFamily.mockReturnValue({
      familyId: null,
      hasFamilyId: false,
      loading: true, // familyLoading = true
      error: null,
    });

    render(<Index />);

    // Should not redirect while loading
    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});
