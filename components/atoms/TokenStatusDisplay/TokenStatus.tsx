import { cn } from "@/lib/tailwindcss";
import { Skeleton } from "@nextui-org/react";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";

interface ProjectStatusProps {
  isValidated?: boolean;
  ftoStatusDisplayColor?: string;
  ftoStatusDisplayStatus?: string;
}

const ProjectStatus = observer(
  ({
    ftoStatusDisplayColor,
    ftoStatusDisplayStatus,
    isValidated,
  }: ProjectStatusProps) => {
    return (
      <div className="flex flex-col gap-[5px]">
        {ftoStatusDisplayStatus ? (
          <motion.div
            animate={{
              boxShadow: [
                `inset 0px 0px 5px 0px rgba(255,255,255,0.3)`,
                `inset 0px 0px 10px 2px rgba(255,255,255,0.3)`,
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className={cn(
              "flex px-[8px] h-[29px] justify-center items-center gap-[5px] rounded-[20px] select-none",
              ftoStatusDisplayColor
            )}
          >
            <div className="rounded-full bg-current w-2 h-2"></div>
            <span className="text-ss text-current xs:text-xs">
              {ftoStatusDisplayStatus}
            </span>
          </motion.div>
        ) : (
          <Skeleton className="rounded-full h-[30px] w-[100px] bg-white/40" />
        )}
        {isValidated && (
          <motion.div
            animate={{
              boxShadow: [
                `inset 0px 0px 5px 0px rgba(255,255,255,0.3)`,
                `inset 0px 0px 10px 2px rgba(255,255,255,0.3)`,
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className={cn(
              "flex px-[8px] h-[29px] justify-center items-center gap-[5px] rounded-[20px]  bg-[#4bbdea58] text-white select-none"
            )}
          >
            <div className="rounded-full bg-current w-2 h-2"></div>
            <span className="text-ss  text-current">Validated</span>
          </motion.div>
        )}
      </div>
    );
  }
);

export default ProjectStatus;
