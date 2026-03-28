import { apiFetch } from "./api";

export const login = async (email: string, password: string) => {
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    console.log("Login successful:", data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const register = async (name: string, email: string, password: string) => {
  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    console.log("Registration successful:", data);
    return data;
  } catch (error) {
    throw error;
  }
}