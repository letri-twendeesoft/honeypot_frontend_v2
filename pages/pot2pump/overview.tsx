import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { NextLayoutPage } from "@/types/nextjs";
import { useEffect, useState } from "react";
import { LaunchCardV3 } from "@/components/LaunchCard/v3";
import { itemPopUpVariants } from "@/lib/animation";
import {
  fetchNearSuccessPot2Pump,
  fetchPumpingHighPricePot2Pump,
  fetchPottingNewTokens,
} from "@/lib/algebra/graphql/clients/pair";
import { MemePairContract } from "@/services/contract/memepair-contract";
import { wallet } from "@/services/wallet";
import { Button } from "@/components/button";
import Link from "next/link";
import { Trigger } from "@/components/Trigger";

// 在组件外部定义常量
const POT_TABS = {
  NEW: "New POTs",
  ALMOST: "Almost",
  MOON: "Moon 🚀",
} as const;

type TabType = (typeof POT_TABS)[keyof typeof POT_TABS];

const Pot2PumpOverviewPage: NextLayoutPage = observer(() => {
  const [newTokens, setNewTokens] = useState<MemePairContract[]>();
  const [nearSuccessTokens, setNearSuccessTokens] =
    useState<MemePairContract[]>();
  const [highPriceTokens, setHighPriceTokens] = useState<MemePairContract[]>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>(POT_TABS.NEW);

  useEffect(() => {
    if (!wallet.isInit) return;
    const fetchData = async () => {
      const [newTokensData, nearSuccessData, highPriceData] = await Promise.all(
        [
          fetchPottingNewTokens(),
          fetchNearSuccessPot2Pump(),
          fetchPumpingHighPricePot2Pump(),
        ]
      );

      setNewTokens(newTokensData);
      setNearSuccessTokens(nearSuccessData);
      setHighPriceTokens(highPriceData);
    };

    fetchData();

    const fetchInterval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(fetchInterval);
  }, [wallet.isInit]);

  // Auto scroll effect
  useEffect(() => {
    if (!highPriceTokens?.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev >= Math.min(4, highPriceTokens.length - 1) ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [highPriceTokens]);

  return (
    <div className="w-full flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-[1200px] mb-6 flex flex-col justify-center bg-[#FFCD4D] rounded-2xl px-4 pb-[50px] md:pb-8 relative pt-4 md:pt-12 text-black">
        <div
          className={
            "bg-[url('/images/pumping/outline-border.png')] bg-left-top bg-contain bg-repeat-x h-4 md:h-12 absolute top-0 left-0 w-full rounded-t-2xl"
          }
        ></div>

        {/* Featured Slideshow */}
        <div className="relative">
          <div className="user-select-none opacity-0">
            <LaunchCardV3
              type="featured"
              pair={highPriceTokens?.[currentSlide]}
              action={<></>}
            />
          </div>
          {highPriceTokens?.slice(0, 5).map((token, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 absolute inset-0 ${
                currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <LaunchCardV3 type="featured" pair={token} action={<></>} />
            </div>
          ))}
        </div>
        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 absolute bottom-3 left-0 right-0 z-20">
          {highPriceTokens
            ?.slice(0, 5)
            .map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === index ? "bg-black" : "bg-gray-400"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
        </div>
      </div>
      <div className="w-full relative flex justify-center mb-12">
        <div className="w-full max-w-[600px]">
          <Link
            href="/launch-token?launchType=meme"
            className="text-black font-bold block"
          >
            <Button className="w-full text-xl md:text-3xl py-3 md:py-5">
              🍯 Launch Your Token 🍯
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full max-w-[1200px] bg-[#FFCD4D] rounded-2xl px-2 md:px-4 relative pt-4 md:pt-12 mb-[90px] text-black">
        <div className="bg-[url('/images/pumping/outline-border.png')] bg-left-top bg-contain bg-repeat-x h-4 md:h-12 absolute top-0 left-0 w-full rounded-t-2xl"></div>

        {/* Mobile Trigger */}
        <div className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] z-10">
          <Trigger
            tab={activeTab}
            setTab={setActiveTab as (tab: string) => void}
            options={Object.values(POT_TABS)}
            className="w-full px-4 py-2 rounded-2xl bg-white shadow-[4px_4px_0px_0px_#202020,-4px_4px_0px_0px_#202020]"
            capitalize={false}
          />
        </div>

        {/* Content Area - 添加顶部内边距 */}
        <div className="pt-6">
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-3 min-h-[600px] h-[calc(100vh-300px)] gap-6">
            <section className="relative flex flex-col px-2 overflow-hidden">
              <h2 className="text-xl font-bold mb-4 absolute top-0 left-0 right-0 bg-[#FFCD4D] z-20 py-2 px-2">
                {POT_TABS.NEW}
              </h2>
              <div className="flex flex-col gap-2 pb-2 overflow-y-auto h-full pt-[60px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                {newTokens?.map((pot2pump, index) => (
                  <motion.div key={index} variants={itemPopUpVariants}>
                    <LaunchCardV3
                      type="simple"
                      pair={pot2pump}
                      action={<></>}
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="relative flex flex-col px-2 overflow-hidden">
              <h2 className="text-xl font-bold mb-4 absolute top-0 left-0 right-0 bg-[#FFCD4D] z-20 py-2 px-2">
                {POT_TABS.ALMOST}
              </h2>
              <div className="flex flex-col gap-8 pb-2 overflow-y-auto h-full pt-[60px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                {nearSuccessTokens?.map((pot2pump, index) => (
                  <motion.div key={index} variants={itemPopUpVariants}>
                    <LaunchCardV3
                      type="simple"
                      pair={pot2pump}
                      action={<></>}
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="relative flex flex-col px-2 overflow-hidden">
              <h2 className="text-xl font-bold mb-4 absolute top-0 left-0 right-0 bg-[#FFCD4D] z-20 py-2 px-2">
                {POT_TABS.MOON}
              </h2>
              <div className="flex flex-col gap-8 pb-2 overflow-y-auto h-full pt-[60px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                {highPriceTokens?.map((pot2pump, index) => (
                  <motion.div key={index} variants={itemPopUpVariants}>
                    <LaunchCardV3
                      type="simple"
                      pair={pot2pump}
                      action={<></>}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Mobile Content */}
          <div className="md:hidden min-h-[600px] h-[calc(100vh-300px)]">
            <div className="h-full flex flex-col px-2 overflow-hidden">
              {activeTab === POT_TABS.NEW && (
                <div className="flex flex-col gap-4 pb-2 overflow-y-auto h-full [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                  {newTokens?.map((pot2pump, index) => (
                    <motion.div key={index} variants={itemPopUpVariants}>
                      <LaunchCardV3
                        type="simple"
                        pair={pot2pump}
                        action={<></>}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === POT_TABS.ALMOST && (
                <div className="flex flex-col gap-4 pb-2 overflow-y-auto h-full [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                  {nearSuccessTokens?.map((pot2pump, index) => (
                    <motion.div key={index} variants={itemPopUpVariants}>
                      <LaunchCardV3
                        type="simple"
                        pair={pot2pump}
                        action={<></>}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === POT_TABS.MOON && (
                <div className="flex flex-col gap-4 pb-2 overflow-y-auto h-full [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-amber-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-white [-webkit-scrollbar]:mr-0 [&::-webkit-scrollbar]:mr-2 pr-2">
                  {highPriceTokens?.map((pot2pump, index) => (
                    <motion.div key={index} variants={itemPopUpVariants}>
                      <LaunchCardV3
                        type="simple"
                        pair={pot2pump}
                        action={<></>}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Pot2PumpOverviewPage;
