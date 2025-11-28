import { cn } from "@/src/lib/utils/cn";
import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const inputClasses = cn(
      "flex-1 py-3 px-4 text-base text-gray-900",
      leftIcon ? "pl-2" : "",
      rightIcon ? "pr-2" : "",
      className,
    );

    const containerClasses = cn(
      "border-2 rounded-xl flex-row items-center bg-white",
      error ? "border-red-500" : "border-gray-200 focus:border-blue-500",
      containerClassName,
    );

    return (
      <View className="w-full">
        {label && (
          <Text className="text-sm font-semibold text-gray-700 mb-2 px-1">
            {label}
          </Text>
        )}

        <View className={containerClasses}>
          {leftIcon && <View className="pl-3">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className={inputClasses}
            placeholderTextColor="#9CA3AF"
            {...props}
          />

          {rightIcon && <View className="pr-3">{rightIcon}</View>}
        </View>

        {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}

        {helperText && !error && (
          <Text className="text-sm text-gray-500 mt-1">{helperText}</Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
