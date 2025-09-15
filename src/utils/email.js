import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid";

export const sendMail = async (options) => {
  try {
    const transporter = nodemailer.createTransport(
      sgTransport({
        apiKey: process.env.SENDGRID_API_KEY,  
      })
    );

    const emailOptions = {
      from:  `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
  trackingSettings: {
    clickTracking: { enable: false, enableText: false },
    openTracking: { enable: false },
  },
    };

    await transporter.sendMail(emailOptions);
    console.log(" Email sent successfully to:", options.email);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Email could not be sent");
  }
};
