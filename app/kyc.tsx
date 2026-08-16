import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { KycData, kycService } from '../services/kycService';

const PRIMARY_COLOR = '#4338CA';
const TEXT_COLOR = '#1E1B4B';

export default function KycScreen() {
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchKycData = async () => {
    setLoading(true);
    try {
      const res = await kycService.getMyKyc();
      if (res.success && res.data) {
        setKycData(res.data);
        console.log("=== COMPLETE KYC DATA FROM BACKEND ===", res.data);
      } else {
        setKycData(null);
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      setKycData(null);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchKycData();
    }, [])
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete KYC Data",
      "Are you sure you want to permanently delete all your KYC data and profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await kycService.deleteKyc();
              if (res.success) {
                setKycData(null);
                Alert.alert("Success", "KYC data successfully deleted.");
              }
            } catch (error) {
              console.error('Error deleting KYC data:', error);
              Alert.alert("Error", "Failed to delete KYC data.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const hasData = kycData && (
    kycData.aadhaar_last4 ||
    kycData.pan_last4 ||
    kycData.esic_last4 ||
    kycData.pf_last4 ||
    kycData.bank_account_last4 ||
    kycData.profile_photo
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

      {/* Header with Blue Background */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Details</Text>
        <View style={styles.headerRightSpacer}>
          {hasData && (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area with White Curved Background */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : hasData ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Profile Photo Display */}
            {kycData?.profile_photo && (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: kycData.profile_photo }}
                  style={styles.profilePhoto}
                />
                <Text style={styles.photoLabel}>Profile Photo</Text>
              </View>
            )}

            {kycData?.date_of_birth && (
              <View style={styles.optionCard}>
                <View style={[styles.optionIconContainer, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="calendar-outline" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Date of Birth</Text>
                  <Text style={styles.optionValue}>{kycData.date_of_birth}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}

            {kycData?.aadhaar_last4 && (
              <View style={styles.optionCard}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="card-outline" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Aadhaar Card</Text>
                  <Text style={styles.optionValue}>**** **** {kycData.aadhaar_last4}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}

            {kycData?.pan_last4 && (
              <View style={styles.optionCard}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="documents-outline" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>PAN Card</Text>
                  <Text style={styles.optionValue}>******{kycData.pan_last4}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}

            {kycData?.bank_account_last4 && (
              <View style={styles.optionCard}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="business-outline" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{kycData.bank_name_last4 || 'Bank Details'}</Text>
                  <Text style={styles.optionValue}>
                    A/C ****{kycData.bank_account_last4}
                    {kycData.ifsc_code_last4 ? ` | IFSC: ****${kycData.ifsc_code_last4}` : ''}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}

            {kycData?.pf_last4 && (
              <View style={styles.optionCard}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="briefcase-outline" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>PF Number</Text>
                  <Text style={styles.optionValue}>****{kycData.pf_last4}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}

            {kycData?.esic_last4 && (
              <View style={styles.optionCard}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="medical-outline" size={20} color={PRIMARY_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>ESIC Number</Text>
                  <Text style={styles.optionValue}>****{kycData.esic_last4}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No KYC Documents Found</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to upload a new document for identity verification.</Text>
            </View>
          </ScrollView>
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push('/kyc-form')}
        >
          <Ionicons name={hasData ? "pencil" : "add"} size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: PRIMARY_COLOR,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerRightSpacer: {
    padding: 4,
    width: 32,
    alignItems: 'flex-end',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC', // Light gray background for the list area
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 80, // Extra padding for FAB
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  optionValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
