import { useAuthControllerLogin } from "@/fetchers/queriesComponents";
import { Button, Input } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Text, View } from "react-native";

export const LoginScreen = () => {
  const router = useRouter();
  const { mutateAsync: sendLoginOtp, isPending: isLoginPending } =
    useAuthControllerLogin({});

  const [email, setEmail] = useState("");
  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      await sendLoginOtp(
        { body: { email } },
        {
          onSuccess: () => {
            router.push({
              pathname: "/(auth)/otp-verify",
              params: { email },
            });
          },
          onError: (error: unknown) => {
            Alert.alert(
              "Error",
              (error as any)?.message || "Failed to send OTP",
            );
          },
        },
      );
    } catch (error) {
      console.log("Login error caught:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-transparent p-6"
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
          isLoading={isLoginPending}
          disabled={isLoginPending}
          fullWidth
          size="lg"
          className="shadow-xl mb-6"
        >
          <Text className="text-white text-lg font-bold">Continue</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};
