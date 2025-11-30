import {
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import React from "react";
import { Text } from "react-native";
import { Button } from "./Button";

export interface AlertAction {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
  render?: (onClose: () => void) => React.ReactNode;
}

export interface AppAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actions: AlertAction[];
}

export const AppAlertDialog: React.FC<AppAlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actions,
}) => {
  return (
      <AlertDialog isOpen={isOpen} onClose={onClose} size="md">
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-white rounded-2xl p-0 overflow-hidden shadow-xl border-0 w-[90%] max-w-[400px]">
          <AlertDialogHeader className="px-6 pt-6 pb-2">
            <Text className="text-xl font-bold text-gray-900 tracking-tight">
              {title}
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody className="px-6 py-2">
            <Text className="text-base text-gray-600 leading-relaxed">
              {description}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="p-6 flex-col gap-3 border-t border-gray-100 mt-4 bg-gray-50/50">
            {actions.map((action, index) => {
              if (action.render) {
                return (
                  <React.Fragment key={index}>
                    {action.render(onClose)}
                  </React.Fragment>
                );
              }
              return (
                <Button
                  key={index}
                  onPress={() => {
                    if (action.onPress) action.onPress();
                    onClose();
                  }}
                  variant={
                    action.style === "destructive"
                      ? "danger"
                      : action.style === "cancel"
                      ? "ghost"
                      : "primary"
                  }
                  size="lg"
                  fullWidth
                  className={action.style === "cancel" ? "mt-1" : "shadow-sm"}
                >
                  {action.text}
                </Button>
              );
            })}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  );
};
