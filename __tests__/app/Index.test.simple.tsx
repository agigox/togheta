import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingScreen } from '../../src/shared';

// Simple test to verify the migration works
describe('Migration verification', () => {
  it('should render LoadingScreen component', () => {
    const { getByText } = render(<LoadingScreen message="Testing..." />);
    expect(getByText('Testing...')).toBeTruthy();
  });

  it('should have working test environment', () => {
    expect(true).toBe(true);
  });
});
