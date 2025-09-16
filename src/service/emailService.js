import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const required = ['EMAIL_USER', 'EMAIL_PASS', 'OWNER_EMAIL'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing ENV:', missing.join(', '));
  process.exit(1);
}

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.seznam.cz';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === 'true'
  : SMTP_PORT === 465;

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const asset = (p) => path.resolve(__dirname, '..', 'assets', p);

transporter.verify((err, ok) => {
  if (err) {
    console.error('❌ SMTP verify failed:', err.message);
  } else {
    console.log('✅ SMTP ready (Seznam.cz)');
  }
});

const withTimeout = (promise, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('⏰ SMTP timeout')), ms),
    ),
  ]);

export const sendEmails = async (
  clientEmail,
  clientName,
  clientPhone,
  clientMessage,
) => {
  if (!clientEmail || !clientName || !clientPhone || !clientMessage) {
    throw new Error('❌ Všechna pole jsou povinná pro odeslání e-mailu!');
  }

  const FROM = `"RRP s.r.o." <${process.env.EMAIL_USER}>`;

  const logoPath = asset('logo.png.png');
  const attachments = fs.existsSync(logoPath)
    ? [{ filename: 'logo.png', path: logoPath, cid: 'logo' }]
    : [];

  const clientMail = {
    from: FROM,
    to: clientEmail,
    subject: '✅ Váš požadavek byl úspěšně přijat',
    text: `Dobrý den, ${clientName}! Děkujeme za vaši žádost. Brzy se vám ozveme.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;text-align:center">
        ${
          attachments.length
            ? `<img src="cid:logo" alt="Logo" style="width:260px;margin-bottom:16px" />`
            : ''
        }
        <h2>Dobrý den, ${clientName}!</h2>
        <p>Děkujeme za vaši žádost. Vaši zprávu jsme obdrželi a brzy se s vámi spojíme.</p>
        <p><strong>RRP s.r.o.</strong></p>
      </div>
    `,
    attachments,
  };

  const ownerMail = {
    from: FROM,
    to: process.env.OWNER_EMAIL,
    subject: 'Nová žádost od klienta',
    text: `📩 Nová žádost

Jméno:   ${clientName}
E-mail:  ${clientEmail}
Telefon: ${clientPhone}

Zpráva:
${clientMessage}

Odesláno: ${new Date().toLocaleString()}
`,
  };

  try {
    const results = await Promise.allSettled([
      withTimeout(transporter.sendMail(clientMail)),
      withTimeout(transporter.sendMail(ownerMail)),
    ]);

    const [cRes, oRes] = results;

    if (cRes.status === 'rejected') {
      console.error('❌ E-mail klientovi selhal:', cRes.reason?.message);
    } else {
      console.log('✅ E-mail klientovi odeslán');
    }

    if (oRes.status === 'rejected') {
      console.error('❌ E-mail majiteli selhal:', oRes.reason?.message);
    } else {
      console.log('✅ E-mail majiteli odeslán');
    }

    return oRes.status === 'fulfilled';
  } catch (err) {
    console.error('❌ Chyba při odesílání e-mailu:', err.message);
    return false;
  }
};
