import { cn } from '@/src/lib/utils/cn';
import React from 'react';
import { ActivityIndicator, Text, View, type ViewProps } from 'react-native';

export interface LoadingSpinnerProps extends ViewProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#3B82F6',
  text,
  fullScreen = false,
  className,
  ...props
}) => {
  const containerClasses = cn(
    'items-center justify-center',
    fullScreen && 'flex-1',
    className
  );

  return (
    <View className={containerClasses} {...props}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-gray-600 mt-3 text-base">{text}</Text>
      )}
    </View>
  );
};
