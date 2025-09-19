import React from 'react';
import { Bell, Search, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const { userData } = useAuth();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Search */}
        <div className="flex items-center space-x-4">
          {/* Indian Railways Logo */}
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
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">RailTrace</h1>
              <p className="text-xs text-gray-500">Indian Railways</p>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search fittings, QR codes, inspections..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>

          <div className="hidden md:block h-6 w-px bg-gray-300"></div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{userData?.role}</p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              leftIcon={<LogOut className="h-4 w-4" />}
              className="hidden md:flex"
            >
              Logout
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="md:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}