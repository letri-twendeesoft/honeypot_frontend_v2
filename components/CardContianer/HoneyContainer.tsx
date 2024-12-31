import { cn } from "@/lib/tailwindcss";
import { ReactNode } from "react";

interface HoneyContainerProps {
  children: ReactNode;
  bordered?: boolean;
  borderHeight?: string;
  bottomHeight?: string;
  variant?: "dense" | "wide";
  className?: string;
}

export function HoneyContainer({
  children,
  className,
  bordered = true,
  variant = "wide",
  borderHeight = "40px",
  bottomHeight = borderHeight,
}: HoneyContainerProps) {
  return (
    <div className={cn("w-full @container", className)}>
      <div
        style={
          {
            "--honey-container-border-height": borderHeight,
            "--honey-container-bottom-height": bottomHeight,

            backgroundImage: `url('/images/card-container/honey/outline-border.png'), url('${
              variant === "wide"
                ? "/images/card-container/honey/bottom-border.svg"
                : "/images/card-container/dark/bottom-border.svg"
            }')`,
          } as React.CSSProperties
        }
        className={cn(
          "flex flex-col w-full gap-y-4 items-center bg-[#FFCD4D] rounded-2xl text-black",
          bordered &&
            "px-4 py-12 bg-[position:left_top,_left_calc(100%+1px)] bg-[size:100%_var(--honey-container-border-height),_100%_var(--honey-container-bottom-height)] bg-no-repeat @[500px]:bg-[size:auto_var(--honey-container-border-height),_auto_var(--honey-container-bottom-height)] @[500px]:bg-repeat-x"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default HoneyContainer;
