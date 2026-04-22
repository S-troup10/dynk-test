// DYNK — Form submission worker
// Deploy to Cloudflare Workers (free tier)
// Requires two environment variables:
//   RESEND_API_KEY  — from resend.com
//   NOTIFY_TO       — your inbox address (e.g. hello@dynk.io)
//
// Setup:
//   1. Sign up at resend.com → get API key → add as Worker secret named RESEND_API_KEY
//   2. Add NOTIFY_TO as a Worker secret (your team's email)
//   3. Verify your sending domain (dynk.io) in the Resend dashboard
//   4. Deploy: `npx wrangler deploy worker/auto-reply.js --name dynk-auto-reply --compatibility-date 2024-01-01`

const ALLOWED_ORIGINS = new Set([
  "https://dynk.io",
  "https://www.dynk.io",
  "http://127.0.0.1:5501",
  "http://localhost:5501",
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // CORS preflight
    if (request.method === "OPTIONS") {
      return cors(new Response(null, { status: 204 }), origin);
    }

    if (request.method !== "POST") {
      return cors(new Response("Method not allowed", { status: 405 }), origin);
    }

    let name, email, wallet, phone, message;
    try {
      ({ name, email, wallet, phone, message } = await request.json());
    } catch {
      return cors(new Response("Bad request", { status: 400 }), origin);
    }

    if (!email || !name) {
      return cors(new Response("Missing fields", { status: 400 }), origin);
    }

    const walletLabel = wallet ? `Founder Wallet ${escHtml(wallet)}` : "a DYNK Founder Wallet";
    const subject     = wallet ? `Founder Wallet ${escHtml(wallet)} Enquiry` : "Founder Wallet Enquiry";

    // Send both emails in parallel
    const [notifyRes, replyRes] = await Promise.all([
      // 1. Notification to DYNK team
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:    "DYNK Website <noreply@dynk.io>",
          to:      env.NOTIFY_TO,
          subject: `[DYNK] New application — ${subject}`,
          reply_to: email,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;padding:40px 24px;">
              <img src="https://dynk.io/media/images/DYNK.png" alt="DYNK" style="height:50px;margin-bottom:32px;" />
              <h2 style="font-size:18px;margin:0 0 24px;">New Founder Wallet Application</h2>
              <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6;">
                <tr><td style="padding:6px 0;color:#666;width:100px;">Name</td><td style="padding:6px 0;"><strong>${escHtml(name)}</strong></td></tr>
                <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${escHtml(email)}" style="color:#111;">${escHtml(email)}</a></td></tr>
                ${phone ? `<tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${escHtml(phone)}</td></tr>` : ""}
                <tr><td style="padding:6px 0;color:#666;">Wallet</td><td style="padding:6px 0;">${wallet ? `#${escHtml(wallet)}` : "Not selected"}</td></tr>
                ${message ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top;">Message</td><td style="padding:6px 0;">${escHtml(message).replace(/\n/g, "<br>")}</td></tr>` : ""}
              </table>
              <p style="font-size:13px;color:#999;margin:32px 0 0;">Reply directly to this email to respond to ${escHtml(name)}.</p>
            </div>
          `,
        }),
      }),

      // 2. Auto-reply to applicant
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Simon at DYNK <contact@dynk.io>",
          to:   email,
          subject: "Got your details — DYNK",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>DYNK</title>
</head>
<body style="margin:0;padding:0;background:#080808;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;min-height:100vh;">
  <tr>
    <td align="center" style="padding:48px 24px;">

      <!-- Card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0f0f0f;border:1px solid rgba(252,252,252,0.08);border-radius:2px;">

        <!-- Top accent line -->
        <tr>
          <td style="height:2px;background:linear-gradient(90deg,transparent,rgba(252,252,252,0.18),transparent);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Header wordmark -->
        <tr>
          <td align="center" style="padding:48px 48px 40px;">
            <span style="font-family:Georgia,serif;font-size:36px;font-weight:400;letter-spacing:0.45em;color:#fcfcfc;text-transform:uppercase;">DYNK</span>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 48px;">
            <div style="height:1px;background:rgba(252,252,252,0.06);"></div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:48px 48px 40px;">

            <!-- Greeting -->
            <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:16px;line-height:1.8;color:#fcfcfc;">Hi ${escHtml(name)},</p>

            <!-- Body text -->
            <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:15px;line-height:1.9;color:rgba(252,252,252,0.7);">
              Just a quick note to say we got your details — thanks for reaching out about ${walletLabel}.
            </p>
            <p style="margin:0 0 20px;font-family:Georgia,serif;font-size:15px;line-height:1.9;color:rgba(252,252,252,0.7);">
              I'll be in touch personally within the next day or two to set up a call and walk you through everything.
            </p>
            <p style="margin:0 0 40px;font-family:Georgia,serif;font-size:15px;line-height:1.9;color:rgba(252,252,252,0.7);">
              In the meantime, feel free to reply here if anything comes to mind.
            </p>

            <!-- Sign-off -->
            <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:15px;line-height:1.7;color:rgba(252,252,252,0.55);">Simon</p>
            <p style="margin:0;font-family:Georgia,serif;font-size:13px;line-height:1.7;color:rgba(252,252,252,0.3);">DYNK</p>

          </td>
        </tr>

        <!-- Bottom divider -->
        <tr>
          <td style="padding:0 48px;">
            <div style="height:1px;background:rgba(252,252,252,0.06);"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:28px 48px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(252,252,252,0.2);">
              dynk.io &nbsp;&middot;&nbsp; OWN IT. GROW IT.
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td>
  </tr>
</table>
</body>
</html>`,
        }),
      }),
    ]);

    const ok = notifyRes.status >= 200 && notifyRes.status < 300
            && replyRes.status  >= 200 && replyRes.status  < 300;

    return cors(new Response(JSON.stringify({ ok }), {
      status: ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    }), origin);
  },
};

function cors(response, origin) {
  const r = new Response(response.body, response);
  if (ALLOWED_ORIGINS.has(origin)) {
    r.headers.set("Access-Control-Allow-Origin", origin);
  }
  r.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  r.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return r;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
