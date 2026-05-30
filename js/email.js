const DEFAULT_EMAIL_API_URL =
  window.EMAIL_API_URL ||
  "http://localhost:3001/send-email";

const PORTAL_URL =
  window.EMAIL_PORTAL_URL ||
  window.location.origin;

function buildHtmlEmail({
  title,
  intro,
  details,
  buttonText,
  buttonUrl
}) {
  return `
    <div style="font-family:Arial,sans-serif;color:#111;background:#f4f5f7;padding:32px;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
        <div style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:24px;color:#111;">${title}</h1>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#4b5563;">${intro}</p>
          ${details ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:24px;color:#334155;font-size:15px;line-height:1.7;">${details}</div>` : ""}
          ${buttonText && buttonUrl ? `<p><a href="${buttonUrl}" style="display:inline-block;padding:12px 22px;background:#2563eb;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:600;">${buttonText}</a></p>` : ""}
          <p style="margin:32px 0 0;font-size:13px;color:#64748b;line-height:1.6;">Je kunt ook altijd inloggen op het cliëntportaal via <a href="${PORTAL_URL}" style="color:#2563eb;">deze link</a>.</p>
        </div>
      </div>
    </div>
  `;
}

export function buildClientStatusHtml({ clientName, statusLabel }) {
  return buildHtmlEmail({
    title: `Je aanvraag is ${statusLabel}`,
    intro: `Beste ${clientName || "cliënt"},`,
    details: `Je aanvraag is <strong>${statusLabel}</strong> door de admin. Je ontvangt nu toegang tot je dossier zodra dit volledig is geactiveerd.`, 
    buttonText: "Naar het cliëntportaal",
    buttonUrl: PORTAL_URL
  });
}

export function buildHelperStatusHtml({ clientName, statusLabel }) {
  return buildHtmlEmail({
    title: `Cliënt ${statusLabel}`,
    intro: `Beste hulpverlener,`,
    details: `Je cliënt <strong>${clientName || "(zonder naam)"}</strong> is <strong>${statusLabel}</strong> door de admin. Controleer je cliëntoverzicht voor de volgende stappen.`, 
    buttonText: "Naar het dashboard",
    buttonUrl: PORTAL_URL
  });
}

export async function sendEmailApi({
  to,
  subject,
  text,
  html
}) {
  if (!to || !subject) {
    throw new Error("Email destination and subject are required.");
  }

  const response = await fetch(DEFAULT_EMAIL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to,
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error || response.statusText;
    throw new Error(`Email send failed: ${message}`);
  }

  return response.json();
}
