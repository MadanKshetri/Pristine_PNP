import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  TouchableOpacity,
  View,
  Text,
  ColorValue,
  StyleSheet,
  Dimensions,
} from "react-native";

type AnalyticsCardProps = {
  item: {
    id: number;
    icon: React.ComponentType<{
      size: number;
      color: string;
      strokeWidth: number;
    }>;
    value: string;
    title: string;
    gradient: [ColorValue, ColorValue, ...ColorValue[]];
  };
};

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export const AnalyticsCard = ({ item }: AnalyticsCardProps) => {
  return (
    <View key={item.id} style={[analyticsStyles.analyticsCardWrapper]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/(tabs)/jobs")}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={analyticsStyles.analyticsCard}
        >
          <View style={analyticsStyles.cardIconContainer}>
            <item.icon size={28} color="#ffffff" strokeWidth={2.5} />
          </View>
          <Text style={analyticsStyles.cardValue}>{item.value}</Text>
          <Text style={analyticsStyles.cardTitle}>{item.title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const analyticsStyles = StyleSheet.create({
  analyticsCardWrapper: {
    marginBottom: 16,
  },
  analyticsCard: {
    width: cardWidth,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
});
