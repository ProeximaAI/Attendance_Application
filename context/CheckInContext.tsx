import React, { createContext, useState, useRef, ReactNode } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../components/Themed';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

type CheckInContextType = {
  punchInTime: Date | null;
  capturedPhoto: string | null;
  isCameraModalVisible: boolean;
  openCheckIn: () => void;
  closeCheckIn: () => void;
  setPunchInTime: (date: Date | null) => void;
};

export const CheckInContext = createContext<CheckInContextType>({
  punchInTime: null,
  capturedPhoto: null,
  isCameraModalVisible: false,
  openCheckIn: () => {},
  closeCheckIn: () => {},
  setPunchInTime: () => {},
});

export const CheckInProvider = ({ children }: { children: ReactNode }) => {
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const openCheckIn = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setIsCameraModalVisible(true);
  };

  const closeCheckIn = () => {
    setIsCameraModalVisible(false);
    setCapturedPhoto(null);
  };

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
    closeCheckIn();
  };

  return (
    <CheckInContext.Provider value={{ punchInTime, capturedPhoto, isCameraModalVisible, openCheckIn, closeCheckIn, setPunchInTime }}>
      {children}

      {/* Global Camera Modal */}
      <Modal visible={isCameraModalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Check In Photo</Text>
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
              style={[styles.captureButton, capturedPhoto && styles.capturedButton]} 
              onPress={capturedPhoto ? handlePunchIn : takePicture}
            >
              <Text style={styles.captureButtonText}>
                {capturedPhoto ? 'Confirm Check In' : 'Take Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </CheckInContext.Provider>
  );
};

const styles = StyleSheet.create({
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
