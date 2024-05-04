import { makeAutoObservable } from "mobx";
import { toast } from "react-toastify";
import { wallet } from "./wallet";

export class ValueState<T> {
  _value!: T;
  constructor(args: Partial<ValueState<T>> = {}) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get value() {
    return this.getValue ? this.getValue(this._value) : this._value;
  }
  set value(value) {
    this._value = value;
  }

  getValue!: (value: T) => T;

  setValue(value: T) {
    this._value = value;
  }
}

export class AsyncState<T> {
  loading = false;
  error: Error | null = null;
  value: T | null = null;
  private _call: (...args: any) => Promise<T>;
  constructor(
    func: (...args: any) => Promise<T>,
    options?: {
      loading?: boolean;
    }
  ) {
    this._call = func;
    if (options) {
      Object.assign(this, options);
    }

    makeAutoObservable(this);
  }
  async call(args?: any) {
    this.setLoading(true);
    try {
      const data = await this._call(args);
      this.setValue(data);
    } catch (error) {
      this.setError(error as Error);
    }
    this.setLoading(false);
    return [this.value, this.error];
  }
  setLoading(loading: boolean) {
    this.loading = loading;
  }
  setError(error: Error | null) {
    this.error = error;
  }
  setValue(data: T | null) {
    this.value = data;
  }
}

export class ContractWrite<T extends (...args: any) => any> {
  loading = false;
  error: Error | null = null;
  successMsg: string = "";
  failMsg: string = "";
  private _call: (...args: any) => any;
  constructor(func: T, options?: Partial<ContractWrite<T>>) {
    this._call = func;
    if (options) {
      Object.assign(this, options);
    }

    makeAutoObservable(this);
  }

  async call(args?: Parameters<T>[0]) {
    this.setLoading(true);
    try {
      const hash = await this._call(args, {
         account: wallet.account,
      });
      const transaction =
        await wallet.publicClient.waitForTransactionReceipt({
          hash,
          timeout: 1000 * 10,
        });
      switch (transaction.status) {
        case "success":
          toast.success(this.successMsg || `Transaction ${hash} Success`);
          break;
        case "reverted":
          toast.success(this.failMsg || `Transaction ${hash} failed`);
          break;
        default:
          throw new Error(`Transaction ${hash} Pending`);
      }
    } catch (error: any) {
      toast.error(this.failMsg || error.message);
      console.error(error);
      this.setError(error as Error);
    }
    this.setLoading(false);
  }
  setLoading(loading: boolean) {
    this.loading = loading;
  }
  setError(error: Error | null) {
    this.error = error;
  }
}

export class PaginationState {
  page: number = 1;
  limit: number = 10;
  total: number = 0;

  constructor(args: Partial<PaginationState>) {
    Object.assign(this, args);
    makeAutoObservable(this);
  }

  get offset() {
    return (this.page - 1) * this.limit;
  }

  get end() {
    return this.page * this.limit;
  }

  get totalPage() {
    return Math.ceil(this.total / this.limit);
  }
  setData(args: Partial<PaginationState>) {
    Object.assign(this, args);
  }

  onPageChange = (page: number) => {
    this.page = page;
  };
  onSizeChange = (limit: number) => {
    this.limit = limit;
  };
  setTotal(total: number) {
    this.total = total;
  }
}
