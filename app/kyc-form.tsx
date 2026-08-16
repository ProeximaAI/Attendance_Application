import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '../components/Themed';
import { kycService } from '../services/kycService';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY_COLOR = '#4338CA'; 
const TEXT_COLOR = '#1E1B4B';

export default function KycFormScreen() {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    profile_photo: '',
    date_of_birth: '',
    aadhaar_no: '',
    pan_no: '',
    esic_no: '',
    pf_no: '',
    bank_name: '',
    bank_account_no: '',
    ifsc_code: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleInputChange('date_of_birth', formattedDate);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant camera roll permissions to upload a photo.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleInputChange('profile_photo', result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // Only submit if at least one field has data
    const hasData = Object.values(formData).some(val => val.trim() !== '');
    if (!hasData) {
      Alert.alert('Empty Form', 'Please enter at least one detail before saving.');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      
      if (formData.profile_photo) {
        submitData.append('profile_photo', {
          uri: formData.profile_photo,
          name: 'kyc_photo.jpg',
          type: 'image/jpeg'
        } as any);
      }

      if (formData.date_of_birth) submitData.append('date_of_birth', formData.date_of_birth);
      if (formData.aadhaar_no) submitData.append('aadhaar_no', formData.aadhaar_no);
      if (formData.pan_no) submitData.append('pan_no', formData.pan_no);
      if (formData.esic_no) submitData.append('esic_no', formData.esic_no);
      if (formData.pf_no) submitData.append('pf_no', formData.pf_no);
      if (formData.bank_name) submitData.append('bank_name', formData.bank_name);
      if (formData.bank_account_no) submitData.append('bank_account_no', formData.bank_account_no);
      if (formData.ifsc_code) submitData.append('ifsc_code', formData.ifsc_code);

      const res = await kycService.submitKyc(submitData);
      if (res.success) {
        Alert.alert('Success', 'KYC details saved securely!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', res.message || 'Failed to save KYC data.');
      }
    } catch (error: any) {
      console.error('Submit KYC error:', error);
      Alert.alert('Error', error.message || 'Failed to communicate with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
          <Ionicons name="chevron-back" size={24} color={TEXT_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update KYC</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.photoUploadContainer}>
            <TouchableOpacity style={styles.photoUploadBtn} onPress={pickImage} activeOpacity={0.7}>
              {formData.profile_photo ? (
                <Image source={{ uri: formData.profile_photo }} style={styles.previewImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={PRIMARY_COLOR} />
                  <Text style={styles.photoPlaceholderText}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHint}>Tap to select profile photo</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Identity Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Aadhaar Number</Text>
              <TextInput
                style={styles.input}
                placeholder="12-digit Aadhaar No"
                placeholderTextColor="#9CA3AF"
                value={formData.aadhaar_no}
                onChangeText={(val) => handleInputChange('aadhaar_no', val)}
                keyboardType="numeric"
                maxLength={12}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PAN Number</Text>
              <TextInput
                style={styles.input}
                placeholder="10-character PAN No"
                placeholderTextColor="#9CA3AF"
                value={formData.pan_no}
                onChangeText={(val) => handleInputChange('pan_no', val.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateText, !formData.date_of_birth && { color: '#9CA3AF' }]}>
                  {formData.date_of_birth || 'YYYY-MM-DD'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={PRIMARY_COLOR} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Employment Records</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PF Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Provident Fund No"
                placeholderTextColor="#9CA3AF"
                value={formData.pf_no}
                onChangeText={(val) => handleInputChange('pf_no', val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ESIC Number</Text>
              <TextInput
                style={styles.input}
                placeholder="ESIC Insurance No"
                placeholderTextColor="#9CA3AF"
                value={formData.esic_no}
                onChangeText={(val) => handleInputChange('esic_no', val)}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. HDFC Bank"
                placeholderTextColor="#9CA3AF"
                value={formData.bank_name}
                onChangeText={(val) => handleInputChange('bank_name', val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Account Number"
                placeholderTextColor="#9CA3AF"
                value={formData.bank_account_no}
                onChangeText={(val) => handleInputChange('bank_account_no', val)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. HDFC0000123"
                placeholderTextColor="#9CA3AF"
                value={formData.ifsc_code}
                onChangeText={(val) => handleInputChange('ifsc_code', val.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Save Details</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  headerRightSpacer: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoUploadBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EEF2FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 10,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginTop: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  photoHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 10,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_COLOR,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 15,
    color: TEXT_COLOR,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
