// 1.Create and Branding
export type CreateAndBrandingForm = {
  ecosystem: string;
  targetNetwork: string;
  projectToken: string;
  projectTokenLogo: string;
  saleBanner: string;
};

// 2.Sales Structure
export enum PRICE_TYPE {
  LBP = "lbp",
  FIXED = "fixed",
}

export enum LBP_TYPE {
  BUY_SELL = "buy-sell",
  SELL_ONLY = "sell-only",
}
export type SalesStructureForm = {
  priceType: PRICE_TYPE;
  lbpType?: LBP_TYPE;
  startTime: Date;
  endTime: Date;
  tokenClaimDelayHours?: number;
  tokenClaimDelayMinutes?: number;
  tokenClaimDelay: Date;
};

// 3.Tokenomics & Preview
export type TokenomicsAndPreviewForm = {
  projectTokenQuantity: number;
  assetTokenType: string;
  assetTokenQuantity: number;
  customTotalSupplyType: boolean;
  customTotalSupply?: number;
  startWeight: number;
  endWeight: number;
};

// 4.Token Vesting
export type TokenVestingForm = {
  isTokenVestingEnabled: boolean;
  isVestingCliffTimeEnabled: boolean;
  vestingEndTime: Date;
};

// 5.Project Info
export enum PROJECT_CATEGORY_TYPE {
  GAMING = "gaming",
  CRYPTO = "crypto",
  FINANCE = "finance",
}

export type InvestmentRound = {
  raiseAmount: number;
  valuationOfRound: number;
  tgePercentage: number;
  supplySoldRound: number;
  vestingLengthTime: number;
};

export type ProjectInfoForm = {
  category: PROJECT_CATEGORY_TYPE;
  lbpDescription: string;
  projectLink: string;
  blockedCountry: string[];
  investmentRound: InvestmentRound[];
};
