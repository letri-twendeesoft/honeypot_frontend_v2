import { observer } from "mobx-react-lite";
import { TokenSelector } from "@/components/TokenSelector";
import { SwapAmount } from "../SwapAmount/index";
import { liquidity } from "@/services/liquidity";
import { Button } from "@/components/button";
import { Token } from "@/services/contract/token";
import { SpinnerContainer } from "../Spinner";
import { PlusSvg } from "../svg/plus";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { isEthAddress } from "@/lib/address";
import { wallet } from "@/services/wallet";

export const LPCard = observer(() => {
  const router = useRouter();
  const { inputCurrency, outputCurrency } = router.query as {
    inputCurrency: string;
    outputCurrency: string;
  };
  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }
    if (inputCurrency && isEthAddress(inputCurrency)) {
      liquidity.setFromToken(new Token({ address: inputCurrency }));
    }
    if (outputCurrency && isEthAddress(outputCurrency)) {
      liquidity.setToToken(new Token({ address: outputCurrency }));
    }
  }, [inputCurrency, outputCurrency, wallet.isInit]);
  return (
    <SpinnerContainer isLoading={liquidity.currentPair.loading}>
      <div className=" flex flex-col justify-center items-start gap-[23px] [background:var(--card-color,#271A0C)] p-[20px] rounded-[20px] border-2 border-solid border-[rgba(247,147,26,0.10)]">
        <div className="flex justify-between items-center w-full">
          <SwapAmount
            label="From"
            inputProps={{
              value: liquidity.fromAmount,
              disabled: !liquidity.fromToken,
              max: liquidity.fromToken?.balance.toNumber(),
              min: 0,
              onClear: () => {
                liquidity.setFromAmount("");
              },
              onChange: (e) => {
                liquidity.setFromAmount(e.target.value);
              },
            }}
          ></SwapAmount>
          <div className="flex flex-col items-end">
            {!!liquidity.fromToken && (
              <div className="flex items-center">
                <div className="text-sub">
                  Balance: {liquidity.fromToken.balanceFormatted}
                </div>
                <div
                  onClick={() => {
                    liquidity.setFromAmount(
                      (liquidity.fromToken as Token).balance.toFixed()
                    );
                  }}
                  className="  cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] text-base ml-[8px] font-bold leading-3 tracking-[0.16px] underline"
                >
                  Max
                </div>
              </div>
            )}
            <TokenSelector
              value={liquidity.fromToken}
              onSelect={(token) => {
                liquidity.setFromToken(token);
              }}
            ></TokenSelector>
          </div>
        </div>
        <div className="flex w-full items-center gap-[5px]">
          <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
          <PlusSvg></PlusSvg>
          <div className=" h-px flex-[1_0_0] [background:rgba(247,147,26,0.20)] rounded-[100px]"></div>
        </div>
        <div className="flex justify-between  items-center w-full">
          <SwapAmount
            label="To"
            inputProps={{
              value: liquidity.toAmount,
              disabled: !liquidity.toToken || !!liquidity.currentPair.value,
              max: liquidity.toToken?.balance.toNumber(),
              min: 0,
              onClear: () => {
                liquidity.setToAmount("");
              },
              isClearable: !liquidity.currentPair.value,
              onChange: (e) => {
                liquidity.setToAmount(e.target.value);
              },
            }}
          ></SwapAmount>
          <div className="flex flex-col items-end">
            {!!liquidity.toToken && (
              <div className="flex items-center">
                <div className="text-sub">
                  Balance: {liquidity.toToken.balanceFormatted}
                </div>
                <div
                  onClick={() => {
                    liquidity.setToAmount(
                      (liquidity.toToken as Token).balance.toFixed()
                    );
                  }}
                  className="  cursor-pointer text-[color:var(--Button-Gradient,#F7931A)] text-base ml-[8px] font-bold leading-3 tracking-[0.16px] underline"
                >
                  Max
                </div>
              </div>
            )}
            <TokenSelector
              value={liquidity.toToken}
              onSelect={(token) => {
                liquidity.setToToken(token);
              }}
            ></TokenSelector>
          </div>
        </div>
        <Button
          isDisabled={liquidity.isDisabled}
          isLoading={liquidity.addLiquidity.loading}
          onClick={() => {
            liquidity.addLiquidity.call();
          }}
        >
          {liquidity.buttonContent}
        </Button>
      </div>
    </SpinnerContainer>
  );
});
