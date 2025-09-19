import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration (same as your project)
const firebaseConfig = {
  apiKey: "AIzaSyBcwJwDLbTPQ-vi3cirrScieiv2D15k-iI",
  authDomain: "rialconnect-1881f.firebaseapp.com",
  projectId: "rialconnect-1881f",
  storageBucket: "rialconnect-1881f.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock data for AI Analytics
const mockTransactions = [
  // Vendor Performance Data
  {
    partHash: '0x32d66592a1469a72e5c5531d4a14360925665d57d64dea016f8993ecd86edb46',
    eventType: 'registered',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'confirmed',
    metadata: {
      vendorId: 'VENDOR-001',
      vendorName: 'Railway Parts Co.',
      lotId: 'BATCH-001',
      manufactureDate: '2025-01-15T10:30:00Z',
      specifications: { type: 'Clip', material: 'Steel', grade: 'A' }
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-15T10:30:00Z')),
    blockNumber: 65816960
  },
  {
    partHash: '0xe93489eb252669fc9d1d537d71340d6fcd77f8e23b49f604087ad3ad718636cd',
    eventType: 'registered',
    transactionHash: '0x2345678901bcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    status: 'confirmed',
    metadata: {
      vendorId: 'VENDOR-002',
      vendorName: 'Track Solutions Ltd.',
      lotId: 'BATCH-002',
      manufactureDate: '2025-01-16T14:20:00Z',
      specifications: { type: 'Bolt', material: 'Iron', grade: 'B' }
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-16T14:20:00Z')),
    blockNumber: 65817000
  },
  {
    partHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    eventType: 'registered',
    transactionHash: '0x3456789012cdef1234567890abcdef1234567890abcdef1234567890abcdef123',
    status: 'confirmed',
    metadata: {
      vendorId: 'VENDOR-003',
      vendorName: 'Steel Components Inc.',
      lotId: 'BATCH-003',
      manufactureDate: '2025-01-17T09:15:00Z',
      specifications: { type: 'Rail', material: 'Steel', grade: 'A+' }
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-17T09:15:00Z')),
    blockNumber: 65817050
  },

  // Inspection Data with Defects
  {
    partHash: '0x32d66592a1469a72e5c5531d4a14360925665d57d64dea016f8993ecd86edb46',
    eventType: 'inspected',
    transactionHash: '0x4567890123def1234567890abcdef1234567890abcdef1234567890abcdef1234',
    status: 'confirmed',
    metadata: {
      inspectorId: 'INSP-001',
      resultCode: 0, // Pass
      defectType: '',
      severity: 0,
      mediaHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      notes: 'Excellent condition',
      condition: 'good'
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-18T11:00:00Z')),
    blockNumber: 65817100
  },
  {
    partHash: '0xe93489eb252669fc9d1d537d71340d6fcd77f8e23b49f604087ad3ad718636cd',
    eventType: 'inspected',
    transactionHash: '0x5678901234ef1234567890abcdef1234567890abcdef1234567890abcdef12345',
    status: 'confirmed',
    metadata: {
      inspectorId: 'INSP-002',
      resultCode: 1, // Fail
      defectType: 'corrosion',
      severity: 2,
      mediaHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      notes: 'Corrosion detected on surface',
      condition: 'poor'
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-18T15:30:00Z')),
    blockNumber: 65817150
  },
  {
    partHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    eventType: 'inspected',
    transactionHash: '0x6789012345f1234567890abcdef1234567890abcdef1234567890abcdef123456',
    status: 'confirmed',
    metadata: {
      inspectorId: 'INSP-003',
      resultCode: 0, // Pass
      defectType: '',
      severity: 0,
      mediaHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      notes: 'Perfect condition',
      condition: 'excellent'
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-19T08:45:00Z')),
    blockNumber: 65817200
  },

  // Installation Data
  {
    partHash: '0x32d66592a1469a72e5c5531d4a14360925665d57d64dea016f8993ecd86edb46',
    eventType: 'installed',
    transactionHash: '0x78901234561234567890abcdef1234567890abcdef1234567890abcdef1234567',
    status: 'confirmed',
    metadata: {
      gps: { latitude: 28.6139, longitude: 77.209 },
      engineerId: 'ENG-001',
      trackSection: 'A-1',
      photoHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
      installationNotes: 'Installed successfully'
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-20T10:00:00Z')),
    blockNumber: 65817250
  },
  {
    partHash: '0xe93489eb252669fc9d1d537d71340d6fcd77f8e23b49f604087ad3ad718636cd',
    eventType: 'installed',
    transactionHash: '0x8901234567234567890abcdef1234567890abcdef1234567890abcdef12345678',
    status: 'confirmed',
    metadata: {
      gps: { latitude: 28.6140, longitude: 77.210 },
      engineerId: 'ENG-002',
      trackSection: 'A-2',
      photoHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
      installationNotes: 'Installation completed with minor issues'
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-20T14:30:00Z')),
    blockNumber: 65817300
  },

  // Retirement Data
  {
    partHash: '0x32d66592a1469a72e5c5531d4a14360925665d57d64dea016f8993ecd86edb46',
    eventType: 'retired',
    transactionHash: '0x901234567834567890abcdef1234567890abcdef1234567890abcdef123456789',
    status: 'confirmed',
    metadata: {
      reason: 'end_of_life',
      retirementDate: '2025-01-25T16:00:00Z',
      condition: 'worn_out',
      disposalMethod: 'recycled'
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-25T16:00:00Z')),
    blockNumber: 65817500
  },

  // More recent data for real-time updates
  {
    partHash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    eventType: 'registered',
    transactionHash: '0xa01234567894567890abcdef1234567890abcdef1234567890abcdef123456789a',
    status: 'confirmed',
    metadata: {
      vendorId: 'VENDOR-004',
      vendorName: 'Metal Works Corp.',
      lotId: 'BATCH-004',
      manufactureDate: '2025-01-26T12:00:00Z',
      specifications: { type: 'Bracket', material: 'Aluminum', grade: 'C' }
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-26T12:00:00Z')),
    blockNumber: 65817600
  },
  {
    partHash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890ab',
    eventType: 'inspected',
    transactionHash: '0xb1234567890567890abcdef1234567890abcdef1234567890abcdef123456789ab',
    status: 'confirmed',
    metadata: {
      inspectorId: 'INSP-004',
      resultCode: 1, // Fail
      defectType: 'crack',
      severity: 3,
      mediaHash: '0x5555555555555555555555555555555555555555555555555555555555555555',
      notes: 'Structural crack detected',
      condition: 'critical'
    },
    createdAt: Timestamp.fromDate(new Date('2025-01-26T16:15:00Z')),
    blockNumber: 65817650
  }
];

async function addMockData() {
  try {
    console.log('Adding mock data to Firestore...');
    
    for (const transaction of mockTransactions) {
      await addDoc(collection(db, 'transactions'), transaction);
      console.log(`Added transaction: ${transaction.eventType} for part ${transaction.partHash.substring(0, 10)}...`);
    }
    
    console.log('✅ Successfully added all mock data to Firestore!');
    console.log(`Added ${mockTransactions.length} transactions`);
    
  } catch (error) {
    console.error('❌ Error adding mock data:', error);
  }
}

// Run the script
addMockData();
