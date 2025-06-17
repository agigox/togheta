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
