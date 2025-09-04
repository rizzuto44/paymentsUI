import { MyOFTABI } from './MyOFT.abi';
import { CONTRACTS, NETWORK_CONFIG, type ChainKey } from '../constants';

// Contract addresses and ABI exports
export { MyOFTABI };
export { CONTRACTS };

// Contract configuration for wagmi
export const getContractConfig = (chainKey: ChainKey) => ({
  address: CONTRACTS[chainKey].USDT_OFT,
  abi: MyOFTABI,
});

// Helper to get contract config with chain info
export const getContractWithChain = (chainKey: ChainKey) => ({
  ...getContractConfig(chainKey),
  chainId: NETWORK_CONFIG[chainKey].id,
});

// Type definitions for contract interactions
export interface SendParam {
  dstEid: number;
  to: `0x${string}`;
  amountLD: bigint;
  minAmountLD: bigint;
  extraOptions: `0x${string}`;
  composeMsg: `0x${string}`;
  oftCmd: `0x${string}`;
}

export interface MessagingFee {
  nativeFee: bigint;
  lzTokenFee: bigint;
}

export interface MessagingReceipt {
  guid: `0x${string}`;
  nonce: bigint;
  fee: MessagingFee;
}

export interface OFTReceipt {
  amountSentLD: bigint;
  amountReceivedLD: bigint;
} 