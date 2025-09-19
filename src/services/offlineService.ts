import Dexie, { Table } from 'dexie';

// Define interfaces for offline data
interface OfflineQRScan {
  id?: number;
  partHash: string;
  scannedAt: Date;
  scannedBy: string;
  location?: string;
  synced: boolean;
}

interface OfflineInspection {
  id?: number;
  partHash: string;
  inspectorId: string;
  resultCode: number;
  defectType?: string;
  severity: number;
  notes: string;
  mediaFiles: File[];
  inspectedAt: Date;
  synced: boolean;
}

interface OfflineInstallation {
  id?: number;
  partHash: string;
  engineerId: string;
  gps: { latitude: number; longitude: number };
  trackSection: string;
  photoFile?: File;
  installedAt: Date;
  synced: boolean;
}

interface OfflineReceipt {
  id?: number;
  partHash: string;
  depotId: string;
  officerId: string;
  location: string;
  condition: 'good' | 'damaged' | 'rejected';
  receivedAt: Date;
  synced: boolean;
}

interface SyncQueue {
  id?: number;
  type: 'inspection' | 'installation' | 'receipt' | 'qr_scan';
  data: Record<string, unknown>;
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

// Dexie database class
class OfflineDatabase extends Dexie {
  qrScans!: Table<OfflineQRScan>;
  inspections!: Table<OfflineInspection>;
  installations!: Table<OfflineInstallation>;
  receipts!: Table<OfflineReceipt>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('RailTraceOfflineDB');
    
    this.version(1).stores({
      qrScans: '++id, partHash, scannedAt, scannedBy, synced',
      inspections: '++id, partHash, inspectorId, inspectedAt, synced',
      installations: '++id, partHash, engineerId, installedAt, synced',
      receipts: '++id, partHash, depotId, receivedAt, synced',
      syncQueue: '++id, type, createdAt, attempts'
    });
  }
}

class OfflineService {
  private db: OfflineDatabase;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor() {
    this.db = new OfflineDatabase();
    this.setupOnlineStatusListeners();
    this.startPeriodicSync();
  }

