import dayjs from "dayjs";
import { wallet } from "./wallet";
import BigNumber from "bignumber.js";
import { FtoPairContract } from "./contract/ftopair-contract";
import {
  AsyncState,
  IndexerPaginationState,
  PageInfo,
  PaginationState,
  ValueState,
} from "./utils";
import { trpc, trpcClient } from "@/lib/trpc";
import { createSiweMessage } from "@/lib/siwe";
import { Address } from "viem";
import { Token } from "./contract/token";
import { getTransactionReceipt, reset } from "viem/actions";
import { debounce, initial } from "lodash";
import { parseEventLogs } from "viem";
import { ERC20ABI } from "@/lib/abis/erc20";
import { MemePairContract } from "./contract/memepair-contract";

const PAGE_LIMIT = 9;

type launchpadType = "fto" | "meme";

export type PairFilter = {
  search: string;
  status: "all" | "processing" | "success" | "fail";
  showNotValidatedPairs: boolean;
  limit: number;
};

export const statusTextToNumber = (status: string) => {
  switch (status) {
    case "processing":
      return 3;
    case "success":
      return 0;
    case "fail":
      return 1;
    default:
      return -1;
  }
};

function calculateTimeDifference(timestamp: number): string {
  if (timestamp.toString().length !== 13) {
    return "Invaild";
  }
  const now = dayjs();
  const targetTime = dayjs(timestamp);

  const diffDays = now.diff(targetTime, "days");

  if (Math.abs(diffDays) >= 1) {
    return `${diffDays} ${diffDays > 0 ? "days later" : "days ago"}`;
  }

  const diffHours = now.diff(targetTime, "hours");

  if (Math.abs(diffHours) >= 1) {
    return `${diffHours} ${diffHours > 0 ? "hours later" : "hours ago"}`;
  }

  const diffMinutes = now.diff(targetTime, "minutes");
  return `${diffMinutes} ${diffMinutes > 0 ? "minutes later" : "minutes ago"}`;
}

