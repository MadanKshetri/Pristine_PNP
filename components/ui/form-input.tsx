import React from "react";
import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { AlertCircleIcon } from "lucide-react-native";

import { Input, InputField } from "./input";

import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "./form-control";

type TProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  label?: string;
  name: TName;
  helperText?: string;

  form?: UseFormReturn<TFieldValues>;
  control?: Control<TFieldValues>;
  inputProps?: React.ComponentProps<typeof InputField>;

  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  render?: (props: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
  }) => React.ReactNode;
};

export default function FormInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  helperText,
  form,
  control,
  inputProps,
  placeholder,
  disabled,
  readOnly,
  required,
  render,
}: TProps<TFieldValues, TName>) {
  const finalControl = control || form?.control;

  if (!finalControl) {
    throw new Error("Either `form` or `control` must be provided to FormInput");
  }

  return (
    <Controller
      control={finalControl}
      name={name}
      render={({ field, fieldState }) => {
        const isInvalid = !!fieldState.error;

        return (
          <FormControl
            isInvalid={isInvalid}
            size="sm"
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
            className="my-1"
          >
            {label && (
              <FormControlLabel>
                <FormControlLabelText>{label}</FormControlLabelText>
              </FormControlLabel>
            )}

            {render ? (
              render({
                field,
                fieldState: fieldState,
              })
            ) : (
              <Input className="my-1 rounded-xl h-12">
                <InputField
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  placeholder={placeholder}
                  {...inputProps}
                />
              </Input>
            )}

            {helperText && (
              <FormControlHelper>
                <FormControlHelperText>{helperText}</FormControlHelperText>
              </FormControlHelper>
            )}

            {isInvalid && (
              <FormControlError>
                <FormControlErrorIcon
                  as={AlertCircleIcon}
                  className="text-red-500"
                />

                <FormControlErrorText className="text-red-500">
                  {fieldState.error?.message}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        );
      }}
    />
  );
}
