import nodemailer from "nodemailer"

export const sendEmail = async (to: string, subject: string, html: string) => {
  console.log("📤 Отправка письма:");
  console.log("TO:", to);
  console.log("SUBJECT:", subject);

  if (!to || !to.includes("@")) {
    throw new Error("❌ Недопустимый email-получатель: " + to);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"BiscuitBoard" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};
