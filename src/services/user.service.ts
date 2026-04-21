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
    } catch (error: any) {
        if (!error?.handled) {
            console.warn("Error updating profile:", error);
        }
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
    } catch (error: any) {
        if (!error?.handled) {
            console.warn("Error checking username:", error);
        }
        throw error;
    }
};

export const getUserById = async (userId: string, token: string) => {
    try {
        const data = await apiFetch(`/users/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error: any) {
        if (!error?.handled) {
            console.warn("Error fetching user by ID:", error);
        }
        throw error;
    }
};

export const getUsers = async (token: string) => {
    try {
        const data = await apiFetch("/users", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data as Array<{ _id: string; name: string; username?: string; avatar?: string; email?: string }>;
    } catch (error: any) {
        if (!error?.handled) {
            console.warn("Error fetching users:", error);
        }
        throw error;
    }
};

export const searchUsers = async (q: string, token: string, friendsOnly: boolean = false) => {
    try {
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        if (friendsOnly) params.append("friendsOnly", "true");
        const data = await apiFetch(`/users/search?${params.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data as Array<{ _id: string; name: string; username?: string; avatar?: string;}>;
        
    } catch (error: any) {
        if (!error?.handled) {
            console.warn("Error searching users:", error);
        }
        throw error;
    }
}