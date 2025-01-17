import { Token } from "@/services/contract/token";
import { getContract, zeroAddress } from "viem";
import { dayjs } from "@/lib/dayjs";
import BigNumber from "bignumber.js";
import { trpcClient } from "@/lib/trpc";
import { makeAutoObservable } from "mobx";
import { AsyncState, ContractWrite } from "@/services/utils";
import { pot2PumpPairABI } from "@/lib/abis/Pot2Pump/pot2PumpPair";
import { formatAmountWithAlphabetSymbol } from "@/lib/algebra/utils/common/formatAmount";
import {
  getParticipantDetail,
  subgraphPot2PumpToMemePair,
} from "@/lib/algebra/graphql/clients/pot2pump";
import { wallet } from "@/services/wallet";
import { ICHIVaultContract } from "../../aquabera/ICHIVault-contract";
import { BaseLaunchContract } from "../base-launch-contract";
import { Pot2Pump } from "@/lib/algebra/graphql/generated/graphql";

export class MemePairContract implements BaseLaunchContract {
  static contractMap: Record<string, MemePairContract> = {};
  static loadContract(
    address: string,
    contractArgs: Partial<MemePairContract>
  ) {
    const contract =
      MemePairContract.contractMap[address] ??
      new MemePairContract({ address });
    MemePairContract.contractMap[address] = contract;
    contract.setData(contractArgs);
    return contract;
  }
  databaseId: number | undefined = undefined;
  address = "";
  name: string = "";
  abi = pot2PumpPairABI;
  raiseToken: Token | undefined = undefined;
  launchedToken: Token | undefined = undefined;
  depositedRaisedTokenWithoutDecimals: BigNumber | null = null;
  depositedLaunchedTokenWithoutDecimals: BigNumber | null = null;
  launchedTokenBuyCount: BigNumber | null = null;
  launchedTokenSellCount: BigNumber | null = null;
  endTime: string = "";
  startTime: string = "";
  launchedTokenProvider: string = "";
  projectName = "";
  description = "";
  telegram = "";
  twitter = "";
  website = "";
  isValidated = false;
  isInit = false;
  provider = "";
  canClaimLP = false;
  canRefund = false;
  isRefundable = false;
  raisedTokenMinCap: BigNumber | undefined = undefined;
  userParticipated = false;
  socials: {
    name: string;
    link: string;
    icon: string;
  }[] = [];
  logoUrl = "";
  bannerUrl = "";
  participantsCount = new BigNumber(0);
  beravoteSpaceId = "";
  vaultBalance = BigInt(0);
  indexerDataLoaded = false;

  constructor(args: Partial<MemePairContract>) {
    Object.assign(this, args);
    this.getIsValidated();
    makeAutoObservable(this);
  }

  setData(args: Partial<MemePairContract>) {
    Object.assign(this, {
      ...args,
    });
  }

  get priceChangeDisplay() {
    return this.launchedToken?.derivedUSD &&
      Number(this.launchedToken?.derivedUSD) &&
      this.launchedToken?.initialUSD &&
      Number(this.launchedToken.initialUSD)
      ? Number(this.launchedToken.derivedUSD) >
        Number(this.launchedToken.initialUSD)
        ? `${formatAmountWithAlphabetSymbol((Number(this.launchedToken.derivedUSD) / Number(this.launchedToken.initialUSD)).toFixed(2), 2)}%`
        : `-${formatAmountWithAlphabetSymbol((Number(this.launchedToken.initialUSD) / Number(this.launchedToken.derivedUSD)).toFixed(2), 2)}%`
      : "--";
  }

  get pottingPercentageDisplay() {
    return this.depositedRaisedToken && this.raisedTokenMinCap
      ? `${formatAmountWithAlphabetSymbol(this.pottingPercentageNumber.toFixed(2), 2)}%`
      : "--";
  }

