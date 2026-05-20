import { query } from "@/lib/db";
import { readEnv } from "@/lib/env";
import type { UserProfile } from "@/lib/types";

type NotifyChannel = "email" | "whatsapp";

async function logNotification(input: {
  userId?: string;
  channel: NotifyChannel;
  recipient: string;
  subject?: string;
  body: string;
  status: "queued" | "sent" | "failed" | "skipped";
  errorMessage?: string;
}) {
  await query(
    `insert into notification_logs (user_id, channel, recipient, subject, body, status, error_message)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.userId ?? null,
      input.channel,
      input.recipient,
      input.subject ?? null,
      input.body,
      input.status,
      input.errorMessage ?? null,
    ],
  );
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const host = readEnv("SMTP_HOST");
  const port = readEnv("SMTP_PORT");
  const user = readEnv("SMTP_USER");
  const pass = readEnv("SMTP_PASS");
  const from = readEnv("SMTP_FROM") || "noreply@jain-coaching.local";

  if (!host || !port) {
    console.info("[notify:email:skipped]", { to, subject });
    return false;
  }

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
    await transport.sendMail({ from, to, subject, text: body });
    return true;
  } catch (e) {
    console.error("[notify:email:error]", e);
    return false;
  }
}

async function sendWhatsApp(toPhone: string, body: string): Promise<boolean> {
  const sid = readEnv("TWILIO_ACCOUNT_SID");
  const token = readEnv("TWILIO_AUTH_TOKEN");
  const from = readEnv("TWILIO_WHATSAPP_FROM");

  if (!sid || !token || !from) {
    console.info("[notify:whatsapp:skipped]", { toPhone });
    return false;
  }

  const normalized = toPhone.replace(/\D/g, "");
  const to = normalized.startsWith("whatsapp:") ? normalized : `whatsapp:+${normalized}`;

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const params = new URLSearchParams({ From: from, To: to, Body: body });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );
    if (!res.ok) {
      const errText = await res.text();
      console.error("[notify:whatsapp:error]", errText);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[notify:whatsapp:error]", e);
    return false;
  }
}

async function notifyUser(
  user: Pick<UserProfile, "id" | "email" | "phone" | "whatsappConsent" | "fullName">,
  subject: string,
  body: string,
) {
  const name = user.fullName?.trim() || "Student";
  const text = `Hi ${name},\n\n${body}\n\n— Jain Coaching`;

  const emailOk = await sendEmail(user.email, subject, text);
  await logNotification({
    userId: user.id,
    channel: "email",
    recipient: user.email,
    subject,
    body: text,
    status: emailOk ? "sent" : "skipped",
  });

  if (user.phone?.trim() && user.whatsappConsent) {
    const waOk = await sendWhatsApp(user.phone, text);
    await logNotification({
      userId: user.id,
      channel: "whatsapp",
      recipient: user.phone,
      body: text,
      status: waOk ? "sent" : "skipped",
    });
  }
}

export async function notifyRegistration(user: UserProfile) {
  await notifyUser(
    user,
    "Welcome to Jain Coaching",
    "Your account has been created successfully. Complete your profile and enroll for tests to get started.",
  );
}

export async function notifyEnrollmentSubmitted(
  user: UserProfile,
  details: string,
) {
  await notifyUser(
    user,
    "Enrollment request received",
    `We received your enrollment request: ${details}. An admin will review it shortly.`,
  );
}

export async function notifyEnrollmentDecision(
  user: UserProfile,
  details: string,
  approved: boolean,
  adminNote?: string | null,
) {
  const status = approved ? "approved" : "rejected";
  const note = adminNote?.trim() ? ` Note: ${adminNote}` : "";
  await notifyUser(
    user,
    `Enrollment ${status}`,
    `Your enrollment (${details}) has been ${status}.${note}`,
  );
}
