# 🚀 RailTrace Frontend Deployment Guide

## 📋 Prerequisites

- Netlify account
- GitHub repository access
- Environment variables ready

## 🌐 Netlify Deployment

### Step 1: Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose "GitHub" and authorize
4. Select repository: `KoushikGIT7/railtrace2`

### Step 2: Build Settings
```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### Step 3: Environment Variables
Add these in Netlify → Site Settings → Environment Variables:

```bash
# Railway Server Configuration
VITE_RELAYER_URL=https://discerning-wonder-production-3da7.up.railway.app
VITE_CONTRACT_ADDRESS=0x48D3250BC9d205877E3D496B20d824dc2Cd4FA96
VITE_BLOCKCHAIN_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# Firebase Configuration (Replace with your values)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Step 4: Deploy
1. Click "Deploy site"
2. Wait for build to complete
3. Test the deployed site

## 🔧 Local Testing

### Test Build Locally
```bash
npm run build
npm run preview
```

### Test with Railway Server
```bash
# Start local development
npm run dev

# Test API endpoints
curl https://discerning-wonder-production-3da7.up.railway.app/health
curl https://discerning-wonder-production-3da7.up.railway.app/api/events/recent
```

## 🚨 Troubleshooting

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check for TypeScript errors

### Runtime Issues
- Verify environment variables are set
- Check Railway server status
- Test blockchain connection

### Performance Issues
- Enable Netlify's CDN
- Check bundle size
- Optimize images and assets

## 📊 Monitoring

### Netlify Analytics
- Enable Netlify Analytics
- Monitor build times
- Track performance metrics

### Railway Monitoring
- Check server logs
- Monitor API response times
- Track blockchain transaction success

## 🔄 Continuous Deployment

### Automatic Deploys
- Push to `main` branch triggers deploy
- Preview deploys for pull requests
- Branch-based deployments

### Manual Deploys
- Trigger deploy from Netlify dashboard
- Deploy specific commits
- Rollback to previous versions

## 🎯 Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Environment variables are set
- [ ] Railway server connection works
- [ ] Blockchain integration functions
- [ ] Firebase authentication works
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

## 📱 Mobile Testing

### Test on Real Devices
- iOS Safari
- Android Chrome
- Various screen sizes
- Touch interactions

### Performance Testing
- Lighthouse audit
- Core Web Vitals
- Mobile-specific metrics

---

**Ready for Production! 🚀**
