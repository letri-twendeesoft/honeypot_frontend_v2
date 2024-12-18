// components/Aquabera/modals/WithdrawFromVaultModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/modal";
import { Button } from "@/components/button/button-next";
import { useCallback, useState } from "react";
import { ICHIVaultContract } from "@/services/contract/aquabera/ICHIVault-contract";
import { wallet } from "@/services/wallet";
import { ContractWrite } from "@/services/utils";
import { Slider } from "@nextui-org/slider";

interface WithdrawFromVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: ICHIVaultContract;
  maxShares: bigint;
}

export function WithdrawFromVaultModal({
  isOpen,
  onClose,
  vault,
  maxShares,
}: WithdrawFromVaultModalProps) {
  const [amount, setAmount] = useState("");
  const [percentage, setPercentage] = useState(0);

  const handleTypeAmount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setAmount(value);
        // Update percentage based on input amount
        const newPercentage = value
          ? (Number(value) / Number(maxShares)) * 100
          : 0;
        setPercentage(Math.min(newPercentage, 100));
      }
    },
    [maxShares]
  );

  const handleSliderChange = useCallback(
    (value: number) => {
      setPercentage(value);
      const newAmount =
        (BigInt(maxShares) * BigInt(value * 100)) / BigInt(10000);
      setAmount(newAmount.toString());
    },
    [maxShares]
  );

  const handlePercentageClick = useCallback(
    (percent: number) => {
      setPercentage(percent);
      const newAmount =
        (BigInt(maxShares) * BigInt(percent * 100)) / BigInt(10000);
      setAmount(newAmount.toString());
    },
    [maxShares]
  );

  const handleMaxAmount = useCallback(() => {
    setAmount(maxShares.toString());
    setPercentage(100);
  }, [maxShares]);

  const handleWithdraw = async () => {
    if (!wallet.account || !amount) return;

    const withdrawAmount = BigInt(amount);

    if (withdrawAmount > maxShares) {
      console.error("Cannot withdraw more than available shares");
      return;
    }

    try {
      await new ContractWrite(vault.contract.write.withdraw, {
        action: "Withdraw",
        isSuccessEffect: true,
      }).call([withdrawAmount, wallet.account as `0x${string}`]);

      onClose(); // Close modal after successful transaction
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  // 添加格式化函数
  const formatShares = (value: bigint) => {
    const decimals = vault.contract.read.decimals(); // 从合约获取 decimals
    const divisor = BigInt(10 ** Number(decimals));
    const integerPart = value / divisor;
    const fractionalPart = value % divisor;
    const fractionalStr = fractionalPart.toString().padStart(Number(decimals), "0");
    const displayDecimals = 6;
    const formattedFractional = fractionalStr.slice(0, displayDecimals);
    const trimmedFractional = formattedFractional.replace(/0+$/, "");

    return trimmedFractional
      ? `${integerPart}.${trimmedFractional}`
      : integerPart.toString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "bg-transparent",
        wrapper: "bg-transparent",
        closeButton: "absolute right-4 top-6 z-50 text-white w-8 h-8 flex items-center justify-center rounded-full",
      }}
    >
      <ModalContent className="bg-[#FFCD4D] relative overflow-hidden">
        {(onClose) => (
          <>
            {/* 顶部装饰边框 */}
            <div className="bg-[url('/images/pumping/outline-border.png')] h-[50px] absolute top-0 left-0 w-full bg-contain bg-[left_-90px_top] bg-repeat-x"></div>

            <ModalHeader className="pt-14 bg-[#FFCD4D]">
              <h3 className="text-xl font-bold text-black">Withdraw from Vault</h3>
            </ModalHeader>

            <ModalBody className="px-6 bg-[#FFCD4D]">
              <div className="w-full rounded-[32px] bg-white space-y-4 px-4 py-6 custom-dashed mb-6">
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border bg-card-dark shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] p-4">
                    <div className="flex justify-between mb-2">
                      <label className="text-black text-base font-medium">
                        Amount to Withdraw
                      </label>
                      <span className="text-black text-base">
                        Available: {formatShares(maxShares)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={amount}
                        onChange={handleTypeAmount}
                        className="w-full bg-transparent border border-black rounded-[16px] px-4 py-[18px] text-black outline-none shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)]"
                        placeholder="0.0"
                      />
                      <Button
                        onClick={handleMaxAmount}
                        className="px-4 py-2 bg-[#FFCD4D] hover:bg-[#ffd666] text-black rounded-[16px]"
                      >
                        MAX
                      </Button>
                    </div>

                    {/* Slider */}
                    <div className="mt-6">
                      <Slider
                        aria-label="Withdraw percentage"
                        value={percentage}
                        onChange={(value) =>
                          handleSliderChange(Array.isArray(value) ? value[0] : value)
                        }
                        className="w-full"
                        step={1}
                        maxValue={100}
                        minValue={0}
                        classNames={{
                          base: "max-w-full",
                          track: "bg-black/30",
                          filler: "bg-[#FFCD4D]",
                          thumb: "bg-[#FFCD4D] shadow-lg border-2 border-white",
                        }}
                      />
                    </div>

                    {/* Percentage Buttons */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px] justify-around w-full mt-4">
                      {[25, 50, 75, 100].map((percent) => (
                        <Button
                          key={percent}
                          onClick={() => handlePercentageClick(percent)}
                          className={`rounded-[30px] px-[24px] ${
                            percentage === percent
                              ? "bg-[#FFCD4D] text-black"
                              : "bg-white text-black border border-black"
                          }`}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-[#FFCD4D] hover:bg-[#ffd666] text-black font-medium rounded-[16px] py-[18px] shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)]"
                    onClick={handleWithdraw}
                    disabled={
                      !amount ||
                      BigInt(amount || "0") <= BigInt(0) ||
                      BigInt(amount) > maxShares
                    }
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </ModalBody>

            {/* 底部装饰边框 */}
            <div className="bg-[url('/images/pool-detail/bottom-border.svg')] bg-left-top h-6 absolute -bottom-1 left-0 w-full bg-contain"></div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default WithdrawFromVaultModal;
