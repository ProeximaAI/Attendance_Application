import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface MonthlySummaryProps {
  presentDays?: number;
  absentDays?: number;
  lateDays?: number;
  holidayDays?: number;
  totalWorkHours?: string;
  totalDays?: number;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryProps> = ({
  presentDays = 18,
  absentDays = 1,
  lateDays = 3,
  holidayDays = 4,
  totalWorkHours = '142h 35m',
  totalDays = 26,
}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleExportReport = (format: 'PDF' | 'EXCEL') => {
    setIsMenuVisible(false);
    Alert.alert(
      'Export Monthly Report',
      `Your monthly attendance summary has been compiled and exported as ${format} successfully.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const totalSum = Math.max(1, presentDays + absentDays + holidayDays);
  const presentPct = Math.round((presentDays / totalSum) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly Summary</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* 2x2 Pastel Stat Cards Grid (Image 3 Design) */}
      <View style={styles.gridContainer}>
        {/* Present Card */}
        <View style={[styles.pastelCard, { backgroundColor: '#EEF5FF' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.pillText, { color: '#2563EB' }]}>{presentPct}%</Text>
            </View>
          </View>
          <Text style={[styles.statValue, { color: '#1E3A8A' }]}>{presentDays} Days</Text>
          <Text style={[styles.statLabel, { color: '#3B82F6' }]}>Active Present</Text>
        </View>

        {/* Absent Card */}
        <View style={[styles.pastelCard, { backgroundColor: '#FFEBF0' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, { backgroundColor: '#FFE4E6' }]}>
              <Ionicons name="close-circle" size={22} color="#E11D48" />
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#FFE4E6' }]}>
              <Text style={[styles.pillText, { color: '#E11D48' }]}>
                {absentDays} {absentDays === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </View>
          <Text style={[styles.statValue, { color: '#881337' }]}>{absentDays} Day</Text>
          <Text style={[styles.statLabel, { color: '#F43F5E' }]}>Unplanned Leaves</Text>
        </View>

        {/* Late Check-ins Card */}
        <View style={[styles.pastelCard, { backgroundColor: '#FEF9E7' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={22} color="#D97706" />
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.pillText, { color: '#D97706' }]}>Late</Text>
            </View>
          </View>
          <Text style={[styles.statValue, { color: '#78350F' }]}>{lateDays} Days</Text>
          <Text style={[styles.statLabel, { color: '#D97706' }]}>Late Arrivals</Text>
        </View>

        {/* Holidays Card */}
        <View style={[styles.pastelCard, { backgroundColor: '#F5F3FF' }]}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBadge, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="calendar" size={22} color="#7C3AED" />
            </View>
            <View style={[styles.statusPill, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.pillText, { color: '#7C3AED' }]}>Paid</Text>
            </View>
          </View>
          <Text style={[styles.statValue, { color: '#4C1D95' }]}>{holidayDays} Days</Text>
          <Text style={[styles.statLabel, { color: '#8B5CF6' }]}>Holidays & WFH</Text>
        </View>
      </View>

      {/* Pure React Native Curved Gauge & Proportion Chart (Image 1 & 2 Inspired) */}
      <View style={styles.gaugeContainer}>
        <Text style={styles.gaugeTitle}>Attendance Proportion</Text>

        {/* Semi-Circle Curved Donut Gauge & Center Display */}
        <View style={styles.archWrapper}>
          <View style={styles.archBackground}>
            {/* Base Grey Arch */}
            <View style={styles.archBaseRing} />

            {/* Layer 1: Holiday (Black) covering 0% to 100% */}
            <View
              style={[
                styles.archProgressRing,
                {
                  borderTopColor: '#111827',
                  borderLeftColor: '#111827',
                  transform: [{ rotate: '45deg' }],
                },
              ]}
            />

            {/* Layer 2: Absent (#C4FF01) covering 0% to (presentPct + absentPct)% */}
            <View
              style={[
                styles.archProgressRing,
                {
                  borderTopColor: '#C4FF01',
                  borderLeftColor: '#C4FF01',
                  transform: [
                    {
                      rotate: `${45 - (1 - (presentDays + absentDays) / totalSum) * 180}deg`,
                    },
                  ],
                },
              ]}
            />

            {/* Layer 3: Present (#467FFF) covering 0% to presentPct% */}
            <View
              style={[
                styles.archProgressRing,
                {
                  borderTopColor: '#467FFF',
                  borderLeftColor: '#467FFF',
                  transform: [
                    {
                      rotate: `${45 - (1 - presentDays / totalSum) * 180}deg`,
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Center Text Display inside the arch */}
          <View style={styles.centerTextContainer}>
            <Text style={styles.centerHoursText}>{totalWorkHours}</Text>
            <Text style={styles.centerLabelText}>Total Work Time</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#467FFF' }]} />
            <Text style={styles.legendText}>Present ({presentDays})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#C4FF01' }]} />
            <Text style={styles.legendText}>Absent ({absentDays})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#111827' }]} />
            <Text style={styles.legendText}>Holiday ({holidayDays})</Text>
          </View>
        </View>
      </View>

      {/* Export Options Modal */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Export Monthly Report</Text>
            <Text style={styles.menuSubtitle}>Select preferred format to download summary</Text>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleExportReport('PDF')}
            >
              <View style={[styles.menuOptionIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="document-text" size={20} color="#EF4444" />
              </View>
              <View style={styles.menuOptionTextWrap}>
                <Text style={styles.menuOptionTitle}>Export as PDF</Text>
                <Text style={styles.menuOptionDesc}>Standard printable document format</Text>
              </View>
              <Ionicons name="download-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => handleExportReport('EXCEL')}
            >
              <View style={[styles.menuOptionIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="grid" size={20} color="#10B981" />
              </View>
              <View style={styles.menuOptionTextWrap}>
                <Text style={styles.menuOptionTitle}>Export as Excel (XLSX)</Text>
                <Text style={styles.menuOptionDesc}>Raw data spreadsheet for analysis</Text>
              </View>
              <Ionicons name="download-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  menuButton: {
    padding: 6,
    borderRadius: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  pastelCard: {
    width: '47.8%',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  gaugeContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  gaugeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  archWrapper: {
    width: 210,
    height: 110,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: 14,
  },
  archBackground: {
    width: 210,
    height: 105,
    overflow: 'hidden',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
  },
  archBaseRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 22,
    borderColor: '#E5E7EB',
    position: 'absolute',
    top: 0,
  },
  archProgressRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 22,
    borderColor: 'transparent',
    position: 'absolute',
    top: 0,
  },
  centerTextContainer: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  centerHoursText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  centerLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuContent: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuOptionTextWrap: {
    flex: 1,
  },
  menuOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  menuOptionDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

