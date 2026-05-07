import { useObject, useRealm } from "@/database/RealmContext";
import { saveUserProfileToRealm } from "@/database/realm.service";
import { UserSchema } from "@/database/schema";
import * as userService from "@/services/user.service";
import { useEffect, useState } from "react";

export const useProfile = (userId: string) => {
  const realm = useRealm();
  const profile = useObject(UserSchema, userId);
  const [isLoading, setIsLoading] = useState(!profile);

  useEffect(() => {
    if (profile) {
      console.log(`[useProfile] Đang hiển thị profile của ${profile.name} từ Realm (Offline OK)`);
    } else {
      console.log(`[useProfile] Realm chưa có dữ liệu cho user: ${userId}`);
    }
  }, [profile, userId])

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await userService.getUserById(userId);
      if (data) {
        console.log(`[useProfile] API: Tải profile cho ${data.name} thành công. Đang cập nhật Realm...`);
        saveUserProfileToRealm(realm, data);
      }
    } catch (error) {
      console.warn(`[useProfile] Lỗi kết nối khi tải profile cho ${userId}. App dùng dữ liệu cũ.`);
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, isLoading, refreshProfile: loadProfile };
};
