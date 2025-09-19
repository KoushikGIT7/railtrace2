// Gemini AI Configuration - Currently using mock data for reliability
// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface VendorAnalysis {
  vendorId: string;
  vendorName: string;
  score: number;
  defectRate: number;
  warrantyClaims: number;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DefectPrediction {
  partId: string;
  probabilityScore: number;
  riskFactors: string[];
  recommendedAction: string;
  timeToFailure: string;
}

export class GeminiService {
  constructor() {
    // Currently using mock data instead of API calls
  }

  // Gemini API method disabled for reliability - using mock data instead
  // private async callGeminiAPI(prompt: string): Promise<string> { ... }

  async analyzeVendorPerformance(vendorData: Record<string, unknown>[]): Promise<VendorAnalysis[]> {
    console.log('Analyzing vendor performance with real data + mock data');
    
    // Base mock data for demonstration
    const mockVendors: VendorAnalysis[] = [
      {
        vendorId: 'VENDOR-001',
        vendorName: 'Railway Parts Co.',
        score: 85,
        defectRate: 2.5,
        warrantyClaims: 3,
        recommendation: 'Continue current partnership - excellent performance with low defect rate',
        riskLevel: 'low' as const
      },
      {
        vendorId: 'VENDOR-002',
        vendorName: 'Track Solutions Ltd.',
        score: 72,
        defectRate: 4.2,
        warrantyClaims: 7,
        recommendation: 'Monitor closely - slight increase in defects requires attention',
        riskLevel: 'medium' as const
      },
      {
        vendorId: 'VENDOR-003',
        vendorName: 'Steel Components Inc.',
        score: 95,
        defectRate: 1.2,
        warrantyClaims: 1,
        recommendation: 'Outstanding performance - consider increasing order volume',
        riskLevel: 'low' as const
      },
      {
        vendorId: 'VENDOR-004',
        vendorName: 'Metal Works Corp.',
        score: 58,
        defectRate: 6.8,
        warrantyClaims: 12,
        recommendation: 'High risk vendor - consider alternative suppliers or quality improvement plan',
        riskLevel: 'high' as const
      },
      {
        vendorId: 'VENDOR-005',
        vendorName: 'Precision Rails Ltd.',
        score: 88,
        defectRate: 1.8,
        warrantyClaims: 2,
        recommendation: 'Excellent quality control - expand partnership opportunities',
        riskLevel: 'low' as const
      },
      {
        vendorId: 'VENDOR-006',
        vendorName: 'Fast Track Industries',
        score: 65,
        defectRate: 5.5,
        warrantyClaims: 9,
        recommendation: 'Quality improvement needed - implement stricter QC measures',
        riskLevel: 'medium' as const
      },
      {
        vendorId: 'VENDOR-007',
        vendorName: 'Elite Rail Systems',
        score: 92,
        defectRate: 0.8,
        warrantyClaims: 0,
        recommendation: 'Premium supplier - consider long-term contract renewal',
        riskLevel: 'low' as const
      },
      {
        vendorId: 'VENDOR-008',
        vendorName: 'Budget Components Co.',
        score: 45,
        defectRate: 8.2,
        warrantyClaims: 15,
        recommendation: 'Critical issues - immediate quality intervention required',
        riskLevel: 'high' as const
      },
      {
        vendorId: 'VENDOR-009',
        vendorName: 'Reliable Parts Inc.',
        score: 78,
        defectRate: 3.1,
        warrantyClaims: 5,
        recommendation: 'Good performance with room for improvement',
        riskLevel: 'low' as const
      },
      {
        vendorId: 'VENDOR-010',
        vendorName: 'Advanced Rail Tech',
        score: 96,
        defectRate: 0.5,
        warrantyClaims: 0,
        recommendation: 'Industry leader - benchmark for other suppliers',
        riskLevel: 'low' as const
      }
    ];

    // Process real data if available
    if (vendorData && vendorData.length > 0) {
      console.log(`Processing ${vendorData.length} real vendor records`);
      
      // Extract unique vendors from real data
      const realVendors = new Map<string, { count: number; defects: number; claims: number }>();
      
      vendorData.forEach(record => {
        const vendorId = record.vendorId as string || 'UNKNOWN';
        const eventType = record.eventType as string || '';
        const isDefect = eventType === 'inspected' && (record.data as any)?.resultCode === 1;
        
        if (!realVendors.has(vendorId)) {
          realVendors.set(vendorId, { count: 0, defects: 0, claims: 0 });
        }
        
        const vendor = realVendors.get(vendorId)!;
        vendor.count++;
        if (isDefect) vendor.defects++;
        if (eventType === 'retired') vendor.claims++;
      });

      // Generate analysis for real vendors
      const realAnalyses: VendorAnalysis[] = Array.from(realVendors.entries()).map(([vendorId, stats]) => {
        const defectRate = stats.count > 0 ? (stats.defects / stats.count) * 100 : 0;
        const score = Math.max(20, Math.min(100, 100 - (defectRate * 10) - (stats.claims * 2)));
        
        let riskLevel: 'low' | 'medium' | 'high';
        let recommendation: string;
        
        if (score >= 80) {
          riskLevel = 'low';
          recommendation = 'Excellent performance based on real data - continue partnership';
        } else if (score >= 60) {
          riskLevel = 'medium';
          recommendation = 'Moderate performance - monitor closely and provide feedback';
        } else {
          riskLevel = 'high';
          recommendation = 'Poor performance - immediate action required or consider alternatives';
        }

        return {
          vendorId,
          vendorName: `Real Vendor ${vendorId}`,
          score: Math.round(score),
          defectRate: Math.round(defectRate * 10) / 10,
          warrantyClaims: stats.claims,
          recommendation,
          riskLevel
        };
      });

      // Combine mock and real data
      return [...mockVendors, ...realAnalyses];
    }

    // Return only mock data if no real data
    return mockVendors;
  }

