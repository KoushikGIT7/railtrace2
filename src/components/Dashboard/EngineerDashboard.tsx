import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatsCard } from './StatsCard';
import { 
  QrCode, 
  Wrench, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  ClipboardCheck,
  Camera,
  TrendingUp,
  Eye
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';

interface EngineerStats {
  installationsToday: number;
  pendingWorkOrders: number;
  completedToday: number;
  qrScansToday: number;
  locationsVisited: number;
}

interface WorkOrder {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  location: string;
  fittingType: string;
  assignedDate: Date;
  dueDate: Date;
  qrCode?: string;
}

interface InstallationRecord {
  id: string;
  workOrderId: string;
  fittingId: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: Date;
  photos: string[];
  notes: string;
  status: 'completed' | 'failed' | 'pending_review';
}

export function EngineerDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<EngineerStats>({
    installationsToday: 0,
    pendingWorkOrders: 0,
    completedToday: 0,
    qrScansToday: 0,
    locationsVisited: 0
  });
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [recentInstallations, setRecentInstallations] = useState<InstallationRecord[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEngineerData();
    // Set up real-time updates
    const interval = setInterval(loadEngineerData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEngineerData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading engineer data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, fetch from Firestore/API
      const mockStats: EngineerStats = {
        installationsToday: 3,
        pendingWorkOrders: 5,
        completedToday: 3,
        qrScansToday: 8,
        locationsVisited: 4
      };

      const mockWorkOrders: WorkOrder[] = [
        {
          id: 'WO-001',
          title: 'Install Clips - Section A',
          priority: 'high',
          status: 'pending',
          location: 'Station Platform A',
          fittingType: 'Clips',
          assignedDate: new Date(),
          dueDate: new Date(Date.now() + 86400000)
        },
        {
          id: 'WO-002',
          title: 'Replace Pads - Section B',
          priority: 'medium',
          status: 'in_progress',
          location: 'Station Platform B',
          fittingType: 'Pads',
          assignedDate: new Date(Date.now() - 3600000),
          dueDate: new Date(Date.now() + 172800000),
          qrCode: 'QR-12345'
        },
        {
          id: 'WO-003',
          title: 'Install Liners - Section C',
          priority: 'critical',
          status: 'pending',
          location: 'Station Platform C',
          fittingType: 'Liners',
          assignedDate: new Date(Date.now() - 7200000),
          dueDate: new Date(Date.now() + 43200000)
        }
      ];

      const mockInstallations: InstallationRecord[] = [
        {
          id: 'INST-001',
          workOrderId: 'WO-002',
          fittingId: 'FIT-001',
          location: 'Station Platform B',
          coordinates: { lat: 28.6139, lng: 77.2090 },
          timestamp: new Date(),
          photos: ['photo1.jpg', 'photo2.jpg'],
          notes: 'Installation completed successfully',
          status: 'completed'
        },
        {
          id: 'INST-002',
          workOrderId: 'WO-001',
          fittingId: 'FIT-002',
          location: 'Station Platform A',
          coordinates: { lat: 28.6140, lng: 77.2091 },
          timestamp: new Date(Date.now() - 3600000),
          photos: ['photo3.jpg'],
          notes: 'Minor adjustment needed',
          status: 'pending_review'
        }
      ];

      const mockPerformanceData = [
        { day: 'Mon', installations: 2, scans: 5 },
        { day: 'Tue', installations: 3, scans: 7 },
        { day: 'Wed', installations: 1, scans: 4 },
        { day: 'Thu', installations: 4, scans: 8 },
        { day: 'Fri', installations: 3, scans: 6 },
        { day: 'Sat', installations: 2, scans: 3 },
        { day: 'Sun', installations: 1, scans: 2 }
      ];

      setStats(mockStats);
      setWorkOrders(mockWorkOrders);
      setRecentInstallations(mockInstallations);
      setPerformanceData(mockPerformanceData);
    } catch (error) {
      console.error('Error loading engineer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="success">Low</Badge>;
      default:
        return <Badge variant="default">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending_review':
        return <Badge variant="warning">Pending Review</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Engineer Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back, {userData?.name}! Track your work orders and installations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Installations Today"
          value={stats.installationsToday}
          subtitle="Completed"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingWorkOrders}
          subtitle="Awaiting action"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          subtitle="Work orders"
          icon={<Wrench className="h-6 w-6" />}
        />
        <StatsCard
          title="QR Scans"
          value={stats.qrScansToday}
          subtitle="Today"
          icon={<QrCode className="h-6 w-6" />}
        />
        <StatsCard
          title="Locations"
          value={stats.locationsVisited}
          subtitle="Visited today"
          icon={<MapPin className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
                Work Orders
              </h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading work orders...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workOrders.map((order) => (
                  <div key={order.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{order.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityBadge(order.priority)}
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Location: {order.location}</div>
                      <div>Fitting: {order.fittingType}</div>
                      <div>Due: {order.dueDate.toLocaleDateString()}</div>
                      {order.qrCode && (
                        <div className="flex items-center gap-1">
                          <QrCode className="h-3 w-3" />
                          <span>QR: {order.qrCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Installations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Recent Installations
              </h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInstallations.map((installation) => (
                <div key={installation.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{installation.fittingId}</span>
                    {getStatusBadge(installation.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Location: {installation.location}</div>
                    <div>Work Order: {installation.workOrderId}</div>
                    <div>Time: {installation.timestamp.toLocaleTimeString()}</div>
                    <div className="flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      <span>{installation.photos.length} photos</span>
                    </div>
                    {installation.notes && (
                      <div className="text-xs text-gray-500 italic">
                        "{installation.notes}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Weekly Performance
          </h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="installations" fill="#3B82F6" name="Installations" />
              <Bar dataKey="scans" fill="#10B981" name="QR Scans" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="justify-start" leftIcon={<QrCode className="h-4 w-4" />}>
              Scan QR Code
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<MapPin className="h-4 w-4" />}>
              Record Installation
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<Camera className="h-4 w-4" />}>
              Upload Evidence
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<ClipboardCheck className="h-4 w-4" />}>
              View Work Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


