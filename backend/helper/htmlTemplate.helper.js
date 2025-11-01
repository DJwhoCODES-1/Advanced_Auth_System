export const htmlTemplate = ({ email, otp }) => {
  const html = `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f6f8fb;margin:0;padding:0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" 
    style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;
    box-shadow:0 4px 12px rgba(0,0,0,0.05);overflow:hidden;">
    <tr>
      <td style="background:linear-gradient(90deg,#007bff,#00c6ff);padding:20px 40px;">
        <h2 style="color:#ffffff;margin:0;text-align:center;">Verify Your Email</h2>
      </td>
    </tr>

    <tr>
      <td style="padding:40px 40px 20px 40px;text-align:center;">
        <h3 style="color:#333;margin-bottom:10px;">Hello 👋</h3>
        <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:30px;">
          Thank you for signing up with <strong>${email}</strong>!<br/>
          To complete your registration, please use the verification code below:
        </p>

        <div style="background:#f0f4ff;border:1px solid #cfd9ff;display:inline-block;
          padding:12px 24px;border-radius:8px;font-size:28px;letter-spacing:6px;
          color:#003399;font-weight:bold;margin-bottom:30px;">
          ${otp}
        </div>

        <p style="color:#555;font-size:14px;margin-bottom:30px;">
          This code will expire in <strong>10 minutes</strong>. If you didn’t request this, you can safely ignore this email.
        </p>

        <a href="#" 
          style="display:inline-block;background:linear-gradient(90deg,#007bff,#00c6ff);
          color:#fff;text-decoration:none;padding:12px 30px;border-radius:8px;
          font-weight:600;font-size:15px;letter-spacing:0.5px;transition:opacity 0.3s ease;">
          Verify Now
        </a>
      </td>
    </tr>

    <tr>
      <td style="padding:30px 40px;text-align:center;background:#f9f9f9;">
        <p style="color:#888;font-size:12px;margin:0;">
          If the button above doesn't work, you can manually verify using this code:
        </p>
        <p style="color:#007bff;font-size:16px;word-break:break-all;margin:8px 0 0 0;">
          ${otp}
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="color:#aaa;font-size:12px;margin:0;">
          © 2025 Your Company. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return html;
};

export const getVerifyEmailHtml = ({ email, verifyToken }) => {
  const appName = process.env.APP_NAME || "Advanced Authentication";
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const verifyUrl = `${baseUrl.replace(/\/+$/, "")}/token/${encodeURIComponent(
    verifyToken
  )}`;

  const html = `
<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appName} - Verify Your Email</title>
</head>
<body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f6f8fb;margin:0;padding:0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" 
    style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;
    box-shadow:0 4px 12px rgba(0,0,0,0.05);overflow:hidden;">
    
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(90deg,#007bff,#00c6ff);padding:20px 40px;">
        <h2 style="color:#ffffff;margin:0;text-align:center;">Verify Your Email</h2>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:40px 40px 20px 40px;text-align:center;">
        <h3 style="color:#333;margin-bottom:10px;">Hello 👋</h3>
        <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:30px;">
          Thank you for signing up with <strong>${appName}</strong>!<br/>
          Please verify your email address by clicking the button below.
        </p>

        <a href="${verifyUrl}" 
          style="display:inline-block;background:linear-gradient(90deg,#007bff,#00c6ff);
          color:#fff;text-decoration:none;padding:12px 30px;border-radius:8px;
          font-weight:600;font-size:15px;letter-spacing:0.5px;transition:opacity 0.3s ease;">
          Verify Email
        </a>

        <p style="color:#555;font-size:14px;margin-top:30px;">
          This verification link will expire in <strong>10 minutes</strong>.
          If you didn’t create an account, please ignore this email.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:30px 40px;text-align:center;background:#f9f9f9;">
        <p style="color:#888;font-size:12px;margin:0;">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color:#007bff;font-size:12px;word-break:break-all;margin:8px 0 0 0;">
          ${verifyUrl}
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="color:#aaa;font-size:12px;margin:0;">
          © ${new Date().getFullYear()} ${appName}. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return html;
};