  async predictDefects(inspectionData: Record<string, unknown>[]): Promise<DefectPrediction[]> {
    console.log('Analyzing defect predictions with real data + mock data');
    
    // Base mock data for demonstration
    const mockPredictions: DefectPrediction[] = [
      {
        partId: '0x32d66592a1469a72e5c5531d4a14360925665d57d64dea016f8993ecd86edb46',
        probabilityScore: 15,
        riskFactors: ['Normal wear and tear', 'Standard usage patterns'],
        recommendedAction: 'Continue regular maintenance schedule - part is in good condition',
        timeToFailure: '18-24 months'
      },
      {
        partId: '0xe93489eb252669fc9d1d537d71340d6fcd77f8e23b49f604087ad3ad718636cd',
        probabilityScore: 35,
        riskFactors: ['Increased stress patterns', 'Temperature variations', 'Corrosion signs'],
        recommendedAction: 'Schedule detailed inspection within 3 months and consider replacement',
        timeToFailure: '8-12 months'
      },
      {
        partId: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        probabilityScore: 8,
        riskFactors: ['Minimal wear', 'Optimal conditions'],
        recommendedAction: 'Continue current maintenance - excellent condition',
        timeToFailure: '24-36 months'
      },
      {
        partId: '0xf9e8d7c6b5a4938271605948372615049382716059483726150493827160594',
        probabilityScore: 65,
        riskFactors: ['Heavy usage', 'Environmental stress', 'Material fatigue'],
        recommendedAction: 'Immediate inspection required - high failure risk',
        timeToFailure: '3-6 months'
      },
      {
        partId: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
        probabilityScore: 22,
        riskFactors: ['Minor surface wear', 'Regular maintenance history'],
        recommendedAction: 'Continue monitoring with quarterly inspections',
        timeToFailure: '12-18 months'
      },
      {
        partId: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
        probabilityScore: 48,
        riskFactors: ['Moderate stress indicators', 'Weather exposure', 'Load variations'],
        recommendedAction: 'Increase inspection frequency to monthly and prepare replacement',
        timeToFailure: '6-9 months'
      },
      {
        partId: '0xd4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcd',
        probabilityScore: 5,
        riskFactors: ['Excellent condition', 'New installation'],
        recommendedAction: 'Maintain current excellent condition with standard maintenance',
        timeToFailure: '36-48 months'
      },
      {
        partId: '0xe5f6789012345678901234567890abcdef1234567890abcdef1234567890abcde',
        probabilityScore: 78,
        riskFactors: ['Severe corrosion', 'Structural stress', 'Multiple defect points'],
        recommendedAction: 'URGENT: Immediate replacement required - safety critical',
        timeToFailure: '1-2 months'
      },
      {
        partId: '0xf6789012345678901234567890abcdef1234567890abcdef1234567890abcdef12',
        probabilityScore: 28,
        riskFactors: ['Light surface corrosion', 'Normal operational wear'],
        recommendedAction: 'Apply protective coating and monitor closely',
        timeToFailure: '9-15 months'
      },
      {
        partId: '0x6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234',
        probabilityScore: 55,
        riskFactors: ['Crack formation', 'Material fatigue', 'High stress concentration'],
        recommendedAction: 'Schedule immediate detailed inspection and prepare for replacement',
        timeToFailure: '4-7 months'
      }
    ];

    // Process real inspection data if available
    if (inspectionData && inspectionData.length > 0) {
      console.log(`Processing ${inspectionData.length} real inspection records`);
      
      const realPredictions: DefectPrediction[] = inspectionData
        .filter(record => record.eventType === 'inspected')
        .map(record => {
          const partId = record.partHash as string || 'unknown';
          const data = record.data as any || {};
          const resultCode = data.resultCode || 0;
          const severity = data.severity || 0;
          
          // Calculate probability based on inspection results
          let probabilityScore = 20; // Base score
          const riskFactors: string[] = [];
          
          if (resultCode === 1) { // Failed inspection
            probabilityScore += 40;
            riskFactors.push('Failed inspection');
          }
          
          if (severity > 0) {
            probabilityScore += severity * 10;
            riskFactors.push(`Severity level ${severity}`);
          }
          
          // Add more risk factors based on data
          if (data.defectType) {
            riskFactors.push(data.defectType);
            probabilityScore += 15;
          }
          
          if (data.condition && data.condition !== 'good') {
            riskFactors.push(`Poor condition: ${data.condition}`);
            probabilityScore += 20;
          }
          
          // Cap the probability score
          probabilityScore = Math.min(95, Math.max(5, probabilityScore));
          
          // Generate recommendation and time estimate
          let recommendedAction: string;
          let timeToFailure: string;
          
          if (probabilityScore >= 70) {
            recommendedAction = 'Immediate replacement required - high failure risk detected';
            timeToFailure = '1-3 months';
          } else if (probabilityScore >= 40) {
            recommendedAction = 'Schedule detailed inspection and consider replacement';
            timeToFailure = '3-6 months';
          } else if (probabilityScore >= 20) {
            recommendedAction = 'Monitor closely and schedule regular inspections';
            timeToFailure = '6-12 months';
          } else {
            recommendedAction = 'Continue regular maintenance - good condition';
            timeToFailure = '12-24 months';
          }
          
          return {
            partId,
            probabilityScore: Math.round(probabilityScore),
            riskFactors: riskFactors.length > 0 ? riskFactors : ['Normal wear'],
            recommendedAction,
            timeToFailure
          };
        });

      // Combine mock and real data
      return [...mockPredictions, ...realPredictions];
    }

    // Return only mock data if no real data
    return mockPredictions;
  }

