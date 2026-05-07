import Realm from "realm";

export class UserSchema extends Realm.Object<UserSchema> {
  _id!: string;
  name!: string;
  username?: string;
  avatar?: string;
  coverPhoto?: string;

  static schema = {
    name: "User",
    primaryKey: "_id",
    properties: {
      _id: "string",
      name: "string",
      username: "string?",
      avatar: "string?",
      coverPhoto: "string?",
    },
  };
}

export class PostSchema extends Realm.Object<PostSchema> {
  _id!: string;
  user_id!: string;
  imageUrl!: string;
  videoUrl?: string;
  description?: string;
  createdAt!: string;
  expiresAt!: string;
  isActive!: boolean;
  user?: UserSchema;
  reactionCounts?: string; // Stored as JSON string
  myReaction?: string;

  static schema = {
    name: "Post",
    primaryKey: "_id",
    properties: {
      _id: "string",
      user_id: "string",
      imageUrl: "string",
      videoUrl: "string?",
      description: "string?",
      createdAt: "string",
      expiresAt: "string",
      isActive: "bool",
      user: "User?",
      reactionCounts: "string?",
      myReaction: "string?",
    },
  };
}

export class StorySchema extends Realm.Object<StorySchema> {
  _id!: string;
  user_id!: string;
  imageUrl!: string;
  videoUrl?: string;
  description?: string;
  createdAt!: string;
  expiresAt!: string;
  isActive!: boolean;
  user?: UserSchema;

  static schema = {
    name: "Story",
    primaryKey: "_id",
    properties: {
      _id: "string",
      user_id: "string",
      imageUrl: "string",
      videoUrl: "string?",
      description: "string?",
      createdAt: "string",
      expiresAt: "string",
      isActive: "bool",
      user: "User?",
    },
  };
}
