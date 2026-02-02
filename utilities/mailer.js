import dotenv from "dotenv";
dotenv.config();
import { createTransport } from "nodemailer";

if (!process.env.EMAIL_USER_NAME || !process.env.EMAIL_PASS) {
  throw new Error("Missing email credentials in environment variables.");
  //   throw new Error("Missing email credentials in environment variables.");
}

const transport = createTransport({
  host: process.env.EMAIL_HOSTING_SERVICE,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER_NAME,
    pass: process.env.EMAIL_PASS,
  },
});

const sendmail = async (mailoption) => {
  try {
    const send = await transport.sendMail(mailoption);
    console.log("Email sent:", send.messageId);
    return send;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("sendmail failed");
  }
};

export default sendmail