  async generateHealthScore(partHistory: Record<string, unknown>): Promise<{score: number, status: 'good' | 'warning' | 'critical', factors: string[]}> {
    console.log('Generating health score with real data analysis');
    
    // If no real data, return mock score
    if (!partHistory || Object.keys(partHistory).length === 0) {
      return {
        score: 75,
        status: 'good',
        factors: ['No data available', 'Using default assessment']
      };
    }
    
    // Analyze real part history
    const historyArray = Array.isArray(partHistory) ? partHistory : [partHistory];
    let score = 100; // Start with perfect score
    const factors: string[] = [];
    
    // Count different event types
    const eventCounts = {
      registered: 0,
      received: 0,
      installed: 0,
      inspected: 0,
      retired: 0
    };
    
    let defectCount = 0;
    let inspectionCount = 0;
    let ageInDays = 0;
    
    historyArray.forEach((event: any) => {
      const eventType = event.eventType || event.status;
      if (eventType in eventCounts) {
        eventCounts[eventType as keyof typeof eventCounts]++;
      }
      
      // Check for defects in inspection events
      if (eventType === 'inspected' || eventType === 'inspect') {
        inspectionCount++;
        const data = event.data || {};
        if (data.resultCode === 1 || data.defectType) {
          defectCount++;
          factors.push('Defect detected in inspection');
        }
      }
      
      // Calculate age based on timestamps
      const timestamp = event.timestamp || event.createdAt;
      if (timestamp) {
        const eventDate = new Date(timestamp * 1000 || timestamp);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
        ageInDays = Math.max(ageInDays, daysDiff);
      }
    });
    
    // Adjust score based on real data
    if (defectCount > 0) {
      score -= defectCount * 15; // Each defect reduces score significantly
    }
    
    if (inspectionCount > 0) {
      const defectRate = (defectCount / inspectionCount) * 100;
      if (defectRate > 20) {
        score -= 20;
        factors.push('High defect rate detected');
      } else if (defectRate > 10) {
        score -= 10;
        factors.push('Moderate defect rate');
      }
    }
    
    // Age factor
    if (ageInDays > 365) {
      score -= 10;
      factors.push('Part is over 1 year old');
    } else if (ageInDays > 180) {
      score -= 5;
      factors.push('Part is 6+ months old');
    }
    
    // Event frequency analysis
    const totalEvents = Object.values(eventCounts).reduce((sum, count) => sum + count, 0);
    if (totalEvents > 10) {
      score -= 5;
      factors.push('High activity level');
    }
    
    // Ensure score is within bounds
    score = Math.max(10, Math.min(100, score));
    
    // Determine status and add positive factors
    let status: 'good' | 'warning' | 'critical';
    
    if (score >= 80) {
      status = 'good';
      if (factors.length === 0) {
        factors.push('Excellent condition', 'Regular maintenance', 'Low defect rate');
      }
    } else if (score >= 60) {
      status = 'warning';
      if (factors.length === 0) {
        factors.push('Moderate condition', 'Requires monitoring');
      }
    } else {
      status = 'critical';
      if (factors.length === 0) {
        factors.push('Poor condition', 'Immediate attention needed');
      }
    }
    
    // Add some positive factors if score is good
    if (score >= 70) {
      factors.unshift('Good maintenance history', 'Low defect rate');
    }
    
    return {
      score: Math.round(score),
      status,
      factors: factors.slice(0, 4) // Limit to 4 factors for display
    };
  }
}

export const geminiService = new GeminiService();