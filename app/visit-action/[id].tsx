import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert, Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/Themed';
import { COLORS } from '../../constants/theme';
import { visitApi } from '../../services/visitApi';

export default function VisitActionScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'checkin' | 'checkout' }>();
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: COLORS.primary }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAction = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Get Location
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to check-in/out.');
        setIsProcessing(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Enforce Location Accuracy threshold (e.g. < 100 meters)
      if (location.coords.accuracy && location.coords.accuracy > 100) {
        Alert.alert(
          'Poor GPS Signal', 
          `Your GPS accuracy is ${Math.round(location.coords.accuracy)}m, which is too low. Please wait a moment or move outside for a better lock.`,
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }

      // 2. Capture Photo
      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera is not ready.');
        setIsProcessing(false);
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });

      if (!photo) {
        Alert.alert('Error', 'Failed to capture photo.');
        setIsProcessing(false);
        return;
      }

      // 3. Prepare Form Data
      const formData = new FormData();
      formData.append('lat', location.coords.latitude.toString());
      formData.append('lng', location.coords.longitude.toString());
      
      const filename = photo.uri.split('/').pop() || 'selfie.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const typeStr = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('selfie', {
        uri: photo.uri,
        name: filename,
        type: typeStr,
      } as any);

      // 4. API Request
      if (type === 'checkin') {
        const response = await visitApi.checkInVisit(Number(id), formData);
        if (response.success) {
          Alert.alert('Success', 'Checked in successfully!', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
          Alert.alert('Error', response.message || 'Check-in failed');
        }
      } else {
        const response = await visitApi.checkOutVisit(Number(id), formData);
        if (response.success) {
          Alert.alert('Success', 'Checked out successfully!', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
          Alert.alert('Error', response.message || 'Check-out failed');
        }
      }

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error?.response?.data?.message || 'An error occurred during the process.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView 
        style={styles.camera} 
        facing="front"
        ref={cameraRef}
      >
        <SafeAreaView style={styles.overlay} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <RNText style={styles.headerTitle}>
              {type === 'checkin' ? 'Check-In' : 'Checkout'}
            </RNText>
            <View style={{ width: 40 }} />
          </View>

          {/* Guidelines Overlay */}
          <View style={styles.guidelineBox}>
            <View style={styles.faceOutline} />
            <RNText style={styles.guidelineText}>
              Please center your face in the frame
            </RNText>
          </View>

          {/* Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]} 
              onPress={handleAction}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="large" />
              ) : (
                <View style={styles.captureInnerCircle} />
              )}
            </TouchableOpacity>
            <RNText style={styles.footerText}>
              {type === 'checkin' ? 'Tap to Check-In' : 'Tap to Checkout'}
            </RNText>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  guidelineBox: {
    alignItems: 'center',
  },
  faceOutline: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 125,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  guidelineText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 16,
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#1E1B4B',
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
