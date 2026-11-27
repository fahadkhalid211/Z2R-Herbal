import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "@/lib/logger";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  withLogo?: boolean;
}

let transport: Transporter | null | undefined;

export type SmtpSecurity = "ssl" | "starttls";

export function smtpSettings(env: Record<string, string | undefined> = process.env) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURITY } = env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  const port = Number(SMTP_PORT ?? 465);
  const security: SmtpSecurity =
    SMTP_SECURITY?.toLowerCase() === "starttls" || (!SMTP_SECURITY && port === 587) ? "starttls" : "ssl";
  return {
    host: SMTP_HOST,
    port,
    secure: security === "ssl",
    requireTLS: security === "starttls",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    security,
  };
}

function getTransport(): Transporter | null {
  if (transport !== undefined) return transport;
  const settings = smtpSettings();
  if (!settings) {
    transport = null;
    return transport;
  }
  const { host, port, secure, requireTLS, auth } = settings;
  transport = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS,
    auth,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

export const adminInbox = (): string | undefined =>
  process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ORDER_EMAIL_TO ?? process.env.SMTP_USER;

export const supportInbox = adminInbox;

const LOGO_PATH = path.join(process.cwd(), "public", "brand", "logo-email.png");

export async function sendMail(mail: Mail, override?: Transporter): Promise<boolean> {
  const t = override ?? getTransport();
  if (!t) {
    logger.warn("Email not sent: SMTP is not configured", { subject: mail.subject });
    return false;
  }
  const { withLogo, ...message } = mail;
  try {
    const info = await t.sendMail({
      from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
      ...message,
      ...(withLogo && {
        attachments: [{ filename: "z2r-herbal.png", path: LOGO_PATH, cid: "z2r-logo" }],
      }),
    });
    const accepted = (info as { accepted?: unknown[] }).accepted;
    if (Array.isArray(accepted) && accepted.length === 0) {
      logger.error("Email was not accepted by the SMTP server", { subject: mail.subject });
      return false;
    }
    return true;
  } catch (error) {
    logger.error("Email could not be sent", { error, subject: mail.subject });
    return false;
  }
}

export async function verifySmtp(): Promise<{ ok: boolean; error?: string }> {
  const t = getTransport();
  if (!t) return { ok: false, error: "SMTP is not configured" };
  try {
    await t.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export function emailHtml(title: string, lines: string[]): string {
  const body = lines
    .map((line) => (line === "" ? "<br>" : `<p style="margin:0 0 6px">${escape(line)}</p>`))
    .join("");
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0e1a12;max-width:560px">
<h2 style="font-family:Georgia,serif;color:#012d17;margin:0 0 16px">${escape(title)}</h2>${body}
<p style="margin-top:24px;color:#3d4a40;font-size:13px">Z2R Herbal · Pure Herbal Hair Care</p></div>`;
}
