import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/data-provider";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching stats";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

