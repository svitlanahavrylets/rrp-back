import { Router } from 'express';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';
import {
  uploadServiceImage,
  handleServiceImage,
} from '../middleware/uploadService.js';
import * as serviceController from '../controllers/services.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middleware/validateBody.js';
import { serviceAddSchema } from '../validation/service.js';
import { isValidId } from '../middleware/isValidId.js';

const servicesRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Služby
 *   description: API pro správu služeb (veřejné čtení, správa pouze pro administrátory)
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Získat všechny služby
 *     tags: [Služby]
 *     responses:
 *       200:
 *         description: Úspěšně načten seznam služeb
 *       500:
 *         description: Vnitřní chyba serveru
 */
servicesRouter.get('/', ctrlWrapper(serviceController.getServicesController));

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Získat detail služby podle ID
 *     tags: [Služby]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID služby
 *     responses:
 *       200:
 *         description: Úspěšně načtena služba
 *       404:
 *         description: Služba nebyla nalezena
 *       500:
 *         description: Vnitřní chyba serveru
 */
servicesRouter.get(
  '/:id',
  isValidId,
  ctrlWrapper(serviceController.getServiceByIdController),
);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Vytvořit novou službu
 *     description: >
 *       Přijímá **multipart/form-data**. Obrázek lze poslat jako soubor v poli `image`.
 *       Middleware `handleServiceImage` uloží obrázek a nastaví `imageUrl` a volitelně `cloudinaryPublicId`.
 *     tags: [Služby]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Povinný obrázek služby
 *               imageUrl:
 *                 type: string
 *                 description: URL obrázku (nastaví middleware)
 *               cloudinaryPublicId:
 *                 type: string
 *                 description: Interní ID obrázku ve Cloudinary
 *             required:
 *               - title
 *               - text
 *               - description
 *               - image
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Služba byla úspěšně vytvořena
 *       400:
 *         description: Neplatná data
 *       500:
 *         description: Vnitřní chyba serveru
 */
servicesRouter.post(
  '/',
  verifyAdminToken,
  uploadServiceImage.single('image'),
  handleServiceImage,
  validateBody(serviceAddSchema),
  ctrlWrapper(serviceController.createServiceController),
);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Aktualizovat službu
 *     description: >
 *       Přijímá **multipart/form-data**. Obrázek je povinný při vytvoření,
 *       při aktualizaci může být nahrazen novým souborem.
 *     tags: [Služby]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID služby
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nový obrázek služby (volitelně)
 *               imageUrl:
 *                 type: string
 *                 description: URL obrázku (nastaví middleware)
 *               cloudinaryPublicId:
 *                 type: string
 *                 description: Nové interní ID ve Cloudinary
 *             required:
 *               - title
 *               - text
 *               - description
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Služba byla aktualizována
 *       400:
 *         description: Neplatná data
 *       404:
 *         description: Služba nebyla nalezena
 *       500:
 *         description: Vnitřní chyba serveru
 */
servicesRouter.put(
  '/:id',
  isValidId,
  verifyAdminToken,
  uploadServiceImage.single('image'),
  handleServiceImage,
  validateBody(serviceAddSchema),
  ctrlWrapper(serviceController.updateServiceController),
);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Odstranit službu
 *     tags: [Služby]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID služby
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Služba byla odstraněna
 *       404:
 *         description: Služba nebyla nalezena
 *       500:
 *         description: Vnitřní chyba serveru
 */
servicesRouter.delete(
  '/:id',
  isValidId,
  verifyAdminToken,
  ctrlWrapper(serviceController.deleteServiceController),
);

export default servicesRouter;
