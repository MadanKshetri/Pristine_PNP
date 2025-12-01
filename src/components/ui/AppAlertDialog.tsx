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

export interface AppAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  renderFooter?: (onClose: () => void) => React.ReactNode;
}

export interface AlertButtonProps {
  onPress?: () => void;
  variant?: "primary" | "danger" | "ghost";
  children: React.ReactNode;
  autoClose?: boolean;
  onClose?: () => void; // Passed automatically by render prop
}

export const AlertButton: React.FC<AlertButtonProps> = ({
  onPress,
  variant = "primary",
  children,
  autoClose = true,
  onClose,
}) => {
  return (
    <Button
      onPress={() => {
        if (onPress) onPress();
        if (autoClose && onClose) {
          onClose();
        }
      }}
      variant={variant}
      size="lg"
      fullWidth
      className={variant === "ghost" ? "mt-1" : "shadow-sm"}
    >
      {children}
    </Button>
  );
};

export const AppAlertDialog: React.FC<AppAlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  renderFooter,
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
          {renderFooter && renderFooter(onClose)}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
