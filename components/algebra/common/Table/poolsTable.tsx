import { Button } from "@/components/algebra/ui/button";
import { Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingDisplay from "@/components/LoadingDisplay/LoadingDisplay";
import { popmodal } from "@/services/popmodal";
import CreatePoolForm from "../../create-pool/CreatePoolForm";
import { cn } from "@/lib/tailwindcss";
import { Pool } from "./poolsColumns";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface PoolsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnsMy: ColumnDef<TData, TValue>[];
  data: TData[];
  userPools: TData[];
  action?: (args?: any) => void;
  defaultSortingID?: string;
  link?: string;
  showPagination?: boolean;
  searchID?: string;
  loading?: boolean;
  sorting: any;
  setSorting: any;
  defaultFilter?: string;
  showOptions?: boolean;
  handleSearch: (data: string) => void;
}

type SortField = "pool" | "tvl" | "volume" | "apr";
type SortDirection = "asc" | "desc";

const PoolsTable = <TData, TValue>({
  columns,
  columnsMy,
  data,
  userPools,
  action,
  link,
  showPagination = true,
  loading,
  defaultFilter = "trending",
  showOptions = true,
  handleSearch,
}: PoolsTableProps<TData, TValue>) => {
  const [selectedFilter, setSelectedFilter] = useState<string>(defaultFilter);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("tvl");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filters = [
    { key: "trending", label: "All Pools" },
    { key: "myPools", label: "My Pools" },
  ];

  const [tableData, setTableData] = useState<Pool[]>([]);

  useEffect(() => {
    if (selectedFilter === "myPools") {
      setTableData(userPools as Pool[]);
    } else {
      setTableData(data as Pool[]);
    }
  }, [data, selectedFilter, userPools]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(search.toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortedPools = () => {
    return [...tableData].sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;

      switch (sortField) {
        case "pool":
          return (
            multiplier *
            (a.pair.token0.symbol + a.pair.token1.symbol).localeCompare(
              b.pair.token0.symbol + b.pair.token1.symbol
            )
          );
        case "tvl":
          return multiplier * (Number(a.tvlUSD) - Number(b.tvlUSD));
        case "volume":
          return multiplier * (Number(a.volume24USD) - Number(b.volume24USD));
        case "apr":
          return multiplier * (Number(a.apr24h) - Number(b.apr24h));
        default:
          return 0;
      }
    });
  };

  const SortHeader = ({
    field,
    label,
    align = "right",
  }: {
    field: SortField;
    label: string;
    align?: "left" | "right" | "center";
  }) => (
    <th
      className={`py-4 px-6 cursor-pointer transition-colors text-[#4D4D4D]`}
      onClick={() => handleSort(field)}
    >
      <div
        className={`flex items-center gap-2 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUpIcon
            className={`h-3 w-3 ${
              sortField === field && sortDirection === "asc"
                ? "text-black"
                : "text-[#4D4D4D]"
            }`}
          />
          <ChevronDownIcon
            className={`h-3 w-3 ${
              sortField === field && sortDirection === "desc"
                ? "text-black"
                : "text-[#4D4D4D]"
            }`}
          />
        </div>
      </div>
    </th>
  );

  return (
    <div>
      {showOptions && (
        <div className="flex flex-col xl:flex-row gap-4 w-full xl:justify-between xl:items-center py-4">
          <div className="flex items-center xl:gap-x-6 w-full xl:w-fit justify-between">
            <div className="flex items-center">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`p-2.5 cursor-pointer ${
                    selectedFilter === filter.key
                      ? "border border-[#E18A20]/40 bg-[#E18A20]/40 rounded-[10px]"
                      : ""
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                placeholder="Search pool"
                value={search}
                type="text"
                onChange={(event) => setSearch(event.target.value)}
                className="border border-[#E18A20]/10 bg-[#271A0C] pl-12 pr-4 h-12 w-[353px] focus:border-opacity-100 rounded-2xl placeholder:align-middle"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-border"
                size={20}
              />
            </div>
          </div>
          <div className="flex items-center gap-x-5">
            <Button
              className={cn(
                "flex items-center gap-x-1 p-2.5 cursor-pointer border border-[#E18A20]/40 bg-[#E18A20]/40 rounded-[10px]"
              )}
              onClick={() =>
                popmodal.openModal({
                  content: <CreatePoolForm />,
                  boarderLess: true,
                  shouldCloseOnInteractOutside: false,
                })
              }
            >
              <Plus />
              <span>Create Pool</span>
            </Button>
          </div>
        </div>
      )}

      {!loading ? (
        <table className="w-full">
          <thead>
            <tr>
              <SortHeader field="pool" label="Pool" align="left" />
              <SortHeader field="tvl" label="TVL" />
              <SortHeader field="volume" label="Volume 24H" />
              <SortHeader field="apr" label="APR" />
              <th className="py-4 px-6 text-center text-[#4D4D4D]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4D4D4D]">
            {!getSortedPools().length ? (
              <tr className="hover:bg-white border-white h-full">
                <td colSpan={5} className="h-24 text-center text-black">
                  No results.
                </td>
              </tr>
            ) : (
              getSortedPools().map((pool: any) => (
                <tr
                  key={pool.id}
                  className="transition-colors bg-white text-black hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (action) {
                      action(pool.id);
                    } else if (link) {
                      window.location.href = `/${link}/${pool.id}`;
                    }
                  }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Image
                          src={pool.pair.token0.logoURI}
                          alt={pool.pair.token0.symbol}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <Image
                          src={pool.pair.token1.logoURI}
                          alt={pool.pair.token1.symbol}
                          width={24}
                          height={24}
                          className="rounded-full -ml-2"
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-black font-medium">
                          {pool.pair.token0.symbol}/{pool.pair.token1.symbol}
                        </p>
                        <p className="text-black/60 text-sm">
                          {pool.fee / 10000}%
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col">
                      <span className="text-black">
                        ${Number(pool.tvlUSD).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col">
                      <span className="text-black">
                        ${Number(pool.volume24USD).toLocaleString()}
                      </span>
                      <span
                        className={`text-xs ${
                          Number(pool.change24h) >= 0
                            ? "text-[#4ADE80]"
                            : "text-[#FF5555]"
                        }`}
                      >
                        {Number(pool.change24h) >= 0 ? "+" : ""}
                        {pool.change24h}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col">
                      <span className="text-black">
                        {Number(pool.apr24h).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (action) {
                          action(pool.id);
                        } else if (link) {
                          window.location.href = `/${link}/${pool.id}`;
                        }
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <LoadingDisplay />
      )}

      {showPagination && tableData.length > 10 && (
        <div className="flex items-center justify-end space-x-2 px-4 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newData = [...tableData];
              newData.splice(10);
              setTableData(newData);
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newData = [...tableData];
              newData.splice(0, 10);
              setTableData(newData);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PoolsTable;
