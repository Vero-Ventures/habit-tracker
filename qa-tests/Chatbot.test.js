import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatbotScreen from '../src/screens/ChatbotScreen';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest
          .fn()
          .mockResolvedValueOnce({
            // For successful test
            response: {
              text: jest.fn().mockResolvedValue('Mocked response from the bot'),
            },
          })
          .mockRejectedValueOnce(new Error('API call failed')), // For error test
      }),
    }),
  })),
}));

describe('ChatbotScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<ChatbotScreen />);

    getByText('Talk to Your Habit Coach!');
    getByPlaceholderText('Type a message');
    getByText('Send');
  });

  test('sends a message and receives a response', async () => {
    const { getByPlaceholderText, getByText, getByDisplayValue, queryByText } =
      render(<ChatbotScreen />);
    const input = getByPlaceholderText('Type a message');
    const sendButton = getByText('Send');

    // Enter a message and send it
    fireEvent.changeText(input, 'Test message');
    expect(getByDisplayValue('Test message')).toBeTruthy();
    fireEvent.press(sendButton);

    getByText('Test message');
    await waitFor(() => {
      getByText('Mocked response from the bot');
    });
  });

  test('handles empty input gracefully', async () => {
    const { getByText, queryByText } = render(<ChatbotScreen />);
    const sendButton = getByText('Send');

    fireEvent.press(sendButton);

    // Verify that no message was sent
    await waitFor(() =>
      expect(queryByText('Mocked response from the bot')).toBeFalsy()
    );
  });

  test('displays error message when API call fails', async () => {
    const { getByPlaceholderText, getByText } = render(<ChatbotScreen />);
    const input = getByPlaceholderText('Type a message');
    const sendButton = getByText('Send');

    fireEvent.changeText(input, 'Test message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      getByText('Service is currently unavailable. Please try again later.');
    });
  });
});
