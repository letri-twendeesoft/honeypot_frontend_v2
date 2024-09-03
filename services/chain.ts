import { Token } from "./contract/token";
import { createPublicClientByChain } from "@/lib/client";
import { Chain } from "viem/chains";
import {
  berachainBartioTestnet,
  berachainTestnet,
  polygonMumbaiChain,
  //sepolia,
} from "@/lib/chain";
import { NativeFaucetContract } from "./contract/faucet-contract";

export class Network {
  get chainId() {
    return this.chain.id;
  }
  contracts!: {
    routerV2: string;
    factory: string;
    ftoFactory: string;
    ftoFacade: string;
    memeFactory: string;
    memeFacade: string;
    ftoTokens: Partial<Token>[];
  };
  nativeToken!: Token;
  faucetTokens: Token[] = [];
  nativeFaucet?: {
    address: string;
    name: string;
    requirements: string;
  };
  chain!: Chain;
  officialFaucets?: {
    url: string;
    name: string;
    logoURI?: string;
  }[];
  blacklist?: {
    poolBlacklist: string[];
  };
  validatedTokens: Token[] = [];
  validatedTokensInfo: Record<string, Token> = {};
  validatedFtoAddresses: string[] = [];
  constructor(
    args: Omit<
      Partial<Network>,
      "faucetTokens" | "nativeToken" | "validatedTokensInfo"
    > & {
      faucetTokens: Partial<Token>[];
      nativeToken: Partial<Token>;
      validatedTokensInfo: Record<string, Partial<Token>>;
    }
  ) {
    Object.assign(this, args);
    if (args) {
    }
  }
  init() {
    this.nativeToken = Token.getToken(this.nativeToken);
    this.nativeToken.init();
    this.faucetTokens = this.faucetTokens.map((t) => {
      const token = Token.getToken(t);
      token.init();
      return token;
    });
    Object.entries(this.validatedTokensInfo).forEach(([address, t]) => {
      const token = Token.getToken({
        ...t,
        address,
      });
      token.init();
      this.validatedTokensInfo[address] = token;
      this.validatedTokens.push(token);
    });
  }
}

