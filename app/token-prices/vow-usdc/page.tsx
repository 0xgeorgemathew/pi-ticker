// app/token-prices/eth-usdc/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Contract, WebSocketProvider, JsonRpcProvider } from "ethers";
import { PriceDisplay } from "@/app/components/PriceDisplay";

// Uniswap V3 ETH/USDC Pool Contract (Ethereum)
const POOL_ADDRESS = "0x1e49768714e438e789047f48fd386686a5707db2";

// Minimal ABI for the pool contract
const POOL_ABI = [
  "event Sync(uint112 reserve0, uint112 reserve1)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
];

// Helper function to calculate price from sqrtPriceX96
function calculatePrice(reserve0: bigint, reserve1: bigint): number {
  const decimalsToken0: number = 18; // VOW decimals
  const decimalsToken1: number = 6; // USDT decimals
  // const Q192 = 2n ** 192n;

  const rawPrice = Number(reserve1) / Number(reserve0);
  const decimalAdjustment = decimalsToken0 - decimalsToken1;
  const price = rawPrice * Math.pow(10, decimalAdjustment);
  // const priceUsdcPerEth = 1 / price;

  // Raw price as a floating number (token1/token0)

  // Adjust for token decimals

  //   console.log("Raw price (token1/token0):", rawPrice);
  //   console.log("Human-readable price (token1/token0):", humanPrice);
  //   console.log("Price (USDC per ETH):", priceUsdcPerEth);

  return price;
}

const RECONNECT_DELAY = 5000; // 5 seconds

export default function VowUsdcPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchInitialPrice = async () => {
    try {
      console.log("Fetching initial price...");
      const httpProvider = new JsonRpcProvider(
        process.env.NEXT_PUBLIC_HTTP_RPC_URL_2 || "https://your-http-url"
      );

      console.log("Created HTTP provider");
      console.log("HttpProvider", httpProvider);
      const initialPool = new Contract(POOL_ADDRESS, POOL_ABI, httpProvider);

      console.log("Fetching reserve data...");
      const reserves = await initialPool.getReserves();
      console.log("Reserve data:", reserves);
      const initialPrice = calculatePrice(reserves.reserve0, reserves.reserve1);
      console.log("Initial price:", initialPrice);

      setPrice(initialPrice);
      setLastUpdate(new Date());
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to fetch initial price:", err);
      setError("Failed to fetch initial price");
      return false;
    }
  };

  const setupWebSocket = useCallback(async () => {
    let wsProvider: WebSocketProvider | null = null;
    let pool: Contract | null = null;

    try {
      console.log("Setting up WebSocket connection...");
      wsProvider = new WebSocketProvider(
        process.env.NEXT_PUBLIC_WS_RPC_URL_2 || "ws://your-websocket-url"
      );

      // Monitor connection status through provider events
      wsProvider.on("network", (newNetwork, oldNetwork) => {
        if (!oldNetwork) {
          console.log("WebSocket connected to network:", newNetwork.name);
          setIsConnected(true);
          setError(null);
        }
      });

      // Handle provider errors
      wsProvider.on("error", (error) => {
        console.error("Provider error:", error);
        setIsConnected(false);
        setError("Connection error occurred");
      });

      // Setup contract and event listening
      pool = new Contract(POOL_ADDRESS, POOL_ABI, wsProvider);
      console.log("Contract instance created");

      // Listen for Swap events
      pool.on("Sync", (...args) => {
        console.log("VOW Swap event received:", args);
        const sync = args[1];
        const newPrice = calculatePrice(sync.reserve0, sync.reserve1);
        console.log("New VOW price from swap:", newPrice);
        setPrice(newPrice);
        setLastUpdate(new Date());
      });

      // Periodic connection check
      const intervalId = setInterval(async () => {
        try {
          await wsProvider?.getNetwork();
        } catch (error) {
          console.error("Connection check failed:", error);
          console.log("Connection check failed, reconnecting...");
          clearInterval(intervalId);
          setTimeout(setupWebSocket, RECONNECT_DELAY);
        }
      }, 30000);

      return { wsProvider, pool, intervalId };
    } catch (err) {
      console.error("Failed to setup WebSocket:", err);
      setError("Failed to connect to WebSocket");
      setIsConnected(false);
      setTimeout(setupWebSocket, RECONNECT_DELAY);
      return null;
    }
  }, []);

  useEffect(() => {
    let wsProvider: WebSocketProvider | null = null;
    let pool: Contract | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const initialize = async () => {
      console.log("Initializing...");
      // First fetch initial price
      const priceSuccess = await fetchInitialPrice();

      if (priceSuccess) {
        console.log(
          "Initial price fetched successfully, setting up WebSocket..."
        );
        // Then setup WebSocket
        const connection = await setupWebSocket();
        if (connection) {
          wsProvider = connection.wsProvider;
          pool = connection.pool;
          intervalId = connection.intervalId;
        }
      }
    };

    initialize();

    // Cleanup function
    return () => {
      console.log("Cleaning up...");
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (pool) {
        pool.removeAllListeners();
      }
      if (wsProvider) {
        void wsProvider.destroy();
      }
    };
  }, [setupWebSocket]);

  return (
    <PriceDisplay
      title="VOW"
      price={price}
      lastUpdate={lastUpdate}
      isConnected={isConnected}
      error={error}
    />
  );
}
