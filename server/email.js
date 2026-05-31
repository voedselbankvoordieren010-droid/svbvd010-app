await transporter.verify();
console.log("SMTP verified");
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  logger: true,
  debug: true
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
