//app/page.tsx
"use client";

import { PriceSlider } from "./components/PriceSlider";
import EthUsdcPrice from "./token-prices/eth-usdc/page";
import BtcUsdcPrice from "./token-prices/btc-usdc/page";
import WldUsdcPrice from "./token-prices/wld-usdc/page";

export default function Home() {
  const pages = [
    { component: <EthUsdcPrice />, key: "eth-usdc" },
    { component: <BtcUsdcPrice />, key: "btc-usdc" },
    { component: <WldUsdcPrice />, key: "wld-usdc" },
  ];

  return (
    <div className="min-h-screen w-full bg-black">
      <PriceSlider pages={pages} />
    </div>
  );
}
