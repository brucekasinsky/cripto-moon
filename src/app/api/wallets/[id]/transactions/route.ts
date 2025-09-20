import { NextRequest, NextResponse } from 'next/server';
import { HyperliquidService } from '@/lib/hyperliquid';
import { WalletService } from '@/lib/wallet-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get wallet data first
    const walletResponse = await WalletService.getWalletById(id);
    if (!walletResponse.success || !walletResponse.data) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    const wallet = walletResponse.data;

    // Fetch all transactions from Hyperliquid
    console.log(`Fetching all trades for wallet: ${wallet.address}`);
    const tradesResponse = await HyperliquidService.getRealtimeTrades(
      wallet.address,
      wallet.accountId || undefined
    );

    console.log('Trades response:', tradesResponse);

    if (!tradesResponse.success) {
      console.error('Failed to fetch trades:', tradesResponse.error);
      return NextResponse.json(
        { 
          success: false,
          error: tradesResponse.error || 'Failed to fetch transactions from Hyperliquid API',
          transactions: [],
          wallet: {
            id: wallet.id,
            name: wallet.name,
            address: wallet.address
          },
          lastUpdate: new Date().toISOString()
        },
        { status: 200 } // Return 200 but with error info
      );
    }

    // Transform the data to match our transaction format
    const transactions = (tradesResponse.data || []).map((trade: any) => ({
      id: trade.id || `${trade.timestamp}-${trade.coin}-${trade.side}`,
      coin: trade.coin,
      side: trade.side,
      size: Number(trade.size),
      price: Number(trade.price),
      timestamp: trade.timestamp,
      pnl: (trade.pnl && trade.pnl !== 0) ? Number(trade.pnl) : undefined,
      status: 'pending' // TODO: Implementar lógica de copytrade (pending/copied/failed)
    }));

    console.log(`Transformed ${transactions.length} transactions`);

    // Sort by timestamp (most recent first)
    transactions.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      transactions,
      wallet: {
        id: wallet.id,
        name: wallet.name,
        address: wallet.address
      },
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
