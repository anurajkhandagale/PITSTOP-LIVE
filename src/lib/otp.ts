import { db } from "@/db";
import { otpsTable } from "@/db/schema/otps";
import { eq, and, gt } from "drizzle-orm";

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
  console.log(`\n--- [CAPTCHA] ---\nEmail: ${email}\nCode:   ${otp}\n------------------------\n`);

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
