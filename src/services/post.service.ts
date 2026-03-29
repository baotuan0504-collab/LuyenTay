import { apiFetch } from "./api";


export interface PostResponse {
  _id: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
  };
  imageUrl: string;
  description?: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export const createPost = async (
  postData: { imageUrl: string; description?: string },
  token: string
): Promise<PostResponse> => {
  try {
    const data = await apiFetch("/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    return data as PostResponse;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};


export const getPosts = async (token: string): Promise<PostResponse[]> => {
  try {
    const data = await apiFetch("/posts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data as PostResponse[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};



