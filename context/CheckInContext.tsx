import React, { createContext, useState, useRef, ReactNode, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Text } from '../components/Themed';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import * as Location from 'expo-location';
import { attendanceService } from '../services/attendanceService';

const { height } = Dimensions.get('window');

type CheckInContextType = {
  punchInTime: Date | null;
  punchOutTime: Date | null;
  attendanceStatus: string | null;
  capturedPhoto: string | null;
  isCameraModalVisible: boolean;
  openCheckIn: () => void;
  closeCheckIn: () => void;
  setPunchInTime: (date: Date | null) => void;
  fetchStatus: () => Promise<void>;
  selectedLocationType: string | null;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
};

export const CheckInContext = createContext<CheckInContextType>({
  punchInTime: null,
  punchOutTime: null,
  attendanceStatus: null,
  capturedPhoto: null,
  isCameraModalVisible: false,
  openCheckIn: () => {},
  closeCheckIn: () => {},
  setPunchInTime: () => {},
  fetchStatus: async () => {},
  selectedLocationType: null,
  isCheckedIn: false,
  isCheckedOut: false,
});

export const CheckInProvider = ({ children }: { children: ReactNode }) => {
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<Date | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedPhotoBase64, setCapturedPhotoBase64] = useState<string | null>(null);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [isLocationSheetVisible, setIsLocationSheetVisible] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  
  const fetchStatus = async () => {
    try {
      const response = await attendanceService.getStatus();
      if (response.success && response.data) {
        setIsCheckedOut(response.data.checked_out);
        setIsCheckedIn(response.data.checked_in && !response.data.checked_out);
        if (response.data.record) {
          if (response.data.record.checkin_time) {
            setPunchInTime(new Date(response.data.record.checkin_time));
          }
          if (response.data.record.checkout_time) {
            setPunchOutTime(new Date(response.data.record.checkout_time));
          }
          if (response.data.record.status) {
            setAttendanceStatus(response.data.record.status);
          }
        }
      }
    } catch (e) {
      console.log('Failed to fetch attendance status', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const openCheckIn = async () => {
    if (isCheckedOut) {
      Alert.alert("Notice", "Attendance was already recorded for today");
      return;
    }

    if (isCheckedIn) {
      // User is checking out - skip location selection sheet
      if (!permission?.granted) {
        await requestPermission();
      }
      setIsCameraModalVisible(true);
    } else {
      setIsLocationSheetVisible(true);
    }
  };

  const handleLocationSelect = async (location: string) => {
    setSelectedLocationType(location);
    setIsLocationSheetVisible(false);
    
    if (!permission?.granted) {
      await requestPermission();
    }
    
    // Brief delay to allow bottom sheet animation to finish before opening camera modal
    setTimeout(() => {
      setIsCameraModalVisible(true);
    }, 300);
  };

  const closeCheckIn = () => {
    setIsCameraModalVisible(false);
    setIsLocationSheetVisible(false);
    setCapturedPhoto(null);
    setCapturedPhotoBase64(null);
    setIsSubmitting(false);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo) {
        setCapturedPhoto(photo.uri);
        setCapturedPhotoBase64(photo.base64 || null);
      }
    }
  };

  const handlePunchIn = async () => {
    try {
      setIsSubmitting(true);

      // 1. Get Location
      let latitude = null;
      let longitude = null;
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (selectedLocationType === 'Office') {
          Alert.alert("Permission Denied", "Location permission is required for Office.");
          setIsSubmitting(false);
          return;
        }
      } else {
        const location = await Location.getCurrentPositionAsync({});
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      }

      if (isCheckedIn) {
        // Check-out flow
        try {
          const response = await attendanceService.checkOut({ latitude, longitude });
          await fetchStatus(); // Fetch status to update UI instantly
          closeCheckIn();
          Alert.alert("Success", response.message || "Checked out successfully");
        } catch (error: any) {
          if (error?.requires_confirmation) {
            Alert.alert(
              "Confirmation Required",
              error.message || "Do you want to proceed?",
              [
                {
                  text: "No",
                  onPress: () => setIsSubmitting(false),
                  style: "cancel"
                },
                {
                  text: "Yes",
                  onPress: async () => {
                    try {
                      const outOfBoundsResponse = await attendanceService.checkOutOutOfBounds({
                        latitude,
                        longitude,
                        reason: "Out of bounds checkout"
                      });
                      await fetchStatus(); // Fetch status to update UI instantly
                      closeCheckIn();
                      Alert.alert("Success", outOfBoundsResponse.message || "Out-of-bounds check-out requested successfully and is pending approval.");
                    } catch (innerError: any) {
                      setIsSubmitting(false);
                      Alert.alert("Check-out Failed", innerError?.message || "Failed to submit out-of-bounds check-out.");
                    }
                  }
                }
              ]
            );
            return; // Wait for user action
          } else {
            setIsSubmitting(false);
            Alert.alert("Check-out Failed", error?.message || "Failed to check out. Please try again.");
          }
        }
      } else {
        // Check-in flow
        let type: 'office' | 'wfh' | 'outdoor' = 'office';
        if (selectedLocationType === 'Work from home') type = 'wfh';
        if (selectedLocationType === 'Outdoor duty') type = 'outdoor';

        const response = await attendanceService.checkIn({
          latitude,
          longitude,
          attendance_type: type,
          selfie_data: capturedPhotoBase64 ? `data:image/jpeg;base64,${capturedPhotoBase64}` : null
        });

        await fetchStatus(); // Fetch status to update UI instantly
        closeCheckIn();
        
        let alertMsg = response.message || "Checked in successfully";
        if (response.data?.warning) {
          alertMsg += `\n\nNote: ${response.data.warning}`;
        }
        Alert.alert("Success", alertMsg);
      }
    } catch (error: any) {
      setIsSubmitting(false);
      const errorMsg = error?.message || "Failed to submit request. Please try again.";
      Alert.alert("Error", errorMsg);
    }
  };

  return (
    <CheckInContext.Provider value={{ punchInTime, punchOutTime, attendanceStatus, capturedPhoto, isCameraModalVisible, openCheckIn, closeCheckIn, setPunchInTime, fetchStatus, selectedLocationType, isCheckedIn, isCheckedOut }}>
      {children}

      {/* Location Selection Bottom Sheet */}
      <Modal visible={isLocationSheetVisible} animationType="slide" transparent={true} onRequestClose={closeCheckIn}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={closeCheckIn}>
          <TouchableOpacity activeOpacity={1} style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              Where are you checking in from?
            </Text>
            
            <TouchableOpacity style={styles.sheetOption} onPress={() => handleLocationSelect('Office')}>
              <MaterialCommunityIcons name="office-building-outline" size={24} color={COLORS.text} style={styles.sheetIcon} />
              <Text style={styles.sheetOptionText}>Office</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.sheetOption} onPress={() => handleLocationSelect('Work from home')}>
              <Ionicons name="home-outline" size={24} color={COLORS.text} style={styles.sheetIcon} />
              <Text style={styles.sheetOptionText}>Work from home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={() => handleLocationSelect('Outdoor duty')}>
              <Ionicons name="location-outline" size={24} color={COLORS.text} style={styles.sheetIcon} />
              <Text style={styles.sheetOptionText}>Outdoor duty</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Global Camera Modal */}
      <Modal visible={isCameraModalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isCheckedIn ? "Check Out Photo" : "Check In Photo"}
            </Text>
            <TouchableOpacity onPress={closeCheckIn} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cameraContainer}>
            {permission?.granted ? (
              <>
                <CameraView 
                  ref={cameraRef}
                  style={styles.camera} 
                  facing="front"
                />
                <View style={styles.cameraOverlay}>
                  <View style={styles.faceOutline} />
                </View>
              </>
            ) : (
              <View style={styles.noPermissionContainer}>
                <Text style={{textAlign: 'center', color: COLORS.textMuted}}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={{marginTop: 20}}>
                  <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.captureButton, capturedPhoto && styles.capturedButton, isSubmitting && { opacity: 0.7 }]} 
              onPress={isSubmitting ? undefined : (capturedPhoto ? handlePunchIn : takePicture)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.captureButtonText}>
                  {capturedPhoto ? (isCheckedIn ? 'Confirm Check Out' : 'Confirm Check In') : 'Take Photo'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </CheckInContext.Provider>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sheetIcon: {
    marginRight: 12,
  },
  sheetOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
    backgroundColor: COLORS.pageBgTint,
    borderRadius: 20,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
    margin: 20,
    borderRadius: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOutline: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 125,
    borderStyle: 'dashed',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  captureButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  capturedButton: {
    backgroundColor: COLORS.statusPresent,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
