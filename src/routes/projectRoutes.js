import express from 'express';
import Project from '../models/projectModel.js';
import {
  uploadProjectImage,
  handleProjectPhotoInput,
  deleteProjectImage,
} from '../middleware/uploadProject.js';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projekty
 *   description: API pro správu projektů (veřejné čtení, správa pouze pro administrátory)
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Získat všechny projekty (veřejné)
 *     tags: [Projekty]
 *     responses:
 *       200:
 *         description: Seznam projektů
 *       500:
 *         description: Chyba při načítání projektů
 */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('❌ Chyba při načítání projektů:', error);
    res.status(500).json({ message: 'Nepodařilo se načíst projekty' });
  }
});

// 🛡 Chráněné trasy níže
router.use(verifyAdminToken);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Přidat nový projekt
 *     description: >
 *       Přijímá **multipart/form-data**.
 *       Obrázek je volitelný: lze poslat soubor v poli `image` nebo URL v poli `imageUrl`.
 *       Middleware `handleProjectPhotoInput` při nahrání souboru doplní `cloudinaryUrl` a může nastavit `cloudinaryPublicId`.
 *     tags: [Projekty]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Volitelný obrázek projektu (alternativa k `imageUrl`)
 *               imageUrl:
 *                 type: string
 *                 description: Volitelná URL obrázku (alternativa k nahrání souboru)
 *               cloudinaryPublicId:
 *                 type: string
 *                 description: Interní ID souboru ve Cloudinary (pokud nahráváte soubor)
 *             required:
 *               - title
 *               - category
 *               - description
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Projekt byl úspěšně přidán
 *       400:
 *         description: Chyba ve vstupních datech
 *       500:
 *         description: Vnitřní chyba serveru
 */
router.post(
  '/',
  uploadProjectImage.single('image'),
  handleProjectPhotoInput,
  async (req, res) => {
    const { title, category, description, imageUrl } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    try {
      const newProject = new Project({
        title,
        category,
        description,
        imageUrl: req.photoSource === 'url' ? imageUrl : req.body.cloudinaryUrl,
        cloudinaryPublicId:
          req.photoSource === 'file' ? req.body.cloudinaryPublicId : undefined,
      });

      await newProject.save();
      res
        .status(201)
        .json({ message: 'Projekt byl úspěšně přidán!', project: newProject });
    } catch (error) {
      console.error('❌ Chyba při vytváření projektu:', error);
      res.status(500).json({ message: 'Něco se pokazilo!' });
    }
  },
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Aktualizovat existující projekt
 *     tags: [Projekty]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID projektu
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Volitelný nový obrázek (alternativa k `imageUrl`)
 *               imageUrl:
 *                 type: string
 *                 description: Volitelná URL obrázku (alternativa k nahrání souboru)
 *               cloudinaryPublicId:
 *                 type: string
 *                 description: Nové interní ID ve Cloudinary (pokud nahrazujete soubor)
 *             required:
 *               - title
 *               - category
 *               - description
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projekt byl aktualizován
 *       400:
 *         description: Neplatná data (např. chybí title/category/description)
 *       404:
 *         description: Projekt nebyl nalezen
 *       500:
 *         description: Chyba při aktualizaci
 */
router.put(
  '/:id',
  uploadProjectImage.single('image'),
  handleProjectPhotoInput,
  async (req, res) => {
    const { id } = req.params;
    const { title, category, description, imageUrl, cloudinaryPublicId } =
      req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    try {
      const existingProject = await Project.findById(id);
      if (!existingProject)
        return res.status(404).json({ message: 'Projekt nebyl nalezen' });

      const updatedData = { title, category, description };

      if (req.photoSource === 'url') {
        updatedData.imageUrl = imageUrl;
        updatedData.cloudinaryPublicId = undefined;
      } else if (req.photoSource === 'file') {
        if (existingProject.cloudinaryPublicId) {
          await deleteProjectImage(existingProject.cloudinaryPublicId);
        }
        updatedData.imageUrl = req.body.cloudinaryUrl;
        updatedData.cloudinaryPublicId = cloudinaryPublicId;
      }

      const updated = await Project.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        message: 'Projekt byl úspěšně aktualizován!',
        project: updated,
      });
    } catch (error) {
      console.error('❌ Chyba při aktualizaci projektu:', error);
      res.status(500).json({ message: 'Nepodařilo se aktualizovat projekt' });
    }
  },
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Odstranit projekt
 *     tags: [Projekty]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID projektu
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projekt byl odstraněn
 *       404:
 *         description: Projekt nebyl nalezen
 *       500:
 *         description: Chyba při odstraňování
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: 'Projekt nebyl nalezen' });

    if (deleted.cloudinaryPublicId) {
      await deleteProjectImage(deleted.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Projekt byl úspěšně odstraněn' });
  } catch (error) {
    console.error('❌ Chyba při odstraňování projektu:', error);
    res.status(500).json({ message: 'Projekt se nepodařilo odstranit' });
  }
});

export default router;
