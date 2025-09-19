# Netlify Deployment Guide for Railway Parts Management System

## Prerequisites
- GitHub account
- Netlify account
- Backend already deployed on Render (https://railway-blockchain2.onrender.com/relayer)

## Step 1: Prepare Repository for GitHub

### 1.1 Initialize Git (if not done)
```bash
git init
git add .
git commit -m "Initial commit: Railway Parts Management System"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New Repository"
3. Repository name: `railway-parts-management`
4. Description: `Blockchain-based Railway Parts Management System`
5. Make it Public
6. Don't initialize with README (we already have files)

### 1.3 Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/railway-parts-management.git
git push -u origin main
```

## Step 2: Deploy to Netlify

### 2.1 Connect to Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "New site from Git"
4. Choose "GitHub" as provider
5. Select your repository: `railway-parts-management`

### 2.2 Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` (or latest)

### 2.3 Set Environment Variables
In Netlify dashboard, go to Site settings > Environment variables:

```
VITE_BLOCKCHAIN_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
VITE_CONTRACT_ADDRESS=0x265c23BE0D06a5B07775A594F00E20d505eFBA2c
VITE_RELAYER_ENDPOINT=https://railway-blockchain2.onrender.com/relayer
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2.4 Deploy
1. Click "Deploy site"
2. Wait for build to complete
3. Your site will be available at: `https://your-site-name.netlify.app`

## Step 3: Configure Firebase for Production

### 3.1 Update Firebase Configuration
Make sure your Firebase project is configured for the production domain:
1. Go to Firebase Console
2. Authentication > Settings > Authorized domains
3. Add your Netlify domain: `your-site-name.netlify.app`

### 3.2 Update Firestore Rules (if needed)
Ensure your Firestore rules allow access from the production domain.

## Step 4: Test Production Deployment

### 4.1 Test Features
- [ ] User authentication
- [ ] Blockchain transactions
- [ ] Real-time data updates
- [ ] AI analytics
- [ ] Report generation
- [ ] Mobile responsiveness

### 4.2 Monitor Performance
- Check Netlify analytics
- Monitor build logs
- Test on different devices

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check environment variables
2. **CORS Errors**: Verify backend CORS settings
3. **Firebase Auth Issues**: Check authorized domains
4. **Blockchain Errors**: Verify contract address and RPC URL

### Debug Steps:
1. Check Netlify build logs
2. Verify environment variables
3. Test API endpoints
4. Check browser console for errors

## Production Checklist

- [ ] Repository pushed to GitHub
- [ ] Netlify site deployed
- [ ] Environment variables set
- [ ] Firebase configured for production
- [ ] Backend CORS allows Netlify domain
- [ ] All features tested
- [ ] Mobile responsiveness verified
- [ ] Performance optimized

## Support

If you encounter issues:
1. Check Netlify build logs
2. Verify all environment variables
3. Test locally with production environment
4. Check browser console for errors

