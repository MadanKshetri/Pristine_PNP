import { ScreenHeader } from '@/src/components/ui';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SitesScreen() {
  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title="Sites" />
      
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Text className="text-xl font-bold text-gray-900">Sites Screen</Text>
        <Text className="text-sm text-gray-600 mt-2">Manager only - Coming soon...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
