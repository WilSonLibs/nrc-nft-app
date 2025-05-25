// generate-keypair.js
const fs = require('fs');
const { Keypair } = require('@solana/web3.js');

// Generate new wallet
const keypair = Keypair.generate();

// Convert secret key to array and save as JSON
const secretArray = Array.from(keypair.secretKey);
fs.writeFileSync('./lib/secret.json', JSON.stringify(secretArray));

// Show public key
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Keypair saved to lib/secret.json');
