require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/**** Hardhat Config (CJS) ****/
module.exports = {
	solidity: '0.8.20',
	networks: {
		bsctest: {
			url: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
			chainId: 97,
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
		},
	},
};
