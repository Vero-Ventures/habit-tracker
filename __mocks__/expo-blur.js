jest.mock('expo-blur', () => {
  return {
    BlurView: jest.fn(() => null),
  };
});
