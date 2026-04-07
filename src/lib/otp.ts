import { db } from "@/db";
import { otpsTable } from "@/db/schema/otps";
import { eq, and, gt } from "drizzle-orm";
import { resend, FROM_EMAIL } from "./resend";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(to: string, otp: string, purpose: "register" | "login" | "forgot") {
  const subject = purpose === "register"
    ? "Verify your PitStop Live account"
    : purpose === "forgot" ? "Reset your PitStop Live password" : "Your PitStop Live login OTP";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f1f5f9;border-radius:12px;overflow:hidden">
      <div style="background:#f59e0b;padding:24px;text-align:center">
        <h1 style="margin:0;color:#0f172a;font-size:22px;font-weight:800">⚡ PitStop Live</h1>
      </div>
      <div style="padding:32px">
        <h2 style="margin:0 0 8px;font-size:20px;color:#f1f5f9">
          ${purpose === "register" ? "Verify your email" : purpose === "forgot" ? "Reset password" : "Your login OTP"}
        </h2>
        <p style="margin:0 0 24px;color:#94a3b8;font-size:15px">
          ${purpose === "register"
            ? "Use the code below to verify your email and complete registration."
            : purpose === "forgot" ? "Use the code below to reset your password securely." : "Use the code below to sign in to your account."}
          This code expires in <strong style="color:#f59e0b">10 minutes</strong>.
        </p>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="margin:0 0 8px;font-size:12px;color:#64748b;letter-spacing:2px;text-transform:uppercase">Your OTP</p>
          <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:12px;color:#f59e0b;font-family:monospace">${otp}</p>
        </div>
        <p style="margin:0;color:#64748b;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
}

export async function createAndSendOtp(email: string, purpose: "register" | "login" | "forgot") {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store in database
  await (db as any).insert(otpsTable).values({
    email,
    code: otp,
    purpose,
    expiresAt,
  });

  // Log to console for development visibility
  console.log(`\n--- [DEVELOPMENT OTP] ---\nEmail: ${email}\nOTP:   ${otp}\n------------------------\n`);

  // Send email
  await sendOtpEmail(email, otp, purpose);

  return { success: true, otp };
}

export async function verifyOtp(email: string, code: string, purpose: "register" | "login" | "forgot", deleteAfter: boolean = true): Promise<boolean> {
  const rows = await (db as any)
    .select()
    .from(otpsTable)
    .where(
      and(
        eq(otpsTable.email as any, email),
        eq(otpsTable.code as any, code.trim()),
        eq(otpsTable.purpose as any, purpose),
        gt(otpsTable.expiresAt as any, new Date())
      )
    )
    .limit(1);

  const record = rows[0] as any;

  if (!record) return false;

  if (!record) return false;
  if (!deleteAfter) return true;

  // Cleanup after successful verification
  await (db as any).delete(otpsTable).where(eq(otpsTable.id as any, record.id));
  return true;
}
