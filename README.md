# 🎨 TimeLess Emotions – Bezawit Nigat Portfolio & Art Shop

**A full-stack portfolio website and art e-commerce platform** for Bezawit Nigat — architect and visual artist based in Addis Ababa, Ethiopia.

Live site: [https://bezawit-nigat.vercel.app/](https://bezawit-nigat.vercel.app/)

---

## ✨ Features

- Fully responsive portfolio showcasing architecture projects, art galleries, and animated hero sections
- Client-side art shop with product browsing, cart, and seamless checkout experience
- Secure server-side payment initialization & verification with Chapa
- Product management (CRUD) using Supabase PostgreSQL
- Automatic marking of sold items + insertion of sold_items records
- Email confirmation after successful purchases
- Proper error handling, input validation, and secure environment variable usage
- Easy deployment on Vercel (serverless functions + static hosting)

---

## 🖼️ Screenshots

### Homepage Hero Section
![Beauty of Art - Landing Page](https://res.cloudinary.com/dvdmhurvt/image/upload/v1767337699/bezawit-nigat.vercel.app__f6wdpp.webp)


### Aboutpage Hero Section
![About Me - Landing Page](https://res.cloudinary.com/dvdmhurvt/image/upload/v1767337686/bezawit-nigat.vercel.app_about.html_tozlyz.webp)


### Archtectural works Hero Section
![Integrated Art & Architectnre - Landing Page](https://res.cloudinary.com/dvdmhurvt/image/upload/v1767337694/bezawit-nigat.vercel.app_arc.html_sukozb.webp)


### Art shop Page
![TimeLess Emotions - Landing Page](https://res.cloudinary.com/dvdmhurvt/image/upload/v1767337694/bezawit-nigat.vercel.app_artShop_index.html_evv3zn.webp)



> More screenshots available in the live site!

---

## 🛠️ Technologies & Stack

- **Frontend**: HTML5, CSS3 (with modern animations), Vanilla JavaScript
- **Backend**: Node.js (≥18), Express.js
- **API Architecture**: RESTful endpoints with JSON payloads
- **Database**: Supabase (PostgreSQL) – uses **indexing**, **joins**, and **Row Level Security (RLS)**
- **Payments**: Chapa API (server-side integration)
- **Validation & Security**: Joi or express-validator (input validation), custom error handling middleware
- **Environment Management**: dotenv for secure configuration
- **Other**: Vercel deployment config, serverless-friendly structure

---

## 📁 Project Structure

```text
public/                  # Static frontend files (served directly)
  index.html             # Main portfolio page
  artShop/               # Art shop pages + checkout flow
  assets/                # Images, fonts, etc.

api/                     # Backend Express application
  index.js               # Main server entry point
  chapaRoutes.js         # payment routes
  supabase.js            # DB helpers

.env.example             # Template for environment variables
package.json             # Dependencies & scripts
vercel.json              # Vercel deployment configuration
README.md
```

---

## ✅ Requirements

- Node.js 18+
- npm (or yarn/pnpm)
- Supabase project (PostgreSQL database with products & sold_items tables)
- Chapa merchant account + secret key

---

## 🧩 Local Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (from the example) and fill in the values:

```bash
cp .env.example .env
# then edit .env with your keys
```

4. Start the development server:

```bash
npm run dev
```

5. Open the site: http://localhost:5000

The server serves static files from `/public` and exposes API routes under `/api`.

🔐 Environment Variables (.env)

Create a `.env` file with the following values (do NOT commit):

```env
# Supabase (use service_role key – server only)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-key

# Chapa payment gateway
CHAPA_SECRET_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
PORT=5000
NODE_ENV=development
```

Security note: never commit `.env`. The `service_role` key grants full database access and must remain server-only.

---

▶️ Available Scripts

```bash
npm run dev    # Start development server (nodemon or similar)
npm start      # Production start
```


## 🔁 API endpoints (summary)

GET / — serves the main index.html
POST /api/chapa/proceedpayment — initialize Chapa payment (expects orderInfo in body)
POST /api/chapa/verify — verify Chapa payment (tx_ref in body); updates DB and sends email
POST /api/dbs/fetchProduct — returns product list from Supabase
POST /api/dbs/sellProduct — update product(s) to sold (internal use)
See api/ source for more details and request shapes.


## 🛍 Art shop & payment notes

The checkout flow uses Chapa; proceedPayment generates a tx_ref, and verify confirms the payment.
The server uses Supabase to mark products as sold and to insert sold_items records.
Use test credentials in staging and verify webhooks and email behavior before going to production.


## 🔄 Deployment

Static frontend: deploy to Vercel, Netlify, or similar.
Server/API: deploy to any Node host or Vercel Serverless (ensure env vars are set in the host).


## 🙋 Contributing & support

For bugs, create an issue and include reproduction steps.
For new features, open an issue to discuss before submitting a PR.
I can add CONTRIBUTING.md and SECURITY.md if you want them.


## ❤️ Credits

Developer(s):Firaol Feyisa (@firaflash), Dawit Zelalem (@Davebash
Artist: Bezawit Nigat


## 📜 License
## This project is distributed under the ISC license (see package.json). Contact the authors or the artist for commercial usage.
