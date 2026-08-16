import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';
import { FinanceService } from '../../services/financeService';
import { Expense, Advance, Incentive } from '../../types/finance';

export default function FinanceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const getTitle = () => {
    switch (id) {
      case '1': return 'My Expense';
      case '2': return 'My Advance';
      case '3': return 'My Incentive';
      default: return 'Details';
    }
  };

  const fetchData = async () => {
    try {
      let result: any[] = [];
      if (id === '1') {
        result = await FinanceService.getMyExpenses();
      } else if (id === '2') {
        result = await FinanceService.getMyAdvances();
      } else if (id === '3') {
        result = await FinanceService.getMyIncentives();
      }
      setData(result);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFabPress = () => {
    if (id === '1') {
      router.push('/finance/apply-expense');
    } else if (id === '2') {
      router.push('/finance/apply-advance');
    }
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.expense_type}</Text>
        <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.expense_category} - {item.expense_head}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Date: {item.expense_date}</Text>
        <Text style={styles.cardAmount}>₹{item.amount}</Text>
      </View>
    </View>
  );

  const renderAdvanceItem = ({ item }: { item: Advance }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.expense_type}</Text>
        <Text style={[styles.statusBadge, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Requested: ₹{item.amount_requested}</Text>
        <Text style={styles.cardAmount}>Disbursed: ₹{item.amount_disbursed || '0'}</Text>
      </View>
    </View>
  );

  const renderIncentiveItem = ({ item }: { item: Incentive }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.incentive_type}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.target_achieved_description}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Month: {item.payroll_processing_month}</Text>
        <Text style={styles.cardAmount}>₹{item.total_incentive_amount}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    if (id === '1') return renderExpenseItem({ item });
    if (id === '2') return renderAdvanceItem({ item });
    if (id === '3') return renderIncentiveItem({ item });
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#F59E0B'; // Pending
    }
  };

  // Only show '+' icon for "My Expense" (id === '1') and "My Advance" (id === '2')
  const showAddIcon = id === '1' || id === '2';

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={styles.rightButtonContainer} />
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={data.length === 0 ? styles.flex1 : styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyStateTitle}>No Records Found</Text>
                <Text style={styles.emptyStateSubtitle}>There are no {getTitle().toLowerCase()} records to display at this time.</Text>
              </View>
            }
          />
        )}
      </View>

      {showAddIcon && (
        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={handleFabPress}>
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  rightButtonContainer: {
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
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  flex1: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
