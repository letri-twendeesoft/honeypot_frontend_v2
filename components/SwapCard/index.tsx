import { observer, useLocalObservable } from "mobx-react-lite";
import { TokenSelector } from "@/components/TokenSelector";
import { SwapAmount } from "../SwapAmount/index";
import { swap } from "@/services/swap";
import { ExchangeSvg } from "../svg/exchange";
import { Button } from "@/components/button";
import { Token } from "@/services/contract/token";
import { SpinnerContainer } from "../Spinner";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isEthAddress } from "@/lib/address";
import { useAccount } from "wagmi";
import { wallet } from "@/services/wallet";
import { amountFormatted } from "../../lib/format";
import { AmountFormat } from "../AmountFormat";
import ChartData from "../svg/chartData";
import SwapPriceFeedGraph from "../PriceFeedGraph/SwapPriceFeedGraph";
import { liquidity } from "@/services/liquidity";
import { chart } from "@/services/chart";
import LoadingDisplay from "../LoadingDisplay/LoadingDisplay";
import { trpc, trpcClient } from "@/lib/trpc";
import { GhostPair } from "@/services/indexer/indexerTypes";
import { ItemSelect, SelectItem, SelectState } from "../ItemSelect";
import { Tooltip } from "@nextui-org/react";
import Image from "next/image";
import { delay } from "lodash";
import { LuOption } from "react-icons/lu";
import { IoOptions } from "react-icons/io5";
import { SlOptions } from "react-icons/sl";
import { FaLongArrowAltRight } from "react-icons/fa";
import TokenLogo from "../TokenLogo/TokenLogo";

