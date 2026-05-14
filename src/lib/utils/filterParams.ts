export function encodeFilterParams(
  params: Record<string, string | number | undefined | null>,
): string {
  return encodeURIComponent(JSON.stringify(params));
}

export function parseFilterParams<T>(
  param: string | string[] | undefined,
): T | undefined {
  if (!param) return undefined;
  try {
    const paramStr = Array.isArray(param) ? param[0] : param;
    return JSON.parse(decodeURIComponent(paramStr));
  } catch (e) {
    console.error("Failed to parse filter params", e);
    return undefined;
  }
}
