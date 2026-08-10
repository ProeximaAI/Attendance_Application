import React, { useState, useContext } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from '../components/Themed';
import { COLORS } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function ResetPasswordScreen() {
  const { logout } = useContext(AuthContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation checks
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  const isMinLength = newPassword.length >= 8;

  const requirementsMet = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isMinLength].filter(Boolean).length;
  
  const getStrengthColor = () => {
    if (newPassword.length === 0) return '#EDE9FE';
    if (requirementsMet <= 2) return '#EF4444'; // Red for weak
    if (requirementsMet <= 4) return '#F59E0B'; // Orange for fair
    return '#10B981'; // Green for strong
  };

  const getStrengthWidth = () => {
    if (newPassword.length === 0) return '0%';
    return `${(requirementsMet / 5) * 100}%`;
  };

  const handleResetPassword = async () => {
    if (requirementsMet < 5 || newPassword.length === 0) {
      alert("Password must be 8 digits with character, symbol, numeric, uppercase and lowercase combinations and can't be empty.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    
    try {
      await authService.changeInitialPassword(newPassword);
      alert("Password reset successfully! Please log in again.");
      await logout(); // State change automatically triggers _layout to route to /login
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>

          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Set a new password to check in and out.
          </Text>

          <View style={styles.formContainer}>
            {/* New Password */}
            <Text style={styles.fieldLabel}>New password</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            
            {/* Password Strength Indicator */}
            <View style={styles.strengthContainer}>
              <View style={styles.strengthTrack}>
                <View 
                  style={[
                    styles.strengthFill, 
                    { 
                      width: getStrengthWidth() as any, 
                      backgroundColor: getStrengthColor() 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.validationText}>
                Password must be 8 characters long and contain a combination of upper case, lower case, numbers, and symbols.
              </Text>
            </View>

            {/* Confirm Password */}
            <Text style={styles.fieldLabel}>Confirm password</Text>
            <View style={[styles.inputGroup, { marginBottom: confirmPassword.length > 0 && newPassword !== confirmPassword ? 8 : 24 }]}>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>The new password and confirm password should be same.</Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.resetButton, 
                (requirementsMet < 5 || newPassword !== confirmPassword || !newPassword) && styles.resetButtonDisabled
              ]} 
              onPress={handleResetPassword}
              disabled={requirementsMet < 5 || newPassword !== confirmPassword || !newPassword}
            >
              <Text style={styles.resetButtonText}>Reset password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, 
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  inputGroup: {
    borderWidth: 1,
    borderColor: '#8B7FB1', // Purplish slate
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 8,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  strengthContainer: {
    marginBottom: 24,
  },
  strengthTrack: {
    height: 6,
    backgroundColor: '#EDE9FE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  validationText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 18,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 24,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonDisabled: {
    opacity: 0.3,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
  },
});
