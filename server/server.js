import "dotenv/config";
import fs from "fs";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./email.js";

console.log(".env exists:", fs.existsSync(".env"));
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_FROM =", process.env.SMTP_FROM);
console.log("SUPABASE_URL =", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY =", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));

const notificationClient = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      persistSession: false,
    },
  }
);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  try {
    const info = await sendEmail({ to, subject, text, html });
    res.json({ ok: true, messageId: info.messageId, envelope: info.envelope });
  } catch (error) {
    console.error("SMTP send error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post("/send-notification", async (req, res) => {
  const { user_auth_id, bericht, gelezen = false } = req.body;

  if (!user_auth_id || !bericht) {
    return res.status(400).json({ ok: false, error: "user_auth_id and bericht are required" });
  }

  try {
    const { error } = await notificationClient
      .from("notifications")
      .insert({ user_auth_id, bericht, gelezen });

    if (error) {
      console.error("Notification insert failed:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Notification API error:", error);
    res.status(500).json({ ok: false, error: error.message || String(error) });
  }
});

const port = Number(process.env.EMAIL_PORT || 3001);
app.listen(port, () => {
  console.log(`SMTP server listening on http://localhost:${port}`);
});
