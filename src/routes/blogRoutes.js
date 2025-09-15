/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: API pro správu blogových příspěvků
 */

import express from 'express';
import BlogPost from '../models/blogModel.js';
import {
  uploadBlogImage,
  handleBlogImage,
  deleteBlogImage,
} from '../middleware/uploadBlog.js';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';

const router = express.Router();

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Získat všechny příspěvky (se stránkováním)
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Číslo stránky (výchozí 1)
 *     responses:
 *       200:
 *         description: Seznam příspěvků
 *       500:
 *         description: Chyba serveru
 */
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await BlogPost.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Nepodařilo se načíst příspěvky' });
  }
});

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Získat jeden příspěvek podle ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID příspěvku
 *     responses:
 *       200:
 *         description: Příspěvek úspěšně načten
 *       404:
 *         description: Příspěvek nebyl nalezen
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: 'Příspěvek nebyl nalezen' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Nepodařilo se načíst příspěvek' });
  }
});

router.use(verifyAdminToken);

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Vytvořit nový příspěvek
 *     description: >
 *       Přijímá **multipart/form-data** s polem `image` (nahrání souboru), nebo hodnotu `imageUrl`.
 *       V interní logice je vyžadováno `imageUrl` (nastaví ho middleware při nahrání souboru).
 *     tags: [Blog]
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
 *               date:
 *                 type: string
 *                 description: Datum publikace (string)
 *               description:
 *                 type: string
 *               youtubeLink:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Obrázek příspěvku (volitelné, pokud posíláte `imageUrl`)
 *               imageUrl:
 *                 type: string
 *                 description: URL obrázku (bude nastaveno middlewarem při nahrání)
 *               cloudinaryPublicId:
 *                 type: string
 *                 description: Interní ID souboru (pokud se používá Cloudinary)
 *             required:
 *               - title
 *               - category
 *               - date
 *               - description
 *             oneOf:
 *               - required: [image]
 *               - required: [imageUrl]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Příspěvek byl vytvořen
 *       400:
 *         description: Neplatná data
 *       500:
 *         description: Chyba serveru
 */
router.post(
  '/',
  uploadBlogImage.single('image'),
  handleBlogImage,
  async (req, res) => {
    const {
      title,
      category,
      date,
      description,
      youtubeLink,
      imageUrl,
      cloudinaryPublicId,
    } = req.body;

    if (!title || !category || !date || !description || !imageUrl) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    try {
      const newPost = new BlogPost({
        title,
        category,
        date,
        description,
        youtubeLink,
        imageUrl,
        cloudinaryPublicId,
      });

      await newPost.save();
      res.status(201).json({
        message: 'Příspěvek byl úspěšně vytvořen!',
        post: newPost,
      });
    } catch (error) {
      res.status(500).json({ message: 'Nepodařilo se vytvořit příspěvek' });
    }
  },
);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Aktualizovat příspěvek
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID příspěvku
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
 *               date:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubeLink:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nový obrázek (volitelné)
 *               imageUrl:
 *                 type: string
 *                 description: Pokud neposíláte soubor, můžete dodat URL
 *               cloudinaryPublicId:
 *                 type: string
 *                 description: Interní ID aktuálního obrázku (přepíše se novým)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Příspěvek byl aktualizován
 *       404:
 *         description: Příspěvek nebyl nalezen
 *       500:
 *         description: Chyba serveru
 */
router.put(
  '/:id',
  uploadBlogImage.single('image'),
  handleBlogImage,
  async (req, res) => {
    try {
      const post = await BlogPost.findById(req.params.id);
      if (!post)
        return res.status(404).json({ message: 'Příspěvek nebyl nalezen' });

      if (post.cloudinaryPublicId) {
        await deleteBlogImage(post.cloudinaryPublicId);
      }

      const updatedData = {
        ...req.body,
        imageUrl: req.body.imageUrl,
        cloudinaryPublicId: req.body.cloudinaryPublicId,
      };

      const updated = await BlogPost.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
          runValidators: true,
        },
      );

      res
        .status(200)
        .json({ message: 'Příspěvek byl aktualizován!', post: updated });
    } catch (error) {
      res.status(500).json({ message: 'Nepodařilo se aktualizovat příspěvek' });
    }
  },
);

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Odstranit příspěvek
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID příspěvku
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Příspěvek byl odstraněn
 *       404:
 *         description: Příspěvek nebyl nalezen
 *       500:
 *         description: Chyba serveru
 */
router.delete('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Příspěvek nenalezen' });

    if (post.cloudinaryPublicId) {
      await deleteBlogImage(post.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Příspěvek byl odstraněn' });
  } catch (error) {
    res.status(500).json({ message: 'Nepodařilo se odstranit příspěvek' });
  }
});

export default router;
