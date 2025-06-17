import React from 'react';
import { Pressable, Text } from 'react-native';
import { Icon } from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizes = {
    sm: 'text-2xs',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-accent border-2 border-accent',
          text: 'text-white font-semiBold',
          disabledContainer: 'bg-muted border-muted',
          disabledText: 'text-white',
        };
      case 'secondary':
        return {
          container: 'bg-primary border-2 border-primary',
          text: 'text-white font-semiBold',
          disabledContainer: 'bg-muted border-muted',
          disabledText: 'text-white',
        };
      case 'outline':
        return {
          container: 'bg-background border-2 border-border',
          text: 'text-primary font-medium',
          disabledContainer: 'bg-background border-muted',
          disabledText: 'text-muted',
        };
      case 'ghost':
        return {
          container: 'bg-transparent border-2 border-transparent',
          text: 'text-primary font-medium',
          disabledContainer: 'bg-transparent border-transparent',
          disabledText: 'text-muted',
        };
      default:
        return {
          container: 'bg-accent border-2 border-accent',
          text: 'text-white font-semiBold',
          disabledContainer: 'bg-muted border-muted',
          disabledText: 'text-white',
        };
    }
  };

  const styles = getVariantStyles();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : 'self-start'}
        ${isDisabled ? styles.disabledContainer : styles.container}
        ${isDisabled ? 'opacity-50' : ''}
        flex-row
        items-center justify-center rounded-lg
        active:opacity-80
      `}>
      {icon && iconPosition === 'left' && !loading && (
        <Icon
          name="ArrowPathIcon"
          size={iconSizes[size]}
          color={variant === 'outline' || variant === 'ghost' ? '#111111' : '#FFFFFF'}
          variant="outline"
        />
      )}

      {loading && (
        <Icon
          name="ArrowPathIcon"
          size={iconSizes[size]}
          color={variant === 'outline' || variant === 'ghost' ? '#111111' : '#FFFFFF'}
          variant="outline"
        />
      )}

      <Text
        className={`
          ${textSizes[size]}
          ${isDisabled ? styles.disabledText : styles.text}
          ${(icon && iconPosition === 'left') || loading ? 'ml-2' : ''}
          ${icon && iconPosition === 'right' ? 'mr-2' : ''}
        `}>
        {loading ? 'Loading...' : title}
      </Text>

      {icon && iconPosition === 'right' && !loading && (
        <Icon
          name="ArrowPathIcon"
          size={iconSizes[size]}
          color={variant === 'outline' || variant === 'ghost' ? '#111111' : '#FFFFFF'}
          variant="outline"
        />
      )}
    </Pressable>
  );
};

export default Button;
