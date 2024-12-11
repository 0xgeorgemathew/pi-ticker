import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const data = await response.json();

    if (data.status === "1" && data.message === "OK") {
      return NextResponse.json({
        ethusd: data.result.ethusd,
        ethbtc: data.result.ethbtc,
        timestamp: data.result.ethusd_timestamp,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch ETH price" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
