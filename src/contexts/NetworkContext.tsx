import { createContext, useContext, useState, ReactNode } from 'react';

type NetworkMode = 'mainnet' | 'testnet';

interface NetworkContextType {
  network: NetworkMode;
  setNetwork: (network: NetworkMode) => void;
  tokenSymbol: string;
  tokenName: string;
  rpcUrl: string;
  chainId: string;
  explorerUrl: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  // Load from localStorage or default to mainnet
  const [network, setNetworkState] = useState<NetworkMode>(() => {
    const saved = localStorage.getItem('network-mode');
    return (saved === 'testnet' || saved === 'mainnet') ? saved : 'mainnet';
  });

  const setNetwork = (newNetwork: NetworkMode) => {
    setNetworkState(newNetwork);
    localStorage.setItem('network-mode', newNetwork);
  };

  // Avalanche network configuration
  const networkConfig = {
    mainnet: {
      tokenSymbol: 'AVAX',
      tokenName: 'Avalanche',
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      chainId: '0xa86a', // 43114
      explorerUrl: 'https://snowtrace.io',
    },
    testnet: {
      tokenSymbol: 'AVAX',
      tokenName: 'Avalanche Fuji',
      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: '0xa869', // 43113
      explorerUrl: 'https://testnet.snowtrace.io',
    },
  };

  const config = networkConfig[network];

  return (
    <NetworkContext.Provider value={{ 
      network, 
      setNetwork, 
      tokenSymbol: config.tokenSymbol,
      tokenName: config.tokenName,
      rpcUrl: config.rpcUrl,
      chainId: config.chainId,
      explorerUrl: config.explorerUrl,
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
