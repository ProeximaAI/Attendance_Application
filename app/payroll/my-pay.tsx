import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';
import { payrollService, PayslipItem } from '../../services/payrollService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function MyPayScreen() {
  const [latestPayslip, setLatestPayslip] = useState<PayslipItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPay = async () => {
      try {
        const res = await payrollService.getMyPayslips();
        if (res.success && res.data && res.data.length > 0) {
          // Sort to be safe, but usually API returns latest first. We'll just take the first.
          setLatestPayslip(res.data[0]);
        }
      } catch (error) {
        console.error('Error fetching my pay:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestPay();
  }, []);

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Pay</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!latestPayslip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Pay</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No pay records found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pay</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Month Indicator */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthLabel}>Current Month</Text>
          <Text style={styles.monthValue}>{getMonthName(latestPayslip.month)} {latestPayslip.year}</Text>
        </View>

        {/* Big Gradient Card for Net Pay */}
        <LinearGradient
          colors={['#4F46E5', '#4338CA']}
          style={styles.netPayCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.netPayLabel}>Net Take-Home Pay</Text>
          <Text style={styles.netPayAmount}>₹{parseFloat(latestPayslip.net_salary).toLocaleString()}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={styles.statusText}>{latestPayslip.status}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Summary Grid */}
        <Text style={styles.sectionTitle}>Earnings Summary</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="cash-outline" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.gridLabel}>Basic Pay</Text>
            <Text style={styles.gridValue}>₹{parseFloat(latestPayslip.basic_pay).toLocaleString()}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="trending-up-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.gridLabel}>Allowances</Text>
            <Text style={styles.gridValue}>₹{parseFloat(latestPayslip.total_allowances).toLocaleString()}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="star-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.gridLabel}>Incentives</Text>
            <Text style={styles.gridValue}>₹{parseFloat(latestPayslip.total_incentives).toLocaleString()}</Text>
          </View>

          <View style={styles.gridItem}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="trending-down-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.gridLabel}>Deductions</Text>
            <Text style={styles.gridValue}>₹{parseFloat(latestPayslip.total_deductions).toLocaleString()}</Text>
          </View>
        </View>

        {/* View Detailed Breakdown Button */}
        <TouchableOpacity 
          style={styles.detailButton} 
          activeOpacity={0.8}
          onPress={() => router.push(`/payroll/payslip-detail?id=${latestPayslip.id}`)}
        >
          <Text style={styles.detailButtonText}>View Detailed Payslip</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRightSpacer: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  monthLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  monthValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  netPayCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  netPayLabel: {
    color: '#E0E7FF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  netPayAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
