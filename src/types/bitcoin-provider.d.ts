interface Window {
  BitcoinProvider?: {
    connect: () => Promise<string[]>;
    disconnect: () => Promise<void>;
    getAccounts: () => Promise<string[]>;
    signMessage: (message: string, account: string) => Promise<string>;
  }
}
