import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';

interface FinanceOption {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: FinanceOption[] = [
  { id: '1', title: 'My Expense', subtitle: 'Claims & reimbursement requests', icon: 'receipt-outline' },
  { id: '2', title: 'My Advance', subtitle: 'Salary advance & status', icon: 'wallet-outline' },
  { id: '3', title: 'My Loan', subtitle: 'Active company loans & EMI', icon: 'card-outline' },
  { id: '4', title: 'My Penalty', subtitle: 'Deductions & late penalties', icon: 'alert-circle-outline' },
];

export default function FinanceScreen() {
  const [isGridView, setIsGridView] = React.useState(false);

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Finance</Text>
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
              onPress={() => router.push({ pathname: '/finance/[id]', params: { id: item.id } })}
            >
              <View style={isGridView ? styles.gridIconContainer : styles.iconContainer}>
                <Ionicons name={item.icon as any} size={isGridView ? 26 : 22} color={COLORS.primary} />
              </View>
              <View style={isGridView ? styles.gridTextContainer : styles.textContainer}>
                <Text style={isGridView ? styles.gridOptionTitle : styles.optionTitle} numberOfLines={isGridView ? 2 : 1}>
                  {item.title}
                </Text>
                {!isGridView && <Text style={styles.optionSubtitle}>{item.subtitle}</Text>}
              </View>
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
  textContainer: {
    flex: 1,
  },
  gridTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionTitle: {
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
  optionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
