import { useModal } from "@/src/context/modal-context";
import { ModalData, ModalKey } from "@/src/modal/registry";
import React from "react";
import { Pressable, PressableProps } from "react-native";

export interface ModalTriggerProps<K extends ModalKey>
  extends Omit<PressableProps, "onPress"> {
  modalKey: K;
  data: ModalData<K>;
  onClose?: () => void;
  children: React.ReactNode;
}

export function ModalTrigger<K extends ModalKey>({
  modalKey,
  data,
  onClose,
  children,
  ...pressableProps
}: ModalTriggerProps<K>) {
  const { open } = useModal();

  return (
    <Pressable
      onPress={() => open({ key: modalKey, data, onClose })}
      {...pressableProps}
    >
      {children}
    </Pressable>
  );
}
