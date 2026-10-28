import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateResetCode, hashResetCode, sendRecoveryEmail } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { usernameOrEmail } = await req.json();

    if (!usernameOrEmail || !usernameOrEmail.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your username or recovery email." },
        { status: 400 }
      );
    }

    const identifier = usernameOrEmail.trim().toLowerCase();
    const code = generateResetCode();
    const codeHash = hashResetCode(code);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let targetEmail = identifier.includes("@") ? identifier : null;

    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("@")) {
      try {
        const admin = await prisma.admin.findFirst({
          where: {
            OR: [
              { username: identifier },
              { recoveryEmail: identifier },
            ],
          },
        });

        if (admin) {
          targetEmail = admin.recoveryEmail || targetEmail;
          await prisma.admin.update({
            where: { id: admin.id },
            data: {
              resetCodeHash: codeHash,
              resetExpiresAt: expiresAt,
              resetAttempts: 0,
            },
          });
        }
      } catch {
        // Fall back to dev mock
      }
    }

    const emailResult = await sendRecoveryEmail(
      targetEmail || "admin@harshithcrm.local",
      code
    );

    return NextResponse.json({
      success: true,
      message: emailResult.success
        ? "Password reset code sent to your email address."
        : `Recovery code generated. (${emailResult.message})`,
      // previewCode is only present in development when SMTP is unconfigured; never in production
      ...(process.env.NODE_ENV !== "production" && emailResult.previewCode
        ? { previewCode: emailResult.previewCode }
        : {}),
      expiresIn: "15 minutes",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error initiating reset";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

