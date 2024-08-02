import { Token } from "./token";
import BigNumber from "bignumber.js";
import { BaseContract } from ".";
import { wallet } from "../wallet";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { makeAutoObservable } from "mobx";
import { getContract } from "viem";
import { AsyncState } from "../utils";
import { amountFormatted } from "@/lib/format";
import dayjs from "dayjs";

// const totalSupply = await pairContract.methods.totalSupply().call()
// const LPTokenBalance = await this.balanceOf(pairAddress)
// const LPtoken0Balance = reserve0 * LPTokenBalance / totalSupply
// const LPtoken1Balance = reserve1 * LPTokenBalance / totalSxupply

export class PairContract implements BaseContract {
  address: string = "";
  name: string = "";
  abi = IUniswapV2Pair.abi;
  token: Token = new Token({});
  deadline: number = 20;

  reserves: {
    reserve0: BigNumber;
    reserve1: BigNumber;
  } | null = null;
  token0: Token = new Token({}); // fixed
  token1: Token = new Token({}); // fixed
  isInit = false;
  isLoading = false;

  get token0LpBalance() {
    return !new BigNumber(this.token.totalSupplyWithoutDecimals || 0).eq(0)
      ? new BigNumber(this.reserves?.reserve0 || 0)
          .multipliedBy(this.token.balanceWithoutDecimals || 0)
          .div(this.token.totalSupplyWithoutDecimals || 0)
      : new BigNumber(0);
  }

  get token1LpBalance() {
    return !new BigNumber(this.token.totalSupplyWithoutDecimals || 0).eq(0)
      ? new BigNumber(this.reserves?.reserve1 || 0)
          .multipliedBy(this.token.balanceWithoutDecimals || 0)
          .div(this.token.totalSupplyWithoutDecimals || 0)
      : new BigNumber(0);
  }
  get myLiquidityDisplay() {
    return this.token0LpBalance &&
      this.token0.displayName &&
      this.token1LpBalance &&
      this.token1.displayName
      ? `${amountFormatted(this.token0LpBalance, {
          decimals: 0,
          fixed: 3,
        })} ${this.token0.displayName} - ${amountFormatted(
          this.token1LpBalance,
          {
            decimals: 0,
            fixed: 3,
          }
        )} ${this.token1.displayName}`
      : "-";
  }

  get liquidityDisplay() {
    return this.reserves?.reserve0 &&
      this.token0.displayName &&
      this.reserves?.reserve1 &&
      this.token1.displayName
      ? `${amountFormatted(this.reserves?.reserve0, {
          decimals: 0,
          fixed: 3,
        })} ${this.token0.displayName} - ${amountFormatted(
          this.reserves?.reserve1,
          {
            decimals: 0,
            fixed: 3,
          }
        )} ${this.token1.displayName}`
      : "-";
  }

  get poolName() {
    return this.token0.displayName + "-" + this.token1.displayName;
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: {
        public: wallet.publicClient,
        wallet: wallet.walletClient,
      },
    });
  }

  get routerV2Contract() {
    return wallet.contracts.routerV2;
  }

  constructor(args: Partial<PairContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  async getReserves() {
    const reserves = await this.contract?.read.getReserves();
    const [reserve0, reserve1] = (reserves as any[]) || [];
    if (reserve0 && reserve1) {
      this.reserves = {
        reserve0: new BigNumber(reserve0.toString()).div(
          new BigNumber(10).pow(this.token0.decimals)
        ),
        reserve1: new BigNumber(reserve1.toString()).div(
          new BigNumber(10).pow(this.token1.decimals)
        ),
      };
    }
  }
  getAmountOut = new AsyncState(
    async (fromAmount: string, fromToken: Token) => {
      await this.getReserves();
      if (!this.reserves) {
        return new BigNumber(0);
      }
      const reserve0 = BigInt(
        this.reserves.reserve0
          .multipliedBy(new BigNumber(10).pow(this.token0.decimals))
          .toFixed(0)
      );
      const reserve1 = BigInt(
        this.reserves.reserve1
          .multipliedBy(new BigNumber(10).pow(this.token1.decimals))
          .toFixed(0)
      );

      console.log(this);

      const reserveIn =
        fromToken.address === this.token0.address ? reserve0 : reserve1;
      const reserveOut =
        fromToken.address === this.token0.address ? reserve1 : reserve0;
      const toToken =
        fromToken.address === this.token0.address ? this.token1 : this.token0;
      const amountOut = await this.routerV2Contract.contract.read.getAmountOut([
        BigInt(
          new BigNumber(fromAmount)
            .multipliedBy(new BigNumber(10).pow(fromToken.decimals))
            .toFixed(0)
        ),
        reserveIn,
        reserveOut,
      ]);
      console.log("toToken.decimals", toToken.decimals);
      console.log(
        new BigNumber(amountOut.toString())
          .div(new BigNumber(10).pow(toToken.decimals))
          .toFixed()
      );
      return new BigNumber(amountOut.toString()).div(
        new BigNumber(10).pow(toToken.decimals)
      );
    }
  );

  async init(force = false) {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    if (force || !this.isInit) {
      try {
        await Promise.all([
          (async () => {
            this.token = new Token({
              address: this.address,
            });
            await this.token.init({
              loadName: false,
              loadSymbol: false,
              loadDecimals: false,
              loadTotalSupply: true,
            });
          })(),
          this.getReserves(),
        ]);
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
    this.isInit = true;
  }
  removeLiquidity = new AsyncState(async (percent: number) => {
    const liquidity = this.token.balanceWithoutDecimals.multipliedBy(percent);
    if (liquidity.gt(0)) {
      await this.token.approveIfNoAllowance({
        amount: liquidity.toFixed(0),
        spender: this.routerV2Contract.address,
      });
      const deadline = dayjs().unix() + 60 * (this.deadline || 20);
      await this.routerV2Contract.removeLiquidity.call([
        this.token0.address as `0x${string}`,
        this.token1.address as `0x${string}`,
        BigInt(liquidity.toFixed(0)),
        BigInt(0),
        BigInt(0),
        wallet.account as `0x${string}`,
        BigInt(deadline),
      ]);
      await this.init(true);
    }
  });
}
