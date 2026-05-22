import { useState } from 'react';
import { Pressable } from 'react-native';

export default function MotionPressable({ children, style, disabled, onPress, ...rest }) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[style, (pressed || disabled) && { opacity: disabled ? 0.5 : 0.92 }]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
