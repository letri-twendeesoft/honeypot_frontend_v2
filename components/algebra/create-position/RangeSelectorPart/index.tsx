import { useCallback, useEffect, useState } from "react";
import { Price, Token } from "@cryptoalgebra/sdk";
import { useMintState } from "@/lib/algebra/state/mintStore";
import { Button } from "@/components/algebra/ui/button";
import { Input } from "@/components/algebra/ui/input";

export interface RangeSelectorPartProps {
  value: string;
  onUserInput: (value: string) => void;
  decrement: () => string;
  increment: () => string;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
  label?: string;
  width?: string;
  locked?: boolean;
  initialPrice: Price<Token, Token> | undefined;
  disabled: boolean;
  title: string;
}

const RangeSelectorPart = ({
  value,
  decrement,
  increment,
  decrementDisabled = false,
  incrementDisabled = false,
  locked,
  onUserInput,
  disabled,
  title,
}: RangeSelectorPartProps) => {
  const [localUSDValue, setLocalUSDValue] = useState("");
  const [localTokenValue, setLocalTokenValue] = useState("");

  const {
    initialTokenPrice,
    actions: { updateSelectedPreset },
  } = useMintState();

  const handleOnBlur = useCallback(() => {
    onUserInput(localTokenValue);
  }, [localTokenValue, localUSDValue, onUserInput]);

  const handleDecrement = useCallback(() => {
    onUserInput(decrement());
  }, [decrement, onUserInput]);

  const handleIncrement = useCallback(() => {
    onUserInput(increment());
  }, [increment, onUserInput]);

  useEffect(() => {
    if (value) {
      setLocalTokenValue(value);
      if (value === "∞") {
        setLocalUSDValue(value);
        return;
      }
    } else if (value === "") {
      setLocalTokenValue("");
      setLocalUSDValue("");
    }
  }, [initialTokenPrice, value]);

  useEffect(() => {
    return () => updateSelectedPreset(null);
  }, []);

  return (
    <div>
      <div className="font-bold text-xs mb-3">{title.toUpperCase()}</div>
      <div className="flex relative">
        <Button
          variant={"ghost"}
          size={"sm"}
          onClick={handleDecrement}
          disabled={decrementDisabled || disabled}
          className="border rounded-xl rounded-r-none honeypot-button"
        >
          -
        </Button>

        <Input
          type={"text"}
          value={localTokenValue}
          id={title}
          onBlur={handleOnBlur}
          disabled={disabled || locked}
          onUserInput={(v: string) => {
            setLocalTokenValue(v);
            updateSelectedPreset(null);
          }}
          placeholder={"0.00"}
          className="w-full border-y border-x-0 rounded-none text-sm h-[36px] honeypot-input"
        />

        <Button
          variant={"ghost"}
          size={"sm"}
          onClick={handleIncrement}
          disabled={incrementDisabled || disabled}
          className="border rounded-xl rounded-l-none honeypot-button"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default RangeSelectorPart;
