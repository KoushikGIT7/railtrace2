import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  QrCode, 
  Package, 
  Wrench, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  Settings,
  Shield,
  TrendingUp,
  Menu,
  X,
  TestTube
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const roleMenuItems = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'AI Analytics', icon: TrendingUp },
    { id: 'blockchain', label: 'Blockchain Audit', icon: Shield },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'test-accounts', label: 'Test Accounts', icon: TestTube },
    { id: 'settings', label: 'Settings', icon: Settings }
  ],
  vendor: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'My Inventory', icon: Package },
    { id: 'qr-generate', label: 'Generate QR', icon: QrCode },
    { id: 'shipments', label: 'Shipments', icon: Package },
    { id: 'performance', label: 'Performance', icon: BarChart3 }
  ],
  depot: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'qr-scan', label: 'QR Scanner', icon: QrCode },
    { id: 'transfers', label: 'Transfers', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ],
  engineer: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'installations', label: 'Installations', icon: Wrench },
    { id: 'qr-scan', label: 'QR Scanner', icon: QrCode },
    { id: 'work-orders', label: 'Work Orders', icon: ClipboardCheck }
  ],
  inspector: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
    { id: 'qr-scan', label: 'QR Scanner', icon: QrCode },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ]
};

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { userData } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems = userData ? roleMenuItems[userData.role] : [];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center p-1">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/8/83/Indian_Railways.svg" 
                alt="Indian Railways"
                className="w-full h-full object-contain filter brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'block';
                }}
              />
              <div className="hidden text-white font-bold text-xs text-center">
                <div>IR</div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RailTrace</h1>
              <p className="text-sm text-gray-500 capitalize">{userData?.role} Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
                  transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                {userData?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userData?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userData?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}