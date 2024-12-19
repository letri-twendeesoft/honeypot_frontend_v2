import { gql } from "@apollo/client";

export const TOKEN_FRAGMENT = gql`
  fragment TokenFields on Token {
    id
    symbol
    name
    decimals
    derivedMatic
  }
`;

export const SINGLE_TOKEN = gql`
  query SingleToken($tokenId: ID!) {
    token(id: $tokenId) {
      ...TokenFields
    }
  }
`;

export const TOKEN_TOP_10_HOLDERS = gql`
  query TokenTop10Holders($tokenId: ID!) {
    token(id: $tokenId) {
      id
      symbol
      holders(first: 10, orderBy: holdingValue, orderDirection: desc) {
        id
        holdingValue
        account {
          id
        }
      }
    }
  }
`;

export const ALL_TOKENS = gql`
  query AllTokens {
    tokens {
      ...TokenFields
    }
  }
`;
