'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { CONSTANTS, NETWORK_CONFIG, CONTRACTS, type ChainKey } from '@/lib/constants';
import { getContractConfig } from '@/lib/contracts';
import { parseUnits, formatUnits } from 'viem';
import { toast } from 'sonner';

type TokenOption = {
  id: string;
  name: string;
  network: ChainKey;
  balance: string;
  icon: string;
};

export function MintPanel() {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { setShowAuthFlow, handleLogOut } = useDynamicContext();
  
  // Get USDT balances for both networks
  const { data: baseBalance } = useBalance({
    address,
    token: CONTRACTS.base.USDT_OFT,
    chainId: NETWORK_CONFIG.base.id,
    query: { enabled: !!address && mounted }
  });

  const { data: arbitrumBalance } = useBalance({
    address,
    token: CONTRACTS.arbitrum.USDT_OFT,
    chainId: NETWORK_CONFIG.arbitrum.id,
    query: { enabled: !!address && mounted }
  });

  // Create token options with balances
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

  // Mint transaction
  const { data: hash, error: writeError, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    query: { enabled: !!hash && mounted }
  });

  // Combined loading state
  const isMinting = isPending || isConfirming;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select token with highest balance
  useEffect(() => {
    if (tokenOptions.length > 0 && !selectedToken) {
      setSelectedToken(tokenOptions[0].id);
    }
  }, [tokenOptions, selectedToken]);

  // Format number with commas and 2 decimal places
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Handle transaction success/error
  useEffect(() => {
    if (isConfirmed && hash) {
      const networkLogo = selectedNetwork === 'base' ? '/logos/base-sepolia.svg' : '/logos/arbitrum-sepolia.svg';
      const networkName = NETWORK_CONFIG[selectedNetwork].name;
      
      toast.success(`Successfully minted ${formatNumber(amount)} USDT!`, {
        description: (
          <div className="flex items-center gap-2">
            <img src={networkLogo} alt={networkName} className="w-4 h-4" />
            <span>Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}</span>
          </div>
        ),
        action: {
          label: 'View',
          onClick: () => {
            const explorerUrl = NETWORK_CONFIG[selectedNetwork].explorer;
            window.open(`${explorerUrl}/tx/${hash}`, '_blank');
          },
        },
      });
      setAmount(''); // Clear the form
    }
  }, [isConfirmed, hash, amount, selectedNetwork]);

  useEffect(() => {
    if (writeError) {
      toast.error('Transaction failed', {
        description: writeError.message || 'Please try again',
      });
    }
  }, [writeError]);

  // Format number with commas for display
  const formatNumber = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US', { maximumFractionDigits: 6 });
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Handle amount blur (format with commas)
  const handleAmountBlur = () => {
    if (amount) {
      setAmount(formatNumber(amount));
    }
  };

  // Get button text and state
  const getButtonState = () => {
    // Prevent hydration mismatch by showing loading state until mounted
    if (!mounted) {
      return { text: 'Loading...', disabled: true, action: 'connect' };
    }
    
    if (!isConnected) {
      return { text: 'Connect Wallet', disabled: false, action: 'connect' };
    }
    
    const targetChainId = NETWORK_CONFIG[selectedNetwork].id;
    if (currentChainId !== targetChainId) {
      return { 
        text: `Switch to ${NETWORK_CONFIG[selectedNetwork].name}`, 
        disabled: false, 
        action: 'switch' 
      };
    }
    
    if (!amount || parseFloat(amount.replace(/,/g, '')) <= 0) {
      return { text: 'Enter Amount', disabled: true, action: 'mint' };
    }
    
    if (isMinting) {
      if (isPending) return { text: 'Confirm in wallet...', disabled: true, action: 'mint' };
      if (isConfirming) return { text: 'Minting...', disabled: true, action: 'mint' };
      return { text: 'Processing...', disabled: true, action: 'mint' };
    }
    
    const formattedAmount = formatNumber(amount);
    return { 
      text: `Mint ${formattedAmount} USDT`, 
      disabled: false, 
      action: 'mint' 
    };
  };

  const handleButtonClick = async () => {
    const { action } = getButtonState();
    
    if (action === 'connect') {
      setShowAuthFlow(true);
    } else if (action === 'switch') {
      const targetChainId = NETWORK_CONFIG[selectedNetwork].id;
      try {
        await switchChain({ chainId: targetChainId });
        // Wait a moment for the chain to fully switch
        setTimeout(() => {
          toast.success(`Switched to ${NETWORK_CONFIG[selectedNetwork].name}`);
        }, 500);
      } catch (error) {
        console.error('Chain switch error:', error);
        toast.error(`Failed to switch to ${NETWORK_CONFIG[selectedNetwork].name}. Please switch manually in your wallet.`);
      }
    } else if (action === 'mint') {
      if (!address) return;
      
      // Double-check we're on the correct chain before minting
      const targetChainId = NETWORK_CONFIG[selectedNetwork].id;
      if (currentChainId !== targetChainId) {
        toast.error(`Please switch to ${NETWORK_CONFIG[selectedNetwork].name} before minting`);
        return;
      }
      
      try {
        // Convert amount to BigInt with proper decimals
        const amountBigInt = parseUnits(amount.replace(/,/g, ''), CONSTANTS.TOKEN.DECIMALS);
        const contractConfig = getContractConfig(selectedNetwork);
        
        // Call mint function on the contract with explicit chain context
        writeContract({
          ...contractConfig,
          functionName: 'mint',
          args: [address, amountBigInt],
          chainId: targetChainId, // Explicitly specify the chain
        });
      } catch (error) {
        console.error('Mint error:', error);
        toast.error('Failed to mint tokens');
      }
    }
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col h-full">
      {/* Form Content */}
      <div className="space-y-4 flex-1">
        {/* Token Selector - Disabled, USDT only */}
        <div className="space-y-6">
        <label className="text-sm font-medium text-muted-foreground">
          Asset
        </label>
        <Select value={selectedToken} onValueChange={(value: string) => setSelectedToken(value)}>
          <SelectTrigger className="w-full [&_svg]:!text-white [&_svg]:!opacity-100">
            <SelectValue placeholder="Select token">
              {selectedToken && tokenOptions.find(token => token.id === selectedToken) && (
                <div className="flex items-center gap-2">
                  <img 
                    src={tokenOptions.find(token => token.id === selectedToken)?.icon} 
                    alt={tokenOptions.find(token => token.id === selectedToken)?.name} 
                    className="w-5 h-5" 
                  />
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

      {/* Network Display - Auto-determined by token selection */}
      <div className="space-y-6">
        <label className="text-sm font-medium text-muted-foreground">
          Testnet
        </label>
        <div className="flex items-center gap-2 h-9 px-3 py-2 border border-input rounded-md">
          <img 
            src={selectedNetwork === 'base' ? '/logos/base-sepolia.svg' : '/logos/arbitrum-sepolia.svg'} 
            alt={selectedNetwork === 'base' ? 'Base Sepolia' : 'Arbitrum Sepolia'} 
            className="w-5 h-5" 
          />
          <span className="text-sm">
            {selectedNetwork === 'base' ? 'Base' : 'Arbitrum'}
          </span>
        </div>
      </div>

      {/* Amount Input */}
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

              {/* Wallet Status */}
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

      {/* CTA Button - Fixed at bottom */}
      <div className="mt-auto">
        <Button 
          className={`w-full font-medium border border-input ${
            buttonState.text === 'Mint' 
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