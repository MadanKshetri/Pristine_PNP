import { cn } from '@/src/lib/utils/cn';
import React from 'react';
import { View, type ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-xl';

  const variantStyles = {
    default: '',
    elevated: 'shadow-lg',
    outlined: 'border border-gray-200',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const cardClasses = cn(
    baseStyles,
    variantStyles[variant],
    paddingStyles[padding],
    className
  );

  return (
    <View className={cardClasses} {...props}>
      {children}
    </View>
  );
};
