import { ManagerGetIncidentDto } from "@/fetchers/queriesSchemas";
import { Card } from "@/src/components/ui";
import { format } from "date-fns";
import { AlertTriangle, MapPin, User, Calendar } from "lucide-react-native";
import { Text, View } from "react-native";

export function IncidentCard({
  incident,
}: {
  incident: ManagerGetIncidentDto;
}) {
  return (
    <Card variant="elevated" className="mb-4 mx-4" padding="md">
      <View className="flex-row items-center mb-4">
        <View className="bg-red-50 p-2.5 rounded-full mr-3.5">
          <AlertTriangle size={22} color="#EF4444" />
        </View>
        <Text className="text-lg font-bold text-gray-900 flex-1 leading-6">
          {incident.title}
        </Text>
      </View>

      {incident.description && (
        <Text className="text-gray-600 text-sm mb-4 leading-relaxed">
          {incident.description}
        </Text>
      )}

      {/* Site Details */}
      {incident.site.title && (
        <View className="flex-row items-start mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <MapPin size={18} color="#4B5563" className="mr-2.5 mt-0.5" />
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900 mb-0.5">
              {incident.site.title}
            </Text>
            {(incident.site as any)?.address && (
              <Text className="text-xs text-gray-500 leading-4">
                {(incident.site as any).address}
              </Text>
            )}
          </View>
        </View>
      )}

      <View className="flex-row justify-between items-center pt-3.5 border-t border-gray-100">
        <View className="flex-row items-center">
          <User size={15} color="#6B7280" className="mr-1.5" />
          <Text className="text-xs text-gray-500 font-medium">
            {incident.reportedBy?.name || "Unknown"}
          </Text>
        </View>

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
