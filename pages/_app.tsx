import "@/styles/globals.css";
import "@/styles/overrides/reactjs-popup.css";
import "@/styles/overrides/toastify.css";
//@ts-ignore
import type { AppProps } from "next/app";
import { Layout } from "@/components/layout";
import { NextLayoutPage } from "@/types/nextjs";
import { WagmiProvider, useWalletClient } from "wagmi";
import { RainbowKitProvider } from "@usecapsule/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import "@usecapsule/rainbowkit/styles.css";
import { NextUIProvider } from "@nextui-org/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { config } from "@/config/wagmi";
import { trpc, trpcQueryClient } from "../lib/trpc";
import { useEffect } from "react";
import { wallet } from "@/services/wallet";
import { Inspector, InspectParams } from "react-dev-inspector";
import { Analytics } from "@vercel/analytics/react";
import { capsuleClient, capsuleModalProps } from "@/config/wagmi/capsualWallet";
import { ApolloProvider } from "@apollo/client";
import { infoClient } from "@/lib/algebra/graphql/clients";
// enableStaticRendering(true)
const queryClient = new QueryClient();

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { data: walletClient } = useWalletClient({
    config,
  });
  useEffect(() => {
    if (walletClient?.account) {
      wallet.initWallet(walletClient);
    }
  }, [walletClient]);
  return children;
};

export default function App({
  Component,
  pageProps,
}: AppProps & {
  Component: NextLayoutPage;
}) {
  const ComponentLayout = Component.Layout || Layout;
  return (
    <trpc.Provider client={trpcQueryClient} queryClient={queryClient}>
      <Analytics></Analytics>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={infoClient}>
            <RainbowKitProvider
              capsule={capsuleClient}
              capsuleIntegratedProps={capsuleModalProps}
            >
              <NextUIProvider>
                <Provider>
                  <Inspector
                    keys={["Ctrl", "Shift", "Z"]}
                    onClickElement={({ codeInfo }: InspectParams) => {
                      if (!codeInfo) {
                        return;
                      }
                      window.open(
                        `cursor://file/${codeInfo.absolutePath}:${codeInfo.lineNumber}:${codeInfo.columnNumber}`,
                        "_blank"
                      );
                    }}
                  ></Inspector>
                  <ComponentLayout className={"[font-family:MEMEP]"}>
                    <Component {...pageProps} />
                  </ComponentLayout>
                </Provider>
                <ToastContainer></ToastContainer>
              </NextUIProvider>
            </RainbowKitProvider>
          </ApolloProvider>{" "}
        </QueryClientProvider>
      </WagmiProvider>
    </trpc.Provider>
  );
}
