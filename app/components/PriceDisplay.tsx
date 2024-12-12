type PriceDisplayProps = {
  title: string;
  price: number | null;
  lastUpdate: Date | null;
  isConnected: boolean;
  error: string | null;
};

export const PriceDisplay = ({
  title,
  price,
  lastUpdate,
  isConnected,
  error,
}: PriceDisplayProps) => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-black text-white">
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
        <div className="space-y-8 text-center w-full">
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
      )}
    </div>
  );
};
