/**
 * @swagger
 * tags:
 *   name: O nás
 *   description: API pro správu sekce "O nás"
 */

import { Router } from 'express';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';
import {
  uploadAboutImage,
  handleAboutImage,
} from '../middleware/uploadAbout.js';
import * as aboutController from '../controllers/about.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middleware/validateBody.js';
import { aboutAddSchema } from '../validation/about.js';

const aboutRouter = Router();

/**
 * @swagger
 * /api/about:
 *   get:
 *     summary: Získat informace "O nás"
 *     tags: [O nás]
 *     responses:
 *       200:
 *         description: Úspěšně získána data
 *       404:
 *         description: Data nebyla nalezena
 */
aboutRouter.get('/', ctrlWrapper(aboutController.getAboutController));

/**
 * @swagger
 * /api/about:
 *   post:
 *     summary: Vytvořit nebo aktualizovat informace "O nás"
 *     tags: [O nás]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - imageUrl
 *             properties:
 *               text:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               youtubeLink:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Úspěšně vytvořeno nebo aktualizováno
 *       400:
 *         description: Neplatná data
 */
aboutRouter.post(
  '/',
  verifyAdminToken,
  uploadAboutImage.single('image'),
  handleAboutImage,
  validateBody(aboutAddSchema),
  ctrlWrapper(aboutController.createOrUpdateAboutController),
);

/**
 * @swagger
 * /api/about:
 *   delete:
 *     summary: Odstranit záznam "O nás"
 *     description: Odstraní aktuální záznam sekce "O nás".
 *     tags: [O nás]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Úspěšně odstraněno
 *       404:
 *         description: Záznam nebyl nalezen
 */
aboutRouter.delete(
  '/',
  verifyAdminToken,
  ctrlWrapper(aboutController.deleteAboutController),
);

export default aboutRouter;
