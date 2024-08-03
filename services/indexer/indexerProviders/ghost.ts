import { PairFilter, statusTextToNumber } from "@/services/launchpad";
import {
  IndexerProvider,
  GhostFtoPairResponse,
  GhostAPIOpt,
  GhostFtoTokensResponse,
  GhostPair,
  GhostPairResponse,
} from "./../indexerTypes";

const ftoGraphHandle = "c0ea90ad-1a89-4078-b789-aa41d791398d/ghostgraph";
const pairGraphHandle = "747fa52a-205d-4434-ac02-0dd20f49c0dd/ghostgraph";

export default class GhostIndexer implements IndexerProvider {
  apiKey: string;
  apiEndpoint: string;

  constructor(apiKey: string, apiEndpoint: string) {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
  }

  callIndexerApi = async (
    query: string,
    option: GhostAPIOpt
  ): Promise<ApiResponseType<any>> => {
    if (!this.apiKey || !query) {
      return {
        status: "error",
        message: "Error: API Key or query is missing.",
      };
    }

    const res = await fetch(this.apiEndpoint + option.apiHandle, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GHOST-KEY": this.apiKey,
      },
      body: JSON.stringify({ query: query }),
    });

    const data = await res.json();

    return {
      status: "success",
      data: data.data,
      message: "Success",
    };
  };

  getFilteredFtoPairs = async (
    filter: PairFilter
  ): Promise<ApiResponseType<GhostFtoPairResponse>> => {
    const statusNum = statusTextToNumber(filter?.status ?? -1);

    const statusCondition = statusNum != -1 ? `status: "${statusNum}",` : "";
    const searchIdCondition = filter?.search ? `id: "${filter.search}",` : "";
    const searchToken0IdCondition = filter?.search
      ? `token0Id: "${filter.search}",`
      : "";
    const searchToken1IdCondition = filter?.search
      ? `token1Id: "${filter.search}",`
      : "";

    const query = `
        {
          pairs(
            where: {
              OR:[
                {
                  ${statusCondition}
                  ${searchIdCondition}
                }
                {
                  ${statusCondition}
                  ${searchToken0IdCondition}
                }
                {
                  ${statusCondition}
                  ${searchToken1IdCondition}
                }
              ]
            }
          ) {
            items {
              id
              token0Id
              token1Id
              depositedRaisedToken
              depositedLaunchedToken
              createdAt
              endTime
              status
              token0 {
                id
                name
                symbol
                decimals
              }
              token1 {
                id
                name
                symbol
                decimals
              }
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, { apiHandle: ftoGraphHandle });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: (res.data as any).pairs.items as GhostFtoPairResponse,
      };
    }
  };

  getAllFtoTokens = async (): Promise<
    ApiResponseType<GhostFtoTokensResponse>
  > => {
    const query = `
        {
          erc20s {
            items {
              id
              name
              symbol
              decimals
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, { apiHandle: ftoGraphHandle });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: (res.data as any).erc20s.items as GhostFtoTokensResponse,
      };
    }
  };

  getAllPairs = async (): Promise<ApiResponseType<GhostPairResponse>> => {
    const query = `
        {
          pairs {
            items {
              id
              token0 {
                id
                name
                symbol
                decimals
              }
              token1 {
                id
                name
                symbol
                decimals
              }
            }
          }
        }
      `;

    const res = await this.callIndexerApi(query, {
      apiHandle: pairGraphHandle,
    });

    if (res.status === "error") {
      return res;
    } else {
      return {
        status: "success",
        message: "Success",
        data: (res.data as any).pairs.items as GhostPairResponse,
      };
    }
  };
}
