import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.office365.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    ciphers: "SSLv3"
  }
});

export async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject) {
    throw new Error("Missing required email fields: to and subject.");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("SMTP_FROM or SMTP_USER must be configured.");
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return info;
}
