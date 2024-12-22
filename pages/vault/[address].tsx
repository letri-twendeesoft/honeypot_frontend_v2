// pages/vault/[address].tsx
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { ICHIVaultContract } from "@/services/contract/aquabera/ICHIVault-contract";
import { Token } from "@/services/contract/token";
import { Address, isAddress } from "viem";
import { Button } from "@/components/button";
import TokenLogo from "@/components/TokenLogo/TokenLogo";
import { DepositToVaultModal } from "@/components/Aquabera/modals/DepositToVaultModal";
import { wallet } from "@/services/wallet";
import { Token as AlgebraToken } from "@cryptoalgebra/sdk";
import { useReadErc20BalanceOf } from "@/wagmi-generated";
import { WithdrawFromVaultModal } from "@/components/Aquabera/modals/WithdrawFromVaultModal";
import { getSingleVaultDetails } from "@/lib/algebra/graphql/clients/vaults";
import { SingleVaultDetailsQuery } from "@/lib/algebra/graphql/generated/graphql";

export default function VaultDetail() {
  const router = useRouter();
  const { address } = router.query;
  const [vault, setVault] = useState<ICHIVaultContract | null>(null);
  const [tokenA, setTokenA] = useState<Token | null>(null);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [totalSupply, setTotalSupply] = useState<bigint>(BigInt(0));
  const [userShares, setUserShares] = useState<bigint>(BigInt(0));
  const [fees, setFees] = useState<number>(0);
  const [tvl, setTvl] = useState<string>("$0");
  const [volume24h, setVolume24h] = useState<string>("$0");
  const [fees24h, setFees24h] = useState<string>("$0");
  const [vaultData, setVaultData] = useState<SingleVaultDetailsQuery | null>(
    null
  );

  useEffect(() => {
    if (
      !wallet.isInit ||
      !wallet.account ||
      !address ||
      !isAddress(address as string)
    )
      return;

    // Fetch token addresses and pool data
    const loadVaultData = async () => {
      const vaultContract = new ICHIVaultContract({
        address: address as Address,
      });

      setVault(vaultContract);

      const token0Address = await vaultContract.contract.read.token0();
      const token1Address = await vaultContract.contract.read.token1();

      const token0 = Token.getToken({ address: token0Address });
      const token1 = Token.getToken({ address: token1Address });

      await token0.init();
      await token1.init();

      setTokenA(token0);
      setTokenB(token1);

      // Get total supply
      const supply = await vaultContract.contract.read.totalSupply();
      setTotalSupply(supply);

      const shares = await vaultContract.getBalanceOf(wallet.account);
      setUserShares(shares);

      // Get vault data from subgraph
      const vaultDetails = await getSingleVaultDetails(address as string);
      setVaultData(vaultDetails);

      if (vaultDetails.ichiVault) {
        setTvl(
          Number(
            vaultDetails.ichiVault.pool?.totalValueLockedUSD || 0
          ).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })
        );

        const latestDayData = vaultDetails.ichiVault.pool?.poolDayData[0];
        if (latestDayData) {
          setVolume24h(
            Number(latestDayData.volumeUSD || 0).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })
          );

          setFees24h(
            Number(latestDayData.feesUSD || 0).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })
          );
        }
      }
    };

    loadVaultData();
  }, [address, wallet.isInit]);

  const userBalance = useReadErc20BalanceOf({
    address: address as `0x${string}`,
    args: [wallet.account as `0x${string}`],
  });

  const hasShares = userShares > BigInt(0);

  // Add a function to refresh vault data
  const refreshVaultData = useCallback(async () => {
    if (!vault || !wallet.account) return;

    // Get total supply
    const supply = await vault.contract.read.totalSupply();
    setTotalSupply(supply);

    // Get user shares
    const shares = await vault.getBalanceOf(wallet.account);
    setUserShares(shares);

    // Get fees
    const fee = await vault.getFee();
    setFees(fee);

    // Refresh subgraph data
    if (address && typeof address === "string") {
      const vaultDetails = await getSingleVaultDetails(address);
      setVaultData(vaultDetails);
    }
  }, [vault, wallet.account, address]);

  // Format number with 18 decimals
  const formatShares = (value: bigint) => {
    const divisor = BigInt(10 ** 18); // Always use 18 decimals for shares
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;

    // Convert to string and pad with zeros if needed
    const fractionalStr = fractionalPart.toString().padStart(18, "0");

    // Show up to 6 decimal places for better readability
    const displayDecimals = 18;
    const formattedFractional = fractionalStr.slice(0, displayDecimals);

    // Remove trailing zeros
    const trimmedFractional = formattedFractional.replace(/0+$/, "");

    return trimmedFractional
      ? `${integerPart}.${trimmedFractional}`
      : integerPart.toString();
  };

  // Merge all transactions into one array and sort by timestamp
  const allTransactions = [
    ...(vaultData?.ichiVault?.vaultDeposits?.map((tx) => ({
      ...tx,
      type: "deposit",
    })) ?? []),
    ...(vaultData?.ichiVault?.vaultWithdraws?.map((tx) => ({
      ...tx,
      type: "withdraw",
    })) ?? []),
    ...(vaultData?.ichiVault?.vaultCollectFees?.map((tx) => ({
      ...tx,
      to: tx.sender,
      type: "fee",
    })) ?? []),
  ].sort((a, b) => Number(b.createdAtTimestamp) - Number(a.createdAtTimestamp));

  return (
    <div className="container mx-auto p-4">
      {/* Add Back Button */}
      <div className="mb-4">
        <Button
          onClick={() => router.push("/pools")}
          className="flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Vaults
        </Button>
      </div>

      <div className="bg-[#271A0C] rounded-3xl border-3 border-solid border-[#F7931A10] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {tokenA && tokenB && (
              <>
                <TokenLogo token={tokenA} />
                <TokenLogo token={tokenB} />
                <span className="text-xl font-bold">
                  {tokenA.symbol}/{tokenB.symbol}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDepositModalOpen(true)}
              disabled={!wallet.account}
            >
              Deposit
            </Button>
            {hasShares && (
              <>
                <Button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  disabled={!wallet.account}
                >
                  Withdraw
                </Button>
                <Button onClick={() => vault?.collectFees()}>
                  Collect Fees {fees}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1A1108] p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Total Supply</h3>
            <p className="text-xl font-bold">{formatShares(totalSupply)}</p>
          </div>
          <div className="bg-[#1A1108] p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Your Shares</h3>
            <p className="text-xl font-bold">{formatShares(userShares)}</p>
          </div>
          <div className="bg-[#1A1108] p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Share Percentage</h3>
            <p className="text-xl font-bold">
              {totalSupply > BigInt(0)
                ? ((Number(userShares) / Number(totalSupply)) * 100).toFixed(2)
                : "0"}
              %
            </p>
          </div>
          <div className="bg-[#1A1108] p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">Total Value Locked</h3>
            <p className="text-xl font-bold">{tvl}</p>
          </div>
          <div className="bg-[#1A1108] p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">24h Volume</h3>
            <p className="text-xl font-bold">{volume24h}</p>
          </div>
          <div className="bg-[#1A1108] p-4 rounded-xl">
            <h3 className="text-sm text-gray-400">24h Fees</h3>
            <p className="text-xl font-bold">{fees24h}</p>
          </div>
        </div>

        {/* Recent Activity */}
        {vaultData?.ichiVault && (
          <div className="bg-[#1A1108] p-4 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {allTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center">
                  <div>
                    {tx.type === "deposit" && (
                      <span className="text-green-500">Deposit</span>
                    )}
                    {tx.type === "withdraw" && (
                      <span className="text-red-500">Withdraw</span>
                    )}
                    {tx.type === "fee" && (
                      <span className="text-yellow-500">Fee Collection</span>
                    )}
                    {tx.to && ` by ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(
                      Number(tx.createdAtTimestamp) * 1000
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vault Info */}
        <div className="bg-[#1A1108] p-4 rounded-xl mt-6">
          <h3 className="text-lg font-bold mb-4">Vault Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Vault Address</p>
              <p className="font-mono">{address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Token Addresses</p>
              <p className="font-mono">{tokenA?.address}</p>
              <p className="font-mono">{tokenB?.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {vault && tokenA && tokenB && (
        <>
          <DepositToVaultModal
            isOpen={isDepositModalOpen}
            onClose={() => {
              setIsDepositModalOpen(false);
              refreshVaultData(); // Refresh after closing deposit modal
            }}
            vault={vault}
            tokenA={
              new AlgebraToken(
                wallet.currentChainId,
                tokenA.address as `0x${string}`,
                Number(tokenA.decimals),
                tokenA.symbol,
                tokenA.name
              )
            }
            tokenB={
              new AlgebraToken(
                wallet.currentChainId,
                tokenB.address as `0x${string}`,
                Number(tokenB.decimals),
                tokenB.symbol,
                tokenB.name
              )
            }
          />
          <WithdrawFromVaultModal
            isOpen={isWithdrawModalOpen}
            onClose={() => {
              setIsWithdrawModalOpen(false);
              refreshVaultData(); // Refresh after closing withdraw modal
            }}
            vault={vault}
            maxShares={userShares}
          />
        </>
      )}
    </div>
  );
}
