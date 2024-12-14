import { useQuery } from "@apollo/client";
import { LEADERBOARD_QUERY } from "../algebra/graphql/clients/leaderboard";
import BigNumber from "bignumber.js";
import type { FactoryData } from "../algebra/graphql/clients/leaderboard";

export function useLeaderboard() {
  const { data, loading, error } = useQuery<FactoryData>(LEADERBOARD_QUERY);

  const formatValue = (value: string) => {
    const bn = new BigNumber(value || "0");
    return {
      usd: `$${bn.toFormat(2)}`,
      matic: `${bn.toFormat(2)} Matic`,
    };
  };

  const stats = data?.factories[0]
    ? {
        totalTrades: {
          title: "Total Trades",
          value: data.factories[0].txCount,
        },
        totalVolume: {
          title: "Total Volume",
          value: formatValue(data.factories[0].totalVolumeUSD).usd,
          subValue: formatValue(data.factories[0].totalVolumeMatic).matic,
        },
        tvl: {
          title: "TVL",
          value: formatValue(data.factories[0].totalValueLockedUSD).usd,
          subValue: formatValue(data.factories[0].totalValueLockedMatic).matic,
        },
      }
    : null;

  return {
    stats,
    loading,
    error,
  };
}
