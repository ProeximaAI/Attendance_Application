import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={[styles.content, { paddingBottom: Math.max(40, insets.bottom + 20) }]}>

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>


        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Everything you need{'\n'}
            to <Text style={styles.titleHighlight}>manage attendance</Text>
          </Text>
          <Text style={styles.subtitle}>
            Smart. Simple. Seamless.
          </Text>
        </View>

        {/* Stacked Cards Section */}
        <View style={styles.cardsContainer}>
          {/* Top Card (Behind) */}
          <View style={[styles.card, styles.cardTop]}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="hand-wave-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSubtitle}>Ready for work?</Text>
            </View>
          </View>

          {/* Bottom Card (Behind) */}
          <View style={[styles.card, styles.cardBottom]}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Approval for Day Off Posted</Text>
              <Text style={styles.cardSubtitle}>Check your leave history</Text>
            </View>
          </View>

          {/* Middle Card (Front) */}
          <View style={[styles.card, styles.cardMiddle]}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>Shift starts in 15 min</Text>
              <Text style={styles.cardSubtitle}>Don't forget to clock in!</Text>
            </View>
          </View>
        </View>

        {/* Spacer to push button down */}
        <View style={{ flex: 1 }} />

        {/* Footer Text */}
        <View style={styles.footerTextContainer}>
          <Text style={styles.companyTextBase}>
            A product of <Text 
              style={styles.companyTextLink}
              onPress={() => Linking.openURL('https://www.proeximaai.com/')}
            >
              Proexima AI
            </Text>
          </Text>
          <Text style={styles.termsText}>
            By continuing you agree to our Terms & Conditions and Privacy policy
          </Text>
        </View>

        {/* Button Section */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding')}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 38,
  },
  titleHighlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primary, // Using primary color to match the image text color for "Smart. Simple. Seamless."
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardsContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardTop: {
    top: 0,
    transform: [{ scale: 0.9 }],
    zIndex: 1,
    opacity: 0.8,
  },
  cardBottom: {
    bottom: 0,
    transform: [{ scale: 0.95 }],
    zIndex: 2,
    opacity: 0.9,
  },
  cardMiddle: {
    top: 60,
    transform: [{ scale: 1 }],
    zIndex: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF', // Very light primary shade
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
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
  footerTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  companyTextBase: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  companyTextLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
