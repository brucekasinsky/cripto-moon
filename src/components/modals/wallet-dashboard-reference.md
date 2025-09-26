# Wallet Dashboard Reference - Complete Feature List

## 📋 Complete Information List from Reference Image

### 🔝 **Top Header Bar**
- **Back Button**: "< Back" (top left corner)
- **Wallet Address**: "0xf520...5706" with star icon (favorites) and copy icon
- **Copy Trade Button**: Green highlighted button with white text "Copy Trade" (center)
- **Search Bar**: "Q Search by address" (top right corner)

### ⚙️ **Control Panel/Backtest Section**
- **Title**: "Run Backtest:"
- **Investment Field**: "10000 $" (investment amount)
- **Copy Ratio**: "1 X" with dropdown "30D"
- **Success Status**: Green checkmark
- **Backtest PnL**: "$1,080.22" with question mark icon

### 📊 **Performance Metrics Grid (Central Cards)**
1. **Perps Balance**: "$190,036.73"
2. **All PnL**: "$168,606.20" (green text)
3. **Trader Age**: "9 months"
4. **Max Drawdown**: "28.29%"
5. **Direction Bias**: "Short 16%"
6. **Last Trade**: "1 minute"
7. **Win Rate**: "56.31%"
8. **Margin Usage**: "56.74%" with horizontal progress bar
9. **Profit Factor**: "3.28"
10. **Sharpe**: "0.05" (red text)
11. **Avg Hold time**: "1.89 days"
12. **Position L/S**: "0.93"
13. **Position Size**: "$972.3K" (green text)
14. **uPNL**: "$43.5K" (green text)

### 📈 **PnL Chart Section (Bottom Left)**
- **Timeframe Filters**: Tabs "1D", "7D", "30D", "All" (All selected in green)
- **Chart Type Filters**: Tabs "Balance" and "PNL" (PNL selected in green)
- **Display Value**: "$168,606.20" below the tabs
- **Area Chart**: Vibrant green with upward trend
- **X-axis**: Dates from "2025" to "09/2025" with monthly intervals
- **Y-axis**: Values from "$0.00" to "$400.0K" in $100K increments
- **Trend**: Peak at 03/2025 (>$300K), dip at 08/2025 (<$100K), recovery at end
- **Watermark**: "Apexliquid.bot" semi-transparent overlay

### 📊 **Return on Equity (ROE) Section (Bottom Right)**
1. **1D ROE**: "36.85%" (green text)
2. **7D ROE**: "33.57%" (green text)
3. **30D ROE**: "50.81%" (green text)
4. **ALL TIME ROE**: "249.84%" (green text)

### 🎨 **Color Scheme and Styling**
- **Theme**: Dark mode with black/dark gray background
- **Text**: White/light gray for readability
- **Positive Indicators**: Bright green
- **Negative Indicators**: Red (e.g., Sharpe ratio)
- **Interactive Elements**: Green highlight
- **Cards**: Dark gray with rounded corners

### 🔧 **Identified Functionalities**
- Favorites system (star icon)
- Wallet address copying
- Copy trading with ratio configuration
- Backtesting with configurable investment
- Timeframe filters for charts
- Toggle between Balance and PnL
- Progress bar for margin usage
- Branding watermark

## 🎯 Implementation Status

### ✅ **Completed**
- Complete dashboard layout structure
- All performance metrics cards (14 cards total)
- Header with navigation and copy trade button
- Backtest configuration section
- PnL chart with timeframe and type filters
- ROE section with 4 metrics
- Dark theme styling
- Responsive grid layout
- Interactive elements (tabs, buttons, inputs)

### 🔄 **Next Steps**
- Connect to real API data instead of mock data
- Implement actual backtest calculations
- Add real-time data updates
- Implement copy trading functionality
- Add more interactive features

## 📁 **Files Created**
- `src/components/modals/wallet-dashboard.tsx` - Main dashboard component
- `src/components/modals/wallet-dashboard-reference.md` - This reference file
- `src/assets/reference-images/wallet-dashboard-reference.jpg` - Reference image

## 🔗 **Integration**
The dashboard is integrated into the existing modal system:
- `wallet-details-modal.tsx` now uses `WalletDashboard` component
- Fullscreen modal layout maintained
- All existing functionality preserved



