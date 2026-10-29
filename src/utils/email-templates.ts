const APP_NAME = process.env.APP_NAME || 'Nest Boiler Plate';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@example.com';
const LOGO_URL = process.env.EMAIL_LOGO_URL || '';

const BASE_STYLES = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f0ef;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #f5f0ef;
      padding: 32px 16px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e8dedd;
    }

    /* ── Header ── */
    .header {
      background-color: #483733;
      padding: 28px 20px;
      text-align: center;
    }
    .header img {
      max-width: 110px;
      height: auto;
    }

    /* ── Body ── */
    .content {
      padding: 40px 32px;
      text-align: center;
    }
    .content h1 {
      font-size: 22px;
      font-weight: 700;
      color: #483733;
      margin-bottom: 12px;
    }
    .content .subtitle {
      font-size: 15px;
      color: rgba(72, 55, 51, 0.7);
      margin-bottom: 28px;
      line-height: 1.6;
    }

    /* ── Detail Card ── */
    .detail-card {
      background-color: #faf7f6;
      border: 1px solid #e8dedd;
      border-left: 4px solid #483733;
      border-radius: 6px;
      padding: 20px 24px;
      text-align: left;
      margin: 0 auto 28px;
    }
    .detail-card p {
      font-size: 14px;
      color: #483733;
      margin: 0;
      padding: 7px 0;
      border-bottom: 1px solid #e8dedd;
      line-height: 1.5;
    }
    .detail-card p:last-child {
      border-bottom: none;
    }
    .detail-card strong {
      color: #483733;
      font-weight: 700;
    }

    /* ── OTP Block ── */
    .otp-wrapper {
      margin: 0 auto 28px;
      text-align: center;
    }
    .otp-label {
      font-size: 13px;
      color: rgba(72, 55, 51, 0.6);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .otp {
      display: inline-block;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      background-color: #483733;
      padding: 14px 32px;
      border-radius: 8px;
      letter-spacing: 10px;
    }
    .otp-expiry {
      font-size: 12px;
      color: rgba(72, 55, 51, 0.55);
      margin-top: 10px;
    }

    /* ── Credential Block ── */
    .credential-card {
      background-color: #faf7f6;
      border: 1px solid #e8dedd;
      border-radius: 6px;
      padding: 20px 24px;
      text-align: left;
      margin: 0 auto 28px;
    }
    .credential-card p {
      font-size: 14px;
      color: #483733;
      margin: 0;
      padding: 7px 0;
      border-bottom: 1px solid #e8dedd;
    }
    .credential-card p:last-child { border-bottom: none; }
    .credential-card strong { color: #483733; font-weight: 700; }
    .credential-card .value {
      font-family: monospace;
      background: #ede8e7;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 14px;
    }

    /* ── CTA Button ── */
    .cta-btn {
      display: inline-block;
      background-color: #483733;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 32px;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 28px;
    }

    /* ── Sign-off ── */
    .signoff {
      font-size: 14px;
      color: rgba(72, 55, 51, 0.7);
      line-height: 1.7;
    }
    .signoff strong {
      color: #483733;
    }

    /* ── Divider ── */
    .divider {
      border: none;
      border-top: 1px solid #e8dedd;
      margin: 24px 0;
    }

    /* ── Footer ── */
    .footer {
      background-color: #483733;
      padding: 24px 20px;
      text-align: center;
    }
    .footer img {
      max-width: 90px;
      height: auto;
      margin-bottom: 14px;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-links a {
      color: rgba(255,255,255,0.75);
      text-decoration: none;
      margin: 0 10px;
      font-size: 13px;
    }
    .footer-links a:hover { color: #ffffff; }
    .footer p {
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      line-height: 1.7;
      margin: 0;
    }
  </style>
`;

/** Wrap content in the shared header + footer shell */
function layout(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${BASE_STYLES}
</head>
<body>
  <div class="wrapper">
    <div class="email-container">

      <!-- Header -->
      <div class="header">
        ${LOGO_URL ? `<img src="${LOGO_URL}" alt="${APP_NAME}">` : `<h2 style="color:#ffffff;">${APP_NAME}</h2>`}
      </div>

      <!-- Body -->
      <div class="content">
        ${bodyContent}
      </div>

      <!-- Footer -->
      <div class="footer">
        ${LOGO_URL ? `<img src="${LOGO_URL}" alt="${APP_NAME}">` : ''}
        <div class="footer-links">
          <a href="#">Visit our website</a>
          <a href="#">Contact us</a>
          <a href="#">Terms &amp; Conditions</a>
        </div>
        <p>
          This is an automated email. Please do not reply directly.<br>
          ${APP_NAME} · ${SUPPORT_EMAIL}
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

/** Reusable OTP block */
function otpBlock(otp: string | number): string {
  return `
    <div class="otp-wrapper">
      <p class="otp-label">Your one-time code</p>
      <div class="otp">${otp}</div>
      <p class="otp-expiry">This code expires in 10 minutes. Do not share it with anyone.</p>
    </div>`;
}

/** Reusable detail card — pass an array of { label, value } rows */
function detailCard(rows: { label: string; value: string }[]): string {
  const rows_html = rows
    .map((r) => `<p><strong>${r.label}:</strong>&nbsp; ${r.value}</p>`)
    .join('');
  return `<div class="detail-card">${rows_html}</div>`;
}

/** Standard sign-off block */
function signOff(team = `The ${APP_NAME} Team`): string {
  return `<p class="signoff">Best regards,<br><strong>${team}</strong></p>`;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const verifyEmail = (otp: string | number) => ({
  SUBJECT: `${APP_NAME} – Verify Your Email`,
  HTML: layout(`
    <h1>Verify Your Email Address</h1>
    <p class="subtitle">
      Use the one-time code below to verify your email address<br>
      and continue the onboarding process.
    </p>
    ${otpBlock(otp)}
    <hr class="divider">
    ${signOff()}
  `),
});

export const forgotPassword = (name: string, otp: string) => ({
  SUBJECT: `${APP_NAME} – Password Reset Request`,
  HTML: layout(`
    <h1>Password Reset</h1>
    <p class="subtitle">
      Dear ${name},<br><br>
      We received a request to reset the password for your account.<br>
      Use the code below to proceed. If you didn't request this, you can safely ignore this email.
    </p>
    ${otpBlock(otp)}
    <hr class="divider">
    ${signOff()}
  `),
});

export const userCreated = (user: any, password: any) => ({
  SUBJECT: `${APP_NAME} – Welcome Onboard`,
  HTML: layout(`
    <h1>Welcome, ${user.first_name}!</h1>
    <p class="subtitle">
      Dear ${user.first_name} ${user.last_name},<br><br>
      Your account has been created by an administrator.<br>
      Use the credentials below to log in for the first time.
    </p>
    <div class="credential-card">
      <p><strong>Email:</strong>&nbsp; <span class="value">${user.email}</span></p>
      <p><strong>Password:</strong>&nbsp; <span class="value">${password}</span></p>
    </div>
    <p class="subtitle" style="margin-bottom:24px;">
      We recommend changing your password after your first login.
    </p>
    <hr class="divider">
    ${signOff()}
  `),
});

export const userCreatedPasswordReset = (user: any, password: any) => ({
  SUBJECT: `${APP_NAME} – New Password Generated`,
  HTML: layout(`
    <h1>New Password Generated</h1>
    <p class="subtitle">
      Dear ${user.first_name} ${user.last_name},<br><br>
      Your account password has been reset by an administrator.<br>
      Use the credentials below to log back in.
    </p>
    <div class="credential-card">
      <p><strong>Email:</strong>&nbsp; <span class="value">${user.email}</span></p>
      <p><strong>Password:</strong>&nbsp; <span class="value">${password}</span></p>
    </div>
    <p class="subtitle" style="margin-bottom:24px;">
      Please update your password after logging in for security purposes.
    </p>
    <hr class="divider">
    ${signOff()}
  `),
});

export const announcementEmail = (
  announcementTitle: string,
  announcementMessage: string,
  announcementDate: string,
) => ({
  SUBJECT: `Announcement: ${announcementTitle}`,
  HTML: layout(`
    <h1>New Announcement</h1>
    <p class="subtitle">
      We have an update to share with you!
    </p>
    ${detailCard([
      { label: 'Title', value: announcementTitle },
      { label: 'Message', value: announcementMessage },
      { label: 'Date', value: announcementDate },
    ])}
    <p class="subtitle" style="margin-bottom:24px;">
      Thank you for being a valued member of our community.
    </p>
    <hr class="divider">
    ${signOff()}
  `),
});
