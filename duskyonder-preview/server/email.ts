/**
 * email.ts — Resend transactional email helper
 *
 * Usage:
 *   import { sendEmail } from "./email";
 *   await sendEmail({ from, to, subject, html });
 *
 * Requires RESEND_API_KEY environment variable.
 * Get your key at: https://resend.com/api-keys
 */

import { Resend } from "resend";
import { ENV } from "./_core/env";

// Singleton — reused across requests
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!ENV.resendApiKey) {
      throw new Error(
        "[email] RESEND_API_KEY is not set. " +
          "Add it to your .env file (local) or Vercel Environment Variables (production)."
      );
    }
    _resend = new Resend(ENV.resendApiKey);
  }
  return _resend;
}

export interface SendEmailOptions {
  /** Sender address — must be from a domain verified in your Resend account.
   *  During development you can use: onboarding@resend.dev (Resend's test address).
   *  For production use: noreply@duskyonder.com (after verifying the domain). */
  from: string;
  /** Recipient address */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** HTML body */
  html: string;
  /** Optional plain-text fallback */
  text?: string;
  /** Optional reply-to address (e.g. the customer's email) */
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send a transactional email via Resend.
 * Returns { success: true, id } on success or { success: false, error } on failure.
 * Never throws — callers can check the result without try/catch.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: opts.from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: opts.replyTo,
    });

    if (error) {
      console.error("[email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    console.log("[email] Sent successfully. id:", data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Unexpected error:", message);
    return { success: false, error: message };
  }
}

// ── HTML template for contact form submissions ───────────────────────────────
export function buildContactEmailHtml(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const escaped = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:#175C40;padding:28px 40px;">
            <p style="margin:0;font-size:18px;font-weight:600;color:#fff;letter-spacing:0.04em;">DUSKYONDER</p>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:0.08em;text-transform:uppercase;">New Contact Form Submission</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:20px;border-bottom:1px solid #f0ede8;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#999;">From</p>
                  <p style="margin:0;font-size:15px;color:#1a1a1a;">${escaped(opts.name)}</p>
                  <a href="mailto:${escaped(opts.email)}" style="font-size:13px;color:#175C40;text-decoration:none;">${escaped(opts.email)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 0;border-bottom:1px solid #f0ede8;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#999;">Subject</p>
                  <p style="margin:0;font-size:15px;color:#1a1a1a;">${escaped(opts.subject)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top:20px;">
                  <p style="margin:0 0 12px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#999;">Message</p>
                  <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${escaped(opts.message)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;background:#faf9f7;border-top:1px solid #f0ede8;">
            <p style="margin:0;font-size:11px;color:#aaa;">This message was sent via the contact form at duskyonder.com. Reply directly to this email to respond to ${escaped(opts.name)}.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
