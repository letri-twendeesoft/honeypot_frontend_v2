import {
  Pool,
  TickMath,
  Token,
  computeCustomPoolAddress,
  tickToPrice,
} from "@cryptoalgebra/custom-pools-sdk";
import { useState } from "react";
import { Address } from "viem";
import keyBy from "lodash.keyby";
import {
  useAllTicksLazyQuery,
  TickFieldsFragment,
} from "@/lib/graphql/generated/graphql";

interface TickProcessed {
  liquidityActive: bigint;
  tickIdx: number;
  liquidityNet: bigint;
  price0: string;
  price1: string;
  liquidityGross: bigint;
}

interface TicksResult {
  ticksProcessed: TickProcessed[];
  tickSpacing: number;
  activeTickIdx: number;
  token0: Token;
  token1: Token;
}

export function useInfoTickData() {
  const numSurroundingTicks = 500;
  const PRICE_FIXED_DIGITS = 8;

  const [ticksResult, setTicksResult] = useState<TicksResult | null>(null);
  const [ticksLoading, setTicksLoading] = useState(false);

  const [getAllTicks] = useAllTicksLazyQuery();

  async function fetchInitializedTicks(poolAddress: Address) {
    let surroundingTicks: TickFieldsFragment[] = [];
    let surroundingTicksResult: TickFieldsFragment[] = [];

    let skip = 0;
    do {
      const { data: ticks } = await getAllTicks({
        variables: {
          poolAddress: poolAddress.toLowerCase(),
          skip,
        },
      });

      if (!ticks?.ticks) {
        return {
          loading: true,
          ticks: surroundingTicksResult,
        };
      }

      surroundingTicks = ticks.ticks;
      surroundingTicksResult = surroundingTicksResult.concat(surroundingTicks);
      skip += 1000;
    } while (surroundingTicks.length > 0);

    return { ticks: surroundingTicksResult, loading: false, error: false };
  }

  async function fetchTicksSurroundingPrice(pool: Pool) {
    setTicksLoading(true);

    try {
      const { tickCurrent: poolCurrentTick, liquidity, token0, token1 } = pool;

      const poolId = computeCustomPoolAddress({
        tokenA: token0,
        tokenB: token1,
        customPoolDeployer: pool.deployer,
      }) as Address;

      const tickSpacing = Number(pool.tickSpacing);

      const poolCurrentTickIdx = parseInt(poolCurrentTick.toString());

      const activeTickIdx =
        Math.floor(poolCurrentTickIdx / tickSpacing) * tickSpacing;

      const initializedTicksResult = await fetchInitializedTicks(poolId);

      if (initializedTicksResult.error || initializedTicksResult.loading) {
        return {
          error: initializedTicksResult.error,
          loading: initializedTicksResult.loading,
        };
      }

      const { ticks: initializedTicks } = initializedTicksResult;

      const tickIdxToInitializedTick = keyBy(initializedTicks, "tickIdx");

      let activeTickIdxForPrice = activeTickIdx;
      if (activeTickIdxForPrice < TickMath.MIN_TICK) {
        activeTickIdxForPrice = TickMath.MIN_TICK;
      }
      if (activeTickIdxForPrice > TickMath.MAX_TICK) {
        activeTickIdxForPrice = TickMath.MAX_TICK;
      }

      const activeTickProcessed = {
        liquidityActive: BigInt(liquidity.toString()),
        tickIdx: activeTickIdx,
        liquidityNet: BigInt(0),
        price0: tickToPrice(token0, token1, activeTickIdxForPrice).toFixed(
          PRICE_FIXED_DIGITS
        ),
        price1: tickToPrice(token1, token0, activeTickIdxForPrice).toFixed(
          PRICE_FIXED_DIGITS
        ),
        liquidityGross: BigInt(0),
      };

      const activeTick = tickIdxToInitializedTick[activeTickIdx];
      if (activeTick) {
        activeTickProcessed.liquidityGross = BigInt(activeTick.liquidityGross);
        activeTickProcessed.liquidityNet = BigInt(activeTick.liquidityNet);
      }

      const Direction = {
        ASC: "ASC",
        DESC: "DESC",
      };

      // Computes the numSurroundingTicks above or below the active tick.
      const computeSurroundingTicks = (
        activeTickProcessed: TickProcessed,
        tickSpacing: number,
        numSurroundingTicks: number,
        direction: string
      ) => {
        let previousTickProcessed = {
          ...activeTickProcessed,
        };

        // Iterate outwards (either up or down depending on 'Direction') from the active tick,
        // building active liquidity for every tick.
        let processedTicks = [];
        for (let i = 0; i < numSurroundingTicks; i++) {
          const currentTickIdx =
            direction == Direction.ASC
              ? previousTickProcessed.tickIdx + tickSpacing
              : previousTickProcessed.tickIdx - tickSpacing;

          if (
            currentTickIdx < TickMath.MIN_TICK ||
            currentTickIdx > TickMath.MAX_TICK
          ) {
            break;
          }

          const currentTickProcessed = {
            liquidityActive: previousTickProcessed.liquidityActive,
            tickIdx: currentTickIdx,
            liquidityNet: BigInt(0),
            price0: tickToPrice(token0, token1, currentTickIdx).toFixed(
              PRICE_FIXED_DIGITS
            ),
            price1: tickToPrice(token1, token0, currentTickIdx).toFixed(
              PRICE_FIXED_DIGITS
            ),
            liquidityGross: BigInt(0),
          };

          const currentInitializedTick =
            tickIdxToInitializedTick[currentTickIdx.toString()];
          if (currentInitializedTick) {
            currentTickProcessed.liquidityGross = BigInt(
              currentInitializedTick.liquidityGross
            );
            currentTickProcessed.liquidityNet = BigInt(
              currentInitializedTick.liquidityNet
            );
          }

          if (direction == Direction.ASC && currentInitializedTick) {
            currentTickProcessed.liquidityActive =
              BigInt(previousTickProcessed.liquidityActive) +
              BigInt(currentInitializedTick.liquidityNet);
          } else if (
            direction == Direction.DESC &&
            BigInt(previousTickProcessed.liquidityNet) !== BigInt(0)
          ) {
            currentTickProcessed.liquidityActive =
              BigInt(previousTickProcessed.liquidityActive) -
              BigInt(previousTickProcessed.liquidityNet);
          }

          processedTicks.push(currentTickProcessed);
          previousTickProcessed = currentTickProcessed;
        }

        if (direction == Direction.DESC) {
          processedTicks = processedTicks.reverse();
        }

        return processedTicks;
      };

      const subsequentTicks = computeSurroundingTicks(
        activeTickProcessed,
        tickSpacing,
        numSurroundingTicks,
        Direction.ASC
      );

      const previousTicks = computeSurroundingTicks(
        activeTickProcessed,
        tickSpacing,
        numSurroundingTicks,
        Direction.DESC
      );

      const ticksProcessed = previousTicks
        .concat(activeTickProcessed)
        .concat(subsequentTicks);

      setTicksResult({
        ticksProcessed,
        tickSpacing: Number(tickSpacing),
        activeTickIdx,
        token0,
        token1,
      });
    } catch (err: any) {
      throw new Error(err);
    } finally {
      setTicksLoading(false);
    }
  }

  return {
    fetchTicksSurroundingPrice: {
      ticksResult,
      ticksLoading,
      fetchTicksSurroundingPrice,
    },
  };
}
