const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ABI = [
	"function registerPart(bytes32 partHash, string metadata)",
	"function receivePart(bytes32 partHash, string metadata)",
	"function installPart(bytes32 partHash, string metadata)",
	"function inspectPart(bytes32 partHash, string metadata)",
	"function retirePart(bytes32 partHash, string metadata)"
];

const RPC_URL = process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || process.env.VITE_CONTRACT_ADDRESS;

if (!PRIVATE_KEY) {
	console.warn('PRIVATE_KEY is missing in .env. Relayer cannot send transactions.');
}

let provider, wallet, contract;
function init() {
	provider = new ethers.JsonRpcProvider(RPC_URL);
	if (PRIVATE_KEY) {
		wallet = new ethers.Wallet(PRIVATE_KEY, provider);
	}
	if (CONTRACT_ADDRESS) {
		contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet || provider);
	}
}
init();

const argBuilders = {
	registerPart: (p) => [p.partHash, p.metadata],
	receivePart:  (p) => [p.partHash, p.metadata],
	installPart:  (p) => [p.partHash, p.metadata],
	inspectPart:  (p) => [p.partHash, p.metadata],
	retirePart:   (p) => [p.partHash, p.metadata],
};

app.post('/relayer', async (req, res) => {
	try {
		const { method, params } = req.body || {};
		if (!wallet) return res.status(500).json({ error: 'Relayer wallet not initialized. Missing PRIVATE_KEY.' });
		if (!contract) return res.status(500).json({ error: 'Contract address not configured. Set CONTRACT_ADDRESS or VITE_CONTRACT_ADDRESS.' });
		if (!method || !params || typeof params !== 'object') return res.status(400).json({ error: 'Invalid payload. Expected { method, params }.' });
		if (typeof contract[method] !== 'function' || !argBuilders[method]) {
			return res.status(400).json({ error: `Unsupported method: ${method}` });
		}

		const [partHash, metadata] = argBuilders[method](params);
		if (typeof partHash !== 'string' || !partHash.startsWith('0x') || partHash.length !== 66) {
			return res.status(400).json({ error: 'Invalid partHash. Must be 32-byte 0x hex.' });
		}
		if (typeof metadata !== 'string') {
			return res.status(400).json({ error: 'Invalid metadata. Must be a JSON string.' });
		}

		const tx = await contract[method](partHash, metadata);
		const receipt = await tx.wait();
		return res.json({ transactionHash: receipt.hash });
	} catch (err) {
		const message = (err && (err.reason || err.error?.message || err.message)) || 'Relayer failed';
		console.error('Relayer error:', err);
		return res.status(500).json({ error: message });
	}
});

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 8787;
app.listen(port, () => {
	console.log(`Relayer listening on http://localhost:${port}`);
});

