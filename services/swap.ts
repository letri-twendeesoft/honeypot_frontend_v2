// import scrollTokens from '~/static/tokens/scroll_tokens.json'
// import scrollSepoliaTokens from '~/static/tokens/scroll_alpha_tokens.json'
import { Token } from "./contract/token";
import { PairContract } from "./contract/pair-contract";
import BigNumber from "bignumber.js";
import { wallet } from "./wallet";
import { liquidity } from "./liquidity";
import { exec } from "~/lib/contract";
import { autorun, makeAutoObservable, reaction, when } from "mobx";
import { AsyncState } from "./utils";
import { debounce } from "lodash";
import dayjs from "dayjs";
import { chart } from "./chart";
import { zeroAddress } from "viem";

class Swap {
  fromToken: Token | null = null;
  toToken: Token | null = null;

  fromAmount: string = "";
  toAmount: string = "";
  slippage: number = 1;
  deadline: number = 20;
  price: BigNumber | null = null;

  routerToken: Token[] | undefined = undefined;

  getRouterToken = async () => {
    this.setRouterToken(undefined);
    if (!this.fromToken || !this.toToken) {
      return undefined;
    }

    const routerPossiblePaths = this.getRouterPathsByValidatedToken();

    const bestPath = await this.calculateBestPathFromRouterPaths(
      routerPossiblePaths
    );

    this.setRouterToken(bestPath.map((t) => Token.getToken({ address: t })));
  };

  currentPair = new AsyncState(async () => {
    if (this.fromToken && this.toToken) {
      if (this.isWrapOrUnwrap) {
        return new PairContract({
          address: zeroAddress,
          token0: this.fromToken,
          token1: this.toToken,
        });
      } else if (
        liquidity.getMemoryPair(
          this.fromToken.address.toLowerCase(),
          this.toToken.address.toLowerCase()
        )
      ) {
        const res = await liquidity.getPairByTokens(
          this.fromToken.address,
          this.toToken.address
        );
        await res?.init();
        return res;
      } else {
        await this.getRouterToken();
        console.log(this.routerToken);
      }
    }
  });

  get isUnwrap() {
    return (
      this.fromToken?.address === this.toToken?.address &&
      this.toToken?.isNative &&
      !this.fromToken?.isNative
    );
  }
  get isWrap() {
    return (
      this.fromToken?.address === this.toToken?.address &&
      this.fromToken?.isNative &&
      !this.toToken?.isNative
    );
  }

  get isWrapOrUnwrap() {
    return (
      this.fromToken?.address === this.toToken?.address &&
      this.fromToken?.isNative !== this.toToken?.isNative
    );
  }

  //whether the sort of from and to token is consistent with the current pair's token0 and token1
  get isTokenPairSortMatch() {
    return (
      this.fromToken?.address === this.currentPair.value?.token0.address &&
      this.toToken?.address === this.currentPair.value?.token1.address
    );
  }

  get isDisabled() {
    return (
      !this.fromToken ||
      !this.toToken ||
      !this.fromAmount ||
      !this.toAmount ||
      (!this.currentPair.value && !this.routerToken) ||
      this.fromToken.balance.toNumber() < Number(this.fromAmount)
    );
  }

  get buttonContent() {
    if (!this.fromToken || !this.toToken) {
      return "Select Tokens";
    }
    if (this.currentPair.loading) {
      return "Loading Pair";
    }

    if (!this.currentPair.value && !this.routerToken) {
      return "Insufficient Liquidity";
    }
    if (!this.fromAmount || !this.toAmount) {
      return "Enter Amount";
    }
    if (this.fromToken.balance.toNumber() < Number(this.fromAmount)) {
      return "Insufficient Balance";
    }
    return "Swap";
  }

  get factoryContract() {
    return wallet.contracts.factory;
  }

  get routerV2Contract() {
    return wallet.contracts.routerV2;
  }

