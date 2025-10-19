import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const Index = () => {
  return (
    <View>
      {/* Top Container with Gradient and Background Image */}
      <View className="w-full h-[75%] relative  items-center justify-center rounded-3xl overflow-hidden">
        <LinearGradient
          colors={['#06114F', '#017EFE']}
          start={{ x: 0, y: 0.5 }}    
          end={{ x: 1, y: 0.5 }}
          className="absolute inset-0"
        />
        <Image
          source={require('@/assets/images/logo.png')}
          className="w-60 h-60 "
          resizeMode="contain"
          
        />
      </View>

      {/* Content Container */}
      <View className=" px-8 items-center justify-center pt-2">
        <Text className="text-2xl font-bold text-black mb-1">Welcome To</Text>
        <Text className="text-4xl font-bold text-black mb-2">
          Pristine <Text className="text-blue-500">PnP</Text>
        </Text>
        <Text className="text-base text-gray-600 text-center leading-6 mb-10">
          At Your Services
        </Text>

        {/* Get Started Button */}
        <Link href="/signIn" asChild>
          <TouchableOpacity className="w-full bg-blue-500 py-4 rounded-lg items-center shadow-lg">
            <Text className="text-white text-lg font-bold">Get Started</Text>
          </TouchableOpacity>
        </Link>
      </View>
      </View>
  );
};

export default Index;
