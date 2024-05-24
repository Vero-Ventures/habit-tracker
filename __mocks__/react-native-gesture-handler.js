jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    GestureHandlerModule: {
      Direction: {},
    },
    Swipeable: props => {
      return React.createElement(View, props, props.children);
    },
    ScrollView: props => {
      return React.createElement(View, props, props.children);
    },
    FlatList: props => {
      return React.createElement(View, props, props.children);
    },
    Directions: {},
  };
});
