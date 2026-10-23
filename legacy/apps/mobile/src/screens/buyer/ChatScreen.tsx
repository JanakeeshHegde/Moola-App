import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../../components/Header';

interface Message {
  id: string;
  sender: 'me' | 'seller';
  text: string;
  time: string;
}

export const ChatScreen: React.FC<{ route: any; navigation?: any }> = ({
  route,
  navigation: _navigation,
}) => {
  const { locale } = useLanguage();
  const recipientName =
    route.params?.recipient?.shopName ||
    route.params?.recipientName ||
    'Basavaraj Gowda (Farmer)';
  const product = route.params?.product;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'seller',
      text:
        locale === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಮ್ಮ ತೋಟದ ನೈಸರ್ಗಿಕ ಉತ್ಪನ್ನಗಳ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿವೆಯೇ?'
          : 'Namaskara! How can I help you regarding our organic harvest?',
      time: '10:30 AM',
    },
    {
      id: 'm2',
      sender: 'me',
      text:
        locale === 'kn'
          ? 'ನಮಸ್ಕಾರ, ಈ ಜೇನುತುಪ್ಪ ಯಾವ ತಿಂಗಳಲ್ಲಿ ಸಂಗ್ರಹಿಸಿದ್ದು?'
          : 'Hello! When was this wild honey batch harvested?',
      time: '10:32 AM',
    },
    {
      id: 'm3',
      sender: 'seller',
      text:
        locale === 'kn'
          ? 'ಇದು ಕಳೆದ ವಾರ ತೀರ್ಥಹಳ್ಳಿಯ ಕಾಡಿನಲ್ಲಿ ಸಂಗ್ರಹಿಸಿದ್ದು. 100% ಶುದ್ಧ ಮತ್ತು ನೈಸರ್ಗಿಕ.'
          : 'Harvested just last week in Thirthahalli forest canopy. Completely raw and unheated.',
      time: '10:33 AM',
    },
  ]);

  const [inputVal, setInputVal] = useState('');

  const quickPrompts = [
    locale === 'kn' ? 'ಪ್ರಮಾಣಪತ್ರ ಇದೆಯೇ?' : 'Is it organic certified?',
    locale === 'kn' ? 'ಇಂದೇ ಕಳುಹಿಸಬಹುದೇ?' : 'Can you dispatch today?',
    locale === 'kn' ? 'ಗಾಜಿನ ಬಾಟಲ್‌ನಲ್ಲಿ ಪ್ಯಾಕ್ ಮಾಡುತ್ತೀರಾ?' : 'Pack in glass jar?',
  ];

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'me',
      text: inputVal.trim(),
      time: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulate instant farmer reply
    setTimeout(() => {
      const replyMsg: Message = {
        id: 'msg_reply_' + Date.now(),
        sender: 'seller',
        text:
          locale === 'kn'
            ? 'ಖಂಡಿತವಾಗಿ, ನಿಮ್ಮ ಆದೇಶದಂತೆ ಪ್ಯಾಕ್ ಮಾಡಿ ಕಳುಹಿಸುತ್ತೇವೆ!'
            : 'Certainly! We will ensure fresh, hygienic packing directly from the farm.',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={`💬 ${recipientName}`} showCart={false} />

      {/* Product Reference Pill */}
      {product && (
        <View style={styles.productBanner}>
          <Text style={styles.productBannerIcon}>🌿</Text>
          <View style={styles.productBannerInfo}>
            <Text style={styles.productBannerName}>{product.name}</Text>
            <Text style={styles.productBannerPrice}>
              ₹{product.price} / {product.unit}
            </Text>
          </View>
        </View>
      )}

      {/* Messages ScrollView */}
      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => {
          const isMe = m.sender === 'me';
          return (
            <View
              key={m.id}
              style={[
                styles.messageBubbleWrapper,
                isMe ? styles.wrapperMe : styles.wrapperSeller,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.bubbleMe : styles.bubbleSeller,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMe ? styles.textMe : styles.textSeller,
                  ]}
                >
                  {m.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    isMe ? styles.timeMe : styles.timeSeller,
                  ]}
                >
                  {m.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Prompts Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.promptsScroll}
        contentContainerStyle={styles.promptsContent}
      >
        {quickPrompts.map((prompt, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.promptChip}
            onPress={() => setInputVal(prompt)}
            activeOpacity={0.7}
          >
            <Text style={styles.promptChipText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder={
            locale === 'kn' ? 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...' : 'Type a message to the farmer...'
          }
          placeholderTextColor={colors.textMuted}
          value={inputVal}
          onChangeText={setInputVal}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.8}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6EF',
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productBannerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  productBannerInfo: {
    flex: 1,
  },
  productBannerName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  productBannerPrice: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 10,
  },
  messageBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  wrapperMe: {
    justifyContent: 'flex-end',
  },
  wrapperSeller: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleSeller: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  textMe: {
    color: colors.textInverse,
  },
  textSeller: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeMe: {
    color: '#D1E7DD',
  },
  timeSeller: {
    color: colors.textMuted,
  },
  promptsScroll: {
    maxHeight: 44,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  promptsContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  promptChip: {
    backgroundColor: colors.surface,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptChipText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.textPrimary,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: colors.textInverse,
    fontSize: 16,
    marginLeft: 2,
  },
});
