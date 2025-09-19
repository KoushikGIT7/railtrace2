# RailTrace Relayer Server

A Node.js blockchain relayer server for the RailTrace project, connecting the frontend to BSC Testnet smart contracts.

## Features

- 🚀 Express.js server with CORS support
- 🔗 BSC Testnet integration via ethers.js
- 📡 Relayer endpoint for blockchain transactions
- 🏥 Health check endpoint
- 🔒 Secure private key handling

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/railtrace-relayer.git
   cd railtrace-relayer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your BSC Testnet private key
   ```

4. **Run the server**
   ```bash
   npm start
   ```

## Environment Variables

- `BSC_TESTNET_RPC_URL`: BSC Testnet RPC endpoint
- `CONTRACT_ADDRESS`: Deployed RailTrace contract address
- `PRIVATE_KEY`: BSC Testnet wallet private key (with test BNB)
- `PORT`: Server port (default: 10000)

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Relayer
```
POST /relayer
Content-Type: application/json

{
  "method": "registerPart",
  "params": ["0x...", "metadata"]
}
```

Supported methods:
- `registerPart`
- `receivePart`
- `installPart`
- `inspectPart`
- `retirePart`

## Deployment

This server is configured for deployment on Render.com. See the deployment documentation for detailed instructions.

## License

MIT
