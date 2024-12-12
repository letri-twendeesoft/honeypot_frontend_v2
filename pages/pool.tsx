import CreatePoolForm from "@/components/algebra/create-pool/CreatePoolForm";
import CardContianer from "@/components/CardContianer/CardContianer";
import { Layout } from "@/components/layout";
import LoadingDisplay from "@/components/LoadingDisplay/LoadingDisplay";
import { LPCard } from "@/components/LPCard";
import { Swap } from "@/components/swap";
import { liquidity } from "@/services/liquidity";
import { wallet } from "@/services/wallet";
import { Tab, Tabs } from "@nextui-org/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { CreateAquaberaVault } from "@/components/Aquabera/create-vault/CreateAquaberaVault";

const Pool = observer(() => {
  const isInit = wallet.isInit && liquidity.isInit;
  useEffect(() => {
    if (!wallet.isInit) {
      return;
    }

    liquidity.initPool();
  }, [wallet.isInit]);

  return (
    <div>
      {isInit ? (
        <Tabs>
          <Tab key="aquabera" title="Create Aquabera Vault">
            <div className="relative w-full flex justify-center content-center items-center">
              <CreateAquaberaVault />
            </div>
          </Tab>
          <Tab key="algebra" title="Create AlgebraPool">
            <div className="relative w-full flex justify-center content-center items-center">
              <CreatePoolForm />
            </div>
          </Tab>
        </Tabs>
      ) : (
        <LoadingDisplay />
      )}
    </div>
  );
});

export default Pool;
