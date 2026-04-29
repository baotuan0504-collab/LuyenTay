import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export interface MessageAuthor {
  _id: string;
  name: string;
  avatar?: string;
}

export interface MessageData {
  _id: string;
  text: string;
  sender: MessageAuthor | string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: MessageData;
  isFromMe: boolean;
}

export const MessageBubble = ({ message, isFromMe }: MessageBubbleProps) => {
  return (
    <View style={[styles.wrapper, isFromMe ? styles.myWrapper : styles.otherWrapper]}>
      <View
        style={[
          styles.bubble,
          isFromMe ? styles.myBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.text, isFromMe ? styles.myText : styles.otherText]}>
          {message.text}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.time, isFromMe ? styles.myTime : styles.otherTime]}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 12,
  },
  myWrapper: {
    justifyContent: 'flex-end',
  },
  otherWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: '#0066FF', // Vibrant Premium Blue
    borderBottomRightRadius: 4,
    // Add a slight gradient effect using background color if linear-gradient is not available
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F5',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  myText: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  otherText: {
    color: '#1A1A1A',
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    fontWeight: '500',
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  otherTime: {
    color: '#8E8E93',
  },
});



