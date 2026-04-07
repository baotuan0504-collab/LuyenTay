
const BASE_URL = "http://10.10.33.245:5201/api";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isUnauthorizedError = (error: unknown): error is ApiError => {
  return error instanceof ApiError && error.status === 401;
};

export const apiFetch = async (
    endpoint: string,
    options: RequestInit = {}
) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || response.statusText || "Request failed";
    throw new ApiError(message, response.status);
  }

  return data;
}