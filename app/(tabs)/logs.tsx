import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import { COLORS, SIZES } from '../../constants/theme';

export default function LogsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header View */}
        <View style={[styles.headerGradient, { backgroundColor: COLORS.background }]}>
          <View style={styles.headerContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="clipboard-text" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Attendance Logs</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: COLORS.textMuted }]}>Jun 2026 — View History</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.monthSelector}>
              <MaterialCommunityIcons name="calendar-month-outline" size={20} color={COLORS.primary} />
              <Text style={styles.monthText}>Jun 2026</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.statusPresent }]}>18</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.statusAbsent }]}>2</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.statusWFH }]}>4</Text>
              <Text style={styles.statLabel}>WFH</Text>
            </View>
          </View>

          {/* Logs List */}
          <View style={styles.logCard}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.statusPresent }]} />
            <View style={styles.logDetails}>
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>Wed, 04 Jun</Text>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(30, 201, 131, 0.15)' }]}>
                  <Text style={[styles.statusBadgeText, { color: COLORS.statusPresent }]}>Present</Text>
                </View>
              </View>
              <View style={styles.logTimes}>
                <View style={styles.timeBlock}>
                  <MaterialCommunityIcons name="login" size={14} color={COLORS.textMuted} />
                  <Text style={styles.timeText}>09:02 AM</Text>
                </View>
                <View style={styles.timeBlock}>
                  <MaterialCommunityIcons name="logout" size={14} color={COLORS.textMuted} />
                  <Text style={styles.timeText}>06:15 PM</Text>
                </View>
                <Text style={[styles.durationText, { color: COLORS.statusPresent }]}>9h 13m</Text>
              </View>
            </View>
          </View>

          <View style={styles.logCard}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.statusWFH }]} />
            <View style={styles.logDetails}>
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>Tue, 03 Jun</Text>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(51, 208, 217, 0.15)' }]}>
                  <Text style={[styles.statusBadgeText, { color: COLORS.statusWFH }]}>WFH</Text>
                </View>
              </View>
              <View style={styles.logTimes}>
                <View style={styles.timeBlock}>
                  <MaterialCommunityIcons name="login" size={14} color={COLORS.textMuted} />
                  <Text style={styles.timeText}>09:30 AM</Text>
                </View>
                <View style={styles.timeBlock}>
                  <MaterialCommunityIcons name="logout" size={14} color={COLORS.textMuted} />
                  <Text style={styles.timeText}>05:45 PM</Text>
                </View>
                <Text style={[styles.durationText, { color: COLORS.statusWFH }]}>8h 15m</Text>
              </View>
            </View>
          </View>

          <View style={styles.logCard}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.statusLeave }]} />
            <View style={styles.logDetails}>
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>Mon, 02 Jun</Text>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 170, 0, 0.15)' }]}>
                  <Text style={[styles.statusBadgeText, { color: COLORS.statusLeave }]}>Approval Pending</Text>
                </View>
              </View>
              <View style={styles.logTimes}>
                <Text style={styles.noLogsText}>No logs</Text>
              </View>
            </View>
          </View>

          <View style={styles.logCard}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.statusAbsent }]} />
            <View style={styles.logDetails}>
              <View style={styles.logHeader}>
                <Text style={styles.logDate}>Sun, 01 Jun</Text>
                <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 77, 77, 0.15)' }]}>
                  <Text style={[styles.statusBadgeText, { color: COLORS.statusAbsent }]}>Absent</Text>
                </View>
              </View>
              <View style={styles.logTimes}>
                <Text style={styles.noLogsText}>— No logs —</Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    marginTop: 10,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    padding: SIZES.padding,
  },
  controlsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  monthSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  monthText: {
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  logCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  logDetails: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logTimes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    color: COLORS.text,
    fontSize: 14,
    marginLeft: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  noLogsText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
