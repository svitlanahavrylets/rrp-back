/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Autorizace a chráněné trasy pro administrátora
 */

import express from 'express';
import dotenv from 'dotenv';
import {
  login,
  refreshToken,
  getProtectedData,
} from '../controllers/adminController.js';

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Přihlášení administrátora
 *     description: Ověří heslo a vrátí access token. Refresh token je nastaven v HttpOnly cookie `refreshToken`.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Úspěšné přihlášení. Vrací access token a nastaví refresh token v cookie.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: >
 *               HttpOnly cookie `refreshToken`; atributy: `HttpOnly; Secure; SameSite=None`.
 *       400:
 *         description: Zadejte heslo
 *       401:
 *         description: Neplatné heslo
 */
router.post('/login', login);

/**
 * @swagger
 * /api/admin/refresh:
 *   post:
 *     summary: Obnovit access token pomocí refresh tokenu z cookie
 *     description: Očekává refresh token v HttpOnly cookie `refreshToken`.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Nový access token byl vydán
 *       401:
 *         description: Chybí obnovovací token
 *       403:
 *         description: Neplatný nebo vypršený obnovovací token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/admin/protected:
 *   get:
 *     summary: Chráněná trasa pro ověření access tokenu
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Přístup povolen
 *       401:
 *         description: Chybí nebo je neplatný access token
 */
router.get('/protected', getProtectedData);

export default router;
