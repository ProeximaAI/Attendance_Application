import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getDocuments, getDocumentTypes, uploadDocument, getDocumentPhotoUrl } from '../../../services/profileService';
import { EmployeeDocument, DocumentType } from '../../../types/profile';
import { COLORS } from '../../../constants/theme';

export default function DocumentManager() {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadUrl = async () => {
      if (viewingDoc?.file_uuid) {
        try {
          const url = await getDocumentPhotoUrl(viewingDoc.file_uuid); 
          setPhotoUrl(url);
        } catch (e) {
          Alert.alert("Error", "Could not load document image");
        }
      } else {
        setPhotoUrl(null);
      }
    };
    loadUrl();
  }, [viewingDoc]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [docsData, typesData] = await Promise.all([
        getDocuments(),
        getDocumentTypes()
      ]);
      setDocuments(docsData);
      setDocumentTypes(typesData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const pickAndUploadImage = async () => {
    if (!selectedTypeId) {
      Alert.alert('Validation', 'Please select a Document Type first.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      handleUpload(asset, selectedTypeId);
    }
  };

  const handleUpload = async (asset: any, typeId: number) => {
    try {
      setUploading(true);
      await uploadDocument(asset, typeId);
      
      Alert.alert('Success', 'Document uploaded successfully!');
      setModalVisible(false);
      setSelectedTypeId(null);
      fetchInitialData(); // Refresh the list
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'verified': return COLORS.statusPresent || '#10B981';
      case 'rejected': return COLORS.statusAbsent || '#EF4444';
      default: return '#F59E0B'; // pending
    }
  };

  if (loading && documents.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No documents uploaded yet.</Text>}
        renderItem={({ item }) => {
          const typeName = item.document_type?.name 
            || documentTypes.find(t => t.id === item.document_type_id)?.name 
            || `Document Type ${item.document_type_id}`;
            
          return (
          <TouchableOpacity onPress={() => setViewingDoc(item)} activeOpacity={0.7}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{typeName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.verification_status) }]}>
                  <Text style={styles.statusText}>{item.verification_status.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardText} numberOfLines={1} ellipsizeMode="middle">{item.file_url}</Text>
            </View>
          </TouchableOpacity>
        )}}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="cloud-upload" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={uploading}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Select Document Type *</Text>
            <View style={styles.typesContainer}>
              {documentTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeButton, selectedTypeId === type.id && styles.typeButtonSelected]}
                  onPress={() => setSelectedTypeId(type.id)}
                  disabled={uploading}
                >
                  <Text style={[styles.typeText, selectedTypeId === type.id && styles.typeTextSelected]}>
                    {type.name} {type.is_required === 1 ? '*' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.uploadButton, (!selectedTypeId || uploading) && styles.uploadButtonDisabled]} 
              onPress={pickAndUploadImage}
              disabled={!selectedTypeId || uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="image-outline" size={20} color="#FFF" style={{marginRight: 8}} />
                  <Text style={styles.uploadButtonText}>Pick Image & Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={!!viewingDoc} transparent={true} animationType="fade" onRequestClose={() => setViewingDoc(null)}>
        <View style={styles.viewerOverlay}>
          <TouchableOpacity style={styles.viewerCloseButton} onPress={() => setViewingDoc(null)}>
            <Ionicons name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.viewerImage} resizeMode="contain" />
          ) : (
            <ActivityIndicator size="large" color="#FFF" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 80 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#6B7280' },
  card: {
    backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardText: { fontSize: 13, color: '#6B7280' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12 },
  typesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  typeButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFF' },
  typeButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeText: { fontSize: 14, color: '#374151' },
  typeTextSelected: { color: '#FFF', fontWeight: 'bold' },
  uploadButton: { backgroundColor: COLORS.primary, flexDirection: 'row', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  uploadButtonDisabled: { opacity: 0.5 },
  uploadButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  viewerCloseButton: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
  viewerImage: { width: '100%', height: '80%' },
});
