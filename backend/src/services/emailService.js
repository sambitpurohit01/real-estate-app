const nodemailer = require('nodemailer');

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

function enabled() {
  return String(process.env.MAIL_ENABLED).toLowerCase() === 'true';
}

async function send(to, subject, html) {
  if (!enabled()) {
    console.log(`[email:skipped] MAIL_ENABLED=false — would have sent "${subject}" to ${to}`);
    return;
  }
  await getTransporter().sendMail({ from: process.env.MAIL_FROM, to, subject, html });
}

async function sendWelcomeEmail(user) {
  await send(
    user.email,
    'Welcome to Keystone',
    `<p>Hi ${user.fullName},</p><p>Welcome to Keystone — your account is ready to go.</p>`
  );
}

async function sendInquiryAlert(owner, property, inquiry) {
  if (!owner || !owner.email) return;
  await send(
    owner.email,
    `New message about "${property.title}"`,
    `<p>${inquiry.senderName} (${inquiry.senderEmail}) sent a message about your listing "${property.title}":</p>
     <blockquote>${inquiry.message}</blockquote>
     <p>Reply directly to their email to get in touch.</p>`
  );
}

module.exports = { sendWelcomeEmail, sendInquiryAlert };
