import React, { useState, useEffect } from "react";
import { Animated } from "react-native";

const FadeInView = (props) => {
  const [fadeAnim, setFadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: (props.pos / 3) * 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ ...props.style, opacity: fadeAnim, flex: 1 }}>
      {props.children}
    </Animated.View>
  );
};

export default FadeInView;
