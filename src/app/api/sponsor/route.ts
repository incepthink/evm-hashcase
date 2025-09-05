import { NextRequest, NextResponse } from "next/server";
import { enokiClient } from "@/utils/enokiClient";

/*
 - Right now any txBlock whose moveCall targets are whitelisted in the Enoki Portal can be sponsored
 - In mainnet, we will probably want to add constraints, such as:
  - require a JWT token if the user is signed in with Enoki
  - require a signed message if the user uses wallet-kit
  - require that the number of commands in the txBlock is exactly one, we can check this via `TransactionBlock.from(txBytes)`
  - require that the allowedAddresses only contain the sender's address (in case of an airdrop)
*/

export const POST = async (request: NextRequest) => {
  const { network, txBytes, sender, allowedAddresses } = (await request.json()) as {
    network: string;
    txBytes: string;
    sender: string;
    allowedAddresses?: string[];
  };

  return enokiClient
    .createSponsoredTransaction({
      network: network as any,
      transactionKindBytes: txBytes,
      sender,
      allowedAddresses,
    })
    .then((resp: unknown) => {
      return NextResponse.json(resp, {
        status: 200,
      });
    })
    .catch((error: unknown) => {
      console.error(error);
      return NextResponse.json(
        {
          error: "Could not create sponsored transaction block.",
        },
        {
          status: 500,
        }
      );
    });
};