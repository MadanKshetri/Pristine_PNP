import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";

const Index = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      {/* Top Container with Gradient */}
      <View className="h-[65%] relative">
        <LinearGradient
          colors={["#06114F", "#017EFE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 items-center justify-center"
        >
          {/* Logo */}
          <View className="items-center">
            <View className="w-32 h-32 bg-white/10 rounded-full items-center justify-center mb-6">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-28 h-28"
                resizeMode="contain"
              />
            </View>
            <View className="items-center px-8">
              <Text className="text-white text-4xl font-bold mb-2">
                Pristine PnP
              </Text>
              <View className="flex-row items-center mt-2">
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text className="text-white/90 text-base ml-2">
                  Professional Cleaning Services
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Wave decoration */}
        <View
          className="absolute bottom-0 w-full h-20 bg-white"
          style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
        />
      </View>

      {/* Content Container */}
      <View className="flex-1 px-8 -mt-8">
        <View className="bg-white rounded-3xl shadow-lg p-8 items-center">
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back!
          </Text>
          <Text className="text-base text-gray-500 text-center mb-8">
            Sign in to manage your cleaning jobs
          </Text>

          {/* Get Started Button */}
          <TouchableOpacity
            className="w-full bg-blue-500 py-4 rounded-xl items-center shadow-lg active:scale-95"
            onPress={() => router.push("/(auth)/login")}
          >
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-bold mr-2">
                Get Started
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Security Badge */}
          <View className="flex-row items-center mt-6">
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            <Text className="text-xs text-gray-500 ml-2">
              Secure & encrypted authentication
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Index;
