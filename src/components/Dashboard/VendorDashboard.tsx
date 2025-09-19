import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatsCard } from './StatsCard';
import { 
  Package, 
  QrCode, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  BarChart3,
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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface VendorStats {
  totalBatches: number;
  pendingShipments: number;
  completedShipments: number;
  qrCodesGenerated: number;
  blockchainRecords: number;
}

interface BatchData {
  id: string;
  batchNumber: string;
  fittingType: string;
  quantity: number;
  status: 'manufacturing' | 'ready' | 'shipped' | 'delivered';
  createdAt: Date;
  blockchainHash?: string;
}

interface ShipmentData {
  id: string;
  batchId: string;
  depotId: string;
  status: 'pending' | 'in_transit' | 'delivered';
  trackingNumber: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
}

export function VendorDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<VendorStats>({
    totalBatches: 0,
    pendingShipments: 0,
    completedShipments: 0,
    qrCodesGenerated: 0,
    blockchainRecords: 0
  });
  const [recentBatches, setRecentBatches] = useState<BatchData[]>([]);
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVendorData();
    // Set up real-time updates
    const interval = setInterval(loadVendorData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadVendorData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading vendor data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, fetch from Firestore/API
      const mockStats: VendorStats = {
        totalBatches: 24,
        pendingShipments: 3,
        completedShipments: 18,
        qrCodesGenerated: 1247,
        blockchainRecords: 1247
      };

      const mockBatches: BatchData[] = [
        {
          id: '1',
          batchNumber: 'BATCH-2024-001',
          fittingType: 'Clips',
          quantity: 500,
          status: 'ready',
          createdAt: new Date(),
          blockchainHash: '0x1234...'
        },
        {
          id: '2',
          batchNumber: 'BATCH-2024-002',
          fittingType: 'Pads',
          quantity: 300,
          status: 'manufacturing',
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          id: '3',
          batchNumber: 'BATCH-2024-003',
          fittingType: 'Liners',
          quantity: 200,
          status: 'shipped',
          createdAt: new Date(Date.now() - 7200000),
          blockchainHash: '0x5678...'
        }
      ];

      const mockShipments: ShipmentData[] = [
        {
          id: '1',
          batchId: 'BATCH-2024-001',
          depotId: 'DEPOT-001',
          status: 'in_transit',
          trackingNumber: 'TRK-001',
          estimatedDelivery: new Date(Date.now() + 86400000)
        },
        {
          id: '2',
          batchId: 'BATCH-2024-003',
          depotId: 'DEPOT-002',
          status: 'delivered',
          trackingNumber: 'TRK-002',
          estimatedDelivery: new Date(Date.now() - 86400000),
          actualDelivery: new Date(Date.now() - 3600000)
        }
      ];

      const mockPerformanceData = [
        { month: 'Jan', batches: 8, shipments: 6 },
        { month: 'Feb', batches: 12, shipments: 10 },
        { month: 'Mar', batches: 15, shipments: 12 },
        { month: 'Apr', batches: 18, shipments: 15 },
        { month: 'May', batches: 22, shipments: 18 },
        { month: 'Jun', batches: 24, shipments: 21 }
      ];

      setStats(mockStats);
      setRecentBatches(mockBatches);
      setShipments(mockShipments);
      setPerformanceData(mockPerformanceData);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'manufacturing':
        return <Badge variant="warning">Manufacturing</Badge>;
      case 'ready':
        return <Badge variant="info">Ready</Badge>;
      case 'shipped':
        return <Badge variant="success">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'in_transit':
        return <Badge variant="info">In Transit</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back, {userData?.name}! Manage your batches and track shipments</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Batches"
          value={stats.totalBatches}
          subtitle="All time"
          icon={<Package className="h-6 w-6" />}
        />
        <StatsCard
          title="Pending Shipments"
          value={stats.pendingShipments}
          subtitle="Awaiting delivery"
          icon={<Truck className="h-6 w-6" />}
        />
        <StatsCard
          title="Completed"
          value={stats.completedShipments}
          subtitle="Delivered successfully"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="QR Codes"
          value={stats.qrCodesGenerated}
          subtitle="Generated"
          icon={<QrCode className="h-6 w-6" />}
        />
        <StatsCard
          title="Blockchain Records"
          value={stats.blockchainRecords}
          subtitle="Verified transactions"
          icon={<Shield className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Recent Batches
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
                <p className="text-gray-600">Loading batches...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{batch.batchNumber}</h4>
                        {getStatusBadge(batch.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{batch.fittingType}</span>
                        <span>•</span>
                        <span>{batch.quantity} units</span>
                        <span>•</span>
                        <span>{batch.createdAt.toLocaleDateString()}</span>
                      </div>
                      {batch.blockchainHash && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Blockchain verified</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipment Tracking */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Shipment Tracking
              </h3>
              <Button variant="outline" size="sm">
                Track All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{shipment.trackingNumber}</span>
                    {getStatusBadge(shipment.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Batch: {shipment.batchId}</div>
                    <div>Depot: {shipment.depotId}</div>
                    <div>
                      {shipment.status === 'delivered' 
                        ? `Delivered: ${shipment.actualDelivery?.toLocaleDateString()}`
                        : `ETA: ${shipment.estimatedDelivery.toLocaleDateString()}`
                      }
                    </div>
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
            Performance Trends
          </h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="batches" stroke="#3B82F6" strokeWidth={3} name="Batches" />
              <Line type="monotone" dataKey="shipments" stroke="#10B981" strokeWidth={3} name="Shipments" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="justify-start" leftIcon={<QrCode className="h-4 w-4" />}>
              Generate QR Codes
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<Package className="h-4 w-4" />}>
              Create New Batch
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<Shield className="h-4 w-4" />}>
              View Blockchain Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


