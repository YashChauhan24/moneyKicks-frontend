export const SUPPORTED_TOKENS = {
  DMT: {
    address: "0xb0Fe621B4Bd7fe4975f7c58E3D6ADaEb2a2A35CD" as `0x${string}`,
    converter: "0x372dAB27c8d223Af11C858ea00037Dc03053B22E" as `0x${string}`,
  },
  WAVAX: {
    address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" as `0x${string}`,
    converter: "0x14150C3D222B8A5cEc5233cB21E43e5b20819d07" as `0x${string}`,
  },
  USDC: {
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" as `0x${string}`,
    converter: "0x9c27E4709Aa5a60107CFC0b89bC8302AEA6c1Fed" as `0x${string}`,
  },
} as const;

export type SupportedToken = keyof typeof SUPPORTED_TOKENS;

// Contract addresses (leaving for backward compatibility if needed, though replaced by SUPPORTED_TOKENS above)
export const CONTRACTS = {
  EERC_STANDALONE: "0x5E9c6F952fB9615583182e70eDDC4e6E4E0aC0e0",
  EERC_CONVERTER: "0x372dAB27c8d223Af11C858ea00037Dc03053B22E", // DMT Converter
  ERC20: "0xb0Fe621B4Bd7fe4975f7c58E3D6ADaEb2a2A35CD", // DMT Token
  USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
} as const;

const CDN_BASE_URL = "https://d30f1urb9i1c13.cloudfront.net/zk_files";

// Circuit URLs for EERC operations
export const CIRCUIT_URLS = {
  register: {
    wasm: `${CDN_BASE_URL}/registration/registration.wasm`,
    zkey: `${CDN_BASE_URL}/registration/circuit_final.zkey`,
  },
  transfer: {
    wasm: `${CDN_BASE_URL}/transfer/transfer.wasm`,
    zkey: `${CDN_BASE_URL}/transfer/transfer.zkey`,
  },
  mint: {
    wasm: `${CDN_BASE_URL}/mint/mint.wasm`,
    zkey: `${CDN_BASE_URL}/mint/mint.zkey`,
  },
  withdraw: {
    wasm: `${CDN_BASE_URL}/withdraw/withdraw.wasm`,
    zkey: `${CDN_BASE_URL}/withdraw/circuit_final.zkey`,
  },
  burn: {
    wasm: `${CDN_BASE_URL}/burn/burn.wasm`,
    zkey: `${CDN_BASE_URL}/burn/burn.zkey`,
  },
} as const;

// Circuit configuration
export const CIRCUIT_CONFIG = {
  register: {
    wasm: "/RegistrationCircuit.wasm",
    zkey: "/RegistrationCircuit.groth16.zkey",
  },
  mint: {
    wasm: "/MintCircuit.wasm",
    zkey: "/MintCircuit.groth16.zkey",
  },
  transfer: {
    wasm: "/TransferCircuit.wasm",
    zkey: "/TransferCircuit.groth16.zkey",
  },
  withdraw: {
    wasm: "/WithdrawCircuit.wasm",
    zkey: "/WithdrawCircuit.groth16.zkey",
  },
} as const;
