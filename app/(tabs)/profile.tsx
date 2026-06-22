import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header View */}
        <View style={[styles.headerGradient, { backgroundColor: COLORS.background }]}>
          <View style={styles.headerContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Profile</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: COLORS.textMuted }]}>Personal & Work Info</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Main User Card */}
          <View style={[styles.userCard, { backgroundColor: COLORS.primary }]}>
            <View style={styles.userCardContent}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>SK</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userNameLarge}>{user?.name || 'Swarup Kumar Behera'}</Text>
                <Text style={styles.userRoleLarge}>{user?.role || 'Software Developer'}</Text>
                <View style={styles.activeBadgeLarge}>
                  <Text style={styles.activeBadgeTextLarge}>Active</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Personal</Text>
                <Text style={styles.menuSubtitle}>Contact, Address</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="briefcase-outline" size={24} color={COLORS.secondary} style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Work</Text>
                <Text style={styles.menuSubtitle}>Department, History</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="people-outline" size={24} color={COLORS.statusPresent} style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Team</Text>
                <Text style={styles.menuSubtitle}>Manager, Reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.warning} style={styles.menuIcon} />
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Work-week</Text>
                <Text style={styles.menuSubtitle}>Mon - Sat</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* This Month Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsCardTitle}>This Month</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Punctuality</Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressFill, { width: '78%', backgroundColor: COLORS.statusPresent }]} />
                </View>
                <Text style={[styles.statPercentage, { color: COLORS.statusPresent }]}>78%</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Attendance</Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressFill, { width: '90%', backgroundColor: COLORS.primary }]} />
                </View>
                <Text style={[styles.statPercentage, { color: COLORS.primary }]}>90%</Text>
              </View>
            </View>
          </View>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Terms</Text>
            </TouchableOpacity>
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  userCard: {
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatarLargeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userNameLarge: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRoleLarge: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  activeBadgeLarge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  activeBadgeTextLarge: {
    color: '#10B981', // green
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 24,
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 56, // indent past icon
  },
  statsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  statsCardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    marginRight: 16,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  progressContainer: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  footerButton: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
  },
  footerButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
