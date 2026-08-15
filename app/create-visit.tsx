import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TextInput, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { teamService, TeamMemberResponse } from '../services/teamService';
import { visitApi } from '../services/visitApi';

export default function CreateVisitScreen() {
  const { user } = useAuth();
  
  const [customerName, setCustomerName] = useState('');
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [product, setProduct] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (d: Date) => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [coPartner, setCoPartner] = useState<TeamMemberResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await teamService.getTeam();
        if (response.success && response.data.team) {
          setTeamMembers(response.data.team);
        }
      } catch (error) {
        console.error('Failed to load team members', error);
      }
    };
    fetchTeam();
  }, []);

  const handleCreateVisit = async () => {
    if (!customerName || !address || !purpose || !product) {
      Alert.alert('Error', 'Please fill all mandatory fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await visitApi.createVisit({
        customer_name: customerName,
        client_name: clientName,
        address,
        visit_purpose: purpose,
        product,
        visit_date: formatDate(date),
        visit_time: formatTime(time),
        co_assignee_id: coPartner?.id
      });
      
      if (response.success) {
        Alert.alert('Success', 'Visit scheduled successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to create visit');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Network error occurred');
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>Create Visit</Text>
          <View style={styles.headerRightSpace} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Employee Assignment</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Employee Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]} 
                value={user?.name || ''}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Co-Partner (Optional)</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
                <Text style={coPartner ? styles.pickerTextSelected : styles.pickerTextPlaceholder}>
                  {coPartner ? coPartner.name : 'Select Team Member'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Visit Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Customer Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Acme Corp" value={customerName} onChangeText={setCustomerName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Client Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. John Doe" value={clientName} onChangeText={setClientName} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput style={styles.input} placeholder="Enter full address" value={address} onChangeText={setAddress} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Visit Purpose *</Text>
              <TextInput style={styles.input} placeholder="e.g. Product Demo" value={purpose} onChangeText={setPurpose} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product *</Text>
              <TextInput style={styles.input} placeholder="e.g. Premium License" value={product} onChangeText={setProduct} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput 
                    style={styles.input} 
                    value={formatDate(date)} 
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Time * (HH:MM)</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                  <TextInput 
                    style={styles.input} 
                    value={formatTime(time)} 
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateVisit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Schedule Visit</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            if (Platform.OS === 'android') setShowTimePicker(false);
            if (event.type === 'set' && selectedTime) {
              setTime(selectedTime);
            }
          }}
        />
      )}

      {/* Team Member Picker Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Co-Partner</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={teamMembers}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center', color: '#6B7280' }}>No team members found.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalListItem} 
                  onPress={() => {
                    setCoPartner(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalListTitle}>{item.name}</Text>
                  <Text style={styles.modalListSubtitle}>{item.designation}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.primary },
  safeArea: { backgroundColor: COLORS.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.primary },
  backButton: { width: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerRightSpace: { width: 40 },
  contentContainer: { flex: 1, backgroundColor: '#F8F9FC', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1E1B4B' },
  row: { flexDirection: 'row' },
  pickerButton: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerTextPlaceholder: { color: '#9CA3AF', fontSize: 15 },
  pickerTextSelected: { color: '#1E1B4B', fontSize: 15 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E1B4B' },
  modalListItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalListTitle: { fontSize: 16, fontWeight: '600', color: '#1E1B4B', marginBottom: 4 },
  modalListSubtitle: { fontSize: 14, color: '#6B7280' },
});
