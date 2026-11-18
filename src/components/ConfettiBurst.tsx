import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const pieces = Array.from({ length: 30 }, (_, index) => ({
  color: ['#818CF8', '#34D399', '#FBBF24', '#FB7185', '#38BDF8'][index % 5],
  left: 4 + ((index * 17) % 92),
  drift: ((index * 23) % 160) - 80,
  delay: (index % 6) * 35,
}));

function ConfettiPiece({
  color,
  delay,
  drift,
  left,
  trigger,
}: {
  color: string;
  delay: number;
  drift: number;
  left: number;
  trigger: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) {
      return;
    }

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 950,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, progress, trigger]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -12,
        left: `${left}%`,
        width: 8,
        height: 14,
        borderRadius: 2,
        backgroundColor: color,
        opacity: progress.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0, 1, 0] }),
        transform: [
          { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) },
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 620] }) },
          { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${drift * 4}deg`] }) },
        ],
      }}
    />
  );
}

export default function ConfettiBurst({ trigger }: { trigger: number }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 }}>
      {pieces.map((piece, index) => (
        <ConfettiPiece key={index} {...piece} trigger={trigger} />
      ))}
    </View>
  );
}
