import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { teamService, TeamMemberResponse } from '../services/teamService';

export default function TeamScreen() {
  const [isGridView, setIsGridView] = useState(false);
  const [team, setTeam] = useState<TeamMemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const response = await teamService.getTeam();
      if (response.success && response.data?.team) {
        setTeam(response.data.team);
      } else {
        Alert.alert("Error", response.message || "Failed to fetch team data");
      }
    } catch (error: any) {
      console.error('Failed to fetch team:', error);
      Alert.alert("Error", error.message || "An error occurred while fetching the team.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    return { bg: '#DCFCE7', text: '#15803D' };
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
          <TouchableOpacity style={styles.gridButton} activeOpacity={0.7} onPress={() => setIsGridView(!isGridView)}>
            <Ionicons name={isGridView ? "list-outline" : "apps-outline"} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Team Members Section */}
            <Text style={[styles.sectionHeader]}>Employees ({team.length})</Text>
            <View style={isGridView ? styles.gridContainer : null}>
              {team.map((member) => {
                const statusStyle = getStatusColor();
                return (
                  <TouchableOpacity key={member.id} style={isGridView ? styles.gridMemberCard : styles.memberCard} activeOpacity={0.7}>
                    <View style={[isGridView ? styles.gridAvatarCircle : styles.avatarCircle, { backgroundColor: '#FFFBEB' }]}>
                      <Ionicons name="person-outline" size={isGridView ? 26 : 22} color={COLORS.primary} />
                    </View>
                    <View style={isGridView ? styles.gridMemberInfo : styles.memberInfo}>
                      <View style={isGridView ? styles.gridNameRow : styles.nameRow}>
                        <Text style={isGridView ? styles.gridMemberName : styles.memberName} numberOfLines={1}>{member.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, marginTop: isGridView ? 6 : 0 }]}>
                          <Text style={[styles.statusText, { color: statusStyle.text, fontSize: isGridView ? 9 : 11 }]}>
                            Active
                          </Text>
                        </View>
                      </View>
                      {!isGridView && <Text style={styles.memberRole}>{member.designation}</Text>}
                      {!isGridView && <Text style={styles.memberDept}>{member.org_path}</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
    width: '100%',
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
  gridMemberCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  gridManagerCard: {
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
  gridAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfo: {
    flex: 1,
  },
  gridMemberInfo: {
    width: '100%',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridNameRow: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  gridMemberName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E1B4B',
    textAlign: 'center',
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
