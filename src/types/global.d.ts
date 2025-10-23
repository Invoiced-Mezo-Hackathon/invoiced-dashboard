interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (...args: any[]) => Promise<any>;
  };
  btc?: {
    request: (method: string, params?: any[]) => Promise<any>;
    connect: () => Promise<string[]>;
    getAddresses: () => Promise<string[]>;
    getNetwork: () => Promise<string>;
    getBalance: () => Promise<number>;
  };
}
