// lib/mintFlashcardNFT.js
import { toPng } from 'html-to-image';
import { NFTStorage, File } from 'nft.storage';
import { metaplex } from './solana';

const NFT_STORAGE_TOKEN = "c77e9eb5.ee2295aa6862495eb61d45cf30d22a30"; // Get from https://nft.storage/manage

export async function mintFlashcardNFT({ elementId, title, userData, wallet }) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Flashcard element not found");

  // 1. Convert element to image
  const dataUrl = await toPng(element);
  const imageBlob = await (await fetch(dataUrl)).blob();

  // 2. Upload to NFT.Storage
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
  const imageFile = new File([imageBlob], 'flashcard.png', { type: 'image/png' });

  const metadata = await client.store({
    name: title,
    description: `Flashcard NFT for ${title} - user: ${wallet.publicKey.toBase58()}`,
    image: imageFile,
    properties: {
      userData,
      wallet: wallet.publicKey.toBase58(),
    },
  });

  console.log("Metadata URI:", metadata.url);

  // 3. Mint NFT using Metaplex
  const { nft } = await metaplex.nfts().create({
    uri: metadata.url,
    name: title,
    sellerFeeBasisPoints: 0,
  });

  console.log("NFT minted:", nft);
  return nft;
}
