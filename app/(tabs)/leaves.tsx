import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';

interface LeaveRequest {
  id: string;
  dateRange: string;
  type: string;
  status: 'Pending' | 'Approved';
}

type LeaveType = 'Casual' | 'Sick' | 'Compensatory off' | 'LOP';

const { width, width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LeavesScreen() {
  // Form state
  const [selectedType, setSelectedType] = useState<LeaveType>('Casual');
  const [fromDate, setFromDate] = useState('06-07-2026');
  const [toDate, setToDate] = useState('07-07-2026');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'1st half' | '2nd half'>('1st half');
  const [reason, setReason] = useState('');

  // Calendar Modal State
  const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const openCalendar = (field: 'from' | 'to') => {
    setActiveDateField(field);
    setPickerDate(new Date());
  };

  const parseDate = (str: string) => {
    const [dd, mm, yyyy] = str.split('-').map(Number);
    return new Date(yyyy || 2026, (mm || 1) - 1, dd || 1);
  };

  const calculatedDays = useMemo(() => {
    if (isHalfDay) return 0.5;
    try {
      const start = parseDate(fromDate);
      const end = parseDate(toDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays <= 0 ? 0 : diffDays;
    } catch (e) {
      return 1;
    }
  }, [fromDate, toDate, isHalfDay]);

  // Recent Requests State
  const [requests, setRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      dateRange: '3 - 4 Jul',
      type: 'Casual leave',
      status: 'Pending',
    },
    {
      id: '2',
      dateRange: '18 Jun',
      type: 'Sick leave',
      status: 'Approved',
    },
    {
      id: '3',
      dateRange: '2 - 6 Jun',
      type: 'Compensatory off',
      status: 'Approved',
    },
  ]);

  // Balance lookup for selected tab
  const leaveStats: Record<LeaveType, { opening: number; accrued: number; used: number; balance: number | string }> = {
    Casual: { opening: 12, accrued: 0, used: 6, balance: 6 },
    Sick: { opening: 8, accrued: 0, used: 4, balance: 4 },
    'Compensatory off': { opening: 15, accrued: 0, used: 5, balance: 10 },
    LOP: { opening: 0, accrued: 0, used: 1, balance: 'N/A' },
  };

  const currentStats = leaveStats[selectedType];

  // Monthly usage bar data (Feb to Jul)
  const monthlyUsage = [
    { month: 'Feb', days: 1, maxDays: 5 },
    { month: 'Mar', days: 3, maxDays: 5 },
    { month: 'Apr', days: 5, maxDays: 5 },
    { month: 'May', days: 1, maxDays: 5 },
    { month: 'Jun', days: 3, maxDays: 5 },
    { month: 'Jul', days: 5, maxDays: 5 },
  ];

  const handleSendRequest = () => {
    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Please enter a reason for your leave request.');
      return;
    }

    const newReq: LeaveRequest = {
      id: Date.now().toString(),
      dateRange: `${fromDate.slice(0, 5)} - ${toDate.slice(0, 5)}`,
      type: `${selectedType} leave`,
      status: 'Pending',
    };

    setRequests([newReq, ...requests]);
    setReason('');
    Alert.alert('Request Sent', `Your ${selectedType.toLowerCase()} leave request has been submitted for approval.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed 3D Hero Illustration Banner (Behind Everything) */}
      <View style={styles.fixedHeroContainer} pointerEvents="none">
        <Image
          source={require('../../assets/images/leaves_hero.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Screen Header matching Attendance Log */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaves</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transparent spacer to let top of boy show through before scrolling */}
        <View style={styles.heroSpacer} />

        {/* Faded Background Container starting from summary cards section downwards */}
        <LinearGradient
          colors={['rgba(246, 245, 251, 0)', COLORS.background, COLORS.background]}
          locations={[0, 0.08, 1]}
          style={styles.gradientBgContainer}
        >
          {/* ================= SECTION 1: 4 STANDALONE LEAVE CARDS (2x2 Grid) ================= */}
          <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            {/* Casual Card */}
            <TouchableOpacity
              style={[styles.standaloneCard, { backgroundColor: '#EEF5FF' }, selectedType === 'Casual' && styles.standaloneCardActive]}
              onPress={() => setSelectedType('Casual')}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                </View>
                <View style={[styles.cardPillBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.cardPillText, { color: '#2563EB' }]}>50%</Text>
                </View>
              </View>
              <Text style={styles.cardStatValue}>6 Days</Text>
              <Text style={[styles.cardStatLabel, { color: '#2563EB' }]}>Casual (from 12 days)</Text>
            </TouchableOpacity>

            {/* Sick Card */}
            <TouchableOpacity
              style={[styles.standaloneCard, { backgroundColor: '#F5F3FF' }, selectedType === 'Sick' && styles.standaloneCardActive]}
              onPress={() => setSelectedType('Sick')}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="medkit" size={18} color="#7C3AED" />
                </View>
                <View style={[styles.cardPillBadge, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={[styles.cardPillText, { color: '#7C3AED' }]}>50%</Text>
                </View>
              </View>
              <Text style={styles.cardStatValue}>4 Days</Text>
              <Text style={[styles.cardStatLabel, { color: '#7C3AED' }]}>Sick (from 8 days)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            {/* Compensatory off Card */}
            <TouchableOpacity
              style={[styles.standaloneCard, { backgroundColor: '#FEF9E7' }, selectedType === 'Compensatory off' && styles.standaloneCardActive]}
              onPress={() => setSelectedType('Compensatory off')}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="calendar" size={18} color="#D97706" />
                </View>
                <View style={[styles.cardPillBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.cardPillText, { color: '#D97706' }]}>Paid</Text>
                </View>
              </View>
              <Text style={styles.cardStatValue}>10 Days</Text>
              <Text style={[styles.cardStatLabel, { color: '#D97706' }]}>Compensatory off (from 15 days)</Text>
            </TouchableOpacity>

            {/* LOP Card */}
            <TouchableOpacity
              style={[styles.standaloneCard, { backgroundColor: '#FFEBF0' }, selectedType === 'LOP' && styles.standaloneCardActive]}
              onPress={() => setSelectedType('LOP')}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: '#FFE4E6' }]}>
                  <Ionicons name="close-circle" size={18} color="#E11D48" />
                </View>
                <View style={[styles.cardPillBadge, { backgroundColor: '#FFE4E6' }]}>
                  <Text style={[styles.cardPillText, { color: '#E11D48' }]}>Deducted</Text>
                </View>
              </View>
              <Text style={styles.cardStatValue}>1 Day</Text>
              <Text style={[styles.cardStatLabel, { color: '#E11D48' }]}>LOP (Used)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= SECTION 2: APPLY FOR LEAVE FORM (Image 2) ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chevron-back" size={20} color={COLORS.text} style={{ marginRight: 4 }} />
              <Text style={styles.sectionHeaderTitle}>Apply for leave</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} />
          </View>

          {/* Leave Type Selector Pills */}
          <View style={styles.pillsRow}>
            {(['Casual', 'Sick', 'Compensatory off', 'LOP'] as LeaveType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.pillButton, selectedType === type && styles.pillButtonSelected]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.pillText, selectedType === type && styles.pillTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Inputs Row */}
          <View style={[styles.datesRow, isHalfDay && { opacity: 0.4 }]} pointerEvents={isHalfDay ? 'none' : 'auto'}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>From</Text>
              <TouchableOpacity style={styles.dateInputBox} onPress={() => openCalendar('from')} activeOpacity={0.8} disabled={isHalfDay}>
                <TextInput
                  style={styles.dateInputText}
                  value={fromDate}
                  onChangeText={setFromDate}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  editable={!isHalfDay}
                />
                <TouchableOpacity onPress={() => openCalendar('from')} disabled={isHalfDay}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.text} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>To</Text>
              <TouchableOpacity style={styles.dateInputBox} onPress={() => openCalendar('to')} activeOpacity={0.8} disabled={isHalfDay}>
                <TextInput
                  style={styles.dateInputText}
                  value={toDate}
                  onChangeText={setToDate}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={COLORS.textMuted}
                  editable={!isHalfDay}
                />
                <TouchableOpacity onPress={() => openCalendar('to')} disabled={isHalfDay}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.text} />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>

          {/* Half Day Checkbox & 1st/2nd half options */}
          <View style={styles.halfDayContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsHalfDay(!isHalfDay)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isHalfDay && styles.checkboxChecked]}>
                {isHalfDay && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Half day</Text>
            </TouchableOpacity>

            {isHalfDay && (
              <View style={styles.halfDayPills}>
                <TouchableOpacity
                  style={[styles.halfDayPill, halfDayPeriod === '1st half' && styles.halfDayPillActive]}
                  onPress={() => setHalfDayPeriod('1st half')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.halfDayPillText, halfDayPeriod === '1st half' && styles.halfDayPillTextActive]}>1st half</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.halfDayPill, halfDayPeriod === '2nd half' && styles.halfDayPillActive]}
                  onPress={() => setHalfDayPeriod('2nd half')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.halfDayPillText, halfDayPeriod === '2nd half' && styles.halfDayPillTextActive]}>2nd half</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Calculated Leave Days Display */}
          <View style={styles.daysDisplayContainer}>
            <Text style={styles.daysDisplayLabel}>Leave days</Text>
            <Text style={styles.daysDisplayValue}>{calculatedDays}</Text>
            <View style={styles.daysDisplayDivider} />
          </View>

          {/* Reason Field */}
          <View style={styles.reasonHeaderRow}>
            <Text style={styles.reasonLabelText}>Reason</Text>
          </View>

          <TextInput
            style={styles.reasonInput}
            multiline
            numberOfLines={4}
            placeholder="Family function out of town"
            placeholderTextColor={COLORS.textMuted}
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />

          {/* Send Request Button */}
          <TouchableOpacity style={styles.sendButton} onPress={handleSendRequest} activeOpacity={0.9}>
            <Text style={styles.sendButtonText}>Send request</Text>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION 3: BALANCE BREAKDOWN & MONTHLY USAGE (Image 3) ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chevron-back" size={20} color={COLORS.text} style={{ marginRight: 4 }} />
              <Text style={styles.sectionHeaderTitle}>Balance breakdown</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} />
          </View>

          <Text style={styles.breakdownSubtitle}>{selectedType} leave</Text>

          {/* Metrics Box */}
          <View style={styles.metricsBox}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Opening balance</Text>
              <Text style={styles.metricValue}>{currentStats.opening}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Accrued this year</Text>
              <Text style={styles.metricValue}>{currentStats.accrued}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Used</Text>
              <Text style={styles.metricValue}>{currentStats.used}</Text>
            </View>

            <View style={[styles.metricRow, { marginBottom: 0 }]}>
              <Text style={styles.metricLabelBold}>Balance</Text>
              <Text style={styles.metricValueBold}>{currentStats.balance}</Text>
            </View>
          </View>

          <Text style={[styles.breakdownSubtitle, { marginTop: 20 }]}>Monthly usage</Text>

          {/* Pure React Native Bar Graph */}
          <View style={styles.barGraphContainer}>
            {monthlyUsage.map((item) => {
              const heightPercentage = Math.max(10, (item.days / item.maxDays) * 100);
              return (
                <View key={item.month} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercentage}%`, backgroundColor: '#2563EB' },
                      ]}
                    />
                  </View>
                  <Text style={styles.barMonthLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ================= SECTION 4: RECENT REQUESTS ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Recent requests</Text>
          </View>

          <View style={styles.requestsList}>
            {requests.map((req, index) => (
              <View key={req.id} style={[styles.requestItem, index < requests.length - 1 && styles.requestBorder]}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestDate}>{req.dateRange}</Text>
                  <Text style={styles.requestType}>{req.type}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    req.status === 'Pending' ? styles.statusPending : styles.statusApproved,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      req.status === 'Pending' ? styles.statusTextPending : styles.statusTextApproved,
                    ]}
                  >
                    {req.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ================= SECTION 5: LEAVE POLICY (Image 4) ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="chevron-back" size={20} color={COLORS.text} style={{ marginRight: 4 }} />
              <Text style={styles.sectionHeaderTitle}>Leave policy</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} />
          </View>

          {/* Policy Cards */}
          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Casual leave</Text>
            <Text style={styles.policyDays}>12 days / year</Text>
            <Text style={styles.policyDesc}>Not carried forward</Text>
          </View>

          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Sick leave</Text>
            <Text style={styles.policyDays}>8 days / year</Text>
            <Text style={styles.policyDesc}>Medical certificate needed beyond 2 days</Text>
          </View>

          <View style={styles.policyCard}>
            <Text style={styles.policyTitle}>Compensatory off</Text>
            <Text style={styles.policyDays}>15 days / year</Text>
            <Text style={styles.policyDesc}>Up to 30 days can be carried forward</Text>
          </View>

          <View style={[styles.policyCard, { marginBottom: 0 }]}>
            <Text style={styles.policyTitle}>LOP</Text>
            <Text style={styles.policyDays}>No limit</Text>
            <Text style={styles.policyDesc}>Requires manager approval, pay deducted</Text>
          </View>
        </View>
        </LinearGradient>
      </ScrollView>

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

            {/* Month Navigation */}
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
                const year = pickerDate.getFullYear();
                const month = pickerDate.getMonth();
                const firstDayIndex = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const cells = [];

                for (let i = 0; i < firstDayIndex; i++) {
                  cells.push(<View key={`empty-${i}`} style={styles.calendarCell} />);
                }

                const today = new Date();
                const isCurrentMonthYear = today.getFullYear() === year && today.getMonth() === month;

                for (let d = 1; d <= daysInMonth; d++) {
                  const isToday = isCurrentMonthYear && today.getDate() === d;
                  const dd = d < 10 ? `0${d}` : `${d}`;
                  const mm = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
                  const formatted = `${dd}-${mm}-${year}`;
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  fixedHeroContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.78,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  heroSpacer: {
    height: SCREEN_HEIGHT * 0.48,
  },
  gradientBgContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  heroImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.80,
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
    paddingBottom: 110, // space for bottom navbar
  },
  gridContainer: {
    marginBottom: 16,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  standaloneCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  standaloneCardActive: {
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  requestsList: {
    backgroundColor: '#FFFFFF',
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  requestBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  requestInfo: {
    flex: 1,
  },
  requestDate: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  requestType: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextApproved: {
    color: '#15803D',
  },
  divider: {
    height: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillButtonSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateInputText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  reasonLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  reasonInput: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 100,
    marginBottom: 18,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  breakdownSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  metricsBox: {
    backgroundColor: '#FAFAFA',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
  },
  metricLabelBold: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '800',
  },
  metricValueBold: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '800',
  },
  barGraphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 32,
    height: 100,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barMonthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 8,
  },
  policyCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  policyDays: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  policyDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  halfDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  halfDayPills: {
    flexDirection: 'row',
    gap: 8,
  },
  halfDayPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  halfDayPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary,
  },
  halfDayPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  halfDayPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
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
  calendarNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarNavBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarWeekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBoxToday: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dayBoxSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '800',
  },
  daysDisplayContainer: {
    marginBottom: 18,
  },
  daysDisplayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  daysDisplayValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: 4,
  },
  daysDisplayDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 6,
  },
});
