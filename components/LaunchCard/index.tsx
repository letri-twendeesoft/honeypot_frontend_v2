import { FtoPairContract } from "@/services/contract/ftopair-contract";
import { observer } from "mobx-react-lite";
import { Logo } from "../svg/logo";
import { Copy } from "@/components/copy";
import { TimelineSvg } from "@/components/svg/Timeline";
import { TotalRaisedSvg } from "@/components/svg/TotalRaised";
import { TokenPriceSvg } from "@/components/svg/TokenPrice";
import { AmountFormat } from "@/components/AmountFormat";
import { Button } from "@/components/button";
import Link from "next/link";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/tailwindcss";
import ProjectStatusDisplay from "../atoms/TokenStatusDisplay/TokenStatusDisplay";
import { WatchAsset } from "../atoms/WatchAsset/WatchAsset";
import Image from "next/image";
import { SlOptions, SlShare } from "react-icons/sl";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import {
  OptionsDropdown,
  optionsPresets,
} from "../OptionsDropdown/OptionsDropdown";
import { WalletSvg } from "../svg/wallet";
import { BiWallet } from "react-icons/bi";
import ShareSocialMedialPopUp, {
  shareMediaToast,
} from "../ShareSocialMedialPopUp/ShareSocialMedialPopUp";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { itemPopUpVariants, itemSlideVariants } from "@/lib/animation";
import { MemePairContract } from "@/services/contract/memepair-contract";
import ProgressBar from "../atoms/ProgressBar/ProgressBar";

const Actions = () => {};

