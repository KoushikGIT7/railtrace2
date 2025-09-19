const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
	const rpc = process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
	const provider = new ethers.JsonRpcProvider(rpc);
	const pk = process.env.PRIVATE_KEY;
	if (!pk) throw new Error('Missing PRIVATE_KEY in .env');
	const wallet = new ethers.Wallet(pk, provider);

	const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'build', 'RailTrace.json'), 'utf8'));
	const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
	const contract = await factory.deploy();
	const receipt = await contract.deploymentTransaction().wait();
	const address = await contract.getAddress();

	console.log('RailTrace deployed to:', address);
	console.log('Tx:', receipt.hash);

	// write to .env
	const envPath = path.join(__dirname, '..', '.env');
	let env = '';
	try { env = fs.readFileSync(envPath, 'utf8'); } catch {}
	const lines = env.split(/\r?\n/).filter(Boolean);
	const filtered = lines.filter(l => !l.startsWith('VITE_CONTRACT_ADDRESS=') && !l.startsWith('CONTRACT_ADDRESS='));
	filtered.push(`VITE_CONTRACT_ADDRESS=${address}`);
	filtered.push(`CONTRACT_ADDRESS=${address}`);
	fs.writeFileSync(envPath, filtered.join('\n') + '\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
