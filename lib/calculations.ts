/**
 * Deterministic calculation engine for HARSHITH MGEN CRM.
 * Ported directly from app/calculations.py and app/gst_lookup.py.
 */

export interface TourExpenseInput {
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  daRatePerDay?: number;
  travelExpenses?: number;
  lodgingRatePerDay?: number;
  lodgingDays?: number;
  lodgingBookedByOffice?: boolean;
  conveyanceExpenses?: number;
  otherExpenses?: number;
  advanceReceived?: number;
}

export interface TourExpenseResult {
  durationHours: number;
  daDays: number;
  daRatePerDay: number;
  daAmount: number;
  lodgingTotal: number;
  totalExpenses: number;
  dueToSelf: number;
  refund: number;
}

/**
 * DA Days rule:
 * Standard ₹750/day policy.
 * Full 24-hour blocks + remainder.
 * Remainder <= 12 hours is counted as 0.5 day (half-day).
 * Remainder > 12 hours is counted as 1.0 day (full day).
 */
export function calculateDaDays(durationHours: number): number {
  const duration = Math.max(0, Number(durationHours) || 0);
  const fullDays = Math.floor(duration / 24);
  const remainder = duration - fullDays * 24;
  const remainderDays = remainder > 12 ? 1.0 : remainder > 0 ? 0.5 : 0.0;
  return fullDays + remainderDays;
}

/**
 * Parses date + time string safely.
 */
function parseDateTime(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const cleanDate = dateStr.trim();
  const cleanTime = (timeStr || "00:00").trim();
  
  // Try ISO or common formats
  const combined = `${cleanDate}T${cleanTime.length === 5 ? cleanTime + ":00" : cleanTime}`;
  const dt = new Date(combined);
  if (!isNaN(dt.getTime())) return dt;

  const fallback = new Date(`${cleanDate} ${cleanTime}`);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Computes tour expense totals, DA amount, and reimbursement due.
 */
export function calculateTourExpenses(input: TourExpenseInput): TourExpenseResult {
  const startDt = parseDateTime(input.startDate, input.startTime);
  const endDt = parseDateTime(input.endDate, input.endTime);

  let durationHours = 0;
  if (startDt && endDt && endDt.getTime() >= startDt.getTime()) {
    durationHours = Math.max(0, (endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60));
  }

  const daRate = Number(input.daRatePerDay) || 750;
  const daDays = calculateDaDays(durationHours);
  const daAmount = daDays * daRate;

  const travel = Number(input.travelExpenses) || 0;
  const lodgingRate = Number(input.lodgingRatePerDay) || 0;
  const lodgingDays = Number(input.lodgingDays) || 0;
  const lodgingTotal = input.lodgingBookedByOffice ? 0 : lodgingRate * lodgingDays;
  const conveyance = Number(input.conveyanceExpenses) || 0;
  const other = Number(input.otherExpenses) || 0;

  const total = travel + lodgingTotal + conveyance + other + daAmount;
  const advance = Number(input.advanceReceived) || 0;

  return {
    durationHours: Math.round(durationHours * 100) / 100,
    daDays,
    daRatePerDay: daRate,
    daAmount: Math.round(daAmount * 100) / 100,
    lodgingTotal: Math.round(lodgingTotal * 100) / 100,
    totalExpenses: Math.round(total * 100) / 100,
    dueToSelf: Math.round(Math.max(total - advance, 0) * 100) / 100,
    refund: Math.round(Math.max(advance - total, 0) * 100) / 100,
  };
}

/**
 * Validates 15-character Indian Goods and Services Tax Identification Number (GSTIN).
 * Format: 2 digits (state code) + 5 letters (PAN) + 4 digits + 1 letter + 1 char (1-9A-Z) + 'Z' + 1 checksum char.
 */
export function validateGstin(gstin: string): { valid: boolean; formatted: string; error?: string } {
  const formatted = (gstin || "").replace(/\s+/g, "").toUpperCase();
  if (!formatted) {
    return { valid: false, formatted: "", error: "GSTIN cannot be empty" };
  }
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  if (!regex.test(formatted)) {
    return {
      valid: false,
      formatted,
      error: "Invalid GSTIN format. Expected 15 characters (e.g., 29ABCDE1234F1Z5)",
    };
  }
  return { valid: true, formatted };
}

/**
 * Safely evaluates simple amount expressions (e.g., "1200 + 450", "2 * 750").
 */
export function evaluateAmountExpression(expression: string | number): number {
  if (expression === null || expression === undefined) return 0;
  if (typeof expression === "number") return expression;
  const clean = String(expression).trim();
  if (!clean) return 0;

  // Only allow digits, decimals, +, -, *, /, (, ) and whitespace
  if (!/^[0-9+\-*/().\s]+$/.test(clean)) {
    throw new Error("Invalid characters in expression. Use numbers and +, -, *, / only.");
  }

  try {
    const result = Function(`"use strict"; return (${clean})`)();
    if (typeof result !== "number" || !isFinite(result)) {
      throw new Error("Evaluation did not return a valid finite number");
    }
    return Math.round(result * 100) / 100;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Calculation error";
    throw new Error(`Failed to evaluate amount: ${message}`);
  }
}

/**
 * Computes weighted opportunity value.
 */
export function calculateWeightedValue(estimatedValue: number, probabilityPercent: number): number {
  const val = Number(estimatedValue) || 0;
  const prob = Number(probabilityPercent) || 0;
  return Math.round((val * (prob / 100)) * 100) / 100;
}

/**
 * Formats Indian Currency (₹) nicely with standard Indian commas.
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
