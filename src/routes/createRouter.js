import express from 'express';
import TeamMember from '../models/teamMemberModel.js';
import {
  upload,
  handlePhotoInput,
  deleteCloudinaryImage,
} from '../middleware/upload.js';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tým
 *   description: API pro správu členů týmu (veřejné čtení, správa pouze pro administrátory)
 */

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Získat všechny členy týmu (veřejné)
 *     tags: [Tým]
 *     responses:
 *       200:
 *         description: Úspěšné načtení seznamu členů
 *       500:
 *         description: Vnitřní chyba serveru
 */
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('❌ Chyba při načítání členů týmu:', error);
    res.status(500).json({ message: 'Nepodařilo se načíst data' });
  }
});

// 🛡 Chráněné trasy – pouze pro administrátory
router.use(verifyAdminToken);

/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Přidat nového člena týmu
 *     description: >
 *       Přijímá **multipart/form-data**. Fotka může být nahrána jako soubor v poli `image`,
 *       nebo lze poslat odkaz v poli `photoUrl`. Middleware `handlePhotoInput` při nahrání souboru
 *       nastaví `cloudinaryUrl` a může doplnit `cloudinaryPublicId`.
 *     tags: [Tým]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Jméno a příjmení
 *               position:
 *                 type: string
 *                 description: Pozice v týmu
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fotka člena (alternativa k `photoUrl`)
 *               photoUrl:
 *                 type: string
 *                 description: URL fotky (alternativa k nahrání souboru)
 *               cloudinaryPublicId:
 *                 type: string
 *                 description: Interní ID souboru ve Cloudinary (využívá se při nahrání souboru)
 *               facebook:
 *                 type: string
 *               instagram:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *             required:
 *               - name
 *               - position
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Člen byl úspěšně přidán
 *       400:
 *         description: Chyba ve vstupních datech
 *       500:
 *         description: Vnitřní chyba serveru
 */
router.post('/', upload.single('image'), handlePhotoInput, async (req, res) => {
  const {
    name,
    position,
    photoUrl,
    cloudinaryPublicId,
    facebook,
    instagram,
    linkedin,
    whatsapp,
  } = req.body;

  if (!name || !position) {
    return res.status(400).json({ message: 'Všechna pole jsou povinná' });
  }

  try {
    const newMember = new TeamMember({
      name,
      position,
      photoUrl: req.photoSource === 'url' ? photoUrl : req.body.cloudinaryUrl,
      cloudinaryPublicId:
        req.photoSource === 'file' ? cloudinaryPublicId : undefined,
      socialLinks: {
        facebook: facebook || '',
        instagram: instagram || '',
        linkedin: linkedin || '',
        whatsapp: whatsapp || '',
      },
    });

    await newMember.save();
    res
      .status(201)
      .json({ message: 'Člen byl úspěšně přidán!', member: newMember });
  } catch (error) {
    console.error('❌ Chyba při vytváření člena týmu:', error);
    res.status(500).json({ message: 'Něco se pokazilo!' });
  }
});

/**
 * @swagger
 * /api/team/{id}:
 *   put:
 *     summary: Aktualizovat údaje člena týmu
 *     tags: [Tým]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID člena
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               photoUrl:
 *                 type: string
 *               cloudinaryPublicId:
 *                 type: string
 *               facebook:
 *                 type: string
 *               instagram:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Údaje byly úspěšně aktualizovány
 *       400:
 *         description: Neplatná data (např. chybí povinné pole name/position)
 *       404:
 *         description: Člen týmu nebyl nalezen
 *       500:
 *         description: Chyba při aktualizaci
 */
router.put(
  '/:id',
  upload.single('image'),
  handlePhotoInput,
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      position,
      photoUrl,
      cloudinaryPublicId,
      facebook,
      instagram,
      linkedin,
      whatsapp,
    } = req.body;

    if (!name || !position) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    try {
      const existingMember = await TeamMember.findById(id);
      if (!existingMember) {
        return res.status(404).json({ message: 'Člen týmu nebyl nalezen' });
      }

      const updatedData = {
        name,
        position,
        socialLinks: {
          facebook: facebook || existingMember.socialLinks?.facebook || '',
          instagram: instagram || existingMember.socialLinks?.instagram || '',
          linkedin: linkedin || existingMember.socialLinks?.linkedin || '',
          whatsapp: whatsapp || existingMember.socialLinks?.whatsapp || '',
        },
      };

      if (req.photoSource === 'url') {
        updatedData.photoUrl = photoUrl;
        updatedData.cloudinaryPublicId = undefined;
      } else if (req.photoSource === 'file') {
        if (existingMember.cloudinaryPublicId) {
          await deleteCloudinaryImage(existingMember.cloudinaryPublicId);
        }
        updatedData.photoUrl = req.body.cloudinaryUrl;
        updatedData.cloudinaryPublicId = cloudinaryPublicId;
      }

      const updatedMember = await TeamMember.findByIdAndUpdate(
        id,
        updatedData,
        {
          new: true,
          runValidators: true,
        },
      );

      res.status(200).json({
        message: 'Člen týmu byl úspěšně aktualizován!',
        member: updatedMember,
      });
    } catch (error) {
      console.error('❌ Chyba při aktualizaci člena týmu:', error);
      res.status(500).json({ message: 'Nepodařilo se aktualizovat údaje' });
    }
  },
);

/**
 * @swagger
 * /api/team/{id}:
 *   delete:
 *     summary: Odstranit člena týmu
 *     tags: [Tým]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID člena
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Člen byl odstraněn
 *       404:
 *         description: Člen nebyl nalezen
 *       500:
 *         description: Vnitřní chyba serveru
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await TeamMember.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Člen nebyl nalezen' });
    }

    if (deleted.cloudinaryPublicId) {
      await deleteCloudinaryImage(deleted.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Člen byl úspěšně odstraněn' });
  } catch (error) {
    console.error('❌ Chyba při odstraňování člena týmu:', error);
    res.status(500).json({ message: 'Nepodařilo se odstranit záznam' });
  }
});

export default router;
