import { apiFetch } from "./api"

export const trustDevice = async (email: string) => {
  try {
    const data = await apiFetch("/auth/trust-device", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
    return data
  } catch (error) {
    throw error
  }
}
