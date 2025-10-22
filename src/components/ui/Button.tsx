import { cn } from '@/src/lib/utils/cn';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    type TouchableOpacityProps,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-lg items-center justify-center flex-row';

  const variantStyles = {
    primary: 'bg-blue-500 active:bg-blue-600',
    secondary: 'bg-gray-500 active:bg-gray-600',
    outline: 'bg-transparent border-2 border-blue-500 active:bg-blue-50',
    ghost: 'bg-transparent active:bg-gray-100',
    danger: 'bg-red-500 active:bg-red-600',
  };

  const sizeStyles = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8',
  };

  const textBaseStyles = 'font-semibold';

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-blue-500',
    ghost: 'text-gray-700',
    danger: 'text-white',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const buttonClasses = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    (disabled || isLoading) && 'opacity-50',
    className
  );

  const textClasses = cn(
    textBaseStyles,
    textVariantStyles[variant],
    textSizeStyles[size]
  );

  return (
    <TouchableOpacity
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#3B82F6' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text className={textClasses}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};
