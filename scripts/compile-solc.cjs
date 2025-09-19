const fs = require('fs');
const path = require('path');
const solc = require('solc');

const CONTRACT_PATH = path.join(__dirname, '..', 'contracts', 'RailTrace.sol');
const BUILD_DIR = path.join(__dirname, '..', 'build');

function findImports(importPath) {
	const fullPath = path.isAbsolute(importPath)
		? importPath
		: path.join(path.dirname(CONTRACT_PATH), importPath);
	try {
		return { contents: fs.readFileSync(fullPath, 'utf8') };
	} catch (e) {
		return { error: `File not found: ${importPath}` };
	}
}

function main() {
	const source = fs.readFileSync(CONTRACT_PATH, 'utf8');
	const input = {
		language: 'Solidity',
		sources: {
			'RailTrace.sol': { content: source },
		},
		settings: {
			optimizer: { enabled: true, runs: 200 },
			outputSelection: {
				'*': {
					'*': ['abi', 'evm.bytecode']
				}
			}
		}
	};

	const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
	if (output.errors && output.errors.length) {
		const errs = output.errors.filter(e => e.severity === 'error');
		if (errs.length) {
			console.error(errs.map(e => e.formattedMessage).join('\n'));
			process.exit(1);
		}
	}

	const contract = output.contracts['RailTrace.sol']['RailTrace'];
	if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR);
	fs.writeFileSync(path.join(BUILD_DIR, 'RailTrace.json'), JSON.stringify({
		abi: contract.abi,
		bytecode: contract.evm.bytecode.object
	}, null, 2));
	console.log('Compiled: build/RailTrace.json');
}

main();
