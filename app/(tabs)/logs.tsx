import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MonthlySummaryCard } from '../../components/MonthlySummaryCard';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';

interface AttendanceLog {
  day: number;
  dayName: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  location: string;
  status: 'present' | 'absent' | 'leave' | 'wfh';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Dynamically generate years from 1950 to current year
const NOW = new Date();
const CURRENT_ACTUAL_YEAR = NOW.getFullYear();
const CURRENT_ACTUAL_MONTH = NOW.getMonth();
const CURRENT_ACTUAL_DAY = NOW.getDate();

const YEARS = Array.from({ length: Math.max(1, CURRENT_ACTUAL_YEAR - 1950 + 1) }, (_, i) => 1950 + i);

const isDateInFuture = (yr: number, mo: number, dy: number) => {
  const target = new Date(yr, mo, dy);
  const today = new Date(CURRENT_ACTUAL_YEAR, CURRENT_ACTUAL_MONTH, CURRENT_ACTUAL_DAY);
  return target > today;
};

const formatDDMMYYYY = (d: Date) => {
  const dd = d.getDate() < 10 ? `0${d.getDate()}` : `${d.getDate()}`;
  const mm = (d.getMonth() + 1) < 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`;
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function LogsScreen() {
  // Current viewed month state (defaulting to current active date)
  const [viewDate, setViewDate] = useState(new Date(CURRENT_ACTUAL_YEAR, CURRENT_ACTUAL_MONTH, 1));
  const [selectedDay, setSelectedDay] = useState<number>(CURRENT_ACTUAL_DAY);
  const [futureActionDate, setFutureActionDate] = useState<Date | null>(null);

  // Modal Picker State
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(CURRENT_ACTUAL_YEAR);

  const yearScrollRef = useRef<ScrollView>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Generate comprehensive mock logs for the viewed month
  const monthLogs = useMemo(() => {
    const logs: Record<number, AttendanceLog> = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Determine up to which day logs should exist (up to today if current month, or full month if past)
    const isCurrentActiveMonth = (year === CURRENT_ACTUAL_YEAR && month === CURRENT_ACTUAL_MONTH);
    const maxLogDay = isCurrentActiveMonth ? CURRENT_ACTUAL_DAY : daysInMonth;

    // Do not generate logs for future months/years
    const isFutureMonth = year > CURRENT_ACTUAL_YEAR || (year === CURRENT_ACTUAL_YEAR && month > CURRENT_ACTUAL_MONTH);
    if (isFutureMonth) {
      return logs;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      // Never generate logs for future days in the current active month
      if (isCurrentActiveMonth && d > CURRENT_ACTUAL_DAY) {
        continue;
      }

      const date = new Date(year, month, d);
      const dayName = WEEKDAYS[date.getDay()];

      // Weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      // Specific red dots (Absent / Leave)
      if (d === 13 || d === 14) {
        logs[d] = {
          day: d,
          dayName,
          checkIn: '-',
          checkOut: '-',
          totalHours: '-',
          location: '— Absent / No logs —',
          status: 'absent',
        };
        continue;
      }

      // Normal working days up to maxLogDay
      if (d <= maxLogDay || !isCurrentActiveMonth) {
        const isToday = (isCurrentActiveMonth && d === CURRENT_ACTUAL_DAY);
        logs[d] = {
          day: d,
          dayName,
          checkIn: isToday ? '08:58' : `07:${50 + (d % 10)}`,
          checkOut: isToday ? '-' : `17:0${d % 10}`,
          totalHours: isToday ? '-' : `08:0${(d % 5) + 1}`,
          location: 'Office, Tech Park, Bangalore',
          status: 'present',
        };
      }
    }
    return logs;
  }, [year, month]);

  // Calendar Grid Calculations
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        log: monthLogs[d],
      });
    }

    // Next month leading days to complete full grid rows
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month, monthLogs]);

  const handleDayPress = (day: number) => {
    if (isDateInFuture(year, month, day)) {
      setFutureActionDate(new Date(year, month, day));
      setSelectedDay(day);
    } else {
      setSelectedDay(day);
    }
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const openPicker = () => {
    setPickerYear(year);
    setIsPickerVisible(true);
  };

  const selectMonth = (monthIdx: number) => {
    setViewDate(new Date(pickerYear, monthIdx, 1));
    setIsPickerVisible(false);
  };

  // Get display logs sorted in descending order
  const displayLogs = useMemo(() => {
    const all = Object.values(monthLogs).sort((a, b) => b.day - a.day);
    return all;
  }, [monthLogs]);

  // Calculate monthly summary statistics
  const summaryStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let totalHoursNum = 0;

    Object.values(monthLogs).forEach((log) => {
      if (log.status === 'present') {
        present++;
        totalHoursNum += 8;
      } else if (log.status === 'absent') {
        absent++;
      }
    });

    const holiday = Math.max(2, Math.floor((present || 18) * 0.15));
    const late = Math.max(1, Math.floor((present || 18) * 0.1));
    const hoursFormatted = `${totalHoursNum || (present || 18) * 8}h 35m`;

    return {
      presentDays: present || 18,
      absentDays: absent || 1,
      lateDays: late,
      holidayDays: holiday,
      totalWorkHours: hoursFormatted,
      totalDays: (present || 18) + (absent || 1) + holiday,
    };
  }, [monthLogs]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed 3D Hero Illustration Banner (Behind Everything) */}
      <View style={styles.fixedHeroContainer} pointerEvents="none">
        <Image
          source={require('../../assets/images/attendance_hero.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Log</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Transparent spacer to let top of boy show through before scrolling */}
        <View style={styles.heroSpacer} />

        {/* Faded Background Container starting from calendar section downwards */}
        <LinearGradient
          colors={['rgba(246, 245, 251, 0)', COLORS.background, COLORS.background]}
          locations={[0, 0.08, 1]}
          style={styles.gradientBgContainer}
        >
          {/* Calendar Card */}
          <View style={styles.calendarCard}>
            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navArrow} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>

              {/* Clickable Month/Year Title */}
              <TouchableOpacity style={styles.monthTitleButton} onPress={openPicker} activeOpacity={0.7}>
                <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.primary} style={styles.titleChevron} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.navArrow} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Weekday Header */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((wd, index) => (
                <Text key={index} style={styles.weekdayText}>{wd}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.gridContainer}>
              {calendarGrid.map((cell, idx) => {
                const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
                const isActualToday = cell.isCurrentMonth && cell.day === CURRENT_ACTUAL_DAY && year === CURRENT_ACTUAL_YEAR && month === CURRENT_ACTUAL_MONTH;
                const hasRedDot = cell.isCurrentMonth && cell.log?.status === 'absent';
                const hasGreenDot = cell.isCurrentMonth && cell.log?.status === 'present';

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.cell}
                    disabled={!cell.isCurrentMonth}
                    onPress={() => handleDayPress(cell.day)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.dayTile,
                      !cell.isCurrentMonth && styles.outsideMonthTile,
                      isActualToday && !isSelected && styles.todayTile,
                      isSelected && styles.selectedTile
                    ]}>
                      <Text style={[
                        styles.dayText,
                        !cell.isCurrentMonth && styles.outsideMonthText,
                        isActualToday && !isSelected && styles.todayText,
                        isSelected && styles.selectedDayText
                      ]}>
                        {cell.day}
                      </Text>

                      {/* Status Indicator inside Tile */}
                      {cell.isCurrentMonth && (hasRedDot || hasGreenDot) && (
                        <View style={styles.tileIndicatorContainer}>
                          {hasRedDot && <View style={[styles.tileIndicatorBar, { backgroundColor: COLORS.danger }]} />}
                          {hasGreenDot && <View style={[styles.tileIndicatorBar, { backgroundColor: COLORS.statusPresent }]} />}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section Heading */}
          <Text style={styles.sectionHeading}>Your Attendance</Text>

          {/* Attendance Cards List */}
          <View style={styles.listContainer}>
            {displayLogs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={36} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>No attendance records found for this month yet.</Text>
              </View>
            ) : (
              displayLogs.map((item) => {
                const isHighlighted = item.day === selectedDay;

                if (isHighlighted) {
                  return (
                    <View key={item.day} style={styles.highlightedCard}>
                      <View style={styles.highlightedLeftBox}>
                        <Text style={styles.highlightedDayNumber}>{item.day}</Text>
                        <Text style={styles.highlightedDayName}>{item.dayName}</Text>
                      </View>

                      <View style={styles.cardRightInfo}>
                        <View style={styles.timesRow}>
                          <View style={styles.timeItem}>
                            <Text style={styles.highlightedTimeValue}>{item.checkIn}</Text>
                            <Text style={styles.highlightedTimeLabel}>Check In</Text>
                          </View>
                          <View style={styles.timeItem}>
                            <Text style={styles.highlightedTimeValue}>{item.checkOut}</Text>
                            <Text style={styles.highlightedTimeLabel}>Check out</Text>
                          </View>
                          <View style={styles.timeItem}>
                            <Text style={styles.highlightedTimeValue}>{item.totalHours}</Text>
                            <Text style={styles.highlightedTimeLabel}>Total Hours</Text>
                          </View>
                        </View>

                        <View style={styles.locationRow}>
                          <MaterialCommunityIcons name="map-marker" size={16} color="#FFFFFF" style={styles.pinIcon} />
                          <Text style={styles.highlightedLocationText} numberOfLines={1}>{item.location}</Text>
                        </View>
                      </View>
                    </View>
                  );
                }

                // Normal Card
                return (
                  <TouchableOpacity
                    key={item.day}
                    style={styles.normalCard}
                    activeOpacity={0.8}
                    onPress={() => handleDayPress(item.day)}
                  >
                    <View style={styles.normalLeftBox}>
                      <Text style={styles.normalDayNumber}>{item.day}</Text>
                      <Text style={styles.normalDayName}>{item.dayName}</Text>
                    </View>

                    <View style={styles.cardRightInfo}>
                      <View style={styles.timesRow}>
                        <View style={styles.timeItem}>
                          <Text style={styles.normalTimeValue}>{item.checkIn}</Text>
                          <Text style={styles.normalTimeLabel}>Check In</Text>
                        </View>
                        <View style={styles.timeItem}>
                          <Text style={styles.normalTimeValue}>{item.checkOut}</Text>
                          <Text style={styles.normalTimeLabel}>Check out</Text>
                        </View>
                        <View style={styles.timeItem}>
                          <Text style={styles.normalTimeValue}>{item.totalHours}</Text>
                          <Text style={styles.normalTimeLabel}>Total Hours</Text>
                        </View>
                      </View>

                      <View style={styles.locationRow}>
                        <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} style={styles.pinIcon} />
                        <Text style={styles.normalLocationText} numberOfLines={1}>{item.location}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }))}
          </View>

          {/* Monthly Summary Section */}
          <MonthlySummaryCard
            presentDays={summaryStats.presentDays}
            absentDays={summaryStats.absentDays}
            lateDays={summaryStats.lateDays}
            holidayDays={summaryStats.holidayDays}
            totalWorkHours={summaryStats.totalWorkHours}
            totalDays={summaryStats.totalDays}
          />
        </LinearGradient>
      </ScrollView>

      {/* Month & Year Selection Overlay Modal */}
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsPickerVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month & Year</Text>
              <TouchableOpacity onPress={() => setIsPickerVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Year Pills */}
            <Text style={styles.modalSubheading}>YEAR</Text>
            <View style={styles.yearScrollContainer}>
              <ScrollView
                ref={yearScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.yearScroll}
                onContentSizeChange={() => {
                  const idx = YEARS.indexOf(pickerYear);
                  if (idx >= 0 && yearScrollRef.current) {
                    yearScrollRef.current.scrollTo({ x: Math.max(0, idx * 68 - 130), animated: false });
                  }
                }}
              >
                {YEARS.map((yr) => {
                  const isYrSelected = yr === pickerYear;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[styles.yearPill, isYrSelected && styles.selectedYearPill]}
                      onPress={() => setPickerYear(yr)}
                    >
                      <Text style={[styles.yearPillText, isYrSelected && styles.selectedYearPillText]}>
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Month Grid */}
            <Text style={styles.modalSubheading}>MONTH</Text>
            <View style={styles.monthGrid}>
              {SHORT_MONTHS.map((mName, idx) => {
                const isCurrentViewMonth = idx === month && pickerYear === year;
                return (
                  <TouchableOpacity
                    key={mName}
                    style={[styles.monthButton, isCurrentViewMonth && styles.activeViewMonthButton]}
                    onPress={() => selectMonth(idx)}
                  >
                    <Text style={[styles.monthButtonText, isCurrentViewMonth && styles.activeViewMonthButtonText]}>
                      {mName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Future Date Action Bottom Sheet Modal */}
      <Modal
        visible={futureActionDate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFutureActionDate(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setFutureActionDate(null)}
        >
          <View style={styles.actionModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalDragHandle} />
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>
                Request for {futureActionDate ? formatDDMMYYYY(futureActionDate) : ''}
              </Text>
              <TouchableOpacity onPress={() => setFutureActionDate(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionModalDivider} />

            <TouchableOpacity
              style={styles.actionOptionBtn}
              onPress={() => {
                const dateStr = futureActionDate ? formatDDMMYYYY(futureActionDate) : '';
                setFutureActionDate(null);
                router.push({
                  pathname: '/duty-request',
                  params: { type: 'Work From Home', initialDate: dateStr },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionOptionText, { color: '#7C3AED' }]}>Work From Home</Text>
            </TouchableOpacity>

            <View style={styles.actionModalDivider} />

            <TouchableOpacity
              style={styles.actionOptionBtn}
              onPress={() => {
                setFutureActionDate(null);
                router.push('/(tabs)/leaves');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionOptionText, { color: '#E11D48' }]}>Leave Application</Text>
            </TouchableOpacity>

            <View style={styles.actionModalDivider} />

            <TouchableOpacity
              style={styles.actionOptionBtn}
              onPress={() => {
                const dateStr = futureActionDate ? formatDDMMYYYY(futureActionDate) : '';
                setFutureActionDate(null);
                router.push({
                  pathname: '/duty-request',
                  params: { type: 'Outdoor Duty', initialDate: dateStr },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionOptionText, { color: '#D97706' }]}>Outdoor Duty</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    paddingBottom: 110, // Extra padding for floating nav bar
  },
  fixedHeroContainer: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.82,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  heroSpacer: {
    height: SCREEN_HEIGHT * 0.52,
  },
  gradientBgContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  heroImage: {
    width: SCREEN_WIDTH * 1.05,
    height: SCREEN_HEIGHT * 0.85,
  },
  calendarCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 32,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  navArrow: {
    paddingHorizontal: 8,
  },
  monthTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F4F2FF',
    marginHorizontal: 8,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  titleChevron: {
    marginLeft: 6,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  dayTile: {
    width: '100%',
    aspectRatio: 0.95,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outsideMonthTile: {
    backgroundColor: '#F9FAFB',
    opacity: 0.5,
  },
  todayTile: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  selectedTile: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  outsideMonthText: {
    color: '#D1D5DB',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tileIndicatorContainer: {
    position: 'absolute',
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIndicatorBar: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 14,
  },
  listContainer: {
    gap: 14,
  },
  highlightedCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  highlightedLeftBox: {
    width: 64,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightedDayNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  highlightedDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardRightInfo: {
    flex: 1,
  },
  timesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingRight: 8,
  },
  timeItem: {
    alignItems: 'flex-start',
  },
  highlightedTimeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  highlightedTimeLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 8,
  },
  pinIcon: {
    marginRight: 6,
  },
  highlightedLocationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  normalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  normalLeftBox: {
    width: 64,
    height: 72,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  normalDayNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  normalDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  normalTimeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  normalTimeLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  normalLocationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Modal Picker Styles
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
  modalSubheading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  yearScrollContainer: {
    marginBottom: 20,
  },
  yearScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  yearPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F2FF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  selectedYearPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  yearPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  selectedYearPillText: {
    color: '#FFFFFF',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeViewMonthButton: {
    backgroundColor: '#EDE9FE',
    borderColor: COLORS.primary,
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  activeViewMonthButtonText: {
    color: COLORS.primary,
  },
  actionModalContent: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  actionModalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actionOptionBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOptionText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
