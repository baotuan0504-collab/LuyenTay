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

export const register = async (email: string, password: string, name = "") => {
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
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const data = await apiFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    console.log("Token refresh successful:", data);
    return data;
  } catch (error) {
    throw error;
  }
}