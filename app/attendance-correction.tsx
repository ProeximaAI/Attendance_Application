import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { attendanceService } from '../services/attendanceService';

export default function AttendanceCorrectionScreen() {
  const router = useRouter();
  const { initialDate } = useLocalSearchParams<{ initialDate?: string }>();

  // Default to today if not provided
  const getToday = () => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  };

  const [date, setDate] = useState(initialDate || getToday());
  const [timeIn, setTimeIn] = useState('09:00');
  const [timeOut, setTimeOut] = useState('18:00');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const [isTimePickerVisible, setIsTimePickerVisible] = useState<'in' | 'out' | null>(null);
  const [tempHour, setTempHour] = useState('09');
  const [tempMinute, setTempMinute] = useState('00');

  const openTimePicker = (field: 'in' | 'out') => {
    const timeToEdit = field === 'in' ? timeIn : timeOut;
    if (timeToEdit) {
      const [h, m] = timeToEdit.split(':');
      setTempHour(h);
      setTempMinute(m);
    }
    setIsTimePickerVisible(field);
  };

  const saveTime = () => {
    const formattedTime = `${tempHour}:${tempMinute}`;
    if (isTimePickerVisible === 'in') {
      setTimeIn(formattedTime);
    } else {
      setTimeOut(formattedTime);
    }
    setIsTimePickerVisible(null);
  };

  const formatDateForApi = (dateStr: string) => {
    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please enter a reason for the correction.');
      return;
    }

    if (!timeIn && !timeOut) {
      Alert.alert('Validation Error', 'Please provide either Time In or Time Out.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        date: formatDateForApi(date),
        time_in: timeIn ? `${timeIn}:00` : undefined,
        time_out: timeOut ? `${timeOut}:00` : undefined,
        reason: reason.trim(),
      };

      const response = await attendanceService.requestTimeCorrection(payload);

      // If we reach here, the API call was successful (2xx response)
      Alert.alert(
        'Request Submitted',
        response?.message || 'Time correction has been submitted successfully.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/logs') }]
      );
    } catch (error: any) {
      Alert.alert(
        'Request Failed',
        error?.message || 'Something went wrong. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Correction</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          {/* Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateBoxFull}
              onPress={() => setIsDatePickerVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.iconMargin} />
              <Text style={styles.dateText}>{date}</Text>
            </TouchableOpacity>
          </View>

          {/* Time Fields */}
          <View style={styles.timeRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Time In</Text>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => openTimePicker('in')}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={18} color={COLORS.primary} style={styles.iconMargin} />
                <Text style={styles.dateText}>{timeIn || '--:--'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Time Out</Text>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => openTimePicker('out')}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={18} color={COLORS.primary} style={styles.iconMargin} />
                <Text style={styles.dateText}>{timeOut || '--:--'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dividerLine} />

          {/* Reason Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Reason *</Text>
            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={3}
              placeholder="Enter reason for time correction..."
              placeholderTextColor={COLORS.textMuted}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
            <View style={styles.dividerLine} />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.9} disabled={isLoading}>
            <Text style={styles.submitButtonText}>{isLoading ? 'Submitting...' : 'Submit Request'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal (reusing structure from duty request) */}
      <Modal
        visible={isDatePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsDatePickerVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setIsDatePickerVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Calendar Navigation */}
            <View style={styles.calendarNav}>
              <TouchableOpacity
                onPress={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1, 1))}
                style={styles.calendarNavBtn}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>
                {pickerDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 1))}
                style={styles.calendarNavBtn}
              >
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View style={styles.calendarWeekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
                <Text key={wd} style={styles.calendarWeekdayText}>{wd}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.calendarGrid}>
              {(() => {
                const yr = pickerDate.getFullYear();
                const mo = pickerDate.getMonth();
                const firstDayIndex = new Date(yr, mo, 1).getDay();
                const daysInMonth = new Date(yr, mo + 1, 0).getDate();
                const cells = [];

                for (let i = 0; i < firstDayIndex; i++) {
                  cells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
                }

                const today = new Date();
                const isCurrentMonthYear = today.getFullYear() === yr && today.getMonth() === mo;

                for (let d = 1; d <= daysInMonth; d++) {
                  const isToday = isCurrentMonthYear && today.getDate() === d;
                  const dd = d < 10 ? `0${d}` : `${d}`;
                  const mm = (mo + 1) < 10 ? `0${mo + 1}` : `${mo + 1}`;
                  const formatted = `${dd}-${mm}-${yr}`;
                  const isSelected = date === formatted;

                  cells.push(
                    <TouchableOpacity
                      key={d}
                      style={styles.calendarCell}
                      onPress={() => {
                        setDate(formatted);
                        setIsDatePickerVisible(false);
                      }}
                    >
                      <View
                        style={[
                          styles.dayBox,
                          isToday && !isSelected && styles.dayBoxToday,
                          isSelected && styles.dayBoxSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            isToday && !isSelected && styles.dayTextToday,
                            isSelected && styles.dayTextSelected,
                          ]}
                        >
                          {d}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
                return cells;
              })()}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={isTimePickerVisible !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTimePickerVisible(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsTimePickerVisible(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTimePickerVisible === 'in' ? 'Select Time In' : 'Select Time Out'}
              </Text>
              <TouchableOpacity onPress={() => setIsTimePickerVisible(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.timePickerContainer}>
              {/* Hours Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>Hour</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {HOURS.map((h) => (
                    <TouchableOpacity
                      key={`h-${h}`}
                      style={[styles.timeOption, tempHour === h && styles.timeOptionSelected]}
                      onPress={() => setTempHour(h)}
                    >
                      <Text style={[styles.timeOptionText, tempHour === h && styles.timeOptionTextSelected]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              {/* Minutes Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>Minute</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {MINUTES.map((m) => (
                    <TouchableOpacity
                      key={`m-${m}`}
                      style={[styles.timeOption, tempMinute === m && styles.timeOptionSelected]}
                      onPress={() => setTempMinute(m)}
                    >
                      <Text style={[styles.timeOptionText, tempMinute === m && styles.timeOptionTextSelected]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={saveTime}>
              <Text style={styles.modalSubmitBtnText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRightSpacer: {
    width: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 22,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  halfField: {
    width: '48%',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  dateBoxFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  iconMargin: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 6,
    marginBottom: 16,
  },
  reasonInput: {
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 8,
    minHeight: 60,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalCloseBtn: {
    padding: 4,
  },

  // Calendar Styles
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarNavBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarWeekdayText: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBoxToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayBoxSelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayTextToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Time Picker Styles
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
    marginBottom: 20,
  },
  timeColumn: {
    width: 80,
    height: '100%',
  },
  timeColumnTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  timeScroll: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeOption: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 16,
    paddingBottom: 20,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
