import { NextRequest, NextResponse } from "next/server";
import { enokiClient } from "@/utils/enokiClient";

export const POST = async (request: NextRequest) => {
  const { digest, signature } = (await request.json()) as {
    digest: string;
    signature: string;
  };

  return enokiClient
    .executeSponsoredTransaction({
      digest,
      signature,
    })
    .then(({ digest }: { digest: string }) => {
      return NextResponse.json(
        { digest },
        {
          status: 200,
        }
      );
    })
    .catch((error: unknown) => {
      console.error(error);
      return NextResponse.json(
        {
          error: "Could not execute sponsored transaction block.",
        },
        {
          status: 500,
        }
      );
    });
};