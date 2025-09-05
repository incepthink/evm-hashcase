import { useState } from "react";
import { useEnokiFlow } from "@mysten/enoki/react";
import { Transaction } from "@mysten/sui/transactions";
import { toB64, fromB64 } from "@mysten/sui/utils";
import { useZkLogin } from "@mysten/enoki/react";
import axios, { AxiosResponse } from "axios";
import { useSui } from "./useSui";
import { SuiTransactionBlockResponseOptions } from "@mysten/sui/client";
import { toast } from "react-hot-toast";
import axiosInstance from "@/utils/axios";

export const useSponsorSignAndExecute = () => {
  const [isLoading, setIsLoading] = useState(false);
  const enokiFlow = useEnokiFlow();
  const { address } = useZkLogin();
  const { suiClient } = useSui();

  const sponsorSignAndExecute = async ({
    tx,
    options,
  }: {
    tx: Transaction;
    options: SuiTransactionBlockResponseOptions;
  }) => {
    setIsLoading(true);
    try {
      const txBytes = await tx.build({
        client: suiClient,
        onlyTransactionKind: true,
      });
      const sponsorTxBody = {
        network: "mainnet",
        txBytes: toB64(txBytes),
        sender: address!,
        allowedAddresses: [address!],
      };

      const sponsorResponse = await axiosInstance.post(
        "/platform/sponsor-enoki",
        sponsorTxBody
      );

      const { bytes, digest: sponsorDigest } = sponsorResponse.data;
      // console.log("Signing transaction block...");

      const signer = await enokiFlow.getKeypair({ network: "mainnet" });
      const { signature } = await signer.signTransaction(fromB64(bytes));

      // console.log("Executing transaction block...");
      const executeSponsoredTxBody = {
        signature,
        digest: sponsorDigest,
      };

      const executeResponse: AxiosResponse<{ digest: string }> =
        await axiosInstance.post(
          "/platform/execute-enoki",
          executeSponsoredTxBody
        );
      // console.log("Executed response: ");

      let digest = executeResponse.data.digest;
      await suiClient.waitForTransaction({ digest, timeout: 5_000 });
      return suiClient.getTransactionBlock({
        digest,
        options,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to sponsor and execute transaction block");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, sponsorSignAndExecute };
};
