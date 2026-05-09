import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "@/context/AuthContext"
import * as userService from "@/services/user.service"
import { uploadProfileImage, uploadCoverImage } from "@/lib/supabase/storage"

export default function EditProfileScreen() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)

  // States cho các trường thông tin
  const [name, setName] = useState(user?.name || "")
  const [school, setSchool] = useState(user?.school || "")
  const [hometown, setHometown] = useState(user?.hometown || "")
  const [relationship, setRelationship] = useState(user?.relationship || "")
  const [birthday, setBirthday] = useState(user?.birthday || "")
  const [interests, setInterests] = useState(user?.interests || "")
  
  const [avatar, setAvatar] = useState(user?.avatar || "")
  const [coverPhoto, setCoverPhoto] = useState(user?.coverPhoto || "")

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setLoading(true)
      try {
        const uploadedUrl = await uploadProfileImage(user!.id, result.assets[0].uri)
        setAvatar(uploadedUrl)
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải ảnh đại diện lên")
      } finally {
        setLoading(false)
      }
    }
  }

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setLoading(true)
      try {
        const uploadedUrl = await uploadCoverImage(user!.id, result.assets[0].uri)
        setCoverPhoto(uploadedUrl)
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải ảnh bìa lên")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Lỗi", "Tên không được để trống")
    
    setLoading(true)
    try {
      await updateUser({
        name,
        school,
        hometown,
        relationship,
        birthday,
        interests,
        avatar,
        coverPhoto
      })
      
      Alert.alert("Thành công", "Đã cập nhật thông tin cá nhân")
      router.back()
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật thông tin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa trang cá nhân</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#1877F2" />
          ) : (
            <Text style={styles.saveBtn}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Hình ảnh */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hình ảnh</Text>
          </View>

          {/* Ảnh bìa */}
          <View style={styles.coverWrapper}>
            <Text style={styles.imageLabel}>Ảnh bìa</Text>
            <TouchableOpacity onPress={pickCover} style={styles.coverContainer}>
              {coverPhoto ? (
                <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
              ) : (
                <View style={[styles.coverPhoto, styles.placeholder]}>
                  <Ionicons name="camera" size={32} color="#666" />
                </View>
              )}
              <View style={styles.editIconBadge}>
                <Ionicons name="pencil" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Ảnh đại diện */}
          <View style={styles.avatarWrapper}>
            <Text style={styles.imageLabel}>Ảnh đại diện</Text>
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholder]}>
                  <Ionicons name="person" size={32} color="#666" />
                </View>
              )}
              <View style={styles.editIconBadgeAvatar}>
                <Ionicons name="pencil" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={20} color="#1877F2" />
              <Text style={styles.label}>Họ và tên</Text>
            </View>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên của bạn"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết về bạn</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="school-outline" size={20} color="#1877F2" />
              <Text style={styles.label}>Trường học</Text>
            </View>
            <TextInput
              style={styles.input}
              value={school}
              onChangeText={setSchool}
              placeholder="Thêm trường học"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="home-outline" size={20} color="#1877F2" />
              <Text style={styles.label}>Quê quán</Text>
            </View>
            <TextInput
              style={styles.input}
              value={hometown}
              onChangeText={setHometown}
              placeholder="Thêm quê quán"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="heart-outline" size={20} color="#1877F2" />
              <Text style={styles.label}>Tình trạng mối quan hệ</Text>
            </View>
            <TextInput
              style={styles.input}
              value={relationship}
              onChangeText={setRelationship}
              placeholder="Độc thân, Hẹn hò, Kết hôn..."
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="calendar-outline" size={20} color="#1877F2" />
              <Text style={styles.label}>Ngày sinh</Text>
            </View>
            <TextInput
              style={styles.input}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="Ví dụ: 01/01/2000"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="star-outline" size={20} color="#1877F2" />
              <Text style={styles.label}>Sở thích</Text>
            </View>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top", paddingTop: 12 }]}
              value={interests}
              onChangeText={setInterests}
              placeholder="Đá bóng, nghe nhạc, du lịch..."
              multiline
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  saveBtn: {
    color: "#1877F2",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#666",
  },
  coverWrapper: {
    marginBottom: 20,
  },
  coverContainer: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#f0f2f5",
    overflow: "hidden",
    position: "relative",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f2f5",
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editIconBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  editIconBadgeAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1877F2",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 15,
    color: "#050505",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 16,
    color: "#050505",
  },
})
