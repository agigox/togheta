import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../src/shared/components/Button';

// Mock the Icon component
jest.mock('../../../src/shared/components/Icon', () => ({
  Icon: ({ name }: { name: string }) => null,
}));

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders with title correctly', () => {
    const { getByText } = render(<Button title="Test Button" onPress={mockOnPress} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(<Button title="Test Button" onPress={mockOnPress} />);
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = render(
      <Button title="Disabled Button" onPress={mockOnPress} disabled={true} />
    );
    fireEvent.press(getByText('Disabled Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading text when loading', () => {
    const { getByText, queryByText } = render(
      <Button title="Submit" onPress={mockOnPress} loading={true} />
    );
    expect(getByText('Loading...')).toBeTruthy();
    expect(queryByText('Submit')).toBeNull();
  });

  it('does not call onPress when loading', () => {
    const { getByText } = render(<Button title="Submit" onPress={mockOnPress} loading={true} />);
    fireEvent.press(getByText('Loading...'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies correct variant styles', () => {
    const { getByTestId: getPrimary } = render(
      <Button title="Primary" onPress={mockOnPress} variant="primary" testID="primary-btn" />
    );
    const { getByTestId: getSecondary } = render(
      <Button title="Secondary" onPress={mockOnPress} variant="secondary" testID="secondary-btn" />
    );

    const primaryBtn = getPrimary('primary-btn');
    const secondaryBtn = getSecondary('secondary-btn');

    expect(primaryBtn.props.className).toContain('bg-accent');
    expect(secondaryBtn.props.className).toContain('bg-primary');
  });

  it('applies full width when specified', () => {
    const { getByTestId } = render(
      <Button title="Full Width" onPress={mockOnPress} fullWidth={true} testID="full-width-btn" />
    );
    const button = getByTestId('full-width-btn');
    expect(button.props.className).toContain('w-full');
  });

  it('applies correct size classes', () => {
    const { getByTestId: getSmall } = render(
      <Button title="Small" onPress={mockOnPress} size="sm" testID="small-btn" />
    );
    const { getByTestId: getLarge } = render(
      <Button title="Large" onPress={mockOnPress} size="lg" testID="large-btn" />
    );

    const smallBtn = getSmall('small-btn');
    const largeBtn = getLarge('large-btn');

    expect(smallBtn.props.className).toContain('px-3');
    expect(smallBtn.props.className).toContain('py-2');
    expect(largeBtn.props.className).toContain('px-6');
    expect(largeBtn.props.className).toContain('py-4');
  });

  describe('Accessibility', () => {
    it('has proper accessibility role', () => {
      const { getByRole } = render(<Button title="Accessible Button" onPress={mockOnPress} />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('sets accessibility state correctly when disabled', () => {
      const { getByTestId } = render(
        <Button title="Disabled" onPress={mockOnPress} disabled={true} testID="disabled-btn" />
      );
      const button = getByTestId('disabled-btn');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Icon Integration', () => {
    it('renders with PlusIcon correctly', () => {
      const { getByText } = render(
        <Button title="Add Item" onPress={mockOnPress} icon="PlusIcon" />
      );
      expect(getByText('Add Item')).toBeTruthy();
    });

    it('renders with CheckIcon correctly', () => {
      const { getByText } = render(
        <Button title="Complete" onPress={mockOnPress} icon="CheckIcon" />
      );
      expect(getByText('Complete')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('handles rapid consecutive presses without issues', () => {
      const { getByText } = render(<Button title="Rapid" onPress={mockOnPress} />);
      const button = getByText('Rapid');

      // Simulate rapid pressing
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(mockOnPress).toHaveBeenCalledTimes(10);
    });
  });
});
