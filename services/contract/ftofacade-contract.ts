import { BaseContract } from ".";
import { wallet } from "../wallet";
import { getContract } from "viem";
import { AsyncState } from "../utils";
import { makeAutoObservable } from "mobx";
import { ftoFacadeABI } from "@/lib/abis/ftoFacade";

export class FtoFacadeContract implements BaseContract {
  address = "";
  name: string = "";
  abi = ftoFacadeABI;

  constructor(args: Partial<FtoFacadeContract>) {
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


}
