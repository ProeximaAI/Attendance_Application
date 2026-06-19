import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Modal, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setCapturedPhoto(photo.uri);
      }
    }
  };

  const handlePunchIn = () => {
    setPunchInTime(new Date());
    setIsCameraModalVisible(false);
    setCapturedPhoto(null);
  };

  const getWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1 = Mon, 7 = Sun
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      week.push({
        dayObj: d,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate().toString(),
        status: isToday ? (punchInTime ? COLORS.statusPresent : COLORS.statusAbsent) : 'transparent',
        active: isToday
      });
    }
    return week;
  };
  
  const weekDays = getWeekDays();

  const handleDayPress = async (isToday: boolean) => {
    if (isToday && !punchInTime) {
      if (!permission?.granted) {
        await requestPermission();
      }
      setIsCameraModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 10, 20), backgroundColor: COLORS.background }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerDateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.greetingText}>Hello, {user?.name?.split(' ')[0] || 'Alex'}</Text>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{user?.name?.charAt(0) || 'A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* User & Clock In Card */}
          <View style={styles.card}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>SK</Text>
                </LinearGradient>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || 'Swarup Kumar'}</Text>
                <Text style={styles.userRole}>{user?.role || 'Software Developer'}</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.clockInButton} onPress={() => handleDayPress(true)}>
              <LinearGradient
                colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                style={styles.clockInGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="clock-check-outline" size={24} color="white" />
                <Text style={styles.clockInText}>
                  {punchInTime ? `Clocked In — ${punchInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Clock In — Pending'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Calendar Strip */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonth}>June 2026</Text>
              <View style={styles.calendarNav}>
                <TouchableOpacity><Ionicons name="chevron-back" size={20} color={COLORS.text} /></TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 16 }}><Ionicons name="chevron-forward" size={20} color={COLORS.text} /></TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
              {weekDays.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.calendarDay, item.active && styles.calendarDayActive]}
                  onPress={() => handleDayPress(item.active)}
                >
                  <View style={[styles.calendarDot, { backgroundColor: item.status }]} />
                  <Text style={[styles.calendarDateText, item.active && styles.calendarDateTextActive]}>{item.date}</Text>
                  <Text style={[styles.calendarDayText, item.active && styles.calendarDayTextActive]}>{item.day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.statusPresent }]}>22</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.statusAbsent }]}>3</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.statusLeave }]}>5</Text>
              <Text style={styles.statLabel}>Leaves</Text>
            </View>
          </View>

          {/* Live Location Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>LIVE LOCATION</Text>
            <View style={styles.mapPlaceholder}>
              {/* Map grid background pattern */}
              <View style={styles.mapGrid} />
              <View style={styles.locationPulse}>
                <View style={styles.locationDot} />
              </View>
            </View>
            <View style={styles.locationFooter}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                <Text style={styles.locationText}>Bhubaneswar, Odisha</Text>
              </View>
              <View style={styles.trackedBadge}>
                <Text style={styles.trackedBadgeText}>Tracked</Text>
              </View>
            </View>
          </View>

          {/* Today's Shift Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>TODAY'S SHIFT</Text>
            <View style={styles.shiftDetailsRow}>
              <View style={styles.shiftItem}>
                <Text style={styles.shiftLabel}>In</Text>
                <Text style={[styles.shiftValue, { color: COLORS.statusPresent }]}>
                  {punchInTime ? punchInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </Text>
              </View>
              <View style={styles.shiftDividerContainer}>
                <View style={styles.shiftLine} />
                <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.primary} />
                <View style={styles.shiftLine} />
              </View>
              <View style={styles.shiftItem}>
                <Text style={styles.shiftLabel}>Out</Text>
                <Text style={[styles.shiftValue, { color: COLORS.statusAbsent }]}>06:00</Text>
              </View>
              <View style={[styles.shiftItem, { alignItems: 'flex-end' }]}>
                <Text style={styles.shiftLabel}>Duration</Text>
                <Text style={[styles.shiftValue, { color: COLORS.statusLeave }]}>9h 00m</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={[COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd]}
                style={[styles.progressBarFill, { width: '60%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Camera Punch-In Modal */}
      <Modal visible={isCameraModalVisible} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          {capturedPhoto ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
              <Image source={{ uri: capturedPhoto }} style={{ width: 300, height: 400, borderRadius: 20 }} />
              <TouchableOpacity onPress={handlePunchIn} style={{ backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, marginTop: 30, width: 250, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Confirm Punch In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCapturedPhoto(null)} style={{ marginTop: 20, padding: 10 }}>
                <Text style={{ color: 'white', fontSize: 16 }}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {permission?.granted ? (
                <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef}>
                  <SafeAreaView style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingBottom: 40 }}>
                    <View style={{ width: '100%', alignItems: 'flex-end', padding: 20 }}>
                      <TouchableOpacity onPress={() => setIsCameraModalVisible(false)}>
                        <Ionicons name="close" size={32} color="white" />
                      </TouchableOpacity>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ width: 250, height: 250, borderRadius: 125, borderWidth: 4, borderColor: 'white', marginBottom: 50 }} />
                      <TouchableOpacity onPress={takePicture} style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'white', borderWidth: 4, borderColor: '#ccc' }} />
                      <Text style={{ color: 'white', marginTop: 20 }}>Position your face in the circle</Text>
                    </View>
                  </SafeAreaView>
                </CameraView>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                  <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>Camera permission is required.</Text>
                  <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }}>
                    <Text style={{ color: 'white' }}>Grant Permission</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsCameraModalVisible(false)} style={{ marginTop: 20 }}>
                    <Text style={{ color: 'white' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 4,
    marginRight: 12,
  },
  headerDateText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.text,
    marginRight: 12,
    fontWeight: '500',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  calendarNav: {
    flexDirection: 'row',
  },
  calendarScroll: {
    paddingRight: SIZES.padding,
  },
  calendarDay: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  calendarDayActive: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  calendarDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  calendarDateTextActive: {
    color: COLORS.primary,
  },
  calendarDayText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  calendarDayTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.padding,
    marginTop: -10,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userRole: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(30, 201, 131, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: COLORS.statusPresent,
    fontSize: 12,
    fontWeight: '600',
  },
  clockInButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  clockInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  clockInText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  cardSectionTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapGrid: {
    ...StyleSheet.absoluteFill,
    opacity: 0.3,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  locationPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(92, 74, 228, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9B72FF',
    borderWidth: 2,
    borderColor: 'white',
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  locationText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  trackedBadge: {
    backgroundColor: 'rgba(51, 208, 217, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackedBadgeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  shiftDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shiftItem: {
    alignItems: 'center',
  },
  shiftLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  shiftValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shiftDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  shiftLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  }
});
