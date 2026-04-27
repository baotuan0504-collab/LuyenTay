import { useAuth } from "@/context/AuthContext";
import { uploadProfileImage } from "@/lib/supabase/storage";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function More() {
  const { user, updateUser, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftUsername, setDraftUsername] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");
  const router = useRouter();

  const handleUpdateProfileImage = async () => {
    if (!user) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera roll permissions to select a profile image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setIsUpdating(true);
      try {
        const imageUrl = await uploadProfileImage(
          user.id,
          result.assets[0].uri,
        );

        await updateUser({ profileImage: imageUrl });
        Alert.alert("Success", "Profile image updated.");
      } catch (error) {
        console.error("Error updating profile image:", error);
        Alert.alert(
          "Error",
          "Failed to update profile image. Please try again.",
        );
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const startProfileEdit = () => {
    if (!user) return;
    setDraftName(user.name || "");
    setDraftUsername(user.username || "");
    setDraftAvatar(user.avatar || "");
    setIsEditing(true);
  };

  const cancelProfileEdit = () => {
    setIsEditing(false);
  };

  const saveProfileEdit = async () => {
    if (!user) return;
    const payload: Record<string, unknown> = {};
    if (draftName !== user.name) payload.name = draftName;
    if (draftUsername !== user.username) payload.username = draftUsername;
    if (draftAvatar !== user.avatar) payload.avatar = draftAvatar;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUser(payload);
      Alert.alert("Success", "Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
          >
            <View>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.profileImage}
                  cachePolicy={"none"}
                />
              ) : (
                <View
                  style={[styles.profileImage, styles.profileImagePlaceholder]}
                >
                  <Text style={styles.profileImageText}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || "No Name"}</Text>
            <Text style={styles.username}>@{user?.username || "user"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={startProfileEdit}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="person-outline" size={20} color="#2196F3" />
              </View>
              <Text style={styles.menuItemText}>Chỉnh sửa hồ sơ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {isEditing && (
            <View style={styles.editForm}>
              <TextInput
                style={styles.input}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Họ tên"
              />
              <TextInput
                style={styles.input}
                value={draftUsername}
                onChangeText={setDraftUsername}
                placeholder="Tên đăng nhập"
                autoCapitalize="none"
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={saveProfileEdit}
                  disabled={isSavingProfile}
                >
                  <Text style={styles.saveButtonText}>
                    {isSavingProfile ? "Đang lưu..." : "Lưu"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={cancelProfileEdit}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="notifications-outline" size={20} color="#9C27B0" />
              </View>
              <Text style={styles.menuItemText}>Thông báo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.menuItemText}>Quyền riêng tư</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khác</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="help-circle-outline" size={20} color="#FF9800" />
              </View>
              <Text style={styles.menuItemText}>Trợ giúp & Hỗ trợ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="log-out-outline" size={20} color="#F44336" />
              </View>
              <Text style={[styles.menuItemText, { color: '#F44336' }]}>Đăng xuất</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFF",
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ADB5BD",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#212529",
  },
  username: {
    fontSize: 15,
    color: "#6C757D",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#FFF",
    marginBottom: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C757D",
    textTransform: "uppercase",
    marginLeft: 16,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#212529",
  },
  editForm: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DEE2E6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#DEE2E6",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#495057",
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: "#ADB5BD",
    fontSize: 12,
    marginTop: 20,
  }
});
