import Link from "next/link";
import { Observer, observer } from "mobx-react-lite";
import { wallet } from "@/services/wallet";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/button";
import launchpad, { defaultPairFilters } from "@/services/launchpad";
import { NextLayoutPage } from "@/types/nextjs";
import { LaunchCard } from "@/components/LaunchCard";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tab,
  Tabs,
  useDisclosure,
  Button as NextButton,
} from "@nextui-org/react";
import { IoSearchOutline } from "react-icons/io5";
import { SpinnerContainer } from "@/components/Spinner";
import { DropdownSvg } from "@/components/svg/dropdown";
import { motion } from "framer-motion";
import { defaultContainerVariants, itemPopUpVariants } from "@/lib/animation";
import { FaCrown, FaExternalLinkAlt } from "react-icons/fa";
import { MemePairContract } from "@/services/contract/memepair-contract";
import Pagination from "@/components/Pagination/Pagination";
import Image from "next/image";
import { WarppedNextInputSearchBar } from "@/components/wrappedNextUI/SearchBar/WrappedInputSearchBar";
import { MemeWarPariticipantRaceChart } from "@/components/MemeWarBanner/MemeWarBannerV2";
import { memewarStore } from "@/services/memewar";

const MemeLaunchPage: NextLayoutPage = observer(() => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mostSuccessProjects, setMostSuccessProjects] = useState<
    MemePairContract[] | null
  >(null);

  const updateMostSuccessProjects = useCallback(() => {
    console.log("updating most success projects", mostSuccessProjects);
    mostSuccessProjects?.forEach((pair) => {
      pair.getDepositedRaisedToken();
    });
  }, [mostSuccessProjects]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      updateMostSuccessProjects();
    }, 2000);
    return () => clearInterval(updateInterval);
  }, [updateMostSuccessProjects]);

  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }
    launchpad.setCurrentLaunchpadType("meme");
    launchpad.showNotValidatedPairs = true;
    launchpad.myLaunches.reloadPage();
    launchpad.projectsPage.updateFilter({
      status: "success",
    });

    memewarStore.reloadParticipants();

    // launchpad.projectsPage.reloadPage();
    // launchpad.participatedPairs.reloadPage();

    //loading most success projects
    const startMostSuccessfulFtoPolling = () => {
      launchpad.trendingMEMEs().then((data) => {
        //if data is same as previous data then no need to update
        setMostSuccessProjects(data);
      });
    };

    startMostSuccessfulFtoPolling();
  }, [wallet.isInit]);

  return (
    <div className="px-2 md:px-6 xl:max-w-[1200px] mx-auto flex flex-col sm:gap-y-4">
      <div className="flex w-full justify-end gap-2">
        <Button className="scale-[0.8] sm:scale-100">
          <Link
            href="/launch-token?launchType=meme"
            className="text-black font-bold"
          >
            Launch Token
          </Link>
        </Button>
      </div>

      <MemeWarPariticipantRaceChart />

      <div>
        <div
          id="filter"
          className="flex flex-col sm:flex-row items-center gap-2 my-4 sm:my-0"
        >
          <WarppedNextInputSearchBar
            onChange={(e) => {
              launchpad.pairFilterSearch = e.target.value;
            }}
          />
        </div>
      </div>

      <div className="w-full">
        <Tabs
          // destroyInactiveTabPanel={false}
          aria-label="Options"
          classNames={{
            tabList: "bg-transparent",
            tab: "flex flex-col items-center gap-2.5 border-0  backdrop-blur-[100px] p-2.5 rounded-[10px]",
          }}
          className="next-tab"
          onSelectionChange={(key) => {
            launchpad.setCurrentLaunchpadType("meme");
            if (key === "all") {
              launchpad.projectsPage.setIsInit(false);
              launchpad.pairFilterStatus = defaultPairFilters.all.status;
            } else if (key === "my") {
              launchpad.myLaunches.setIsInit(false);
              launchpad.pairFilterStatus = defaultPairFilters.myPairs.status;
            } else if (key === "participated-launch") {
              launchpad.participatedPairs.setIsInit(false);
              launchpad.pairFilterStatus =
                defaultPairFilters.participatedPairs.status;
            }
          }}
        >
          <Tab key="all" title="All MEMEs">
            <Pagination
              paginationState={launchpad.projectsPage}
              render={(pair) => <LaunchCard pair={pair} action={<></>} />}
              classNames={{
                itemsContainer:
                  "grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3",
              }}
            />
          </Tab>
          <Tab key="my" title="My MEMEs">
            <Pagination
              paginationState={launchpad.myLaunches}
              render={(pair) => <LaunchCard pair={pair} action={<></>} />}
              classNames={{
                itemsContainer:
                  "grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3",
              }}
            />
          </Tab>
          <Tab key="participated-launch" title="Participated MEMEs">
            <Pagination
              paginationState={launchpad.participatedPairs}
              render={(pair) => <LaunchCard pair={pair} action={<></>} />}
              classNames={{
                itemsContainer:
                  "grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3",
              }}
            />
          </Tab>
          {/* <Tab href="/launch" title="To Fto projects->" /> */}
          <Tab
            href="https://bartio.bonds.yeetit.xyz/"
            target="_blank"
            title={
              <div className="flex items-center text-yellow-400">
                <Image
                  className="size-4"
                  src="/images/partners/yeet_icon.png"
                  alt=""
                  width={100}
                  height={100}
                />
                <span className="flex items-center justify-center gap-2">
                  Try Yeet Bond <FaExternalLinkAlt className="inline-block" />
                </span>
              </div>
            }
          />
          <Tab
            title={
              <Link href="/memewar" className="flex items-center text-rose-600">
                <span className="flex items-center justify-center gap-2">
                  Meme War ⚔️
                </span>
              </Link>
            }
          />
        </Tabs>
      </div>
    </div>
  );
});

export default MemeLaunchPage;
