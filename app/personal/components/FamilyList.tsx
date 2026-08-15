import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getFamily, addFamily, deleteFamily } from '../../../services/profileService';
import { Family, FamilyPayload } from '../../../types/profile';
import { COLORS } from '../../../constants/theme';

export default function FamilyList() {
  const [familyMembers, setFamilyMembers] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [form, setForm] = useState<FamilyPayload>({
    name: '',
    dob: '',
    phone: '',
    relation: '',
    gender: 'male',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setForm({...form, dob: selectedDate.toISOString().split('T')[0]});
    }
  };

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const data = await getFamily();
      setFamilyMembers(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch family details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  const handleDelete = async (uuid: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this family member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFamily(uuid);
            fetchFamily();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete family member');
          }
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.name || !form.dob || !form.relation) {
      Alert.alert('Validation Error', 'Name, DOB, and Relation are required.');
      return;
    }
    
    try {
      setLoading(true);
      await addFamily(form);
      setModalVisible(false);
      setForm({ name: '', dob: '', phone: '', relation: '', gender: 'male' });
      fetchFamily();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add family member');
      setLoading(false);
    }
  };

  if (loading && familyMembers.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No family members found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.uuid)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardSubtitle}>{item.relation} • {item.gender.toUpperCase()}</Text>
            <Text style={styles.cardText}>DOB: {item.dob}</Text>
            {!!item.phone && <Text style={styles.cardText}>Phone: {item.phone}</Text>}
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Family Member</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={t => setForm({...form, name: t})} placeholder="Full Name" />
          
          <Text style={styles.label}>Relation *</Text>
          <TextInput style={styles.input} value={form.relation} onChangeText={t => setForm({...form, relation: t})} placeholder="e.g. Father, Spouse, Child" />

          <Text style={styles.label}>Date of Birth (YYYY-MM-DD) *</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput style={styles.input} value={form.dob} placeholder="YYYY-MM-DD" editable={false} pointerEvents="none" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.dob ? new Date(form.dob) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={form.phone} onChangeText={t => setForm({...form, phone: t})} placeholder="Phone Number" keyboardType="phone-pad" />

          <Text style={styles.label}>Gender *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[styles.radio, form.gender === 'male' && styles.radioSelected]} 
              onPress={() => setForm({...form, gender: 'male'})}
            >
              <Text style={form.gender === 'male' ? styles.radioTextSelected : styles.radioText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.radio, form.gender === 'female' && styles.radioSelected]} 
              onPress={() => setForm({...form, gender: 'female'})}
            >
              <Text style={form.gender === 'female' ? styles.radioTextSelected : styles.radioText}>Female</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Save Member</Text>}
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
  radioGroup: { flexDirection: 'row', marginBottom: 16 },
  radio: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', marginRight: 8, borderRadius: 8 },
  radioSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  radioText: { color: '#374151' },
  radioTextSelected: { color: '#FFF', fontWeight: 'bold' },
  submitButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
