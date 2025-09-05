import { Transaction } from "@mysten/sui/transactions";
import { Inputs } from "@mysten/sui/transactions";

interface CollectionForm {
  ownerCapId: string;
  collectionName: string;
  collectionDescription: string;
  mintType: number | string; // Accepts both since it might be passed as a string
  baseMintPrice: number | string;
  isOpenEdition: boolean;
  maxSupply: number | string;
  isDynamic: boolean;
  isClaimable: boolean;
  baseImageUrl: string;
  baseAttributes: string;
}

interface NftForm {
  collection_id: string;
  title: string;
  description: string;
  image_url: string;
  attributes: string;
}

const PACKAGE_ID =
  "0xc1f0384f465cba489120cc12c9a427aab994d9ed233f1036402dfb353f19d2b9";

const FREE_MINT_PACKAGE_ID =
  "0xc1f0384f465cba489120cc12c9a427aab994d9ed233f1036402dfb353f19d2b9";

const MY_PACKAGE_ID =
  "0x48534ac3dd3df77cb4d6e17e05d2bd7961d5352e10fb01561184828d2aa3248e";

const createOwnerCapTx = async (adminCapId: string, forAddress: string) => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::your_module::create_owner_cap`,
    arguments: [
      tx.object(adminCapId), // Pass the AdminCap object ID
      tx.pure.address(forAddress), // Pass the recipient address
    ],
  });

  return tx;
};

const mintLoyaltyHelper = async (
  address: string,
  uniqueId: string,
  image_url: string
) => {
  const tx = new Transaction();
  tx.moveCall({
    target: `0xbdfb6f8ad73a073b500f7ba1598ddaa59038e50697e2dc6e9dedb55af7ae5b49::loyalty_card::mint_loyalty`,
    arguments: [
      tx.pure.address(address!),
      tx.pure.string(uniqueId),
      tx.pure.u64(Date.now()),
      tx.pure.string(image_url),
    ],
  });
  tx.setSender(address!);

  return tx;
};

const mintSuiLoyaltyHelper = async (
  address: string,
  uniqueId: string,
  image_url: string
) => {
  // Use backend API instead of direct Move function call
  const nftForm = {
    collection_id: "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290", // package ID as collection
    title: uniqueId,
    description: "Custom NFT",
    image_url: image_url,
    attributes: "custom,nft"
  };

  // Return the form data for backend processing
  return {
    type: 'backend_mint',
    user_address: address,
    nftForm: nftForm
  };
};

const freeMintNftHelper = async (nftForm: NftForm): Promise<Transaction> => {
  // const price = Number(100);

  const tx = new Transaction();
  const imageUrlBytes = Array.from(new TextEncoder().encode(nftForm.image_url));
  //const coin = coinWithBalance({ balance: 100 }); // 1 SUI
  const attributesArray = nftForm.attributes
    .split(",")
    .map((attr) => attr.trim())
    .filter((attr) => attr);

  // const digest = "3ubeVj8johXx14MXC38XyK9a8uDpcntSyKQpttjj4ucf";
  // const version = 349154720;
  // const objectId = nftForm.collection_id;

  tx.moveCall({
    target: `${MY_PACKAGE_ID}::hashcase_module::free_mint_nft`,
    arguments: [
      // Collection object from which the NFT is minted
      tx.object(nftForm.collection_id),
      // tx.object(Inputs.ObjectRef({ digest, objectId, version })),
      tx.pure.string(nftForm.title),
      tx.pure.string(nftForm.description),
      tx.pure.vector("u8", imageUrlBytes),
      tx.pure.vector("string", attributesArray),
    ],
  });
  return tx;
};

// const fixedMintNftHelper = async () => {
//   const tx = new Transaction();
//   const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64("0")]);
//   //const coin = coinWithBalance({ balance: 100 });
//   tx.moveCall({
//     target: `${PACKAGE_ID}::hashcase_module::fixed_price_mint_nft`,
//     arguments: [
//       tx.object(
//         "0x50d6495977b59a1bed5d68c85edc19e72ce3c971c9d0c333de19facb1c0ff7c0"
//       ), //considering a Obj but will input it afterwards
//       payment,
//       // Collection object that holds the NFT
//       tx.pure.string(claimForm.collectionId),
//       // NFT ID to claim, passed as a pure value
//       //tx.pure.string(claimForm.nftId),
//       tx.pure.u64(0),
//     ],
//   });

//   // we are supposed to return the transaction in this function that return it.
//   // await signAndExecute({ transaction: tx });
// };

const dynamicMintNftHelper = async (nftForm: any) => {
  const tx = new Transaction();
  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64("1000")]);
  const imageUrlBytes = Array.from(new TextEncoder().encode(nftForm.image_url));

  // console.log(nftForm);

  const attributesArray = nftForm.attributes
    .split(",")
    .map((attr: string) => attr.trim())
    .filter((attr: string) => attr);

  // console.log(attributesArray);

  //const coin = coinWithBalance({ balance: 100 });
  tx.moveCall({
    target: `${MY_PACKAGE_ID}::hashcase_module::dynamic_price_mint_nft`,
    arguments: [
      tx.object(nftForm.collection_id),
      payment,
      tx.pure.string(nftForm.title),
      tx.pure.string(nftForm.description),
      tx.pure.vector("u8", imageUrlBytes),
      tx.pure.vector("string", attributesArray),
      tx.pure.u64("100"),
    ],
  });
  return tx;
};

const createCollectionHelper = async (
  collectionForm: CollectionForm
): Promise<Transaction> => {
  const tx = new Transaction();

  // Convert the image URL string into a vector<u8>
  const imageUrlBytes = Array.from(
    new TextEncoder().encode(collectionForm.baseImageUrl)
  );
  // Convert attributes (comma-separated) into an array of strings
  const attributesArray = collectionForm.baseAttributes
    .split(",")
    .map((attr) => attr.trim())
    .filter((attr) => attr);

  tx.moveCall({
    target: `${MY_PACKAGE_ID}::hashcase_module::create_collection`,
    arguments: [
      // The owner cap must be provided by the caller (as an object)
      tx.object(collectionForm.ownerCapId),
      tx.pure.string(collectionForm.collectionName),
      tx.pure.string(collectionForm.collectionDescription),

      tx.pure.u8(Number(collectionForm.mintType)),
      tx.pure.u64(Number(collectionForm.baseMintPrice)),

      tx.pure.bool(collectionForm.isOpenEdition),
      tx.pure.u64(Number(collectionForm.maxSupply)),
      tx.pure.bool(collectionForm.isDynamic),
      tx.pure.bool(collectionForm.isClaimable),
      tx.pure.vector("u8", imageUrlBytes),
      tx.pure.vector("string", attributesArray),
    ],
  });
  return tx;
};

const claimNftHelper = async (claimNFTForm: any) => {
  const tx = new Transaction();

  // Use the same package ID as the profile page
  const PACKAGE_ID = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID ||
    "0x072920bb06baea0717fbeda59950b97a1205f0196d6ad33878d3120710fafe84";

  // console.log(claimNFTForm);

  // Add collection object (must be mutable)
  tx.moveCall({
    target: `${PACKAGE_ID}::hashcase_module::claim_nft`,
    arguments: [
      tx.object(claimNFTForm.collection_id), // Collection object (must be mutable)
      tx.object(claimNFTForm.nft_id), // NFT object (user must own this)
    ],
  });

  return tx;
};

// export async function createOwnerCap(adminCapId, recipientAddress, wallet) {
//   try {
//     // Create a new transaction
//     const txb = new Transaction();

//     // Add the function call to the transaction
//     txb.moveCall({
//       target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTION_NAME}`,
//       arguments: [
//         txb.object(adminCapId), // AdminCap object reference
//         txb.pure(recipientAddress), // Recipient's address
//       ],
//     });

//     // Get the user's wallet provider
//     const walletProvider = new WalletStandardAdapterProvider();
//     const walletAdapter = walletProvider.get(wallet); // wallet = "Sui Wallet" or "Martian" etc.

//     if (!walletAdapter) {
//       throw new Error("Wallet not connected or supported");
//     }

//     // Sign and submit transaction
//     const signedTx = await walletAdapter.signAndExecuteTransactionBlock({
//       transactionBlock: txb,
//       options: { showEffects: true },
//     });

//     console.log("Transaction successful:", signedTx);
//     return signedTx;
//   } catch (error) {
//     console.error("Error creating OwnerCap:", error);
//     throw error;
//   }
// }

export {
  mintLoyaltyHelper,
  mintSuiLoyaltyHelper,
  freeMintNftHelper,
  dynamicMintNftHelper,
  createCollectionHelper,
  claimNftHelper,
};
