import React from 'react';
import { StyleSheet, Text, View } from 'react-native';


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
        <Text style={[styles.time, isFromMe ? styles.myTime : styles.otherTime]}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  myWrapper: {
    justifyContent: 'flex-end',
  },
  otherWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: '#007AFF', // Classic iOS blue
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
  myText: {
    color: '#FFF',
  },
  otherText: {
    color: '#000',
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTime: {
    color: 'rgba(0, 0, 0, 0.4)',
  },
});



