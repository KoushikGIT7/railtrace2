const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Contract ABI - matches RailTrace.sol
const RAILTRACE_ABI = [
  "function registerPart(bytes32 partHash, string calldata metadata) external",
  "function receivePart(bytes32 partHash, string calldata metadata) external", 
  "function installPart(bytes32 partHash, string calldata metadata) external",
  "function inspectPart(bytes32 partHash, string calldata metadata) external",
  "function retirePart(bytes32 partHash, string calldata metadata) external",
  "function getPartHistory(bytes32 partHash) external view returns (tuple(uint8 status, uint256 timestamp, string metadata)[] memory)",
  "event Registered(bytes32 indexed partHash, string metadata, uint256 timestamp)",
  "event Received(bytes32 indexed partHash, string metadata, uint256 timestamp)",
  "event Installed(bytes32 indexed partHash, string metadata, uint256 timestamp)",
  "event Inspected(bytes32 indexed partHash, string metadata, uint256 timestamp)",
  "event Retired(bytes32 indexed partHash, string metadata, uint256 timestamp)"
];

// Initialize provider and wallet
let provider, wallet, contract;

async function initializeBlockchain() {
  try {
    const rpcUrl = process.env.BSC_TESTNET_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      throw new Error('Missing required environment variables: BSC_TESTNET_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS');
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, RAILTRACE_ABI, wallet);

    console.log('✅ Blockchain initialized successfully');
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`👤 Wallet: ${wallet.address}`);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
  } catch (error) {
    console.error('❌ Failed to initialize blockchain:', error.message);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Main relayer endpoint
app.post('/relayer', async (req, res) => {
  try {
    const { method, params } = req.body;

    if (!method || !params) {
      return res.status(400).json({ 
        error: 'Missing method or params in request body' 
      });
    }

    console.log(`📨 Received request: ${method}`);
    console.log(`📋 Params:`, params);

    let tx;
    
    switch (method) {
      case 'registerPart':
        tx = await contract.registerPart(params[0], params[1]);
        break;
      case 'receivePart':
        tx = await contract.receivePart(params[0], params[1]);
        break;
      case 'installPart':
        tx = await contract.installPart(params[0], params[1]);
        break;
      case 'inspectPart':
        tx = await contract.inspectPart(params[0], params[1]);
        break;
      case 'retirePart':
        tx = await contract.retirePart(params[0], params[1]);
        break;
      default:
        return res.status(400).json({ 
          error: `Unknown method: ${method}` 
        });
    }

    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

    res.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });

  } catch (error) {
    console.error('❌ Relayer error:', error);
    
    res.status(500).json({
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available: ['/health', '/relayer']
  });
});

// Start server
async function startServer() {
  await initializeBlockchain();
  
  app.listen(PORT, () => {
    console.log(`🚀 RailTrace Relayer Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 Relayer endpoint: http://localhost:${PORT}/relayer`);
  });
}

startServer().catch(console.error);
