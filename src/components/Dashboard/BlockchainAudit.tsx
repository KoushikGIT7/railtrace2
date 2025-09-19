import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Hash,
  Package,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { StatsCard } from './StatsCard';
import { Skeleton } from '../ui/Skeleton';
import { blockchainService } from '../../services/blockchainService';
import { ethers } from 'ethers';
import { collection, query, where, getDocs, orderBy, doc, setDoc, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface BlockchainRecord {
  id: string;
  transactionHash: string;
  fittingId: string;
  eventType: 'manufacture' | 'receive' | 'install' | 'inspect' | 'retire';
  timestamp: Date;
  data: Record<string, unknown>;
  verificationStatus: 'confirmed' | 'pending' | 'failed';
  blockNumber?: number;
  gasUsed?: number;
  fromAddress?: string;
  toAddress?: string;
}

interface AuditSummary {
  totalTransactions: number;
  confirmedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  totalGasUsed: number;
  lastBlockMined?: Date;
}

export function BlockchainAudit() {
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [summary, setSummary] = useState<AuditSummary>({
    totalTransactions: 0,
    confirmedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    totalGasUsed: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTxEnriching, setIsTxEnriching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all'|'confirmed'|'pending'|'failed'>('all');
  const [recentRecords, setRecentRecords] = useState<BlockchainRecord[]>([]);
  const [partHashInput, setPartHashInput] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Clear any previous state on refresh
    setPartHashInput('');
    setRecords([]);
    setSummary({
      totalTransactions: 0,
      confirmedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
      totalGasUsed: 0
    });
    setIsLoading(false);
    loadRecentTransactions();
    
    // Set up real-time listener for transaction updates
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: BlockchainRecord[] = [];
      snapshot.forEach((d, idx) => {
        const v = d.data() as any;
        items.push({
          id: `recent-${v.partHash || 'unknown'}-${v.eventType || 'manufacture'}-${idx}-${Date.now()}`,
          transactionHash: v.transactionHash || '',
          fittingId: v.partHash || 'unknown',
          eventType: (v.eventType || 'manufacture') as BlockchainRecord['eventType'],
          timestamp: v.createdAt?.toDate ? v.createdAt.toDate() : (v.timestamp?.toDate ? v.timestamp.toDate() : new Date()),
          data: v.metadata || {},
          verificationStatus: (v.status || 'confirmed') as BlockchainRecord['verificationStatus'],
          blockNumber: v.blockNumber
        });
      });
      setRecentRecords(items);
      
      // Update summary stats in real-time
      const total = items.length;
      const confirmed = items.filter(i => i.verificationStatus === 'confirmed').length;
      const pending = items.filter(i => i.verificationStatus === 'pending').length;
      const failed = items.filter(i => i.verificationStatus === 'failed').length;
      
      setSummary(prev => ({
        ...prev,
        totalTransactions: total,
        confirmedTransactions: confirmed,
        pendingTransactions: pending,
        failedTransactions: failed
      }));
    });
    
    return () => unsubscribe();
  }, []);

  const mapEventType = (e: string): BlockchainRecord['eventType'] => {
    if (e === 'registered') return 'manufacture';
    if (e === 'received') return 'receive';
    if (e === 'installed') return 'install';
    if (e === 'inspected') return 'inspect';
    if (e === 'retired') return 'retire';
    return 'manufacture';
  };

  const loadTxHashesForPart = async (partHash: string, expectedCounts?: Partial<Record<'registered'|'received'|'installed'|'inspected'|'retired', number>>, options?: { windowSize?: number; maxWindows?: number }): Promise<Record<string, string[]>> => {
    const rpc = (import.meta as { env?: { VITE_BLOCKCHAIN_RPC_URL?: string } }).env?.VITE_BLOCKCHAIN_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
    const contractAddress = (import.meta as { env?: { VITE_CONTRACT_ADDRESS?: string } }).env?.VITE_CONTRACT_ADDRESS || '';
    if (!contractAddress) return {};

    const provider = new ethers.JsonRpcProvider(rpc);
    const iface = new ethers.Interface([
      'event Registered(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Received(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Installed(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Inspected(bytes32 indexed partHash, string metadata, uint256 timestamp)',
      'event Retired(bytes32 indexed partHash, string metadata, uint256 timestamp)'
    ]);

    const topicsBy = (sig: string) => [iface.getEvent(sig)!.topicHash, partHash];

    const filters = [
      { key: 'registered' as const, topics: topicsBy('Registered(bytes32,string,uint256)') },
      { key: 'received'   as const, topics: topicsBy('Received(bytes32,string,uint256)') },
      { key: 'installed'  as const, topics: topicsBy('Installed(bytes32,string,uint256)') },
      { key: 'inspected'  as const, topics: topicsBy('Inspected(bytes32,string,uint256)') },
      { key: 'retired'    as const, topics: topicsBy('Retired(bytes32,string,uint256)') },
    ];

    const providerLatest = await provider.getBlockNumber();
    const windowSize = options?.windowSize ?? 1000;
    const maxWindows = options?.maxWindows ?? 6;

    const out: Record<string, string[]> = { registered: [], received: [], installed: [], inspected: [], retired: [] };

    let from = providerLatest - windowSize + 1;
    let to = providerLatest;
    let windows = 0;

    while (windows < maxWindows && to >= 0) {
      await Promise.all(filters.map(async (f) => {
        const need = expectedCounts?.[f.key] ?? Infinity;
        if (out[f.key].length >= need) return;
        try {
          const logs = await provider.getLogs({ address: contractAddress, topics: f.topics as string[], fromBlock: Math.max(0, from), toBlock: to });
          const hashes = logs.map(l => l.transactionHash).reverse();
          out[f.key] = [...hashes, ...out[f.key]];
        } catch {}
      }));
      const allEnough = filters.every(f => (out[f.key].length >= (expectedCounts?.[f.key] ?? Infinity)));
      if (allEnough) break;
      windows += 1;
      to = from - 1;
      from = to - windowSize + 1;
    }

    return out;
  };

  const deepBackfillMissingTx = async (partHash: string, expected: Partial<Record<'registered'|'received'|'installed'|'inspected'|'retired', number>>) => {
    setIsTxEnriching(true);
    try {
      const txMap = await loadTxHashesForPart(partHash, expected, { windowSize: 2000, maxWindows: 40 }); // ~80k blocks
      const q = {
        manufacture: (txMap['registered'] || []).slice(),
        receive: (txMap['received'] || []).slice(),
        install: (txMap['installed'] || []).slice(),
        inspect: (txMap['inspected'] || []).slice(),
        retire: (txMap['retired'] || []).slice(),
      } as Record<BlockchainRecord['eventType'], string[]>;
      setRecords(prev => prev.map(r => ({ ...r, transactionHash: r.transactionHash || q[r.eventType]?.shift() || '' })));
    } finally {
      setIsTxEnriching(false);
    }
  };

  const applyStatusFilter = (items: BlockchainRecord[]) => {
    if (statusFilter === 'all') return items;
    return items.filter(i => i.verificationStatus === statusFilter);
  };

  const mergeWithFirestore = async (partHash: string, items: BlockchainRecord[]) => {
    try {
      const q = query(collection(db, 'transactions'), where('partHash', '==', partHash));
      const snap = await getDocs(q);
      const byEvent = new Map<string, string>(); // eventType->txHash (first match)
      snap.forEach(d => {
        const val = d.data();
        if (val?.eventType && val?.transactionHash && !byEvent.has(val.eventType)) byEvent.set(val.eventType, val.transactionHash);
      });
      return items.map(i => ({
        ...i,
        transactionHash: i.transactionHash || byEvent.get(i.eventType) || ''
      }));
    } catch { return items; }
  };

  const backfillFirestore = async (partHash: string, items: BlockchainRecord[]) => {
    try {
      // Check for existing records to avoid duplicates
      const q = query(collection(db, 'transactions'), where('partHash', '==', partHash));
      const snap = await getDocs(q);
      const existing = new Set<string>();
      snap.forEach(d => { 
        const v = d.data(); 
        if (v?.transactionHash) existing.add(v.transactionHash);
        // Also check by eventType + partHash combination to avoid duplicate events
        if (v?.eventType && v?.partHash) existing.add(`${v.partHash}-${v.eventType}`);
      });
      
      const toCreate = items.filter(i => {
        const txHashExists = i.transactionHash && existing.has(i.transactionHash);
        const eventExists = existing.has(`${partHash}-${i.eventType}`);
        return !txHashExists && !eventExists;
      });
      
      console.log(`Saving ${toCreate.length} new records to Firestore (avoiding ${items.length - toCreate.length} duplicates)`);
      
      if (toCreate.length > 0) {
        await Promise.all(toCreate.map(i => setDoc(doc(db, 'transactions', `${partHash}-${i.eventType}-${Date.now()}`), {
          transactionHash: i.transactionHash,
          partHash,
          eventType: i.eventType,
          status: 'confirmed',
          metadata: i.data || {},
          createdAt: new Date(),
          blockNumber: i.blockNumber
        })));
        console.log('Successfully saved new records to Firestore');
      } else {
        console.log('No new records to save - all data already exists in Firestore');
      }
    } catch (error) {
      console.error('Error saving to Firestore:', error);
    }
  };

  const loadFromChainByPartHash = async (partHash: string) => {
    if (!partHash || !partHash.startsWith('0x') || partHash.length !== 66) return;
    setIsLoading(true);
    setRecords([]); // Clear previous records
    
    try {
      // First, check if we already have this data in Firestore
      console.log('Checking Firestore for existing data for partHash:', partHash);
      const existingQuery = query(collection(db, 'transactions'), where('partHash', '==', partHash));
      const existingSnap = await getDocs(existingQuery);
      
      if (!existingSnap.empty) {
        console.log('Found existing data in Firestore, loading from cache');
        const cachedRecords: BlockchainRecord[] = [];
        existingSnap.forEach((d, idx) => {
          const v = d.data() as any;
          cachedRecords.push({
            id: `cached-${partHash}-${v.eventType}-${idx}-${Date.now()}`,
            transactionHash: v.transactionHash || '',
            fittingId: partHash,
            eventType: mapEventType(v.eventType),
            timestamp: v.createdAt?.toDate ? v.createdAt.toDate() : (v.timestamp?.toDate ? v.timestamp.toDate() : new Date()),
            data: v.metadata || {},
            verificationStatus: (v.status || 'confirmed') as BlockchainRecord['verificationStatus'],
            blockNumber: v.blockNumber || undefined
          });
        });
        
        // Sort by timestamp to maintain chronological order
        cachedRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        setRecords(cachedRecords);
        setSummary({
          totalTransactions: cachedRecords.length,
          confirmedTransactions: cachedRecords.length,
          pendingTransactions: 0,
          failedTransactions: 0,
          totalGasUsed: 0,
          lastBlockMined: new Date()
        });
        setIsLoading(false);
        return; // Exit early if we have cached data
      }

      // If no cached data, fetch from blockchain
      console.log('No cached data found, fetching from blockchain for partHash:', partHash);
      const history = await blockchainService.getPartHistory(partHash);
      console.log('Raw history from blockchain:', history);
      
      if (history.length === 0) {
        console.log('No blockchain history found for this partHash');
        setRecords([]);
        setSummary({
          totalTransactions: 0,
          confirmedTransactions: 0,
          pendingTransactions: 0,
          failedTransactions: 0,
          totalGasUsed: 0
        });
        setIsLoading(false);
        return;
      }
      
      let immediate: BlockchainRecord[] = history.map((h, idx) => ({
        id: `${partHash}-${h.eventType}-${idx}-${Date.now()}`,
        transactionHash: h.transactionHash || '',
        fittingId: partHash,
        eventType: mapEventType(h.eventType),
        timestamp: new Date((h.timestamp || 0) * 1000),
        data: h.data || {},
          verificationStatus: 'confirmed',
        blockNumber: h.blockNumber || undefined
      }));
      
      console.log('Mapped records:', immediate);
      
      // Show blockchain data immediately
      setRecords(immediate);
      setSummary({
        totalTransactions: immediate.length,
        confirmedTransactions: immediate.length,
        pendingTransactions: 0,
        failedTransactions: 0,
        totalGasUsed: 0,
        lastBlockMined: new Date()
      });
      
      setIsLoading(false);

      // Background enrichment for missing transaction hashes
      setIsTxEnriching(true);
      const expected: Partial<Record<'registered'|'received'|'installed'|'inspected'|'retired', number>> = history.reduce((acc, h) => {
        if (h.eventType in acc) acc[h.eventType as keyof typeof acc]! += 1; else acc[h.eventType as keyof typeof acc] = 1; return acc;
      }, {} as any);
      
      console.log('Expected counts:', expected);
      
      const txMap = await loadTxHashesForPart(partHash, expected, { windowSize: 1000, maxWindows: 6 });
      console.log('Transaction map from logs:', txMap);
      
      const qMap = {
        manufacture: (txMap['registered'] || []).slice(),
        receive: (txMap['received'] || []).slice(),
        install: (txMap['installed'] || []).slice(),
        inspect: (txMap['inspected'] || []).slice(),
        retire: (txMap['retired'] || []).slice(),
      } as Record<BlockchainRecord['eventType'], string[]>;

      console.log('Queue map:', qMap);

      // Update records with transaction hashes from logs
      setRecords(prev => {
        const updated = prev.map(r => {
          const txHash = r.transactionHash || qMap[r.eventType]?.shift() || '';
          return { ...r, transactionHash: txHash };
        });
        console.log('Updated records with tx hashes:', updated);
        return updated;
      });

      setIsTxEnriching(false);

      // Save to Firestore only once (avoid duplicates)
      console.log('Saving enriched data to Firestore (one-time save)');
      await backfillFirestore(partHash, immediate);
      
    } catch (error) {
      console.error('Failed to load on-chain history:', error);
      setIsLoading(false);
      setIsTxEnriching(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      // Clear the partHash input and blockchain records
      setPartHashInput('');
      setRecords([]);
      
      const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const items: BlockchainRecord[] = [];
      snap.forEach((d, idx) => {
        const v = d.data() as any;
        items.push({
          id: `recent-${v.partHash || 'unknown'}-${v.eventType || 'manufacture'}-${idx}-${Date.now()}`,
          transactionHash: v.transactionHash || '',
          fittingId: v.partHash || 'unknown',
          eventType: (v.eventType || 'manufacture') as BlockchainRecord['eventType'],
          timestamp: v.createdAt?.toDate ? v.createdAt.toDate() : (v.timestamp?.toDate ? v.timestamp.toDate() : new Date()),
          data: v.metadata || {},
          verificationStatus: (v.status || 'confirmed') as BlockchainRecord['verificationStatus'],
          blockNumber: v.blockNumber
        });
      });
      setRecentRecords(items);
      
      // Update summary stats
      const total = items.length;
      const confirmed = items.filter(i => i.verificationStatus === 'confirmed').length;
      const pending = items.filter(i => i.verificationStatus === 'pending').length;
      const failed = items.filter(i => i.verificationStatus === 'failed').length;
      
      setSummary(prev => ({
        ...prev,
        totalTransactions: total,
        confirmedTransactions: confirmed,
        pendingTransactions: pending,
        failedTransactions: failed
      }));
    } catch (e) {
      console.error('Failed to load recent transactions', e);
      setRecentRecords([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success" size="sm">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'manufacture': return <Package className="h-4 w-4" />;
      case 'receive': return <CheckCircle className="h-4 w-4" />;
      case 'install': return <Shield className="h-4 w-4" />;
      case 'inspect': return <CheckCircle className="h-4 w-4" />;
      case 'retire': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const exportAuditReport = () => {
    const csvContent = [
      ['Transaction Hash', 'Part Hash', 'Event Type', 'Status', 'Timestamp', 'Block Number', 'Gas Used'],
      ...records.map(record => [
        record.transactionHash,
        record.fittingId,
        record.eventType,
        record.verificationStatus,
        record.timestamp.toISOString(),
        record.blockNumber?.toString() || '',
        record.gasUsed?.toString() || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const bscscanTx = (tx: string) => tx ? `https://testnet.bscscan.com/tx/${tx}` : '';

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const isCardExpanded = (cardId: string) => expandedCards.has(cardId);

  const formatDataKey = (key: string): string => {
    const keyMap: { [key: string]: string } = {
      'vendorId': 'Vendor ID',
      'lotId': 'Lot ID',
      'manufactureDate': 'Manufacture Date',
      'specifications': 'Specifications',
      'depotId': 'Depot ID',
      'officerId': 'Officer ID',
      'location': 'Location',
      'condition': 'Condition',
      'gps': 'GPS Coordinates',
      'engineerId': 'Engineer ID',
      'trackSection': 'Track Section',
      'photoHash': 'Photo Hash',
      'inspectorId': 'Inspector ID',
      'resultCode': 'Result Code',
      'defectType': 'Defect Type',
      'severity': 'Severity',
      'mediaHashes': 'Media Hashes',
      'notes': 'Notes',
      'reason': 'Reason',
      'latitude': 'Latitude',
      'longitude': 'Longitude',
      'type': 'Type',
      'material': 'Material'
    };
    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const formatDataValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (value === 0) return '0';
      if (value === 1) return '1';
      if (value === 2) return '2';
      return value.toString();
    }
    if (typeof value === 'string') {
      // Format dates
      if (value.includes('T') && value.includes('Z')) {
        try {
          return new Date(value).toLocaleString();
        } catch {
          return value;
        }
      }
      // Format GPS coordinates
      if (value.includes('latitude') || value.includes('longitude')) {
        return value;
      }
      return value;
    }
    return String(value);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Blockchain Audit Trail</h2>
        <p className="text-gray-600 mt-1">Lifecycle by partHash with on-chain verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Transactions" value={summary.totalTransactions} subtitle="All blockchain records" icon={<Hash className="h-6 w-6" />} />
        <StatsCard title="Confirmed" value={summary.confirmedTransactions} subtitle="Verified transactions" icon={<CheckCircle className="h-6 w-6" />} />
        <StatsCard title="Pending" value={summary.pendingTransactions} subtitle="Awaiting confirmation" icon={<Clock className="h-6 w-6" />} />
        <StatsCard title="Failed" value={summary.failedTransactions} subtitle="Require attention" icon={<XCircle className="h-6 w-6" />} />
      </div>

      {/* Block Information */}
      {summary.lastBlockMined && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Blockchain Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Latest Block</p>
                  <p className="text-lg font-bold text-blue-800">
                    #{summary.lastBlockMined ? new Date(summary.lastBlockMined).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Total Gas Used</p>
                  <p className="text-lg font-bold text-green-800">
                    {summary.totalGasUsed.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Hash className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Success Rate</p>
                  <p className="text-lg font-bold text-purple-800">
                    {summary.totalTransactions > 0 
                      ? Math.round((summary.confirmedTransactions / summary.totalTransactions) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Part Lookup & Blockchain Verification</h3>
            <p className="text-sm text-gray-600">Search by part hash</p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Part Hash</label>
                <input
                  type="text"
                  placeholder="0x32d66592a1469a72e5c5531d4a14360925665d57d64dea016f8993ecd86edb46"
                  value={partHashInput}
                  onChange={(e) => setPartHashInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadFromChainByPartHash(partHashInput); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  autoComplete="off"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
                <Button 
                  variant="outline" 
                  onClick={() => loadFromChainByPartHash(partHashInput)} 
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  disabled={!partHashInput}
                  className="w-full sm:w-auto transition-all duration-200 hover:shadow-md active:scale-[0.99]"
                >
                  <span className="hidden sm:inline">Load from Blockchain</span>
                  <span className="sm:hidden">Load Blockchain</span>
                </Button>
                
                <select
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)} 
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                
                <Button
                  variant="outline"
                  onClick={exportAuditReport}
                  leftIcon={<Download className="h-4 w-4" />}
                  className="w-full sm:w-auto transition-all duration-200 hover:shadow-md active:scale-[0.99]"
                >
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                
                {isTxEnriching && <span className="text-xs text-gray-500 text-center sm:text-left">Fetching tx hashes…</span>}
              </div>
            </div>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {records.length > 0 ? 'Blockchain Records' : 'Recent Transactions'}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="info">
                {records.length > 0 ? `${records.length} blockchain` : `${recentRecords.length} recent`}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRecentTransactions} 
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                {records.length > 0 ? 'Show All Recent' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (records.length > 0 ? records : recentRecords).length > 0 ? (
            <div className="space-y-4">
              {(records.length > 0 ? records : recentRecords).map((record, index) => {
                const cardId = `${records.length > 0 ? 'blockchain' : 'recent'}-${record.id}-${index}`;
                const isExpanded = isCardExpanded(cardId);
                
                return (
                  <div key={cardId} className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Header Section - Always Visible */}
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
                    <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {getEventTypeIcon(record.eventType)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 truncate">{record.fittingId}</h4>
                            <p className="text-sm text-gray-600 capitalize">{record.eventType}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          {getStatusBadge(record.verificationStatus)}
                          <p className="text-xs text-gray-500 mt-1">{record.timestamp.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Compact Info Row - Always Visible */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Hash className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Part Hash:</span>
                          <span className="font-mono text-xs text-gray-800 truncate" title={record.fittingId}>
                            {record.fittingId}
                          </span>
                          <CopyButton value={record.fittingId} size="sm" />
                        </div>
                        
                        {record.transactionHash && (
                          <div className="flex items-center gap-2 min-w-0">
                            <Shield className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-600">Tx Hash:</span>
                            <a 
                              className="text-blue-600 hover:text-blue-800 font-mono text-xs truncate" 
                              href={bscscanTx(record.transactionHash)} 
                              target="_blank" 
                              rel="noreferrer"
                              title={record.transactionHash}
                            >
                              {record.transactionHash}
                            </a>
                            <CopyButton value={record.transactionHash} size="sm" />
                          </div>
                        )}
                        
                        {record.blockNumber && (
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-600">Block:</span>
                            <span className="font-mono text-xs font-semibold text-green-800">
                              #{record.blockNumber.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Expand/Collapse Button */}
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCardExpansion(cardId)}
                          leftIcon={isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          className="text-xs"
                        >
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {/* Enhanced Transaction Details */}
                        <div className="space-y-4">
                          {/* Primary Info Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Part Hash</span>
                              </div>
                              <div className="bg-gray-100 p-3 rounded-lg border">
                                <p className="font-mono text-xs break-all text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors" 
                                   onClick={() => navigator.clipboard.writeText(record.fittingId)}
                                   title="Click to copy">
                                  {record.fittingId}
                      </p>
                    </div>
                  </div>
                  
                            {record.transactionHash && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <a className="text-blue-700 hover:text-blue-800 font-mono text-xs break-all inline-flex items-center gap-2" 
                                     href={bscscanTx(record.transactionHash)} target="_blank" rel="noreferrer">
                                    {record.transactionHash}
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                  </a>
                                </div>
                    </div>
                            )}
                            
                    {record.blockNumber && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">Block Number</span>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                  <p className="font-mono text-sm font-semibold text-green-800">
                                    #{record.blockNumber.toLocaleString()}
                                  </p>
                                </div>
                      </div>
                    )}
                          </div>

                          {/* Additional Info Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Event Type</span>
                              <div className="flex items-center gap-2">
                                {getEventTypeIcon(record.eventType)}
                                <span className="text-sm font-medium capitalize">{record.eventType}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</span>
                              <div>{getStatusBadge(record.verificationStatus)}</div>
                            </div>
                            
                            <div className="space-y-2">
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Timestamp</span>
                              <p className="text-sm text-gray-800">{record.timestamp.toLocaleString()}</p>
                            </div>
                            
                    {record.gasUsed && (
                              <div className="space-y-2">
                                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Gas Used</span>
                                <p className="text-sm font-mono text-gray-800">{record.gasUsed.toLocaleString()}</p>
                              </div>
                            )}
                          </div>

                          {/* Clean Data Display */}
                          <div className="space-y-2">
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Transaction Data</span>
                            <div className="bg-white border rounded-lg p-4">
                              <div className="space-y-3">
                                {Object.entries(record.data).map(([key, value]) => (
                                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-0 sm:w-32 flex-shrink-0">
                                      {formatDataKey(key)}:
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      {typeof value === 'object' && value !== null ? (
                                        <div className="bg-gray-50 p-2 rounded border text-xs">
                                          <pre className="whitespace-pre-wrap break-words text-gray-800">
                                            {JSON.stringify(value, null, 2)}
                                          </pre>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-800 break-words">
                                          {formatDataValue(value)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No previous transactions found</p>
              <p className="text-sm text-gray-400">They will appear here as they are recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
