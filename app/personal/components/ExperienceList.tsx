import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getExperience, addExperience, deleteExperience } from '../../../services/profileService';
import { Experience, ExperiencePayload } from '../../../types/profile';
import { COLORS } from '../../../constants/theme';

export default function ExperienceList() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [form, setForm] = useState<ExperiencePayload>({
    organization: '',
    designation: '',
    from_date: '',
    to_date: '',
    responsibility: '',
  });

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handleFromDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowFromPicker(false);
    if (selectedDate) {
      setForm({...form, from_date: selectedDate.toISOString().split('T')[0]});
    }
  };

  const handleToDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowToPicker(false);
    if (selectedDate) {
      setForm({...form, to_date: selectedDate.toISOString().split('T')[0]});
    }
  };

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const data = await getExperience();
      setExperiences(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch experience');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleDelete = async (uuid: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this experience?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExperience(uuid);
            fetchExperiences();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete experience');
          }
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.organization || !form.designation || !form.from_date || !form.to_date) {
      Alert.alert('Validation Error', 'Organization, Designation, From Date, and To Date are required.');
      return;
    }
    
    try {
      setLoading(true);
      await addExperience(form);
      setModalVisible(false);
      setForm({ organization: '', designation: '', from_date: '', to_date: '', responsibility: '' });
      fetchExperiences();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add experience');
      setLoading(false);
    }
  };

  if (loading && experiences.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={experiences}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No experience found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.organization}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.uuid)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardSubtitle}>{item.designation}</Text>
            <Text style={styles.cardText}>{item.from_date} to {item.to_date}</Text>
            {!!item.responsibility && <Text style={styles.cardText}>{item.responsibility}</Text>}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Experience</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.label}>Organization *</Text>
          <TextInput style={styles.input} value={form.organization} onChangeText={t => setForm({...form, organization: t})} placeholder="Organization Name" />
          
          <Text style={styles.label}>Designation *</Text>
          <TextInput style={styles.input} value={form.designation} onChangeText={t => setForm({...form, designation: t})} placeholder="Designation" />

          <Text style={styles.label}>From Date (YYYY-MM-DD) *</Text>
          <TouchableOpacity onPress={() => setShowFromPicker(true)}>
            <TextInput style={styles.input} value={form.from_date} placeholder="YYYY-MM-DD" editable={false} pointerEvents="none" />
          </TouchableOpacity>
          {showFromPicker && (
            <DateTimePicker
              value={form.from_date ? new Date(form.from_date) : new Date()}
              mode="date"
              display="default"
              onChange={handleFromDateChange}
            />
          )}

          <Text style={styles.label}>To Date (YYYY-MM-DD) *</Text>
          <TouchableOpacity onPress={() => setShowToPicker(true)}>
            <TextInput style={styles.input} value={form.to_date} placeholder="YYYY-MM-DD" editable={false} pointerEvents="none" />
          </TouchableOpacity>
          {showToPicker && (
            <DateTimePicker
              value={form.to_date ? new Date(form.to_date) : new Date()}
              mode="date"
              display="default"
              onChange={handleToDateChange}
            />
          )}

          <Text style={styles.label}>Responsibility</Text>
          <TextInput style={styles.input} value={form.responsibility} onChangeText={t => setForm({...form, responsibility: t})} placeholder="Roles and Responsibilities" multiline numberOfLines={3} />

          <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Save Experience</Text>}
          </TouchableOpacity>
          <View style={{height: 40}} />
        </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 80 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#6B7280' },
  card: {
    backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  cardSubtitle: { fontSize: 14, fontWeight: '500', color: '#111827', marginBottom: 6 },
  cardText: { fontSize: 14, color: '#4B5563', marginBottom: 2 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalContent: { padding: 20 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#FFF' },
  submitButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
