import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  ethAmount: number;
  usdcAmount: number;
  timestamp: string;
}

type PriceDisplayProps = {
  title: string;
  price: number | null;
  lastUpdate: Date | null;
  isConnected: boolean;
  error: string | null;
  transactions?: Transaction[];
};

export const PriceDisplay = ({
  title,
  price,
  lastUpdate,
  isConnected,
  error,
  transactions = [],
}: PriceDisplayProps) => {
  const previousPrice = useRef<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(
    null
  );
  useEffect(() => {
    if (price !== null && previousPrice.current !== null) {
      setPriceDirection(price > previousPrice.current ? "up" : "down");
    }
    previousPrice.current = price;
  }, [price]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start p-4 space-y-8 bg-black text-white">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">{title}</h2>

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                <p className="text-sm mt-2">
                  {isConnected
                    ? "Attempting to recover..."
                    : "Attempting to reconnect..."}
                </p>
              </AlertDescription>
            </Alert>
          ) : !price ? (
            <>
              <div className="space-y-4">
                <Skeleton className="h-24 w-full bg-gray-800" />
                <Skeleton className="h-4 w-48 mx-auto bg-gray-800" />
              </div>

              <Card className="bg-black border-gray-800 mt-8">
                <CardHeader>
                  <Skeleton className="h-8 w-48 bg-gray-800" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Header Skeleton */}
                    <div className="flex gap-4 pb-4">
                      <Skeleton className="h-4 w-20 bg-gray-800" />
                      <Skeleton className="h-4 w-24 bg-gray-800" />
                      <Skeleton className="h-4 w-24 bg-gray-800" />
                      <Skeleton className="h-4 w-32 bg-gray-800" />
                    </div>

                    {/* Rows Skeleton */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 py-4">
                        <Skeleton className="h-4 w-20 bg-gray-800" />
                        <Skeleton className="h-4 w-24 bg-gray-800" />
                        <Skeleton className="h-4 w-24 bg-gray-800" />
                        <Skeleton className="h-4 w-32 bg-gray-800" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-9xl font-black tracking-tighter">
                    $
                    {price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {priceDirection && (
                    <div className="flex items-center">
                      {priceDirection === "up" ? (
                        <ArrowUp className="w-12 h-12 text-green-500" />
                      ) : (
                        <ArrowDown className="w-12 h-12 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  {lastUpdate && (
                    <span>Last updated: {lastUpdate.toLocaleString()}</span>
                  )}
                  <span>{isConnected ? "(Live)" : "(Reconnecting...)"}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Transactions Table */}
        {transactions.length > 0 && (
          <Card className="bg-black border-gray-800">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">ETH</TableHead>
                    <TableHead className="text-gray-400">USDC</TableHead>
                    <TableHead className="text-gray-400 text-right">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-gray-800">
                      <TableCell
                        className={
                          tx.type === "BUY"
                            ? "text-green-400 font-bold text-lg"
                            : "text-red-500 font-bold text-lg"
                        }
                      >
                        {tx.type}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {tx.ethAmount.toFixed(4)} ETH
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        ${tx.usdcAmount.toFixed(2)} USDC
                      </TableCell>
                      <TableCell className="text-white font-medium text-right">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
