# Testing Guide

## Overview

This project uses Jest and React Native Testing Library for unit testing components.

## Test Structure

Tests are organized to mirror the source code structure:

```
__tests__/
  shared/
    components/
      Button.test.tsx
  features/
    tasks/
      components/
        TaskHeader.test.tsx
        TaskList.test.tsx
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Specific Component Tests

```bash
# Button component only
npm run test:button

# All shared components
npm run test:components
```

## Test Setup

- **Jest Configuration**: `jest.config.js`
- **Setup File**: `jest.setup.js` - Contains mocks and global test setup
- **Mocks**: React Native Heroicons are mocked for testing

## Writing Tests

### Button Component Example

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../src/shared/components/Button';

test('renders and handles press', () => {
  const mockOnPress = jest.fn();
  const { getByText } = render(
    <Button title="Test" onPress={mockOnPress} />
  );

  fireEvent.press(getByText('Test'));
  expect(mockOnPress).toHaveBeenCalled();
});
```

### Best Practices

1. **Mock external dependencies** (icons, navigation, etc.)
2. **Test user interactions** (press, input, etc.)
3. **Test different states** (loading, disabled, error)
4. **Test accessibility** (roles, labels, states)
5. **Keep tests focused** - one concept per test

## Available Test Utilities

- `render()` - Render components
- `fireEvent` - Simulate user interactions
- `screen` - Query rendered elements
- `waitFor()` - Wait for async updates

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%
