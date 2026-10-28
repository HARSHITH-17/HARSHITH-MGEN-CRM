import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SEED_CUSTOMERS } from "@/lib/data-provider";
import { validateGstin } from "@/lib/calculations";

export async function GET() {
  try {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("@")) {
      const customers = await prisma.customer.findMany({
        take: 100,
        orderBy: { id: "desc" },
        include: { contacts: true },
      });
      if (customers.length > 0) {
        return NextResponse.json({ success: true, customers });
      }
    }
  } catch {
    // Fall back to seed data for read operations
  }
  return NextResponse.json({ success: true, customers: SEED_CUSTOMERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.companyName) {
      return NextResponse.json({ success: false, error: "Company name is required." }, { status: 400 });
    }

    if (body.gstNumber) {
      const gstCheck = validateGstin(body.gstNumber);
      if (!gstCheck.valid) {
        return NextResponse.json({ success: false, error: gstCheck.error }, { status: 400 });
      }
      body.gstNumber = gstCheck.formatted;
    }

    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Database connection is not configured. Records cannot be saved without PostgreSQL." },
        { status: 503 }
      );
    }

    try {
      const created = await prisma.customer.create({
        data: {
          companyName: body.companyName,
          customerCode: body.customerCode || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          customerType: body.customerType || "Commercial",
          contactName: body.contactName,
          contactDesignation: body.contactDesignation,
          phone: body.phone,
          email: body.email,
          city: body.city || "Bengaluru",
          state: body.state || "Karnataka",
          gstNumber: body.gstNumber,
          productsUsed: body.productsUsed,
          annualBusinessPotential: Number(body.annualBusinessPotential) || null,
          priority: body.priority || "High",
          status: body.status || "Active",
          renewalDate: body.renewalDate,
          assignedSalesEngineer: body.assignedSalesEngineer || "Harshith S",
        },
      });
      return NextResponse.json({ success: true, customer: created, storage: "database" });
    } catch (dbErr: unknown) {
      const detail = dbErr instanceof Error ? dbErr.message : "Database write failed";
      return NextResponse.json(
        { success: false, error: `Failed to save customer: ${detail}` },
        { status: 503 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Creation error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


