import { FieldNamesMarkedBoolean } from "react-hook-form";

export const parseToFormData = <T extends object>(
  data: Partial<T>,
  imgKey?: string[],
  dirtyFields?: Partial<FieldNamesMarkedBoolean<T>>,
): T => {
  const formData = new FormData();
  const filterData = filterDirtyData(data, dirtyFields);

  Object.entries(filterData).forEach(([key, value]) => {
    if (imgKey?.includes(key) && value) {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v instanceof File || ("uri" in v && v.uri)) {
            formData.append(key, v);
          }
        });
      }
      if (
        value instanceof File ||
        (typeof value === "object" && "uri" in value && value.uri)
      ) {
        formData.append(key, value as any);
      }
      return;
    }
    if (Array.isArray(value)) {
      return formData.append(key, JSON.stringify(value));
    } else if (value instanceof FileList) {
      for (let i = 0; i < value.length; i++) {
        if (value[i]) formData.append(key, value[i] as Blob);
      }
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      if ((String(value) && typeof value !== "undefined") || value === "") {
        formData.append(key, String(value));
      }
    }
  });

  return formData as T;
};

export const filterDirtyData = <T extends Record<string, any>>(
  data: T,
  dirtyFields?: Partial<FieldNamesMarkedBoolean<T>>,
): Partial<T> => {
  const filteredData: Partial<T> = {};
  if (!dirtyFields) return data;

  Object.entries(data).forEach(([key, value]) => {
    const isDirty = dirtyFields[key as keyof typeof dirtyFields];

    if (!isDirty) return;

    if (
      !Array.isArray(isDirty) &&
      typeof isDirty === "object" &&
      typeof value === "object" &&
      value !== null
    ) {
      const nestedFilteredData = filterDirtyData<T>(value, isDirty);
      if (Object.keys(nestedFilteredData).length > 0) {
        filteredData[key as keyof T] = nestedFilteredData as T[keyof T];
      }
    } else {
      filteredData[key as keyof typeof filteredData] = value;
    }
  });

  return filteredData;
};
