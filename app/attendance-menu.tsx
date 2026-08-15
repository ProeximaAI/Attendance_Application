import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';

interface AttendanceOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: any;
}

const OPTIONS: AttendanceOption[] = [
  { id: '1', title: 'Attendance', icon: 'calendar-outline', route: '/(tabs)/logs' },
  { id: '2', title: 'Leave Application', icon: 'create-outline' },
  { id: '3', title: 'My Leave Balance', icon: 'wallet-outline' },
  { id: '4', title: 'My Compensatory Off', icon: 'time-outline' },
  { id: '5', title: 'Compensatory Off Authorization', icon: 'checkmark-circle-outline' },
  { id: '6', title: 'Attendance Correction', icon: 'build-outline', route: '/attendance-correction' },
  { id: '7', title: 'My Outdoor Duty', icon: 'walk-outline', route: { pathname: '/duty-request', params: { type: 'Outdoor Duty' } } },
  { id: '8', title: 'My Work From Home', icon: 'laptop-outline', route: { pathname: '/duty-request', params: { type: 'Work From Home' } } },
  { id: '9', title: 'Work From Home Authorization', icon: 'shield-checkmark-outline' },
  { id: '10', title: 'My Outside Attendance', icon: 'location-outline' },
];

export default function AttendanceMenuScreen() {
  const [isGridView, setIsGridView] = React.useState(false);

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance</Text>
          <TouchableOpacity style={styles.gridButton} activeOpacity={0.7} onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? "list-outline" : "apps-outline"} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={isGridView ? styles.scrollContentGrid : styles.scrollContent} showsVerticalScrollIndicator={false}>
          {OPTIONS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={isGridView ? styles.gridOptionCard : styles.optionCard} 
              activeOpacity={0.7}
              onPress={() => {
                if (item.route) {
                  router.push(item.route);
                }
              }}
            >
              <View style={isGridView ? styles.gridIconContainer : styles.iconContainer}>
                <Ionicons name={item.icon as any} size={isGridView ? 26 : 22} color={COLORS.primary} />
              </View>
              <Text style={isGridView ? styles.gridOptionTitle : styles.optionTitle} numberOfLines={isGridView ? 2 : 1} ellipsizeMode="tail">
                {item.title}
              </Text>
              {!isGridView && <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  safeArea: {
    backgroundColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContentGrid: {
    padding: 16,
    paddingBottom: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  gridOptionCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  gridIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  gridOptionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E1B4B',
    textAlign: 'center',
  },
});