  get minToAmount() {
    if (this.isWrapOrUnwrap) {
      return new BigNumber(this.toAmount || 0);
    }
    return new BigNumber(this.toAmount || 0).minus(
      new BigNumber(this.toAmount || 0).multipliedBy(this.slippage).div(100)
    );
  }

  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.fromToken?.address,
      async () => {
        this.setRouterToken(undefined);
        this.currentPair.setValue(undefined);
        await this.toToken?.init();
        chart.setChartTarget(this.fromToken as Token);
        if (this.fromToken && this.toToken) {
          await this.currentPair.call();
          chart.setChartTarget(this.currentPair.value as PairContract);
        }
      }
    );
    reaction(
      () => this.toToken?.address,
      async () => {
        this.setRouterToken(undefined);
        this.currentPair.setValue(undefined);
        await this.toToken?.init();
        chart.setChartTarget(this.toToken);
        if (this.fromToken && this.toToken) {
          await this.currentPair.call();
          chart.setChartTarget(this.currentPair.value as PairContract);
          // if (this.fromAmount.length > 0) {
          //   this.toAmount = (
          //     await this.getFinalAmountOut(
          //       this.routerToken?.map((t) => t.address.toLowerCase()) || [
          //         this.fromToken.address.toLowerCase(),
          //         this.toToken.address.toLowerCase(),
          //       ],
          //       new BigNumber(this.fromAmount)
          //     )
          //   )
          //     .toNumber()
          //     .toString();
          // }
          if (this.fromAmount.length > 0) {
            this.fromAmount = "0" + this.fromAmount;
          }
        }
      }
    );
    reaction(
      () => this.fromAmount,
      debounce(async () => {
        if (!this.currentPair.value && !this.routerToken) {
          return;
        }

        this.fromAmount = String(Number(this.fromAmount));

        if (
          new BigNumber(this.fromAmount || 0).isGreaterThan(0) &&
          this.fromToken &&
          this.toToken
        ) {
          if (this.routerToken) {
            const finalAmountOut = await this.getFinalAmountOut(
              this.routerToken.map((t) => t.address.toLowerCase())
            );

            this.toAmount = finalAmountOut.toFixed();
            this.price = new BigNumber(this.toAmount).div(this.fromAmount);
          } else {
            const [toAmount] = await this.currentPair.value!.getAmountOut.call(
              this.fromAmount,
              this.fromToken as Token
            );

            this.toAmount = toAmount?.toFixed();
            this.price = new BigNumber(this.toAmount).div(this.fromAmount);
          }
        } else {
          this.toAmount = "";
          this.price = null;
        }
      }, 300)
    );
  }

  setDeadline(deadline: number) {
    this.deadline = deadline;
  }
  setSlippage(slippage: number) {
    this.slippage = slippage;
  }

  switchTokens() {
    const fromToken = this.fromToken;
    const fromAmount = this.fromAmount;
    this.fromToken = this.toToken;
    this.toToken = fromToken;
    this.fromAmount = this.toAmount;
    this.toAmount = fromAmount;
  }

  setFromToken(token: Token) {
    if (this.fromToken?.address !== token?.address || this.isWrapOrUnwrap) {
      // indicate this is a wrap to native or native to swap
      if (
        this.toToken?.address === token?.address &&
        this.toToken?.isNative === token?.isNative
      ) {
        this.toToken = this.fromToken;
        this.toAmount = "";
      }
      this.fromToken = token;
      this.fromToken.init();
      this.fromAmount = "";
    }
  }

  setFromAmount(amount: string) {
    this.fromAmount = amount;
  }

  setToToken(token: Token) {
    if (this.toToken?.address !== token?.address || this.isWrapOrUnwrap) {
      // indicate this is a wrap to native or native to swap
      if (
        this.fromToken?.address === token?.address &&
        this.fromToken?.isNative === token?.isNative
      ) {
        this.fromToken = this.toToken;
        this.fromAmount = "";
      }
      this.toToken = token;
      this.toToken.init();
      this.toAmount = "";
    }
  }

  setToAmount(amount: string) {
    this.toAmount = amount;
  }

  swapExactTokensForTokens = new AsyncState(async () => {
    if (
      !this.fromToken ||
      !this.toToken ||
      !this.fromAmount ||
      !this.toAmount ||
      (!this.currentPair.value && !this.routerToken)
    ) {
      return;
    }
    const fromAmountDecimals = new BigNumber(this.fromAmount)
      .multipliedBy(new BigNumber(10).pow(this.fromToken.decimals))
      .toFixed(0);

    const deadline = dayjs().unix() + 60 * (this.deadline || 20);

    await Promise.all([
      this.fromToken.approveIfNoAllowance({
        amount: fromAmountDecimals,
        spender: this.routerV2Contract.address,
      }),
    ]);

    if (this.isWrapOrUnwrap) {
      if (this.isWrap) {
        // @ts-ignore
        await this.toToken.deposit.callV2({
          value: BigInt(fromAmountDecimals),
        });
      } else if (this.isUnwrap) {
        // @ts-ignore
        await this.toToken.withdraw.callV2([BigInt(fromAmountDecimals)]);
      }
    } else {
      const path = this.routerToken
        ? (this.routerToken.map((t) => t.address) as `0x${string}`[])
        : ([this.fromToken.address, this.toToken.address] as `0x${string}`[]);

      const finalAmountOut = this.routerToken
        ? await this.getFinalAmountOut(path.map((p) => p.toLowerCase()))
        : this.toAmount;

      const minAmountOutDecimals = new BigNumber(finalAmountOut)
        .multipliedBy(1 - this.slippage / 100)
        .multipliedBy(new BigNumber(10).pow(this.toToken.decimals))
        .toFixed(0);

      if (this.fromToken.isNative) {
        await this.routerV2Contract.swapExactETHForTokens.call(
          [
            BigInt(minAmountOutDecimals),
            path,
            wallet.account as `0x${string}`,
            BigInt(deadline),
          ],
          {
            value: BigInt(fromAmountDecimals),
          }
        );
      } else if (this.toToken.isNative) {
        await this.routerV2Contract.swapExactTokensForETH.call([
          BigInt(fromAmountDecimals),
          BigInt(minAmountOutDecimals),
          path,
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      } else {
        await this.routerV2Contract.swapExactTokensForTokens.call([
          BigInt(fromAmountDecimals),
          BigInt(minAmountOutDecimals),
          path,
          wallet.account as `0x${string}`,
          BigInt(deadline),
        ]);
      }
    }

    this.fromAmount = "";

    Promise.all([
      this.currentPair.value?.init(true),
      this.fromToken.getBalance(),
      this.toToken.getBalance(),
    ]);
  });

  setRouterToken(value: Token[] | undefined) {
    this.routerToken = value;
  }

  getSwapPath = (routerTokenAddress: string[]): readonly `0x${string}`[] => {
    if (routerTokenAddress.length > 0) {
      if (routerTokenAddress.length === 1) {
        return [
          this.fromToken!.address,
          routerTokenAddress[0],
          this.toToken!.address,
        ] as readonly `0x${string}`[];
      } else if (routerTokenAddress.length === 2) {
        return [
          this.fromToken!.address,
          routerTokenAddress[0],
          routerTokenAddress[1],
          this.toToken!.address,
        ] as readonly `0x${string}`[];
      }
    }

    return [
      this.fromToken!.address,
      this.toToken!.address,
    ] as readonly `0x${string}`[];
  };

  getFinalAmountOut = async (
    pathAddress: string[],
    startingAmount: BigNumber = new BigNumber(this.fromAmount)
  ): Promise<BigNumber> => {
    let finalAmountOut = startingAmount;

    for (let i = 0; i < pathAddress.length - 1; i++) {
      const pair = liquidity.getMemoryPair(
        pathAddress[i].toLowerCase(),
        pathAddress[i + 1].toLowerCase()
      );

      if (!pair) {
        return new BigNumber(0);
      }

      await pair.init();

      const [toAmount] = await pair.getAmountOut.call(
        finalAmountOut.toFixed(),
        pair.token0.address === pathAddress[i] ? pair.token0 : pair.token1
      );

      finalAmountOut = toAmount ? (toAmount as BigNumber) : new BigNumber(0);
    }

    return finalAmountOut;
  };

  getRouterPathsByValidatedToken = (): string[][] | undefined => {
    if (!this.fromToken || !this.toToken) {
      return undefined;
    }
    const paths: Token[][] = [];

    //if from or to token is validated token, route them by from -> router token -> to
    if (
      liquidity.isValidatedToken(this.fromToken.address.toLowerCase()) ||
      liquidity.isValidatedToken(this.toToken.address.toLowerCase())
    ) {
      if (liquidity.isValidatedToken(this.fromToken.address.toLowerCase())) {
        const toTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
          this.toToken.address.toLowerCase()
        );

        if (toTokenRouterTokens.length === 0) {
          return undefined;
        }

        for (let i = 0; i < toTokenRouterTokens.length; i++) {
          const RT = Token.getToken({
            address: toTokenRouterTokens[i].toLowerCase(),
          });
          if (
            liquidity.getMemoryPair(
              this.fromToken.address.toLowerCase(),
              RT.address.toLowerCase()
            )
          ) {
            RT.init();
            paths.push([RT]);
          }
        }
      } else {
        const fromTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
          this.fromToken.address.toLowerCase()
        );

        if (fromTokenRouterTokens.length === 0) {
          return undefined;
        }

        for (let i = 0; i < fromTokenRouterTokens.length; i++) {
          const RT = Token.getToken({
            address: fromTokenRouterTokens[i].toLowerCase(),
          });
          if (
            liquidity.getMemoryPair(
              RT.address.toLowerCase(),
              this.toToken.address.toLowerCase()
            )
          ) {
            RT.init();
            paths.push([RT]);
          }
        }
      }
    }

    //try to get 1 token in fto tokens for both from and to
    //route them by from -> router token -> to
    const fromTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
      this.fromToken.address.toLowerCase()
    );

    if (fromTokenRouterTokens.length === 0) {
      return undefined;
    }

    fromTokenRouterTokens.forEach((rtoken) => {
      if (
        liquidity.getMemoryPair(
          this.toToken!.address.toLowerCase(),
          rtoken.toLowerCase()
        )
      ) {
        const RT = Token.getToken({ address: rtoken.toLowerCase() });
        RT.init();
        paths.push([RT]);
      }
    });

    // if there is not one token for both,
    // get fto tokens for from and to separately
    // and route them by from -> router token 1 -> router token 2 -> to
    const toTokenRouterTokens = liquidity.getTokenToValidatedTokenPairs(
      this.toToken.address.toLowerCase()
    );

    if (toTokenRouterTokens.length === 0) {
      return undefined;
    }

    for (let i = 0; i < fromTokenRouterTokens.length; i++) {
      for (let j = 0; j < toTokenRouterTokens.length; j++) {
        if (
          liquidity.getMemoryPair(
            fromTokenRouterTokens[i].toLowerCase(),
            toTokenRouterTokens[j].toLowerCase()
          )
        ) {
          const RT1 = Token.getToken({
            address: fromTokenRouterTokens[i].toLowerCase(),
          });
          RT1.init();
          const RT2 = Token.getToken({
            address: toTokenRouterTokens[j].toLowerCase(),
          });
          RT2.init();
          paths.push([RT1, RT2]);
        }
      }
    }

    return paths.length > 0
      ? (paths.map((path) => {
          return this.getSwapPath(path.map((t) => t.address.toLowerCase()));
        }) as string[][])
      : undefined;
  };

  calculateBestPathFromRouterPaths = async (path: string[][] | undefined) => {
    if (!path) {
      return [];
    }

    const promises = path.map(async (p) => {
      const finalAmountOut = await this.getFinalAmountOut(
        p,
        new BigNumber(this.fromAmount.length > 0 ? this.fromAmount : 1)
      );
      return finalAmountOut.div(
        new BigNumber(this.fromAmount.length > 0 ? this.fromAmount : 1)
      );
    });

    const prices = await Promise.all(promises);

    const bestPrice = Math.max(...prices.map((p) => p.toNumber()));

    return path[prices.findIndex((p) => p.toNumber() === bestPrice)];
  };
}

export const swap = new Swap();
