import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Modal, ActivityIndicator, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { visitApi } from '../services/visitApi';
import { Visit, VisitStats } from '../types/visit';

interface MetricCardProps {
  title: string;
  value: string;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, onPress }) => (
  <TouchableOpacity style={styles.metricCard} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function VisitScreen() {
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout'>('checkin');
  
  const [stats, setStats] = useState<VisitStats>({ total: 0, completed: 0, pending: 0, upcoming: 0 });
  const [visitHistory, setVisitHistory] = useState<Visit[]>([]);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states for selecting a visit
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'checkin' | 'checkout'>('checkin');
  const [modalVisits, setModalVisits] = useState<Visit[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        visitApi.getVisitStats(),
        visitApi.getVisits()
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (historyRes.success) setVisitHistory(historyRes.data);
    } catch (error) {
      console.error('Failed to fetch visit dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const openSelectionModal = async (type: 'checkin' | 'checkout') => {
    setModalType(type);
    setModalVisible(true);
    setLoadingModal(true);
    try {
      const statusFilter = type === 'checkin' ? 'pending' : 'in_progress';
      const response = await visitApi.getVisits({ status: statusFilter });
      if (response.success) {
        setModalVisits(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch visits');
      setModalVisible(false);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleSelectVisit = (visitId: number) => {
    setModalVisible(false);
    router.push({ pathname: '/visit-action/[id]', params: { id: visitId, type: modalType } });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visit</Text>
          <View style={styles.headerRightSpace} />
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Cards for Check-In and Checkout */}
          <View style={styles.actionCardsRow}>
            <TouchableOpacity 
              style={[styles.actionCard, activeTab === 'checkin' && styles.actionCardActive]}
              onPress={() => {
                setActiveTab('checkin');
                openSelectionModal('checkin');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="person" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionCardText}>Check-In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, activeTab === 'checkout' && styles.actionCardActive]}
              onPress={() => {
                setActiveTab('checkout');
                openSelectionModal('checkout');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="arrow-forward" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionCardText}>Checkout</Text>
            </TouchableOpacity>
          </View>

          {/* Visit Reports */}
          <Text style={styles.sectionTitle}>Visit Reports</Text>
          <View style={styles.metricsGrid}>
            <MetricCard 
              title="Total Visits" 
              value={stats.total.toString()} 
              onPress={() => router.push({ pathname: '/visit-list' as any, params: { filter: 'total' } })}
            />
            <MetricCard 
              title="Completed" 
              value={stats.completed.toString()} 
              onPress={() => router.push({ pathname: '/visit-list' as any, params: { filter: 'completed' } })}
            />
            <MetricCard 
              title="Pending" 
              value={stats.pending.toString()} 
              onPress={() => router.push({ pathname: '/visit-list' as any, params: { filter: 'pending' } })}
            />
            <MetricCard 
              title="Upcoming" 
              value={stats.upcoming.toString()} 
              onPress={() => router.push({ pathname: '/visit-list' as any, params: { filter: 'upcoming' } })}
            />
          </View>

          {/* Visit History Section */}
          <View style={[styles.visitHistoryCard, { marginTop: 16 }]}>
            <Text style={styles.visitHistoryTitle}>Visit History</Text>
            <Text style={styles.visitHistorySubtitle}>Showing all visits</Text>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />
            ) : visitHistory.length === 0 ? (
              <Text style={{ marginTop: 10, color: '#6B7280' }}>No visits found.</Text>
            ) : (
              <>
                {visitHistory.slice(0, expandedHistory ? visitHistory.length : 5).map(v => (
                  <TouchableOpacity 
                    key={v.id} 
                    style={{ marginTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
                    onPress={() => router.push({ pathname: '/visit-detail/[id]' as any, params: { id: v.id } })}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontWeight: '700', color: '#1E1B4B' }}>
                      {v.customer_name} <Text style={{fontSize: 12, color: COLORS.primary}}>({v.status.replace('_', ' ')})</Text>
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>{v.visit_date} - {v.visit_purpose}</Text>
                  </TouchableOpacity>
                ))}
                {visitHistory.length > 5 && (
                  <TouchableOpacity onPress={() => setExpandedHistory(!expandedHistory)} style={{ marginTop: 16, alignItems: 'center' }}>
                    <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                      {expandedHistory ? 'Show Less' : 'Show More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

        </ScrollView>
        {/* FAB */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => router.push('/create-visit')}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Visit Selection Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'checkin' ? 'Select Visit to Check-In' : 'Select Visit to Checkout'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {loadingModal ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
            ) : modalVisits.length === 0 ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Ionicons name="calendar-clear-outline" size={48} color="#D1D5DB" />
                <Text style={{ marginTop: 12, color: '#6B7280', textAlign: 'center' }}>
                  No {modalType === 'checkin' ? 'pending' : 'in-progress'} visits found.
                </Text>
              </View>
            ) : (
              <FlatList
                data={modalVisits}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalListItem} onPress={() => handleSelectVisit(item.id)}>
                    <View>
                      <Text style={styles.modalListTitle}>{item.customer_name}</Text>
                      <Text style={styles.modalListSubtitle}>{item.visit_purpose} • {item.visit_time}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
  headerRightSpace: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  actionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  actionCardActive: {
    borderColor: '#E0E7FF',
  },
  actionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionCardText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  visitHistoryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 28,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  visitHistoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  visitHistorySubtitle: {
    fontSize: 15,
    color: COLORS.primary,
    opacity: 0.7,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  modalListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  modalListSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
