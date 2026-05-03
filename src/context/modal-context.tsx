import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Modal, ModalBackdrop, ModalContent } from "@/components/ui/modal";
import React, { createContext, useCallback, useContext, useState } from "react";
import { MODAL_REGISTRY, ModalData, ModalKey } from "../modal/registry";

type ModalInstance<K extends ModalKey = ModalKey> = {
  id: string;
  key: K;
  data: ModalData<K>;
  onClose?: () => void;
};

type TOpenProps<K extends ModalKey> = {
  key: K;
  data: ModalData<K>;
  onClose?: () => void;
};

interface ModalContextValue {
  open: <K extends ModalKey>(props: TOpenProps<K>) => void;
  /**
   * Closes a specific modal by ID if provided, otherwise closes the most recently opened one.
   * This is generally not needed since the modal components receive a `close` prop.
   */
  close: (id?: string) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

let nextModalId = 1;

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modals, setModals] = useState<ModalInstance[]>([]);

  const open = useCallback(
    <K extends ModalKey>({ key, data, onClose }: TOpenProps<K>) => {
      const id = `modal_${nextModalId++}_${Date.now()}`;
      setModals((prev) => [...prev, { id, key, data, onClose }] as any);
    },
    [],
  );

  const close = useCallback((id?: string) => {
    setModals((prev) => {
      if (prev.length === 0) return prev;

      const targetId = id || prev[prev.length - 1].id;
      const modalToClose = prev.find((m) => m.id === targetId);

      if (modalToClose?.onClose) {
        modalToClose.onClose();
      }

      return prev.filter((m) => m.id !== targetId);
    });
  }, []);

  const renderModals = () => {
    return modals.map((modal) => {
      const { id, key, data } = modal;
      const config = MODAL_REGISTRY[key];

      if (!config) {
        console.warn(`Modal key "${key}" not found in registry.`);
        return null;
      }

      const Component = config.component as React.ComponentType<any>;
      const handleClose = () => close(id);

      if (config.type === "actionsheet") {
        return (
          <Actionsheet key={id} isOpen={true} onClose={handleClose}>
            <ActionsheetBackdrop />
            <ActionsheetContent>
              <ActionsheetDragIndicatorWrapper>
                <ActionsheetDragIndicator />
              </ActionsheetDragIndicatorWrapper>
              <Component data={data} close={handleClose} />
            </ActionsheetContent>
          </Actionsheet>
        );
      }

      // Default to modal
      return (
        <Modal key={id} isOpen={true} onClose={handleClose} size="md">
          <ModalBackdrop />
          <ModalContent>
            <Component data={data} close={handleClose} />
          </ModalContent>
        </Modal>
      );
    });
  };

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {renderModals()}
    </ModalContext.Provider>
  );
};
