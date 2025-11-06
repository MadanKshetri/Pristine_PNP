import { useAuthControllerManagerLogin, useAuthControllerStaffLogin } from '@/fetchers/queriesComponents';
import { Button, Input } from '@/src/components/ui';
import type { UserRole } from '@/src/lib/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const LoginScreen = () => {
  const router = useRouter();
  const {mutateAsync: staffLogin, isPending: isStaffLoginPending} = useAuthControllerStaffLogin({});
  const {mutateAsync: managerLogin , isPending: isManagerLoginPending} = useAuthControllerManagerLogin({});
  
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('general');

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if( selectedRole === 'general') {
      await staffLogin({ body: { email } }, {
        onSuccess:  () => {
          router.push({
            pathname: '/(auth)/otp-verify',
            params: { email, role: selectedRole },
          });
        },
        onError: (error) => {
          Alert.alert('Error', (error as any)?.message || 'Failed to send OTP');
        }
      });
    }
    if( selectedRole === 'manager') {
      await managerLogin({ body: { email } }, {
        onSuccess:  () => {
          router.push({
            pathname: '/(auth)/otp-verify',
            params: { email, role: selectedRole },
          });
        },
        onError: (error) => {
          Alert.alert('Error', (error as any)?.message || 'Failed to send OTP');
        }
      });
    }


  };

  const roleOptions: { value: UserRole; label: string; icon: string }[] = [
    {
      value: 'general',
      label: 'Cleaner',
      icon: 'person',
    },
    {
      value: 'manager',
      label: 'Manager',
      icon: 'briefcase',
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className="flex-1 justify-center py-8">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-500 rounded-3xl items-center justify-center mb-6 shadow-lg">
              <Ionicons name="lock-closed" size={36} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </Text>
            <Text className="text-base text-gray-500 text-center px-4">
              Sign in to continue
            </Text>
          </View>

          {/* Role Selection */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-gray-700 mb-4 px-1">
              Select Your Role
            </Text>
            <View className="flex-row gap-4 w-full">
              {roleOptions.map((role) => {
                const isSelected = selectedRole === role.value;
                return (
                  <TouchableOpacity
                    key={role.value}
                    onPress={() => setSelectedRole(role.value)}
                    className={`flex-1 items-center py-8 rounded-3xl border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500 shadow-xl'
                        : 'border-gray-200 bg-white shadow-md'
                    }`}
                    activeOpacity={0.7}
                    style={{
                      shadowColor: isSelected ? '#3B82F6' : '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.3 : 0.1,
                      shadowRadius: 8,
                      elevation: isSelected ? 8 : 2,
                    }}
                  >
                    <View
                      className={`w-20 h-20 rounded-full items-center justify-center mb-4`}
                      style={{
                        backgroundColor: isSelected ? '#FFFFFF' : '#EFF6FF',
                      }}
                    >
                      <Ionicons
                        name={role.icon as any}
                        size={40}
                        color={isSelected ? '#3B82F6' : '#9CA3AF'}
                      />
                    </View>
                    <Text
                      className={`text-lg font-bold`}
                      style={{
                        color: isSelected ? '#FFFFFF' : '#111827',
                      }}
                    >
                      {role.label}
                    </Text>
                    {isSelected && (
                      <View className="absolute top-3 right-3">
                        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-8">
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Ionicons name="mail" size={20} color="#6B7280" />}
            />
          </View>

          {/* Login Button */}
          <Button
            onPress={handleLogin}
            isLoading={ isStaffLoginPending || isManagerLoginPending }
            disabled={ isStaffLoginPending || isManagerLoginPending }
            fullWidth
            size="lg"
            className="shadow-xl mb-6"
          >
            <Text className="text-white text-lg font-bold">Continue</Text>
          </Button>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
