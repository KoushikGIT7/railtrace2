import React, { useState, useCallback } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Camera, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Calendar,
  Package
} from 'lucide-react';
import { blockchainService } from '../../services/blockchainService';
import { offlineService } from '../../services/offlineService';
import { useAuth } from '../../hooks/useAuth';

interface QRScanResult {
  partHash: string;
  pointerURL: string;
  partId: string;
  vendorId: string;
  lotId: string;
  manufactureDate: string;
  specifications: Record<string, unknown>;
}

interface PartHistory {
  eventType: string;
  timestamp: number;
  data: Record<string, unknown>;
  verified: boolean;
}

export function QRScanner() {
  const { userData } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [partHistory, setPartHistory] = useState<PartHistory[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'invalid'>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ depotId: '', officerId: '', location: '', condition: 'good' as 'good' | 'damaged' | 'rejected' });
  const [installForm, setInstallForm] = useState({ engineerId: '', trackSection: '', latitude: '', longitude: '' });
  const [inspectForm, setInspectForm] = useState({ inspectorId: '', resultCode: '0', defectType: '', severity: '1', notes: '' });

  const handleScan = useCallback(async (result: string) => {
    if (!result) return;

    setLoading(true);
    setError(null);

    try {
      // Parse QR code data
      const qrData: QRScanResult = JSON.parse(result);
      setScanResult(qrData);

      // Save scan to offline storage
      await offlineService.saveQRScan({
        partHash: qrData.partHash,
        scannedAt: new Date(),
        scannedBy: userData?.id || 'unknown',
        location: 'Current Location' // In production, get actual GPS
      });

      // Verify part on blockchain
      const verification = await blockchainService.verifyPart(qrData.partHash);
      setVerificationStatus(verification.status);

      // Get part history
      const history = await blockchainService.getPartHistory(qrData.partHash);
      setPartHistory(history.map(event => ({
        eventType: getEventTypeName(event.status),
        timestamp: event.timestamp,
        data: JSON.parse(event.data || '{}'),
        verified: true
      })));

      setIsScanning(false);
    } catch (error) {
      console.error('Error processing QR scan:', error);
      setError('Invalid QR code or failed to verify part');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  const getEventTypeName = (status: number): string => {
    const eventTypes = {
      0: 'Registered',
      1: 'Received',
      2: 'Installed', 
      3: 'Inspected',
      4: 'Retired'
    };
    return eventTypes[status as keyof typeof eventTypes] || 'Unknown';
  };

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Blockchain Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending Verification
          </Badge>
        );
      case 'invalid':
        return (
          <Badge variant="error" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Invalid/Unverified
          </Badge>
        );
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const submitDepotReceipt = async () => {
    if (!scanResult) return;
    setActionLoading(true);
    try {
      await blockchainService.receivePart({
        partHash: scanResult.partHash,
        depotId: receiptForm.depotId || 'DEPOT-UNKNOWN',
        officerId: receiptForm.officerId || (userData?.id ?? 'officer'),
        location: receiptForm.location || 'Unknown',
        condition: receiptForm.condition
      });
    } catch {
      setError('Failed to record receipt');
    } finally {
      setActionLoading(false);
    }
  };

  const submitInstallation = async () => {
    if (!scanResult) return;
    setActionLoading(true);
    try {
      await blockchainService.installPart({
        partHash: scanResult.partHash,
        gps: { latitude: Number(installForm.latitude), longitude: Number(installForm.longitude) },
        engineerId: installForm.engineerId || (userData?.id ?? 'engineer'),
        trackSection: installForm.trackSection
      });
    } catch {
      setError('Failed to record installation');
    } finally {
      setActionLoading(false);
    }
  };

  const submitInspection = async () => {
    if (!scanResult) return;
    setActionLoading(true);
    try {
      await blockchainService.inspectPart({
        partHash: scanResult.partHash,
        inspectorId: inspectForm.inspectorId || (userData?.id ?? 'inspector'),
        resultCode: Number(inspectForm.resultCode),
        defectType: inspectForm.defectType || undefined,
        severity: Number(inspectForm.severity),
        mediaHashes: [],
        notes: inspectForm.notes
      });
    } catch {
      setError('Failed to record inspection');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QR Code Scanner</h2>
        <p className="text-gray-600 mt-1">Scan railway fitting QR codes to view lifecycle history</p>
      </div>

      {/* Scanner Controls */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Camera Scanner
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {!isScanning ? (
              <div className="space-y-4">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
                <Button
                  onClick={() => setIsScanning(true)}
                  className="w-full"
                  leftIcon={<Camera className="h-4 w-4" />}
                >
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Scanner
                    onResult={(text) => handleScan(String(text))}
                    onError={(error) => setError(error?.message || 'Scanner error')}
                    containerStyle={{
                      width: '100%',
                      maxWidth: '400px',
                      margin: '0 auto'
                    }}
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-white text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                        <p>Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsScanning(false)}
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Part Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  Part Information
                </h3>
                {getVerificationBadge()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Part ID</p>
                    <p className="font-medium text-gray-900">{scanResult.partId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Vendor ID</p>
                    <p className="font-medium text-gray-900">{scanResult.vendorId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lot Number</p>
                    <p className="font-medium text-gray-900">{scanResult.lotId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Manufacture Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(scanResult.manufactureDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {scanResult.specifications && (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Specifications</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {JSON.stringify(scanResult.specifications, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Hash: {scanResult.partHash.substring(0, 16)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle History */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Lifecycle History
              </h3>
            </CardHeader>
            <CardContent>
              {partHistory.length > 0 ? (
                <div className="space-y-4">
                  {partHistory.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.verified ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {event.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{event.eventType}</p>
                          <Badge variant={event.verified ? 'success' : 'warning'} size="sm">
                            {event.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.timestamp)}
                        </p>
                        {event.data && Object.keys(event.data).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(event.data).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-1">
                                <span className="capitalize">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No lifecycle events found</p>
                  <p className="text-sm text-gray-400">This part may not be registered on the blockchain</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Role-based Actions */}
      {scanResult && userData?.role === 'depot' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Record Receipt</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="px-3 py-2 border rounded-lg" placeholder="Depot ID" value={receiptForm.depotId} onChange={e=>setReceiptForm({...receiptForm, depotId: e.target.value})} />
              <input className="px-3 py-2 border rounded-lg" placeholder="Officer ID" value={receiptForm.officerId} onChange={e=>setReceiptForm({...receiptForm, officerId: e.target.value})} />
              <input className="px-3 py-2 border rounded-lg" placeholder="Location" value={receiptForm.location} onChange={e=>setReceiptForm({...receiptForm, location: e.target.value})} />
              <select className="px-3 py-2 border rounded-lg" value={receiptForm.condition} onChange={e=>setReceiptForm({...receiptForm, condition: e.target.value as 'good' | 'damaged' | 'rejected'})}>
                <option value="good">Good</option>
                <option value="damaged">Damaged</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <Button className="mt-3" onClick={submitDepotReceipt} loading={actionLoading}>Record Receipt</Button>
          </CardContent>
        </Card>
      )}

      {scanResult && userData?.role === 'engineer' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Record Installation</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input className="px-3 py-2 border rounded-lg" placeholder="Engineer ID" value={installForm.engineerId} onChange={e=>setInstallForm({...installForm, engineerId: e.target.value})} />
              <input className="px-3 py-2 border rounded-lg" placeholder="Track Section" value={installForm.trackSection} onChange={e=>setInstallForm({...installForm, trackSection: e.target.value})} />
              <input className="px-3 py-2 border rounded-lg" placeholder="Latitude" value={installForm.latitude} onChange={e=>setInstallForm({...installForm, latitude: e.target.value})} />
              <input className="px-3 py-2 border rounded-lg" placeholder="Longitude" value={installForm.longitude} onChange={e=>setInstallForm({...installForm, longitude: e.target.value})} />
            </div>
            <Button className="mt-3" onClick={submitInstallation} loading={actionLoading}>Record Installation</Button>
          </CardContent>
        </Card>
      )}

      {scanResult && userData?.role === 'inspector' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Record Inspection</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input className="px-3 py-2 border rounded-lg" placeholder="Inspector ID" value={inspectForm.inspectorId} onChange={e=>setInspectForm({...inspectForm, inspectorId: e.target.value})} />
              <select className="px-3 py-2 border rounded-lg" value={inspectForm.resultCode} onChange={e=>setInspectForm({...inspectForm, resultCode: e.target.value})}>
                <option value="0">Pass</option>
                <option value="1">Fail</option>
                <option value="2">Defective</option>
              </select>
              <input className="px-3 py-2 border rounded-lg" placeholder="Defect Type (optional)" value={inspectForm.defectType} onChange={e=>setInspectForm({...inspectForm, defectType: e.target.value})} />
              <select className="px-3 py-2 border rounded-lg" value={inspectForm.severity} onChange={e=>setInspectForm({...inspectForm, severity: e.target.value})}>
                <option value="1">Severity 1</option>
                <option value="2">Severity 2</option>
                <option value="3">Severity 3</option>
                <option value="4">Severity 4</option>
                <option value="5">Severity 5</option>
              </select>
              <input className="px-3 py-2 border rounded-lg" placeholder="Notes" value={inspectForm.notes} onChange={e=>setInspectForm({...inspectForm, notes: e.target.value})} />
            </div>
            <Button className="mt-3" onClick={submitInspection} loading={actionLoading}>Record Inspection</Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}