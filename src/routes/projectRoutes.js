/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Přidat nový projekt
 *     description: >
 *       Přijímá **multipart/form-data**. Obrázek je **volitelný**:
 *       lze poslat soubor v poli `image` **nebo** URL v poli `imageUrl`.
 *       Middleware `handleProjectPhotoInput` při nahrání souboru doplní `cloudinaryUrl`
 *       a může nastavit `cloudinaryPublicId`.
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
 *                 description: Volitelné interní ID souboru ve Cloudinary
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

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Aktualizovat existující projekt
 *     description: >
 *       Přijímá **multipart/form-data**. Obrázek je **volitelný**:
 *       lze nahrát nový soubor přes `image` nebo poslat `imageUrl`.
 *       Pokud nahráváte nový soubor a existuje starý, bude odstraněn.
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
 *                 description: Volitelné nové interní ID ve Cloudinary (pokud nahrazujete soubor)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projekt byl aktualizován
 *       404:
 *         description: Projekt nebyl nalezen
 *       500:
 *         description: Chyba při aktualizaci
 */
