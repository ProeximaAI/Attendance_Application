import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAddress, addAddress, deleteAddress } from '../../../services/profileService';
import { Address, AddressPayload } from '../../../types/profile';
import { COLORS } from '../../../constants/theme';

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [form, setForm] = useState<AddressPayload>({
    address_type: 'current',
    house_no: '',
    landmark: '',
    area: '',
    country: '',
    state: '',
    city: '',
    zip_code: '',
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddress();
      setAddresses(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (uuid: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(uuid);
            fetchAddresses();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const handleAdd = async () => {
    if (!form.house_no || !form.address_type) {
      Alert.alert('Validation Error', 'House No and Address Type are required.');
      return;
    }
    
    try {
      setLoading(true);
      await addAddress(form);
      setModalVisible(false);
      setForm({
        address_type: 'current', house_no: '', landmark: '', area: '', country: '', state: '', city: '', zip_code: ''
      });
      fetchAddresses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add address');
      setLoading(false);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No addresses found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.address_type.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.uuid)}>
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardText}>{item.house_no}, {item.landmark}</Text>
            <Text style={styles.cardText}>{item.area}, {item.city}, {item.state}, {item.zip_code}</Text>
            <Text style={styles.cardText}>{item.country}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Address</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.label}>Address Type *</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[styles.radio, form.address_type === 'current' && styles.radioSelected]} 
              onPress={() => setForm({...form, address_type: 'current'})}
            >
              <Text style={form.address_type === 'current' ? styles.radioTextSelected : styles.radioText}>Current</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.radio, form.address_type === 'permanent' && styles.radioSelected]} 
              onPress={() => setForm({...form, address_type: 'permanent'})}
            >
              <Text style={form.address_type === 'permanent' ? styles.radioTextSelected : styles.radioText}>Permanent</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>House No *</Text>
          <TextInput style={styles.input} value={form.house_no} onChangeText={t => setForm({...form, house_no: t})} placeholder="House No" />
          
          <Text style={styles.label}>Landmark</Text>
          <TextInput style={styles.input} value={form.landmark} onChangeText={t => setForm({...form, landmark: t})} placeholder="Landmark" />

          <Text style={styles.label}>Area</Text>
          <TextInput style={styles.input} value={form.area} onChangeText={t => setForm({...form, area: t})} placeholder="Area" />

          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={form.city} onChangeText={t => setForm({...form, city: t})} placeholder="City" />

          <Text style={styles.label}>State</Text>
          <TextInput style={styles.input} value={form.state} onChangeText={t => setForm({...form, state: t})} placeholder="State" />

          <Text style={styles.label}>Country</Text>
          <TextInput style={styles.input} value={form.country} onChangeText={t => setForm({...form, country: t})} placeholder="Country" />

          <Text style={styles.label}>Zip Code</Text>
          <TextInput style={styles.input} value={form.zip_code} onChangeText={t => setForm({...form, zip_code: t})} placeholder="Zip Code" keyboardType="numeric" />

          <TouchableOpacity style={styles.submitButton} onPress={handleAdd} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Save Address</Text>}
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
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  cardText: { fontSize: 14, color: '#374151', marginBottom: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
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
