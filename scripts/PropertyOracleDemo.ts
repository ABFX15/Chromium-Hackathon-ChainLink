import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

// Replace with your deployed contract addresses and ABIs
const PROPERTY_ORACLE_ADDRESS = '0xYourPropertyOracle';
const propertyOracleAbi = require('./abis/PropertyOracle.json');

const account = privateKeyToAccount('0xYOUR_PRIVATE_KEY');
const walletClient = createWalletClient({ account, chain: sepolia, transport: http() });
const publicClient = createPublicClient({ chain: sepolia, transport: http() });

async function main() {
    // 1. Request a property value update (as owner)
    const txHash = await walletClient.writeContract({
        address: PROPERTY_ORACLE_ADDRESS,
        abi: propertyOracleAbi,
        functionName: 'requestPropertyValue',
        args: [
            1, // tokenId
            ['123 Main St', 'City', 'ST', '12345'], // args for Chainlink Functions
            123n, // subscriptionId
            500_000, // gasLimit
            '0xYourDonId', // donId
            '...source code...', // source
        ],
    });
    console.log('Property value update requested, tx:', txHash);

    // 2. Read the last fetched value for the tokenId
    const value = await publicClient.readContract({
        address: PROPERTY_ORACLE_ADDRESS,
        abi: propertyOracleAbi,
        functionName: 'tokenIdToValue',
        args: [1],
    });
    console.log('Last fetched property value:', value);
}

main().catch(console.error); 