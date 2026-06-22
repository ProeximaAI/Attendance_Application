import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// Keep the linear-gradient import as requested, but don't use it.
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useEffect, useRef } from 'react';
import { Text } from '../../components/Themed';
import { COLORS, SIZES } from '../../constants/theme';
import { CheckInContext } from '../../context/CheckInContext';
import { useAuth } from '../../hooks/useAuth';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { punchInTime } = useContext(CheckInContext);

  /* // Check-in state moved to CheckInContext
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // PanResponder for Swipe to Check In
  const pan = useRef(new Animated.ValueXY()).current;
  const SWIPE_THRESHOLD = 200; // Will be constrained by layout, assume 200px is enough to trigger

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(pan, { toValue: { x: SWIPE_THRESHOLD + 50, y: 0 }, useNativeDriver: false }).start(() => {
            handleDayPress(true);
            setTimeout(() => {
              pan.setValue({ x: 0, y: 0 }); // reset after opening modal
            }, 500);
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      }
    })
  ).current;

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
  */

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
        date: d.getDate().toString().padStart(2, '0'),
        active: isToday
      });
    }
    return week;
  };

  const weekDays = getWeekDays();
  const scrollViewRef = useRef<ScrollView>(null);
  const activeDayIndex = weekDays.findIndex(d => d.active);

  useEffect(() => {
    if (scrollViewRef.current && activeDayIndex >= 0) {
      setTimeout(() => {
        const itemWidth = 80 + 12; // width + marginRight
        const screenWidth = Dimensions.get('window').width;
        // Center the active item
        const offset = (activeDayIndex * itemWidth) - (screenWidth / 2) + (80 / 2) + SIZES.padding;
        scrollViewRef.current?.scrollTo({ x: Math.max(0, offset), animated: true });
      }, 300);
    }
  }, [activeDayIndex]);

  const handleDayPress = async (isToday: boolean) => {
    /* 
    if (isToday && !punchInTime) {
      if (!permission?.granted) {
        await requestPermission();
      }
      setIsCameraModalVisible(true);
    } 
    */
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerProfile}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }} // Placeholder for user image
              style={styles.profileImage}
            />
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{user?.name || 'Michael Mitc'}</Text>
              <Text style={styles.profileRole}>{user?.role || 'Lead UI/UX Designer'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Calendar Strip */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonth}>June 2026</Text>
            </View>
            <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
              {weekDays.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.calendarDay, item.active && styles.calendarDayActive]}
                  onPress={() => handleDayPress(item.active)}
                >
                  <Text style={[styles.calendarDateText, item.active && styles.calendarTextActive]}>{item.date}</Text>
                  <Text style={[styles.calendarDayText, item.active && styles.calendarTextActive]}>{item.day}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Today Attendance Header Replacement */}
          <View style={styles.todayHeaderRow}>
            <Text style={styles.todayDateText}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <View style={styles.locationPill}>
              <Ionicons name="location" size={12} color="#FFFFFF" />
              <Text style={styles.locationPillText} numberOfLines={1}>Bhubaneswar, Odisha</Text>
            </View>
          </View>
          <View style={styles.attendanceGrid}>
            <View style={styles.attendanceCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="login" size={16} color={COLORS.secondary} />
                </View>
                <Text style={styles.cardTitle}>Check In</Text>
              </View>
              <Text style={styles.cardValue}>{punchInTime ? punchInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:20 am'}</Text>
              <Text style={styles.cardSubtitle}>On Time</Text>
            </View>

            <View style={styles.attendanceCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconWrapper, { backgroundColor: '#EDE9FE' }]}>
                  <MaterialCommunityIcons name="logout" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>Check Out</Text>
              </View>
              <Text style={styles.cardValue}>07:00 pm</Text>
              <Text style={styles.cardSubtitle}>Go Home</Text>
            </View>

            <View style={styles.attendanceCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconWrapper, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="arrow-up" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>Absence</Text>
              </View>
              <Text style={styles.cardValue}>3 Day</Text>
              <Text style={styles.cardSubtitle}>{new Date().toLocaleDateString('en-US', { month: 'long' })}</Text>
            </View>

            <View style={styles.attendanceCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconWrapper, { backgroundColor: '#EDE9FE' }]}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.cardTitle}>Total Days</Text>
              </View>
              <Text style={styles.cardValue}>28</Text>
              <Text style={styles.cardSubtitle}>Working Days</Text>
            </View>
          </View>

          {/* Attendance History */}
          <View style={styles.activityHeaderRow}>
            <Text style={styles.sectionTitle}>Attendance History</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>See More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyCard}>
            <View style={[styles.historyDateBlock, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.historyDateNumber}>22</Text>
              <Text style={styles.historyDateDay}>Wed</Text>
            </View>
            <View style={styles.historyDetails}>
              <View style={styles.historyTimesRow}>
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>07:57</Text>
                  <Text style={styles.historyTimeLabel}>Check In</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>17:00</Text>
                  <Text style={styles.historyTimeLabel}>Check out</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>08:03</Text>
                  <Text style={styles.historyTimeLabel}>Total Hours</Text>
                </View>
              </View>
              <View style={styles.historyLocationRow}>
                <Ionicons name="location" size={12} color={COLORS.primary} />
                <Text style={styles.historyLocationText}>Office, Bhubaneswar, Odisha</Text>
              </View>
            </View>
          </View>

          <View style={styles.historyCard}>
            <View style={[styles.historyDateBlock, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.historyDateNumber}>21</Text>
              <Text style={styles.historyDateDay}>Tue</Text>
            </View>
            <View style={styles.historyDetails}>
              <View style={styles.historyTimesRow}>
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>08:03</Text>
                  <Text style={styles.historyTimeLabel}>Check In</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>17:08</Text>
                  <Text style={styles.historyTimeLabel}>Check out</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>08:05</Text>
                  <Text style={styles.historyTimeLabel}>Total Hours</Text>
                </View>
              </View>
              <View style={styles.historyLocationRow}>
                <Ionicons name="location" size={12} color={COLORS.primary} />
                <Text style={styles.historyLocationText}>Office, Bhubaneswar, Odisha</Text>
              </View>
            </View>
          </View>

          <View style={styles.historyCard}>
            <View style={[styles.historyDateBlock, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.historyDateNumber}>20</Text>
              <Text style={styles.historyDateDay}>Mon</Text>
            </View>
            <View style={styles.historyDetails}>
              <View style={styles.historyTimesRow}>
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>07:59</Text>
                  <Text style={styles.historyTimeLabel}>Check In</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>17:00</Text>
                  <Text style={styles.historyTimeLabel}>Check out</Text>
                </View>
                <View style={styles.historyDivider} />
                <View style={styles.historyTimeItem}>
                  <Text style={styles.historyTimeValue}>08:01</Text>
                  <Text style={styles.historyTimeLabel}>Total Hours</Text>
                </View>
              </View>
              <View style={styles.historyLocationRow}>
                <Ionicons name="location" size={12} color={COLORS.primary} />
                <Text style={styles.historyLocationText}>Office, Bhubaneswar, Odisha</Text>
              </View>
            </View>
          </View>

          {/* Live Location Card */}
          <View style={styles.liveLocationContainer}>
            <Text style={styles.sectionTitle}>Live Location</Text>
            <View style={styles.card}>
              <View style={styles.mapPlaceholder}>
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
          </View>

        </View>
      </ScrollView>

      {/* Sticky Swipe to Check In (Commented out)
      <View style={styles.stickySwipeContainer}>
        <View style={styles.swipeTrack}>
          <Text style={styles.swipeText}>Swipe to Check In</Text>
          <Animated.View
            style={[
              styles.swipeThumb,
              {
                transform: [{
                  translateX: pan.x.interpolate({
                    inputRange: [0, SWIPE_THRESHOLD + 50],
                    outputRange: [0, SWIPE_THRESHOLD + 50],
                    extrapolate: 'clamp'
                  })
                }]
              }
            ]}
            {...panResponder.panHandlers}
          >
            <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
          </Animated.View>
        </View>
      </View>
      */}

      {/* Camera Punch-In Modal (Moved to Global Context)
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
      */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileDetails: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  profileRole: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: SIZES.padding,
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarHeader: {
    marginBottom: 12,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  calendarScroll: {
    paddingRight: SIZES.padding,
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 85,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarDayActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  calendarDateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  calendarDayText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  calendarTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  attendanceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  stickySwipeContainer: {
    position: 'absolute',
    bottom: 20,
    left: SIZES.padding,
    right: SIZES.padding,
  },
  swipeTrack: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    justifyContent: 'center',
    position: 'relative',
  },
  swipeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  swipeThumb: {
    position: 'absolute',
    left: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  liveLocationContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: COLORS.pageBgTint,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  locationPulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(67, 56, 202, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackedBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  todayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayDateText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 140,
  },
  locationPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyDateBlock: {
    width: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyDateNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyDateDay: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  historyDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  historyTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTimeItem: {
    alignItems: 'center',
    flex: 1,
  },
  historyTimeValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyTimeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  historyLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyLocationText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
});
