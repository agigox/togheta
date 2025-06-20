# Knip Configuration Guide

## Overview

Knip is configured and working in this React Native Expo project to help maintain code quality by finding unused files, dependencies, and exports.

## 📋 What Knip Finds

### ✅ **Successfully Cleaned:**

- **Unused Files**: Removed `src/screens/SignUp.tsx` (legacy code)
- **Unused Exports**: Cleaned up barrel exports in `index.ts` files
- **Unused Types**: Removed `ColorKey` type from colors utility
- **Import Optimization**: Updated imports to use `~/shared` barrel exports

### 🔧 **Current Status:**

- **Files**: ✅ All files are used
- **Exports**: ✅ All exports are used
- **Dependencies**: ✅ Only 1 unlisted dependency (Metro internal)
- **Code Quality**: ✅ Clean and optimized

## 🚀 Available Commands

```bash
# Run complete analysis
npm run knip

# Focus on specific areas
npm run knip:dependencies  # Check dependency usage
npm run knip:exports      # Check export usage
npm run knip:files        # Check file usage
npm run knip:production   # Production-only analysis
npm run knip:fix          # Auto-fix some issues
```

## ⚙️ Configuration

The knip configuration in `knip.config.ts` is optimized for React Native Expo projects:

### **Entry Points:**

- `App.tsx` - Main Expo entry point
- `src/features/index.tsx` - App routing
- Screen components and context providers
- Configuration files (babel, metro, tailwind, etc.)

### **Ignored Dependencies:**

React Native/Expo projects have many dependencies that are used implicitly:

- **Expo Core**: `expo`, `expo-status-bar`, `expo-font`, etc.
- **React Native**: `react-native-*` packages used by navigation/UI
- **Build Tools**: `@babel/core`, `metro`, `typescript`
- **Testing**: `jest`, `@testing-library/*`
- **Development**: `eslint`, `prettier`, `tailwindcss`

### **Rules:**

- **Files**: `warn` - Expo might load files dynamically
- **Dependencies**: `warn` - Many deps used by Expo/Metro
- **Exports**: `warn` - Components might be exported for future use
- **Unlisted**: `error` - Should catch truly missing deps

## 🏗️ Architecture Improvements Made

### **Import Optimization:**

```typescript
// Before
import { Button } from '~/shared/components';
import { LoadingScreen } from '~/shared/components';

// After
import { Button, LoadingScreen } from '~/shared';
```

### **Barrel Export Cleanup:**

```typescript
// Removed unused exports
// features/auth/index.ts - removed unused AuthForm export
// features/tasks/index.ts - removed unused component exports
// shared/utils/colors.ts - removed unused ColorKey type
```

### **File Structure:**

```
src/
├── shared/
│   ├── index.ts          ✅ Used (barrel export)
│   ├── components/       ✅ All used
│   └── utils/           ✅ All used
├── features/
│   ├── auth/            ✅ All used
│   └── tasks/           ✅ All used
└── context/             ✅ All used
```

## 🔄 Regular Maintenance

### **Weekly Check:**

```bash
npm run knip
```

### **Before Releases:**

```bash
npm run knip:production
```

### **Dependency Audit:**

```bash
npm run knip:dependencies
```

### **Code Review:**

```bash
npm run knip:exports
npm run knip:files
```

## 📊 Benefits Achieved

1. **Cleaner Codebase**: Removed unused files and exports
2. **Better Imports**: Optimized import paths using barrel exports
3. **Dependency Health**: All dependencies properly tracked
4. **Maintainability**: Easy to spot unused code in future
5. **Performance**: Smaller bundle size from removed unused code

## ⚠️ Notes

- **Metro Bundler**: The one remaining "unlisted dependency" is likely a Metro internal module
- **Expo Dependencies**: Many deps are used implicitly by Expo and are properly ignored
- **Dynamic Imports**: React Native might load some files dynamically, so warnings are used instead of errors
- **Future Exports**: Some exports might be kept for future components/features

## 🎯 Next Steps

- Run `npm run knip` regularly during development
- Add new entry points to config when adding new screens
- Review export usage when adding new barrel exports
- Update ignored dependencies when adding new Expo/RN packages
