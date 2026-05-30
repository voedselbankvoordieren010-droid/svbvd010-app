import "dotenv/config";
import fs from "fs";
import express from "express";
import cors from "cors";
import { sendEmail } from "./email.js";

console.log(".env exists:", fs.existsSync(".env"));
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_FROM =", process.env.SMTP_FROM);

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

const port = Number(process.env.EMAIL_PORT || 3001);
app.listen(port, () => {
  console.log(`SMTP server listening on http://localhost:${port}`);
});
