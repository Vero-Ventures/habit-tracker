import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatbotScreen from '../src/screens/ChatbotScreen';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockResolvedValue('Mocked response from the bot'),
          },
        }),
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

    expect(getByText('Talk to Your Habit Coach!')).toBeTruthy();
    expect(getByPlaceholderText('Type a message')).toBeTruthy();
    expect(getByText('Send')).toBeTruthy();
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

    expect(queryByText('Test message')).toBeTruthy();

    // Wait for the bot's (mocked) response to appear
    await waitFor(() =>
      expect(queryByText('Mocked response from the bot')).toBeTruthy()
    );
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
    GoogleGenerativeAI.mockImplementationOnce(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        startChat: jest.fn().mockReturnValue({
          sendMessage: jest
            .fn()
            .mockRejectedValue(new Error('API call failed')),
        }),
      }),
    }));

    const { getByPlaceholderText, getByText, queryByText } = render(
      <ChatbotScreen />
    );
    const input = getByPlaceholderText('Type a message');
    const sendButton = getByText('Send');

    // Enter a message and send it
    fireEvent.changeText(input, 'Test message');
    fireEvent.press(sendButton);

    expect(queryByText('Test message')).toBeTruthy();

    // Wait for the error message to appear
    await waitFor(() =>
      expect(
        queryByText('Service is currently unavailable. Please try again later.')
      ).toBeTruthy()
    );
  });
});
