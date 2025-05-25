import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Metaplex, bundlrStorage } from "@metaplex-foundation/js";
import fs from "fs";
import path from "path";

// Connect to Solana Devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load secret.json from file system (server-side only)
const secretPath = path.resolve(process.cwd(), "lib", "secret.json");
const secret = JSON.parse(fs.readFileSync(secretPath, "utf-8"));

const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));

// Initialize Metaplex
export const metaplex = Metaplex.make(connection)
  .use(bundlrStorage())
  .use({
    wallet: {
      publicKey: keypair.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(keypair);
        return tx;
      },
      signAllTransactions: async (txs) => {
        txs.forEach((tx) => tx.partialSign(keypair));
        return txs;
      },
    },
  });
