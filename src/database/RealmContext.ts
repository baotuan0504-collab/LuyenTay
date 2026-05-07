import { createRealmContext } from "@realm/react";
import { PostSchema, StorySchema, UserSchema } from "./schema";

export const RealmContext = createRealmContext({
  schema: [UserSchema, PostSchema, StorySchema],
  schemaVersion: 1,
});

export const { RealmProvider, useRealm, useQuery, useObject } = RealmContext;
