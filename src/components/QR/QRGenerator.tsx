import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Download, Package, Shield } from 'lucide-react';
import { blockchainService } from '../../services/blockchainService';

interface QRData {
  id: string;
  dataUrl: string;
  qrCode: string;
}

interface QRGeneratorProps {
  onGenerate?: (qrData: QRData) => void;
}

export function QRGenerator({ onGenerate }: QRGeneratorProps) {
  const [formData, setFormData] = useState({
    batchNumber: '',
    fittingType: 'clip',
    quantity: '',
    material: '',
    specifications: '',
    vendorId: 'VENDOR-001' // This would come from auth context
  });
  
  const [generatedQRs, setGeneratedQRs] = useState<Array<{
    id: string;
    qrCode: string;
    dataUrl: string;
  }>>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const registerBatchOnChain = async () => {
    if (generatedQRs.length === 0) return;
    setIsRegistering(true);
    try {
      for (const item of generatedQRs) {
        const registration = {
          partId: item.id,
          vendorId: formData.vendorId,
          lotId: formData.batchNumber,
          manufactureDate: new Date(),
          specifications: {
            material: formData.material,
            details: formData.specifications
          }
        };
        await blockchainService.registerPart(registration);
      }
    } catch (e) {
      console.error('Batch registration failed:', e);
    } finally {
      setIsRegistering(false);
    }
  };

  const generateQRCodes = async () => {
    if (!formData.batchNumber || !formData.quantity) return;
    
    setIsGenerating(true);
    
    try {
      const quantity = parseInt(formData.quantity);
      const qrCodes = [];
      
      for (let i = 1; i <= quantity; i++) {
        const partId = `${formData.batchNumber}-${String(i).padStart(4, '0')}`;
        const manufactureDate = new Date();
        const partRegistration = {
          partId,
          vendorId: formData.vendorId,
          lotId: formData.batchNumber,
          manufactureDate,
          specifications: {
            material: formData.material,
            details: formData.specifications
          }
        } as const;

        // Compute deterministic partHash used by scanner and chain
        const partHash = blockchainService.generatePartHash(partRegistration);

        const qrData = {
          partHash,
          pointerURL: `https://railtrace.gov.in/parts/${encodeURIComponent(partId)}`,
          partId,
          vendorId: formData.vendorId,
          lotId: formData.batchNumber,
          manufactureDate: manufactureDate.toISOString(),
          specifications: partRegistration.specifications,
          type: formData.fittingType
        };

        const qrString = JSON.stringify(qrData);
        const dataUrl = await QRCode.toDataURL(qrString, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        qrCodes.push({
          id: partId,
          qrCode: qrString,
          dataUrl: dataUrl
        });
      }
      
      setGeneratedQRs(qrCodes);
      
      // Optional: notify parent for blockchain logging/registration
      if (onGenerate) {
        onGenerate({
          batchNumber: formData.batchNumber,
          qrCodes: qrCodes,
          vendorId: formData.vendorId
        });
      }
      
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = (qrData: QRData) => {
    const link = document.createElement('a');
    link.href = qrData.dataUrl;
    link.download = `QR_${qrData.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllQRCodes = () => {
    generatedQRs.forEach((qr, index) => {
      setTimeout(() => downloadQRCode(qr, index), index * 100);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
        <p className="text-gray-600 mt-1">Generate QR codes for railway fittings batch</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Batch Information
            </h3>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number *
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                  placeholder="e.g., RT-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fitting Type *
                </label>
                <select
                  value={formData.fittingType}
                  onChange={(e) => setFormData({...formData, fittingType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="clip">Rail Clip</option>
                  <option value="pad">Pad</option>
                  <option value="liner">Liner</option>
                  <option value="sleeper">Sleeper</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="e.g., 50"
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({...formData, material: e.target.value})}
                  placeholder="e.g., High Carbon Steel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specifications
                </label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                  placeholder="Additional specifications and notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Button
                onClick={generateQRCodes}
                loading={isGenerating}
                disabled={!formData.batchNumber || !formData.quantity}
                className="w-full"
              >
                Generate QR Codes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated QR Codes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Generated QR Codes
              </h3>
              {generatedQRs.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAllQRCodes}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    Download All
                  </Button>
                  <Button
                    size="sm"
                    onClick={registerBatchOnChain}
                    loading={isRegistering}
                  >
                    Register Batch on Blockchain
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedQRs.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="success">Generated</Badge>
                  <span className="text-sm text-gray-600">
                    {generatedQRs.length} QR codes ready
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {generatedQRs.map((qr, index) => (
                    <div key={qr.id} className="border border-gray-200 rounded-lg p-3 text-center">
                      <img 
                        src={qr.dataUrl} 
                        alt={`QR Code ${qr.id}`} 
                        className="w-24 h-24 mx-auto mb-2"
                      />
                      <p className="text-xs font-mono text-gray-600 truncate" title={qr.id}>
                        {qr.id}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadQRCode(qr, index)}
                        className="mt-2 w-full"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No QR codes generated yet</p>
                <p className="text-sm text-gray-400">Fill out the batch information and click generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}