import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'In Office' | 'On Leave' | 'Field Work' | 'Remote';
  isManager?: boolean;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Rajesh Sharma', role: 'Senior Engineering Manager', department: 'Technology', status: 'In Office', isManager: true },
  { id: '2', name: 'Ananya Iyer', role: 'Senior UI/UX Designer', department: 'Design', status: 'In Office' },
  { id: '3', name: 'Vikram Patel', role: 'Lead Backend Engineer', department: 'Technology', status: 'Remote' },
  { id: '4', name: 'Priya Nair', role: 'QA Lead', department: 'Quality Assurance', status: 'In Office' },
  { id: '5', name: 'Siddharth Rao', role: 'DevOps Engineer', department: 'Infrastructure', status: 'Field Work' },
  { id: '6', name: 'Neha Gupta', role: 'Frontend Developer', department: 'Technology', status: 'On Leave' },
  { id: '7', name: 'Amit Verma', role: 'Product Manager', department: 'Product', status: 'In Office' },
];

export default function TeamScreen() {
  const manager = TEAM_MEMBERS.find(m => m.isManager);
  const team = TEAM_MEMBERS.filter(m => !m.isManager);

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'In Office': return { bg: '#DCFCE7', text: '#15803D' };
      case 'Remote': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Field Work': return { bg: '#FEF3C7', text: '#D97706' };
      case 'On Leave': return { bg: '#FEE2E2', text: '#B91C1C' };
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Team</Text>
          <TouchableOpacity style={styles.gridButton} activeOpacity={0.7}>
            <Ionicons name="apps-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Manager Section */}
          <Text style={styles.sectionHeader}>Reporting Manager</Text>
          {manager && (
            <View style={[styles.memberCard, styles.managerCard]}>
              <View style={[styles.avatarCircle, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="person" size={24} color="#4338CA" />
              </View>
              <View style={styles.memberInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName}>{manager.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(manager.status).bg }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(manager.status).text }]}>
                      {manager.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.memberRole}>{manager.role}</Text>
                <Text style={styles.memberDept}>{manager.department}</Text>
              </View>
            </View>
          )}

          {/* Team Members Section */}
          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Team Members ({team.length})</Text>
          {team.map((member) => {
            const statusStyle = getStatusColor(member.status);
            return (
              <TouchableOpacity key={member.id} style={styles.memberCard} activeOpacity={0.7}>
                <View style={[styles.avatarCircle, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="person-outline" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {member.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.memberRole}>{member.role}</Text>
                  <Text style={styles.memberDept}>{member.department}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
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
  gridButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  managerCard: {
    borderColor: '#E0E7FF',
    borderWidth: 1.5,
    backgroundColor: '#FAFAFE',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 2,
  },
  memberDept: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
