import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';
import { FinanceService } from '../../services/financeService';
import CustomPicker from '../../components/CustomPicker';
import { EXPENSE_TYPES, EXPENSE_CATEGORIES, EXPENSE_HEADS } from '../../constants/financeOptions';

export default function ApplyExpenseScreen() {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expenseType, setExpenseType] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseHead, setExpenseHead] = useState('');
  const [amount, setAmount] = useState('');
  const [attachment, setAttachment] = useState<any>(null);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachment(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document', err);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const validateForm = () => {
    if (!expenseType.trim()) return 'Expense type is required';
    if (!expenseCategory.trim()) return 'Expense category is required';
    if (!expenseHead.trim()) return 'Expense head is required';
    if (!amount.trim()) return 'Amount is required';
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Amount must be greater than zero';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      Alert.alert('Validation Error', errorMsg);
      return;
    }

    setLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      
      const payload: any = {
        expense_date: formattedDate,
        expense_type: expenseType,
        expense_category: expenseCategory,
        expense_head: expenseHead,
        amount: amount,
      };

      if (attachment) {
        payload.attachment = {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.mimeType || 'application/octet-stream'
        };
      }

      await FinanceService.applyExpense(payload);
      Alert.alert('Success', 'Expense applied successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply Expense</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.label}>Expense Date</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>{date.toISOString().split('T')[0]}</Text>
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <CustomPicker
          label="Expense Type"
          value={expenseType}
          options={EXPENSE_TYPES}
          onSelect={setExpenseType}
          placeholder="Select expense type"
        />

        <CustomPicker
          label="Expense Category"
          value={expenseCategory}
          options={EXPENSE_CATEGORIES}
          onSelect={setExpenseCategory}
          placeholder="Select expense category"
        />

        <CustomPicker
          label="Expense Head"
          value={expenseHead}
          options={EXPENSE_HEADS}
          onSelect={setExpenseHead}
          placeholder="Select expense head"
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Attachment (Optional)</Text>
        <TouchableOpacity style={styles.attachmentButton} onPress={pickDocument}>
          <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
          <Text style={styles.attachmentText}>
            {attachment ? attachment.name : 'Select JPG, PNG or PDF (Max 5MB)'}
          </Text>
        </TouchableOpacity>
        
        {attachment && (
          <TouchableOpacity style={styles.removeAttachment} onPress={() => setAttachment(null)}>
            <Text style={styles.removeAttachmentText}>Remove Attachment</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  attachmentButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  removeAttachment: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  removeAttachmentText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
