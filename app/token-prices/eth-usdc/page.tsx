// app/token-prices/eth-usdc/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Contract,
  WebSocketProvider,
  JsonRpcProvider,
  formatEther,
  formatUnits,
} from "ethers";
import { PriceDisplay } from "@/app/components/eth/PriceDisplay";

// Uniswap V3 ETH/USDC Pool Contract (Ethereum)
const POOL_ADDRESS = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";

// Minimal ABI for the pool contract
const POOL_ABI = [
  "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
];

// Helper function to calculate price from sqrtPriceX96
function calculatePrice(sqrtPriceX96: bigint): number {
  const decimalsToken0: number = 6; // USDC decimals
  const decimalsToken1: number = 18; // ETH decimals
  const Q192 = 2n ** 192n;

  const numerator = sqrtPriceX96 * sqrtPriceX96;
  const rawPrice = Number(numerator) / Number(Q192);
  const decimalAdjustment = decimalsToken0 - decimalsToken1;
  const price = rawPrice * Math.pow(10, decimalAdjustment);
  const priceUsdcPerEth = 1 / price;

  // Raw price as a floating number (token1/token0)

  // Adjust for token decimals

  //   console.log("Raw price (token1/token0):", rawPrice);
  //   console.log("Human-readable price (token1/token0):", humanPrice);
  //   console.log("Price (USDC per ETH):", priceUsdcPerEth);

  return priceUsdcPerEth;
}
interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  ethAmount: number;
  usdcAmount: number;
  timestamp: string;
}
const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_TRANSACTIONS = 10; // Maximum number of transactions to store

export default function EthUsdcPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchInitialPrice = async () => {
    try {
      console.log("Fetching initial price...");

      const response = await fetch("/api/rpc-url");
      const { httpUrl } = await response.json();
      const httpProvider = new JsonRpcProvider(httpUrl);

      // console.log("Created HTTP provider");
      const initialPool = new Contract(POOL_ADDRESS, POOL_ABI, httpProvider);

      // console.log("Fetching slot0 data...");
      const slot0 = await initialPool.slot0();
      // console.log("Slot0 data:", slot0);

      const initialPrice = calculatePrice(slot0.sqrtPriceX96);
      // console.log("Initial price:", initialPrice);

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
      console.log("Setting up ETH WebSocket connection...");
      const response = await fetch("/api/rpc-url");
      const { wsUrl } = await response.json();
      wsProvider = new WebSocketProvider(wsUrl);
      // Monitor connection status through provider events
      wsProvider.on("network", (newNetwork, oldNetwork) => {
        if (!oldNetwork) {
          console.log("ETH WebSocket connected to network:", newNetwork.name);
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
      pool.on("Swap", (_, __, amount0, amount1, sqrtPriceX96) => {
        console.log(
          "WETH Swap event received:",
          amount0,
          amount1,
          sqrtPriceX96
        );
        const newPrice = calculatePrice(sqrtPriceX96);
        console.log("New ETH price from swap:", newPrice);
        setPrice(newPrice);
        setLastUpdate(new Date());
        // Process swap transaction
        const ethAmount = Math.abs(Number(formatEther(amount1)));
        const usdcAmount = Math.abs(Number(formatUnits(amount0, 6)));
        const newTransaction: Transaction = {
          id: `${Date.now()}-${Math.random()}`,
          type: amount1 > 0n ? "SELL" : "BUY",
          ethAmount,
          usdcAmount,
          timestamp: new Date().toISOString(),
        };
        console.log("New transaction:", newTransaction);

        setTransactions((prevTx) => {
          const updatedTx = [newTransaction, ...prevTx].slice(
            0,
            MAX_TRANSACTIONS
          );
          return updatedTx;
        });
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
      title="Ethereum"
      price={price}
      transactions={transactions}
      lastUpdate={lastUpdate}
      isConnected={isConnected}
      error={error}
    />
  );
}
