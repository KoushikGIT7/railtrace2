import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('../serviceAccountKey.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addMockReportsData() {
  try {
    console.log('Adding mock reports data to Firestore...');

    // Add mock transaction data for reports
    const mockTransactions = [
      {
        eventType: 'registered',
        partHash: '0x1234567890abcdef1234567890abcdef12345678',
        data: {
          vendorId: 'VENDOR-001',
          lotId: 'BATCH-001',
          manufactureDate: '2024-01-15T10:00:00Z',
          specifications: { type: 'Clip', material: 'Steel' }
        },
        status: 'confirmed',
        txHash: '0xabc123def456789',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-15T10:00:00Z'))
      },
      {
        eventType: 'inspected',
        partHash: '0x1234567890abcdef1234567890abcdef12345678',
        data: {
          inspectorId: 'INSP-001',
          resultCode: 0,
          defectType: '',
          severity: 0,
          notes: 'Passed inspection'
        },
        status: 'confirmed',
        txHash: '0xdef456abc789123',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-20T14:30:00Z'))
      },
      {
        eventType: 'installed',
        partHash: '0x1234567890abcdef1234567890abcdef12345678',
        data: {
          gps: { latitude: 28.6139, longitude: 77.2090 },
          engineerId: 'ENG-001',
          trackSection: 'A-1',
          photoHash: '0xphoto123'
        },
        status: 'confirmed',
        txHash: '0xghi789jkl012345',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-01-25T09:15:00Z'))
      },
      {
        eventType: 'registered',
        partHash: '0x2345678901bcdef2345678901bcdef234567890',
        data: {
          vendorId: 'VENDOR-002',
          lotId: 'BATCH-002',
          manufactureDate: '2024-02-01T08:00:00Z',
          specifications: { type: 'Pad', material: 'Rubber' }
        },
        status: 'confirmed',
        txHash: '0xjkl012mno345678',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-01T08:00:00Z'))
      },
      {
        eventType: 'inspected',
        partHash: '0x2345678901bcdef2345678901bcdef234567890',
        data: {
          inspectorId: 'INSP-002',
          resultCode: 1,
          defectType: 'Surface Crack',
          severity: 2,
          notes: 'Minor surface crack detected'
        },
        status: 'confirmed',
        txHash: '0xmno345pqr678901',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-05T16:45:00Z'))
      },
      {
        eventType: 'registered',
        partHash: '0x3456789012cdef3456789012cdef3456789012',
        data: {
          vendorId: 'VENDOR-001',
          lotId: 'BATCH-003',
          manufactureDate: '2024-02-10T12:00:00Z',
          specifications: { type: 'Liner', material: 'Composite' }
        },
        status: 'confirmed',
        txHash: '0xpqr678stu901234',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-10T12:00:00Z'))
      },
      {
        eventType: 'inspected',
        partHash: '0x3456789012cdef3456789012cdef3456789012',
        data: {
          inspectorId: 'INSP-001',
          resultCode: 0,
          defectType: '',
          severity: 0,
          notes: 'Excellent condition'
        },
        status: 'confirmed',
        txHash: '0xstu901vwx234567',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-15T11:20:00Z'))
      },
      {
        eventType: 'installed',
        partHash: '0x3456789012cdef3456789012cdef3456789012',
        data: {
          gps: { latitude: 28.6140, longitude: 77.2091 },
          engineerId: 'ENG-002',
          trackSection: 'B-2',
          photoHash: '0xphoto456'
        },
        status: 'confirmed',
        txHash: '0xvwx234yza567890',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-20T13:30:00Z'))
      },
      {
        eventType: 'retired',
        partHash: '0x1234567890abcdef1234567890abcdef12345678',
        data: {
          reason: 'End of service life'
        },
        status: 'confirmed',
        txHash: '0xyza567bcd890123',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-01T15:00:00Z'))
      },
      {
        eventType: 'registered',
        partHash: '0x4567890123def4567890123def4567890123',
        data: {
          vendorId: 'VENDOR-003',
          lotId: 'BATCH-004',
          manufactureDate: '2024-03-05T09:30:00Z',
          specifications: { type: 'Sleeper', material: 'Concrete' }
        },
        status: 'confirmed',
        txHash: '0xbcd890efg123456',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-05T09:30:00Z'))
      }
    ];

    // Add transactions to Firestore
    const batch = db.batch();
    const transactionsRef = db.collection('transactions');
    
    mockTransactions.forEach((transaction, index) => {
      const docRef = transactionsRef.doc();
      batch.set(docRef, {
        ...transaction,
        id: docRef.id
      });
    });

    await batch.commit();
    console.log(`✅ Added ${mockTransactions.length} mock transactions to Firestore`);

    // Add mock reports
    const mockReports = [
      {
        id: 'report-001',
        title: 'Monthly Inspection Summary',
        type: 'summary',
        category: 'inspections',
        generatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-01T10:00:00Z')),
        period: 'Last 30 days',
        status: 'ready',
        downloadUrl: '#',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-03-01T10:00:00Z'))
      },
      {
        id: 'report-002',
        title: 'Vendor Performance Analysis',
        type: 'analytics',
        category: 'vendors',
        generatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-28T14:30:00Z')),
        period: 'Last 30 days',
        status: 'ready',
        downloadUrl: '#',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-28T14:30:00Z'))
      },
      {
        id: 'report-003',
        title: 'Blockchain Audit Report',
        type: 'detailed',
        category: 'blockchain',
        generatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-25T16:45:00Z')),
        period: 'Last 7 days',
        status: 'ready',
        downloadUrl: '#',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-25T16:45:00Z'))
      },
      {
        id: 'report-004',
        title: 'Quality Control Report',
        type: 'summary',
        category: 'quality',
        generatedAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-20T11:20:00Z')),
        period: 'Last 30 days',
        status: 'generating',
        createdAt: admin.firestore.Timestamp.fromDate(new Date('2024-02-20T11:20:00Z'))
      }
    ];

    // Add reports to Firestore
    const reportsBatch = db.batch();
    const reportsRef = db.collection('reports');
    
    mockReports.forEach((report) => {
      const docRef = reportsRef.doc(report.id);
      reportsBatch.set(docRef, report);
    });

    await reportsBatch.commit();
    console.log(`✅ Added ${mockReports.length} mock reports to Firestore`);

    console.log('🎉 Mock reports data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding mock reports data:', error);
    process.exit(1);
  }
}

addMockReportsData();
