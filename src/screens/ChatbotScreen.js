import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
} from 'react-native';

// const API_TOKEN = 'your_generated_api_token';

async function queryHuggingFace(data, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/openai-community/gpt2',
        {
          headers: {
            Authorization: `Bearer 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`,
          },
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        if (response.status === 503 && attempt < retries) {
          console.warn(`Service unavailable. Retrying in ${delay} ms...`);
          await new Promise(res => setTimeout(res, delay));
          continue; // Retry the request
        }
        if (response.status === 403) {
          throw new Error(
            'Access forbidden: Check your API token and model permissions.'
          );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result); // Log the response for debugging
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error('Error in queryHuggingFace:', error);
        throw error;
      }
    }
  }
}

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim().length === 0) return;
    const newMessages = [...messages, { type: 'user', text: input }];
    setMessages(newMessages);

    try {
      const response = await queryHuggingFace({ inputs: input });
      // Extract the generated text from the response
      const botResponse =
        response[0]?.generated_text || 'Sorry, something went wrong.';
      setMessages([...newMessages, { type: 'bot', text: botResponse }]);
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
    <View style={styles.container}>
      <FlatList
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
      />
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Type a message"
      />
      <Button title="Send" onPress={handleSend} />
    </View>
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
    backgroundColor: '#DCF8C6',
    borderRadius: 8,
  },
  botMessage: {
    textAlign: 'left',
    marginVertical: 4,
    padding: 8,
    backgroundColor: '#ECECEC',
    borderRadius: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default ChatbotScreen;
