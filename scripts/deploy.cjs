const fs = require('fs');
const hre = require('hardhat');

async function main() {
	const RailTrace = await hre.ethers.getContractFactory('RailTrace');
	const railTrace = await RailTrace.deploy();
	await railTrace.waitForDeployment();
	const address = await railTrace.getAddress();

	console.log('RailTrace deployed to:', address);

	const envPath = '.env';
	let env = '';
	try { env = fs.readFileSync(envPath, 'utf8'); } catch {}

	const lines = env.split(/\r?\n/).filter(Boolean);
	const filtered = lines.filter(l => !l.startsWith('VITE_CONTRACT_ADDRESS=') && !l.startsWith('CONTRACT_ADDRESS='));
	filtered.push(`VITE_CONTRACT_ADDRESS=${address}`);
	filtered.push(`CONTRACT_ADDRESS=${address}`);
	fs.writeFileSync(envPath, filtered.join('\n') + '\n');
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
