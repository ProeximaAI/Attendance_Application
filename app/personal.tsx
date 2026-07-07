import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';

interface PersonalOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: PersonalOption[] = [
  { id: '1', title: 'Add Face', icon: 'happy-outline' },
  { id: '2', title: 'Address', icon: 'location-outline' },
  { id: '3', title: 'Experience', icon: 'briefcase-outline' },
  { id: '4', title: 'Education', icon: 'school-outline' },
  { id: '5', title: 'Family Details', icon: 'people-outline' },
  { id: '6', title: 'Branch', icon: 'git-network-outline' },
  { id: '7', title: 'Department', icon: 'business-outline' },
  { id: '8', title: 'Designation', icon: 'id-card-outline' },
  { id: '9', title: 'Employee Document', icon: 'document-text-outline' },
  { id: '10', title: 'Shift', icon: 'time-outline' },
];

export default function PersonalScreen() {
  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Yellow/Orange Header matching Screenshot */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal</Text>
          <TouchableOpacity style={styles.gridButton} activeOpacity={0.7}>
            <Ionicons name="apps-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {OPTIONS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.optionCard} activeOpacity={0.7}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.optionTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
  },
});
