import TestModel from '../models/testModel.js';
import { sendEmails } from '../service/emailService.js';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();

//  🛡 Ochrana: omezení 1 požadavek / minutu z jedné IP
const formLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuta
  max: 1, // 1 požadavek
  message: {
    message: '⏳ Příliš mnoho požadavků. Zkuste to znovu za minutu.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Formulář
 *   description: API pro odeslání kontaktního formuláře
 */

/**
 * @swagger
 * /api/test:
 *   post:
 *     summary: Odeslat kontaktní formulář
 *     tags: [Formulář]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ruslan Devman
 *               email:
 *                 type: string
 *                 example: ruslan@example.com
 *               phone:
 *                 type: string
 *                 example: +420123456789
 *               message:
 *                 type: string
 *                 example: Chci si objednat web!
 *     responses:
 *       201:
 *         description: Data byla uložena, e-mail bude odeslán
 *       400:
 *         description: Neplatná nebo chybějící pole
 *       429:
 *         description: Příliš mnoho požadavků (rate limit)
 *       500:
 *         description: Vnitřní chyba serveru
 */
router.post('/', formLimiter, async (req, res) => {
  console.log('📨 Přijatá data z formuláře:', req.body);

  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      message: 'Jméno, e-mail, telefon a zpráva jsou povinné!',
    });
  }

  const nameRegex =
    /^[A-Za-zА-Яа-яЁёІіЇїЄєČčĎďĚěŇňŘřŠšŤťŮůŽžÁáÉéÍíÓóÚúÝý' -]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ message: 'Neplatný formát jména!' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Neplatný formát e-mailu!' });
  }

  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ message: 'Neplatný formát telefonního čísla!' });
  }

  try {
    const newTestData = new TestModel({ name, email, phone, message });
    console.log('💾 Ukládám data do databáze:', newTestData);
    await newTestData.save();
    console.log('✅ Data byla úspěšně uložena.');

    console.log('📨 Volám sendEmails...');
    sendEmails(email, name, phone, message)
      .then(() => {
        console.log(`📨 E-mail úspěšně odeslán pro ${email}`);
      })
      .catch((err) => {
        console.error(`❌ Odeslání e-mailu selhalo pro ${email}:`, err.message);
      });

    res.status(201).json({
      message: 'Data byla úspěšně uložena! E-mail bude brzy odeslán.',
      status: 201,
    });
  } catch (err) {
    console.error('❌ Chyba při ukládání dat:', err);
    res.status(500).json({ message: 'Něco se pokazilo!' });
  }
});

export default router;
