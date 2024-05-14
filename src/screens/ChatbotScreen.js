import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const API_TOKEN = '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';

async function queryHuggingFace(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-128k-instruct",
		{
			headers: { Authorization: "Bearer {API_TOKEN}" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
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
            const botResponse = response.generated_text || 'Sorry, something went wrong.';
            setMessages([...newMessages, { type: 'bot', text: botResponse }]);
        } catch (error) {
            console.error("Error handling send:", error);
            setMessages([...newMessages, { type: 'bot', text: 'Sorry, something went wrong.' }]);
        }

        setInput('');
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <Text style={item.type === 'user' ? styles.userMessage : styles.botMessage}>{item.text}</Text>
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