export const SwapCard = observer(() => {
  const router = useRouter();
  const state = useLocalObservable(() => ({
    selectState: new SelectState({
      value: 0,
      onSelectChange: (value) => {
        swap.setFromAmount(
          (swap.fromToken as Token).balance.times(value).toFixed()
        );
      },
    }),
  }));

  const { inputCurrency, outputCurrency } = router.query as {
    inputCurrency: string;
    outputCurrency: string;
  };


  const isinit = wallet.isInit
  useEffect(() => {
    if (!isinit) {
      return;
    }
    if (inputCurrency && isEthAddress(inputCurrency)) {
      swap.setToToken(
        Token.getToken({
          address: inputCurrency,
        })
      );
    }
    if (outputCurrency && isEthAddress(outputCurrency)) {
      swap.setToToken(
        Token.getToken({
          address: outputCurrency,
        })
      );
    }
  }, [inputCurrency, outputCurrency, isinit]);
  return (
    <SpinnerContainer
      className="flex flex-1 justify-around items-center max-w-[574px]"
      isLoading={false}
    >
      <div className=" flex flex-1 flex-col justify-center items-start gap-[23px] [background:var(--card-color,#271A0C)] p-[20px] rounded-[20px] border-2 border-solid border-[rgba(247,147,26,0.10)]">
        {(isinit && (
          <>
            <div
              onClick={() => {
                chart.toggleChart();
              }}
              className="cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] text-base font-bold leading-3 tracking-[0.16px]"
            >
              <ChartData></ChartData>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center w-full">
              <SwapAmount
                label="From"
                inputProps={{
                  value: swap.fromAmount,
                  disabled: !swap.fromToken,
                  max: swap.fromToken?.balance.toNumber(),
                  min: 0,
                  onClear: () => {
                    swap.setFromAmount("");
                  },
                  onChange: (e) => {
                    swap.setFromAmount(e.target.value);
                  },
                }}
              ></SwapAmount>
              <div className="flex flex-col items-end w-full lg:w-[unset]">
                {!!swap.fromToken && (
                  <div className="flex items-center">
                    <div className="text-sub">
                      Balance: {swap.fromToken.balanceFormatted}
                    </div>
                    <div
                      onClick={() => {
                        swap.setFromAmount(
                          (swap.fromToken as Token).balance.toFixed()
                        );
                      }}
                      className="  cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] text-base ml-[8px] font-bold leading-3 tracking-[0.16px] underline"
                    >
                      Max
                    </div>
                  </div>
                )}
                <TokenSelector
                  value={swap.fromToken}
                  onSelect={(token) => {
                    swap.setFromToken(token);
                  }}
                ></TokenSelector>
              </div>
            </div>
            <div className="flex w-full items-center gap-[5px]">
              <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
              <ExchangeSvg
                className=" cursor-pointer hover:rotate-180 transition-all"
                onClick={() => {
                  swap.switchTokens();
                }}
              ></ExchangeSvg>
              <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-center w-full">
              <SwapAmount
                label="To"
                inputProps={{
                  value: swap.toAmount,
                  isClearable: false,
                  disabled: true,
                  onChange: (e) => {
                    swap.setToAmount(e.target.value);
                  },
                }}
              ></SwapAmount>
              <div className="flex flex-col items-end w-full lg:w-[unset]">
                {!!swap.toToken && (
                  <div className="flex items-center">
                    <div className="text-sub">
                      Balance: {swap.toToken.balanceFormatted}
                    </div>
                  </div>
                )}
                <TokenSelector
                  value={swap.toToken}
                  onSelect={(token) => {
                    swap.setToToken(token);
                  }}
                ></TokenSelector>
              </div>
            </div>
            {!!swap.price && (
              <div className="flex  w-full lg:w-[529px] max-w-full h-[71px] justify-between items-center border [background:#291C0A] px-5 py-2.5 rounded-2xl border-solid border-[rgba(247,147,26,0.20)]">
                <div>
                  <div>
                    <AmountFormat amount={swap.price?.toFixed()}></AmountFormat>
                  </div>
                  <div>
                    {swap.toToken?.displayName} per{" "}
                    {swap.fromToken?.displayName}
                  </div>
                </div>
                <div>
                  <div>
                    {amountFormatted(swap.minToAmount, {
                      decimals: 0,
                      fixed: 6,
                    })}{" "}
                    {swap.toToken?.displayName}
                  </div>
                  <div>Minimum Received</div>
                </div>
              </div>
            )}{" "}
            {swap.fromToken && swap.toToken && (
              <ItemSelect
                selectState={state.selectState}
                className="gap-[16px] flex justify-between w-full flex-wrap"
              >
                <SelectItem className="rounded-[30px] px-[24px]" value={0.25}>
                  25%
                </SelectItem>
                <SelectItem className="rounded-[30px] px-[24px]" value={0.5}>
                  50%
                </SelectItem>
                <SelectItem className="rounded-[30px] px-[24px]" value={0.75}>
                  75%
                </SelectItem>
                <SelectItem className="rounded-[30px] px-[24px]" value={1}>
                  100%
                </SelectItem>
              </ItemSelect>
            )}
            {swap.routerToken && (
              <div className="w-full p-1 flex justify-between items-center rounded-xl  bg-black/50">
                <>
                  <div>
                    <Tooltip
                      content={
                        <div className="flex flex-col items-center gap-[8px]">
                          {swap.fromToken?.name} ({swap.fromToken?.symbol})
                        </div>
                      }
                      closeDelay={0}
                    >
                      <div>
                        <TokenLogo token={swap.fromToken as Token} />
                      </div>
                    </Tooltip>
                  </div>
                  <FaLongArrowAltRight />
                </>

                {swap.routerToken.map((token) => (
                  <>
                    <div key={token.address}>
                      <Tooltip
                        content={
                          <div className="flex flex-col items-center gap-[8px]">
                            {token.name} ({token.symbol})
                          </div>
                        }
                        closeDelay={0}
                      >
                        <div>
                          <TokenLogo token={token} />
                        </div>
                      </Tooltip>
                    </div>
                    <FaLongArrowAltRight />
                  </>
                ))}
                <div>
                  <Tooltip
                    content={
                      <div className="flex flex-col items-center gap-[8px]">
                        {swap.toToken?.name} ({swap.toToken?.symbol})
                      </div>
                    }
                    closeDelay={0}
                  >
                    <div>
                      <TokenLogo token={swap.toToken as Token} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            )}
            <Button
              isDisabled={swap.isDisabled}
              isLoading={swap.swapExactTokensForTokens.loading}
              onClick={async () => {
                await swap.swapExactTokensForTokens.call();
              }}
            >
              {swap.buttonContent}
            </Button>
          </>
        )) || <LoadingDisplay></LoadingDisplay>}
      </div>
    </SpinnerContainer>
  );
});
