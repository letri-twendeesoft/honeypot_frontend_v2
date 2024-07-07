"use client";
import { Button } from "@nextui-org/react";
import EChartsReact from "echarts-for-react";
import { useEffect, useMemo, useState } from "react";
import { Token } from "@/services/contract/token";
import { networksMap } from "@/services/chain";
import { useAccount } from "wagmi";
import { trpcClient } from "@/lib/trpc";
import { dayjs } from "@/lib/dayjs";
import { ChartDataResponse } from "@/services/priceFeed/priceFeedTypes";
import dynamic from "next/dynamic";
import Script from "next/script";
import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "@/public/static/charting_library/charting_library";
const TVChartContainer = dynamic(
  () =>
    import("@/components/AdvancedChart/TVChartContainer/TVChartContainer").then(
      (mod) => mod.TVChartContainer
    ),
  { ssr: false }
);

const upColor = "#ec0000";
const upBorderColor = "#8A0000";
const downColor = "#00da3c";
const downBorderColor = "#008F28";
const viewRanges = Object.values({
  "1095d": {
    name: "3 years",
    value: 1095,
  },
  "365d": {
    name: "1 year",
    value: 365,
  },
  "180d": {
    name: "6 months",
    value: 180,
  },
  "90d": {
    name: "3 months",
    value: 90,
  },
  "30d": {
    name: "1 month",
    value: 30,
  },
  "7d": {
    name: "7 Days",
    value: 7,
  },
});

export default function PriceFeedGraph() {
  const [isScriptReady, setIsScriptReady] = useState(false);
  const { chainId } = useAccount();
  const [priceData, setPriceData] = useState<any>();
  const [option, setOption] = useState<any>({
    title: {
      text: networksMap[chainId as number].faucetTokens[0].name,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
    },
    xAxis: {
      type: "category",
      data: priceData?.categoryData,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: "dataMin",
      max: "dataMax",
    },
    yAxis: {
      scale: true,
      splitArea: {},
    },
    series: [
      {
        name: "price",
        type: "candlestick",
        data: priceData?.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upBorderColor,
          borderColor0: downBorderColor,
        },
      },
    ],
    backgroundColor: "transparent",
  });
  const [currentToken, setCurrentToken] = useState<Token>(
    networksMap[chainId as number].faucetTokens[0]
  );
  const [defaultWidgetProps, setDefaultWidgetProps] = useState<
    Partial<ChartingLibraryWidgetOptions>
  >({
    symbol:
      currentToken.name +
      ":" +
      networksMap[chainId as number].chain.id +
      ":" +
      currentToken.address,
    interval: "1D" as ResolutionString,
    library_path: "/static/charting_library/charting_library/",
    locale: "en",
    charts_storage_url: "https://saveload.tradingview.com",
    charts_storage_api_version: "1.1",
    client_id: "tradingview.com",
    user_id: "public_user_id",
    fullscreen: false,
    autosize: true,
    theme: "dark",
  });

  useEffect(() => {
    if (!chainId || !currentToken) return;

    trpcClient.priceFeed.getChartData
      .query({
        chainId: chainId.toString(),
        tokenAddress: currentToken.address,
        from: dayjs().subtract(3, "year").unix(),
        to: dayjs().unix(),
        resolution: "1D",
      })
      .then((data) => {
        setPriceData(
          splitData(
            data.status === "success"
              ? data.data
              : {
                  getBars: {
                    o: [],
                    h: [],
                    l: [],
                    c: [],
                    t: [],
                  },
                }
          )
        );
      })
      .catch((e) => {
        console.error(e);
      });
  }, [chainId, currentToken]);

  useEffect(() => {
    if (!priceData) return;
    setOption((prev: any) => ({
      ...prev,
      xAxis: {
        type: "category",
        data: priceData?.categoryData,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: "dataMin",
        max: "dataMax",
      },
      series: [
        {
          name: "price",
          type: "candlestick",
          data: priceData?.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: upBorderColor,
            borderColor0: downBorderColor,
          },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          startValue: priceData?.categoryData?.length - 30,
          endValue: priceData?.categoryData?.length,
        },
        {
          show: true,
          type: "slider",
          top: "90%",
          startValue: priceData?.categoryData?.length - 30,
          endValue: priceData?.categoryData?.length,
        },
      ],
    }));
  }, [priceData]);

  function splitData(rawData: ChartDataResponse) {
    const categoryData = [];
    const values = [];
    const data = rawData.getBars;

    for (let i = 0; i < data.c.length; i++) {
      categoryData.push(
        new Date((data.t[i] ?? 0) * 1000).toLocaleDateString("en-US")
      );
      values.push([data.o[i], data.c[i], data.l[i], data.h[i]]);
    }

    return {
      categoryData: categoryData,
      values: values,
    };
  }

  function changeTokenHandler(tokenAddress: Token) {
    setCurrentToken(tokenAddress);
    setOption((prev: any) => ({
      ...prev,
      title: {
        text: tokenAddress.name,
      },
    }));
  }

  function toViewHandler(days: number) {
    setOption({
      ...option,
      dataZoom: [
        {
          type: "inside",
          startValue: priceData.categoryData?.length - days,
          endValue: priceData.categoryData?.length,
        },
        {
          show: true,
          type: "slider",
          top: "90%",
          startValue: priceData.categoryData?.length - days,
          endValue: priceData.categoryData?.length,
        },
      ],
    });
  }

  return (
    <>
      {networksMap[chainId as number].faucetTokens.map((token) => (
        <Button key={token.address} onClick={() => changeTokenHandler(token)}>
          {token.name}
        </Button>
      ))}
      <EChartsReact option={option} />
      {viewRanges.map((days) => (
        <Button
          key={days.value}
          onClick={() => {
            toViewHandler(days.value);
          }}
        >
          {days.name}
        </Button>
      ))}
      <Script
        src="/static/charting_library/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      <h1>AC</h1>
      {isScriptReady && currentToken.name && (
        <TVChartContainer {...defaultWidgetProps} />
      )}
    </>
  );
}
