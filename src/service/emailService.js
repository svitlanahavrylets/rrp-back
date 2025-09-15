import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Environment variables check
if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.OWNER_EMAIL
) {
  console.error('❌ Chyba: chybí potřebné proměnné prostředí!');
  process.exit(1);
}

console.log('🔗 Připojuji se k SMTP...');

// SMTP transporter — uses your WEDOS mailbox
const transporter = nodemailer.createTransport({
  host: 'wes1-smtp.wedos.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Timeout wrapper
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('⏰ Odesílání e-mailu trvalo příliš dlouho!')),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
};

// Main function
export const sendEmails = async (
  clientEmail,
  clientName,
  clientPhone,
  clientMessage,
) => {
  try {
    if (!clientEmail || !clientName || !clientPhone || !clientMessage) {
      throw new Error('❌ Všechna pole jsou povinná pro odeslání e-mailu!');
    }

    const clientMailOptions = {
      from: `"RRP s.r.o." <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: '✅ Váš požadavek byl úspěšně přijat.',
      text: `Dobrý den, ${clientName}! Děkujeme za vaši žádost. Vaši zprávu jsme obdrželi a brzy se vám ozveme.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;">
          <img src="cid:logo" alt="Logo" style="width: 300px; margin-bottom: 24px;" />
          <h2>Dobrý den, ${clientName}!</h2>
          <p>Děkujeme za vaši žádost! Vaši zprávu jsme obdrželi a brzy se s vámi spojíme.</p>
          <p>Pokud máte jakékoli další dotazy, neváhejte odpovědět na tento e-mail.</p>
          <p><strong>Jednatel RRP s.r.o.</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          // NOTE: path left as-is to avoid logic changes
          path: path.resolve('src/assets/logo.png.png'),
          cid: 'logo',
        },
      ],
    };

    const ownerMailOptions = {
      from: `"RRP s.r.o." <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: 'Nová žádost od klienta.',
      text: `
📩 Nová žádost od klienta!

🔹 Jméno: ${clientName}
📧 E-mail: ${clientEmail}
📞 Telefon: ${clientPhone}
📝 Zpráva:
${clientMessage}

📅 Datum odeslání: ${new Date().toLocaleString()}
      `,
    };

    // Send with timeout
    console.log('📬 Připravuji e-mail pro klienta:', clientMailOptions);
    console.log('📬 Připravuji e-mail pro majitele:', ownerMailOptions);

    await Promise.all([
      withTimeout(transporter.sendMail(clientMailOptions), 7000),
      withTimeout(transporter.sendMail(ownerMailOptions), 7000),
    ]);

    console.log('✅ E-mail klientovi odeslán.');
    console.log('✅ E-mail majiteli odeslán.');
    console.log(
      `✅ E-maily odeslány na ${clientEmail} a ${process.env.OWNER_EMAIL}`,
    );

    return true;
  } catch (error) {
    console.error('❌ Chyba při odesílání e-mailu:', error.message);
    if (error.response) console.error('📩 SMTP odpověď:', error.response);
    return false;
  }
};
