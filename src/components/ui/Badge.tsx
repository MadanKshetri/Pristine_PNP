import { cn } from '@/src/lib/utils/cn';
import React from 'react';
import { Text, View, type ViewProps } from 'react-native';

export interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const baseStyles = 'rounded-full items-center justify-center';

  const variantStyles = {
    default: 'bg-gray-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textVariantStyles = {
    default: 'text-gray-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
    info: 'text-blue-700',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const badgeClasses = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const textClasses = cn(
    'font-medium',
    textVariantStyles[variant],
    textSizeStyles[size]
  );

  return (
    <View className={badgeClasses} {...props}>
      <Text className={textClasses}>{children}</Text>
    </View>
  );
};
