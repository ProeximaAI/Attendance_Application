import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

const splashVideoSource = require('../assets/Videos/splash_screen.mp4');

interface VideoSplashScreenProps {
  visible: boolean;
  onFinish: () => void;
}

export default function VideoSplashScreen({ visible, onFinish }: VideoSplashScreenProps) {
  const finishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  const player = useVideoPlayer(splashVideoSource, player => {
    player.loop = false;
    player.play();
  });

  useEventListener(player, 'playToEnd', () => {
    handleFinish();
  });

  useEffect(() => {
    if (visible && player) {
      player.play();
      const playTimer = setTimeout(() => {
        player.play();
      }, 150);
      return () => clearTimeout(playTimer);
    }
  }, [visible, player]);

  useEffect(() => {
    if (!visible) return;
    // Safety fallback timer (10 seconds) ensuring app never hangs if playback fails
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 10000);

    return () => clearTimeout(safetyTimer);
  }, [visible, handleFinish]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleFinish}
    >
      <View style={styles.container}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls={false}
          contentFit="cover"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
