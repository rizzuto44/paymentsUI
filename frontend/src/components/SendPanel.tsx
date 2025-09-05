'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { useAccount, useChainId, useSwitchChain, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { CONSTANTS, NETWORK_CONFIG, CONTRACTS, type ChainKey, type UsernameRecord } from '@/lib/constants';
import { getContractConfig } from '@/lib/contracts';
import { parseUnits, formatUnits, erc20Abi, isAddress, getAddress } from 'viem';
import { simulateContract, writeContract } from '@wagmi/core';
import { config } from '@/lib/wagmi';
import { toast } from 'sonner';
import { searchUsers } from '@/lib/username';
// Helper function to convert address to bytes32 - with validation
const addressToBytes32 = (address: string): `0x${string}` => {
  // Validate input address
  if (!address || typeof address !== 'string') {
    throw new Error(`Invalid address: ${address}`);
  }
  
  // Ensure address starts with 0x (preserve original case)
  const normalizedAddress = address.startsWith('0x') 
    ? address 
    : `0x${address}`;
  
  // Validate hex format and length (case-insensitive)
  const hexPattern = /^0x[0-9a-fA-F]{40}$/;
  if (!hexPattern.test(normalizedAddress)) {
    console.error('❌ Address validation failed:', {
      originalAddress: address,
      normalizedAddress: normalizedAddress,
      addressLength: normalizedAddress.length,
      expectedLength: 42, // 0x + 40 hex chars
      actualHexLength: normalizedAddress.slice(2).length,
      expectedHexLength: 40,
      addressChars: normalizedAddress.slice(2).split('')
    });
    throw new Error(`Invalid address format: ${address} -> ${normalizedAddress}`);
  }
  
  // Remove 0x prefix and pad to 64 characters (32 bytes) - preserve case
  const cleanAddress = normalizedAddress.slice(2);
  const paddedAddress = cleanAddress.padStart(64, '0');
  
  // Return as hex string
  return `0x${paddedAddress}` as `0x${string}`;
};

type TokenOption = {
  id: string;
  name: string;
  network: ChainKey;
  balance: string;
  icon: string;
};

