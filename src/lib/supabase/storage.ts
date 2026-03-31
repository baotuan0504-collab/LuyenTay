import { File } from "expo-file-system";
import { supabase } from "./client";


const getFileData = async (uri: string) => {
  try {
    const file = new File(uri);
    return await file.bytes();
  } catch (error) {
    console.error("Error reading file data:", error);
    throw error;
  }
};


export const uploadProfileImage = async (userId: string, imageUri: string) => {
  if (!userId) throw new Error("userId is required for upload");
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg";
    const fileName = `${userId}/profile.${fileExtension}`;
    const data = await getFileData(imageUri);


    const { error } = await supabase.storage
      .from("profiles")
      .upload(fileName, data, {
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
  if (!userId) throw new Error("userId is required for upload");
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg";
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const data = await getFileData(imageUri);


    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, data, {
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
  if (!userId) throw new Error("userId is required for upload");
  try {
    const fileExtension = videoUri.split(".").pop() || "mp4";
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const data = await getFileData(videoUri);


    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, data, {
        contentType: fileExtension === "mov" ? "video/quicktime" : "video/mp4",
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


