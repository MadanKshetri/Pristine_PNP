import {
  useAdminJobControllerAssignStaffToJob,
  useAdminSiteControllerSiteCleaners,
} from "@/fetchers/queriesComponents";
import { useQueryClient } from "@tanstack/react-query";
import { View, Text } from "react-native";
import { TModalProps } from "./registry";
import {
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetScrollView,
} from "@/components/ui/actionsheet";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Button, ButtonText, ButtonSpinner } from "@/components/ui/button";
import { ChevronRight, User } from "lucide-react-native";

export default function SelectCleanerSheet({
  close,
  data,
}: TModalProps<{
  siteId: string;
  jobId: string;
}>) {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useAdminSiteControllerSiteCleaners({
    pathParams: {
      siteId: data.siteId,
    },
  });

  const { mutate, isPending } = useAdminJobControllerAssignStaffToJob({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "job"] });
      close();
    },
  });

  const cleaners = response?.data;

  return (
    <View className="w-full pb-4 px-2">
      <View className="mb-4">
        <Heading size="md" className="text-center">
          Select a Cleaner
        </Heading>
      </View>

      {isLoading ? (
        <View className="py-8 justify-center items-center">
          <Spinner size="large" />
        </View>
      ) : (
        <ActionsheetScrollView className="max-h-[60vh] w-full">
          {cleaners?.map((cleaner) => (
            <ActionsheetItem
              key={cleaner.id}
              onPress={() => {
                if (!isPending) {
                  mutate({
                    pathParams: {
                      jobId: data.jobId,
                      staffId: cleaner.id,
                    },
                  });
                }
              }}
              isDisabled={isPending}
              className="flex-row items-center py-4 px-4 border-b border-outline-100 last:border-b-0 active:bg-background-50"
            >
              <View className="h-10 w-10 rounded-full bg-primary-100 items-center justify-center mr-3">
                <User size={20} color="#0066cc" />
              </View>
              <View className="flex-1">
                <ActionsheetItemText className="font-semibold text-typography-900 text-base">{cleaner.name}</ActionsheetItemText>
                <Text className="text-typography-500 text-sm mt-0.5">Tap to assign</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </ActionsheetItem>
          ))}

          {cleaners?.length === 0 && (
            <View className="py-6 justify-center items-center">
              <ActionsheetItemText className="text-typography-500">
                No cleaners available for this site
              </ActionsheetItemText>
            </View>
          )}
        </ActionsheetScrollView>
      )}

      <View className="mt-4 px-4">
        <Button
          variant="outline"
          onPress={close}
          isDisabled={isPending}
          className="w-full"
        >
          {isPending && <ButtonSpinner />}
          <ButtonText>Cancel</ButtonText>
        </Button>
      </View>
    </View>
  );
}
