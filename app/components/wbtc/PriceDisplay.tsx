//app/components/PriceDisplay.tsx
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  wbtcAmount: number;
  usdtAmount: number;
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
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-b from-gray-900 to-black text-white">
      {error ? (
        <div className="text-center space-y-4">
          <p className="text-red-500 text-4xl">{error}</p>
          <p className="text-gray-400">
            {isConnected
              ? "Attempting to recover..."
              : "Attempting to reconnect..."}
          </p>
        </div>
      ) : !price ? (
        <div className="text-4xl animate-pulse">Loading...</div>
      ) : (
        <>
          <div className="space-y-8 text-center w-full mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">{title}</h2>
            <div className="flex items-center justify-center w-full">
              <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-4xl">
                <p className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  $
                  {price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
            {lastUpdate && (
              <p className="text-lg text-gray-400">
                Last updated: {lastUpdate.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {isConnected ? " (Live)" : " (Reconnecting...)"}
            </p>
          </div>

          {/* Transactions Table */}
          {transactions.length > 0 && (
            <div className="w-full max-w-4xl">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Recent Transactions
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">BTC</TableHead>
                        <TableHead className="text-gray-400">USDT</TableHead>
                        <TableHead className="text-gray-400">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id} className="border-gray-700">
                          <TableCell
                            className={
                              tx.type === "BUY"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {tx.type}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {tx.wbtcAmount.toFixed(4)} WBTC
                          </TableCell>
                          <TableCell className="text-gray-300">
                            ${tx.usdtAmount.toFixed(2)} USDC
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};
