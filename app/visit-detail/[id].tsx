import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';
import { API_CONFIG } from '../../constants/api';
import { visitApi } from '../../services/visitApi';
import { Visit } from '../../types/visit';

// Helper to remove /api from base url if it exists, to form valid image URLs
const getBaseUrl = () => API_CONFIG.BASE_URL.replace(/\/api$/, '');

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitDetails = async () => {
      try {
        const response = await visitApi.getVisits();
        if (response.success) {
          const foundVisit = response.data.find(v => v.id.toString() === id);
          if (foundVisit) {
            setVisit(foundVisit);
          }
        }
      } catch (error) {
        console.error('Failed to fetch visit details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVisitDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFFFFF' }}>Visit not found.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary, backgroundColor: '#FFF', padding: 10, borderRadius: 8 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderInfoRow = (icon: any, label: string, value: string) => (
    <View style={styles.infoRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visit Details</Text>
          <View style={styles.headerRightSpace} />
        </View>
      </SafeAreaView>

      <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
        
        {/* Main Header Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <Text style={styles.customerName}>{visit.customer_name}</Text>
            <View style={[styles.badge, visit.status === 'completed' ? styles.badgeSuccess : styles.badgePending]}>
              <Text style={[styles.badgeText, visit.status === 'completed' ? styles.badgeTextSuccess : styles.badgeTextPending]}>
                {visit.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.subtitleRow}>
            <Ionicons name="business" size={16} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.clientName}>{visit.client_name || visit.customer_name}</Text>
          </View>
        </View>

        {/* Schedule & Information */}
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.card}>
          {renderInfoRow('calendar', 'Scheduled Date', visit.visit_date)}
          {renderInfoRow('time', 'Scheduled Time', visit.visit_time)}
          {renderInfoRow('location', 'Address', visit.address)}
          {renderInfoRow('chatbubble-ellipses', 'Purpose', visit.visit_purpose)}
          {renderInfoRow('cube', 'Product', visit.product)}
        </View>

        {/* Execution Details (if started or completed) */}
        {(visit.checkin_time || visit.checkout_time) && (
          <>
            <Text style={styles.sectionTitle}>Execution Records</Text>
            <View style={styles.card}>
              {visit.checkin_time && renderInfoRow('log-in', 'Check-In Time', visit.checkin_time)}
              {visit.checkout_time && renderInfoRow('log-out', 'Checkout Time', visit.checkout_time)}
            </View>
          </>
        )}

        {/* Selfies */}
        {(visit.checkin_selfie || visit.checkout_selfie) && (
          <>
            <Text style={styles.sectionTitle}>Verification Photos</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {visit.checkin_selfie && (
                <View style={styles.photoContainer}>
                  <Text style={styles.photoLabel}>Check-In Selfie</Text>
                  <Image 
                    source={{ uri: `${getBaseUrl()}${visit.checkin_selfie}` }} 
                    style={styles.photo} 
                    resizeMode="cover"
                  />
                </View>
              )}
              {visit.checkout_selfie && (
                <View style={styles.photoContainer}>
                  <Text style={styles.photoLabel}>Checkout Selfie</Text>
                  <Image 
                    source={{ uri: `${getBaseUrl()}${visit.checkout_selfie}` }} 
                    style={styles.photo} 
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
          </>
        )}

      </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    flex: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeSuccess: { backgroundColor: '#DEF7EC' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextSuccess: { color: '#03543F' },
  badgeTextPending: { color: '#92400E' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E1B4B',
    fontWeight: '500',
  },
  photoContainer: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
});
