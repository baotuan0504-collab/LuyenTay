import Realm from "realm";
import { PostSchema, StorySchema, UserSchema } from "./schema";

export const savePostsToRealm = (realm: Realm, posts: any[]) => {
  console.log(`[RealmService] Đang lưu ${posts.length} bài viết vào Realm...`);
  realm.write(() => {
    posts.forEach((post) => {
      if (!post.user) return;
      // Create or update User
      const user = realm.create(
        UserSchema,
        {
          _id: post.user._id,
          name: post.user.name,
          username: post.user.username,
          avatar: post.user.avatar,
          coverPhoto: post.user.coverPhoto,
          school: post.user.school,
          hometown: post.user.hometown,
          relationship: post.user.relationship,
          birthday: post.user.birthday,
          interests: post.user.interests,
        },
        Realm.UpdateMode.Modified
      );

      // Create or update Post
      realm.create(
        PostSchema,
        {
          _id: post._id,
          user_id: post.user._id,
          imageUrl: post.imageUrl,
          videoUrl: post.videoUrl,
          description: post.description,
          createdAt: post.createdAt,
          expiresAt: post.expiresAt,
          isActive: post.isActive,
          user: user,
          privacy: post.privacy || "public",
          reactionCounts: JSON.stringify(post.reactionCounts || {}),
          myReaction: post.myReaction,
        },
        Realm.UpdateMode.Modified
      );
    });
  });
  console.log("[RealmService] Lưu bài viết thành công.");
};

export const saveStoriesToRealm = (realm: Realm, stories: any[]) => {
  console.log(`[RealmService] Đang lưu ${stories.length} stories vào Realm...`);
  realm.write(() => {
    stories.forEach((story) => {
      if (!story.user) return;
      // Create or update User
      const user = realm.create(
        UserSchema,
        {
          _id: story.user._id,
          name: story.user.name,
          username: story.user.username,
          avatar: story.user.avatar,
          coverPhoto: story.user.coverPhoto,
          school: story.user.school,
          hometown: story.user.hometown,
          relationship: story.user.relationship,
          birthday: story.user.birthday,
          interests: story.user.interests,
        },
        Realm.UpdateMode.Modified
      );

      // Create or update Story
      realm.create(
        StorySchema,
        {
          _id: story._id,
          user_id: story.user._id,
          imageUrl: story.imageUrl,
          videoUrl: story.videoUrl,
          description: story.description,
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
          isActive: story.isActive,
          user: user,
        },
        Realm.UpdateMode.Modified
      );
    });
  });
  console.log("[RealmService] Lưu stories thành công.");
};

export const saveUserProfileToRealm = (realm: Realm, user: any) => {
  console.log(`[RealmService] Đang cập nhật profile cho: ${user.name}`);
  realm.write(() => {
    realm.create(
      UserSchema,
      {
        _id: user.id || user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        coverPhoto: user.coverPhoto,
        school: user.school,
        hometown: user.hometown,
        relationship: user.relationship,
        birthday: user.birthday,
        interests: user.interests,
      },
      Realm.UpdateMode.Modified
    );
  });
  console.log("[RealmService] Cập nhật profile thành công.");
};

export const deletePostFromRealm = (realm: Realm, postId: string) => {
  realm.write(() => {
    const post = realm.objectForPrimaryKey(PostSchema, postId);
    if (post) {
      realm.delete(post);
      console.log(`[RealmService] Đã xóa bài viết ${postId} khỏi Realm.`);
    }
  });
};
