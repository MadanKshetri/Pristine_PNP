import React from "react";
import { CreateJobForm } from "../features/jobs";
import SelectCleanerSheet from "./select-cleaner-modal";

// Define the shape of each modal config
export type ModalConfig<T = any> = {
  type: "modal" | "actionsheet";
  component: React.ComponentType<{ data: T; close: () => void }>;
};

export type TModalProps<TData extends object = object> = {
  data: TData;
  close: () => void;
  callback?: (...args: any[]) => any;
};

// Helper function to enforce type checking on the registry while keeping exact key types
export function createModalRegistry<T extends Record<string, ModalConfig<any>>>(
  registry: T,
): T {
  return registry;
}

/**
 * Register all your modals here.
 * Provide the type ('modal' or 'actionsheet') and the component to render.
 * The component will receive a 'data' prop of the inferred type.
 */
export const MODAL_REGISTRY = createModalRegistry({
  // Example usage:
  // 'example-modal': {
  //   type: 'modal',
  //   component: ExampleModalComponent, // Make sure this component accepts a { data: ExampleDataType } prop
  // },
  // 'example-actionsheet': {
  //   type: 'actionsheet',
  //   component: ExampleActionSheetComponent,
  // }
  "create-job": {
    type: "actionsheet",
    component: CreateJobForm,
  },
  "select-cleaner": {
    type: "actionsheet",
    component: SelectCleanerSheet,
  },
});

export type ModalRegistryType = typeof MODAL_REGISTRY;

// Extract valid modal keys
export type ModalKey = keyof ModalRegistryType;

// Extract data type from the component props of the corresponding modal key
export type ModalData<K extends ModalKey> =
  React.ComponentProps<ModalRegistryType[K]["component"]> extends {
    data: infer D;
  }
    ? D
    : never;
