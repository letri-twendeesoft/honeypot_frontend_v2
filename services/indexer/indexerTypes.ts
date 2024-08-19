import { GhostIndexer } from "./indexerProviders/ghost";
import Indexer from "./indexer";
import { PageInfo } from "../utils";
import { Address } from "viem";
export type IndexerProvider = GhostIndexer;

export type GhostFtoPairResponse = {
  pairs: GhostFTOPair[];
  pageInfo: PageInfo;
};

export type GhostPairResponse = {
  pairs: GhostPair[];
  pageInfo: PageInfo;
};

export type GhostHoldingPairsResponse = {
  holdingPairs: holdingPairs[];
  pageInfo: PageInfo;
};

export type holdingPairs = {
  pairId: Address;
  totalLpAmount: string;
  deCreaselpAmount: string;
  inCreaselpAmount: string;
  pair: {
    token0Id: Address;
    token1Id: Address;
    token0name: string;
    token1name: string;
    token0symbol: string;
    token1symbol: string;
  };
};

export type PairFilter = {
  searchString: string;
  limit: number;
};

export type GhostFtoTokensResponse = {
  items: GhostToken[];
};

export type PageRequest = {
  direction: "next" | "prev";
  cursor?: string;
};

export type GhostToken = {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type GhostPair = {
  id: string;
  token0: GhostToken;
  token1: GhostToken;
};

export type GhostFTOPair = {
  id: string;
  token0Id: string;
  token1Id: string;
  depositedRaisedToken: string;
  depositedLaunchedToken: string;
  createdAt: string;
  endTime: string;
  status: string;
  token0: GhostToken;
  token1: GhostToken;
};

export type GhostAPIOpt = {
  apiHandle: string;
};
