"use client";
import { createContext, useContext, useState } from "react";

export type Collection = {
  id: number;
  name: string;
  description: string | undefined;
  image_uri: string | undefined;
  owner_id: number;
  priority: number | undefined;
  attributes: string | undefined;
  contract_id: number | null | undefined;
  createdAt: any;
  updatedAt: any;
  contract_address: string | undefined;
  standard: string | undefined;
  paymaster_id: number | undefined;
  unlockable_content: any;
  chain_name: string | undefined;
  chain_id: number | undefined;
  chain_type: string | undefined;
};

type AppContextType = {
  collection: Collection | null;
  setCollection: (c: Collection | null) => void;
  collectionLoading: boolean;
  setCollectionLoading: (v: boolean) => void;
};

export const AppContext = createContext<AppContextType>({
  collection: null,
  setCollection: () => {},
  collectionLoading: false,
  setCollectionLoading: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(false);

  return (
    <AppContext.Provider
      value={{ collection, setCollection, collectionLoading, setCollectionLoading }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
