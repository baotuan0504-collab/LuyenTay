import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNotification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function NotificationsScreen() {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotification();
  const router = useRouter();

  const handleNotificationPress = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    if (notification.type === 'REACTION' || notification.type === 'COMMENT') {
      if (notification.referenceType === 'STORY') {
        router.push(`/`); // Fallback for story
        return;
      }

      const targetPostId = notification.postId || (notification.referenceType === 'POST' ? notification.referenceId : null);
      if (targetPostId) {
        router.push(`/post/${targetPostId}`);
      } else {
        router.push(`/`); // Fallback if postId is somehow missing
      }
    } else if (notification.type === 'FRIEND_REQUEST' || notification.type === 'FRIEND_ACCEPT') {
      router.push(`/profile/${notification.sender._id}`);
    }
  };

  const getNotificationText = (notification: any) => {
    const name = notification.sender?.name || 'Someone';
    switch (notification.type) {
      case 'REACTION':
        return <Text><Text style={styles.bold}>{name}</Text> đã bày tỏ cảm xúc về {notification.referenceType === 'COMMENT' ? 'bình luận' : notification.referenceType === 'STORY' ? 'tin' : 'bài viết'} của bạn.</Text>;
      case 'COMMENT':
        return <Text><Text style={styles.bold}>{name}</Text> đã bình luận về {notification.referenceType === 'COMMENT' ? 'bình luận' : 'bài viết'} của bạn.</Text>;
      case 'FRIEND_REQUEST':
        return <Text><Text style={styles.bold}>{name}</Text> đã gửi cho bạn một lời mời kết bạn.</Text>;
      case 'FRIEND_ACCEPT':
        return <Text><Text style={styles.bold}>{name}</Text> đã chấp nhận lời mời kết bạn của bạn.</Text>;
      default:
        return <Text><Text style={styles.bold}>{name}</Text> đã tương tác với bạn.</Text>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'REACTION': return { name: 'heart', color: '#FF3B30', bg: '#FFE5E5' };
      case 'COMMENT': return { name: 'chatbubble', color: '#34C759', bg: '#E5F9EA' };
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPT': return { name: 'person-add', color: '#007AFF', bg: '#E5F0FF' };
      default: return { name: 'notifications', color: '#8E8E93', bg: '#F2F2F7' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconData = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={item.sender?.avatar ? { uri: item.sender.avatar } : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.sender?.name || 'U')}&background=random` }} 
            style={styles.avatar} 
          />
          <View style={[styles.iconBadge, { backgroundColor: iconData.bg }]}>
            <Ionicons name={iconData.name as any} size={12} color={iconData.color} />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.messageText}>{getNotificationText(item)}</Text>
          <Text style={[styles.timeText, !item.isRead && styles.unreadTimeText]}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
          </Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllReadText}>Đọc tất cả</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  markAllReadText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  unreadItem: {
    backgroundColor: '#F2F7FF', // Light blue background for unread
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1E8FF',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  unreadTimeText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 12,
  },
});
