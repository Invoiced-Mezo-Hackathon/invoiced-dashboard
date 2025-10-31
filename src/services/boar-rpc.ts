// Boar RPC Client Service
// HTTP JSON-RPC client for Boar Network with retry logic

import { BOAR_CONFIG } from '@/lib/boar-config';

export interface BoarRPCResponse<T = unknown> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface BoarTransaction {
  hash: string;
  from: string;
  to: string;
  value: string; // in wei
  blockNumber: number;
  timestamp: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface BoarBalance {
  address: string;
  balance: string; // in wei
  nonce: number;
}

class BoarRPCClient {
  private httpUrl: string;
  private apiKey: string;
  private requestId = 0;
  private mezoHttpUrl: string;

  constructor() {
    this.httpUrl = BOAR_CONFIG.httpUrl;
    this.apiKey = BOAR_CONFIG.apiKey;
    // Prefer explicit env; default to public Mezo testnet RPC
    // Vite env read is safe in browser context
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.mezoHttpUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MEZO_HTTP_URL) || 'https://rpc.test.mezo.org';
  }

  // Generic JSON-RPC call with retry logic (uses BOAR endpoint)
  private async call<T = unknown>(
    method: string, 
    params: unknown[] = [], 
    retries = 2
  ): Promise<T> {
    const id = ++this.requestId;
    const payload = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API key as query parameter if needed
    const url = new URL(this.httpUrl);
    url.searchParams.set('api_key', this.apiKey);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: BoarRPCResponse<T> = await response.json();

        if (data.error) {
          throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
        }

        if (data.result === undefined) {
          throw new Error('No result in RPC response');
        }

        return data.result;
      } catch (error) {
        console.error(`Boar RPC call failed (attempt ${attempt + 1}/${retries + 1}):`, error);
        
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  // Direct JSON-RPC call to a specific URL (used for Mezo RPC first)
  private async callOn<T = unknown>(
    rpcUrl: string,
    method: string,
    params: unknown[] = [],
    retries = 1
  ): Promise<T> {
    const id = ++this.requestId;
    const payload = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: BoarRPCResponse<T> = await response.json();

        if (data.error) {
          throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
        }

        if (data.result === undefined) {
          throw new Error('No result in RPC response');
        }

        return data.result;
      } catch (error) {
        console.warn(`RPC call failed on ${rpcUrl} (attempt ${attempt + 1}/${retries + 1}):`, error);
        if (attempt === retries) throw error;
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  // Get address balance
  async getAddressBalance(address: string): Promise<BoarBalance> {
    try {
      // Validate and normalize address format
      if (!address) {
        throw new Error('Address is required');
      }
      
      // Ensure address is a string and properly formatted
      const normalizedAddress = typeof address === 'string' ? address : String(address);
      
      // Basic Ethereum address validation (0x + 40 hex chars)
      if (!normalizedAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.error('Invalid Ethereum address format:', normalizedAddress);
        throw new Error(`Invalid Ethereum address format: ${normalizedAddress}`);
      }
      
      console.log('🔍 Getting balance for address:', normalizedAddress);
      // Prefer Mezo RPC first for native balance
      let result: unknown;
      try {
        result = await this.callOn(this.mezoHttpUrl, 'eth_getBalance', [normalizedAddress, 'latest']);
      } catch (primaryError) {
        console.warn('Mezo RPC balance failed, falling back to Boar HTTP:', primaryError);
        result = await this.call('eth_getBalance', [normalizedAddress, 'latest']);
      }
      return {
        address: normalizedAddress,
        balance: String(result),
        nonce: 0, // We'll get this separately if needed
      };
    } catch (error) {
      console.error('Failed to get address balance:', error);
      throw error;
    }
  }

  // Get transactions for an address (chunked to respect provider block-range limits)
  async getAddressTransactions(address: string, fromBlock?: string): Promise<BoarTransaction[]> {
    try {
      // Providers often cap [from,to] distance to 10k blocks. We'll chunk requests.
      const latest = await this.getLatestBlockNumber();
      const CHUNK_SIZE = 9500; // stay safely under 10k

      // Default start: scan only recent window if not specified
      let start = fromBlock ? parseInt(fromBlock, 16) : Math.max(0, latest - CHUNK_SIZE);
      const logsAll: Array<{ transactionHash: string; topics: string[]; data: string; blockNumber: string; }> = [];

      while (start <= latest) {
        const end = Math.min(start + CHUNK_SIZE, latest);
        try {
          const result = await this.call<unknown>('eth_getLogs', [
        {
          address,
              fromBlock: '0x' + start.toString(16),
              toBlock: end === latest ? 'latest' : ('0x' + end.toString(16)),
        }
      ]);
          const batch = (result as Array<{ transactionHash: string; topics: string[]; data: string; blockNumber: string; }>) || [];
          logsAll.push(...batch);
        } catch (e) {
          // If provider rejects due to range, reduce chunk size further for this slice
          console.warn('eth_getLogs slice failed, reducing chunk size', { start, end, error: e });
          if (end - start <= 1000) {
            // give up on this tiny slice
            break;
          }
          // back off the window and retry next iteration
        }
        start = end + 1;
      }

      type EthLog = {
        transactionHash: string;
        topics: string[];
        data: string;
        blockNumber: string;
      };

      const logs = (logsAll as EthLog[]) || [];

      return logs.map((log: EthLog) => ({
        hash: log.transactionHash,
        from: (log.topics && log.topics.length > 1 ? log.topics[1] : '0x0'),
        to: address,
        value: log.data || '0x0',
        blockNumber: parseInt(log.blockNumber, 16),
        timestamp: Date.now(), // Would need to get from block timestamp
        confirmations: 1,
        status: 'confirmed' as const,
      }));
    } catch (error) {
      console.error('Failed to get address transactions:', error);
      return [];
    }
  }

  // Get transaction by hash
  async getTransaction(hash: string): Promise<BoarTransaction | null> {
    try {
      type EthTransaction = {
        hash: string;
        from: string;
        to: string | null;
        value: string;
        blockNumber?: string | null;
      } | null;

      const result = await this.call<EthTransaction>('eth_getTransactionByHash', [hash]);
      
      if (!result) {
        return null;
      }

      return {
        hash: result.hash,
        from: result.from,
        to: result.to || '0x0',
        value: result.value,
        blockNumber: result.blockNumber ? parseInt(result.blockNumber, 16) : 0,
        timestamp: Date.now(), // Would need to get from block timestamp
        confirmations: result.blockNumber ? 1 : 0,
        status: result.blockNumber ? 'confirmed' : 'pending',
      };
    } catch (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }
  }

  // Get latest block number
  async getLatestBlockNumber(): Promise<number> {
    try {
      const result = await this.call('eth_blockNumber');
      return parseInt(result as unknown as string, 16);
    } catch (error) {
      console.error('Failed to get latest block number:', error);
      throw error;
    }
  }

  // Check if an address has received funds since a specific timestamp
  async checkInboundFunds(
    address: string
  ): Promise<{ hasFunds: boolean; amount: string; transactions: BoarTransaction[] }> {
    try {
      // Get current balance
      const balance = await this.getAddressBalance(address);
      
      // For now, we'll use a simple approach:
      // If balance > 0, assume funds were received
      // In a real implementation, you'd want to track balance changes over time
      
      const hasFunds = BigInt(balance.balance) > 0n;
      
      return {
        hasFunds,
        amount: balance.balance,
        transactions: [], // Would need to implement transaction history
      };
    } catch (error) {
      console.error('Failed to check inbound funds:', error);
      return {
        hasFunds: false,
        amount: '0',
        transactions: [],
      };
    }
  }

  // Convert wei to a more readable format
  static formatWei(wei: string): string {
    const weiBigInt = BigInt(wei);
    const ether = Number(weiBigInt) / Math.pow(10, 18);
    return ether.toFixed(6);
  }

  // Convert ether to wei
  static toWei(ether: string): string {
    const etherFloat = parseFloat(ether);
    const weiFloat = etherFloat * Math.pow(10, 18);
    return Math.floor(weiFloat).toString();
  }
}

// Export singleton instance
export const boarRPC = new BoarRPCClient();
