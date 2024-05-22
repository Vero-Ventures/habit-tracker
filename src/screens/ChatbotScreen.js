import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
const { GoogleGenerativeAI } = require('@google/generative-ai');
const apikey = process.env.EXPO_PUBLIC_REACT_APP_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apikey);

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  const handleSend = async () => {
    if (input.trim().length === 0) return;
    const newMessages = [...messages, { type: 'user', text: input }];
    setMessages(newMessages);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [
              {
                text: 'Hello, I would like you to be my healthy habits coach and give me advice about meeting my habit goals',
              },
            ],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Great to meet you. I would love to help. What are your habit goals?',
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 6000,
        },
      });

      const result = await chat.sendMessage(input);
      const response = await result.response;
      const text = await response.text();
      setMessages([...newMessages, { type: 'bot', text }]);
    } catch (error) {
      console.error('Error handling send:', error);
      setMessages([
        ...newMessages,
        {
          type: 'bot',
          text: 'Service is currently unavailable. Please try again later.',
        },
      ]);
    }

    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <Text style={styles.title}>Talk to Your Habit Coach!</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <Text
            style={
              item.type === 'user' ? styles.userMessage : styles.botMessage
            }>
            {item.text}
          </Text>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messageList}
        onContentSizeChange={() =>
          flatListRef.current.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  messageList: {
    flex: 1,
    marginBottom: 16,
  },
  userMessage: {
    textAlign: 'right',
    marginVertical: 4,
    padding: 8,
    backgroundColor: 'lightblue',
    borderRadius: 8,
  },
  botMessage: {
    textAlign: 'left',
    marginVertical: 4,
    padding: 8,
    backgroundColor: '#ECECEC',
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'navy',
  },
});

export default ChatbotScreen;
