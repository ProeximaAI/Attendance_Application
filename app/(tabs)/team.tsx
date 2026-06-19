import { StyleSheet, Text, View, ScrollView, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

export default function TeamScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header Gradient */}
        <LinearGradient
          colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
              <Text style={styles.headerTitle}>Team Directory</Text>
            </View>
            <Text style={styles.headerSubtitle}>50 Employees</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search employees..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Online Now Section */}
          <Text style={styles.sectionTitle}>ONLINE NOW</Text>
          <View style={styles.employeeCard}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>Aditya N. Dash</Text>
              <Text style={styles.employeeRole}>Backend Dev</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(30, 201, 131, 0.15)' }]}>
              <Text style={[styles.statusBadgeText, { color: COLORS.statusPresent }]}>In</Text>
            </View>
          </View>

          <View style={styles.employeeCard}>
            <View style={[styles.avatar, { backgroundColor: COLORS.secondary }]}>
              <Text style={styles.avatarText}>AK</Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>Akash K. Sahoo</Text>
              <Text style={styles.employeeRole}>Designer</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(30, 201, 131, 0.15)' }]}>
              <Text style={[styles.statusBadgeText, { color: COLORS.statusPresent }]}>In</Text>
            </View>
          </View>

          {/* Others Section */}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>OTHERS</Text>
          <View style={styles.employeeCard}>
            <View style={[styles.avatar, { backgroundColor: '#A855F7' }]}>
              <Text style={styles.avatarText}>AM</Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>Amisha Bisoi</Text>
              <Text style={styles.employeeRole}>QA Engineer</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 170, 0, 0.15)' }]}>
              <Text style={[styles.statusBadgeText, { color: COLORS.statusLeave }]}>WFH</Text>
            </View>
          </View>

          <View style={styles.employeeCard}>
            <View style={[styles.avatar, { backgroundColor: COLORS.statusPresent }]}>
              <Text style={styles.avatarText}>AR</Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>Amrita Rout</Text>
              <Text style={styles.employeeRole}>HR Manager</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255, 77, 77, 0.15)' }]}>
              <Text style={[styles.statusBadgeText, { color: COLORS.statusAbsent }]}>Out</Text>
            </View>
          </View>

          <View style={styles.employeeCard}>
            <View style={[styles.avatar, { backgroundColor: COLORS.warning }]}>
              <Text style={styles.avatarText}>AN</Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>Anil K. Mahakud</Text>
              <Text style={styles.employeeRole}>Sales</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(51, 208, 217, 0.15)' }]}>
              <Text style={[styles.statusBadgeText, { color: COLORS.statusWFH }]}>Field</Text>
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
    paddingTop: Platform.OS === 'android' ? 40 : 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeeRole: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