export function SendPanel() {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UsernameRecord[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<UsernameRecord | null>(null);
  const [amount, setAmount] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { setShowAuthFlow, handleLogOut } = useDynamicContext();
  
  // Transaction state management for simulateContract pattern
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [writeError, setWriteError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Get USDT balances on both networks (same as MintPanel)
  const { data: baseBalance } = useBalance({
    address,
    token: CONTRACTS.base.USDT_OFT,
    chainId: NETWORK_CONFIG.base.id,
    query: { enabled: !!address }
  });

  const { data: arbitrumBalance } = useBalance({
    address,
    token: CONTRACTS.arbitrum.USDT_OFT,
    chainId: NETWORK_CONFIG.arbitrum.id,
    query: { enabled: !!address }
  });

  // Create token options with balances (same as MintPanel)
  const tokenOptions: TokenOption[] = [
    {
      id: 'usdt-base',
      name: 'Tether (Base)',
      network: 'base' as ChainKey,
      balance: baseBalance ? formatUnits(baseBalance.value, baseBalance.decimals) : '0',
      icon: '/logos/usdt.svg'
    },
    {
      id: 'usdt-arbitrum', 
      name: 'Tether (Arbitrum)',
      network: 'arbitrum' as ChainKey,
      balance: arbitrumBalance ? formatUnits(arbitrumBalance.value, arbitrumBalance.decimals) : '0',
      icon: '/logos/usdt.svg'
    }
  ].sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance)); // Sort by balance high to low

  // Get selected network from token selection
  const selectedNetwork = tokenOptions.find(token => token.id === selectedToken)?.network || 'base';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select token with highest balance
  useEffect(() => {
    if (tokenOptions.length > 0 && !selectedToken) {
      console.log('🎯 Auto-selecting token:', tokenOptions[0]);
      setSelectedToken(tokenOptions[0].id);
    }
  }, [tokenOptions, selectedToken]);



  // Debug log for token selection
  useEffect(() => {
    console.log('🔍 Token Selection Debug:', {
      selectedToken,
      selectedNetwork,
      tokenOptions: tokenOptions.map(t => ({ id: t.id, balance: t.balance, network: t.network })),
      hasContract: !!CONTRACTS[selectedNetwork]?.USDT_OFT
    });
  }, [selectedToken, selectedNetwork, tokenOptions]);

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash && isSending) {
      setIsSending(false);
      const explorerUrl = `${NETWORK_CONFIG[selectedNetwork].explorer}/tx/${hash}`;
      toast.success(
        <div className="flex items-center gap-2">
          <img 
            src={selectedNetwork === 'base' ? '/logos/base-sepolia.svg' : '/logos/arbitrum-sepolia.svg'} 
            alt={selectedNetwork === 'base' ? 'Base Sepolia' : 'Arbitrum Sepolia'} 
            className="w-4 h-4" 
          />
          <div>
            Send successful!{' '}
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline"
            >
              View transaction
            </a>
          </div>
        </div>
      );
    }
  }, [isConfirmed, hash, isSending, selectedNetwork]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError && isSending) {
      setIsSending(false);
    }
  }, [writeError, isSending]);

  // Format balance display (same as MintPanel)
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Format number with commas (same as MintPanel)
  const formatNumber = (value: string) => {
    const cleanValue = value.replace(/,/g, '');
    if (!cleanValue || isNaN(Number(cleanValue))) return value;
    return Number(cleanValue).toLocaleString('en-US');
  };

  // Address validation function using viem (FE engineer recommendation)
  function assertValidEthAddress(addr: string): asserts addr is `0x${string}` {
    if (!addr || typeof addr !== 'string') {
      throw new Error(`Invalid address: address is ${typeof addr}`);
    }
    
    if (!isAddress(addr)) {
      throw new Error(`Invalid Ethereum address: ${addr}`);
    }
  }

  // Handle amount input (same as MintPanel)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleAmountBlur = () => {
    if (amount) {
      setAmount(formatNumber(amount));
    }
  };

  // Debounced username search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const result = await searchUsers(searchQuery);
        if (result.error) {
          toast.error(`Search error: ${result.error}`);
          setSearchResults([]);
        } else {
          setSearchResults(result.users);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle recipient selection
  const handleRecipientSelect = (user: UsernameRecord) => {
    setSelectedRecipient(user);
    setSearchQuery(user.username);
    setSearchResults([]);
  };

  // Clear recipient selection
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (selectedRecipient && value !== selectedRecipient.username) {
      setSelectedRecipient(null);
    }
  };

  // Get button text and state (similar to MintPanel)
  const getButtonState = () => {
    // Prevent hydration mismatch by showing loading state until mounted
    if (!mounted) {
      return { text: 'Loading...', disabled: true, action: 'connect' };
    }
    
    if (!isConnected) {
      return { text: 'Connect Wallet', disabled: false, action: 'connect' };
    }
    
    // Check if user needs to switch to the correct network (sender's network)
    const targetChainId = NETWORK_CONFIG[selectedNetwork].id;
    // Check if user needs to switch to the correct network (sender's network)
    if (currentChainId !== targetChainId) {
      return { 
        text: `Switch to ${NETWORK_CONFIG[selectedNetwork].name}`, 
        disabled: false, 
        action: 'switch' 
      };
    }
    
    if (!selectedRecipient) {
      return { text: 'Select Recipient', disabled: true, action: 'send' };
    }
    
    if (!amount || parseFloat(amount.replace(/,/g, '')) <= 0) {
      return { text: 'Enter Amount', disabled: true, action: 'send' };
    }
    
    // Handle transaction states
    if (isSending) {
      if (isPending) return { text: 'Confirm in wallet...', disabled: true, action: 'send' };
      if (isConfirming) return { text: 'Sending...', disabled: true, action: 'send' };
      return { text: 'Processing...', disabled: true, action: 'send' };
    }
    
    const formattedAmount = formatNumber(amount);
    return { 
      text: `Send ${formattedAmount} USDT`, 
      disabled: false, 
      action: 'send' 
    };
  };

  // Main send function
  const sendTokens = async () => {
    if (!address || !selectedRecipient || !amount) return;

    try {
      setIsSending(true);
      setIsPending(true);
      setWriteError(null);
      
      // Parse amount to BigInt
      const amountBigInt = parseUnits(amount.replace(/,/g, ''), CONSTANTS.TOKEN.DECIMALS);
      const recipientAddress = selectedRecipient.ownerAddress;
      
      // 🚨 CRITICAL: Validate address BEFORE any wagmi calls (FE engineer fix)
      console.log('🔍 Validating recipient address:', recipientAddress);
      assertValidEthAddress(recipientAddress);
      
      // Get checksummed address for display/usage
      const checksummedAddress = getAddress(recipientAddress);
      console.log('✅ Address validation passed:', checksummedAddress);
      
      // Determine source and destination chains
      const srcChainId = currentChainId;
      const dstChainId = selectedRecipient.chainKey === 'base' ? 84532 : 421614;
      const isSameChain = srcChainId === dstChainId;
      
      console.log('🔍 Send Transaction Debug:', {
        srcChainId,
        dstChainId, 
        isSameChain,
        recipientAddress: checksummedAddress,
        amount: amountBigInt.toString(),
        recipientChain: selectedRecipient.chainKey,
        selectedToken,
        selectedNetwork,
        contractAddress: CONTRACTS[selectedNetwork]?.USDT_OFT,
        correctedEIDs: 'Base Sepolia: 40245, Arbitrum Sepolia: 40231'
      });

      // Get contract address for current chain
      const contractAddress = CONTRACTS[selectedNetwork]?.USDT_OFT;
      if (!contractAddress) {
        throw new Error(`Contract not found for network: ${selectedNetwork}`);
      }

      if (isSameChain) {
        // Same-chain: Use simulateContract → writeContract with ERC20 transfer
        console.log('📝 Same-chain ERC20 transfer with simulateContract pattern');
        
        const contractCall = {
          address: contractAddress,
          abi: erc20Abi,
          functionName: 'transfer' as const,
          args: [checksummedAddress as `0x${string}`, amountBigInt] as const,
          account: address as `0x${string}`,
          chainId: srcChainId,
        };
        
        console.log('💰 ERC20 Transfer Details:', contractCall);
        
        // Step 1: Simulate the contract call
        console.log('🔍 Simulating ERC20 transfer...');
        const simulationResult = await simulateContract(config, contractCall);
        console.log('✅ Simulation successful:', simulationResult);
        
        // Step 2: Execute the transaction
        console.log('🚀 Executing ERC20 transfer...');
        const txHash = await writeContract(config, simulationResult.request);
        
        setHash(txHash);
        console.log('✅ Transaction submitted:', txHash);
        toast.success('Transaction submitted! Please check your wallet to approve.');
        
      } else {
        // Cross-chain: Use simulateContract → writeContract with LayerZero OFT send
        console.log('🌉 Cross-chain LayerZero OFT send with simulateContract pattern');
        
        const contractConfig = getContractConfig(selectedNetwork);
        const dstEid = selectedRecipient.preferredDstEid; // Now using correct EIDs: 40245/40231
        
        // Build SendParam for LayerZero
        const sendParam = {
          dstEid,
          to: addressToBytes32(checksummedAddress),
          amountLD: amountBigInt,
          minAmountLD: amountBigInt, // No slippage for demo
          extraOptions: '0x' as `0x${string}`,
          composeMsg: '0x' as `0x${string}`,
          oftCmd: '0x' as `0x${string}`,
        };

        // Use reasonable fallback fees (will be improved with quoteSend later)
        const fee = { 
          nativeFee: parseUnits('0.01', 18), // 0.01 ETH for cross-chain
          lzTokenFee: BigInt(0)
        };

        const contractCall = {
          ...contractConfig,
          functionName: 'send' as const,
          args: [sendParam, fee, address as `0x${string}`] as const,
          value: fee.nativeFee, // Must equal nativeFee
          account: address as `0x${string}`, // Explicit account
          chainId: srcChainId, // Explicit chainId
        };

        console.log('💰 Cross-chain OFT Details:', {
          dstEid,
          nativeFee: fee.nativeFee.toString(),
          lzTokenFee: fee.lzTokenFee.toString(),
          contractCall
        });

        // Step 1: Simulate the contract call
        console.log('🔍 Simulating cross-chain OFT send...');
        const simulationResult = await simulateContract(config, contractCall);
        console.log('✅ Simulation successful:', simulationResult);
        
        // Step 2: Execute the transaction
        console.log('🚀 Executing cross-chain OFT send...');
        const txHash = await writeContract(config, simulationResult.request);
        
        setHash(txHash);
        console.log('✅ Cross-chain transaction submitted:', txHash);
        toast.success('Cross-chain transaction submitted! Please check your wallet to approve.');
      }
      
    } catch (error) {
      console.error('❌ Send error:', error);
      setWriteError(error instanceof Error ? error : new Error('Unknown error'));
      
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('rejected')) {
          toast.error('Transaction cancelled by user');
        } else if (error.message.includes('nonce') || error.message.includes('already been used')) {
          toast.error('Transaction nonce conflict - please wait a moment and try again');
        } else {
          toast.error(`Send failed: ${error.message}`);
        }
      } else {
        toast.error('Send failed: Unknown error');
      }
    } finally {
      setIsSending(false);
      setIsPending(false);
    }
  };

  const handleButtonClick = async () => {
    const buttonState = getButtonState();
    console.log('🔘 Button Click Debug:', {
      action: buttonState.action,
      text: buttonState.text,
      disabled: buttonState.disabled,
      isConnected,
      currentChainId,
      selectedNetwork,
      selectedRecipient: selectedRecipient?.username,
      amount,
      isSending
    });
    
    if (buttonState.action === 'connect') {
      console.log('🔗 Connecting wallet...');
      setShowAuthFlow(true);
    } else if (buttonState.action === 'switch') {
      try {
        const targetChainId = NETWORK_CONFIG[selectedNetwork].id;
        console.log(`🔄 Attempting to switch to chain ID: ${targetChainId}`);
        await switchChain({ chainId: targetChainId });
      } catch (error) {
        console.error('Network switch failed:', error);
        // Show fallback message only if switch fails
        toast.error(
          `Unable to switch networks automatically. Please manually switch your wallet to ${NETWORK_CONFIG[selectedNetwork].name} and try again.`,
          { duration: 4000 }
        );
      }
    } else if (buttonState.action === 'send') {
      console.log('💸 Calling sendTokens...');
      await sendTokens();
    }
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col h-full">
      {/* Form Content */}
      <div className="space-y-4 flex-1">
        {/* Token Selector - Same pattern as MintPanel */}
        <div className="space-y-6">
          <label className="text-sm font-medium text-muted-foreground">
            Asset
          </label>
          <Select value={selectedToken} onValueChange={(value: string) => setSelectedToken(value)}>
            <SelectTrigger className="w-full [&_svg]:!text-white [&_svg]:!opacity-100">
              <SelectValue placeholder="Select token">
                {selectedToken && tokenOptions.find(token => token.id === selectedToken) && (
                  <div className="flex items-center gap-2">
                    <img src={tokenOptions.find(token => token.id === selectedToken)?.icon} alt={tokenOptions.find(token => token.id === selectedToken)?.name} className="w-5 h-5" />
                    {tokenOptions.find(token => token.id === selectedToken)?.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tokenOptions.map(token => (
                <SelectItem key={token.id} value={token.id} className="relative">
                  <div className="flex items-center gap-2 pr-16">
                    <img src={token.icon} alt={token.name} className="w-5 h-5" />
                    {token.name}
                  </div>
                  <span className="absolute right-2 text-muted-foreground group-hover:text-foreground">
                    {formatBalance(token.balance)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Username Search */}
        <div className="space-y-6">
          <label className="text-sm font-medium text-muted-foreground">
            Recipient
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full pr-10"
            />
            {selectedRecipient && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {(searchResults.length > 0 || isSearching) && !selectedRecipient && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-input rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {isSearching && (
                  <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                )}
                {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <div className="p-3 text-sm text-muted-foreground text-center">No users found</div>
                )}
                {searchResults.map(user => (
                  <div 
                    key={user.username}
                    onClick={() => handleRecipientSelect(user)}
                    className="p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount Input - Same as MintPanel */}
        <div className="space-y-6">
          <label className="text-sm font-medium text-muted-foreground">
            Amount
          </label>
          <Input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            className="text-lg w-full"
          />
        </div>

        {/* Wallet Status - Same as MintPanel */}
        {mounted && isConnected && (
          <div className="flex items-center justify-between text-sm pt-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Connected</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <Badge 
              variant="outline" 
              className="font-mono cursor-pointer hover:bg-muted/50 transition-colors group"
              onClick={() => {
                if (handleLogOut) {
                  handleLogOut();
                }
              }}
            >
              <span className="group-hover:hidden">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <span className="hidden group-hover:inline">
                Logout
              </span>
            </Badge>
          </div>
        )}
      </div>

      {/* CTA Button - Fixed at bottom, same as MintPanel */}
      <div className="mt-auto">
        <Button 
          className={`w-full font-medium border border-input ${
            buttonState.text === 'Send'
              ? 'bg-muted text-muted-foreground hover:bg-muted/80' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          disabled={buttonState.disabled}
          onClick={handleButtonClick}
        >
          {buttonState.text}
        </Button>
      </div>
    </div>
  );
} 