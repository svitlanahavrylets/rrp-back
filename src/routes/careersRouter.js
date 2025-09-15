/**
 * @swagger
 * tags:
 *   name: Kariéra
 *   description: API pro správu kariérních pozic
 */

import { Router } from 'express';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middleware/validateBody.js';
import { isValidId } from '../middleware/isValidId.js';
import * as careerController from '../controllers/careers.js';
import { careerAddSchema } from '../validation/careers.js';

const careerRouter = Router();

/**
 * @swagger
 * /api/careers:
 *   get:
 *     summary: Získat všechny kariérní pozice
 *     tags: [Kariéra]
 *     responses:
 *       200:
 *         description: Seznam kariérních pozic
 *       500:
 *         description: Chyba serveru
 */
careerRouter.get('/', ctrlWrapper(careerController.getCareersController));

/**
 * @swagger
 * /api/careers/{id}:
 *   get:
 *     summary: Získat detail kariérní pozice podle ID
 *     tags: [Kariéra]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pozice
 *     responses:
 *       200:
 *         description: Detail pozice
 *       404:
 *         description: Pozice nebyla nalezena
 *       500:
 *         description: Chyba serveru
 */
careerRouter.get(
  '/:id',
  isValidId,
  ctrlWrapper(careerController.getCareerByIdController),
);

/**
 * @swagger
 * /api/careers:
 *   post:
 *     summary: Vytvořit novou kariérní pozici
 *     tags: [Kariéra]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Frontend Developer
 *               text:
 *                 type: string
 *                 example: Popis hlavní náplně práce
 *               description:
 *                 type: string
 *                 example: Detailní informace o pozici a požadavcích
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Pozice byla vytvořena
 *       400:
 *         description: Neplatná data
 *       500:
 *         description: Chyba serveru
 */
careerRouter.post(
  '/',
  verifyAdminToken,
  validateBody(careerAddSchema),
  ctrlWrapper(careerController.createCareerController),
);

/**
 * @swagger
 * /api/careers/{id}:
 *   put:
 *     summary: Aktualizovat kariérní pozici
 *     tags: [Kariéra]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pozice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               description:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pozice byla aktualizována
 *       404:
 *         description: Pozice nebyla nalezena
 *       500:
 *         description: Chyba serveru
 */
careerRouter.put(
  '/:id',
  isValidId,
  verifyAdminToken,
  validateBody(careerAddSchema),
  ctrlWrapper(careerController.updateCareerController),
);

/**
 * @swagger
 * /api/careers/{id}:
 *   delete:
 *     summary: Odstranit kariérní pozici
 *     tags: [Kariéra]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID pozice
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pozice byla odstraněna
 *       404:
 *         description: Pozice nebyla nalezena
 *       500:
 *         description: Chyba serveru
 */
careerRouter.delete(
  '/:id',
  isValidId,
  verifyAdminToken,
  ctrlWrapper(careerController.deleteCareerController),
);

export default careerRouter;
