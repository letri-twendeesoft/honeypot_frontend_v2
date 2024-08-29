import BigNumber from "bignumber.js";
import { BaseContract } from ".";
import { wallet } from "../wallet";
import { makeAutoObservable } from "mobx";
import { getContract } from "viem";
import { ContractWrite } from "../utils";
import { amountFormatted } from "@/lib/format";
import { ERC20ABI } from "@/lib/abis/erc20";
import { faucetABI } from "@/lib/abis/faucet";
import { watchAsset } from "viem/actions";
import { toast } from "react-toastify";
import { networksMap } from "../chain";

export class Token implements BaseContract {
  static tokensMap: Record<string, Token> = {};
  static getToken({
    address,
    force,
    ...args
  }: {
    address: string;
    force?: boolean;
  } & Partial<Token>) {
    const lowerAddress = address.toLowerCase();
    const key = `${lowerAddress}-${args.isNative ? "native" : "erc20"}`;
    const token = Token.tokensMap[key];
    if (!token) {
      Token.tokensMap[key] = new Token({
        address: lowerAddress,
        ...args,
      });
    } else {
      Token.tokensMap[key].setData(args);
    }
    return Token.tokensMap[key];
  }
  address: string = "";
  name: string = "";
  balanceWithoutDecimals = new BigNumber(0);
  totalSupplyWithoutDecimals = new BigNumber(0);
  symbol: string = "";
  decimals: number = 0;
  abi = ERC20ABI;
  faucetLoading = false;
  claimed = false;
  isInit = false;
  isNative = false;
  logoURI = "";
  isRouterToken = false;
  supportingFeeOnTransferTokens = false;

  // determines the order of the token in the list
  get priority() {
    let score = 0;

    if (this.isNative) {
      score += 1;
    }

    if (this.isRouterToken) {
      score += 1;
    }

    if (this.balance.toNumber() > 0) {
      score += 1;
    }

    return score;
  }

  get displayName() {
    return this.symbol || this.name;
  }

  get faucetContract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: faucetABI,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }
  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  constructor(args: Partial<Token>) {
    this.setData(args);
    makeAutoObservable(this);
    this.getIsRouterToken();
  }

  get faucet() {
    return new ContractWrite(this.faucetContract.write?.faucet, {
      action: "Get Faucet",
    });
  }

  get approve() {
    return new ContractWrite(this.contract.write?.approve, {
      action: "Approve",
    });
  }

  get deposit() {
    return new ContractWrite(this.contract.write?.deposit, {
      action: "Swap BERA to WBERA",
    });
  }

  get withdraw() {
    return new ContractWrite(this.contract.write?.withdraw, {
      action: "Swap WBERA to BERA",
    });
  }

  setLogoURI(logoURI: string) {
    this.logoURI = logoURI;
  }

  setData({ balance, ...args }: Partial<Token>) {
    Object.assign(this, args);
    if (balance) {
      this.balanceWithoutDecimals = new BigNumber(balance);
    }
  }

  async init(
    force?: boolean,
    options?: {
      loadName?: boolean;
      loadSymbol?: boolean;
      loadDecimals?: boolean;
      loadBalance?: boolean;
      loadTotalSupply?: boolean;
      loadClaimed?: boolean;
      loadLogoURI?: boolean;
    }
  ) {
    if (this.isInit && !force) {
      return;
    }
    const loadName = options?.loadName ?? true;
    const loadSymbol = options?.loadSymbol ?? true;
    const loadDecimals = options?.loadDecimals ?? true;
    const loadBalance = options?.loadBalance ?? true;
    const loadTotalSupply = options?.loadTotalSupply ?? false;
    const loadClaimed = options?.loadClaimed ?? false;
    const loadLogoURI = options?.loadLogoURI ?? true;

    console.log("init token", this.address);

    await Promise.all([
      loadName && !this.name
        ? this.contract.read.name().then((name) => {
            console.log("name", name);
            this.name = name;
          })
        : Promise.resolve(),
      loadSymbol && !this.symbol
        ? this.contract.read.symbol().then((symbol) => {
            console.log("symbol", symbol);
            this.symbol = symbol;
          })
        : Promise.resolve(),
      loadDecimals && !this.decimals
        ? this.contract.read.decimals().then((decimals) => {
            console.log("decimals", decimals);
            this.decimals = decimals;
          })
        : Promise.resolve(),
      loadBalance ? this.getBalance() : Promise.resolve(),
      loadTotalSupply ? this.getTotalSupply() : Promise.resolve(),
      loadClaimed
        ? this.getClaimed().then((claimed) => {
            this.claimed = claimed;
          })
        : Promise.resolve(),
    ]).catch((e) => {
      console.log(e);
      return;
    });

    // fauset tokens

    this.isInit = true;
  }

  async approveIfNoAllowance({
    amount,
    spender,
  }: {
    amount: string;
    spender: string;
  }) {
    const allowance = await this.contract.read.allowance([
      wallet.account as `0x${string}`,
      spender as `0x${string}`,
    ]);
    if (
      new BigNumber(allowance.toString()).isGreaterThanOrEqualTo(
        new BigNumber(amount)
      )
    ) {
      return;
    }
    await this.approve.call([spender as `0x${string}`, BigInt(amount)]);
  }

  async getClaimed(): Promise<boolean> {
    console.log("getClaimed");
    const claimed = await this.faucetContract.read.faucetClaimer([
      wallet.account as `0x${string}`,
    ]);

    return claimed;
  }

  async getBalance() {
    try {
      const balance = this.isNative
        ? await wallet.publicClient.getBalance({
            address: wallet.account as `0x${string}`,
          })
        : await this.contract.read.balanceOf([wallet.account as `0x${string}`]);
      this.balanceWithoutDecimals = new BigNumber(balance.toString());
      return this.balanceWithoutDecimals;
    } catch (e) {
      console.log(e);
      return new BigNumber(0);
    }
  }

  async getTotalSupply() {
    const totalSupply = await this.contract.read.totalSupply();
    this.totalSupplyWithoutDecimals = new BigNumber(totalSupply.toString());
    return this.totalSupplyWithoutDecimals;
  }

  get balance() {
    // console.log('this.balanceWithoutDecimals', this.balanceWithoutDecimals)
    return this.balanceWithoutDecimals.div(
      new BigNumber(10).pow(this.decimals)
    );
  }

  get balanceFormatted() {
    return amountFormatted(this.balanceWithoutDecimals, {
      decimals: this.decimals,
      fixed: 3,
    });
  }

  getIsRouterToken() {
    this.isRouterToken =
      networksMap[wallet.currentChainId].validatedTokensInfo[
        this.address.toLowerCase()
      ]?.isRouterToken;
    return this.isRouterToken;
  }

  getSupportedFeeOnTransferTokens() {
    this.supportingFeeOnTransferTokens =
      networksMap[wallet.currentChainId].validatedTokensInfo[
        this.address.toLowerCase()
      ]?.supportingFeeOnTransferTokens;
    return this.supportingFeeOnTransferTokens;
  }

  async watch() {
    console.log("watching image", window.location.origin + this.logoURI);
    watchAsset(wallet.walletClient, {
      type: "ERC20",
      options: {
        address: this.address,
        symbol: this.symbol,
        decimals: this.decimals,
        image: this.logoURI,
      },
    })
      .then(() => {
        toast.success("Token added to wallet");
      })
      .catch((e) => {
        toast.error("Failed to add token to wallet");
      });
  }
}
