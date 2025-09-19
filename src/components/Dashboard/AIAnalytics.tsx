import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Target,
  Zap,
  RefreshCw
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
  AreaChart,
  Area
} from 'recharts';
import { geminiService, VendorAnalysis, DefectPrediction } from '../../config/gemini';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  category: string;
  timestamp: Date;
}

interface PredictiveAnalysis {
  fittingId: string;
  riskScore: number;
  predictedFailureDate: string;
  maintenanceRecommendation: string;
  confidence: number;
  id?: string;
}

export function AIAnalytics() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictiveData, setPredictiveData] = useState<PredictiveAnalysis[]>([]);
  const [vendorAnalysis, setVendorAnalysis] = useState<VendorAnalysis[]>([]);
  const [defectPredictions, setDefectPredictions] = useState<DefectPrediction[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<{month: string; efficiency: number; defects: number; maintenance: number}[]>([]);
  const [anomalyData, setAnomalyData] = useState<{category: string; count: number; severity: string}[]>([]);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
    setupRealTimeUpdates();
  }, []);

  const setupRealTimeUpdates = () => {
    // Listen to transactions for real-time AI analysis
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          // Ensure proper date handling
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now())
        };
      });
      
      console.log(`Real-time update: ${transactions.length} transactions received`);
      
      // Update real-time data
      setRealTimeData(transactions);
      
      // Always re-analyze with AI for real-time updates
      await analyzeWithAI(transactions);
      
      // Update performance metrics with real data
      updatePerformanceMetrics(transactions);
      
      // Update anomaly detection with real data
      updateAnomalyDetection(transactions);
      
      setLastUpdate(new Date());
    });
    
    return () => unsubscribe();
  };

  const analyzeWithAI = async (transactions: any[]) => {
    try {
      // Analyze vendor performance with Gemini
      const vendorData = transactions.filter(t => t.eventType === 'registered' || t.eventType === 'manufacture');
      if (vendorData.length > 0) {
        const vendorAnalysis = await geminiService.analyzeVendorPerformance(vendorData);
        setVendorAnalysis(vendorAnalysis);
      }

      // Predict defects with Gemini
      const inspectionData = transactions.filter(t => t.eventType === 'inspected');
      if (inspectionData.length > 0) {
        const defectPredictions = await geminiService.predictDefects(inspectionData);
        setDefectPredictions(defectPredictions);
        
        // Convert to predictive analysis format
        const predictiveData: PredictiveAnalysis[] = defectPredictions.map((pred, index) => ({
          fittingId: pred.partId,
          riskScore: pred.probabilityScore,
          predictedFailureDate: pred.timeToFailure,
          maintenanceRecommendation: pred.recommendedAction,
          confidence: pred.probabilityScore,
          id: `${pred.partId}-${index}-${pred.probabilityScore}` // Add unique ID
        }));
        setPredictiveData(predictiveData);
      }

      // Generate AI insights
      const insights = await generateAIInsights(transactions, vendorAnalysis, defectPredictions);
      setInsights(insights);

      // Update performance metrics
      updatePerformanceMetrics(transactions);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error in AI analysis:', error);
    }
  };

  const generateAIInsights = async (transactions: any[], vendorAnalysis: VendorAnalysis[], defectPredictions: DefectPrediction[]): Promise<AIInsight[]> => {
    const insights: AIInsight[] = [];

    // High risk fittings
    defectPredictions.filter(p => p.probabilityScore > 80).forEach(pred => {
      insights.push({
        id: `risk-${pred.partId}`,
        type: 'prediction',
        title: 'High Risk Fitting Detected',
        description: `Fitting ${pred.partId} shows ${pred.probabilityScore}% failure probability. ${pred.recommendedAction}`,
        confidence: pred.probabilityScore,
        severity: 'high',
        category: 'Predictive Maintenance',
        timestamp: new Date()
      });
    });

    // Vendor performance issues
    vendorAnalysis.filter(v => v.riskLevel === 'high' || v.score < 60).forEach(vendor => {
      insights.push({
        id: `vendor-${vendor.vendorId}`,
        type: 'recommendation',
        title: 'Vendor Performance Alert',
        description: `${vendor.vendorName} shows ${vendor.riskLevel} risk with ${vendor.score}% score. ${vendor.recommendation}`,
        confidence: 85,
        severity: vendor.riskLevel === 'high' ? 'high' : 'medium',
        category: 'Vendor Management',
        timestamp: new Date()
      });
    });

    // Pattern analysis
    const recentTransactions = transactions.slice(0, 20);
    const eventCounts = recentTransactions.reduce((acc, t) => {
      acc[t.eventType] = (acc[t.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (eventCounts.failed > 5) {
      insights.push({
        id: 'pattern-failures',
        type: 'anomaly',
        title: 'High Failure Rate Detected',
        description: `Recent activity shows ${eventCounts.failed} failures. Investigate quality control processes.`,
        confidence: 90,
        severity: 'high',
        category: 'Pattern Analysis',
        timestamp: new Date()
      });
    }

    return insights.slice(0, 10); // Limit to 10 most recent insights
  };

  const updatePerformanceMetrics = (transactions: any[]) => {
    // Group by month and calculate metrics
    const monthlyData = transactions.reduce((acc, t) => {
      const date = t.createdAt?.toDate ? t.createdAt.toDate() : (t.createdAt ? new Date(t.createdAt) : new Date());
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { efficiency: 0, defects: 0, maintenance: 0, total: 0, inspections: 0, passed: 0 };
      }
      acc[month].total++;
      
      // Calculate efficiency based on inspection results
      if (t.eventType === 'inspected') {
        acc[month].inspections++;
        if (t.metadata?.resultCode === 0) { // Pass
          acc[month].passed++;
        }
        if (t.metadata?.resultCode === 1) { // Fail
          acc[month].defects++;
        }
      }
      
      if (t.eventType === 'retired') acc[month].defects++;
      if (t.eventType === 'installed') acc[month].maintenance++;
      
      return acc;
    }, {} as Record<string, any>);

    const performanceData = Object.entries(monthlyData).map(([month, data]) => {
      const typedData = data as { efficiency: number; defects: number; maintenance: number; total: number; inspections: number; passed: number };
      const efficiency = typedData.inspections > 0 ? (typedData.passed / typedData.inspections) * 100 : 85; // Default 85% if no inspections
      return {
        month,
        efficiency: Math.min(100, Math.max(0, efficiency)),
        defects: typedData.defects,
        maintenance: typedData.maintenance
      };
    });

    // Sort by month order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    performanceData.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    setPerformanceMetrics(performanceData);

    // Update anomaly data
    const anomalyCounts = {
      'Installation': transactions.filter(t => t.eventType === 'install').length,
      'Inspection': transactions.filter(t => t.eventType === 'inspected').length,
      'Maintenance': transactions.filter(t => t.eventType === 'retire').length,
      'Quality': transactions.filter(t => t.status === 'failed').length
    };

    const anomalyData = Object.entries(anomalyCounts).map(([category, count]) => ({
      category,
      count,
      severity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low'
    }));

    setAnomalyData(anomalyData);
  };

  const updateAnomalyDetection = (transactions: any[]) => {
    // Analyze transactions for anomalies
    const anomalyCounts = {
      'Material Defects': transactions.filter(t => t.eventType === 'inspected' && t.data?.resultCode === 1).length,
      'Installation Errors': transactions.filter(t => t.eventType === 'install' && t.data?.condition !== 'good').length,
      'Environmental Damage': transactions.filter(t => t.eventType === 'retired' && t.data?.reason?.includes('weather')).length,
      'Wear Patterns': transactions.filter(t => t.eventType === 'inspected' && t.data?.defectType?.includes('wear')).length,
      'Corrosion Issues': transactions.filter(t => t.eventType === 'inspected' && t.data?.defectType?.includes('corrosion')).length,
      'Stress Fractures': transactions.filter(t => t.eventType === 'inspected' && t.data?.defectType?.includes('crack')).length,
      'Alignment Problems': transactions.filter(t => t.eventType === 'inspected' && t.data?.defectType?.includes('alignment')).length,
      'Lubrication Issues': transactions.filter(t => t.eventType === 'inspected' && t.data?.defectType?.includes('lubrication')).length
    };

    const anomalyData = Object.entries(anomalyCounts).map(([category, count]) => ({
      category,
      count,
      severity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low'
    }));

    setAnomalyData(anomalyData);
  };

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load recent transactions for initial analysis
      const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => doc.data());
      
      // Load comprehensive mock data for demonstration
      await loadMockData();
      
      // Analyze real data if available
      if (transactions.length > 0) {
        await analyzeWithAI(transactions);
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Load mock data even if real data fails
      await loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = async () => {
    // Load comprehensive mock insights
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'prediction',
        title: 'High Failure Risk Detected',
        description: '3 parts showing signs of material fatigue requiring immediate attention',
        confidence: 92,
        severity: 'high',
        category: 'Predictive Maintenance',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'anomaly',
        title: 'Unusual Defect Pattern',
        description: 'Defect rate increased by 15% in the last week compared to historical average',
        confidence: 87,
        severity: 'medium',
        category: 'Quality Control',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '3',
        type: 'recommendation',
        title: 'Vendor Performance Optimization',
        description: 'Consider increasing orders from Elite Rail Systems due to excellent performance',
        confidence: 95,
        severity: 'low',
        category: 'Supply Chain',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: '4',
        type: 'trend',
        title: 'Maintenance Efficiency Improving',
        description: 'Predictive maintenance accuracy has improved by 23% this month',
        confidence: 89,
        severity: 'low',
        category: 'Operations',
        timestamp: new Date(Date.now() - 10800000)
      },
      {
        id: '5',
        type: 'prediction',
        title: 'Weather Impact Alert',
        description: 'Heavy rain forecast may accelerate corrosion in outdoor components',
        confidence: 78,
        severity: 'medium',
        category: 'Environmental',
        timestamp: new Date(Date.now() - 14400000)
      }
    ];
    setInsights(mockInsights);

    // Load comprehensive mock performance metrics
    const mockPerformanceMetrics = [
      { month: 'Jan', efficiency: 85, defects: 12, maintenance: 8 },
      { month: 'Feb', efficiency: 88, defects: 10, maintenance: 6 },
      { month: 'Mar', efficiency: 92, defects: 8, maintenance: 5 },
      { month: 'Apr', efficiency: 89, defects: 11, maintenance: 7 },
      { month: 'May', efficiency: 94, defects: 6, maintenance: 4 },
      { month: 'Jun', efficiency: 91, defects: 9, maintenance: 6 },
      { month: 'Jul', efficiency: 87, defects: 13, maintenance: 9 },
      { month: 'Aug', efficiency: 90, defects: 7, maintenance: 5 },
      { month: 'Sep', efficiency: 93, defects: 5, maintenance: 3 },
      { month: 'Oct', efficiency: 96, defects: 4, maintenance: 2 },
      { month: 'Nov', efficiency: 94, defects: 6, maintenance: 4 },
      { month: 'Dec', efficiency: 97, defects: 3, maintenance: 1 }
    ];
    setPerformanceMetrics(mockPerformanceMetrics);

    // Load comprehensive mock anomaly data
    const mockAnomalyData = [
      { category: 'Material Defects', count: 8, severity: 'medium' },
      { category: 'Installation Errors', count: 3, severity: 'low' },
      { category: 'Environmental Damage', count: 12, severity: 'high' },
      { category: 'Wear Patterns', count: 15, severity: 'medium' },
      { category: 'Corrosion Issues', count: 6, severity: 'low' },
      { category: 'Stress Fractures', count: 4, severity: 'high' },
      { category: 'Alignment Problems', count: 9, severity: 'medium' },
      { category: 'Lubrication Issues', count: 2, severity: 'low' }
    ];
    setAnomalyData(mockAnomalyData);

    // Load AI analysis data
    await analyzeWithAI([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Target className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation': return <CheckCircle className="h-4 w-4" />;
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Advanced AI-powered insights and predictive analytics</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()} | 
            Real-time data: {realTimeData.length} transactions
          </p>
        </div>
        <Button 
          onClick={loadAnalyticsData} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="AI Insights"
          value={insights.length}
          subtitle="Active recommendations"
          icon={<Brain className="h-6 w-6" />}
        />
        <StatsCard
          title="High Risk Items"
          value={predictiveData.filter(p => p.riskScore > 80).length}
          subtitle="Require attention"
          icon={<AlertTriangle className="h-6 w-6" />}
        />
        <StatsCard
          title="Predictive Accuracy"
          value="94%"
          subtitle="Model confidence"
          icon={<Target className="h-6 w-6" />}
        />
        <StatsCard
          title="Anomalies Detected"
          value={anomalyData.reduce((sum, item) => sum + item.count, 0)}
          subtitle="This month"
          icon={<Activity className="h-6 w-6" />}
        />
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="hidden sm:inline">AI Insights & Recommendations</span>
              <span className="sm:hidden">AI Insights</span>
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadAnalyticsData} leftIcon={<RefreshCw className="h-4 w-4" />}>
                <span className="hidden sm:inline">Refresh Analysis</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Analyzing data with AI...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {getInsightIcon(insight.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <h4 className="font-medium text-gray-900 truncate">{insight.title}</h4>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Badge variant={getSeverityColor(insight.severity)} size="sm">
                          {insight.severity}
                        </Badge>
                        <span className="text-sm text-gray-500 whitespace-nowrap">{insight.confidence}% confidence</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 break-words">{insight.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs text-gray-500">{insight.category}</span>
                      <span className="text-xs text-gray-500">
                        {insight.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Analysis */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Predictive Maintenance</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictiveData.map((item, index) => (
                <div key={item.id || `${item.fittingId}-${index}-${item.riskScore}`} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <span className="font-medium text-gray-900 truncate">{item.fittingId}</span>
                    <Badge 
                      variant={item.riskScore > 80 ? 'error' : item.riskScore > 60 ? 'warning' : 'success'}
                      size="sm"
                      className="self-start sm:self-auto"
                    >
                      {item.riskScore}% risk
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 break-words">{item.maintenanceRecommendation}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1">
                    <span className="break-words">Predicted failure: {item.predictedFailureDate}</span>
                    <span className="whitespace-nowrap">{item.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="efficiency" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="defects" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Anomaly Detection</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {anomalyData.map((item, index) => (
              <div key={`${item.category}-${index}-${item.count}`} className="p-4 border border-gray-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{item.count}</div>
                <div className="text-sm text-gray-600 mb-2">{item.category}</div>
                <Badge variant={getSeverityColor(item.severity)} size="sm">
                  {item.severity} severity
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
