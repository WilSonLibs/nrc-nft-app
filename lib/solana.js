import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, bundlrStorage } from "@metaplex-foundation/js";

const secretArray = JSON.parse(process.env.NEXT_PUBLIC_SOLANA_SECRET);
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretArray));

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

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
