import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogBackdrop,
} from "@/components/ui/alert-dialog";
import { Button } from "./Button";
import { Text } from "react-native";
import React from "react";

export function AlertBox() {
  const [showAlertDialog, setShowAlertDialog] = React.useState(false);
  const handleClose = () => setShowAlertDialog(false);
  return (
    <>
      <Button onPress={() => setShowAlertDialog(true)}>
        <Text>Pay</Text>
      </Button>
      <AlertDialog isOpen={showAlertDialog} onClose={handleClose}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-0 max-w-[590px] sm:flex-row border-primary-800 rounded-xl">
          <AlertDialogBody
            className=""
            contentContainerClassName="p-6 flex-row justify-between gap-6 md:gap-9 items-center"
          >
            <Button size="sm" className="hidden sm:flex" onPress={handleClose}>
              <Text>Upgrade</Text>
            </Button>
          </AlertDialogBody>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
