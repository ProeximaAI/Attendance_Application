import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';

// Import newly created components
import AddressList from './components/AddressList';
import ExperienceList from './components/ExperienceList';
import EducationList from './components/EducationList';
import FamilyList from './components/FamilyList';
import WorkDetails from './components/WorkDetails';
import DocumentManager from './components/DocumentManager';

const OPTIONS = [
  { id: '1', title: 'Add Face' },
  { id: '2', title: 'Address' },
  { id: '3', title: 'Experience' },
  { id: '4', title: 'Education' },
  { id: '5', title: 'Family Details' },
  { id: '6', title: 'Branch' },
  { id: '7', title: 'Department' },
  { id: '8', title: 'Designation' },
  { id: '9', title: 'Employee Document' },
  { id: '10', title: 'Shift' },
];

export default function PersonalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const option = OPTIONS.find((o) => o.id === id);
  const title = option ? option.title : 'Detail';

  const isAddFace = id === '1';

  // State for Add Face camera
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setCapturedPhoto(photo.uri);
      }
    }
  };

  const handleConfirmFace = () => {
    router.back();
  };

  // Conditionally render the correct component based on ID
  const renderContent = () => {
    switch (id) {
      case '1':
        return (
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
                <View style={styles.cameraFooter}>
                  <TouchableOpacity 
                    style={[styles.captureButton, capturedPhoto && styles.capturedButton]} 
                    onPress={capturedPhoto ? handleConfirmFace : takePicture}
                  >
                    <Text style={styles.captureButtonText}>
                      {capturedPhoto ? 'Confirm Face' : 'Take Photo'}
                    </Text>
                  </TouchableOpacity>
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
        );
      case '2':
        return <AddressList />;
      case '3':
        return <ExperienceList />;
      case '4':
        return <EducationList />;
      case '5':
        return <FamilyList />;
      case '6':
      case '7':
      case '8':
      case '10':
        return <WorkDetails id={id as string} />;
      case '9':
        return <DocumentManager />;
      default:
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>Invalid Selection</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.primary }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.rightButtonContainer}>
            {/* The right button container is kept for layout balance. Add/Plus buttons are now inside individual components */}
            <View style={styles.emptyRight} />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.contentContainer}>
        {renderContent()}
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
    // will be overridden inline
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500', 
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  rightButtonContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  emptyRight: {
    width: 32,
    height: 32,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#4B5563', 
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
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
    zIndex: 1,
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
  cameraFooter: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 2,
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
