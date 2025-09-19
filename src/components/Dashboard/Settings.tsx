import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Bell, 
  Shield, 
  Key,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface SystemSettings {
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    criticalAlerts: boolean;
    weeklyReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    auditLogging: boolean;
  };
  blockchain: {
    autoSync: boolean;
    syncInterval: number;
    retryAttempts: number;
    gasLimit: number;
  };
  ai: {
    enablePredictions: boolean;
    confidenceThreshold: number;
    autoAnalysis: boolean;
    dataRetention: number;
  };
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  organizationName?: string;
  lastLogin?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

export function Settings() {
  const { userData } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      criticalAlerts: true,
      weeklyReports: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      auditLogging: true
    },
    blockchain: {
      autoSync: true,
      syncInterval: 5,
      retryAttempts: 3,
      gasLimit: 50000
    },
    ai: {
      enablePredictions: true,
      confidenceThreshold: 75,
      autoAnalysis: true,
      dataRetention: 365
    }
  });

  const [profile, setProfile] = useState<UserProfile>({
    name: userData?.name || '',
    email: userData?.email || '',
    role: userData?.role || '',
    organizationName: userData?.organizationName || '',
    lastLogin: userData?.lastLogin,
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in real app, save to backend)
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'success':
        return 'Settings saved successfully';
      case 'error':
        return 'Failed to save settings';
      default:
        return 'Save Settings';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            User Profile
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
              <input
                type="text"
                value={profile.organizationName || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
          
          {profile.lastLogin && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              Last login: {profile.lastLogin.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Change Password
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={handlePasswordChange}
            loading={isSaving}
            leftIcon={<Lock className="h-4 w-4" />}
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notifications
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="text-xs text-gray-500">
                    {key === 'emailAlerts' && 'Receive email notifications for important events'}
                    {key === 'pushNotifications' && 'Get push notifications in the browser'}
                    {key === 'criticalAlerts' && 'Immediate alerts for critical issues'}
                    {key === 'weeklyReports' && 'Weekly summary reports via email'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Settings
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="5"
                max="480"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
              <input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="30"
                max="365"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            AI & Analytics Settings
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Enable AI Predictions</label>
                <p className="text-xs text-gray-500">Allow AI to generate predictive maintenance insights</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ai.enablePredictions}
                  onChange={(e) => updateSetting('ai', 'enablePredictions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Threshold (%)</label>
              <input
                type="number"
                value={settings.ai.confidenceThreshold}
                onChange={(e) => updateSetting('ai', 'confidenceThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="50"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          loading={isSaving}
          leftIcon={getSaveStatusIcon()}
          variant={saveStatus === 'success' ? 'success' : saveStatus === 'error' ? 'error' : 'default'}
        >
          {getSaveStatusText()}
        </Button>
      </div>
    </div>
  );
}
