import { FieldNamesMarkedBoolean } from "react-hook-form";

/**
 * Detects a "file" value across environments.
 *
 * React Native has no DOM, so the `File`/`Blob` globals may not exist and file
 * pickers return plain objects shaped like `{ uri, name, type }`. We therefore
 * duck-type by the `uri` property first, and only fall back to `instanceof`
 * checks when those globals actually exist (web / jsdom) — guarded so they
 * never throw a ReferenceError in React Native.
 */
const isFileLike = (value: unknown): boolean => {
  if (value === null || typeof value !== "object") return false;
  // React Native (and web file-ish objects): identify by shape.
  if ("uri" in value && typeof (value as { uri?: unknown }).uri === "string") {
    return true;
  }
  // Web / jsdom: real File or Blob instances.
  if (typeof File !== "undefined" && value instanceof File) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  return false;
};

export const parseToFormData = <T extends object>(
  data: Partial<T>,
  imgKey?: string[],
  dirtyFields?: Partial<FieldNamesMarkedBoolean<T>>,
): T => {
  const formData = new FormData();
  const filterData = filterDirtyData(data, dirtyFields);

  Object.entries(filterData).forEach(([key, value]) => {
    // File fields: append each file part directly (never JSON-stringify them).
    if (imgKey?.includes(key) && value) {
      const files = Array.isArray(value) ? value : [value];
      files.forEach((file) => {
        if (isFileLike(file)) {
          formData.append(key, file as any);
        }
      });
      return;
    }

    if (value === undefined || value === null) return;

    // Arrays and objects must be JSON-stringified — multipart/form-data only
    // carries strings, so the backend will JSON.parse these fields.
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
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
