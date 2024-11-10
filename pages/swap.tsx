import { TVChartContainer } from "@/components/AdvancedChart/TVChartContainer/TVChartContainer";
import { Swap } from "@/components/swap";
import { SwapCard } from "@/components/SwapCard";
import { chart } from "@/services/chart";
import { PairContract } from "@/services/contract/pair-contract";
import { Token } from "@/services/contract/token";
import { observe, toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import PriceFeedGraph from "@/components/PriceFeedGraph/PriceFeedGraph";

import { getBaseUrl, trpcClient } from "@/lib/trpc";
import { tokenToTicker } from "@/lib/advancedChart.util";
import { berachainBartioTestnetNetwork, networksMap } from "@/services/chain";
import { berachainBartioTestnet } from "@/lib/chain";
import { wallet } from "@/services/wallet";
import dayjs from "dayjs";
import { animate, motion } from "framer-motion";
import React from "react";
import { itemPopUpVariants } from "@/lib/animation";
import { popmodal } from "@/services/popmodal";
import { Tabs, Tab } from "@nextui-org/react";
import { liquidity } from "@/services/liquidity";
import LoadingDisplay from "@/components/LoadingDisplay/LoadingDisplay";
import PoweredByAlgebra from "@/components/algebra/common/PoweredByAlgebra";
import IntegralPools from "@/components/algebra/swap/IntegralPools";
import SwapButton from "@/components/algebra/swap/SwapButton";
import SwapPair from "@/components/algebra/swap/SwapPair";
import SwapParams from "@/components/algebra/swap/SwapParams";

const SwapPage = observer(() => {
  useEffect(() => {
    observe(chart, "chartTarget", () => {});
  }, []);

  useEffect(() => {
    if (wallet.isInit) {
      liquidity.initPool();
    }
  }, [wallet.isInit]);

  const isInit = wallet.isInit && liquidity;

  return isInit ? (
    <>
      <div
        className={`grid ${
          chart.showChart && "grid-cols-1 lg:grid-cols-2 "
        }  mb-[20vh] gap-[2rem] lg:gap-[5rem] `}
      >
        {chart.showChart && (
          <motion.div
            variants={itemPopUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="w-full lg:max-w-[574px] flex flex-col self-center place-self-end h-full"
          >
            <PriceFeedGraph></PriceFeedGraph>
          </motion.div>
        )}
        <motion.div
          variants={itemPopUpVariants}
          initial="hidden"
          animate="visible"
          className={
            "relative w-full flex flex-col items-center justify-center" +
            (chart.showChart ? "justify-start" : "")
          }
        >
          <Tabs>
            <Tab title="v3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-0 gap-y-8 w-full lg:gap-8 mt-8 lg:mt-16">
                <div className="flex flex-col gap-2">
                  <IntegralPools />

                  <div className="flex flex-col gap-1 w-full bg-card border border-card-border p-2 rounded-3xl">
                    <SwapPair />
                    <SwapParams />
                    <SwapButton />
                  </div>
                  <PoweredByAlgebra />
                </div>

                <div className="col-span-2">{/* <SwapChart /> */}</div>
              </div>
            </Tab>
            <Tab title="v2">
              <SwapCard></SwapCard>
            </Tab>
          </Tabs>
        </motion.div>
      </div>
    </>
  ) : (
    <LoadingDisplay />
  );
});

export default SwapPage;
