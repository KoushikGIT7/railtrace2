# RailTrace - Railway Fittings Lifecycle Management System

## Overview

RailTrace is a comprehensive digital identity system for railway track fittings that leverages **QR codes**, **Blockchain technology**, and **AI analytics** to ensure complete traceability and quality management throughout the entire lifecycle of railway components.

## 🚀 Key Features

### Core Technologies
- **Blockchain Integration**: Immutable audit trail using Ethereum with ethers.js
- **AI Analytics**: Vendor performance analysis and defect prediction using Gemini API
- **QR Code System**: Unique digital identity for each railway fitting
- **Offline-First Design**: Field operations continue without internet connectivity
- **Role-Based Access Control**: Secure dashboards for different stakeholders

### Stakeholder Roles
- **Admin (Railways HQ)**: Complete oversight, AI insights, user management
- **Vendor**: Part registration, QR generation, performance tracking
- **Depot Officer**: Shipment verification, inventory management
- **Engineer**: Field installation logging with GPS tracking
- **Inspector**: Quality inspections with media evidence

## 🔧 Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Firebase** for authentication and storage
- **ethers.js** for blockchain interactions
- **Dexie.js** for offline IndexedDB storage
- **Recharts** for data visualization

### Blockchain Layer
- **Private Ethereum Network** (PoA/Besu/Quorum)
- **Smart Contract Events**: Registered, Received, Installed, Inspected, Retired
- **Relayer Service**: Users never handle wallets directly
- **Hash-based Verification**: Tamper-proof lifecycle records

### AI Integration
- **Gemini API** for vendor performance analysis
- **Predictive Analytics** for failure detection
- **Anomaly Detection** for quality control
- **Health Scoring** system for parts

## 🏗️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Gemini API key
- Private Ethereum network (for production)

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd railtrace
npm install
```

2. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase config to `src/config/firebase.ts`

3. **Configure Gemini API**
   - Get API key from Google AI Studio
   - Update `src/config/gemini.ts` with your API key

4. **Start Development Server**
```bash
npm run dev
```

## 👤 Admin Account Setup

### Hardcoded Admin Credentials

The system includes pre-configured admin accounts that bypass the approval process:

**Admin Email Addresses** (Auto-approved):
- `admin@railtrace.com`
- `admin@railtrace.gov.in`
- `admin@indianrailways.gov.in`
- `hq@railtrace.gov.in`

**Initial Admin Setup**:
1. Register using `admin@railtrace.com` or one of the admin email addresses above
2. Use any secure password (minimum 6 characters)
3. Account will be automatically approved and granted admin privileges
4. Access full admin dashboard with user management capabilities

### Admin Capabilities
- **User Management**: Approve/reject user registrations
- **Blockchain Audit**: View complete audit trails
- **AI Analytics**: Vendor performance insights and predictions
- **Global Search**: Search across all parts, vendors, and inspections
- **Report Generation**: Export blockchain-verified reports

## 🔄 Lifecycle Flow

### 1. Vendor Registration
```
Vendor uploads batch → QR codes generated → Blockchain record created
↓
registerPart(partHash, vendorId, lotId) → Transaction hash returned
```

### 2. Depot Receipt
```
Depot scans QR → Validates with blockchain → Records receipt
↓
receivePart(partHash, depotId) → Inventory updated
```

### 3. Field Installation
```
Engineer scans QR → Records GPS location → Uploads photo evidence
↓
installPart(partHash, gps, engineerId) → Installation logged
```

### 4. Quality Inspection
```
Inspector scans QR → Views complete history → Records inspection
↓
inspectPart(partHash, inspectorId, resultCode, mediaHash) → AI health score
```

## 📱 Offline Capabilities

### Field Operations Support
- **Local Storage**: IndexedDB for offline data caching
- **Sync Queue**: Automatic synchronization when online
- **Media Handling**: Local file storage with cloud sync
- **Status Indicators**: Clear offline/online status display

### Sync Process
1. Data stored locally when offline
2. Queued for blockchain submission
3. Automatic sync when connectivity restored
4. Verification status updates in real-time

## 🎨 Design System

### Swiss Bento Grid Layout
- **Modular Cards**: Clean, organized information display
- **Heavy White Space**: Improved readability and focus
- **Color-Coded System**:
  - 🟢 Green: OK/Verified/Good condition
  - 🟡 Yellow: Warning/Pending/Due soon
  - 🔴 Red: Critical/Defective/Failed

### Verification Seals
- ✅ **Green Seal**: Blockchain verified
- ⏳ **Yellow Seal**: Pending verification
- ⚪ **Grey Seal**: Off-chain only

## 🔐 Security Features

### Authentication & Authorization
- **Firebase Authentication**: Secure email/password login
- **Role-Based Access**: Granular permissions per user type
- **Admin Approval**: All non-admin accounts require approval
- **Session Management**: Automatic logout and token refresh

### Blockchain Security
- **Hash Verification**: Tamper-proof record integrity
- **Private Network**: Controlled access to blockchain
- **Relayer Pattern**: No direct wallet management for users
- **Event Logging**: Complete audit trail

### Data Protection
- **Encrypted Storage**: Firebase security rules
- **Media Hashing**: Content integrity verification
- **Offline Security**: Local data encryption
- **Access Logging**: User activity tracking

## 📊 Analytics & Reporting

### AI-Powered Insights
- **Vendor Scoring**: 0-100 performance ratings
- **Failure Prediction**: Proactive maintenance alerts
- **Defect Trending**: Pattern recognition and analysis
- **Risk Assessment**: Component health scoring

### Interactive Dashboards
- **Real-time Charts**: Vendor performance, defect trends
- **Heatmaps**: Geographic failure distribution
- **Timeline Views**: Complete part lifecycle visualization
- **Export Functions**: PDF/CSV report generation

## 🚀 Deployment

### Production Checklist
- [ ] Configure production Firebase project
- [ ] Set up private Ethereum network
- [ ] Deploy relayer service backend
- [ ] Configure domain and SSL certificates
- [ ] Set up monitoring and logging
- [ ] Test all role-based workflows


## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add comprehensive logging
5. Write unit tests for critical functions
6. Document all API integrations

### Code Structure
```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Role-specific dashboards
│   ├── QR/            # QR code generation/scanning
│   ├── Admin/         # Admin-only components
│   └── ui/            # Reusable UI components
├── contexts/          # React contexts
├── services/          # Business logic services
├── config/           # Configuration files
└── types/            # TypeScript definitions
```

## 📞 Support

### Technical Support
- **Email**: support@railtrace.gov.in
- **Documentation**: Internal wiki and API docs
- **Training**: Role-specific user manuals available

### System Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS 14+, Android 8+
- **Network**: Offline capability with periodic sync
- **Storage**: 100MB local storage for offline data

---

**Ministry of Railways | Government of India**  
*Digital India Initiative - Railway Infrastructure Modernization*

© 2024 Indian Railways. All rights reserved.
