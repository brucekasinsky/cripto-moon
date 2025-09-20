'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Activity,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUserWallet } from '@/hooks/use-user-wallet';

export default function MyWalletPage() {
  const {
    walletData,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    updateCopyTradingSettings
  } = useUserWallet();

  const [formData, setFormData] = useState({
    walletAddress: '',
    accountId: '',
    privateKey: ''
  });

  const [copyTradingSettings, setCopyTradingSettings] = useState({
    maxTradeSize: 1000,
    riskPercentage: 2,
    maxOpenPositions: 5,
    autoCopyEnabled: true,
    stopLossEnabled: true
  });

  // Update form data when wallet data changes
  useEffect(() => {
    if (walletData) {
      setFormData({
        walletAddress: walletData.walletAddress || '',
        accountId: walletData.accountId || '',
        privateKey: ''
      });
      setCopyTradingSettings({
        maxTradeSize: walletData.maxTradeSize,
        riskPercentage: walletData.riskPercentage,
        maxOpenPositions: walletData.maxOpenPositions,
        autoCopyEnabled: walletData.autoCopyEnabled,
        stopLossEnabled: walletData.stopLossEnabled
      });
    }
  }, [walletData]);

  const handleSaveHyperliquid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.walletAddress || !formData.accountId || !formData.privateKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    const success = await connectWallet(
      formData.walletAddress,
      formData.accountId,
      formData.privateKey
    );

    if (success) {
      setFormData(prev => ({ ...prev, privateKey: '' })); // Clear private key after successful connection
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
  };

  const handleSaveCopyTradingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateCopyTradingSettings(copyTradingSettings);
    
    if (success) {
      toast.success('Copy trading settings saved successfully!');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Show loading state
  if (isLoading && !walletData) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading wallet settings...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !walletData) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Wallet</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground">
          Manage your Hyperliquid wallet connection and copy trading settings.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Hyperliquid Wallet Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Hyperliquid Wallet
            </CardTitle>
            <CardDescription>
              Connect your Hyperliquid wallet to enable copy trading.
            </CardDescription>
          </CardHeader>
          
          {walletData?.isConnected ? (
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={walletData?.walletAddress || ''}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(walletData?.walletAddress || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account ID</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={walletData?.accountId || ''}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(walletData?.accountId || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Security Notice</p>
                  <p>Your private key is encrypted and stored securely. Never share it with anyone.</p>
                </div>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSaveHyperliquid}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    placeholder="0x..."
                    value={formData.walletAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Hyperliquid wallet address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountId">Account ID</Label>
                  <Input
                    id="accountId"
                    placeholder="Enter your account ID"
                    value={formData.accountId}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Hyperliquid account identifier
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privateKey">Private Key</Label>
                  <Input
                    id="privateKey"
                    type="password"
                    placeholder="Enter your private key"
                    value={formData.privateKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, privateKey: e.target.value }))}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for executing copy trades
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-18">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium">Important Security Warning</p>
                    <p>Never share your private key with anyone. We encrypt and store it securely.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://app.hyperliquid.xyz', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Hyperliquid
                </Button>
              </CardFooter>
            </form>
          )}

          {walletData?.isConnected && (
            <CardFooter>
              <Button
                variant="destructive"
                onClick={handleDisconnectWallet}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect Wallet'
                )}
              </Button>
            </CardFooter>
          )}
         </Card>

         {/* Copy Trading Settings */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Activity className="h-5 w-5" />
               Copy Trading Settings
             </CardTitle>
             <CardDescription>
               Configure your copy trading preferences and risk management.
             </CardDescription>
           </CardHeader>
           <form onSubmit={handleSaveCopyTradingSettings}>
             <CardContent className="space-y-6">
               <div className="space-y-2">
                 <Label htmlFor="maxTradeSize">Maximum Trade Size (USDC)</Label>
                 <Input
                   id="maxTradeSize"
                   type="number"
                   placeholder="1000"
                   value={copyTradingSettings.maxTradeSize}
                   onChange={(e) => setCopyTradingSettings(prev => ({ 
                     ...prev, 
                     maxTradeSize: Number(e.target.value) 
                   }))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Maximum amount to copy per trade
                 </p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="riskPercentage">Risk Percentage (%)</Label>
                 <Input
                   id="riskPercentage"
                   type="number"
                   step="0.1"
                   placeholder="2"
                   value={copyTradingSettings.riskPercentage}
                   onChange={(e) => setCopyTradingSettings(prev => ({ 
                     ...prev, 
                     riskPercentage: Number(e.target.value) 
                   }))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Maximum risk per trade as percentage of balance
                 </p>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="maxOpenPositions">Maximum Open Positions</Label>
                 <Input
                   id="maxOpenPositions"
                   type="number"
                   placeholder="5"
                   value={copyTradingSettings.maxOpenPositions}
                   onChange={(e) => setCopyTradingSettings(prev => ({ 
                     ...prev, 
                     maxOpenPositions: Number(e.target.value) 
                   }))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Maximum number of simultaneous positions
                 </p>
               </div>

               <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   id="autoCopy"
                   checked={copyTradingSettings.autoCopyEnabled}
                   onChange={(e) => setCopyTradingSettings(prev => ({ 
                     ...prev, 
                     autoCopyEnabled: e.target.checked 
                   }))}
                   className="rounded border-gray-300"
                 />
                 <Label htmlFor="autoCopy">Enable Auto Copy Trading</Label>
               </div>

               <div className="flex items-center space-x-2 mb-22">
                 <input
                   type="checkbox"
                   id="stopLoss"
                   checked={copyTradingSettings.stopLossEnabled}
                   onChange={(e) => setCopyTradingSettings(prev => ({ 
                     ...prev, 
                     stopLossEnabled: e.target.checked 
                   }))}
                   className="rounded border-gray-300"
                 />
                 <Label htmlFor="stopLoss">Enable Stop Loss Protection</Label>
               </div>
             </CardContent>
             <CardFooter>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Saving...
                   </>
                 ) : (
                   'Save Settings'
                 )}
               </Button>
             </CardFooter>
           </form>
         </Card>
       </div>
    </div>
  );
}
