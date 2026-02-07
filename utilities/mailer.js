import dotenv from "dotenv";
dotenv.config();
import { createTransport } from "nodemailer";

if (!process.env.EMAIL_USER_NAME || !process.env.EMAIL_PASS) {
  throw new Error("Missing email credentials in environment variables.");
  //   throw new Error("Missing email credentials in environment variables.");
}

const secure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === "true"
  : true;

const transport = createTransport({
  host: process.env.EMAIL_HOSTING_SERVICE,
  port: process.env.EMAIL_PORT
    ? Number(process.env.EMAIL_PORT)
    : secure
      ? 465
      : 587,
  secure,
  auth: {
    user: process.env.EMAIL_USER_NAME,
    pass: process.env.EMAIL_PASS,
  },
  // sensible defaults for timeouts so sendMail doesn't hang indefinitely
  connectionTimeout: process.env.EMAIL_CONN_TIMEOUT
    ? Number(process.env.EMAIL_CONN_TIMEOUT)
    : 10000,
  greetingTimeout: process.env.EMAIL_GREETING_TIMEOUT
    ? Number(process.env.EMAIL_GREETING_TIMEOUT)
    : 5000,
  socketTimeout: process.env.EMAIL_SOCKET_TIMEOUT
    ? Number(process.env.EMAIL_SOCKET_TIMEOUT)
    : 10000,
});

const sendmail = async (mailoption) => {
  try {
    const send = await transport.sendMail(mailoption);
    console.log("Email sent:", send.messageId);
    return send;
  } catch (error) {
    console.error("Failed to send email:", error);
    // rethrow original error so callers can inspect error.code (e.g. ETIMEDOUT)
    throw error;
  }
};

export default sendmail;
