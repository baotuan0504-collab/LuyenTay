import { apiFetch } from "./api";

export const updateProfile = async (
    profileData: Record<string, unknown>,
    token: string
) => {
    try {
        const data = await apiFetch("/users/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        });
        console.log("Profile updated successfully:", data);
        return data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const checkUsername = async (username: string, token: string) => {
    try {
        const data = await apiFetch(`/users/check-username/${username}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data as { available: boolean };
    } catch (error) {
        console.error("Error checking username:", error);
        throw error;
    }
};