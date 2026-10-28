import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SEED_PIPELINE } from "@/lib/data-provider";

export async function GET() {
  try {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("@")) {
      const leads = await prisma.salesPipeline.findMany({
        take: 100,
        orderBy: { id: "desc" },
      });
      if (leads.length > 0) {
        return NextResponse.json({ success: true, pipeline: leads });
      }
    }
  } catch {
    // Fall back to seed data for read operations
  }
  return NextResponse.json({ success: true, pipeline: SEED_PIPELINE });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.customer) {
      return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Database connection is not configured. Records cannot be saved without PostgreSQL." },
        { status: 503 }
      );
    }

    try {
      const created = await prisma.salesPipeline.create({
        data: {
          customer: body.customer,
          product: body.product || "Fusion 360",
          salesStage: body.salesStage || "Lead",
          estimatedValue: Number(body.estimatedValue) || 0,
          probability: Number(body.probability) || 0,
          expectedSeats: Number(body.expectedSeats) || 1,
          expectedCloseDate: body.expectedCloseDate,
          leadDate: body.leadDate || new Date().toISOString().split("T")[0],
          assignedEmployee: body.assignedEmployee || "Harshith S",
          remarks: body.remarks,
        },
      });
      return NextResponse.json({ success: true, opportunity: created, storage: "database" });
    } catch (dbErr: unknown) {
      const detail = dbErr instanceof Error ? dbErr.message : "Database write failed";
      return NextResponse.json(
        { success: false, error: `Failed to save opportunity: ${detail}` },
        { status: 503 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Creation error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


