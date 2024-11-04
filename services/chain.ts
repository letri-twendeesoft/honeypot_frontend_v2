import { Token } from "./contract/token";
import { createPublicClientByChain } from "@/lib/client";
import { Chain } from "viem/chains";
import {
  berachainBartioTestnet,
  berachainTestnet,
  polygonMumbaiChain,
  //sepolia,
} from "@/lib/chain";
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
    //algebra intergration
    algebraPoolDeployer: string;
    algebraFactory: string;
    algebraCommunityVault: string;
    algebraVaultFactoryStub: string;
    pluginFactory: string;
    entryPoint: string;
    tickLens: string;
    quoter: string;
    quoterV2: string;
    swapRouter: string;
    nonfungibleTokenPositionDescriptor: string;
    proxy: string;
    nonfungiblePositionManager: string;
    algebraInterfaceMulticall: string;
    algebraEternalFarming: string;
    farmingCenter: string;
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
  validatedMemeAddresses: string[] = [];
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
    this.nativeToken.init().then(() => {
      console.log("this.nativeToken", this.nativeToken.name);
    });
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
    routerV2: "0x8aBc3a7bAC442Ae449B07fd0C2152364C230DA9A",
    factory: "0x7A962f6E45100b8cC560C7d2c248ec704623fb53",
    ftoFactory: "0x7E0CCe2C9Ff537f8301dd40c652A03479B18dAef",
    ftoFacade: "0x0264D933F13eE993270591668CfF87b8D35Dd3b4",
    memeFactory: "0xc906E2bA6AA4F6Dd8340487DD8CDeBcA65e56A8D",
    memeFacade: "0x1D97520d3a483457bA6b2423F6eF3dbfd9bcCe0A",
    //algebra intergration
    algebraPoolDeployer: "0x805488DaA81c1b9e7C5cE3f1DCeA28F21448EC6A",
    algebraFactory: "0xab49321DF952315E208a2B7046A00d2015E39cba",
    algebraCommunityVault: "0x59a662Ed724F19AD019307126CbEBdcF4b57d6B1",
    algebraVaultFactoryStub: "0x95E325A85B9E6cB4DeA2ccd96218e5F8365E0B0F",
    pluginFactory: "0x13fcE0acbe6Fb11641ab753212550574CaD31415",
    entryPoint: "0xa77aD9f635a3FB3bCCC5E6d1A87cB269746Aba17",
    tickLens: "0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C",
    quoter: "0x6AD6A4f233F1E33613e996CCc17409B93fF8bf5f",
    quoterV2: "0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F",
    swapRouter: "0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1",
    nonfungibleTokenPositionDescriptor:
      "0x658E287E9C820484f5808f687dC4863B552de37D",
    proxy: "0x49BE8AA6c684b15e0C5450e8Fa0b16Bec1435596",
    nonfungiblePositionManager: "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990",
    algebraInterfaceMulticall: "0x28DeD2af752655Df5Ee92450DC259F92a5ABe449",
    algebraEternalFarming: "0x38A5C36FA8c8c9E4649b51FCD61810B14e7ce047",
    farmingCenter: "0x83D4a9Ea77a4dbA073cD90b30410Ac9F95F93E7C",

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
      isPopular: true,
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
      isPopular: true,
    },
    "0xfc5e3743e9fac8bb60408797607352e24db7d65e": {
      name: "T-HPOT",
      symbol: "tHPOT",
      decimals: 18,
      logoURI: "/images/icons/tokens/thpot-token-icon.jpg",
      isRouterToken: true,
      isPopular: true,
    },
    "0x05d0dd5135e3ef3ade32a9ef9cb06e8d37a6795d": {
      name: "USDT",
      symbol: "USDT",
      decimals: 6,
      logoURI: "/images/icons/tokens/usdt-token-icon.png",
      isRouterToken: true,
    },
    "0xd6d83af58a19cd14ef3cf6fe848c9a4d21e5727c": {
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
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
      isPopular: true,
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
    "0x46efc86f0d7455f135cc9df501673739d513e982": {
      name: "iBGT",
      symbol: "iBGT",
      decimals: 18,
      logoURI: "/images/icons/tokens/ibgt-token-icon.png",
    },
    "0x86056cdb2bf09c540b63f5a0bc054c840cb0de6c": {
      name: "LORE",
      symbol: "LORE",
      decimals: 18,
      logoURI: "/images/icons/tokens/lore-token-icon.jpg",
      isPopular: true,
    },
    "0xfad73c80d67d3cb4a929d1c0faf33a820620ae41": {
      name: "POT The Bera",
      symbol: "POT",
      decimals: 18,
      logoURI: "/images/icons/tokens/pot-the-bera-token-icon.webp",
    },
    "0x180f30908b7c92ff2d65609088ad17bf923b42dc": {
      name: "Janitooor",
      symbol: "JANI",
      decimals: 18,
      logoURI: "/images/icons/tokens/janitooor-token-icon.webp",
    },
    "0x5da73142f3c8d8d749db4459b2fcc9024fad024e": {
      name: "Whippor",
      symbol: "$BULL",
      decimals: 18,
      logoURI: "/images/icons/tokens/whippor-token-icon.webp",
    },
    "0x2da7ec28dae827ea513da752bc161e55147b4d66": {
      name: "B-Vol",
      symbol: "IVX",
      decimals: 18,
      logoURI: "/images/icons/tokens/ivx-token-icon.webp",
    },
    "0xb5a27c33ba2adecee8cdbe94cef5576e2f364a8f": {
      name: "BERO",
      symbol: "BERO",
      decimals: 18,
      logoURI: "/images/icons/tokens/bero-token-icon.webp",
    },
    "0x16221CaD160b441db008eF6DA2d3d89a32A05859": {
      name: "uniBTC",
      symbol: "uniBTC",
      decimals: 8,
      logoURI: "/images/icons/tokens/unibtc-token-icon.png",
    },
    //memewar 2
    "0x8b045d02c581284295be33d4f261f8e1e6f78f18": {
      name: "Bera Neiro",
      symbol: "BERA NEIRO",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Neiro.png",
    },
    "0xff4abcd6d4cea557e4267bc81f1d2064615cb49e": {
      name: "Bera Pepe",
      symbol: "BERA PEPE",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Pepe.png",
    },
    "0x3F7AAE503000A08A8d4A9AFefa738b565f3A6CD6": {
      name: "Bera Mog",
      symbol: "BERA MOG",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Mog.png",
    },
    "0xEF348b9FD378c91b00874d611b22062d7ee60284": {
      name: "Bera Dog Wif Hat",
      symbol: "BERA DOG WIF HAT",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Dog_Wif_Hat.png",
    },
    "0x51A42ceAFDA32F68390840A187b65a99584332df": {
      name: "Bera Popcat",
      symbol: "BERA POPCAT",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Popcat.png",
    },
    "0x96dc300D5406E42051575B8b49d3057F1Ef678FC": {
      name: "Bera Giga Chad",
      symbol: "BERA GIGA CHAD",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Giga_Chad.png",
    },
    "0x0874955158639A594fd65641E16C7de91F3dF465": {
      name: "Bera Goat",
      symbol: "BERA GOAT",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Goat.png",
    },
    "0x96d62fbd15608ef087219f20986735a1d65a22a4": {
      name: "Bera Moo Deng",
      symbol: "BERA Moo Deng",
      decimals: 18,
      logoURI: "/images/memewar2/BERA_MOODENG.png",
    },
    "0xFa9FB9d84525e4fE6c7DEaE137e3f1C81F86FdF8": {
      name: "Bera Retadrio",
      symbol: "BERA RETADRIO",
      decimals: 18,
      logoURI: "/images/memewar2/Bera_Retadrio.png",
    },
    "0x5a42fefa75b0adebd63d3078c2f1e3e9a6c39177": {
      name: "Bera Apu",
      symbol: "BERA APU",
      decimals: 18,
      logoURI: "/images/memewar2/BERA_APU.png",
    },
  },
  validatedFtoAddresses: [
    "0x2c504e661750e03aa9252c67e771dc059a521863".toLowerCase(),
    "0x93f8beabd145a61067ef2fca38c4c9c31d47ab7e".toLowerCase(),
  ],
  validatedMemeAddresses: [],
});

export const networks = [
  berachainBartioTestnetNetwork,
  //sepoliaNetwork,
];
export const networksMap = networks.reduce(
  (acc, network) => {
    acc[network.chainId] = network;
    return acc;
  },
  {} as Record<number | string, Network>
);
