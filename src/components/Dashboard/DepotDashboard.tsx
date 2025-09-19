import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatsCard } from './StatsCard';
import { 
  QrCode, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Truck,
  Warehouse,
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

interface DepotStats {
  totalInventory: number;
  pendingReceipts: number;
  dispatchedToday: number;
  qrScansToday: number;
  criticalAlerts: number;
}

interface InventoryItem {
  id: string;
  fittingType: string;
  batchNumber: string;
  vendorId: string;
  quantity: number;
  status: 'received' | 'stored' | 'dispatched' | 'low_stock';
  receivedDate: Date;
  location: string;
  qrCode: string;
}

interface ReceiptRecord {
  id: string;
  shipmentId: string;
  vendorId: string;
  batchNumber: string;
  fittingType: string;
  quantity: number;
  condition: 'good' | 'damaged' | 'rejected';
  receivedBy: string;
  timestamp: Date;
  qrCode: string;
}

export function DepotDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DepotStats>({
    totalInventory: 0,
    pendingReceipts: 0,
    dispatchedToday: 0,
    qrScansToday: 0,
    criticalAlerts: 0
  });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<ReceiptRecord[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDepotData();
    // Set up real-time updates
    const interval = setInterval(loadDepotData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDepotData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading depot data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in real app, fetch from Firestore/API
      const mockStats: DepotStats = {
        totalInventory: 1247,
        pendingReceipts: 3,
        dispatchedToday: 45,
        qrScansToday: 12,
        criticalAlerts: 2
      };

      const mockInventory: InventoryItem[] = [
        {
          id: 'INV-001',
          fittingType: 'Clips',
          batchNumber: 'BATCH-2024-001',
          vendorId: 'VENDOR-001',
          quantity: 500,
          status: 'stored',
          receivedDate: new Date(),
          location: 'A-1-15',
          qrCode: 'QR-001'
        },
        {
          id: 'INV-002',
          fittingType: 'Pads',
          batchNumber: 'BATCH-2024-002',
          vendorId: 'VENDOR-002',
          quantity: 50,
          status: 'low_stock',
          receivedDate: new Date(Date.now() - 86400000),
          location: 'B-2-08',
          qrCode: 'QR-002'
        },
        {
          id: 'INV-003',
          fittingType: 'Liners',
          batchNumber: 'BATCH-2024-003',
          vendorId: 'VENDOR-001',
          quantity: 200,
          status: 'dispatched',
          receivedDate: new Date(Date.now() - 172800000),
          location: 'C-3-12',
          qrCode: 'QR-003'
        }
      ];

      const mockReceipts: ReceiptRecord[] = [
        {
          id: 'REC-001',
          shipmentId: 'SHIP-001',
          vendorId: 'VENDOR-001',
          batchNumber: 'BATCH-2024-001',
          fittingType: 'Clips',
          quantity: 500,
          condition: 'good',
          receivedBy: 'John Doe',
          timestamp: new Date(),
          qrCode: 'QR-001'
        },
        {
          id: 'REC-002',
          shipmentId: 'SHIP-002',
          vendorId: 'VENDOR-002',
          batchNumber: 'BATCH-2024-002',
          fittingType: 'Pads',
          quantity: 300,
          condition: 'damaged',
          receivedBy: 'Jane Smith',
          timestamp: new Date(Date.now() - 3600000),
          qrCode: 'QR-002'
        }
      ];

      const mockPerformanceData = [
        { day: 'Mon', receipts: 8, dispatches: 12 },
        { day: 'Tue', receipts: 12, dispatches: 15 },
        { day: 'Wed', receipts: 6, dispatches: 8 },
        { day: 'Thu', receipts: 15, dispatches: 18 },
        { day: 'Fri', receipts: 10, dispatches: 14 },
        { day: 'Sat', receipts: 4, dispatches: 6 },
        { day: 'Sun', receipts: 2, dispatches: 3 }
      ];

      setStats(mockStats);
      setInventory(mockInventory);
      setRecentReceipts(mockReceipts);
      setPerformanceData(mockPerformanceData);
    } catch (error) {
      console.error('Error loading depot data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="info">Received</Badge>;
      case 'stored':
        return <Badge variant="success">Stored</Badge>;
      case 'dispatched':
        return <Badge variant="warning">Dispatched</Badge>;
      case 'low_stock':
        return <Badge variant="destructive">Low Stock</Badge>;
      case 'good':
        return <Badge variant="success">Good</Badge>;
      case 'damaged':
        return <Badge variant="warning">Damaged</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Depot Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back, {userData?.name}! Manage inventory and track shipments</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Inventory"
          value={stats.totalInventory}
          subtitle="Items in stock"
          icon={<Warehouse className="h-6 w-6" />}
        />
        <StatsCard
          title="Pending Receipts"
          value={stats.pendingReceipts}
          subtitle="Awaiting processing"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatsCard
          title="Dispatched Today"
          value={stats.dispatchedToday}
          subtitle="Items sent out"
          icon={<Truck className="h-6 w-6" />}
        />
        <StatsCard
          title="QR Scans"
          value={stats.qrScansToday}
          subtitle="Today"
          icon={<QrCode className="h-6 w-6" />}
        />
        <StatsCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          subtitle="Require attention"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Inventory Status
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
                <p className="text-gray-600">Loading inventory...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.fittingType}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Batch: {item.batchNumber}</div>
                      <div>Quantity: {item.quantity} units</div>
                      <div>Location: {item.location}</div>
                      <div>Vendor: {item.vendorId}</div>
                      <div className="flex items-center gap-1">
                        <QrCode className="h-3 w-3" />
                        <span>{item.qrCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Recent Receipts
              </h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReceipts.map((receipt) => (
                <div key={receipt.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{receipt.fittingType}</span>
                    {getStatusBadge(receipt.condition)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Batch: {receipt.batchNumber}</div>
                    <div>Quantity: {receipt.quantity} units</div>
                    <div>Received by: {receipt.receivedBy}</div>
                    <div>Time: {receipt.timestamp.toLocaleTimeString()}</div>
                    <div className="flex items-center gap-1">
                      <QrCode className="h-3 w-3" />
                      <span>{receipt.qrCode}</span>
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
            Weekly Operations
          </h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="receipts" stroke="#3B82F6" strokeWidth={3} name="Receipts" />
              <Line type="monotone" dataKey="dispatches" stroke="#10B981" strokeWidth={3} name="Dispatches" />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="justify-start" leftIcon={<QrCode className="h-4 w-4" />}>
              Scan QR Code
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<Package className="h-4 w-4" />}>
              Record Receipt
            </Button>
            <Button variant="outline" className="justify-start" leftIcon={<Truck className="h-4 w-4" />}>
              Dispatch Items
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