## 📦 RRP Backend

Backend part of the **RRP project**  
Built with **Node.js + Express + MongoDB**, featuring **admin panel**, **API for content**, **email notifications**, and **Cloudinary integration**.

---

## 🚀 FEATURES

- REST API for frontend (React / Vite)
- MongoDB with Mongoose
- CRUD for:
  - 🔹 About
  - 🔹 Services
  - 🔹 Projects
  - 🔹 Blog
  - 🔹 Careers
  - 🔹 Team
- 📩 Email sending via **Seznam.cz SMTP (Nodemailer)**
- 📷 File uploads to **Cloudinary**
- 🔒 Admin authentication
- 📝 Swagger documentation (**token-protected in production**)
- 🛡 Middleware: validation, rate limiting, error handler, logging

---

## 🛠 TECH STACK

- **Node.js** v22
- **Express.js**
- **MongoDB + Mongoose**
- **Nodemailer**
- **Cloudinary**
- **Swagger UI**
- **dotenv**
- **cookie-parser**
- **express-rate-limit**

---

## 📂 PROJECT STRUCTURE

```plaintext
src/
├── assets/        # Logos and static files
├── config/        # Configs (db, cloudinary)
├── controllers/   # API logic
├── middleware/    # Middleware (upload, auth, error handler)
├── models/        # Mongoose schemas
├── routes/        # Express routes
├── service/       # Services (emailService, ...)
├── utils/         # Utilities (logger, ctrlWrapper)
├── validation/    # Joi / custom validation
├── server.js      # Entry point
└── swagger.js     # Swagger config
```

## ⚙️ INSTALLATION & RUN

1. Clone repository

```plaintext
git clone https://github.com/svitlanahavrylets/rrp-back.git
cd rrp-back
```

2. Install dependencies

```plaintext
npm install
```

3. Configure environment variables

Create a .env file in the root directory:

```plaintext
PORT=5000

NODE_ENV=development

MONGO_URL=mongodb+srv://...

ACCESS_SECRET=...

REFRESH_SECRET=...

ACCESS_EXPIRES=

REFRESH_EXPIRES=

ADMIN_PANEL_PASSWORD=...

CLOUDINARY_API_KEY=...

CLOUDINARY_API_SECRET=...

CLOUDINARY_CLOUD_NAME=...

EMAIL_USER=

EMAIL_PASS=...

OWNER_EMAIL=

SWAGGER_TOKEN=some-secret-token

SERVER_URL=https://rrp-back.onrender.com
```

⚠️ Never commit .env to GitHub!

4. Run in development mode

```plaintext
   npm run dev
```

5. Run in production

```plaintext
   npm start
```

## 📑 SWAGGER DOCS

Development (no token):
http://localhost:5000/api-docs

Production (requires token):
https://rrp-back.onrender.com/api-docs?token=YOUR_SECRET

## ☁️ DEPLOYMENT

Frontend: Vercel
Backend: Render
Database: MongoDB Atlas
File storage: Cloudinary

## 👩‍💻 AUTHOR

Svitlana Havrylets
