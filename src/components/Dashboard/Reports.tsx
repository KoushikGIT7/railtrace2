import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity
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
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ReportData {
  id: string;
  title: string;
  type: 'summary' | 'detailed' | 'analytics';
  category: string;
  generatedAt: Date;
  period: string;
  status: 'ready' | 'generating' | 'failed';
  downloadUrl?: string;
}

interface ReportMetrics {
  totalReports: number;
  readyReports: number;
  generatingReports: number;
  failedReports: number;
}

interface RealTimeData {
  totalTransactions: number;
  inspectionsPassed: number;
  inspectionsFailed: number;
  inspectionsPending: number;
  vendorsActive: number;
  partsRegistered: number;
  partsInstalled: number;
  partsRetired: number;
  lastUpdate: Date;
}

interface MonthlyData {
  month: string;
  passed: number;
  failed: number;
  pending: number;
  registered: number;
  installed: number;
  retired: number;
}

export function Reports() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalReports: 0,
    readyReports: 0,
    generatingReports: 0,
    failedReports: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    totalTransactions: 0,
    inspectionsPassed: 0,
    inspectionsFailed: 0,
    inspectionsPending: 0,
    vendorsActive: 0,
    partsRegistered: 0,
    partsInstalled: 0,
    partsRetired: 0,
    lastUpdate: new Date()
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Enhanced mock data for charts
  const [inspectionData] = useState([
    { month: 'Jan', passed: 45, failed: 5, pending: 10, registered: 20, installed: 18, retired: 2 },
    { month: 'Feb', passed: 52, failed: 3, pending: 8, registered: 25, installed: 22, retired: 3 },
    { month: 'Mar', passed: 48, failed: 7, pending: 12, registered: 30, installed: 28, retired: 4 },
    { month: 'Apr', passed: 55, failed: 2, pending: 6, registered: 28, installed: 26, retired: 5 },
    { month: 'May', passed: 58, failed: 4, pending: 9, registered: 32, installed: 30, retired: 6 },
    { month: 'Jun', passed: 62, failed: 1, pending: 5, registered: 35, installed: 33, retired: 7 }
  ]);

  const [vendorPerformanceData] = useState([
    { name: 'SteelWorks Ltd', score: 95, defects: 2, deliveries: 45, parts: 120, quality: 'Excellent' },
    { name: 'RailTech Corp', score: 87, defects: 5, deliveries: 38, parts: 95, quality: 'Good' },
    { name: 'MetalCraft Inc', score: 92, defects: 3, deliveries: 42, parts: 110, quality: 'Very Good' },
    { name: 'IronBridge Co', score: 78, defects: 8, deliveries: 35, parts: 85, quality: 'Fair' },
    { name: 'Precision Parts', score: 89, defects: 4, deliveries: 40, parts: 100, quality: 'Good' },
    { name: 'Quality Steel', score: 94, defects: 1, deliveries: 48, parts: 125, quality: 'Excellent' }
  ]);

  const [fittingDistributionData] = useState([
    { name: 'Clips', value: 35, color: '#3B82F6', count: 245 },
    { name: 'Pads', value: 25, color: '#10B981', count: 175 },
    { name: 'Liners', value: 20, color: '#F59E0B', count: 140 },
    { name: 'Sleepers', value: 15, color: '#EF4444', count: 105 },
    { name: 'Fasteners', value: 5, color: '#8B5CF6', count: 35 }
  ]);

  useEffect(() => {
    loadReports();
    setupRealTimeUpdates();
    loadMonthlyData();
  }, []);

  const setupRealTimeUpdates = () => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      });

      // Process real-time data
      const processedData = processRealTimeData(transactions);
      setRealTimeData(processedData);
      setLastUpdate(new Date());
      setIsLoading(false);
    });

    return () => unsubscribe();
  };

  const processRealTimeData = (transactions: any[]): RealTimeData => {
    const inspections = transactions.filter(t => t.eventType === 'inspected');
    const registered = transactions.filter(t => t.eventType === 'registered');
    const installed = transactions.filter(t => t.eventType === 'installed');
    const retired = transactions.filter(t => t.eventType === 'retired');
    
    const inspectionsPassed = inspections.filter(i => i.data?.resultCode === 0).length;
    const inspectionsFailed = inspections.filter(i => i.data?.resultCode === 1).length;
    const inspectionsPending = inspections.filter(i => i.data?.resultCode === 2).length;
    
    const uniqueVendors = new Set(registered.map(r => r.data?.vendorId).filter(Boolean));
    
    return {
      totalTransactions: transactions.length,
      inspectionsPassed,
      inspectionsFailed,
      inspectionsPending,
      vendorsActive: uniqueVendors.size,
      partsRegistered: registered.length,
      partsInstalled: installed.length,
      partsRetired: retired.length,
      lastUpdate: new Date()
    };
  };

  const loadMonthlyData = async () => {
    try {
      // Get last 6 months of data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const q = query(
        collection(db, 'transactions'),
        where('createdAt', '>=', Timestamp.fromDate(sixMonthsAgo)),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        };
      });

      // Group by month
      const monthlyGroups: { [key: string]: any } = {};
      
      transactions.forEach(transaction => {
        const month = transaction.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!monthlyGroups[month]) {
          monthlyGroups[month] = {
            month,
            passed: 0,
            failed: 0,
            pending: 0,
            registered: 0,
            installed: 0,
            retired: 0
          };
        }
        
        switch (transaction.eventType) {
          case 'inspected':
            if (transaction.data?.resultCode === 0) monthlyGroups[month].passed++;
            else if (transaction.data?.resultCode === 1) monthlyGroups[month].failed++;
            else monthlyGroups[month].pending++;
            break;
          case 'registered':
            monthlyGroups[month].registered++;
            break;
          case 'installed':
            monthlyGroups[month].installed++;
            break;
          case 'retired':
            monthlyGroups[month].retired++;
            break;
        }
      });

      const monthlyArray = Object.values(monthlyGroups).sort((a: any, b: any) => 
        new Date(a.month).getTime() - new Date(b.month).getTime()
      );
      
      setMonthlyData(monthlyArray as MonthlyData[]);
    } catch (error) {
      console.error('Error loading monthly data:', error);
      // Fallback to mock data
      setMonthlyData([
        { month: 'Jan', passed: 45, failed: 5, pending: 10, registered: 20, installed: 18, retired: 2 },
        { month: 'Feb', passed: 52, failed: 3, pending: 8, registered: 25, installed: 22, retired: 3 },
        { month: 'Mar', passed: 48, failed: 7, pending: 12, registered: 30, installed: 28, retired: 4 },
        { month: 'Apr', passed: 55, failed: 2, pending: 6, registered: 28, installed: 26, retired: 5 },
        { month: 'May', passed: 58, failed: 4, pending: 9, registered: 32, installed: 30, retired: 6 },
        { month: 'Jun', passed: 62, failed: 1, pending: 5, registered: 35, installed: 33, retired: 7 }
      ]);
    }
  };

  const loadReports = async () => {
    // Simulate loading reports
    const mockReports: ReportData[] = [
      {
        id: '1',
        title: 'Monthly Inspection Summary',
        type: 'summary',
        category: 'inspections',
        generatedAt: new Date(),
        period: 'Last 30 days',
        status: 'ready',
        downloadUrl: '#'
      },
      {
        id: '2',
        title: 'Vendor Performance Analysis',
        type: 'analytics',
        category: 'vendors',
        generatedAt: new Date(Date.now() - 3600000),
        period: 'Last 30 days',
        status: 'ready',
        downloadUrl: '#'
      },
      {
        id: '3',
        title: 'Blockchain Audit Report',
        type: 'detailed',
        category: 'blockchain',
        generatedAt: new Date(Date.now() - 7200000),
        period: 'Last 7 days',
        status: 'ready',
        downloadUrl: '#'
      },
      {
        id: '4',
        title: 'Quality Control Report',
        type: 'summary',
        category: 'quality',
        generatedAt: new Date(Date.now() - 10800000),
        period: 'Last 30 days',
        status: 'generating'
      }
    ];

    const mockMetrics: ReportMetrics = {
      totalReports: mockReports.length,
      readyReports: mockReports.filter(r => r.status === 'ready').length,
      generatingReports: mockReports.filter(r => r.status === 'generating').length,
      failedReports: mockReports.filter(r => r.status === 'failed').length
    };

    setReports(mockReports);
    setMetrics(mockMetrics);
  };

  const generateReport = async (type: string, category: string) => {
    setIsGenerating(true);
    try {
      // Simulate report generation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportTitles = {
        'inspections': {
          'summary': 'Monthly Inspection Summary',
          'detailed': 'Detailed Inspection Analysis',
          'analytics': 'Inspection Performance Analytics'
        },
        'vendors': {
          'summary': 'Vendor Performance Summary',
          'detailed': 'Comprehensive Vendor Analysis',
          'analytics': 'Vendor Quality Metrics'
        },
        'blockchain': {
          'summary': 'Blockchain Transaction Summary',
          'detailed': 'Complete Blockchain Audit Report',
          'analytics': 'Blockchain Performance Analytics'
        },
        'quality': {
          'summary': 'Quality Control Summary',
          'detailed': 'Quality Assurance Report',
          'analytics': 'Quality Metrics Analysis'
        }
      };

      const title = reportTitles[category as keyof typeof reportTitles]?.[type as keyof typeof reportTitles[keyof typeof reportTitles]] || 
                   `${category.charAt(0).toUpperCase() + category.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)} Report`;
      
      const newReport: ReportData = {
        id: `report-${Date.now()}`,
        title,
        type: type as 'summary' | 'detailed' | 'analytics',
        category,
        generatedAt: new Date(),
        period: selectedPeriod === '7d' ? 'Last 7 days' : selectedPeriod === '30d' ? 'Last 30 days' : 'Last 90 days',
        status: 'ready',
        downloadUrl: '#'
      };

      setReports(prev => [newReport, ...prev]);
      setMetrics(prev => ({
        ...prev,
        totalReports: prev.totalReports + 1,
        readyReports: prev.readyReports + 1
      }));

      // Show success message
      console.log(`✅ Report generated successfully: ${title}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = async (report: ReportData) => {
    try {
      console.log('Generating report:', report.title);
      
      let reportContent = '';
      let fileName = '';
      let fileType = '';

      switch (report.type) {
        case 'summary':
          reportContent = generateSummaryReport(report);
          fileName = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
          fileType = 'text/plain';
          break;
        case 'detailed':
          reportContent = generateDetailedReport(report);
          fileName = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
          fileType = 'application/json';
          break;
        case 'analytics':
          reportContent = generateAnalyticsReport(report);
          fileName = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
          fileType = 'text/csv';
          break;
        default:
          reportContent = generateSummaryReport(report);
          fileName = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
          fileType = 'text/plain';
      }

      // Create and download the file
      const blob = new Blob([reportContent], { type: fileType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Report downloaded successfully:', fileName);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const generateSummaryReport = (report: ReportData): string => {
    const timestamp = new Date().toLocaleString();
    return `
RAILWAY PARTS MANAGEMENT SYSTEM - SUMMARY REPORT
================================================

Report Title: ${report.title}
Generated: ${timestamp}
Period: ${report.period}
Category: ${report.category}

REAL-TIME STATISTICS
====================
Total Transactions: ${realTimeData.totalTransactions}
Inspections Passed: ${realTimeData.inspectionsPassed}
Inspections Failed: ${realTimeData.inspectionsFailed}
Inspections Pending: ${realTimeData.inspectionsPending}
Parts Registered: ${realTimeData.partsRegistered}
Parts Installed: ${realTimeData.partsInstalled}
Parts Retired: ${realTimeData.partsRetired}
Active Vendors: ${realTimeData.vendorsActive}

INSPECTION SUMMARY
==================
Success Rate: ${realTimeData.inspectionsPassed + realTimeData.inspectionsFailed > 0 
  ? Math.round((realTimeData.inspectionsPassed / (realTimeData.inspectionsPassed + realTimeData.inspectionsFailed)) * 100)
  : 0}%

Parts in System: ${realTimeData.partsRegistered - realTimeData.partsRetired}

VENDOR PERFORMANCE
==================
${vendorPerformanceData.map(vendor => 
  `${vendor.name}: ${vendor.score}% (${vendor.quality}) - ${vendor.deliveries} deliveries, ${vendor.defects} defects`
).join('\n')}

FITTING DISTRIBUTION
====================
${fittingDistributionData.map(fitting => 
  `${fitting.name}: ${fitting.value}% (${fitting.count} parts)`
).join('\n')}

REPORT METRICS
==============
Total Reports Generated: ${metrics.totalReports}
Ready Reports: ${metrics.readyReports}
Generating Reports: ${metrics.generatingReports}
Failed Reports: ${metrics.failedReports}

---
Generated by Railway Parts Management System
Last Updated: ${lastUpdate.toLocaleString()}
    `.trim();
  };

  const generateDetailedReport = (report: ReportData): string => {
    const reportData = {
      reportInfo: {
        title: report.title,
        type: report.type,
        category: report.category,
        period: report.period,
        generatedAt: report.generatedAt.toISOString(),
        generatedBy: 'Railway Parts Management System'
      },
      realTimeData: {
        ...realTimeData,
        lastUpdate: realTimeData.lastUpdate.toISOString()
      },
      monthlyData: monthlyData.map(month => ({
        ...month,
        // Convert any Date objects to ISO strings if needed
      })),
      vendorPerformance: vendorPerformanceData,
      fittingDistribution: fittingDistributionData,
      metrics: metrics,
      inspectionTrends: monthlyData.length > 0 ? monthlyData : inspectionData,
      summary: {
        totalTransactions: realTimeData.totalTransactions,
        successRate: realTimeData.inspectionsPassed + realTimeData.inspectionsFailed > 0 
          ? Math.round((realTimeData.inspectionsPassed / (realTimeData.inspectionsPassed + realTimeData.inspectionsFailed)) * 100)
          : 0,
        partsInSystem: realTimeData.partsRegistered - realTimeData.partsRetired,
        averageVendorScore: vendorPerformanceData.length > 0 
          ? Math.round(vendorPerformanceData.reduce((sum, v) => sum + v.score, 0) / vendorPerformanceData.length)
          : 0
      }
    };

    return JSON.stringify(reportData, null, 2);
  };

  const generateAnalyticsReport = (report: ReportData): string => {
    const headers = [
      'Metric',
      'Value',
      'Percentage',
      'Category',
      'Last Updated'
    ];

    const rows = [
      ['Total Transactions', realTimeData.totalTransactions.toString(), '100%', 'System', lastUpdate.toISOString()],
      ['Inspections Passed', realTimeData.inspectionsPassed.toString(), 
        realTimeData.totalTransactions > 0 ? `${Math.round((realTimeData.inspectionsPassed / realTimeData.totalTransactions) * 100)}%` : '0%', 
        'Inspections', lastUpdate.toISOString()],
      ['Inspections Failed', realTimeData.inspectionsFailed.toString(), 
        realTimeData.totalTransactions > 0 ? `${Math.round((realTimeData.inspectionsFailed / realTimeData.totalTransactions) * 100)}%` : '0%', 
        'Inspections', lastUpdate.toISOString()],
      ['Parts Registered', realTimeData.partsRegistered.toString(), 
        realTimeData.totalTransactions > 0 ? `${Math.round((realTimeData.partsRegistered / realTimeData.totalTransactions) * 100)}%` : '0%', 
        'Parts', lastUpdate.toISOString()],
      ['Parts Installed', realTimeData.partsInstalled.toString(), 
        realTimeData.partsRegistered > 0 ? `${Math.round((realTimeData.partsInstalled / realTimeData.partsRegistered) * 100)}%` : '0%', 
        'Parts', lastUpdate.toISOString()],
      ['Parts Retired', realTimeData.partsRetired.toString(), 
        realTimeData.partsRegistered > 0 ? `${Math.round((realTimeData.partsRetired / realTimeData.partsRegistered) * 100)}%` : '0%', 
        'Parts', lastUpdate.toISOString()],
      ['Active Vendors', realTimeData.vendorsActive.toString(), 'N/A', 'Vendors', lastUpdate.toISOString()],
      ['Success Rate', `${realTimeData.inspectionsPassed + realTimeData.inspectionsFailed > 0 
        ? Math.round((realTimeData.inspectionsPassed / (realTimeData.inspectionsPassed + realTimeData.inspectionsFailed)) * 100)
        : 0}%`, 'N/A', 'Quality', lastUpdate.toISOString()]
    ];

    // Add vendor data
    vendorPerformanceData.forEach(vendor => {
      rows.push([
        `Vendor: ${vendor.name}`,
        vendor.score.toString(),
        `${vendor.score}%`,
        'Vendor Performance',
        lastUpdate.toISOString()
      ]);
    });

    // Add fitting distribution data
    fittingDistributionData.forEach(fitting => {
      rows.push([
        `Fitting: ${fitting.name}`,
        fitting.count.toString(),
        `${fitting.value}%`,
        'Parts Distribution',
        lastUpdate.toISOString()
      ]);
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadAllReports = async () => {
    try {
      console.log('Downloading all reports...');
      
      // Create a comprehensive report with all data
      const allReportsData = {
        exportInfo: {
          exportedAt: new Date().toISOString(),
          totalReports: filteredReports.length,
          exportedBy: 'Railway Parts Management System',
          version: '1.0'
        },
        reports: filteredReports.map(report => ({
          ...report,
          generatedAt: report.generatedAt.toISOString()
        })),
        realTimeData: {
          ...realTimeData,
          lastUpdate: realTimeData.lastUpdate.toISOString()
        },
        monthlyData: monthlyData.map(month => ({
          ...month
        })),
        vendorPerformance: vendorPerformanceData,
        fittingDistribution: fittingDistributionData,
        metrics: metrics,
        inspectionTrends: monthlyData.length > 0 ? monthlyData : inspectionData
      };

      const content = JSON.stringify(allReportsData, null, 2);
      const fileName = `Railway_Parts_All_Reports_${new Date().toISOString().split('T')[0]}.json`;
      
      const blob = new Blob([content], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('All reports downloaded successfully:', fileName);
    } catch (error) {
      console.error('Error downloading all reports:', error);
      alert('Failed to download all reports. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="success" size="sm">Ready</Badge>;
      case 'generating':
        return <Badge variant="warning" size="sm">Generating</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary': return <FileText className="h-4 w-4" />;
      case 'detailed': return <BarChart3 className="h-4 w-4" />;
      case 'analytics': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    return selectedCategory === 'all' || report.category === selectedCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">Generate and download comprehensive reports</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()} | 
            Real-time data: {realTimeData.totalTransactions} transactions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            loadReports();
            loadMonthlyData();
            setLastUpdate(new Date());
          }}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Transactions"
          value={realTimeData.totalTransactions}
          subtitle="All blockchain events"
          icon={<Activity className="h-6 w-6" />}
        />
        <StatsCard
          title="Inspections Passed"
          value={realTimeData.inspectionsPassed}
          subtitle={`${realTimeData.inspectionsFailed} failed, ${realTimeData.inspectionsPending} pending`}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="Parts Registered"
          value={realTimeData.partsRegistered}
          subtitle={`${realTimeData.partsInstalled} installed, ${realTimeData.partsRetired} retired`}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatsCard
          title="Active Vendors"
          value={realTimeData.vendorsActive}
          subtitle="Currently supplying parts"
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Reports"
          value={metrics.totalReports}
          subtitle="All generated reports"
          icon={<FileText className="h-6 w-6" />}
        />
        <StatsCard
          title="Ready"
          value={metrics.readyReports}
          subtitle="Available for download"
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title="Generating"
          value={metrics.generatingReports}
          subtitle="In progress"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatsCard
          title="Failed"
          value={metrics.failedReports}
          subtitle="Require attention"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Generate New Report</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue="summary"
              >
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="analytics">Analytics Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="inspections">Inspections</option>
                <option value="vendors">Vendors</option>
                <option value="blockchain">Blockchain</option>
                <option value="quality">Quality Control</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => generateReport('summary', selectedCategory)}
              loading={isGenerating}
              leftIcon={<FileText className="h-4 w-4" />}
            >
              Generate Summary Report
            </Button>
            <Button
              onClick={() => generateReport('detailed', selectedCategory)}
              loading={isGenerating}
              leftIcon={<BarChart3 className="h-4 w-4" />}
              variant="outline"
            >
              Generate Detailed Report
            </Button>
            <Button
              onClick={() => generateReport('analytics', selectedCategory)}
              loading={isGenerating}
              leftIcon={<TrendingUp className="h-4 w-4" />}
              variant="outline"
            >
              Generate Analytics Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Inspection Trends</h3>
            <p className="text-sm text-gray-500">Real-time inspection data over time</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData.length > 0 ? monthlyData : inspectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                  <Area type="monotone" dataKey="passed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Passed" />
                  <Area type="monotone" dataKey="failed" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Failed" />
                  <Area type="monotone" dataKey="pending" stackId="3" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Parts Lifecycle</h3>
            <p className="text-sm text-gray-500">Parts registered, installed, and retired</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData.length > 0 ? monthlyData : inspectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="registered" stroke="#3B82F6" strokeWidth={2} name="Registered" />
                  <Line type="monotone" dataKey="installed" stroke="#10B981" strokeWidth={2} name="Installed" />
                  <Line type="monotone" dataKey="retired" stroke="#EF4444" strokeWidth={2} name="Retired" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Fitting Distribution</h3>
            <p className="text-sm text-gray-500">Types of railway parts in the system</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={fittingDistributionData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {fittingDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
            <p className="text-sm text-gray-500">Current system activity overview</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Transactions</span>
                <span className="text-lg font-bold text-blue-600">{realTimeData.totalTransactions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active Vendors</span>
                <span className="text-lg font-bold text-green-600">{realTimeData.vendorsActive}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Parts in System</span>
                <span className="text-lg font-bold text-purple-600">{realTimeData.partsRegistered - realTimeData.partsRetired}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <span className="text-lg font-bold text-orange-600">
                  {realTimeData.inspectionsPassed + realTimeData.inspectionsFailed > 0 
                    ? Math.round((realTimeData.inspectionsPassed / (realTimeData.inspectionsPassed + realTimeData.inspectionsFailed)) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Performance */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Vendor Performance</h3>
          <p className="text-sm text-gray-500">Performance scores, deliveries, and quality metrics</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vendorPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="score" fill="#3B82F6" name="Performance Score" />
              <Bar yAxisId="right" dataKey="deliveries" fill="#10B981" name="Deliveries" />
              <Bar yAxisId="right" dataKey="parts" fill="#F59E0B" name="Total Parts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vendor Quality Analysis */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Vendor Quality Analysis</h3>
          <p className="text-sm text-gray-500">Detailed quality metrics and defect rates</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendorPerformanceData.map((vendor, index) => (
              <div key={`${vendor.name}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{vendor.name}</h4>
                    <Badge 
                      variant={vendor.score >= 90 ? 'success' : vendor.score >= 80 ? 'warning' : 'error'}
                      size="sm"
                    >
                      {vendor.quality}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Score:</span>
                      <span className="ml-2 font-medium">{vendor.score}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Defects:</span>
                      <span className="ml-2 font-medium">{vendor.defects}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Deliveries:</span>
                      <span className="ml-2 font-medium">{vendor.deliveries}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Parts:</span>
                      <span className="ml-2 font-medium">{vendor.parts}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
              <p className="text-sm text-gray-500 mt-1">Download individual reports or export all data</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info">{filteredReports.length} reports</Badge>
              {filteredReports.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadAllReports}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Download All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="capitalize">{report.category}</span>
                        <span>•</span>
                        <span>{report.period}</span>
                        <span>•</span>
                        <span>{report.generatedAt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(report.status)}
                    {report.status === 'ready' && (
                      <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report)}
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        Download
                      </Button>
                        <div className="text-xs text-gray-500">
                          {report.type === 'summary' ? 'TXT' : report.type === 'detailed' ? 'JSON' : 'CSV'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No reports found</p>
              <p className="text-sm text-gray-400">
                Generate your first report to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
