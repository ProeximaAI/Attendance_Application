import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Full-width Portrait Header (Like Image 1) */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=950&auto=format&fit=crop&crop=faces&q=80' }}
            style={styles.portraitImage}
            resizeMode="cover"
          />

          {/* Bottom Gradient Fade blending smoothly into background */}
          <LinearGradient
            colors={['transparent', 'rgba(248,249,252,0.6)', '#F8F9FC', '#F8F9FC']}
            locations={[0, 0.45, 0.85, 1]}
            style={styles.bottomGradient}
          />

          {/* Floating Top Bar Buttons safely positioned below OS status bar */}
          <View style={[styles.floatingTopBar, { top: Math.max(insets.top, 16) + 6 }]}>
            <TouchableOpacity style={styles.circleButton} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Name & Role positioned over the bottom fade */}
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{user?.name || 'Swarup Kumar Behera'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Software Developer'}</Text>
          </View>
        </View>

        {/* Two Pill Cards Side-by-Side */}
        <View style={styles.pillsRow}>
          <View style={styles.pillCard}>
            <View style={[styles.pillIconCircle, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
            </View>
            <View style={styles.pillTextContainer}>
              <Text style={styles.pillLabel}>Birthday</Text>
              <Text style={styles.pillValue}>05 Mar 1992</Text>
            </View>
          </View>

          <View style={styles.pillCard}>
            <View style={[styles.pillIconCircle, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="call-outline" size={18} color="#06B6D4" />
            </View>
            <View style={styles.pillTextContainer}>
              <Text style={styles.pillLabel}>Phone Number</Text>
              <Text style={styles.pillValue} numberOfLines={1}>+91 98765 43210</Text>
            </View>
          </View>
        </View>

        {/* Main List Card (In place of Monthly Engagement) */}
        <View style={styles.mainListCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Profile & Work Info</Text>
            <TouchableOpacity style={styles.cardHeaderIconBtn} activeOpacity={0.7}>
              <Ionicons name="options-outline" size={18} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/personal')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="person-outline" size={20} color="#4338CA" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Personal</Text>
                <Text style={styles.listSubtitle}>Personal & contact details</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/kyc')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="document-text-outline" size={20} color="#16A34A" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>KYC</Text>
                <Text style={styles.listSubtitle}>Identity & Verification</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/team')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="people-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>My Team</Text>
                <Text style={styles.listSubtitle}>Manager & direct reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/visit')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#ECFEFF' }]}>
                <Ionicons name="location-outline" size={20} color="#06B6D4" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Visit</Text>
                <Text style={styles.listSubtitle}>Field visits & check-ins</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/finance')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="wallet-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>My Finance</Text>
                <Text style={styles.listSubtitle}>Expenses & reimbursements</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            {/* 
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/attendance-menu')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="calendar-outline" size={20} color="#4F46E5" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Attendance</Text>
                <Text style={styles.listSubtitle}>Logs & shift schedule</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />
            */}

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/payroll')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="cash-outline" size={20} color="#10B981" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Payroll</Text>
                <Text style={styles.listSubtitle}>Payslips & salary structure</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={() => router.push('/off-boarding')}>
              <View style={[styles.listIconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="exit-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Off-Boarding</Text>
                <Text style={styles.listSubtitle}>Resignation & exit process</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* 
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <View style={[styles.listIconCircle, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="id-card-outline" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Employee Gatepass</Text>
                <Text style={styles.listSubtitle}>Visitor & entry requests</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <View style={[styles.listIconCircle, { backgroundColor: '#ECFEFF' }]}>
                <Ionicons name="bar-chart-outline" size={20} color="#06B6D4" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Reports</Text>
                <Text style={styles.listSubtitle}>Analytics & summaries</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <View style={[styles.listIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="settings-outline" size={20} color="#F59E0B" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Master</Text>
                <Text style={styles.listSubtitle}>System configurations</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.listDivider} />
            */}

            <TouchableOpacity style={styles.listItem} activeOpacity={0.7} onPress={handleLogout}>
              <View style={[styles.listIconCircle, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.listTextContainer}>
                <Text style={[styles.listTitle, { color: '#EF4444' }]}>Logout</Text>
                <Text style={styles.listSubtitle}>Sign out of your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Square Cards Side-by-Side (This Month Stats) */}
        {/* 
        <View style={styles.bottomCardsRow}>
          <View style={styles.bottomCard}>
            <View style={styles.bottomCardTopRow}>
              <View style={[styles.bottomCardIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="time-outline" size={20} color="#10B981" />
              </View>
              <Text style={[styles.statBadgeText, { color: '#10B981' }]}>78%</Text>
            </View>
            <Text style={styles.bottomCardTitle}>Punctuality</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressFill, { width: '78%', backgroundColor: '#10B981' }]} />
            </View>
          </View>

          <View style={styles.bottomCard}>
            <View style={styles.bottomCardTopRow}>
              <View style={[styles.bottomCardIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="checkbox-outline" size={20} color="#4338CA" />
              </View>
              <Text style={[styles.statBadgeText, { color: '#4338CA' }]}>90%</Text>
            </View>
            <Text style={styles.bottomCardTitle}>Attendance</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressFill, { width: '90%', backgroundColor: '#4338CA' }]} />
            </View>
          </View>
        </View>
        */}

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity style={styles.footerButton} activeOpacity={0.7}>
            <Text style={styles.footerButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} activeOpacity={0.7}>
            <Text style={styles.footerButtonText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  headerContainer: {
    width: width,
    height: 460,
    position: 'relative',
    marginBottom: 8,
  },
  portraitImage: {
    width: '100%',
    height: '100%',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  floatingTopBar: {
    position: 'absolute',
    top: 14,
    left: SIZES.padding,
    right: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  nameContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
    gap: 12,
  },
  pillCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pillIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pillTextContainer: {
    flex: 1,
  },
  pillLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  mainListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    marginHorizontal: SIZES.padding,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  cardHeaderIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 58,
  },
  bottomCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
    gap: 12,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bottomCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bottomCardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBadgeText: {
    fontSize: 15,
    fontWeight: '800',
  },
  bottomCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 10,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
    gap: 16,
  },
  footerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  footerButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 13,
  },
});