class LaunchPad {
  currentLaunchpadType: launchpadType = "fto";
  ftoPageInfo = new IndexerPaginationState<PairFilter, FtoPairContract>({
    filter: {
      search: "",
      status: "all",
      showNotValidatedPairs: true,
      limit: PAGE_LIMIT,
    },
    LoadNextPageFunction: async (filter) => {
      if (!filter.showNotValidatedPairs) {
        return {
          items: await this.loadVerifiedFTOProjects(),
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: "",
            endCursor: "",
          },
        };
      } else {
        return (await this.LoadMoreFtoPage()) as {
          items: FtoPairContract[];
          pageInfo: PageInfo;
        };
      }
    },
  });

  memePageInfo = new IndexerPaginationState<PairFilter, MemePairContract>({
    filter: {
      search: "",
      status: "all",
      showNotValidatedPairs: true,
      limit: PAGE_LIMIT,
    },
    LoadNextPageFunction: async (filter) => {
      return (await this.LoadMoreFtoPage("meme")) as {
        items: MemePairContract[];
        pageInfo: PageInfo;
      };
    },
  });

  set pairFilterSearch(search: string) {
    this.ftoPageInfo.updateFilter({ search });
  }

  set pairFilterStatus(status: "all" | "processing" | "success" | "fail") {
    this.ftoPageInfo.updateFilter({ status });
  }

  set showNotValidatedPairs(show: boolean) {
    this.ftoPageInfo.updateFilter({ showNotValidatedPairs: show });
  }

  get memeFactoryContract() {
    return wallet.contracts.memeFactory;
  }

  get memefacadeContract() {
    return wallet.contracts.memeFacade;
  }

  get ftofactoryContract() {
    return wallet.contracts.ftofactory;
  }

  get ftofacadeContract() {
    return wallet.contracts.ftofacade;
  }

  allPairsLength = async () =>
    await this.ftofactoryContract.allPairsLength.call();

  getPairAddress = async (index: bigint) =>
    await this.ftofactoryContract.allPairs.call([index]);

  async mostSuccessfulFtos(): Promise<FtoPairContract[]> {
    const mostSuccessfulFtos =
      await trpcClient.indexerFeedRouter.getMostSuccessfulFtos.query({
        chainId: String(wallet.currentChainId),
        limit: 5,
      });

    if (mostSuccessfulFtos.status === "success") {
      return mostSuccessfulFtos.data.pairs.map((pairAddress) => {
        const pair = new FtoPairContract({
          address: pairAddress.id,
        });

        const raisedToken = this.isFtoRaiseToken(pairAddress.token1.id)
          ? Token.getToken({
              ...pairAddress.token1,
              address: pairAddress.token1.id,
            })
          : Token.getToken({
              address: pairAddress.token0.id,
            });

        const launchedToken =
          raisedToken.address.toLowerCase() ===
          pairAddress.token1.id.toLowerCase()
            ? Token.getToken({
                ...pairAddress.token0,
                address: pairAddress.token0.id,
              })
            : Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
              });

        if (!pair.isInit) {
          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.depositedRaisedToken,
            startTime: pairAddress.createdAt,
            endTime: pairAddress.endTime,
            ftoState: Number(pairAddress.status),
          });
        }

        return pair;
      });
    } else {
      return [];
    }
  }

  async trendingMEMEs(): Promise<MemePairContract[]> {
    const mostSuccessfulFtos =
      await trpcClient.indexerFeedRouter.getTrendingMEMEPairs.query();

    if (mostSuccessfulFtos.status === "success") {
      return mostSuccessfulFtos.data.pairs.items.map((pairAddress) => {
        const pair = new MemePairContract({
          address: pairAddress.id,
        });

        const raisedToken = this.isFtoRaiseToken(pairAddress.token1.id)
          ? Token.getToken({
              ...pairAddress.token1,
              address: pairAddress.token1.id,
            })
          : Token.getToken({
              address: pairAddress.token0.id,
            });

        const launchedToken =
          raisedToken.address.toLowerCase() ===
          pairAddress.token1.id.toLowerCase()
            ? Token.getToken({
                ...pairAddress.token0,
                address: pairAddress.token0.id,
              })
            : Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
              });

        if (!pair.isInit) {
          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.depositedRaisedToken,
            endTime: pairAddress.endTime,
            ftoState: Number(pairAddress.status),
          });
        }

        return pair;
      });
    } else {
      return [];
    }
  }

  loadVerifiedFTOProjects = async () => {
    this.setFtoPageLoading(true);
    const projects = await Promise.all(
      wallet.currentChain.validatedFtoAddresses.map(async (pairAddress) => {
        const pair = new FtoPairContract({
          address: pairAddress,
        });
        await pair.init();
        return pair;
      })
    );

    this.setFtoPageLoading(false);
    return projects;
  };

  getMyFtoParticipatedPairs = new AsyncState(async () => {
    if (!this.myFtoParticipatedPairs.value) {
      await this.myFtoParticipatedPairs.call();
    } else {
      this.myFtoParticipatedPairs.value.data.forEach(async (pair) => {
        if (!pair.isInit) await pair.init();
      });
    }

    return this.myFtoParticipatedPairs.value?.data ?? [];
  });

  LoadMoreFtoPage = async (projectType: "fto" | "meme" = "fto") => {
    const res = await trpcClient.indexerFeedRouter.getFilteredFtoPairs.query({
      filter: this.ftoPageInfo.filter,
      chainId: String(wallet.currentChainId),
      pageRequest: {
        direction: "next",
        cursor: this.ftoPageInfo.pageInfo.endCursor,
      },
      projectType: projectType,
    });

    if (res.status === "success") {
      const data = {
        items: res.data.pairs.map((pairAddress) => {
          const pair =
            projectType === "fto"
              ? new FtoPairContract({
                  address: pairAddress.id,
                })
              : new MemePairContract({
                  address: pairAddress.id,
                });

          const raisedToken = this.isFtoRaiseToken(pairAddress.token1.id)
            ? Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
              })
            : Token.getToken({
                address: pairAddress.token0.id,
              });

          const launchedToken =
            raisedToken.address.toLowerCase() ===
            pairAddress.token1.id.toLowerCase()
              ? Token.getToken({
                  ...pairAddress.token0,
                  address: pairAddress.token0.id,
                })
              : Token.getToken({
                  ...pairAddress.token1,
                  address: pairAddress.token1.id,
                });

          pair.init({
            raisedToken: raisedToken,
            launchedToken: launchedToken,
            depositedLaunchedToken: pairAddress.depositedLaunchedToken,
            depositedRaisedToken: pairAddress.depositedRaisedToken,
            startTime: pairAddress.createdAt,
            endTime: pairAddress.endTime,
            ftoState: Number(pairAddress.status),
          });

          return pair;
        }),
        pageInfo: res.data.pageInfo,
      };
      return data;
    } else {
      return {
        items: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: "",
          endCursor: "",
        },
      };
    }
  };

  myFtoParticipatedPairs = new AsyncState(async () => {
    let projects;
    if ((this.currentLaunchpadType = "fto")) {
      projects = await this.ftofactoryContract.events(
        wallet.account as Address
      );
    } else {
      projects = await this.memeFactoryContract.events(
        wallet.account as Address
      );
    }

    let data = await Promise.all(
      projects.map(async (pairAddress) => {
        const pair = new FtoPairContract({ address: pairAddress as string });
        if (!pair.isInit) {
          await pair.init();
          pair.raiseToken?.init();
          pair.launchedToken?.init();
        }
        return pair;
      })
    );

    data.sort((a, b) => {
      return Number(b.startTime) - Number(a.startTime);
    });

    this.myFtoParticipatedPairsPagination.setTotal(data.length);

    return {
      data,
      total: data.length,
    };
  });

  myPairs = new AsyncState(async () => {
    const ftoAddresses =
      await trpcClient.indexerFeedRouter.getFilteredFtoPairs.query({
        filter: this.ftoPageInfo.filter,
        chainId: String(wallet.currentChainId),
        provider: wallet.account,
        projectType: this.currentLaunchpadType,
      });

    console.log(ftoAddresses);

    if (!ftoAddresses || ftoAddresses.status === "error") {
      return { data: [], total: 0 };
    }

    const data: Array<FtoPairContract> = (
      await Promise.all(
        ftoAddresses.data.pairs.map(async (pairAddress, idx) => {
          const pair = new FtoPairContract({
            address: pairAddress.id,
          });

          const raisedToken = this.isFtoRaiseToken(pairAddress.token1.id)
            ? Token.getToken({
                ...pairAddress.token1,
                address: pairAddress.token1.id,
              })
            : Token.getToken({
                address: pairAddress.token0.id,
              });

          const launchedToken =
            raisedToken.address.toLowerCase() ===
            pairAddress.token1.id.toLowerCase()
              ? Token.getToken({
                  ...pairAddress.token0,
                  address: pairAddress.token0.id,
                })
              : Token.getToken({
                  ...pairAddress.token1,
                  address: pairAddress.token1.id,
                });

          if (!pair.isInit) {
            pair.init({
              raisedToken: raisedToken,
              launchedToken: launchedToken,
              depositedLaunchedToken: pairAddress.depositedLaunchedToken,
              depositedRaisedToken: pairAddress.depositedRaisedToken,
              startTime: pairAddress.createdAt,
              endTime: pairAddress.endTime,
              ftoState: Number(pairAddress.status),
            });
          }
          return pair;
        })
      )
    ).filter((pair) => pair !== undefined) as FtoPairContract[];

    return {
      data,
      total: 999,
    };
  });

  ftoPairsPagination = new PaginationState({
    limit: PAGE_LIMIT,
  });

  myFtoParticipatedPairsPagination = new PaginationState({
    limit: PAGE_LIMIT,
  });

  createLaunchProject = async ({
    launchType,
    provider,
    raisedToken,
    tokenName,
    tokenSymbol,
    tokenAmount,
    poolHandler,
    raisingCycle,
  }: {
    launchType: "fto" | "meme";
    provider: string;
    raisedToken: string;
    tokenName: string;
    tokenSymbol: string;
    tokenAmount: number;
    poolHandler: string;
    raisingCycle: number;
  }) => {
    const targetLaunchContractFunc = async () => {
      if (launchType === "fto") {
        return this.ftofactoryContract.createFTO.call([
          provider as `0x${string}`,
          raisedToken as `0x${string}`,
          tokenName,
          tokenSymbol,
          BigInt(new BigNumber(tokenAmount).multipliedBy(1e18).toFixed()),
          poolHandler as `0x${string}`,
          BigInt(raisingCycle),
        ]);
      } else {
        return this.memeFactoryContract.createPair.call([
          {
            raisedToken: raisedToken as `0x${string}`,
            name: tokenName,
            symbol: tokenSymbol,
            swapHandler: poolHandler as `0x${string}`,
            launchCycle: BigInt(86400),
          },
        ]);
      }
    };

    const res = await targetLaunchContractFunc();

    const logs = parseEventLogs({
      logs: res.logs,
      abi: ERC20ABI,
    });

    const getPairAddress = () => {
      if (launchType === "fto") {
        return res.logs[res.logs.length - 1]?.address as string;
      } else {
        return (logs[0].args as any).to;
      }
    };

    const pairAddress = getPairAddress();

    await trpcClient.projects.createProject.mutate({
      pair: pairAddress,
      chain_id: wallet.currentChainId,
      provider: provider,
      project_type: launchType,
      projectName: tokenName,
    });

    return pairAddress;
  };

  updateFtoProject = new AsyncState(
    async (data: {
      pair: string;
      chain_id: number;
      twitter: string;
      telegram: string;
      website: string;
      description: string;
      projectName: string;
    }) => {
      await createSiweMessage(
        wallet.account,
        "Sign In With Honeypot",
        wallet.walletClient
      );
      await trpcClient.projects.createOrUpdateProjectInfo.mutate(data);
    }
  );

  updateProjectLogo = new AsyncState(
    async (data: { logo_url: string; pair: string; chain_id: number }) => {
      await createSiweMessage(
        wallet.account,
        "Sign In With Honeypot",
        wallet.walletClient
      );

      await trpcClient.projects.updateProjectLogo.mutate(data);
    }
  );

  isFtoRaiseToken(tokenAddress: string): boolean {
    return wallet.currentChain.contracts.ftoTokens.some(
      (ftoToken) =>
        ftoToken.address?.toLowerCase() === tokenAddress.toLowerCase()
    );
  }

  setCurrentPageInfo = (pageInfo: PageInfo) => {
    this.ftoPageInfo.pageInfo = pageInfo;
  };

  setFtoPageIsInit = (isInit: boolean) => {
    this.ftoPageInfo.isInit = isInit;
  };

  setFtoPageLoading = (isLoading: boolean) => {
    this.ftoPageInfo.isLoading = isLoading;
  };

  setCurrentLaunchpadType = (type: launchpadType) => {
    this.currentLaunchpadType = type;
  };
}

const launchpad = new LaunchPad();

export default launchpad;
