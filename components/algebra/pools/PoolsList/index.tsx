import {
  POOL_MAX_APR_API,
  fetcher,
  POOL_AVG_APR_API,
  ETERNAL_FARMINGS_API,
} from "@/data/algebra/api";
import { usePositions } from "@/lib/algebra/hooks/positions/usePositions";
import { farmingClient } from "@/lib/graphql/clients";
import {
  usePoolsListQuery,
  useActiveFarmingsQuery,
} from "@/lib/graphql/generated/graphql";
import { Address } from "viem";
import { useMemo } from "react";
import useSWR from "swr";
import { poolsColumns } from "../../common/Table/poolsColumns";
import PoolsTable from "../../common/Table/poolsTable";

const PoolsList = () => {
  const { data: pools, loading: isPoolsListLoading } = usePoolsListQuery();

  const { data: activeFarmings, loading: isFarmingsLoading } =
    useActiveFarmingsQuery({
      client: farmingClient,
    });
  const { positions, loading: isPositionsLoading } = usePositions();
  console.log("positions", positions);

  const { data: poolsMaxApr, isLoading: isPoolsMaxAprLoading } = useSWR(
    POOL_MAX_APR_API,
    fetcher
  );
  const { data: poolsAvgApr, isLoading: isPoolsAvgAprLoading } = useSWR(
    POOL_AVG_APR_API,
    fetcher
  );
  const { data: farmingsAPR, isLoading: isFarmingsAPRLoading } = useSWR(
    ETERNAL_FARMINGS_API,
    fetcher
  );

  console.log("pools", pools);

  const isLoading =
    isPoolsListLoading ||
    isPoolsMaxAprLoading ||
    isPoolsAvgAprLoading ||
    isPositionsLoading ||
    isFarmingsLoading ||
    isFarmingsAPRLoading;

  const formattedPools = useMemo(() => {
    if (isLoading || !pools) return [];

    return pools.pools.map(
      ({
        id,
        token0,
        token1,
        fee,
        totalValueLockedUSD,
        deployer,
        poolDayData,
      }) => {
        const currentPool = poolDayData[0];
        const lastDate = currentPool ? currentPool.date * 1000 : 0;
        const currentDate = new Date().getTime();

        /* time difference calculations here to ensure that the graph provides information for the last 24 hours */
        const timeDifference = currentDate - lastDate;
        const msIn24Hours = 24 * 60 * 60 * 1000;

        const openPositions = positions?.filter(
          (position) => position.pool.toLowerCase() === id.toLowerCase()
        );
        const activeFarming = activeFarmings?.eternalFarmings.find(
          (farming) => farming.pool === id
        );

        const poolMaxApr =
          poolsMaxApr && poolsMaxApr[id]
            ? Number(poolsMaxApr[id].toFixed(2))
            : 0;
        const poolAvgApr =
          poolsAvgApr && poolsAvgApr[id]
            ? Number(poolsAvgApr[id].toFixed(2))
            : 0;
        const farmApr =
          activeFarming && farmingsAPR && farmingsAPR[activeFarming.id] > 0
            ? farmingsAPR[activeFarming.id]
            : 0;

        const avgApr = farmApr + poolAvgApr;

        return {
          id: id as Address,
          pair: {
            token0,
            token1,
          },
          fee: Number(fee) / 10_000,
          tvlUSD: Number(totalValueLockedUSD),
          volume24USD:
            timeDifference <= msIn24Hours ? currentPool.volumeUSD : 0,
          fees24USD: timeDifference <= msIn24Hours ? currentPool.feesUSD : 0,
          poolMaxApr,
          poolAvgApr,
          farmApr,
          avgApr,
          isMyPool: Boolean(openPositions?.length),
          hasActiveFarming: Boolean(activeFarming),
          deployer: deployer.toLowerCase(),
        };
      }
    );
  }, [
    isLoading,
    pools,
    positions,
    activeFarmings,
    poolsMaxApr,
    poolsAvgApr,
    farmingsAPR,
  ]);

  return (
    <div className="flex flex-col gap-4">
      <PoolsTable
        columns={poolsColumns}
        data={formattedPools}
        defaultSortingID={"tvlUSD"}
        link={"algebra/pool"}
        showPagination={true}
        loading={isLoading}
      />
    </div>
  );
};

export default PoolsList;
