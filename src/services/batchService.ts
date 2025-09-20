// Batch Service for Railway Server Integration
const RELAYER_API_URL = 'https://discerning-wonder-production-3da7.up.railway.app/api/events/recent';
const POLLING_INTERVAL = 30000; // 30 seconds

export interface EventData {
  events: any[];
  batchInfo: {
    totalBatches: number;
    totalEvents: number;
    costSavings: string;
  };
  queryInfo: {
    fromBlock: number;
    toBlock: number;
    currentBlock: number;
  };
}

class BatchService {
  private listeners: ((data: EventData) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  public async getRecentEvents(): Promise<EventData> {
    try {
      const response = await fetch(RELAYER_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch recent events:', error);
      // Return empty data structure on error
      return {
        events: [],
        batchInfo: {
          totalBatches: 0,
          totalEvents: 0,
          costSavings: '0%'
        },
        queryInfo: {
          fromBlock: 0,
          toBlock: 0,
          currentBlock: 0
        }
      };
    }
  }

  public subscribeToUpdates(callback: (data: EventData) => void): () => void {
    this.listeners.push(callback);
    
    if (!this.pollingInterval) {
      this.startPolling();
    }
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
      if (this.listeners.length === 0 && this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    };
  }

  private startPolling() {
    this.pollingInterval = setInterval(async () => {
      try {
        const data = await this.getRecentEvents();
        this.listeners.forEach(listener => listener(data));
      } catch (error) {
        console.error('Error polling for batch updates:', error);
      }
    }, POLLING_INTERVAL);
  }
}

export const batchService = new BatchService();
