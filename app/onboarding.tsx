import { router } from 'expo-router';
import React, { useContext, useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    image: require('../assets/images/onboarding/clock.jpg'),
    title: 'Track time effortlessly',
    description: 'One tap check-in, automatic\nhours logged daily.',
  },
  {
    id: '2',
    image: require('../assets/images/onboarding/location.jpg'),
    title: 'Check in from anywhere',
    description: 'Geofenced attendance for\nfield & office teams.',
  },
  {
    id: '3',
    image: require('../assets/images/onboarding/team.jpg'),
    title: 'See your team status',
    description: "Know who's in, on break, or\non leave today.",
  },
  {
    id: '4',
    image: require('../assets/images/onboarding/calendar.jpg'),
    title: 'Stay on top of leaves',
    description: 'Apply, track, and view leave\nbalance in one place.',
  },
  {
    id: '5',
    image: require('../assets/images/onboarding/insights.jpg'),
    title: 'Insights at a glance',
    description: 'Monthly attendance trends\nright on your home screen.',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { completeOnboarding } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {ONBOARDING_DATA.map((item) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(40, insets.bottom + 20) }]}>
        <View style={styles.pagination}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    alignItems: 'center',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.primary, // Used primary purple color to match the reference images text color
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
