import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useContext, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const videoSource = require('../assets/Videos/login_screen_video.mp4');

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true; // Keep loop true to prevent EOF black screen bugs on Android
    player.play();
  });

  const isFormVisible = useSharedValue(0);
  const bounceValue = useSharedValue(0);

  useEffect(() => {
    // Start the energetic bouncing animation for the emoji immediately
    bounceValue.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite loop
      true // Reverse
    );

    // Trigger animation after 8.5 seconds based on user feedback
    const timer = setTimeout(() => {
      setIsFormActive(true);
      player.pause(); // Explicitly pause the video so it freezes on this frame
      isFormVisible.value = withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease)
      });
    }, 8500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    if (phone && password) {
      await login({ email: phone, password }); // Adapting to existing context signature
      router.replace('/(tabs)');
    }
  };

  const videoStyle = useAnimatedStyle(() => {
    return {
      height: `${100 - 50 * isFormVisible.value}%` as any,
    };
  });

  const formStyle = useAnimatedStyle(() => {
    return {
      opacity: isFormVisible.value,
      transform: [
        { translateY: 50 * (1 - isFormVisible.value) }
      ],
    };
  });

  const bounceStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bounceValue.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.videoContainer, videoStyle]}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls={false}
          contentFit="cover"
        />
      </Animated.View>

      <Animated.View style={[styles.formSection, formStyle]} pointerEvents={isFormActive ? 'auto' : 'none'}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Ready to dive in</Text>
                <Animated.View style={bounceStyle}>
                  <Text style={styles.titleEmoji}> 🚀</Text>
                </Animated.View>
              </View>
              <Text style={styles.subtitle}>Log in to continue</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <View style={[styles.inputGroup, phone.length > 0 ? styles.inputGroupActive : null]}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color={COLORS.primary} style={styles.leftIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={COLORS.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={[styles.inputGroup, password.length > 0 ? styles.inputGroupActive : null]}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.primary} style={styles.leftIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background prevents any white flashes
  },
  videoContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  formSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32, // Restored overlap for seamless sliding animation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  titleEmoji: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B', // slate-500
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // lighter slate
    borderRadius: 16,
    backgroundColor: '#FAFAFA', // slightly off-white like the screenshot
    paddingHorizontal: 16,
    height: 56,
  },
  inputGroupActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    height: '100%',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
