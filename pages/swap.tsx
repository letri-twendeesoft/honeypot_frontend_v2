import { TVChartContainer } from "@/components/AdvancedChart/TVChartContainer/TVChartContainer";
import SwapPriceFeedGraph from "@/components/PriceFeedGraph/SwapPriceFeedGraph";
import { Swap } from "@/components/swap";
import { SwapCard } from "@/components/SwapCard";
import { chart } from "@/services/chart";
import { PairContract } from "@/services/contract/pair-contract";
import { Token } from "@/services/contract/token";
import { observe, toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import { SimplePriceFeedGraph } from "@/components/PriceFeedGraph/SimplePriceFeedGraph";
import { getBaseUrl, trpcClient } from "@/lib/trpc";
import { tokenToTicker } from "@/lib/advancedChart.util";
import { berachainBartioTestnetNetwork, networksMap } from "@/services/chain";
import { berachainBartioTestnet } from "@/lib/chain";
import { wallet } from "@/services/wallet";
import dayjs from "dayjs";

const SwapPage = observer(() => {
  useEffect(() => {
    observe(chart, "chartTarget", () => {});
  }, []);

  return (
    <>
      <div className={`lg:grid ${chart.showChart && "grid-cols-2"} `}>
        <div className="relative w-full flex justify-center content-center items-center">
          <SwapCard></SwapCard>
        </div>
        {chart.showChart && (
          <div className="m-auto w-[90%] h-full min-h-[400px] flex flex-col">
            {/* <SwapPriceFeedGraph
              priceFeedTarget={chart.chartTarget}
            ></SwapPriceFeedGraph> */}

            <SimplePriceFeedGraph
              priceFeedTarget={chart.chartTarget}
            ></SimplePriceFeedGraph>
          </div>
        )}
      </div>
    </>
  );
});

export default SwapPage;
