import { supabase } from "./client";

const getFileBlob = async (uri: string) => {
  if (uri.startsWith("file://")) {
    return await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.onerror = () => {
        reject(new Error(`Failed to read file at ${uri}`));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

export const uploadProfileImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg";
    const fileName = `${userId}/profile.${fileExtension}`;
    const blob = await getFileBlob(imageUri);

    const { error } = await supabase.storage
      .from("profiles")
      .upload(fileName, blob, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(fileName);

    return `${urlData.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

export const uploadPostImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg";
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const blob = await getFileBlob(imageUri);

    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, blob, {
        contentType: `image/${fileExtension}`,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading post image:", error);
    throw error;
  }
};

export const uploadPostVideo = async (userId: string, videoUri: string) => {
  try {
    const fileExtension = videoUri.split(".").pop() || "mp4";
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const blob = await getFileBlob(videoUri);

    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, blob, {
        contentType: `video/${fileExtension === "mov" ? "quicktime" : fileExtension === "mp4" ? "video/mp4" : "video/mp4"}`,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading post video:", error);
    throw error;
  }
}