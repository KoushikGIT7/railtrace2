import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  Shield,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatsCard } from './StatsCard';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { geminiService, VendorAnalysis } from '../../config/gemini';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function AdminDashboard() {
  const [vendorAnalysis, setVendorAnalysis] = useState<VendorAnalysis[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [defectTrendData, setDefectTrendData] = useState<{month: string; defects: number}[]>([]);
  const [fittingTypesData, setFittingTypesData] = useState<{name: string; value: number}[]>([]);
  const [stats, setStats] = useState<{ fittings?: number; pending?: number; critical?: number; records?: number }>({});

  useEffect(() => {
    const load = async () => {
      setIsLoadingAI(true);
      try {
        // Mock data for demonstration
        const mockStats = {
          fittings: 1247,
          pending: 3,
          critical: 2,
          records: 1247
        };

        const mockDefectTrendData = [
          { month: 'Jan', defects: 12 },
          { month: 'Feb', defects: 8 },
          { month: 'Mar', defects: 15 },
          { month: 'Apr', defects: 6 },
          { month: 'May', defects: 9 },
          { month: 'Jun', defects: 4 }
        ];

        const mockFittingTypesData = [
          { name: 'Clips', value: 450 },
          { name: 'Pads', value: 320 },
          { name: 'Liners', value: 280 },
          { name: 'Sleepers', value: 197 }
        ];

        // Mock vendor analysis data
        const mockVendorAnalysis = [
          {
            vendorId: 'VENDOR-001',
            vendorName: 'RailTech Industries',
            score: 92,
            riskLevel: 'low' as const,
            recommendation: 'Excellent performance, continue current practices',
            defectRate: 2.1,
            warrantyClaims: 3
          },
          {
            vendorId: 'VENDOR-002',
            vendorName: 'Metro Components Ltd',
            score: 78,
            riskLevel: 'medium' as const,
            recommendation: 'Good performance, monitor defect rates closely',
            defectRate: 4.2,
            warrantyClaims: 7
          },
          {
            vendorId: 'VENDOR-003',
            vendorName: 'SteelWorks Corp',
            score: 65,
            riskLevel: 'high' as const,
            recommendation: 'Performance declining, requires immediate attention',
            defectRate: 7.8,
            warrantyClaims: 15
          }
        ];

        setStats(mockStats);
        setDefectTrendData(mockDefectTrendData);
        setFittingTypesData(mockFittingTypesData);

        // AI analysis requires real vendor dataset; skip if unavailable
        try {
          const analysis = await geminiService.analyzeVendorPerformance([]);
          setVendorAnalysis(Array.isArray(analysis) ? analysis : mockVendorAnalysis);
        } catch (error) {
          // Silently handle missing API key - this is expected in demo mode
          if (error instanceof Error && error.message.includes('API key is not configured')) {
            console.info('AI analysis skipped - API key not configured (demo mode)');
            setVendorAnalysis(mockVendorAnalysis);
          } else {
            console.warn('AI analysis not available:', error);
            setVendorAnalysis(mockVendorAnalysis);
          }
        }
      } finally {
        setIsLoadingAI(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Railway fittings lifecycle management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Fittings"
          value={stats.fittings ?? '-'}
          subtitle="Across all depots"
          icon={<Package className="h-6 w-6" />}
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.pending ?? '-'}
          subtitle="User registrations"
          icon={<Users className="h-6 w-6" />}
        />
        <StatsCard
          title="Critical Issues"
          value={stats.critical ?? '-'}
          subtitle="Require immediate attention"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatsCard
          title="Blockchain Records"
          value={stats.records ?? '-'}
          subtitle="Verified transactions"
          icon={<Shield className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                AI Vendor Performance Analysis
              </h3>
              {isLoadingAI && (
                <Badge variant="info">Analyzing...</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {vendorAnalysis.length > 0 ? (
              <div className="space-y-4">
                {vendorAnalysis.slice(0, 3).map((vendor) => (
                  <div key={vendor.vendorId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{vendor.vendorName}</p>
                      <p className="text-sm text-gray-600">{vendor.recommendation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{vendor.score}/100</p>
                      <Badge 
                        variant={vendor.riskLevel === 'low' ? 'success' : vendor.riskLevel === 'medium' ? 'warning' : 'error'}
                        size="sm"
                      >
                        {vendor.riskLevel} risk
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">View Detailed Analysis</Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No AI data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Fitting Distribution</h3>
          </CardHeader>
          <CardContent>
            {fittingTypesData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={fittingTypesData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {fittingTypesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Defect Trends</h3>
          </CardHeader>
          <CardContent>
            {defectTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={defectTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="defects" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">No trend data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Blockchain Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Fitting Manufactured</p>
                  <p className="text-sm text-gray-600">Batch #BATCH-2024-001 - 500 clips</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">2 min ago</p>
                <Badge variant="success" size="sm">Verified</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Installation Recorded</p>
                  <p className="text-sm text-gray-600">Platform A - Section 1</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">15 min ago</p>
                <Badge variant="info" size="sm">Confirmed</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Inspection Completed</p>
                  <p className="text-sm text-gray-600">Fitting FIT-001-A - Minor wear detected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">1 hour ago</p>
                <Badge variant="warning" size="sm">Review</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Shipment Received</p>
                  <p className="text-sm text-gray-600">Depot Mumbai - 300 pads</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">3 hours ago</p>
                <Badge variant="default" size="sm">Processed</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}