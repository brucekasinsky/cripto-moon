'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface WalletChartProps {
  className?: string;
}

type TimeFilter = '24H' | '1W' | '1M' | 'All';

export function WalletChart({ className }: WalletChartProps) {
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('1W');

  const filters: TimeFilter[] = ['24H', '1W', '1M', 'All'];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
          <p className="text-sm text-muted-foreground">
            Track your wallet performance over time
          </p>
        </div>
        
        {/* Time Filters */}
        <div className="inline-flex w-full sm:w-fit overflow-x-auto hide-scrollbar bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/50 rounded-2xl p-0.5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={cn(
                'flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl whitespace-nowrap text-xs sm:text-sm transition-all duration-200 relative mx-0.5 first:ml-0 last:mr-0',
                selectedFilter === filter
                  ? 'text-emerald-400 bg-emerald-400/[0.08] shadow-sm shadow-emerald-400/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-neutral-900/20 backdrop-blur-sm border border-neutral-800/30 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              $12,345.67
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-neutral-400">Total Value</span>
              <span className="text-sm text-emerald-400 flex items-center gap-1">
                <span>↗</span>
                +2.34% (24H)
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-right">
              <div className="text-lg font-semibold text-neutral-200">
                +$234.56
              </div>
              <div className="text-sm text-neutral-400">
                24H P&L
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="h-64 bg-neutral-900/30 rounded-xl border border-neutral-800/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-400/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-neutral-400 text-sm">
              Chart will be rendered here
            </p>
            <p className="text-neutral-500 text-xs mt-1">
              Selected: {selectedFilter}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-neutral-900/40 rounded-xl p-4 border border-neutral-800/20">
            <div className="text-sm text-neutral-400 mb-1">Open Positions</div>
            <div className="text-lg font-semibold text-neutral-200">12</div>
          </div>
          <div className="bg-neutral-900/40 rounded-xl p-4 border border-neutral-800/20">
            <div className="text-sm text-neutral-400 mb-1">Win Rate</div>
            <div className="text-lg font-semibold text-emerald-400">68.5%</div>
          </div>
          <div className="bg-neutral-900/40 rounded-xl p-4 border border-neutral-800/20">
            <div className="text-sm text-neutral-400 mb-1">Avg Trade</div>
            <div className="text-lg font-semibold text-neutral-200">$156.78</div>
          </div>
          <div className="bg-neutral-900/40 rounded-xl p-4 border border-neutral-800/20">
            <div className="text-sm text-neutral-400 mb-1">Total Volume</div>
            <div className="text-lg font-semibold text-neutral-200">$45.2K</div>
          </div>
        </div>
      </div>
    </div>
  );
}
