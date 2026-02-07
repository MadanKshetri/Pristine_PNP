import { Button, LoadingSpinner } from "@/src/components/ui";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// import { OneSignal } from "react-native-onesignal";

const OTP_LENGTH = 6;

export const OtpVerifyScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, sendOtp, isVerifyingOtp, isSendingOtp } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every((digit) => digit !== "") && !isVerifyingOtp) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join("");

    if (code.length !== OTP_LENGTH) {
      Alert.alert("Error", "Please enter complete OTP");
      return;
    }

    const result = await verifyOtp(params.email, code);

    if (result.success && result.userId) {
      // Login to OneSignal
      // OneSignal.login(result.userId);
      console.log("Logged in to OneSignal with External ID:", result.userId);

      // Navigate to main app after successful verification
      router.replace("/(app)/(tabs)/home");
    } else {
      Alert.alert("Error", result.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    const result = await sendOtp(params.email);

    if (result.success) {
      Alert.alert("Success", "OTP sent successfully");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } else {
      Alert.alert("Error", result.message || "Failed to resend OTP");
    }
  };

  if (isVerifyingOtp) {
    return (
      <View className="flex-1 bg-white">
        <LoadingSpinner fullScreen text="Verifying OTP..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View className="flex-1 px-6 justify-center py-8">
        {/* Header */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-blue-50 rounded-3xl items-center justify-center mb-6 shadow-md">
            <Ionicons name="mail-open" size={48} color="#3B82F6" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-4">
            Verify Code
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-2">
            We&apos;ve sent a 6-digit code to
          </Text>
          <Text className="text-base font-semibold text-blue-600">
            {params.email}
          </Text>
        </View>

        {/* OTP Input */}
        <View className="mb-10">
          <Text className="text-xs font-semibold text-gray-500 text-center mb-4 tracking-wider">
            ENTER CODE
          </Text>
          <View className="flex-row justify-center" style={{ gap: 12 }}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={{
                  width: 48,
                  height: 64,
                  borderWidth: 2,
                  borderColor: otp[index] ? "#3B82F6" : "#D1D5DB",
                  backgroundColor: otp[index] ? "#EFF6FF" : "#FFFFFF",
                  borderRadius: 16,
                  textAlign: "center",
                  fontSize: 24,
                  marginBottom: 24,
                  fontWeight: "700",
                  color: "#111827",
                  shadowColor: otp[index] ? "#3B82F6" : "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: otp[index] ? 0.2 : 0.05,
                  shadowRadius: 4,
                  elevation: otp[index] ? 4 : 1,
                }}
                maxLength={1}
                keyboardType="number-pad"
                value={otp[index]}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                autoFocus={index === 0}
              />
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <Button
          onPress={() => handleVerify()}
          disabled={otp.some((digit) => !digit) || isVerifyingOtp}
          fullWidth
          size="lg"
          className="mb-8 shadow-xl"
        >
          <Text className="text-white text-lg font-bold">
            Verify & Continue
          </Text>
        </Button>

        {/* Resend OTP */}
        <View className="items-center mb-6">
          {canResend ? (
            <TouchableOpacity
              onPress={handleResend}
              disabled={isSendingOtp}
              className="flex-row items-center py-3 px-6 rounded-xl bg-blue-50 active:bg-blue-100"
              activeOpacity={0.7}
            >
              <Ionicons name="reload" size={18} color="#3B82F6" />
              <Text className="text-sm font-semibold text-blue-500 ml-2">
                Resend Code
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center py-3 px-6 rounded-xl bg-gray-50">
              <Ionicons name="time" size={18} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-2">
                Resend in {timer}s
              </Text>
            </View>
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center justify-center py-3 px-4"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text className="text-sm font-semibold text-blue-500 ml-2">
            Change email
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