  get pottingPercentageNumber() {
    return this.depositedRaisedToken && this.raisedTokenMinCap
      ? Number(this.depositedRaisedToken) / Number(this.raisedTokenMinCap)
      : 0;
  }

  get startTimeDisplay() {
    return this.startTime
      ? dayjs(
          new BigNumber(this.startTime).multipliedBy(1000).toNumber()
        ).toISOString()
      : "-";
  }

  get endTimeDisplay() {
    return this.endTime
      ? dayjs(
          new BigNumber(this.endTime).multipliedBy(1000).toNumber()
        ).toISOString()
      : "-";
  }

  get depositedRaisedToken() {
    if (!this.raiseToken) {
      //console.log("token is not initialized");
      return undefined;
    }

    return this.depositedRaisedTokenWithoutDecimals && this.raiseToken.decimals
      ? this.depositedRaisedTokenWithoutDecimals.div(
          new BigNumber(10).pow(this.raiseToken.decimals)
        )
      : undefined;
  }

  get depositedLaunchedToken() {
    if (!this.launchedToken) {
      return undefined;
    }

    return this.depositedLaunchedTokenWithoutDecimals &&
      this.launchedToken.decimals
      ? this.depositedLaunchedTokenWithoutDecimals.div(
          new BigNumber(10).pow(this.launchedToken.decimals)
        )
      : undefined;
  }

  get isProvider() {
    return (
      this.launchedTokenProvider.toLocaleLowerCase() ===
      wallet.account.toLocaleLowerCase()
    );
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  get facadeContract() {
    return wallet.contracts.memeFacade;
  }

  get factoryContract() {
    return wallet.contracts.memeFactory;
  }

  get price() {
    if (this.state === 0) {
      return this.priceAfterSuccess;
    } else {
      return this.priceBeforeSuccess;
    }
  }

  get priceAfterSuccess(): BigNumber {
    if (!(this.state === 0)) {
      return new BigNumber(0);
    }

    return this.launchedToken?.derivedUSD
      ? new BigNumber(this.launchedToken.derivedUSD)
      : new BigNumber(0);
  }

  get priceBeforeSuccess(): BigNumber {
    return this.depositedRaisedToken &&
      this.depositedLaunchedToken &&
      this.raiseToken?.derivedUSD
      ? this.depositedRaisedToken
          .multipliedBy(this.raiseToken.derivedUSD)
          .div(this.depositedLaunchedToken)
      : new BigNumber(0);
  }

  get marketValue() {
    return this.price && this.depositedLaunchedToken
      ? this.price?.multipliedBy(this.depositedLaunchedToken)
      : 0;
  }

  get isCompleted() {
    return (
      this.endTime && new BigNumber(this.endTime).isLessThan(dayjs().unix())
    );
  }

  get remainTime() {
    const now = dayjs();
    if (!this.endTime) {
      return "-";
    }
    const targetTime = dayjs(
      new BigNumber(this.endTime).multipliedBy(1000).toNumber()
    );
    if (!targetTime.isValid()) {
      return "Invalid Date";
    }
    const diffDays = targetTime.diff(now, "days");

    if (Math.abs(diffDays) >= 1) {
      return `${Math.abs(diffDays)} ${
        diffDays > 0 ? "days later" : "days ago"
      }`;
    }

    const diffHours = targetTime.diff(now, "hours");

    if (Math.abs(diffHours) >= 1) {
      return `${Math.abs(diffHours)} ${
        diffHours > 0 ? "hours later" : "hours ago"
      }`;
    }

    const diffMinutes = targetTime.diff(now, "minutes");
    return `${Math.abs(diffMinutes)} ${
      diffMinutes > 0 ? "minutes later" : "minutes ago"
    }`;
  }

  deposit = new AsyncState(async ({ amount }: { amount: string }) => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    amount = new BigNumber(amount)
      .multipliedBy(new BigNumber(10).pow(this.raiseToken.decimals))
      .toFixed();
    await this.raiseToken.approveIfNoAllowance({
      amount,
      spender: this.facadeContract.address,
    });

    await this.facadeContract.deposit.call([
      this.launchedToken.address as `0x${string}`,
      BigInt(amount),
    ]);
    await Promise.all([
      this.getDepositedRaisedToken(),
      this.raiseToken.getBalance(),
    ]);
  });

