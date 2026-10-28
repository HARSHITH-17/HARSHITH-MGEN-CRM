import crypto from "crypto";
import nodemailer from "nodemailer";
import prisma from "./prisma";

const ITERATIONS = 310000;
const KEY_LEN = 32;
const DIGEST = "sha256";

/**
 * Deterministic password hashing matching app/security.py in the desktop application:
 * Uses PBKDF2-HMAC-SHA256 with 310,000 iterations and 16-byte hex salt.
 */
export function hashPassword(password: string, saltHex?: string): { hash: string; salt: string } {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const saltBuf = Buffer.from(salt, "hex");
  const derivedKey = crypto.pbkdf2Sync(password, saltBuf, ITERATIONS, KEY_LEN, DIGEST);
  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

/**
 * Constant-time comparison for password verification.
 */
export function verifyPassword(password: string, expectedHash: string, saltHex: string): boolean {
  try {
    const { hash } = hashPassword(password, saltHex);
    const hashBuf = Buffer.from(hash, "hex");
    const expectedBuf = Buffer.from(expectedHash, "hex");
    if (hashBuf.length !== expectedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * 6-digit numeric password reset code.
 */
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hashes reset code with SHA-256 for secure DB storage.
 */
export function hashResetCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/**
 * Sends recovery email via nodemailer if SMTP settings exist in environment.
 * If SMTP is unconfigured, returns clean status with preview for local dev testing.
 */
export async function sendRecoveryEmail(
  toEmail: string,
  code: string
): Promise<{ success: boolean; message: string; previewCode?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const from = process.env.SMTP_FROM || "noreply@harshithcrm.com";

  if (!host || !user || !pass) {
    const isDev = process.env.NODE_ENV !== "production";
    return {
      success: false,
      message: "SMTP server is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.",
      // Only expose the raw code in non-production environments for local testing
      previewCode: isDev ? code : undefined,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "HARSHITH MGEN CRM — Password Reset Code",
      text: `Your password reset code is: ${code}\nThis code will expire in 15 minutes.\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">HARSHITH MGEN CRM</h2>
          <p style="color: #475569;">You requested a password reset for your administrator account.</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 15px;">This code will expire in 15 minutes. If you did not request this code, no action is needed.</p>
        </div>
      `,
    });

    return { success: true, message: `Reset code sent successfully to ${toEmail}` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "SMTP transmission failed";
    return {
      success: false,
      message: `Failed to deliver email via SMTP: ${errorMsg}`,
      previewCode: process.env.NODE_ENV !== "production" ? code : undefined,
    };
  }
}

/**
 * Authenticates user against PostgreSQL Admin table.
 * In production, the database must be reachable — no credential bypass is permitted.
 * In development (NODE_ENV=development) a database error results in a clear diagnostic message.
 */
export async function authenticateUser(
  username: string,
  pass: string
): Promise<{ success: boolean; user?: { id: number; username: string; role: string }; error?: string }> {
  const cleanUsername = username.trim().toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("@")) {
    if (isProduction) {
      return { success: false, error: "Database connection is not configured. Contact the system administrator." };
    }
    return { success: false, error: "DATABASE_URL is not set. Configure a PostgreSQL connection in .env to log in." };
  }

  try {
    const adminRecord = await prisma.admin.findUnique({
      where: { username: cleanUsername },
    });

    if (!adminRecord) {
      return { success: false, error: "Invalid username or password." };
    }

    const isValid = verifyPassword(pass, adminRecord.passwordHash, adminRecord.passwordSalt);
    if (!isValid) {
      return { success: false, error: "Invalid username or password." };
    }

    return {
      success: true,
      user: { id: adminRecord.id, username: adminRecord.username, role: "Administrator" },
    };
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : "Unknown database error";
    if (isProduction) {
      return { success: false, error: "Authentication service unavailable. Contact the system administrator." };
    }
    return { success: false, error: `Database connection failed: ${detail}` };
  }
}

