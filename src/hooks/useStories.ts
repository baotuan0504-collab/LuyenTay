import { useAuth } from "@/context/AuthContext";
import { uploadPostImage as uploadStoryImage, uploadPostVideo as uploadStoryVideo } from "@/lib/supabase/storage";
import * as storyService from "@/services/story.service";
import { useEffect, useState } from "react";
import { Post as Story } from "./usePosts"; // Using the same Post interface for UI compatibility




export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken } = useAuth();




  useEffect(() => {
    if (accessToken) {
      loadStories();
    }
  }, [accessToken]);




  const loadStories = async () => {
    if (!accessToken) return;




    setIsLoading(true);
    try {
      const storiesData = await storyService.getStories(accessToken);




      const formattedStories: Story[] = storiesData.map((story) => ({
        id: String(story._id),
        user_id: String(story.user._id),
        image_url: story.imageUrl,
        video_url: story.videoUrl,
        description: story.description,
        created_at: story.createdAt,
        expires_at: story.expiresAt,
        is_active: story.isActive,
        profiles: {
          id: String(story.user._id),
          name: story.user.name,
          username: story.user.username,
          profile_image_url: story.user.avatar,
        },
      }));




      setStories(formattedStories);
    } catch (error) {
      console.error("Error in loadStories:", error);
    } finally {
      setIsLoading(false);
    }
  };




  const createStory = async (imageUri: string, description?: string, videoUri?: string) => {
    if (!user || !accessToken) {
      throw new Error("User not authenticated");
    }




    try {
      let imageUrl = "";
      let videoUrl = undefined;




      if (videoUri) {
        // Upload thumbnail (imageUri) and video to Supabase
        console.log("Uploading story thumbnail...");
        imageUrl = await uploadStoryImage(user.id, imageUri);
        console.log("Uploading story video...");
        videoUrl = await uploadStoryVideo(user.id, videoUri);
        console.log("Video upload success:", videoUrl);
      } else {
        // Upload only image to Supabase
        console.log("Uploading story image...");
        imageUrl = await uploadStoryImage(user.id, imageUri);
      }


      console.log("Saving story metadata to backend:", { imageUrl, videoUrl });
      await storyService.createStory(
        {
          imageUrl,
          videoUrl,
          description: description || "",
        },
        accessToken
      );




      // Refresh stories
      await loadStories();
    } catch (error) {
      console.error("Error in createStory:", error);
      throw error;
    }
  };




  const refreshStories = async () => {
    await loadStories();
  };




  return { createStory, stories, refreshStories, isLoading };
};









