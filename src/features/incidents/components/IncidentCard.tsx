import { AdminListIncidentDto } from "@/fetchers/queriesSchemas";
import { Card } from "@/src/components/ui";
import { format } from "date-fns";
import { AlertTriangle, MapPin, Calendar } from "lucide-react-native";
import { Text, View } from "react-native";

export function IncidentCard({
  incident,
}: {
  incident: AdminListIncidentDto;
}) {
  return (
    <Card variant="elevated" className="mb-4 mx-4" padding="md">
      <View className="flex-row items-center">
        <View className="bg-red-50 p-2.5 rounded-full mr-3.5">
          <AlertTriangle size={22} color="#EF4444" />
        </View>
        <Text className="text-base font-bold text-gray-900 flex-1 leading-6">
          {incident.title}
        </Text>
      </View>

      <View className="flex-row justify-between items-center pt-3.5 mt-3.5 border-t border-gray-100">
        {incident.site?.title && (
          <View className="flex-row items-center flex-1 mr-3">
            <MapPin size={15} color="#6B7280" className="mr-1.5" />
            <Text
              className="text-xs text-gray-500 font-medium flex-1"
              numberOfLines={1}
            >
              {incident.site.title}
            </Text>
          </View>
        )}

        <View className="flex-row items-center">
          <Calendar size={15} color="#6B7280" className="mr-1.5" />
          <Text className="text-xs text-gray-500 font-medium">
            {incident.createdAt
              ? format(new Date(incident.createdAt), "MMM d, yyyy")
              : "-"}
          </Text>
        </View>
      </View>
    </Card>
  );
}
