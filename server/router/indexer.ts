import { TokenPriceDataFeed } from "@/services/priceFeed/tokenPriceDataFeed";
import { publicProcedure, router } from "../trpc";
import z from "zod";
import { DefinedPriceFeed } from "@/services/priceFeed/PriceFeedProviders/PriceFeedProviders";
import {
  ChartDataResponse,
  TokenCurrentPriceResponseType,
} from "@/services/priceFeed/priceFeedTypes";
import GhostIndexer from "@/services/indexer/indexerProviders/ghost";
import Indexer from "@/services/indexer/indexer";
import { statusTextToNumber, type PairFilter } from "@/services/launchpad";
import { filter } from "lodash";

const ghostIndexer = new GhostIndexer(
  process.env.GHOST_INDEXER_API_KEY ?? "",
  "https://api.ghostlogs.xyz/gg/pub/3b919a7d-94f2-492f-9ce6-e226b9ecdc45/ghostgraph"
);

const indexer = new Indexer(ghostIndexer);
export const indexerFeedRouter = router({
  indexerQuery: publicProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input }): Promise<any> => {
      console.log(input.query);
      const res = await indexer.callIndexerApi(input.query);

      console.log(res);

      if (res.status === "error") {
        return {
          status: "error",
          message: res.message,
        };
      } else {
        return {
          status: "success",
          data: res.data,
          message: "Success",
        };
      }
    }),
  getFilteredFtoPairs: publicProcedure
    .input(
      z.object({
        filter: z.object({
          status: z.string().optional(),
          search: z.string().optional(),
        }),
      })
    )
    .output(
      z.object({
        status: z.literal("success"),
        data: z.array(z.string()),
        message: z.string(),
      })
    )
    .query(async ({ input }): Promise<any> => {
      console.log(input);
      const res = await indexer.getFilteredFtoPairs(input.filter as PairFilter);

      if (res.status === "error") {
        return {
          status: "error",
          message: res.message,
        };
      } else {
        return {
          status: "success",
          data: res.data,
          message: "Success",
        };
      }
    }),
});
