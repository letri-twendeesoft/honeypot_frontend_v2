import { BaseContract } from ".";
import { wallet } from "../wallet";
import { getContract } from "viem";
import { makeAutoObservable } from "mobx";
import { ContractWrite } from "../utils";
import { MemeFacadeABI } from "@/lib/abis/MemeFacade";
import { pot2PumpFacadeABI } from "@/lib/abis/Pot2Pump/pot2PumpFacade";

export class MEMEFacadeContract implements BaseContract {
  address = "";
  name: string = "";
  abi = pot2PumpFacadeABI;

  constructor(args: Partial<MEMEFacadeContract>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get contract() {
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient },
    });
  }

  get deposit() {
    return new ContractWrite(this.contract.write?.deposit, {
      action: "Deposit",
      isSuccessEffect: true,
    });
  }

  get claimLP() {
    return new ContractWrite(this.contract.write?.claimLP, {
      action: "Claim Liquidity Pool",
      isSuccessEffect: true,
    });
  }
}
