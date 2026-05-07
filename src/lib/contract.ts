// PurCC Membership — 前端合約整合（針對以太生態系 EVM 鏈）
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";

export const MEMBERSHIP_ABI = [
  "function subscribeMonthly(uint8 tier) payable",
  "function subscribeYearly(uint8 tier) payable",
  "function subscribeMonths(uint8 tier, uint8 months) payable",
  "function quote(uint8 tier, uint8 months, bool yearly) view returns (uint256)",
  "function isActive(address user) view returns (bool)",
  "function tierOf(address user) view returns (uint8)",
  "function memberships(address) view returns (uint8 tier, uint64 expiresAt)",
  "function basicMonthlyPrice() view returns (uint256)",
  "function premiumMonthlyPrice() view returns (uint256)",
  "event Subscribed(address indexed user, uint8 tier, uint256 monthsAdded, uint64 newExpiresAt, uint256 paid)",
];

export type ChainInfo = {
  chainId: number;
  hexId: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorer: string;
  contract?: string; // 合約地址（部署後填入）
  testnet?: boolean;
};

export const SUPPORTED_CHAINS: Record<number, ChainInfo> = {
  1: {
    chainId: 1, hexId: "0x1", name: "Ethereum", symbol: "ETH",
    rpcUrl: "https://eth.llamarpc.com", explorer: "https://etherscan.io",
  },
  8453: {
    chainId: 8453, hexId: "0x2105", name: "Base", symbol: "ETH",
    rpcUrl: "https://mainnet.base.org", explorer: "https://basescan.org",
  },
  42161: {
    chainId: 42161, hexId: "0xa4b1", name: "Arbitrum One", symbol: "ETH",
    rpcUrl: "https://arb1.arbitrum.io/rpc", explorer: "https://arbiscan.io",
  },
  10: {
    chainId: 10, hexId: "0xa", name: "Optimism", symbol: "ETH",
    rpcUrl: "https://mainnet.optimism.io", explorer: "https://optimistic.etherscan.io",
  },
  137: {
    chainId: 137, hexId: "0x89", name: "Polygon", symbol: "MATIC",
    rpcUrl: "https://polygon-rpc.com", explorer: "https://polygonscan.com",
  },
  11155111: {
    chainId: 11155111, hexId: "0xaa36a7", name: "Sepolia", symbol: "ETH",
    rpcUrl: "https://rpc.sepolia.org", explorer: "https://sepolia.etherscan.io",
    testnet: true,
  },
};

// 合約地址（部署後請填入；目前為 demo 預留）
export const MEMBERSHIP_CONTRACTS: Record<number, string> = {
  // 1: "0x...",
  // 8453: "0x...",
  // 11155111: "0x...",
};

export type Tier = 0 | 1 | 2; // None / Basic / Premium
export const TIER_NAME: Record<Tier, "Free" | "Basic" | "Premium"> = {
  0: "Free", 1: "Basic", 2: "Premium",
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasWallet() {
  return typeof window !== "undefined" && !!window.ethereum;
}

export async function getProvider() {
  if (!hasWallet()) throw new Error("NO_WALLET");
  return new BrowserProvider(window.ethereum);
}

export async function getChainId(): Promise<number> {
  const p = await getProvider();
  const net = await p.getNetwork();
  return Number(net.chainId);
}

export async function switchChain(chainId: number) {
  const info = SUPPORTED_CHAINS[chainId];
  if (!info) throw new Error("UNSUPPORTED_CHAIN");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: info.hexId }],
    });
  } catch (err: any) {
    if (err?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: info.hexId,
          chainName: info.name,
          nativeCurrency: { name: info.symbol, symbol: info.symbol, decimals: 18 },
          rpcUrls: [info.rpcUrl],
          blockExplorerUrls: [info.explorer],
        }],
      });
    } else {
      throw err;
    }
  }
}

export async function getMembershipContract() {
  const chainId = await getChainId();
  const addr = MEMBERSHIP_CONTRACTS[chainId];
  if (!addr) throw new Error("CONTRACT_NOT_DEPLOYED");
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return new Contract(addr, MEMBERSHIP_ABI, signer);
}

export async function quotePrice(tier: 1 | 2, months: number, yearly: boolean): Promise<bigint> {
  const c = await getMembershipContract();
  return await c.quote(tier, months, yearly);
}

export async function subscribe(tier: 1 | 2, opts: { yearly?: boolean; months?: number } = {}) {
  const c = await getMembershipContract();
  const value = await c.quote(tier, opts.months ?? (opts.yearly ? 12 : 1), !!opts.yearly);
  if (opts.yearly) return await c.subscribeYearly(tier, { value });
  if (opts.months) return await c.subscribeMonths(tier, opts.months, { value });
  return await c.subscribeMonthly(tier, { value });
}

export async function fetchMyMembership(addr: string) {
  try {
    const c = await getMembershipContract();
    const [tier, expiresAt] = await c.memberships(addr);
    return { tier: Number(tier) as Tier, expiresAt: Number(expiresAt) };
  } catch {
    return { tier: 0 as Tier, expiresAt: 0 };
  }
}

export { formatEther, parseEther };