export const LaunchCard = observer(
  ({
    pair,
    action,
    type,
    className,
    variant,
    ...props
  }: {
    type?: "list" | "detail";
    pair?: FtoPairContract | MemePairContract | null;
    variant?: "default" | "meme";
    action: React.ReactNode;
  } & Partial<HTMLAttributes<any>>) => {
    const projectType = pair instanceof MemePairContract ? "meme" : "fto";
    return (
      <motion.div
        variants={itemPopUpVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "flex h-full flex-col justify-center items-center gap-2 border bg-[#1D1407] backdrop-blur-[13.5px] px-2.5 py-3 rounded-[20px] border-solid border-[rgba(247,147,26,0.10)] relative",
          className
        )}
        whileInView="visible"
      >
        <ProjectStatusDisplay pair={pair} />
        <OptionsDropdown
          className="absolute left-[0.5rem] top-[0.5rem] "
          options={[
            optionsPresets.copy({
              copyText: pair?.launchedToken?.address ?? "",
              displayText: "Copy Token address",
              copysSuccessText: "Token address copied",
            }),
            optionsPresets.importTokenToWallet({
              token: pair?.launchedToken,
            }),
            optionsPresets.share({
              shareUrl: `${window.location.origin}/launch-detail/${pair?.address}`,
              displayText: "Share this project",
              shareText:
                projectType === "meme"
                  ? "My Meme FTO eats bonding burves for breakfast. Inflate & innovation with Boneypot. Den moon 🌙: " +
                    pair?.projectName
                  : "Checkout this Token: " + pair?.projectName,
            }),
            optionsPresets.viewOnExplorer({
              address: pair?.address ?? "",
            }),
          ]}
        />
        <div className="w-14 flex items-center justify-center rounded-lg bg-gold-primary aspect-square overflow-hidden object-cover">
          <Image
            src={!!pair?.logoUrl ? pair.logoUrl : "/images/project_honey.png"}
            alt="honey"
            width={100}
            height={100}
            className="object-cover w-full h-full"
          ></Image>
        </div>
        <h4 className="text-white text-center text-[1rem] font-bold flex items-start  h-[1.5em] overflow-hidden">
          <div className=" relative ">
            {pair?.launchedToken?.name} ({pair?.launchedToken?.symbol})
          </div>{" "}
        </h4>{" "}
        <div
          className={cn(
            "grid  items-start gap-6 text-white mt-2 justify-between w-full break-all ",
            type === "detail" ? "sm:grid-cols-4 grid-cols-2" : " grid-cols-2"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <h6 className="opacity-50 text-xs">Timeline</h6>
            <div className="flex items-center gap-2 text-sm">
              {/* <TimelineSvg /> */}
              <span className="font-bold">{pair?.remainTime}</span>
            </div>
          </div>
          {variant === "meme" ? (
            pair instanceof MemePairContract &&
            pair.depositedRaisedToken &&
            pair.raisedTokenMinCap && (
              <div className="flex flex-col items-center gap-1">
                <h6 className="opacity-50 text-xs">Progress</h6>
                <div className="flex items-center gap-2 text-sm w-[80%]">
                  <ProgressBar
                    label={
                      (
                        (pair.depositedRaisedToken.toNumber() /
                          (pair.raisedTokenMinCap.toNumber() /
                            Math.pow(10, 18))) *
                        100
                      ).toFixed(2) + "%"
                    }
                    value={
                      (pair.depositedRaisedToken.toNumber() /
                        (pair.raisedTokenMinCap.toNumber() /
                          Math.pow(10, 18))) *
                      100
                    }
                  />
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-1">
              <h6 className="opacity-50 text-xs">Total launched</h6>
              <div className="flex items-center gap-2 text-sm">
                {/* <TotalRaisedSvg /> */}
                <span className="font-bold">
                  {pair?.depositedLaunchedToken
                    ? pair?.depositedLaunchedToken?.toFormat(0)
                    : "-"}
                  &nbsp;
                  {pair?.launchedToken?.displayName}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <h6 className="opacity-50 text-xs">Total raised</h6>
            <div className="flex items-center gap-2 text-sm">
              {/* <TotalRaisedSvg /> */}
              <span className="font-bold">
                {pair?.depositedRaisedToken
                  ? pair.depositedRaisedToken.toFormat(3)
                  : "-"}
                &nbsp;
                {pair?.raiseToken?.displayName}
              </span>
            </div>
          </div>{" "}
          <div className="flex flex-col items-center gap-1">
            <h6 className="opacity-50 text-xs">Your Deposit</h6>
            <div className="flex items-center gap-2 text-sm">
              {/* <TotalRaisedSvg /> */}
              <span className="font-bold">
                {pair?.userDepositedRaisedToken
                  ? (
                      pair.userDepositedRaisedToken.toNumber() /
                      Math.pow(10, pair.raiseToken?.decimals ?? 18)
                    ).toFixed(3)
                  : "-"}
                &nbsp;
                {pair?.raiseToken?.displayName}
              </span>
            </div>
          </div>
          {/* <div className="flex flex-col items-center gap-1">
            <h6 className="opacity-50 text-xs">Token Price</h6>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">
                <AmountFormat amount={pair?.price?.toFixed()}></AmountFormat>{" "}
                {pair?.raiseToken?.displayName}
              </span>
            </div>
          </div> */}
        </div>
        <div className="w-full mt-[16px] flex gap-4 flex-col lg:flex-row justify-center items-center flex-wrap *:basis-1 *:grow-[1]">
          {pair?.canClaimLP && (
            <div>
              <Button
                className="w-full"
                onClick={() => {
                  pair.claimLP.call();
                }}
                style={{
                  backgroundColor: "green",
                }}
              >
                Claim LP
              </Button>
            </div>
          )}
          {pair instanceof MemePairContract && pair.canRefund && (
            <div>
              <Button
                className="w-full"
                onClick={() => {
                  pair.refund.call();
                }}
                isLoading={pair.refund.loading}
                style={{
                  backgroundColor: "green",
                }}
              >
                Refund LP
              </Button>
            </div>
          )}
          <Link
            href={`/launch-detail/${pair?.address}`}
            className="text-black font-bold  "
          >
            <Button className="w-full">View Token</Button>
          </Link>
          {pair?.ftoState === 0 && (
            <>
              <Link
                href={`/swap?inputCurrency=${pair.launchedToken?.address}&outputCurrency=${pair.raiseToken?.address}`}
                className="text-black font-bold  "
              >
                <Button className="w-full">
                  <p>Buy Token</p>
                </Button>{" "}
              </Link>

              <Link
                href={`/pool?inputCurrency=${pair.launchedToken?.address}&outputCurrency=${pair.raiseToken?.address}`}
                className="text-black font-bold  "
              >
                <Button className="w-full">
                  <p>Add LP</p>
                </Button>{" "}
              </Link>
            </>
          )}
          {action}
        </div>
      </motion.div>
    );
  }
);
