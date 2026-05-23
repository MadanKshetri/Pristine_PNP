import { format } from "date-fns";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { Job } from "../types";
import { ListJobDto } from "@/fetchers/queriesSchemas";

interface JobListCardProps {
  job: ListJobDto;
  onPress: (jobId: string) => void;
}

const getStatusStyle = (status: Job["status"]) => {
  if (status === "Completed") {
    return { bg: "bg-emerald-100", text: "text-emerald-800" };
  }
  if (status === "In Progress") {
    return { bg: "bg-blue-100", text: "text-blue-800" };
  }
  if (status === "Cancelled") {
    return { bg: "bg-red-100", text: "text-red-800" };
  }
  return { bg: "bg-amber-100", text: "text-amber-800" };
};

export const JobListCard: React.FC<JobListCardProps> = ({ job, onPress }) => {
  const jobDate = job.startAt ? new Date(job.startAt) : new Date(job.createdAt);
  const endTime = new Date(jobDate.getTime() + 8 * 60 * 60 * 1000);
  const statusStyle = getStatusStyle(job.status);

  return (
    <TouchableOpacity
      className="bg-white border border-slate-200 rounded-xl p-4 mx-4 mb-3"
      onPress={() => onPress(job.id)}
      activeOpacity={0.9}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 mr-3">
          <Text
            className="text-[15px] font-bold text-slate-900 mb-0.5"
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <Text className="text-xs text-slate-500 font-semibold">
            #{job.jobNumber}
          </Text>
        </View>
        <View className={`px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-[11px] font-bold ${statusStyle.text}`}>
            {job.status}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap">
        <View className="w-1/2 mb-3">
          <Text className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
            Date
          </Text>
          <Text className="text-[13px] text-slate-700 font-medium">
            {format(jobDate, "EEE, MMM d, yyyy")}
          </Text>
        </View>

        <View className="w-1/2 mb-3">
          <Text className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
            Time
          </Text>
          <Text className="text-[13px] text-slate-700 font-medium">
            {`${format(jobDate, "h:mm a")} - ${format(endTime, "h:mm a")}`}
          </Text>
        </View>

        <View className="w-1/2">
          <Text className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
            Site
          </Text>
          <Text
            className="text-[13px] text-slate-700 font-medium"
            numberOfLines={2}
          >
            {job.site?.address.address || "No address available"}
          </Text>
        </View>

        <View className="w-1/2">
          <Text className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
            Assigned Staff
          </Text>
          <Text
            className="text-[13px] text-slate-700 font-medium"
            numberOfLines={1}
          >
            {job.assignedStaff?.name || "Unassigned"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
