import { trpcClient } from "@/lib/trpc";
import { ChartData } from "@/public/static/charting_library/charting_library";
import { chart, chartColorThemes, chartTimeRanges } from "@/services/chart";
import { PairContract } from "@/services/contract/pair-contract";
import { Token } from "@/services/contract/token";
import { liquidity } from "@/services/liquidity";
import { swap } from "@/services/swap";
import { wallet } from "@/services/wallet";
import { Button, cn } from "@nextui-org/react";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import { set } from "lodash";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { FaSortDown, FaSortUp, FaSpinner } from "react-icons/fa";
import CardContianer from "../CardContianer/CardContianer";
import { BiDownArrow, BiDownArrowAlt, BiDownvote } from "react-icons/bi";
import { IoArrowDown, IoCaretDown, IoCaretUp } from "react-icons/io5";
import HoneyStickSvg from "../svg/HoneyStick";
import Link from "next/link";
import Image from "next/image";
import TokenLogo from "../TokenLogo/TokenLogo";

const Chart = dynamic(() => import("react-apexcharts"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

interface Props {}

export const SimplePriceFeedGraph = observer((props: Props) => {
  const [state, setState] = useState<{
    options: ApexOptions;
    series: ApexAxisChartSeries;
  }>({
    series: [
      {
        data:
          chart.chartData.value?.getBars?.c.map((price, index) => {
            return [
              (chart.chartData.value?.getBars.t[index] as number) * 1000,
              price as number,
            ];
          }) ?? [],
        color: chart.chartColors.labelColor,
        name: "price",
      },
    ],
    options: {
      chart: {
        id: "area-datetime",
        type: "area",
        zoom: {
          autoScaleYaxis: true,
        },
        foreColor: chart.chartColors.textColor,
        toolbar: {
          show: false,
          autoSelected: undefined,
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: "end",
        formatter: function (val, opts) {
          if (opts.dataPointIndex === opts.w.config.series[0].data.length - 1) {
            return (val as any)?.toFixed(5);
          }
        },
      },
      markers: {
        size: 0,
      },
      xaxis: {
        type: "datetime",
        min: chart.timestampsByRange * 1000,
        max: dayjs().unix() * 1000,
        tickAmount: 6,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val?.toFixed(5);
          },
          align: "right",
        },
        tickAmount: 4,
      },
      tooltip: {
        enabled: true,
        x: {
          format: "dd MMM HH:mm",
        },
        theme: "dark",
        fillSeriesColor: true,
        fixed: {
          enabled: true,
          position: "topRight",
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 1,
          opacityTo: 0,
          stops: [],
          colorStops: [
            {
              offset: 0,
              color: chart.chartColors.labelColor,
              opacity: 1,
            },
            {
              offset: 70,
              color: chart.chartColors.labelColor,
              opacity: 0.5,
            },
            {
              offset: 100,
              color: chart.chartColors.labelColor,
              opacity: 0,
            },
          ],
        },
      },
      grid: {
        show: false,
      },
    },
  });

  useEffect(() => {
    if (chart.chartTarget) {
      const tokenNum =
        chart.chartTarget instanceof PairContract
          ? swap.fromToken?.address == chart.chartTarget.token0.address
            ? 0
            : 1
          : 0;
      const currencyCode: "TOKEN" | "USD" =
        chart.chartTarget instanceof PairContract ? "TOKEN" : "USD";

      chart.setTokenNumber(tokenNum);
      chart.setCurrencyCode(currencyCode);

      chart.chartData.call().then(() => {
        const chartColor =
          chart.chartPricePercentageChange >= 0 ? "green" : "red";
        chart.setChartColors(chartColor);

        setState({
          ...state,
          series: [
            {
              data:
                chart.chartData.value?.getBars?.c.map((price, index) => {
                  return [
                    (chart.chartData.value?.getBars.t[index] as number) * 1000,
                    price as number,
                  ];
                }) ?? [],
              color: chart.chartColors.labelColor,
              name: "price",
            },
          ],
          options: {
            ...state.options,
            xaxis: {
              ...state.options.xaxis,
              min: chart.timestampsByRange * 1000,
              max: dayjs().unix() * 1000,
              tickAmount: 6,
            },
            tooltip: {
              ...state.options.tooltip,
              x: {
                ...state.options.tooltip?.x,
                format: "dd MMM HH:mm",
              },
            },
            fill: {
              ...state.options.fill,
              gradient: {
                ...state.options.fill?.gradient,
                colorStops: [
                  {
                    offset: 0,
                    color: chart.chartColors.labelColor,
                    opacity: 1,
                  },
                  {
                    offset: 70,
                    color: chart.chartColors.labelColor,
                    opacity: 0.5,
                  },
                  {
                    offset: 100,
                    color: chart.chartColors.labelColor,
                    opacity: 0,
                  },
                ],
              },
            },
          },
        });
      });
    }
  }, [chart.chartTarget, chart.range, chart.chartLabel]);

  return (
    <>
      {chart.isLoading && (
        <FaSpinner className="animate-spin absolute top-1/2 left-1/2 z-50"></FaSpinner>
      )}
      <div className="relative w-full h-full flex-col flex items-center justify-center">
        <div className="flex justify-between items-center w-full gap-5">
          <span className="lg:pl-4">
            <div className="flex">
              {chart.TargetLogoDisplay.map((logo) => (
                <TokenLogo key={logo.address} token={logo} />
              ))}
            </div>
            {chart.chartLabel}
          </span>
          <div className="grid w-full gap-2 grid-cols-3 lg:grid-cols-6  items-center flex-wrap">
            {Object.values(chartTimeRanges).map((range) => (
              <Button
                className="min-w-[1rem] disabled:border-[red_2px_solid] "
                key={range.value}
                isDisabled={chart.range === range.label || chart.isLoading}
                onClick={() => {
                  chart.setRange(range.label);
                }}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        {chart.chartTarget ? (
          <>
            <div className="w-full pl-4">
              <span className="mr-2 text-[2rem]">
                {(chart.currentPrice ?? 0) < 0.004 && "<"}
                {chart.currentPrice?.toFixed(2)}
              </span>
              <span
                className={cn(
                  "inline-flex justify-start",
                  chart.chartPricePercentageChange >= 0
                    ? "text-green-500"
                    : "text-red-500"
                )}
              >
                {chart.chartPricePercentageChange >= 0 ? (
                  <IoCaretUp className="inline" />
                ) : (
                  <IoCaretDown className="inline" />
                )}
                {chart.chartPricePercentageChange.toFixed(2)}%
              </span>
            </div>
            <div className="w-full">
              <Chart
                options={state.options}
                series={state.series}
                type="area"
              />
            </div>
          </>
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center">
            <HoneyStickSvg />
          </div>
        )}
      </div>
    </>
  );
});
