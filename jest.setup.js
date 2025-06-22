// Jest setup file for React Native

// Mock react-native-heroicons since they're external dependencies
jest.mock('react-native-heroicons/outline', () => ({
  PlusIcon: 'PlusIcon',
  ArrowPathIcon: 'ArrowPathIcon',
  CheckIcon: 'CheckIcon',
  CheckCircleIcon: 'CheckCircleIcon',
  TrashIcon: 'TrashIcon',
  PencilIcon: 'PencilIcon',
  SparklesIcon: 'SparklesIcon',
}));

jest.mock('react-native-heroicons/solid', () => ({
  PlusIcon: 'PlusIcon',
  ArrowPathIcon: 'ArrowPathIcon',
  CheckIcon: 'CheckIcon',
  CheckCircleIcon: 'CheckCircleIcon',
  TrashIcon: 'TrashIcon',
  PencilIcon: 'PencilIcon',
  SparklesIcon: 'SparklesIcon',
}));

// Mock Expo SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  isAvailableAsync: jest.fn().mockResolvedValue(true),
}));

// Mock expo-router 
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(false),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(false),
  })),
  Stack: {
    Screen: ({ children }) => children,
  },
  Slot: ({ children }) => children,
}));

// Mock expo constants
jest.mock('expo-constants', () => ({
  executionEnvironment: 'standalone',
  platform: {
    ios: null,
    android: null,
  },
}));