  refund = new AsyncState(async () => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    await new ContractWrite(this.contract.write.refundRaisedToken, {
      action: "Refund",
    }).call([wallet.account as `0x${string}`]);

    await this.raiseToken?.getBalance();

    this.canRefund = false;
  });

  claimLP = new AsyncState(async () => {
    if (!this.raiseToken || !this.launchedToken) {
      throw new Error("token is not initialized");
    }

    await this.facadeContract.claimLP.call([
      this.launchedToken.address as `0x${string}`,
    ]);
    this.canClaimLP = false;
    this.getVaultBalance();
  });

  get withdraw() {
    return new ContractWrite(this.contract.write.claimLP, {
      action: "Withdraw",
      isSuccessEffect: true,
    });
  }

  get ftoStatusDisplay() {
    switch (this.state) {
      case 0:
        return {
          status: "success",
          color: "bg-success/20 text-success-600",
        };
      case 1:
        return {
          status: "Fail",
          color: "bg-danger/20 text-danger",
        };
      case 2:
        return {
          status: "Paused",
          color: "bg-warning/20 text-warning-600",
        };
      case 3:
        if (this.isCompleted) {
          return {
            status: "Completed",
            color: "bg-[rgba(226,232,240,0.1)] text-default-foreground",
          };
        }
        return {
          status: "Processing",
          color: "text-[#83C2E9] bg-[rgba(131,194,233,0.1)]",
        };
    }
  }

  async getProjectInfo(force?: boolean) {
    if (!force) {
      const cachedProjectInfo = localStorage.getItem(
        `projectInfo-${wallet.currentChainId}-${this.address}`
      );

      if (cachedProjectInfo) {
        this.setData(JSON.parse(cachedProjectInfo));
        return;
      }
    }

    const res = await trpcClient.projects.getProjectInfo.query({
      chain_id: wallet.currentChainId,
      pair: this.address,
    });

    if (!res) {
      return;
    }

    this.socials = [];
    if (res.id) {
      this.databaseId = res.id;
    }
    if (res.telegram) {
      this.telegram = res.telegram;
      this.socials.push({
        name: "telegram",
        link: res.telegram,
        icon: "/images/telegram.svg",
      });
    }
    if (res.twitter) {
      this.twitter = res.twitter;
      this.socials.push({
        name: "twitter",
        link: res.twitter,
        icon: "/images/twitter.svg",
      });
    }
    if (res.website) {
      this.website = res.website;
      this.socials.push({
        name: "website",
        link: res.website,
        icon: "/images/website.svg",
      });
    }
    if (res.description) {
      this.description = res.description;
    }
    if (res.name) {
      this.projectName = res.name;
    }
    // await this.getLaunchedTokenProvider(res.provider);
    // await this.getLaunchedToken(Token.getToken({ address: res.launch_token }));
    // await this.getRaisedToken(Token.getToken({ address: res.raising_token }));
    if (res.logo_url) {
      this.logoUrl = res.logo_url;
      this.launchedToken?.setLogoURI(res.logo_url);
    }
    if (res.banner_url) {
      this.bannerUrl = res.banner_url;
    }
    if (res.beravote_space_id) {
      this.beravoteSpaceId = res.beravote_space_id;
    }

    localStorage.setItem(
      `projectInfo-${wallet.currentChainId}-${this.address}`,
      JSON.stringify({
        databaseId: res.id,
        socials: this.socials,
        logoUrl: this.logoUrl,
        bannerUrl: this.bannerUrl,
        beravoteSpaceId: this.beravoteSpaceId,
        projectName: this.projectName,
        description: this.description,
        telegram: this.telegram,
        twitter: this.twitter,
        website: this.website,
        provider: this.provider,
      })
    );
  }

  async init({
    raisedToken,
    launchedToken,
    depositedRaisedToken,
    depositedLaunchedToken,
    startTime,
    endTime,
    ftoState,
    force = false,
  }: {
    raisedToken?: Token;
    launchedToken?: Token;
    depositedRaisedToken?: string;
    depositedLaunchedToken?: string;
    startTime?: string;
    endTime?: string;
    ftoState?: number;
    force?: boolean;
  } = {}) {
    if (this.isInit && !force) {
      return;
    }

    await Promise.all([
      this.getRaisedToken(raisedToken),
      this.getLaunchedToken(launchedToken),
      this.getDepositedRaisedToken(),
      //depositedRaisedToken
      this.getDepositedLaunchedToken(depositedLaunchedToken),
      this.getEndTime(endTime),
      this.getLaunchedTokenProvider(),
      this.getCanClaimLP(),
      this.getRaisedTokenMinCap(),
      this.getUserParticipated(),
      this.getVaultBalance(),
      this.getIndexerData(),
      //this.getParticipantDetail(),
    ]).catch((error) => {
      console.error(error, `init-memepair-error-${this.address}`);
      trpcClient.projects.revalidateProjectType.mutate({
        chain_id: wallet.currentChainId,
        pair: this.address,
      });
      return;
    });

    await Promise.all([this.getProjectInfo(force), this.getCanRefund()]);

    this.isInit = true;
  }

  async getParticipantDetail() {
    if (!wallet.account) {
      return;
    }

    const res = await getParticipantDetail(wallet.account, this.address);

    if (res) {
      this.canClaimLP = !res.claimed && res.pot2Pump.raisedTokenReachingMinCap;
      this.canRefund =
        !res.refunded &&
        !res.pot2Pump.raisedTokenReachingMinCap &&
        res.pot2Pump.endTime > dayjs().unix();
    }
  }

  async getIndexerData(force?: boolean) {
    if (!force && this.indexerDataLoaded) {
      return;
    }
    const res = await subgraphPot2PumpToMemePair(this.address, wallet.account);
    if (res) {
      Object.assign(this, res);
      this.indexerDataLoaded = true;
    } else {
      console.error("getIndexerData", `getIndexerData-error-${this.address}`);
    }
  }

  async getRaisedTokenMinCap() {
    const res = await this.contract.read.raisedTokenMinCap();

    this.raisedTokenMinCap = new BigNumber(res.toString());
  }

  getIsValidated() {
    this.isValidated = wallet.currentChain?.validatedFtoAddresses.includes(
      this.address.toLowerCase()
    );
  }
  async getCanClaimLP() {
    try {
      if (
        !wallet.account ||
        // provider can't claim LP
        wallet.account.toLowerCase() === this.provider.toLowerCase()
      ) {
        return false;
      }

      const claimed = await this.contract.read.claimedLp([wallet.account] as [
        `0x${string}`,
      ]);

      const claimable = await this.contract.read.claimableLP([
        wallet.account,
      ] as [`0x${string}`]);

      this.canClaimLP = claimable > claimed;
    } catch (error) {
      // console.error(error);
      this.canClaimLP = false;
    }
  }

  async getRaisedToken(token?: Token) {
    if (token) {
      this.raiseToken = token;
      //this.raiseToken.init();
    } else {
      const res = (await this.contract.read.raisedToken()) as `0x${string}`;
      this.raiseToken = Token.getToken({ address: res });
      this.raiseToken.init();
    }
  }

  async getLaunchedToken(launchedToken?: Token) {
    if (launchedToken) {
      this.launchedToken = launchedToken;
      //this.launchedToken.init();
    } else {
      const res = (await this.contract.read.launchedToken()) as `0x${string}`;
      this.launchedToken = Token.getToken({ address: res });
      this.launchedToken.init();
    }
  }

  async getDepositedRaisedToken(amount?: string) {
    if (amount) {
      this.depositedRaisedTokenWithoutDecimals = new BigNumber(amount);
    } else {
      const res = (await this.contract.read.depositedRaisedToken()) as bigint;
      this.depositedRaisedTokenWithoutDecimals = new BigNumber(res.toString());
    }
  }

  async getDepositedLaunchedToken(amount?: string) {
    if (amount && Number(amount) !== 0) {
      this.depositedLaunchedTokenWithoutDecimals = new BigNumber(amount);
    } else {
      const res = (await this.contract.read.depositedLaunchedToken()) as bigint;
      this.depositedLaunchedTokenWithoutDecimals = new BigNumber(
        res.toString()
      );
    }
  }

  async getEndTime(endtime?: string) {
    if (endtime) {
      this.endTime = endtime;
    } else {
      const res = await this.contract.read.endTime();
      this.endTime = res.toString();
    }
  }

  getCanRefund() {
    if (
      !this.userParticipated ||
      !this.depositedRaisedToken ||
      !this.raisedTokenMinCap ||
      (this.state !== 1 && this.state !== 2)
    ) {
      this.canRefund = false;
      return;
    }

    if (!this.depositedRaisedToken.isZero()) {
      this.canRefund = true;
    }
  }

  async getUserParticipated() {
    if (!wallet.account) {
      return;
    }

    const res = await this.contract.read.raisedTokenDeposit([
      wallet.account,
    ] as [`0x${string}`]);

    // console.log("userParticipated", res);

    this.userParticipated = res > 0;
  }

  get state(): number {
    if (!this.raiseToken) {
      return -1;
    }
    if (
      !this.depositedRaisedToken ||
      !this.endTime ||
      !this.raisedTokenMinCap
    ) {
      return 3;
    }

    if (
      this.depositedRaisedToken.toNumber() >=
      this.raisedTokenMinCap
        .div(Math.pow(10, this.raiseToken.decimals))
        .toNumber()
    ) {
      return 0;
    } else if (dayjs.unix(Number(this.endTime)).isBefore(dayjs())) {
      return 1;
    } else {
      return 3;
    }
  }

  async getLaunchedTokenProvider(launchedTokenProvider?: string) {
    if (launchedTokenProvider) {
      this.launchedTokenProvider = launchedTokenProvider;
    } else {
      const res = await this.contract.read.tokenDeployer();
      this.launchedTokenProvider = res;
    }
  }

  get canClaimTokens() {
    return this.vaultBalance > BigInt(0);
  }

  async getVaultBalance() {
    const lpTokenAddress = await this.contract.read.lpToken();

    if (!lpTokenAddress || lpTokenAddress === zeroAddress) {
      return;
    }

    const aquaberaVaultContract = new ICHIVaultContract({
      address: lpTokenAddress,
    });

    const vaultBalance = await aquaberaVaultContract.contract.read.balanceOf([
      wallet.account as `0x${string}`,
    ]);

    this.vaultBalance = vaultBalance;
  }

  async claimVaultTokens() {
    //only work when state is success
    if (this.state !== 0) {
      return;
    }
    //get lp token, lp token is going to be aquabera vault address
    const lpTokenAddress = await this.contract.read.lpToken();

    const aquaberaVaultContract = new ICHIVaultContract({
      address: lpTokenAddress,
    });

    const vaultBalance = await aquaberaVaultContract.contract.read.balanceOf([
      wallet.account as `0x${string}`,
    ]);

    await new ContractWrite(aquaberaVaultContract.contract.write.withdraw, {
      action: "Claim Tokens",
      isSuccessEffect: true,
    }).call([this.vaultBalance, wallet.account as `0x${string}`]);

    this.getVaultBalance();
  }
}
