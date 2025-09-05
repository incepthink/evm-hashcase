import { SuiClient } from "@mysten/sui/client";

export const useSui = () => {
  const FULL_NODE = "https://rpc.mainnet.sui.io:443";
  const suiClient = new SuiClient({ url: FULL_NODE });

  return {
    suiClient,
  };
};
