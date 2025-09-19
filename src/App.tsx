import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { PendingApproval } from './components/Auth/PendingApproval';
import { SplashScreen } from './components/SplashScreen';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { VendorDashboard } from './components/Dashboard/VendorDashboard';
import { DepotDashboard } from './components/Dashboard/DepotDashboard';
import { EngineerDashboard } from './components/Dashboard/EngineerDashboard';
import { InspectorDashboard } from './components/Dashboard/InspectorDashboard';
import { QRGenerator } from './components/QR/QRGenerator';
import { QRScanner } from './components/QR/QRScanner';
import { UserManagement } from './components/Admin/UserManagement';
import { AIAnalytics } from './components/Dashboard/AIAnalytics';
import { BlockchainAudit } from './components/Dashboard/BlockchainAudit';
import { Reports } from './components/Dashboard/Reports';
import { Settings } from './components/Dashboard/Settings';
import { TestAccountGenerator } from './components/TestAccountGenerator';
import { ErrorBoundary } from './components/ErrorBoundary';

function AuthenticatedApp() {
  const { currentUser, userData, logout, isAdminEmail } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Admins bypass approval screen
  const isAdminByEmail = isAdminEmail(currentUser?.email || null);
  if (!userData?.approved && userData?.role !== 'admin' && !isAdminByEmail) {
    return <PendingApproval />;
  }

  const renderContent = () => {
    if (!userData) {
      return <div className="p-8">Loading...</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        if (userData.role === 'admin') return <AdminDashboard />;
        if (userData.role === 'vendor') return <VendorDashboard />;
        if (userData.role === 'depot') return <DepotDashboard />;
        if (userData.role === 'engineer') return <EngineerDashboard />;
        if (userData.role === 'inspector') return <InspectorDashboard />;
        return <div className="p-8">Dashboard for {userData.role}</div>;
        
      case 'qr-generate':
        if (userData.role === 'vendor') {
          return <QRGenerator />;
        }
        return <div className="p-8">QR Code Generator</div>;
        
      case 'qr-scan':
        return <QRScanner />;
        
      case 'analytics':
        if (userData.role === 'admin') {
          return <AIAnalytics />;
        }
        return <div className="p-8">Analytics</div>;
        
      case 'blockchain':
        if (userData.role === 'admin') {
          return <BlockchainAudit />;
        }
        return <div className="p-8">Blockchain Records</div>;
        
      case 'reports':
        if (userData.role === 'admin') {
          return <Reports />;
        }
        return <div className="p-8">Reports</div>;
        
      case 'settings':
        if (userData.role === 'admin') {
          return <Settings />;
        }
        return <div className="p-8">Settings</div>;
        
      case 'users':
        if (userData.role === 'admin') {
          return <UserManagement />;
        }
        return <div className="p-8">Users</div>;
        
      case 'test-accounts':
        return <TestAccountGenerator />;
        
      default:
        return <div className="p-8">Coming Soon</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onLogout={logout} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function UnauthenticatedApp() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }
  
  return currentUser ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;