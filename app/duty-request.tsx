import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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

type DurationType = 'Full Day' | '1st Half' | '2nd Half';

export default function DutyRequestScreen() {
  const router = useRouter();
  const { type = 'Outdoor Duty', initialDate = '08-07-2026' } = useLocalSearchParams<{
    type?: string;
    initialDate?: string;
  }>();

  const [fromDate, setFromDate] = useState(initialDate);
  const [toDate, setToDate] = useState(initialDate);
  const [duration, setDuration] = useState<DurationType>('Full Day');
  const [reason, setReason] = useState('');

  // Calendar Picker State
  const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  // Duration Picker State
  const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);

  const openCalendar = (field: 'from' | 'to') => {
    setActiveDateField(field);
    setPickerDate(new Date());
  };

  const parseDate = (str: string) => {
    const [dd, mm, yyyy] = str.split('-').map(Number);
    return new Date(yyyy || 2026, (mm || 1) - 1, dd || 1);
  };

  const calculatedDays = useMemo(() => {
    try {
      const start = parseDate(fromDate);
      const end = parseDate(toDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays <= 0) return 0;
      if (diffDays === 1 && duration !== 'Full Day') {
        return 0.5;
      }
      return diffDays;
    } catch (e) {
      return 1;
    }
  }, [fromDate, toDate, duration]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please enter a reason for your request.');
      return;
    }

    Alert.alert(
      'Request Submitted',
      `Your ${type.toLowerCase()} request for ${fromDate} (${calculatedDays} day${
        calculatedDays !== 1 ? 's' : ''
      }) has been submitted successfully.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const daysLabel = type === 'Work From Home' ? 'Work from home days' : 'Outdoor duty days';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching current application aesthetic */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add {type}</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          {/* From Field with Date + Duration Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>From</Text>
            <View style={styles.combinedRow}>
              <TouchableOpacity
                style={styles.dateBoxLeft}
                onPress={() => openCalendar('from')}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.iconMargin} />
                <Text style={styles.dateText}>{fromDate}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.durationDropdown}
                onPress={() => setIsDurationPickerVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.durationText}>{duration}</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* To Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>To</Text>
            <TouchableOpacity
              style={styles.dateBoxFull}
              onPress={() => openCalendar('to')}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} style={styles.iconMargin} />
              <Text style={styles.dateText}>{toDate}</Text>
            </TouchableOpacity>
          </View>

          {/* Calculated Days Display */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{daysLabel}</Text>
            <Text style={styles.daysValueText}>{calculatedDays}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Reason Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Reason *</Text>
            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={3}
              placeholder={`Enter reason for ${type.toLowerCase()}...`}
              placeholderTextColor={COLORS.textMuted}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
            <View style={styles.dividerLine} />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.9}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Duration Picker Modal */}
      <Modal
        visible={isDurationPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDurationPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsDurationPickerVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Duration</Text>
              <TouchableOpacity onPress={() => setIsDurationPickerVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {(['Full Day', '1st Half', '2nd Half'] as DurationType[]).map((dur) => (
              <TouchableOpacity
                key={dur}
                style={[styles.durationOption, duration === dur && styles.durationOptionSelected]}
                onPress={() => {
                  setDuration(dur);
                  setIsDurationPickerVisible(false);
                }}
              >
                <Text style={[styles.durationOptionText, duration === dur && styles.durationOptionTextSelected]}>
                  {dur}
                </Text>
                {duration === dur && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={activeDateField !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveDateField(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setActiveDateField(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeDateField === 'from' ? 'Select From Date' : 'Select To Date'}
              </Text>
              <TouchableOpacity onPress={() => setActiveDateField(null)} style={styles.modalCloseBtn}>
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
                  const isSelected = activeDateField === 'from' ? fromDate === formatted : toDate === formatted;

                  cells.push(
                    <TouchableOpacity
                      key={d}
                      style={styles.calendarCell}
                      onPress={() => {
                        if (activeDateField === 'from') {
                          setFromDate(formatted);
                          if (parseDate(formatted) > parseDate(toDate)) {
                            setToDate(formatted);
                          }
                        } else if (activeDateField === 'to') {
                          setToDate(formatted);
                          if (parseDate(formatted) < parseDate(fromDate)) {
                            setFromDate(formatted);
                          }
                        }
                        setActiveDateField(null);
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  combinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBoxLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  durationDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    minWidth: 110,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
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
  iconMargin: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  daysValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: 6,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 6,
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
  durationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary,
  },
  durationOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  durationOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
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
});
