import { useAuthStore } from "@/src/lib/store/authStore";
import type { QueriesContext } from "./queriesContext";

// const baseUrl = "http://192.168.1.83:5000";
const baseUrl = "https://cmsapi.poudelsudeep.com.np";

// Function to get the current auth token
const getAuthToken = (): string | null => {
  return useAuthStore.getState().token;
};

// Function to handle unauthorized access
const handleUnauthorized = () => {
  const { logout } = useAuthStore.getState();
  logout();

  // The auth state change will be picked up by the root layout
  // which will automatically redirect to login
};

export type ErrorWrapper<TError> =
  | TError
  | { status: "unknown"; payload: string };

export type QueriesFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> =
  {
    url: string;
    method: string;
    body?: TBody;
    headers?: THeaders;
    queryParams?: TQueryParams;
    pathParams?: TPathParams;
    signal?: AbortSignal;
  } & QueriesContext["fetcherOptions"];

export async function queriesFetch<
  TData,
  TError,
  TBody extends {} | FormData | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {},
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  signal,
}: QueriesFetcherOptions<
  TBody,
  THeaders,
  TQueryParams,
  TPathParams
>): Promise<TData> {
  let error: ErrorWrapper<TError>;
  try {
    // Automatically inject auth token
    const token = getAuthToken();
    console.log("Using token:", token);
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    // If we're sending FormData, let the browser set the correct multipart boundary
    if (body instanceof FormData) {
      delete (requestHeaders as any)["Content-Type"];
    }

    /**
     * As the fetch API is being used, when multipart/form-data is specified
     * the Content-Type header must be deleted so that the browser can set
     * the correct boundary.
     * https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects#sending_files_using_a_formdata_object
     */
    if (
      requestHeaders["Content-Type"]
        ?.toLowerCase()
        .includes("multipart/form-data")
    ) {
      delete requestHeaders["Content-Type"];
    }

    const response = await window.fetch(
      `${baseUrl}${resolveUrl(url, queryParams, pathParams)}`,
      {
        signal,
        method: method.toUpperCase(),
        body: body
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
        headers: requestHeaders,
      },
    );
    if (!response.ok) {
      // Handle 401 Unauthorized - logout and redirect
      if (response.status === 401) {
        handleUnauthorized();
        throw {
          status: "unauthorized" as const,
          payload: "Your session has expired. Please log in again.",
        };
      }

      try {
        error = await response.json();
      } catch (e) {
        error = {
          status: "unknown" as const,
          payload:
            e instanceof Error
              ? `Unexpected error (${e.message})`
              : "Unexpected error",
        };
      }
    } else if (response.headers.get("content-type")?.includes("json")) {
      return await response.json();
    } else {
      // if it is not a json response, assume it is a blob and cast it to TData
      return (await response.blob()) as unknown as TData;
    }
  } catch (e) {
    const errorObject: Error = {
      name: "unknown" as const,
      message:
        e instanceof Error ? `Network error (${e.message})` : "Network error",
      stack: e as string,
    };
    throw errorObject;
  }
  throw error;
}

const resolveUrl = (
  url: string,
  queryParams: Record<string, string> = {},
  pathParams: Record<string, string> = {},
) => {
  let query = new URLSearchParams(queryParams).toString();
  if (query) query = `?${query}`;
  return (
    url.replace(/\{\w*\}/g, (key) => pathParams[key.slice(1, -1)] ?? "") + query
  );
};
