import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SEED_TOURS } from "@/lib/data-provider";
import { calculateTourExpenses } from "@/lib/calculations";

export async function GET() {
  try {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("@")) {
      const tourRows = await prisma.tourManagement.findMany({
        take: 100,
        orderBy: { id: "desc" },
      });
      if (tourRows.length > 0) {
        return NextResponse.json({ success: true, tours: tourRows });
      }
    }
  } catch {
    // Fall back to seed
  }
  return NextResponse.json({ success: true, tours: SEED_TOURS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Server-side deterministic recalculation ensuring policy integrity
    const computed = calculateTourExpenses({
      startDate: body.startDate || body.tourStartDate,
      startTime: body.startTime || body.tourStartTime,
      endDate: body.endDate || body.tourEndDate,
      endTime: body.endTime || body.tourEndTime,
      daRatePerDay: body.daRatePerDay || 750,
      travelExpenses: body.travelExpenses,
      lodgingRatePerDay: body.lodgingRatePerDay,
      lodgingDays: body.lodgingDays,
      lodgingBookedByOffice: body.lodgingBookedByOffice,
      conveyanceExpenses: body.conveyanceExpenses,
      otherExpenses: body.otherExpenses,
      advanceReceived: body.advanceReceived,
    });

    const recordData = {
      employeeName: body.employeeName || "Harshith S",
      branch: body.branch || "Bengaluru HQ",
      group: body.group || "CAM Technical Sales",
      tourStartDate: body.startDate || body.tourStartDate,
      tourStartTime: body.startTime || body.tourStartTime,
      tourEndDate: body.endDate || body.tourEndDate,
      tourEndTime: body.endTime || body.tourEndTime,
      placesToured: body.placesToured,
      companyCustomerVisited: body.companyCustomerVisited || body.customerVisited,
      travelExpenses: Number(body.travelExpenses) || 0,
      lodgingRatePerDay: Number(body.lodgingRatePerDay) || 0,
      lodgingDays: Number(body.lodgingDays) || 0,
      lodgingBookedByOffice: body.lodgingBookedByOffice ? "Yes" : "No",
      conveyanceExpenses: Number(body.conveyanceExpenses) || 0,
      otherExpenses: Number(body.otherExpenses) || 0,
      daRatePerDay: computed.daRatePerDay,
      tourDurationHours: computed.durationHours,
      daDays: computed.daDays,
      daAmount: computed.daAmount,
      advanceReceived: Number(body.advanceReceived) || 0,
      totalExpenses: computed.totalExpenses,
      dueToSelf: computed.dueToSelf,
      refund: computed.refund,
      authorisedBy: body.authorisedBy || "Pending Review",
      remarks: body.remarks || "Submitted via HARSHITH MGEN CRM Web Portal",
    };

    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Database connection is not configured. Tour claims cannot be saved without PostgreSQL.", computed },
        { status: 503 }
      );
    }

    try {
      const created = await prisma.tourManagement.create({
        data: recordData,
      });
      return NextResponse.json({ success: true, tour: created, computed, storage: "database" });
    } catch (dbErr: unknown) {
      const detail = dbErr instanceof Error ? dbErr.message : "Database write failed";
      return NextResponse.json(
        { success: false, error: `Failed to save tour claim: ${detail}`, computed },
        { status: 503 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving tour claim";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

