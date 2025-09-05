import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import axiosInstance from "@/utils/axios";

interface Collection {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  chain_type: string;
  chain_id: number;
  contract_address: string;
  standard: string;
  owner_id: number;
  paymaster_id: number | null;
  priority: number;
  attributes: string;
  createdAt: string;
  updatedAt: string;
}

interface CollectionsResponse {
  suiCollections?: Collection[];
  collections?: Collection[];
  totalPages?: number;
  total_pages?: number;
  [key: string]: any;
}

// Fetch function for collections
const fetchCollections = async (page: number): Promise<CollectionsResponse> => {
  try {
    const res = await axiosInstance.get(`/platform/collections`);
    console.log("Collections API response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw error;
  }
};

// Main hook for collections
export const useCollections = (page: number = 1) => {
  const query = useQuery({
    queryKey: ["collections", page],
    queryFn: () => fetchCollections(page),
    retry: 1,
    retryOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Process collections data with memoization
  const processedData = useMemo(() => {
    if (!query.data) return { collections: [], totalPages: 1 };

    const collections =
      query.data.suiCollections || query.data.collections || query.data || [];
    const totalPages = query.data.totalPages || query.data.total_pages || 1;

    return { collections, totalPages };
  }, [query.data]);

  return {
    ...query,
    collections: processedData.collections,
    totalPages: processedData.totalPages,
  };
};

// Hook to get a specific collection by ID
export const useCollectionById = (collectionId: number | string) => {
  // Use the collections query to get all data
  const {
    data: collectionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["collections", 1], // Always use page 1 for now since API doesn't use pagination
    queryFn: () => fetchCollections(1),
    retry: 1,
    retryOnMount: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Find the specific collection from cached data
  const collection = useMemo(() => {
    if (!collectionsData || !collectionId) return null;

    const collections =
      collectionsData.suiCollections ||
      collectionsData.collections ||
      collectionsData ||
      [];

    return (
      collections.find(
        (col: Collection) =>
          col.id === Number(collectionId) ||
          col.id === collectionId ||
          col.contract_address === collectionId
      ) || null
    );
  }, [collectionsData, collectionId]);

  return {
    collection,
    isLoading,
    isError,
    error,
    isFound: !!collection,
  };
};

// Hook to get collection by contract address
export const useCollectionByAddress = (contractAddress: string) => {
  const {
    data: collectionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["collections", 1],
    queryFn: () => fetchCollections(1),
    retry: 1,
    retryOnMount: true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const collection = useMemo(() => {
    if (!collectionsData || !contractAddress) return null;

    const collections =
      collectionsData.suiCollections ||
      collectionsData.collections ||
      collectionsData ||
      [];

    // Handle contract address mapping logic from your original code
    const findByAddress = (address: string) => {
      const oldPackage =
        "0xea46060a8a4750de4ce91e6b8a2119d35becbeaef939c09557d0773c7f7c20a0";
      const newCollection =
        "0x79e4f927919068602bae38387132f8c0dd52dc3207098355ece9e9ba61eb2290";
      const dbCollection =
        "0x6c7ff54132f7693ad1334e85ff7c5cf2f967b37cc785e51019c42b42a5c38b6f";

      return collections.find((col: Collection) => {
        let colAddress = col.contract_address || "";

        // Apply the same mapping logic
        if (colAddress === oldPackage || colAddress === dbCollection) {
          colAddress = newCollection;
        }

        return (
          colAddress === address ||
          colAddress === contractAddress ||
          col.contract_address === contractAddress
        );
      });
    };

    return findByAddress(contractAddress) || null;
  }, [collectionsData, contractAddress]);

  return {
    collection,
    isLoading,
    isError,
    error,
    isFound: !!collection,
  };
};

// Utility hook to search collections
export const useCollectionSearch = (searchTerm: string) => {
  const { collections, isLoading, isError, error } = useCollections(1);

  const filteredCollections = useMemo(() => {
    if (!searchTerm || !collections) return collections;

    const term = searchTerm.toLowerCase();
    return collections.filter(
      (collection: Collection) =>
        collection.name?.toLowerCase().includes(term) ||
        collection.description?.toLowerCase().includes(term) ||
        collection.contract_address?.toLowerCase().includes(term)
    );
  }, [collections, searchTerm]);

  return {
    collections: filteredCollections,
    isLoading,
    isError,
    error,
    totalResults: filteredCollections?.length || 0,
  };
};

export type { Collection, CollectionsResponse };
