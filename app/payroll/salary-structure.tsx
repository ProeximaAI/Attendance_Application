import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';
import { payrollService, PayslipDetail } from '../../services/payrollService';

const { width } = Dimensions.get('window');

export default function SalaryStructureScreen() {
  const [structure, setStructure] = useState<PayslipDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        // 1. Get latest payslip id
        const slips = await payrollService.getMyPayslips();
        if (slips.success && slips.data && slips.data.length > 0) {
          const latestId = slips.data[0].id;
          
          // 2. Fetch full detail for the latest to get breakdown
          const detailRes = await payrollService.getPayslipDetail(latestId);
          if (detailRes.success && detailRes.data) {
            setStructure(detailRes.data);
          }
        }
      } catch (error) {
        console.error('Error fetching salary structure:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStructure();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Salary Structure</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!structure) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Salary Structure</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="pie-chart-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No salary structure found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const basicPay = parseFloat(structure.basic_pay);
  const totalAllowances = parseFloat(structure.total_allowances);
  const totalIncentives = parseFloat(structure.total_incentives);
  const totalDeductions = parseFloat(structure.total_deductions);
  const grossPay = basicPay + totalAllowances + totalIncentives;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Salary Structure</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Gross Overview Card */}
        <View style={styles.grossCard}>
          <Text style={styles.grossLabel}>Total Gross Salary</Text>
          <Text style={styles.grossAmount}>₹{grossPay.toLocaleString()}</Text>
          <View style={styles.grossDivider} />
          <View style={styles.grossSplitRow}>
            <View style={styles.grossSplitItem}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.grossSplitLabel}>Earnings: ₹{grossPay.toLocaleString()}</Text>
            </View>
            <View style={styles.grossSplitItem}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.grossSplitLabel}>Deductions: ₹{totalDeductions.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Basic & Allowances List */}
        <View style={styles.sectionHeader}>
          <Ionicons name="add-circle" size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Fixed Components (Earnings)</Text>
        </View>
        
        <View style={styles.listCard}>
          <View style={styles.listItem}>
            <View style={styles.listTextGroup}>
              <Text style={styles.listTitle}>Basic Pay</Text>
              <Text style={styles.listSubtitle}>Core component</Text>
            </View>
            <Text style={styles.listValue}>₹{basicPay.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          
          {structure.breakdown?.allowances?.map((item, index) => (
            <React.Fragment key={`allowance-${index}`}>
              <View style={styles.listItem}>
                <View style={styles.listTextGroup}>
                  <Text style={styles.listTitle}>{item.name}</Text>
                  <Text style={styles.listSubtitle}>Allowance</Text>
                </View>
                <Text style={styles.listValue}>₹{parseFloat(item.amount).toLocaleString()}</Text>
              </View>
              {index < (structure.breakdown?.allowances?.length || 0) - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Deductions List */}
        <View style={styles.sectionHeader}>
          <Ionicons name="remove-circle" size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Deductions</Text>
        </View>
        
        <View style={styles.listCard}>
          {structure.breakdown?.deductions?.length > 0 ? (
            structure.breakdown.deductions.map((item, index) => (
              <React.Fragment key={`deduction-${index}`}>
                <View style={styles.listItem}>
                  <View style={styles.listTextGroup}>
                    <Text style={styles.listTitle}>{item.name}</Text>
                    <Text style={styles.listSubtitle}>Statutory / Other</Text>
                  </View>
                  <Text style={styles.listValueRed}>-₹{parseFloat(item.amount).toLocaleString()}</Text>
                </View>
                {index < (structure.breakdown?.deductions?.length || 0) - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.listItem}>
              <Text style={styles.listTitle}>No Deductions</Text>
            </View>
          )}
        </View>

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            This structure is based on your most recent active payroll configuration. Incentives are variable and not included in fixed components.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
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
  grossCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  grossLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  grossAmount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  grossDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  grossSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grossSplitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  grossSplitLabel: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  listTextGroup: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  listValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  listValueRed: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoText: {
    flex: 1,
    color: '#4F46E5',
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 12,
  },
});
