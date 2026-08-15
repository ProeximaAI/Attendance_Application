import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { visitApi } from '../services/visitApi';
import { Visit } from '../types/visit';

export default function VisitListScreen() {
  const { filter } = useLocalSearchParams<{ filter: 'total' | 'completed' | 'pending' | 'upcoming' }>();
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      try {
        let statusFilter: string | undefined = undefined;
        
        if (filter === 'completed') statusFilter = 'completed';
        else if (filter === 'pending' || filter === 'upcoming') statusFilter = 'pending';

        const response = await visitApi.getVisits(statusFilter ? { status: statusFilter } : undefined);
        
        if (response.success) {
          let data = response.data;
          
          if (filter === 'upcoming') {
            const today = new Date().toISOString().split('T')[0];
            data = data.filter(v => v.visit_date >= today);
          }
          
          setVisits(data);
        }
      } catch (error) {
        console.error('Failed to fetch visits for list', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVisits();
  }, [filter]);

  const getTitle = () => {
    switch(filter) {
      case 'completed': return 'Completed Visits';
      case 'pending': return 'Pending Visits';
      case 'upcoming': return 'Upcoming Visits';
      default: return 'All Visits';
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={styles.headerRightSpace} />
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={visits}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No visits found for this category.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.card} 
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: '/visit-detail/[id]' as any, params: { id: item.id } })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.customer_name}</Text>
                  <View style={[styles.badge, item.status === 'completed' ? styles.badgeSuccess : styles.badgePending]}>
                    <Text style={[styles.badgeText, item.status === 'completed' ? styles.badgeTextSuccess : styles.badgeTextPending]}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="business" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{item.client_name || item.customer_name}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{item.visit_date} at {item.visit_time}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
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
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeSuccess: { backgroundColor: '#DEF7EC' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextSuccess: { color: '#03543F' },
  badgeTextPending: { color: '#92400E' },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 12,
    fontSize: 15,
  },
});
