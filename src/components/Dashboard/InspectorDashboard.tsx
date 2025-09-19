import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatsCard } from './StatsCard';
import { 
  QrCode, 
  ClipboardCheck, 
  Image, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Camera,
  TrendingUp,
  Eye,
  MapPin
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

interface InspectorStats {
  inspectionsToday: number;
  pendingInspections: number;
  passedToday: number;
  failedToday: number;
  photosUploaded: number;
}

interface InspectionTask {
  id: string;
  fittingId: string;
  fittingType: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  assignedDate: Date;
  dueDate: Date;
  qrCode: string;
  previousInspection?: Date;
}

interface InspectionRecord {
  id: string;
  taskId: string;
  fittingId: string;
  inspectorId: string;
  location: string;
  timestamp: Date;
  result: 'passed' | 'failed' | 'conditional';
  photos: string[];
  notes: string;
  defects: string[];
  recommendations: string[];
}

export function InspectorDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<InspectorStats>({
    inspectionsToday: 0,
    pendingInspections: 0,
    passedToday: 0,
    failedToday: 0,
    photosUploaded: 0
  });
  const [inspectionTasks, setInspectionTasks] = useState<InspectionTask[]>([]);
  const [recentInspections, setRecentInspections] = useState<InspectionRecord[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInspectorData();
    // Set up real-time updates
    const interval = setInterval(loadInspectorData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadInspectorData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading inspector data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, fetch from Firestore/API
      const mockStats: InspectorStats = {
        inspectionsToday: 6,
        pendingInspections: 4,
        passedToday: 5,
        failedToday: 1,
        photosUploaded: 12
      };

      const mockTasks: InspectionTask[] = [
        {
          id: 'TASK-001',
          fittingId: 'FIT-001',
          fittingType: 'Clips',
          location: 'Platform A - Section 1',
          priority: 'high',
          status: 'pending',
          assignedDate: new Date(),
          dueDate: new Date(Date.now() + 86400000),
          qrCode: 'QR-001'
        },
        {
          id: 'TASK-002',
          fittingId: 'FIT-002',
          fittingType: 'Pads',
          location: 'Platform B - Section 2',
          priority: 'critical',
          status: 'in_progress',
          assignedDate: new Date(Date.now() - 3600000),
          dueDate: new Date(Date.now() + 43200000),
          qrCode: 'QR-002',
          previousInspection: new Date(Date.now() - 2592000000) // 30 days ago
        },
        {
          id: 'TASK-003',
          fittingId: 'FIT-003',
          fittingType: 'Liners',
          location: 'Platform C - Section 3',
          priority: 'medium',
          status: 'pending',
          assignedDate: new Date(Date.now() - 7200000),
          dueDate: new Date(Date.now() + 172800000),
          qrCode: 'QR-003'
        }
      ];

      const mockInspections: InspectionRecord[] = [
        {
          id: 'INSP-001',
          taskId: 'TASK-002',
          fittingId: 'FIT-002',
          inspectorId: userData?.id || 'INSPECTOR-001',
          location: 'Platform B - Section 2',
          timestamp: new Date(),
          result: 'passed',
          photos: ['photo1.jpg', 'photo2.jpg'],
          notes: 'All components in good condition',
          defects: [],
          recommendations: ['Continue regular maintenance']
        },
        {
          id: 'INSP-002',
          taskId: 'TASK-001',
          fittingId: 'FIT-001',
          inspectorId: userData?.id || 'INSPECTOR-001',
          location: 'Platform A - Section 1',
          timestamp: new Date(Date.now() - 3600000),
          result: 'failed',
          photos: ['photo3.jpg'],
          notes: 'Minor corrosion detected',
          defects: ['Surface corrosion', 'Wear marks'],
          recommendations: ['Replace within 30 days', 'Apply protective coating']
        }
      ];

      const mockPerformanceData = [
        { day: 'Mon', inspections: 8, passed: 7, failed: 1 },
        { day: 'Tue', inspections: 12, passed: 10, failed: 2 },
        { day: 'Wed', inspections: 6, passed: 5, failed: 1 },
        { day: 'Thu', inspections: 15, passed: 13, failed: 2 },
        { day: 'Fri', inspections: 10, passed: 9, failed: 1 },
        { day: 'Sat', inspections: 4, passed: 4, failed: 0 },
        { day: 'Sun', inspections: 2, passed: 2, failed: 0 }
      ];

      setStats(mockStats);
      setInspectionTasks(mockTasks);
      setRecentInspections(mockInspections);
      setPerformanceData(mockPerformanceData);
    } catch (error) {
      console.error('Error loading inspector data:', error);
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
      case 'passed':
        return <Badge variant="success">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'conditional':
        return <Badge variant="warning">Conditional</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inspector Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back, {userData?.name}! Track your inspections and quality assessments</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Inspections Today"
          value={stats.inspectionsToday}
          subtitle="Completed"
          icon={<ClipboardCheck className="h-6 w-6" />}
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingInspections}
          subtitle="Awaiting inspection"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatsCard
          title="Passed Today"
          value={stats.passedToday}
          subtitle="Quality approved"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="Failed Today"
          value={stats.failedToday}
          subtitle="Require attention"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatsCard
          title="Photos Uploaded"
          value={stats.photosUploaded}
          subtitle="Evidence captured"
          icon={<Camera className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inspection Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
                Inspection Tasks
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
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inspectionTasks.map((task) => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.fittingType}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Fitting: {task.fittingId}</div>
                      <div>Location: {task.location}</div>
                      <div>Due: {task.dueDate.toLocaleDateString()}</div>
                      {task.previousInspection && (
                        <div>Last inspection: {task.previousInspection.toLocaleDateString()}</div>
                      )}
                      <div className="flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        <span>{task.qrCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Inspections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Recent Inspections
              </h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInspections.map((inspection) => (
                <div key={inspection.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{inspection.fittingId}</span>
                    {getStatusBadge(inspection.result)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Location: {inspection.location}</div>
                    <div>Time: {inspection.timestamp.toLocaleTimeString()}</div>
                    <div className="flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      <span>{inspection.photos.length} photos</span>
                    </div>
                    {inspection.defects.length > 0 && (
                      <div className="text-xs text-red-600">
                        Defects: {inspection.defects.join(', ')}
                      </div>
                    )}
                    {inspection.notes && (
                      <div className="text-xs text-gray-500 italic">
                        "{inspection.notes}"
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
            Weekly Inspection Performance
          </h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="passed" fill="#10B981" name="Passed" />
              <Bar dataKey="failed" fill="#EF4444" name="Failed" />
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
            <Button variant="outline" className="justify-start" leftIcon={<ClipboardCheck className="h-4 w-4" />}>
              Record Inspection
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<Camera className="h-4 w-4" />}>
              Upload Photos
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<MapPin className="h-4 w-4" />}>
              Update Location
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}