import {
  poolsColumns,
  poolsColumnsMy,
} from "@/components/algebra/common/Table/poolsColumns";
import { useMemo, useState } from "react";
import { Address } from "viem";
import PoolsTable from "@/components/algebra/common/Table/poolsTable";
import { usePositions } from "@/lib/algebra/hooks/positions/usePositions";
import { farmingClient } from "@/lib/algebra/graphql/clients";
import {
  usePoolsListQuery,
  useActiveFarmingsQuery,
  OrderDirection,
  Pool_OrderBy,
} from "@/lib/algebra/graphql/generated/graphql";
import PoolCardList from "./PoolCardList";
import { SortingState } from "@tanstack/react-table";
import { id } from "ethers/lib/utils";

const mappingSortKeys: Record<any, Pool_OrderBy> = {
  tvlUSD: Pool_OrderBy.TotalValueLockedUsd,
  price: Pool_OrderBy.Token0Price,
  age: Pool_OrderBy.CreatedAtTimestamp,
  txns: Pool_OrderBy.TxCount,
  volume: Pool_OrderBy.VolumeUsd,
  changeHour: Pool_OrderBy.Id,
  change24h: Pool_OrderBy.Id,
  changeWeek: Pool_OrderBy.Id,
  changeMonth: Pool_OrderBy.Id,
  liquidity: Pool_OrderBy.Liquidity,
  "marktet cap": Pool_OrderBy.Token0MarketCap,
};

const PoolsList = () => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "id", desc: true },
  ]);

  const orderBy = mappingSortKeys[sorting[0].id];
  const { data: pools, loading: isPoolsListLoading } = usePoolsListQuery();

  const { data: activeFarmings, loading: isFarmingsLoading } =
    useActiveFarmingsQuery({
      client: farmingClient,
    });
  const { positions, loading: isPositionsLoading } = usePositions();

  const isLoading =
    isPoolsListLoading ||
    // isPoolsMaxAprLoading ||
    // isPoolsAvgAprLoading ||
    isPositionsLoading ||
    isFarmingsLoading;
  // ||isFarmingsAPRLoading;

  const formattedPools = useMemo(() => {
    if (isLoading || !pools) return [];

    return pools.pools.map(
      ({
        id,
        token0,
        token1,
        fee,
        totalValueLockedUSD,
        poolHourData,
        poolDayData,
        poolWeekData,
        poolMonthData,
        txCount,
        volumeUSD,
        token0Price,
        createdAtTimestamp,
        liquidity,
        aprPercentage,
      }) => {
        const currentPool = poolDayData[0];
        const lastDate = currentPool ? currentPool.date * 1000 : 0;
        const currentDate = new Date().getTime();

        const handlePoolChange = (poolTimeData0: any, poolTimeData1: any) => {
          if (!poolTimeData0) return "0"; // No data available
          if (
            !poolTimeData1 ||
            poolTimeData1.volumeUSD == 0 ||
            !isFinite(poolTimeData1.volumeUSD)
          )
            return 100; // Only one day of data, return 100

          const volumeChange =
            poolTimeData0.volumeUSD - poolTimeData1.volumeUSD;
          const changePercentage = volumeChange / poolTimeData1.volumeUSD;
          if (isNaN(changePercentage)) return 100;
          return Math.round(changePercentage * 100) / 100;
        };

        const changeHour = handlePoolChange(poolHourData[0], poolHourData[1]);

        const change24h = handlePoolChange(poolDayData[0], poolDayData[1]);

        const changeWeek = handlePoolChange(poolWeekData[0], poolWeekData[1]);

        const changeMonth = handlePoolChange(
          poolMonthData[0],
          poolMonthData[1]
        );

        /* time difference calculations here to ensure that the graph provides information for the last 24 hours */
        const timeDifference = currentDate - lastDate;
        const msIn24Hours = 24 * 60 * 60 * 1000;

        const openPositions = positions?.filter(
          (position) => position.pool.toLowerCase() === id.toLowerCase()
        );
        const activeFarming = activeFarmings?.eternalFarmings.find(
          (farming) => farming.pool === id
        );

        const poolMaxApr = aprPercentage;
        const poolAvgApr = aprPercentage;
        const farmApr = 0;
        const avgApr = aprPercentage;

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
          createdAtTimestamp,
          liquidity,
          token0Price,
          changeHour,
          change24h,
          changeWeek,
          changeMonth,
          txCount,
          volumeUSD,
          marktetcap: token0.marketCap,
          apr24h: avgApr,
        };
      }
    );
  }, [isLoading, pools, positions, activeFarmings]);

  const handleSort = (callback: any) => {
    const sort = callback();
    if (sort.length > 0) {
      setSorting(sort);
    } else {
      setSorting([]);
    }
  };

  return (
    <div>
      <div className="hidden xl:block">
        <PoolsTable
          columnsMy={poolsColumnsMy}
          columns={poolsColumns}
          data={formattedPools}
          sorting={sorting}
          setSorting={handleSort}
          link={"pooldetail"}
          showPagination={true}
          loading={isLoading}
        />
      </div>
      <div className="block xl:hidden">
        <PoolCardList data={formattedPools} />
      </div>
    </div>
  );
};

export default PoolsList;
