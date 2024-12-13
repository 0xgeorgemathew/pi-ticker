// app/api/rpc-urls/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    httpUrl: process.env.HTTP_RPC_URL,
    wsUrl: process.env.WSS_RPC_URL,
    httpUrlWld: process.env.HTTP_WLD_RPC_URL,
    wsurlWld: process.env.WSS_WLD_RPC_URL,
  });
}