export const berachainBartioTestnetNetwork = new Network({
  chain: berachainBartioTestnet,
  officialFaucets: [
    {
      url: "https://bartio.faucet.berachain.com",
      name: "Official Faucet",
      logoURI:
        "https://res.cloudinary.com/duv0g402y/raw/upload/src/assets/bera.png",
    },
  ],
  nativeToken: {
    address: "0x7507c1dc16935b82698e4c63f2746a2fcf994df8",
    name: "Bera",
    symbol: "BERA",
    decimals: 18,
    isNative: true,
    logoURI: "/images/icons/tokens/wbera-token-icon.png",
  },
  nativeFaucet: {
    address: "0x1bd43f7f55b700236c92256a0fd90266363119f7",
    name: "Daily Faucet",
    requirements: "You can claim 100 BERA tokens every 24 hours.",
  },
  contracts: {
    routerV2: "0x482270069fF98a0dF528955B651494759b3B2F8C",
    factory: "0x0CEFeEc4e53DD019B27AbAc2f86E858ef8353208",
    ftoFactory: "0x7E0CCe2C9Ff537f8301dd40c652A03479B18dAef",
    ftoFacade: "0x0264D933F13eE993270591668CfF87b8D35Dd3b4",
    memeFactory: "0x552dD2050f601Ce300999FEBD4AA11318a62aC7D",
    memeFacade: "0x12722616D36288C6C1B8f2e3fc707350cd250660",
    ftoTokens: [
      {
        address: "0xfc5e3743E9FAC8BB60408797607352E24Db7d65E".toLowerCase(),
        name: "T-HPOT",
        symbol: "T-HPOT",
        decimals: 18,
      },
      {
        address: "0x05D0dD5135E3eF3aDE32a9eF9Cb06e8D37A6795D".toLowerCase(),
        name: "USDT",
        symbol: "USDT",
        decimals: 18,
      },
      {
        address: "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8".toLowerCase(),
        name: "Wrapped Bera",
        symbol: "WBERA",
        decimals: 18,
        logoURI: "/images/icons/wbera-token-icon.png",
      },
      {
        address: "0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03".toLowerCase(),
        name: "Honey",
        symbol: "HONEY",
        decimals: 18,
      },
      {
        address: "0x2C2fc71339aCdD913734a4CAe9dD95D9d2b1438d".toLowerCase(),
        name: "Bera the Pooh",
        symbol: "BERA THE POOH",
        decimals: 18,
      },
    ],
  },
  faucetTokens: [
    {
      address: "0xfc5e3743E9FAC8BB60408797607352E24Db7d65E".toLowerCase(),
      name: "T-HPOT",
      symbol: "tHPOT",
      decimals: 18,
    },
    {
      address: "0x2C2fc71339aCdD913734a4CAe9dD95D9d2b1438d".toLowerCase(),
      name: "Bera the Pooh",
      symbol: "BTP",
      decimals: 18,
    },
  ],
  blacklist: {
    poolBlacklist: ["0xfF95cdfC724Ca85b8d96D5a6Ea86333AC6a4799D".toLowerCase()],
  },
  validatedTokensInfo: {
    //when adding a new token, make sure to add the address as lowercase
    "0x7507c1dc16935b82698e4c63f2746a2fcf994df8": {
      name: "Wrapped Bera",
      symbol: "WBERA",
      decimals: 18,
      logoURI: "/images/icons/tokens/wbera-token-icon.png",
      isRouterToken: true,
    },
    "0x2c2fc71339acdd913734a4cae9dd95d9d2b1438d": {
      name: "Bera the Pooh",
      symbol: "BTP",
      decimals: 18,
      logoURI: "/images/icons/tokens/bera-the-pooh-token-icon.png",
      isRouterToken: true,
    },
    "0x0e4aaf1351de4c0264c5c7056ef3777b41bd8e03": {
      name: "Honey",
      symbol: "HONEY",
      decimals: 18,
      logoURI: "/images/icons/tokens/honey-token-icon.png",
      isRouterToken: true,
    },
    "0xfc5e3743e9fac8bb60408797607352e24db7d65e": {
      name: "T-HPOT",
      symbol: "tHPOT",
      decimals: 18,
      logoURI: "/images/icons/tokens/thpot-token-icon.jpg",
      isRouterToken: true,
    },
    "0x05d0dd5135e3ef3ade32a9ef9cb06e8d37a6795d": {
      name: "USDT",
      symbol: "USDT",
      decimals: 18,
      logoURI: "/images/icons/tokens/usdt-token-icon.png",
      isRouterToken: true,
    },
    "0xd6d83af58a19cd14ef3cf6fe848c9a4d21e5727c": {
      name: "USDC",
      symbol: "USDC",
      decimals: 18,
      logoURI: "/images/icons/tokens/usdc-token-icon.png",
      isRouterToken: true,
    },
    "0x2577d24a26f8fa19c1058a8b0106e2c7303454a4": {
      name: "WBTC",
      symbol: "WBTC",
      decimals: 18,
      logoURI: "/images/icons/tokens/wbtc-token-icon.png",
      isRouterToken: true,
    },
    "0xe28afd8c634946833e89ee3f122c06d7c537e8a8": {
      name: "WETH",
      symbol: "WETH",
      decimals: 18,
      logoURI: "/images/icons/tokens/weth-token-icon.png",
      isRouterToken: true,
    },
    "0x806ef538b228844c73e8e692adcfa8eb2fcf729c": {
      name: "DAI",
      symbol: "DAI",
      decimals: 18,
      logoURI: "/images/icons/tokens/dai-token-icon.png",
    },
    "0x343499e6315f7d3473a12aaf660ac02b5739c382": {
      name: "Grand Conquest Gold",
      symbol: "GCG",
      decimals: 18,
      logoURI: "/images/icons/tokens/grandconquest-token-icon.png",
    },
    "0x8887be5219f485d6948499b060aef973c51f66dd": {
      name: "test Arebmeme",
      symbol: "AREB",
      decimals: 18,
      logoURI: "/images/icons/tokens/areb-token-icon.png",
      supportingFeeOnTransferTokens: false,
    },
    "0xa0525273423537bc76825b4389f3baec1968f83f": {
      name: "JNKY",
      symbol: "JNKY",
      decimals: 18,
      logoURI: "/images/icons/tokens/jnky-token-icon.jpg",
    },
    "0x1740f679325ef3686b2f574e392007a92e4bed41": {
      name: "YEET",
      symbol: "YEET",
      decimals: 18,
      logoURI: "/images/icons/tokens/yeet-token-icon.jpg",
    },
    "0x277aadbd9ea3db8fe9ea40ea6e09f6203724bdae": {
      name: "DIRAC",
      symbol: "DIRAC",
      decimals: 18,
      logoURI: "/images/icons/tokens/dirac-token-icon.svg",
    },
    "0xf5afcf50006944d17226978e594d4d25f4f92b40": {
      name: "NECT",
      symbol: "NECT",
      decimals: 18,
      logoURI: "/images/icons/tokens/nect-token-icon.png",
    },
    "0x7629668774f918c00eb4b03adf5c4e2e53d45f0b": {
      name: "oBERO",
      symbol: "oBERO",
      decimals: 18,
      logoURI: "/images/icons/tokens/obero-token-icon.jpg",
    },
  },
  validatedFtoAddresses: [
    "0xe1650d95ab180eb4383093d78c6f0cc164bd55e2".toLowerCase(),
    "0x458cd7e366480d3e152510cfbe82609f5562bbc2".toLowerCase(),
    "0xa32f78ace7dad80e4b5d18bd8ab9d76aebaa69bd".toLowerCase(),
    "0x86905d4054f307fce742a8eb7d5d6012711a3588".toLowerCase(),
  ],
});

export const networks = [
  berachainBartioTestnetNetwork,
  //sepoliaNetwork,
];
export const networksMap = networks.reduce((acc, network) => {
  acc[network.chainId] = network;
  return acc;
}, {} as Record<number | string, Network>);
