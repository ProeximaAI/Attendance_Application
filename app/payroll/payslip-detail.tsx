import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';
import { payrollService, PayslipDetail } from '../../services/payrollService';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export default function PayslipDetailScreen() {
  const { id } = useLocalSearchParams();
  const [payslip, setPayslip] = useState<PayslipDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchDetail = async () => {
      try {
        const res = await payrollService.getPayslipDetail(Number(id));
        if (res.success && res.data) {
          setPayslip(res.data);
        }
      } catch (error) {
        console.error('Error fetching payslip detail:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [id]);

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  const handleDownload = async () => {
    if (!payslip) return;
    
    try {
      const basicPay = parseFloat(payslip.basic_pay).toLocaleString();
      const netSalary = parseFloat(payslip.net_salary).toLocaleString();
      
      let allowancesHtml = payslip.breakdown?.allowances?.map(item => 
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name || 'Allowance'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${parseFloat(item.amount).toLocaleString()}</td>
        </tr>`
      ).join('') || '';

      let deductionsHtml = payslip.breakdown?.deductions?.map(item => 
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name || 'Deduction'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: red;">-₹${parseFloat(item.amount).toLocaleString()}</td>
        </tr>`
      ).join('') || '<tr><td colspan="2" style="padding: 8px;">No deductions</td></tr>';

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #4F46E5; }
              .summary { background: #4F46E5; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; }
              .summary h2 { margin: 0; font-size: 32px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #4F46E5; padding-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Payslip</h1>
              <p>${getMonthName(payslip.month)} ${payslip.year}</p>
            </div>
            
            <div class="summary">
              <p>Net Salary</p>
              <h2>₹${netSalary}</h2>
              <p>Status: ${payslip.status.toUpperCase()}</p>
            </div>

            <div class="section">
              <div class="section-title">Earnings</div>
              <table>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">Basic Pay</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${basicPay}</td>
                </tr>
                ${allowancesHtml}
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Total Earnings</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right;">₹${parseFloat(payslip.basic_pay) + parseFloat(payslip.total_allowances) + parseFloat(payslip.total_incentives)}</td>
                </tr>
              </table>
            </div>

            <div class="section">
              <div class="section-title">Deductions</div>
              <table>
                ${deductionsHtml}
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Total Deductions</td>
                  <td style="padding: 8px; font-weight: bold; text-align: right; color: red;">-₹${parseFloat(payslip.total_deductions).toLocaleString()}</td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate payslip PDF.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payslip Detail</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!payslip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payslip Detail</Text>
          <View style={styles.headerRightSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Payslip not found.</Text>
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
        <Text style={styles.headerTitle}>{getMonthName(payslip.month)} {payslip.year}</Text>
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Net Salary Highlight */}
        <View style={styles.netSalaryCard}>
          <Text style={styles.netSalaryLabel}>Net Salary</Text>
          <Text style={styles.netSalaryAmount}>₹{parseFloat(payslip.net_salary).toLocaleString()}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{payslip.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Earnings Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Basic Pay</Text>
            <Text style={styles.rowValue}>₹{parseFloat(payslip.basic_pay).toLocaleString()}</Text>
          </View>
          
          {payslip.breakdown?.allowances?.map((item, index) => (
            <View key={`allowance-${index}`} style={styles.row}>
              <Text style={styles.rowLabel}>{item.name || 'Allowance'}</Text>
              <Text style={styles.rowValue}>₹{parseFloat(item.amount).toLocaleString()}</Text>
            </View>
          ))}

          {payslip.breakdown?.incentives?.map((item, index) => (
            <View key={`incentive-${index}`} style={styles.row}>
              <Text style={styles.rowLabel}>{item.name || 'Incentive'}</Text>
              <Text style={styles.rowValue}>₹{parseFloat(item.amount).toLocaleString()}</Text>
            </View>
          ))}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalValue}>
              ₹{(parseFloat(payslip.basic_pay) + parseFloat(payslip.total_allowances) + parseFloat(payslip.total_incentives)).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Deductions Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Deductions</Text>
          <View style={styles.divider} />
          
          {payslip.breakdown?.deductions?.length > 0 ? (
            payslip.breakdown.deductions.map((item, index) => (
              <View key={`deduction-${index}`} style={styles.row}>
                <Text style={styles.rowLabel}>{item.name || 'Deduction'}</Text>
                <Text style={styles.rowValue}>-₹{parseFloat(item.amount).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyRow}>No deductions.</Text>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Deductions</Text>
            <Text style={styles.totalValueRed}>-₹{parseFloat(payslip.total_deductions).toLocaleString()}</Text>
          </View>
        </View>

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
  downloadButton: {
    padding: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
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
  },
  netSalaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  netSalaryLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  netSalaryAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyRow: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  totalValueRed: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});
