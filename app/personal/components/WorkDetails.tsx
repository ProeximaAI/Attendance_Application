import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { getWorkDetails } from '../../../services/profileService';
import { WorkDetails as WorkDetailsType } from '../../../types/profile';
import { COLORS } from '../../../constants/theme';

interface WorkDetailsProps {
  id: string; // '6' for Branch, '7' for Dept, '8' for Designation, '10' for Shift
}

export default function WorkDetails({ id }: WorkDetailsProps) {
  const [details, setDetails] = useState<WorkDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await getWorkDetails();
      setDetails(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch work details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!details) {
    return <View style={styles.center}><Text style={styles.emptyText}>No data available.</Text></View>;
  }

  const renderContent = () => {
    switch (id) {
      case '6': // Branch
        return (
          <View style={styles.card}>
            <Text style={styles.label}>Branch Name</Text>
            <Text style={styles.value}>{details.branch?.name || 'N/A'}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{details.branch?.location || 'N/A'}</Text>
          </View>
        );
      case '7': // Department
        return (
          <View style={styles.card}>
            <Text style={styles.label}>Department Name</Text>
            <Text style={styles.value}>{details.department?.name || 'N/A'}</Text>
          </View>
        );
      case '8': // Designation
        return (
          <View style={styles.card}>
            <Text style={styles.label}>Designation Title</Text>
            <Text style={styles.value}>{details.designation?.name || 'N/A'}</Text>
          </View>
        );
      case '10': // Shift
        return (
          <View style={styles.card}>
            <Text style={styles.label}>Shift Timings</Text>
            <Text style={styles.value}>{details.shift?.start_time} - {details.shift?.end_time}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Working Days</Text>
            <View style={styles.daysContainer}>
              {details.shift?.working_days?.map((day, index) => (
                <View key={index} style={styles.dayBadge}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
              {(!details.shift?.working_days || details.shift.working_days.length === 0) && (
                <Text style={styles.value}>N/A</Text>
              )}
            </View>
          </View>
        );
      default:
        return <Text style={styles.emptyText}>Invalid section</Text>;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#6B7280' },
  card: {
    backgroundColor: '#FFF', padding: 20, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 18, color: '#111827', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  dayBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  dayText: { fontSize: 13, color: '#374151', fontWeight: '500' }
});
