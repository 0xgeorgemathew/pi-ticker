"use client";

import { useState, useEffect } from "react";

interface EthPrice {
  ethusd: string;
  ethbtc: string;
  timestamp: string;
}

export default function Home() {
  const [price, setPrice] = useState<EthPrice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch("/api/eth-price");
        const data = await response.json();

        if (response.ok) {
          setPrice(data);
          setError(null);
        } else {
          setError(data.error || "Failed to fetch price");
        }
      } catch {
        setError("Failed to fetch price");
      }
    };

    fetchPrice();
    // Fetch every 1 minute
    const interval = setInterval(fetchPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dark min-h-screen w-full dark:bg-gray-900">
      <main className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white dark:bg-gray-800 w-full h-full min-h-screen flex flex-col items-center justify-center p-8">
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-8 dark:text-white">
            Ethereum Price
          </h2>
          {error ? (
            <p className="text-red-500 text-2xl md:text-4xl">{error}</p>
          ) : !price ? (
            <p className="dark:text-gray-300 text-2xl md:text-4xl">
              Loading...
            </p>
          ) : (
            <div className="space-y-8 text-center">
              <p className="text-6xl md:text-8xl lg:text-9xl font-bold dark:text-white">
                ${parseFloat(price.ethusd).toLocaleString()}
              </p>
              <p className="text-2xl md:text-4xl text-gray-500 dark:text-gray-400">
                BTC: {parseFloat(price.ethbtc).toFixed(6)}
              </p>
              <p className="text-lg md:text-xl text-gray-400 dark:text-gray-500">
                Last updated:{" "}
                {new Date(parseInt(price.timestamp) * 1000).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
