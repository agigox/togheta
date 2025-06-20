import { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    // Main entry points - Expo uses AppEntry.js which loads App.tsx
    'App.tsx',
    'src/features/index.tsx', // Main app routing component
    
    // Test entry points
    '__tests__/**/*.{test,spec}.{ts,tsx}',
    // 'jest.setup.js', // Skip this as it uses Jest globals
    
    // Config files that are executed
    'babel.config.js',
    'metro.config.js',
    'tailwind.config.js',
    'eslint.config.js',
    'prettier.config.js',
    'jest.config.js',
    
    // TypeScript declaration files
    '**/*.d.ts',
    
    // Entry points for screens and features
    'src/features/auth/AuthScreen.tsx',
    'src/features/tasks/TaskScreen.tsx',
    'src/context/AuthContext.tsx',
    'src/shared/components/index.ts',
    'src/shared/utils/index.ts',
  ],
  
  project: [
    'src/**/*.{ts,tsx}',
    'App.tsx',
    '__tests__/**/*.{ts,tsx}',
    '*.{ts,tsx,js}',
  ],
  
  ignore: [
    // Expo/React Native specific ignores
    'ios/**',
    'android/**',
    'node_modules/**',
    'coverage/**',
    'Pods/**',
    
    // Build and generated files
    '.expo/**',
    'dist/**',
    'build/**',
    
    // Assets and static files
    'assets/**',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.ico',
    
    // Config files that might have unused imports
    'global.css',
    'nativewind-env.d.ts',
    'app-env.d.ts',
    'jest.setup.js', // Uses Jest globals not available during analysis
    
    // Coverage and test artifacts
    'coverage/lcov-report/**',
  ],
  
  ignoreBinaries: [
    // Expo CLI and React Native tools
    'expo',
    'react-native',
    'pod',
    'xcodebuild',
    'gradle',
  ],
  
  ignoreDependencies: [
    // Expo core - always needed for Expo projects
    'expo',
    'expo-status-bar', // Used by Expo even if not directly imported
    'expo-app-loading', // Used for splash screens
    '@expo/config',
    '@expo/config-plugins',
    '@expo/metro-config',
    '@expo/webpack-config',
    'expo-modules-core',
    'expo-modules-autolinking',
    
    // React Native core
    'react-native',
    'react-native-reanimated', // Used by navigation/animations
    'react-native-gesture-handler', // Used by navigation
    'react-native-screens', // Used by navigation
    'react-native-safe-area-context', // Used by navigation
    
    // Firebase - used even if auto-configured
    '@react-native-firebase/app',
    '@react-native-async-storage/async-storage', // Used by Firebase
    
    // Fonts - loaded dynamically by Expo
    '@expo-google-fonts/inter',
    'expo-font',
    
    // Development and build tools
    '@types/react',
    '@types/react-native',
    'typescript',
    '@babel/core', // Used by Metro bundler
    '@react-native/metro-config', // Used by metro.config.js
    'babel-preset-expo', // Used in babel.config.js
    'metro',
    'metro-resolver',
    'metro-minify-terser', // Used in metro.config.js
    
    // Testing framework
    '@testing-library/react-native',
    '@testing-library/jest-native',
    'jest',
    'jest-expo',
    'jest-environment-jsdom', // Might be used for specific tests
    'react-native-jest-mocks', // Used in jest setup
    'ts-jest', // Used for TypeScript tests
    'react-test-renderer',
    '@types/jest', // TypeScript types for Jest
    
    // Linting and formatting
    'eslint',
    'eslint-config-expo',
    'eslint-config-prettier', // Used in eslint config
    'prettier',
    'prettier-plugin-tailwindcss',
    
    // TailwindCSS and NativeWind
    'tailwindcss',
    'nativewind',
    
    // Chart library - might be used in future
    'react-native-chart-kit',
    'react-native-svg', // Required by chart-kit
    
    // Icons
    'react-native-heroicons',
  ],
  
  // More lenient rules for React Native projects
  rules: {
    files: 'warn', // Files might be loaded dynamically by Expo
    dependencies: 'warn', // Dependencies might be used by Expo/Metro
    devDependencies: 'warn',
    unlisted: 'error', // Should still catch truly unlisted deps
    binaries: 'warn',
    unresolved: 'warn', // Expo has complex resolution
    exports: 'warn', // Components might be exported for future use
    types: 'warn', // Types might be used by inference
  },
  
  // Plugin configurations
  eslint: {
    config: ['eslint.config.js'],
  },
  
  // jest: {
  //   config: ['jest.config.js'],
  //   // Don't include jest.setup.js as it uses Jest globals
  // },
  
  prettier: {
    config: ['prettier.config.js'],
  },
};

export default config;
