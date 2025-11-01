import { createTransport } from "nodemailer";

const sendMail = async ({ email, subject, html }) => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: EMAIL_USER || "",
      pass: EMAIL_PASS || "",
    },
  });

  await transport.sendMail({
    from: EMAIL_USER || "",
    to: email,
    subject,
    html,
  });
};

export default sendMail;
