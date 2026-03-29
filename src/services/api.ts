
const BASE_URL = "http://192.168.38.103:5201/api";

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
    throw new Error(message);
  }

  return data;
}