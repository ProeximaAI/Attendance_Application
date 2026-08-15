import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getEducation, addEducation, deleteEducation } from '../../../services/profileService';
import { Education, EducationPayload } from '../../../types/profile';
import { COLORS } from '../../../constants/theme';

export default function EducationList() {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [form, setForm] = useState<EducationPayload>({
    qualification: '',
    year_of_passing: '',
    grade: '',
    percentage: '',
    institute: '',
    university_board: '',
  });

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const data = await getEducation();
      setEducationList(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch education');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const handleDelete = async (uuid: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this education record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEducation(uuid);
            fetchEducation();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete education');
          }
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.qualification || !form.year_of_passing || !form.institute) {
      Alert.alert('Validation Error', 'Qualification, Year of Passing, and Institute are required.');
      return;
    }
    
    try {
      setLoading(true);
      await addEducation(form);
      setModalVisible(false);
      setForm({ qualification: '', year_of_passing: '', grade: '', percentage: '', institute: '', university_board: '' });
      fetchEducation();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add education');
      setLoading(false);
    }
  };

  if (loading && educationList.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={educationList}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No education records found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.qualification}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.uuid)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardSubtitle}>{item.institute}</Text>
            <Text style={styles.cardText}>Passed: {item.year_of_passing}</Text>
            {!!item.university_board && <Text style={styles.cardText}>Board/Univ: {item.university_board}</Text>}
            {(!!item.grade || !!item.percentage) && (
              <Text style={styles.cardText}>
                {item.grade ? `Grade: ${item.grade}  ` : ''} 
                {item.percentage ? `Percentage: ${item.percentage}%` : ''}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Education</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.label}>Qualification *</Text>
          <TextInput style={styles.input} value={form.qualification} onChangeText={t => setForm({...form, qualification: t})} placeholder="e.g. B.Tech, MBA" />
          
          <Text style={styles.label}>Institute/College *</Text>
          <TextInput style={styles.input} value={form.institute} onChangeText={t => setForm({...form, institute: t})} placeholder="Institute Name" />

          <Text style={styles.label}>Year of Passing *</Text>
          <TextInput style={styles.input} value={String(form.year_of_passing)} onChangeText={t => setForm({...form, year_of_passing: t})} placeholder="e.g. 2020" keyboardType="numeric" />

          <Text style={styles.label}>University/Board</Text>
          <TextInput style={styles.input} value={form.university_board} onChangeText={t => setForm({...form, university_board: t})} placeholder="Board/University Name" />

          <Text style={styles.label}>Grade</Text>
          <TextInput style={styles.input} value={form.grade} onChangeText={t => setForm({...form, grade: t})} placeholder="e.g. A, First Class" />
          
          <Text style={styles.label}>Percentage</Text>
          <TextInput style={styles.input} value={String(form.percentage)} onChangeText={t => setForm({...form, percentage: t})} placeholder="e.g. 85.5" keyboardType="numeric" />

          <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Save Education</Text>}
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
