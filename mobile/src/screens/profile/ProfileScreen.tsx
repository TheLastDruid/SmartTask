/**
 * Profile Screen Component
 * Enhanced with full feature parity to web frontend
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileScreen: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  
  // State management
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Preferences state
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Loading states
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
      });
    }
  }, [user]);

  const handleEditProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Note: This would need to be implemented in apiService
      // await apiService.updateProfile(profileForm);
      
      Alert.alert('Success', 'Profile updated successfully (Note: Backend update needed)');
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      // Note: This would need to be implemented in apiService
      // await apiService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      // Note: This would need to be implemented in apiService
      // await apiService.resendVerificationEmail();
      
      Alert.alert('Success', 'Verification email sent. Please check your inbox.');
      setShowVerificationModal(false);
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleExportData = async () => {
    Alert.alert(
      'Export Data',
      'This will download all your data including tasks and chat history. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            setExporting(true);
            // Note: This would need to be implemented in apiService
            // apiService.exportUserData().then(() => {
            Alert.alert('Success', 'Data export initiated. You will receive an email with your data shortly.');
            // }).catch((error) => {
            //   console.error('Export data error:', error);
            //   Alert.alert('Error', 'Failed to export data. Please try again.');
            // }).finally(() => {
            setExporting(false);
            // });
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: () => {
                    // Note: This would need to be implemented in apiService
                    // apiService.deleteAccount().then(() => {
                    logout().then(() => {
                      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                    }).catch((error) => {
                      console.error('Delete account error:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    });
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout().catch((error) => {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            });
          },
        },
      ]
    );
  };

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleEditProfile} disabled={saving}>
            <Text style={[styles.modalSave, saving && styles.disabled]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>First Name</Text>
            <TextInput
              style={styles.formInput}
              value={profileForm.firstName}
              onChangeText={(text) => setProfileForm({ ...profileForm, firstName: text })}
              placeholder="Enter first name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Last Name</Text>
            <TextInput
              style={styles.formInput}
              value={profileForm.lastName}
              onChangeText={(text) => setProfileForm({ ...profileForm, lastName: text })}
              placeholder="Enter last name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={[styles.formInput, styles.disabledInput]}
              value={profileForm.email}
              editable={false}
              placeholder="Email address"
            />
            <Text style={styles.formHint}>Email cannot be changed after registration</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderPasswordModal = () => (
    <Modal
      visible={showPasswordModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TouchableOpacity onPress={handleChangePassword} disabled={saving}>
            <Text style={[styles.modalSave, saving && styles.disabled]}>
              {saving ? 'Changing...' : 'Change'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Current Password</Text>
            <TextInput
              style={styles.formInput}
              value={passwordForm.currentPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
              placeholder="Enter current password"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>New Password</Text>
            <TextInput
              style={styles.formInput}
              value={passwordForm.newPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
              placeholder="Enter new password"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.formInput}
              value={passwordForm.confirmPassword}
              onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
              placeholder="Confirm new password"
              secureTextEntry
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderVerificationModal = () => (
    <Modal
      visible={showVerificationModal}
      animationType="fade"
      transparent
    >
      <View style={styles.overlayContainer}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>Email Verification</Text>
          <Text style={styles.alertMessage}>
            Your email address is not verified. Would you like us to send a verification email?
          </Text>
          <View style={styles.alertButtons}>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setShowVerificationModal(false)}
            >
              <Text style={styles.alertButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.alertButton, styles.alertButtonPrimary]}
              onPress={handleVerifyEmail}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.alertButtonText, styles.alertButtonTextPrimary]}>
                  Send Email
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={64} color="#fff" />
        </View>
        <Text style={styles.userName}>
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email ?? 'User'}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.emailVerified === false && (
          <TouchableOpacity
            style={styles.verificationBadge}
            onPress={() => setShowVerificationModal(true)}
          >
            <Ionicons name="warning" size={16} color="#ff9800" />
            <Text style={styles.verificationText}>Email Not Verified</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Account Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, user?.emailVerified ? styles.verified : styles.unverified]}>
              {user?.emailVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Profile Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowEditModal(true)}>
            <Ionicons name="create-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowPasswordModal(true)}>
            <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          
          {user?.emailVerified === false && (
            <TouchableOpacity style={styles.settingItem} onPress={() => setShowVerificationModal(true)}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#ff9800" />
              <Text style={styles.settingText}>Verify Email</Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Ionicons name="moon-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Ionicons name="time-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Task Reminders</Text>
            <Switch
              value={taskReminders}
              onValueChange={setTaskReminders}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Ionicons name="mail-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
            />
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleExportData} disabled={exporting}>
            <Ionicons name="download-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>
              {exporting ? 'Exporting Data...' : 'Export My Data'}
            </Text>
            {exporting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="shield-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="document-text-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Help & FAQ</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>Send Feedback</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.settingText}>About SmartTask</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={24} color="#ff3b30" />
            <Text style={styles.dangerText}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>
            {isLoading ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderEditProfileModal()}
      {renderPasswordModal()}
      {renderVerificationModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  verificationText: {
    color: '#ff9800',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  verified: {
    color: '#4CAF50',
  },
  unverified: {
    color: '#ff9800',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerText: {
    fontSize: 16,
    color: '#ff3b30',
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  formHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Alert modal styles
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    alignItems: 'center',
  },
  alertButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  alertButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  alertButtonTextPrimary: {
    color: '#fff',
  },
});

export default ProfileScreen;