  private setupOnlineStatusListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startPeriodicSync() {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingData();
      }
    }, 30000);
  }

  // QR Scan operations
  async saveQRScan(scan: Omit<OfflineQRScan, 'id' | 'synced'>): Promise<number> {
    const id = await this.db.qrScans.add({
      ...scan,
      synced: false
    });

    if (this.isOnline) {
      this.addToSyncQueue('qr_scan', { ...scan, id });
    }

    return id;
  }

  async getQRScans(limit: number = 50): Promise<OfflineQRScan[]> {
    return await this.db.qrScans
      .orderBy('scannedAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  // Inspection operations
  async saveInspection(inspection: Omit<OfflineInspection, 'id' | 'synced'>): Promise<number> {
    const id = await this.db.inspections.add({
      ...inspection,
      synced: false
    });

    if (this.isOnline) {
      this.addToSyncQueue('inspection', { ...inspection, id });
    }

    return id;
  }

  async getInspections(inspectorId?: string): Promise<OfflineInspection[]> {
    let query = this.db.inspections.orderBy('inspectedAt').reverse();
    
    if (inspectorId) {
      query = query.filter(inspection => inspection.inspectorId === inspectorId);
    }

    return await query.toArray();
  }

  // Installation operations
  async saveInstallation(installation: Omit<OfflineInstallation, 'id' | 'synced'>): Promise<number> {
    const id = await this.db.installations.add({
      ...installation,
      synced: false
    });

    if (this.isOnline) {
      this.addToSyncQueue('installation', { ...installation, id });
    }

    return id;
  }

  async getInstallations(engineerId?: string): Promise<OfflineInstallation[]> {
    let query = this.db.installations.orderBy('installedAt').reverse();
    
    if (engineerId) {
      query = query.filter(installation => installation.engineerId === engineerId);
    }

    return await query.toArray();
  }

  // Receipt operations
  async saveReceipt(receipt: Omit<OfflineReceipt, 'id' | 'synced'>): Promise<number> {
    const id = await this.db.receipts.add({
      ...receipt,
      synced: false
    });

    if (this.isOnline) {
      this.addToSyncQueue('receipt', { ...receipt, id });
    }

    return id;
  }

  async getReceipts(depotId?: string): Promise<OfflineReceipt[]> {
    let query = this.db.receipts.orderBy('receivedAt').reverse();
    
    if (depotId) {
      query = query.filter(receipt => receipt.depotId === depotId);
    }

    return await query.toArray();
  }

  // Sync queue operations
  private async addToSyncQueue(type: SyncQueue['type'], data: Record<string, unknown>): Promise<void> {
    await this.db.syncQueue.add({
      type,
      data,
      createdAt: new Date(),
      attempts: 0
    });
  }

  async syncPendingData(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      const pendingItems = await this.db.syncQueue
        .where('attempts')
        .below(3) // Max 3 retry attempts
        .toArray();

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await this.db.syncQueue.delete(item.id!);
        } catch (error) {
          // Update retry count and error
          await this.db.syncQueue.update(item.id!, {
            attempts: item.attempts + 1,
            lastAttempt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch (error) {
      console.error('Sync process error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueue): Promise<void> {
    // Import services dynamically to avoid circular dependencies
    const { blockchainService } = await import('./blockchainService');
    const { storage } = await import('../config/firebase');
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

    switch (item.type) {
      case 'inspection': {
        const inspection = item.data as OfflineInspection;
        
        // Upload media files first
        const mediaHashes: string[] = [];
        for (const file of inspection.mediaFiles) {
          const storageRef = ref(storage, `inspections/${inspection.partHash}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          mediaHashes.push(downloadURL);
        }

        // Record on blockchain
        await blockchainService.inspectPart({
          partHash: inspection.partHash,
          inspectorId: inspection.inspectorId,
          resultCode: inspection.resultCode,
          defectType: inspection.defectType,
          severity: inspection.severity,
          mediaHashes,
          notes: inspection.notes
        });

        // Mark as synced
        await this.db.inspections.update(inspection.id!, { synced: true });
        break;
      }

      case 'installation': {
        const installation = item.data as OfflineInstallation;
        
        // Upload photo if exists
        let photoHash: string | undefined;
        if (installation.photoFile) {
          const storageRef = ref(storage, `installations/${installation.partHash}/${installation.photoFile.name}`);
          const snapshot = await uploadBytes(storageRef, installation.photoFile);
          photoHash = await getDownloadURL(snapshot.ref);
        }

        // Record on blockchain
        await blockchainService.installPart({
          partHash: installation.partHash,
          gps: installation.gps,
          engineerId: installation.engineerId,
          trackSection: installation.trackSection,
          photoHash
        });

        // Mark as synced
        await this.db.installations.update(installation.id!, { synced: true });
        break;
      }

      case 'receipt': {
        const receipt = item.data as OfflineReceipt;
        
        // Record on blockchain
        await blockchainService.receivePart({
          partHash: receipt.partHash,
          depotId: receipt.depotId,
          officerId: receipt.officerId,
          location: receipt.location,
          condition: receipt.condition
        });

        // Mark as synced
        await this.db.receipts.update(receipt.id!, { synced: true });
        break;
      }

      case 'qr_scan': {
        // QR scans are typically just logged, no blockchain action needed
        const scan = item.data as OfflineQRScan;
        await this.db.qrScans.update(scan.id!, { synced: true });
        break;
      }
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    pendingCount: number;
    lastSync?: Date;
    failedCount: number;
  }> {
    const pendingCount = await this.db.syncQueue.count();
    const failedCount = await this.db.syncQueue.where('attempts').aboveOrEqual(3).count();
    
    const lastSyncItem = await this.db.syncQueue
      .orderBy('createdAt')
      .reverse()
      .first();

    return {
      pendingCount,
      lastSync: lastSyncItem?.lastAttempt,
      failedCount
    };
  }

  // Clear old data (cleanup)
  async clearOldData(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await Promise.all([
      this.db.qrScans.where('scannedAt').below(cutoffDate).and(item => item.synced).delete(),
      this.db.inspections.where('inspectedAt').below(cutoffDate).and(item => item.synced).delete(),
      this.db.installations.where('installedAt').below(cutoffDate).and(item => item.synced).delete(),
      this.db.receipts.where('receivedAt').below(cutoffDate).and(item => item.synced).delete()
    ]);
  }

  // Get offline status
  isOffline(): boolean {
    return !this.isOnline;
  }

  // Force sync
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingData();
    }
  }
}

export const offlineService = new OfflineService();
export type { OfflineQRScan, OfflineInspection, OfflineInstallation, OfflineReceipt };