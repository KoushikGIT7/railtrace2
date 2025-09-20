# 🚂 RailTrace Frontend

A modern, mobile-first React application for railway part lifecycle tracking with blockchain integration.

## 🚀 Features

- **Mobile-First Design**: Responsive UI optimized for all devices
- **Real-Time Updates**: Live blockchain data integration
- **Batch Operations**: Cost-optimized blockchain transactions
- **QR Code Integration**: Part tracking with QR generation/scanning
- **Multi-Role Dashboard**: Admin, Engineer, Inspector, Vendor, Depot views
- **Firebase Integration**: Real-time database and authentication
- **Blockchain Integration**: BSC Testnet with Railway server

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: ethers.js v6 + BSC Testnet
- **Backend**: Railway server with batch operations
- **Database**: Firebase Firestore
- **Deployment**: Netlify

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/KoushikGIT7/railtrace2.git
cd railtrace2

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Railway Server Configuration
VITE_RELAYER_URL=https://discerning-wonder-production-3da7.up.railway.app
VITE_CONTRACT_ADDRESS=0x48D3250BC9d205877E3D496B20d824dc2Cd4FA96
VITE_BLOCKCHAIN_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 🏗️ Build & Deploy

### Local Build
```bash
npm run build
npm run preview
```

### Netlify Deployment
```bash
npm run build:netlify
```

The app is configured for automatic Netlify deployment with:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

## 📱 Mobile Optimization

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch-Friendly**: Optimized buttons and interactions
- **Performance**: Lazy loading and code splitting
- **PWA Ready**: Service worker support for offline functionality

## 🔗 Integration

### Railway Server
- **Endpoint**: `https://discerning-wonder-production-3da7.up.railway.app`
- **Features**: Batch operations, rate limiting, ENS disabled
- **Cost Savings**: 75% reduction in gas fees

### Blockchain
- **Network**: BSC Testnet (Chain ID: 97)
- **Contract**: `0x48D3250BC9d205877E3D496B20d824dc2Cd4FA96`
- **Features**: Batch operations, real-time events

## 🎯 User Roles

1. **Admin**: Full system access, user management, analytics
2. **Engineer**: Part installation, maintenance tracking
3. **Inspector**: Quality control, inspection reports
4. **Vendor**: Part registration, supply chain management
5. **Depot**: Inventory management, part storage

## 📊 Real-Time Features

- **Live Activity Timeline**: Real-time updates from blockchain
- **Batch Operations Widget**: Cost savings and performance metrics
- **Event Polling**: 30-second intervals for fresh data
- **Firestore Integration**: Instant UI updates

## 🚀 Performance

- **Bundle Size**: Optimized with Vite
- **Loading**: Skeleton loaders for smooth UX
- **Caching**: Smart caching for blockchain data
- **Lazy Loading**: Component-based code splitting

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run build:netlify` - Build for Netlify

### Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard/      # Role-specific dashboards
│   ├── Auth/          # Authentication components
│   ├── QR/            # QR code functionality
│   └── ui/            # Reusable UI components
├── services/          # API and blockchain services
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── config/            # Configuration files
```

## 🐛 Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure all required variables are set
2. **Railway Connection**: Check server status at `/health` endpoint
3. **Blockchain**: Verify BSC Testnet connection
4. **Firebase**: Confirm project configuration

### Support
- Check Railway logs for server issues
- Verify environment variables in Netlify
- Test blockchain connection with BSC Testnet

## 📄 License

This project is part of the RailTrace system for railway part lifecycle tracking.

---

**Built with ❤️ for Railway Industry Innovation**
